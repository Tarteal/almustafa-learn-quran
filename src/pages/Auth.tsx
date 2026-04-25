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

  return (
    <main className="min-h-screen grid place-items-center px-4 py-24 bg-secondary/30 pattern-overlay">
      <SEO title={mode === "signup" ? "Create Account · Almustafa Quran Academy" : "Sign In · Almustafa Quran Academy"} description="Sign in or create your student account to enroll in Quran courses." />
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full gradient-emerald grid place-items-center shadow-elegant mb-3">
            <span className="font-arabic text-gold text-xl">ﷲ</span>
          </div>
          <h1 className="font-display text-2xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup" ? "Begin your Quran journey today." : "Continue your learning."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button className="text-primary font-medium hover:underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
        <p className="text-xs text-center text-muted-foreground mt-4">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </div>
    </main>
  );
};

export default Auth;
