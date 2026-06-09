import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Mail, MessageCircle, MapPin, GraduationCap, Award, BookOpen, Clock, Video } from "lucide-react";
import SEO from "@/components/SEO";
import { safeHref } from "@/lib/url-safety";

type Teacher = {
  id: string; full_name: string; bio: string | null; country: string | null;
  specialization: string | null; email: string | null; whatsapp: string | null;
  avatar_url: string | null; topics: string[]; years_experience: number | null;
};
type Availability = { id: string; day_of_week: number; start_time: string; end_time: string; timezone: string };
type ClassRow = { id: string; starts_at: string; duration_min: number; meeting_url: string | null; status: string };

const DAYS_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

const TeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = lang === "ar" ? "ar" : "en-US";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !teacherId) return;
    (async () => {
      // Verify the student is actually assigned to this teacher
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, enrollment_teachers!inner(teacher_id)")
        .eq("user_id", user.id)
        .eq("enrollment_teachers.teacher_id", teacherId);

      if (!enrollments || enrollments.length === 0) {
        setTeacher(null); setLoading(false); return;
      }

      const enrollmentIds = enrollments.map((e: any) => e.id);

      const [tRes, aRes, cRes] = await Promise.all([
        supabase.from("teachers").select("*").eq("id", teacherId).maybeSingle(),
        supabase.from("teacher_availability").select("*").eq("teacher_id", teacherId).order("day_of_week").order("start_time"),
        supabase.from("classes")
          .select("id, starts_at, duration_min, meeting_url, status")
          .in("enrollment_id", enrollmentIds)
          .eq("teacher_id", teacherId)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at"),
      ]);
      setTeacher(tRes.data as Teacher);
      setAvailability((aRes.data as Availability[]) || []);
      setClasses((cRes.data as ClassRow[]) || []);
      setLoading(false);
    })();
  }, [user, teacherId]);

  const groupedAvailability = useMemo(() => {
    const map: Record<number, Availability[]> = {};
    for (const a of availability) (map[a.day_of_week] ||= []).push(a);
    return map;
  }, [availability]);

  const fmtTime = (hms: string) => {
    const [h, m] = hms.split(":").map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!teacher) {
    return (
      <main className="min-h-screen grid place-items-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-2">{t("teacher.notfound.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("teacher.notfound.desc")}</p>
          <Button asChild variant="emerald"><Link to="/dashboard"><ArrowLeft className="h-4 w-4 rtl-flip" /> {t("teacher.back")}</Link></Button>
        </div>
      </main>
    );
  }

  const initial = teacher.full_name.split(" ").slice(-1)[0]?.[0] || "T";

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 bg-secondary/30 pattern-bg">
      <SEO title={`${teacher.full_name} · Almustafa Quran Academy`} description={teacher.bio || `Profile of ${teacher.full_name}`} />
      <div className="container max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4 rtl-flip" /> {t("teacher.back")}</Link>
        </Button>

        {/* Hero */}
        <section className="bg-card border border-border rounded-2xl shadow-elegant overflow-hidden mb-6">
          <div className="gradient-emerald h-28 relative">
            <div className="absolute inset-0 pattern-overlay opacity-30" />
          </div>
          <div className="px-6 sm:px-8 pb-6 -mt-12">
            <div className="flex flex-wrap items-end gap-5">
              <div className="h-24 w-24 rounded-full bg-card border-4 border-card grid place-items-center shadow-deep ring-1 ring-gold/40 overflow-hidden">
                {teacher.avatar_url ? (
                  <img src={teacher.avatar_url} alt={teacher.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full gradient-emerald grid place-items-center">
                    <span className="font-display text-gold text-3xl">{initial}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl">{teacher.full_name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  {teacher.specialization && (
                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-gold-deep" /> {teacher.specialization}</span>
                  )}
                  {teacher.country && (
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold-deep" /> {teacher.country}</span>
                  )}
                  {teacher.years_experience != null && (
                    <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-gold-deep" /> {teacher.years_experience}+ {t("teacher.years")}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.email && (
                  <Button variant="emerald" size="sm" asChild>
                    <a href={`mailto:${teacher.email}`}><Mail className="h-4 w-4" /> {t("dash.contact.email")}</a>
                  </Button>
                )}
                {teacher.whatsapp && (
                  <Button variant="gold" size="sm" asChild>
                    <a href={`https://wa.me/${teacher.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" /> {t("dash.contact.whatsapp")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}
        {teacher.bio && (
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card mb-6">
            <h2 className="font-display text-xl mb-3">{t("teacher.about")}</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
          </section>
        )}

        {/* Topics */}
        {teacher.topics.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card mb-6">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gold-deep" /> {t("teacher.topics")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {teacher.topics.map((topic) => (
                <span key={topic} className="text-xs px-3 py-1.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Availability */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card mb-6">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold-deep" /> {t("teacher.availability")}
          </h2>
          {availability.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("teacher.availability.none")}</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                {DAYS_KEYS.map((dKey, idx) => {
                  const slots = groupedAvailability[idx] || [];
                  const isOff = slots.length === 0;
                  return (
                    <div key={dKey} className={`rounded-xl border p-4 ${isOff ? "border-dashed border-border bg-secondary/40" : "border-border bg-secondary/20"}`}>
                      <p className="font-display text-sm uppercase tracking-wider mb-2">{t(`teacher.day.${dKey}` as any)}</p>
                      {isOff ? (
                        <p className="text-xs text-muted-foreground">{t("teacher.day.off")}</p>
                      ) : (
                        <ul className="space-y-1">
                          {slots.map((s) => (
                            <li key={s.id} className="text-sm text-foreground flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-gold-deep" />
                              {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {t("teacher.availability.tz")}: {availability[0]?.timezone || "UTC"}
              </p>
            </>
          )}
        </section>

        {/* Upcoming classes with this teacher */}
        <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <h2 className="font-display text-xl mb-4">{t("dash.upcoming")}</h2>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("dash.upcoming.none")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {classes.map((c) => {
                const d = new Date(c.starts_at);
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })} · {c.duration_min} {t("dash.minutes")}
                      </p>
                    </div>
                    {c.meeting_url && (
                      <Button size="sm" variant="gold" asChild>
                        <a href={c.meeting_url} target="_blank" rel="noreferrer">
                          <Video className="h-4 w-4" /> {t("dash.join")}
                        </a>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default TeacherProfile;
