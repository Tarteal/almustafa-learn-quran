import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  password: z.string().min(8, "At least 8 characters").max(72),
});
const signInSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const initialMode = (params.get("mode") as "signin" | "signup") || "signup";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (!loading && user) navigate(redirect, { replace: true });
  }, [user, loading, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirect}`,
            data: { full_name: parsed.data.full_name, phone: parsed.data.phone || "" },
          },
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Account created! Welcome.");
      } else {
        const parsed = signInSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Welcome back!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}${redirect}`,
      });
      if (result.error) { toast.error((result.error as any).message || "Google sign-in failed"); return; }
      if (result.redirected) return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-24 bg-background pattern-overlay">
      <SEO title={mode === "signup" ? "Create Account · Almustafa Quran Academy" : "Sign In · Almustafa Quran Academy"} description="Sign in or create your student account to enroll in Quran courses." />
      <div className="w-full max-w-md bg-card border-2 border-border rounded-2xl shadow-elegant p-8 ring-1 ring-foreground/5">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full gradient-emerald grid place-items-center shadow-elegant mb-3">
            <span className="font-arabic text-gold text-xl">ﷲ</span>
          </div>
          <h1 className="font-display text-2xl text-foreground">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-foreground mt-1">
            {mode === "signup" ? "Begin your Quran journey today." : "Continue your learning."}
          </p>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full mb-4" disabled={submitting} onClick={onGoogle}>
          <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.3C29.4 34.7 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.3C41.6 35.6 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-foreground font-medium">or</span></div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="full_name" className="text-foreground font-medium">Full name</Label>
                <Input id="full_name" className="border-input/80 focus-visible:ring-2 focus-visible:ring-primary mt-1.5" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground font-medium">Phone (optional)</Label>
                <Input id="phone" className="border-input/80 focus-visible:ring-2 focus-visible:ring-primary mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input id="email" type="email" className="border-input/80 focus-visible:ring-2 focus-visible:ring-primary mt-1.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <Input id="password" type="password" className="border-input/80 focus-visible:ring-2 focus-visible:ring-primary mt-1.5" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-foreground mt-6">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button className="text-primary font-semibold hover:underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
        <p className="text-xs text-center text-foreground mt-4">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </main>
  );
};

export default Auth;
