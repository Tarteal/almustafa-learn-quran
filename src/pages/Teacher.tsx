import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Video, Users, CalendarCheck, ExternalLink, Save, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { useIsTeacher } from "@/hooks/useIsTeacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";

type ClassRow = {
  id: string; enrollment_id: string; teacher_id: string;
  starts_at: string; duration_min: number; meeting_url: string | null; status: string;
  attendance: "unmarked" | "present" | "absent" | "late";
  attendance_note: string | null;
  attendance_marked_at: string | null;
};
type Enr = { id: string; user_id: string; course_id: string; status: string };
type Course = { id: string; title: string };
type Profile = { id: string; full_name: string | null; phone: string | null };

const TeacherPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, teacherId, loading: teacherLoading } = useIsTeacher();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [enrollments, setEnrollments] = useState<Enr[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/teacher", { replace: true });
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!teacherId) return;
    setLoading(true);
    const [cls, et] = await Promise.all([
      supabase.from("classes").select("*").eq("teacher_id", teacherId).order("starts_at", { ascending: false }),
      supabase.from("enrollment_teachers").select("enrollment_id").eq("teacher_id", teacherId),
    ]);
    const enrIds = ((et.data as any[]) || []).map((r) => r.enrollment_id);
    const enrRes = enrIds.length
      ? await supabase.from("enrollments").select("id, user_id, course_id, status").in("id", enrIds)
      : { data: [] as Enr[] };
    const enr = (enrRes.data as Enr[]) || [];
    const courseIds = Array.from(new Set(enr.map((e) => e.course_id)));
    const userIds = Array.from(new Set(enr.map((e) => e.user_id)));
    const [crs, prf] = await Promise.all([
      courseIds.length ? supabase.from("courses").select("id, title").in("id", courseIds) : { data: [] as Course[] },
      userIds.length ? supabase.from("profiles").select("id, full_name, phone").in("id", userIds) : { data: [] as Profile[] },
    ]);
    setClasses((cls.data as ClassRow[]) || []);
    setEnrollments(enr);
    setCourses((crs.data as Course[]) || []);
    setProfiles((prf.data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (teacherId) load(); /* eslint-disable-next-line */ }, [teacherId]);

  if (authLoading || teacherLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!isTeacher) {
    return (
      <main className="min-h-screen grid place-items-center px-4 bg-background pt-28 pb-24">
        <div className="max-w-md w-full bg-card border-2 border-border rounded-2xl p-8 text-center shadow-elegant">
          <Users className="h-10 w-10 mx-auto text-gold-deep mb-3" />
          <h1 className="font-display text-2xl mb-2">Teacher access required</h1>
          <p className="text-sm text-foreground/70 mb-6">
            Your account isn't linked to a teacher profile. Ask an admin to link your user to a teacher record.
          </p>
          <Button asChild variant="emerald"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
        </div>
      </main>
    );
  }

  const enrLabel = (eid: string) => {
    const e = enrollments.find((x) => x.id === eid);
    if (!e) return eid.slice(0, 8);
    const name = profiles.find((p) => p.id === e.user_id)?.full_name || "Student";
    const course = courses.find((c) => c.id === e.course_id)?.title || "Course";
    return `${name} — ${course}`;
  };

  const now = Date.now();
  const upcoming = classes.filter((c) => new Date(c.starts_at).getTime() >= now - 60 * 60 * 1000 && c.status === "scheduled");
  const past = classes.filter((c) => !upcoming.includes(c));

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-background pattern-bg">
      <SEO title="Teacher · Almustafa Quran Academy" description="Your teaching dashboard." />
      <div className="container max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-1">Teacher</p>
            <h1 className="font-display text-3xl">My teaching</h1>
          </div>
          <Button asChild variant="ghost"><Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link></Button>
        </header>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <StatCard icon={<Users className="h-5 w-5" />} label="Students" value={new Set(enrollments.map((e) => e.user_id)).size} />
          <StatCard icon={<CalendarCheck className="h-5 w-5" />} label="Upcoming" value={upcoming.length} />
          <StatCard icon={<Video className="h-5 w-5" />} label="Total classes" value={classes.length} />
        </div>

        {loading ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <>
            <Section title={`Upcoming (${upcoming.length})`}>
              {upcoming.length === 0 ? <Empty text="No upcoming classes." /> : upcoming.map((c) => (
                <ClassCard key={c.id} c={c} label={enrLabel(c.enrollment_id)} reload={load} />
              ))}
            </Section>

            <Section title={`Past & other (${past.length})`}>
              {past.length === 0 ? <Empty text="Nothing here yet." /> : past.slice(0, 20).map((c) => (
                <ClassCard key={c.id} c={c} label={enrLabel(c.enrollment_id)} reload={load} />
              ))}
            </Section>
          </>
        )}
      </div>
    </main>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-elegant flex items-center gap-3">
    <div className="h-10 w-10 rounded-full gradient-emerald grid place-items-center text-white">{icon}</div>
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs uppercase tracking-wider text-foreground/60">{label}</p>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-display text-xl mb-4">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const Empty = ({ text }: { text: string }) => (
  <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-foreground/60">{text}</div>
);

const ClassCard = ({ c, label, reload }: { c: ClassRow; label: string; reload: () => void }) => {
  const [meetingUrl, setMeetingUrl] = useState(c.meeting_url || "");
  const [status, setStatus] = useState(c.status);
  const [saving, setSaving] = useState(false);
  const d = new Date(c.starts_at);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("classes")
      .update({ meeting_url: meetingUrl || null, status })
      .eq("id", c.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Class updated");
    reload();
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-elegant">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{label}</p>
          <p className="text-xs text-foreground/60">{d.toLocaleString()} · {c.duration_min} min</p>
        </div>
        <Badge variant={status === "completed" ? "default" : status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
          {status}
        </Badge>
      </div>
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
        <div>
          <Label className="text-xs">Meeting URL</Label>
          <Input className="mt-1.5" placeholder="https://zoom.us/j/..." value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1.5 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="emerald" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>
      {c.meeting_url && (
        <a href={c.meeting_url} target="_blank" rel="noreferrer" className="text-xs text-emerald hover:underline inline-flex items-center gap-1 mt-3">
          Open meeting <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};

export default TeacherPage;
