import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: string | null;
  level: string | null;
  price_monthly: number | null;
  plan: string | null;
};

const PLANS = [
  { id: "basic", name: "Basic", price: 45, perks: ["2 classes/week", "30 min/class", "Email support"] },
  { id: "standard", name: "Standard", price: 75, perks: ["3 classes/week", "45 min/class", "Priority support"] },
  { id: "premium", name: "Premium", price: 120, perks: ["5 classes/week", "60 min/class", "Choose teacher"] },
];

const Enroll = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const courseSlug = params.get("course");
  const planParam = params.get("plan") || "standard";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>(planParam);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/enroll${window.location.search}`)}`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase.from("courses").select("*").order("price_monthly").then(({ data, error }) => {
      if (error) toast.error("Could not load courses");
      else {
        setCourses(data as Course[]);
        if (courseSlug) {
          const c = data.find((x: any) => x.slug === courseSlug);
          if (c) setSelectedCourse(c.id);
        }
      }
      setLoading(false);
    });
  }, [courseSlug]);

  const submit = async () => {
    if (!user) return;
    if (!selectedCourse) { toast.error("Please select a course"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: selectedCourse,
      plan: selectedPlan,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("You are already enrolled in this course.");
      else toast.error(error.message);
      return;
    }
    toast.success("Enrollment submitted! Our team will reach out shortly, in shaa Allah.");
    navigate("/dashboard");
  };

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 bg-secondary/30 pattern-overlay">
      <SEO title="Enroll · Almustafa Quran Academy" description="Choose your course and plan to begin learning the Quran with certified scholars." />
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">Enrollment</p>
          <h1 className="font-display text-3xl md:text-4xl">Begin your Quran journey</h1>
          <p className="text-muted-foreground mt-2">Pick a course and a plan — we'll handle the rest.</p>
        </div>

        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-elegant mb-6">
          <Label className="text-base mb-4 block">1. Choose a course</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourse(c.id)}
                className={`text-left rounded-xl border p-4 transition-smooth ${
                  selectedCourse === c.id
                    ? "border-gold bg-gold/5 shadow-card"
                    : "border-border hover:border-gold/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{c.title}</h3>
                  {selectedCourse === c.id && <Check className="h-4 w-4 text-gold-deep" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                  {c.duration && <span>{c.duration}</span>}
                  {c.level && <span className="capitalize">· {c.level}</span>}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-elegant mb-6">
          <Label className="text-base mb-4 block">2. Choose a plan</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`text-left rounded-xl border p-4 transition-smooth ${
                  selectedPlan === p.id
                    ? "border-gold bg-gold/5 shadow-card"
                    : "border-border hover:border-gold/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{p.name}</h3>
                  {selectedPlan === p.id && <Check className="h-4 w-4 text-gold-deep" />}
                </div>
                <div className="font-display text-2xl mt-1">${p.price}<span className="text-xs text-muted-foreground font-sans">/mo</span></div>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  {p.perks.map((perk) => <li key={perk}>· {perk}</li>)}
                </ul>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Payment is collected after your free trial class. <br className="hidden sm:block" />No card required to enroll.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" asChild><Link to="/dashboard">Cancel</Link></Button>
            <Button variant="emerald" size="lg" onClick={submit} disabled={submitting || !selectedCourse}>
              {submitting ? "Enrolling..." : "Confirm Enrollment"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Enroll;
