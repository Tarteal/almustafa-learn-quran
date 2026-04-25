import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, LogOut, Plus } from "lucide-react";
import SEO from "@/components/SEO";

type Enrollment = {
  id: string;
  plan: string;
  status: string;
  created_at: string;
  courses: { title: string; slug: string; duration: string | null; level: string | null } | null;
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("enrollments").select("id, plan, status, created_at, courses(title, slug, duration, level)").order("created_at", { ascending: false }),
    ]).then(([p, e]) => {
      setProfile(p.data as any);
      setEnrollments((e.data as any) || []);
      setLoading(false);
    });
  }, [user]);

  const onSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 bg-secondary/30 pattern-overlay">
      <SEO title="My Dashboard · Almustafa Quran Academy" description="View your enrolled Quran courses and learning progress." />
      <div className="container max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-1">Student Dashboard</p>
            <h1 className="font-display text-3xl">As-salāmu ʿalaykum, {profile?.full_name || user?.email}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="emerald" asChild><Link to="/enroll"><Plus className="h-4 w-4" /> Enroll in Course</Link></Button>
            <Button variant="ghost" onClick={onSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </header>

        <section>
          <h2 className="font-display text-xl mb-4">My Courses</h2>
          {enrollments.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-card">
              <BookOpen className="h-10 w-10 mx-auto text-gold-deep mb-3" />
              <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
              <Button variant="gold" asChild><Link to="/enroll">Browse Courses</Link></Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map((en) => (
                <article key={en.id} className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-elegant transition-smooth">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg">{en.courses?.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                      en.status === "active" ? "bg-emerald/15 text-emerald" :
                      en.status === "pending" ? "bg-gold/15 text-gold-deep" :
                      "bg-muted text-muted-foreground"
                    }`}>{en.status}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                    {en.courses?.duration && <span>{en.courses.duration}</span>}
                    {en.courses?.level && <span className="capitalize">· {en.courses.level}</span>}
                    <span>· {en.plan} plan</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enrolled {new Date(en.created_at).toLocaleDateString()}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
