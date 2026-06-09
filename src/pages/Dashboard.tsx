import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, LogOut, Plus, Check, PlayCircle, Sparkles, Trophy, Flame, Video, Calendar, GraduationCap, MapPin } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { safeHref } from "@/lib/url-safety";
import { useI18n } from "@/i18n/I18nContext";
import LangSwitcher from "@/components/site/LangSwitcher";
import RequestSlotDialog from "@/components/dashboard/RequestSlotDialog";

type Course = { id: string; title: string; slug: string; duration: string | null; level: string | null };
type Enrollment = { id: string; plan: string; status: string; created_at: string; course_id: string; courses: Course | null };
type Lesson = { id: string; course_id: string; title: string; summary: string | null; order_index: number; duration_min: number };
type Teacher = { id: string; full_name: string; bio: string | null; country: string | null; specialization: string | null; avatar_url: string | null };
type Assignment = { enrollment_id: string; teacher_id: string; teachers: Teacher | null };
type ClassRow = { id: string; enrollment_id: string; teacher_id: string; starts_at: string; duration_min: number; meeting_url: string | null; status: string };

const localeFor = (lang: string) => (lang === "ar" ? "ar" : lang === "ur" ? "ur-PK" : "en-US");

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; approval_status?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const locale = localeFor(lang);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const [pRes, eRes, prRes] = await Promise.all([
      supabase.from("profiles").select("full_name, approval_status").eq("id", user.id).maybeSingle(),
      supabase
        .from("enrollments")
        .select("id, plan, status, created_at, course_id, courses(id, title, slug, duration, level)")
        .order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("lesson_id"),
    ]);

    setProfile(pRes.data as any);
    const enr = ((eRes.data as any) || []) as Enrollment[];
    setEnrollments(enr);

    const courseIds = enr.map((e) => e.course_id);
    const enrollmentIds = enr.map((e) => e.id);
    if (courseIds.length) {
      const [lsRes, atRes, clRes] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, course_id, title, summary, order_index, duration_min")
          .in("course_id", courseIds)
          .order("order_index"),
        supabase
          .from("enrollment_teachers")
          .select("enrollment_id, teacher_id, teachers(id, full_name, bio, country, specialization, avatar_url)")
          .in("enrollment_id", enrollmentIds),
        supabase
          .from("classes")
          .select("id, enrollment_id, teacher_id, starts_at, duration_min, meeting_url, status")
          .in("enrollment_id", enrollmentIds)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at"),
      ]);
      setLessons((lsRes.data as Lesson[]) || []);
      setAssignments((atRes.data as any) || []);
      setClasses((clRes.data as ClassRow[]) || []);
    } else {
      setLessons([]); setAssignments([]); setClasses([]);
    }
    setCompletedIds(new Set(((prRes.data as any) || []).map((r: any) => r.lesson_id)));
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const stats = useMemo(() => {
    const totalLessons = lessons.length;
    const completed = lessons.filter((l) => completedIds.has(l.id)).length;
    const pct = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
    const minutes = lessons
      .filter((l) => completedIds.has(l.id))
      .reduce((s, l) => s + l.duration_min, 0);
    return { totalLessons, completed, pct, minutes };
  }, [lessons, completedIds]);

  const recommendations = useMemo(() => {
    const recs: { lesson: Lesson; course: Course | undefined }[] = [];
    for (const en of enrollments) {
      const courseLessons = lessons.filter((l) => l.course_id === en.course_id);
      const next = courseLessons.find((l) => !completedIds.has(l.id));
      if (next) recs.push({ lesson: next, course: en.courses ?? undefined });
    }
    return recs.slice(0, 3);
  }, [enrollments, lessons, completedIds]);

  const onToggleLesson = async (lessonId: string, done: boolean) => {
    if (!user) return;
    if (done) {
      setCompletedIds((s) => { const n = new Set(s); n.delete(lessonId); return n; });
      const { error } = await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId).eq("user_id", user.id);
      if (error) { toast.error(error.message); load(); }
    } else {
      setCompletedIds((s) => new Set(s).add(lessonId));
      const { error } = await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: lessonId });
      if (error) { toast.error(error.message); load(); }
      else toast.success(t("dash.toast.completed"));
    }
  };

  const onSignOut = async () => { await signOut(); navigate("/"); };

  const statusLabel = (s: string) =>
    s === "active" ? t("dash.status.active") :
    s === "pending" ? t("dash.status.pending") :
    s === "completed" ? t("dash.status.completed") : s;

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (profile && profile.approval_status && profile.approval_status !== "approved") {
    const rejected = profile.approval_status === "rejected";
    return (
      <main className="min-h-screen grid place-items-center px-4 bg-background">
        <div className="max-w-md w-full bg-card border-2 border-border ring-1 ring-foreground/5 rounded-2xl p-8 text-center shadow-elegant">
          <Sparkles className="h-10 w-10 mx-auto text-gold-deep mb-3" />
          <h1 className="font-display text-2xl mb-2">{rejected ? "Account not approved" : "Awaiting approval"}</h1>
          <p className="text-sm text-foreground/70 mb-6">
            {rejected
              ? "An administrator has not approved your account. Please contact support if you believe this is a mistake."
              : "Thanks for signing up! An administrator will review your account and assign your role shortly."}
          </p>
          <Button variant="ghost" onClick={onSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-background pattern-bg">
      <SEO title="My Dashboard · Almustafa Quran Academy" description="Track your enrolled Quran courses, progress, and next lessons." />
      <div className="container max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-1">{t("dash.eyebrow")}</p>
            <h1 className="font-display text-3xl">{t("dash.greeting")} {profile?.full_name || user?.email}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LangSwitcher />
            <Button variant="gold" asChild><Link to="/schedule"><Calendar className="h-4 w-4" /> Schedule</Link></Button>
            <Button variant="emerald" asChild><Link to="/enroll"><Plus className="h-4 w-4" /> {t("dash.enroll")}</Link></Button>
            <Button variant="ghost" onClick={onSignOut}><LogOut className="h-4 w-4" /> {t("dash.signout")}</Button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={BookOpen} label={t("dash.stat.courses")} value={enrollments.length} accent="emerald" />
          <StatCard icon={Trophy} label={t("dash.stat.lessons")} value={`${stats.completed}/${stats.totalLessons || 0}`} accent="gold" />
          <StatCard icon={Flame} label={t("dash.stat.minutes")} value={stats.minutes} accent="emerald" />
          <StatCard icon={Sparkles} label={t("dash.stat.progress")} value={`${stats.pct}%`} accent="gold" />
        </section>

        {/* Assigned Teachers */}
        {enrollments.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gold-deep" /> {t("dash.teachers.title")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((en) => {
                const assignment = assignments.find((a) => a.enrollment_id === en.id);
                const teacher = assignment?.teachers;
                const upcoming = classes.filter((c) => c.enrollment_id === en.id).slice(0, 3);
                return (
                  <article key={en.id} className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-6 sm:p-8 shadow-elegant hover:shadow-deep transition-smooth">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold-deep mb-3">{en.courses?.title}</p>
                    {teacher ? (
                      <>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-14 w-14 rounded-full gradient-emerald grid place-items-center shrink-0 shadow-elegant ring-1 ring-gold/40">
                            {teacher.avatar_url ? (
                              <img src={teacher.avatar_url} alt={teacher.full_name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <span className="font-display text-gold text-lg">
                                {teacher.full_name.split(" ").slice(-1)[0]?.[0] || "T"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg">
                              <Link to={`/teacher/${teacher.id}`} className="hover:text-primary transition-smooth">
                                {teacher.full_name}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70 mt-0.5">
                              {teacher.specialization && <span>{teacher.specialization}</span>}
                              {teacher.country && (
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {teacher.country}</span>
                              )}
                            </div>
                            {teacher.bio && (
                              <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{teacher.bio}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Button variant="emerald" size="sm" asChild>
                            <Link to={`/teacher/${teacher.id}`}>
                              <GraduationCap className="h-4 w-4" /> {t("teacher.view")}
                            </Link>
                          </Button>
                        </div>

                        <div className="border-t border-border pt-4">
                          <p className="text-xs uppercase tracking-wider text-foreground/70 mb-3 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> {t("dash.upcoming")}
                          </p>
                          {upcoming.length === 0 ? (
                            <p className="text-xs text-foreground/70">{t("dash.upcoming.none")}</p>
                          ) : (
                            <ul className="space-y-2">
                              {upcoming.map((c) => {
                                const d = new Date(c.starts_at);
                                return (
                                  <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground">
                                        {d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
                                      </p>
                                      <p className="text-xs text-foreground/70">
                                        {d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })} · {c.duration_min} {t("dash.minutes")}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                      <RequestSlotDialog
                                        enrollmentId={en.id}
                                        teacherId={c.teacher_id}
                                        originalClassId={c.id}
                                        defaultStartsAt={c.starts_at}
                                        defaultDurationMin={c.duration_min}
                                      />
                                      {safeHref(c.meeting_url) && (
                                        <Button size="sm" variant="gold" asChild>
                                          <a href={safeHref(c.meeting_url)} target="_blank" rel="noreferrer">
                                            <Video className="h-4 w-4" /> {t("dash.join")}
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-foreground/70">{t("dash.teachers.pending")}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Next up */}
        <section className="mb-12">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-deep" /> {t("dash.nextup")}
          </h2>
          {recommendations.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-6 sm:p-8 text-sm text-foreground/70 shadow-card">
              {enrollments.length === 0 ? t("dash.nextup.none.empty") : t("dash.nextup.none.done")}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.map(({ lesson, course }) => (
                <article key={lesson.id} className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-6 shadow-elegant hover:shadow-elegant hover:-translate-y-1 transition-smooth flex flex-col">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-deep mb-1">{course?.title}</p>
                  <h3 className="font-display text-lg mb-1">{t("dash.lesson")} {lesson.order_index}: {lesson.title}</h3>
                  <p className="text-xs text-foreground/70 flex-1">{lesson.summary}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-foreground/70">{lesson.duration_min} {t("dash.minutes")}</span>
                    <Button size="sm" variant="gold" onClick={() => onToggleLesson(lesson.id, false)}>
                      <PlayCircle className="h-4 w-4" /> {t("dash.start")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* My Courses */}
        <section>
          <h2 className="font-display text-xl mb-4">{t("dash.mycourses")}</h2>
          {enrollments.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-10 sm:p-12 text-center shadow-card">
              <BookOpen className="h-10 w-10 mx-auto text-gold-deep mb-3" />
              <p className="text-foreground/70 mb-4">{t("dash.empty.title")}</p>
              <Button variant="gold" asChild><Link to="/enroll">{t("dash.browse")}</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((en) => {
                const courseLessons = lessons.filter((l) => l.course_id === en.course_id);
                const done = courseLessons.filter((l) => completedIds.has(l.id)).length;
                const pct = courseLessons.length ? Math.round((done / courseLessons.length) * 100) : 0;
                return (
                  <article key={en.id} className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-6 sm:p-8 shadow-elegant">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg">{en.courses?.title}</h3>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            en.status === "active" ? "bg-emerald/15 text-emerald" :
                            en.status === "pending" ? "bg-gold/15 text-gold-deep" :
                            "bg-muted text-foreground/70"
                          }`}>{statusLabel(en.status)}</span>
                        </div>
                        <p className="text-xs text-foreground/70">
                          {en.plan} {t("dash.plan")} · {en.courses?.duration} · <span className="capitalize">{en.courses?.level}</span> · {t("dash.enrolled")} {new Date(en.created_at).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl text-foreground">{pct}%</p>
                        <p className="text-xs text-foreground/70">{done}/{courseLessons.length} {t("dash.lessons.count")}</p>
                      </div>
                    </div>
                    <Progress value={pct} className="h-2 mb-4" />
                    <ul className="divide-y divide-border">
                      {courseLessons.map((l) => {
                        const isDone = completedIds.has(l.id);
                        return (
                          <li key={l.id} className="flex items-center gap-3 py-3">
                            <button
                              onClick={() => onToggleLesson(l.id, isDone)}
                              className={`h-6 w-6 rounded-full grid place-items-center border transition-smooth shrink-0 ${
                                isDone ? "bg-emerald border-emerald text-background" : "border-border hover:border-gold"
                              }`}
                              aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                            >
                              {isDone && <Check className="h-3.5 w-3.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${isDone ? "line-through text-foreground/70" : "text-foreground"}`}>
                                <span className="text-foreground/70 mr-2">{l.order_index}.</span>{l.title}
                              </p>
                              <p className="text-xs text-foreground/70 truncate">{l.summary}</p>
                            </div>
                            <span className="text-xs text-foreground/70 shrink-0">{l.duration_min}{t("dash.minutes") === "min" ? "m" : ` ${t("dash.minutes")}`}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: "emerald" | "gold" }) => (
  <div className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 p-6 shadow-elegant">
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${accent === "gold" ? "bg-gold/15 text-gold-deep" : "bg-emerald/15 text-emerald"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-foreground/70 uppercase tracking-wider">{label}</p>
        <p className="font-display text-2xl">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
