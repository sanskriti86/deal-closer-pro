import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 EMAIL/PASSWORD LOGIN + SIGNUP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (mode === "signup" && phone.length < 10) {
      toast({
        title: "Invalid phone",
        description: "Enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Check your email to verify your account",
        });

        setMode("login");

        // reset fields
        setEmail("");
        setPassword("");
        setName("");
        setPhone("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
        });

        onClose();

        // reset fields
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      toast({
        title: "Auth error",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Required for Radix */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === "login" ? "Login" : "Signup"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* HEADER */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 pt-10 pb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === "login"
                ? "Sign in to continue"
                : "Start closing deals today"}
            </p>
          </div>

          {/* FORM */}
          <div className="bg-white px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg bg-white text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg bg-white text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </>
              )}

              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg bg-white text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              {/* PASSWORD FIELD WITH TOGGLE */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg bg-white text-black placeholder:text-gray-400 caret-black pr-10 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 py-2.5 rounded-lg font-bold"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            {/* SWITCH */}
            <p className="text-center text-sm mt-6">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() =>
                  setMode(mode === "login" ? "signup" : "login")
                }
                className="text-amber-600 font-semibold"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;