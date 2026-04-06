import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!CASHFREE_SECRET_KEY || !signature) return false;
  const expectedSig = createHmac('sha256', CASHFREE_SECRET_KEY).update(body).digest('base64');
  return expectedSig === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-cashfree-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.parse(rawBody);
    const { data } = payload;
    const orderId = data?.order?.order_id;
    const paymentId = data?.payment?.cf_payment_id?.toString();
    const paymentStatus = data?.payment?.payment_status;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update payment status
    const status = paymentStatus === 'SUCCESS' ? 'PAID' : paymentStatus || 'FAILED';
    await supabase
      .from('payments')
      .update({ payment_id: paymentId, status, updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    // If payment successful, store lead
    if (status === 'PAID') {
      const { data: paymentData } = await supabase
        .from('payments')
        .select('lead_email, selected_plan')
        .eq('order_id', orderId)
        .single();

      if (paymentData?.lead_email) {
        console.log(`Payment successful for ${paymentData.lead_email} - Plan: ${paymentData.selected_plan}`);
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
