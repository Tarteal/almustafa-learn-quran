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
import { Plus } from "lucide-react";
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

        {teacherId && (
          <ScheduleClass
            teacherId={teacherId}
            enrollments={enrollments}
            enrLabel={enrLabel}
            reload={load}
          />
        )}

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

const ScheduleClass = ({
  teacherId, enrollments, enrLabel, reload,
}: {
  teacherId: string;
  enrollments: Enr[];
  enrLabel: (eid: string) => string;
  reload: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const defaultDate = (() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();
  const [startsAt, setStartsAt] = useState(defaultDate);
  const [duration, setDuration] = useState(30);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!enrollmentId) return toast.error("Choose a student");
    if (!startsAt) return toast.error("Pick a date and time");
    setSaving(true);
    const { error } = await supabase.from("classes").insert({
      enrollment_id: enrollmentId,
      teacher_id: teacherId,
      starts_at: new Date(startsAt).toISOString(),
      duration_min: duration,
      meeting_url: meetingUrl || null,
      status: "scheduled",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Class scheduled");
    setOpen(false);
    setEnrollmentId("");
    setMeetingUrl("");
    reload();
  };

  if (enrollments.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Schedule a class</h2>
        <Button variant={open ? "ghost" : "emerald"} onClick={() => setOpen((o) => !o)}>
          {open ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New class</>}
        </Button>
      </div>
      {open && (
        <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-elegant grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs">Student / enrollment</Label>
            <Select value={enrollmentId} onValueChange={setEnrollmentId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose one" /></SelectTrigger>
              <SelectContent>
                {enrollments.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{enrLabel(e.id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Date &amp; time</Label>
            <Input type="datetime-local" className="mt-1.5" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Duration (min)</Label>
            <Input type="number" min={5} step={5} className="mt-1.5" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || "30", 10))} />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Meeting URL (optional)</Label>
            <Input className="mt-1.5" placeholder="https://zoom.us/j/..." value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button variant="emerald" onClick={submit} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Scheduling..." : "Schedule class"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

const ATTENDANCE_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  unmarked: { label: "Not marked", cls: "bg-muted text-foreground", icon: <Clock className="h-3 w-3" /> },
  present: { label: "Present", cls: "bg-emerald text-white", icon: <Check className="h-3 w-3" /> },
  absent: { label: "Absent", cls: "bg-destructive text-destructive-foreground", icon: <X className="h-3 w-3" /> },
  late: { label: "Late", cls: "bg-gold text-foreground", icon: <Clock className="h-3 w-3" /> },
};

const ClassCard = ({ c, label, reload }: { c: ClassRow; label: string; reload: () => void }) => {
  const [meetingUrl, setMeetingUrl] = useState(c.meeting_url || "");
  const [status, setStatus] = useState(c.status);
  const [attendance, setAttendance] = useState(c.attendance || "unmarked");
  const [note, setNote] = useState(c.attendance_note || "");
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const d = new Date(c.starts_at);
  const meta = ATTENDANCE_META[attendance];

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("classes")
      .update({ meeting_url: meetingUrl || null, status, attendance_note: note || null })
      .eq("id", c.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Class updated");
    reload();
  };

  const mark = async (value: "present" | "absent" | "late" | "unmarked") => {
    setMarking(value);
    const { error } = await supabase
      .from("classes")
      .update({
        attendance: value,
        attendance_marked_at: value === "unmarked" ? null : new Date().toISOString(),
      })
      .eq("id", c.id);
    setMarking(null);
    if (error) return toast.error(error.message);
    setAttendance(value);
    toast.success(`Marked ${ATTENDANCE_META[value].label.toLowerCase()}`);
    reload();
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-elegant">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{label}</p>
          <p className="text-xs text-foreground/60">{d.toLocaleString()} · {c.duration_min} min</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${meta.cls}`}>
            {meta.icon} {meta.label}
          </span>
          <Badge variant={status === "completed" ? "default" : status === "cancelled" ? "destructive" : "secondary"} className="capitalize">
            {status}
          </Badge>
        </div>
      </div>

      {/* Attendance row */}
      <div className="border border-border rounded-xl p-3 mb-3 bg-background/40">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <Label className="text-xs uppercase tracking-wider text-foreground/60">Attendance</Label>
          {c.attendance_marked_at && (
            <span className="text-[10px] text-foreground/50">Marked {new Date(c.attendance_marked_at).toLocaleString()}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={attendance === "present" ? "emerald" : "outline"} disabled={!!marking} onClick={() => mark("present")}>
            <Check className="h-4 w-4" /> Present
          </Button>
          <Button size="sm" variant={attendance === "absent" ? "destructive" : "outline"} disabled={!!marking} onClick={() => mark("absent")}>
            <X className="h-4 w-4" /> Absent
          </Button>
          <Button size="sm" variant={attendance === "late" ? "gold" : "outline"} disabled={!!marking} onClick={() => mark("late")}>
            <Clock className="h-4 w-4" /> Late
          </Button>
          {attendance !== "unmarked" && (
            <Button size="sm" variant="ghost" disabled={!!marking} onClick={() => mark("unmarked")}>
              Clear
            </Button>
          )}
        </div>
        <Input
          className="mt-3"
          placeholder="Optional note (e.g. arrived 10 min late)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
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
