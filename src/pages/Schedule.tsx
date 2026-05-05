import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, Calendar, Clock, ArrowLeft, BookOpen, GraduationCap, Bell, LinkIcon, CheckCircle2, Hourglass } from "lucide-react";
import SEO from "@/components/SEO";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatStartsIn = (startsAt: string) => {
  const ms = new Date(startsAt).getTime() - Date.now();
  if (ms <= 0) return "soon";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${Math.max(1, m)}m`;
};

type JoinButtonProps = {
  state: "live" | "upcoming" | "completed";
  meetingUrl: string | null;
  startsAt: string;
  className?: string;
  size?: "default" | "lg";
  fullWidth?: boolean;
};

const JoinButton = ({ state, meetingUrl, startsAt, className, size = "default", fullWidth }: JoinButtonProps) => {
  const isLive = state === "live";
  const hasLink = !!meetingUrl;

  let label = "Join Meeting";
  let helper = "";
  let Icon = Video;
  let variant: "gold" | "ghost" | "secondary" = "gold";

  if (state === "completed") {
    label = "Class ended";
    helper = "This class has finished.";
    Icon = CheckCircle2;
    variant = "secondary";
  } else if (!hasLink) {
    label = "Link not available";
    helper = "Your teacher hasn't added a Zoom link yet. Please check back closer to the start time.";
    Icon = LinkIcon;
    variant = "ghost";
  } else if (!isLive) {
    label = `Opens ${formatStartsIn(startsAt)}`;
    helper = "The Join button activates when class goes live.";
    Icon = Hourglass;
    variant = "ghost";
  }

  const disabled = !(isLive && hasLink);
  const widthCls = fullWidth ? "w-full" : "";

  const btn = (
    <Button
      className={`${widthCls} ${className || ""}`}
      variant={isLive && hasLink ? "gold" : variant}
      size={size}
      disabled={disabled}
      asChild={!disabled}
      aria-label={label}
    >
      {!disabled ? (
        <a href={meetingUrl!} target="_blank" rel="noreferrer">
          <Icon className="h-4 w-4" /> Join Meeting
        </a>
      ) : (
        <span><Icon className="h-4 w-4" /> {label}</span>
      )}
    </Button>
  );

  if (!helper) return btn;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={fullWidth ? "block w-full" : "inline-block"}>{btn}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">{helper}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

type ClassRow = {
  id: string;
  enrollment_id: string;
  teacher_id: string;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  status: string;
  enrollment?: { id: string; user_id: string; course?: { id: string; title: string } | null } | null;
  teacher?: { id: string; full_name: string } | null;
};

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const liveState = (c: ClassRow): "live" | "upcoming" | "completed" => {
  const start = new Date(c.starts_at).getTime();
  const end = start + c.duration_min * 60_000;
  const now = Date.now();
  if (c.status === "completed" || now > end) return "completed";
  if (now >= start && now <= end) return "live";
  return "upcoming";
};

const Schedule = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/schedule", { replace: true });
  }, [user, authLoading, navigate]);

  // tick every 1s for countdowns / live status
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("id, user_id, course_id, courses(id, title)")
        .eq("user_id", user.id);
      const enrIds = (enr || []).map((e: any) => e.id);
      if (!enrIds.length) {
        setClasses([]);
        setLoading(false);
        return;
      }
      const { data: cls } = await supabase
        .from("classes")
        .select("id, enrollment_id, teacher_id, starts_at, duration_min, meeting_url, status, teachers(id, full_name)")
        .in("enrollment_id", enrIds)
        .order("starts_at");
      const enriched: ClassRow[] = ((cls as any[]) || []).map((c) => ({
        ...c,
        enrollment: (enr as any[]).find((e) => e.id === c.enrollment_id)
          ? {
              id: c.enrollment_id,
              user_id: user.id,
              course: (enr as any[]).find((e) => e.id === c.enrollment_id)?.courses || null,
            }
          : null,
        teacher: c.teachers || null,
      }));
      setClasses(enriched);
      setLoading(false);
    })();
  }, [user]);

  const today = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return classes.filter((c) => {
      const t = new Date(c.starts_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [classes]);

  const nextUpcoming = useMemo(() => {
    return classes
      .filter((c) => liveState(c) !== "completed")
      .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];
  }, [classes]);

  const weekly = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    const dow = (now.getDay() + 6) % 7; // Mon=0
    monday.setDate(now.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const grid: Record<number, ClassRow[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    classes.forEach((c) => {
      const d = new Date(c.starts_at);
      const diff = Math.floor((+d - +monday) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) grid[diff].push(c);
    });
    return grid;
  }, [classes]);

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-background pattern-overlay">
      <SEO title="Class Schedule · Almustafa Quran Academy" description="View today's classes, weekly schedule, and join your live Zoom sessions in one click." />
      <div className="container max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-1">Schedule</p>
            <h1 className="font-display text-3xl">Your Classes</h1>
            <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Timezone: {tz}</p>
          </div>
          <Button asChild variant="ghost"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>
        </header>

        {/* Next Class Hero */}
        {nextUpcoming && <NextClassHero c={nextUpcoming} />}

        {/* Today's Classes */}
        <section className="mb-12">
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold-deep" /> Today's Classes
          </h2>
          {today.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl p-8 text-sm text-foreground/70 text-center shadow-card">
              No classes scheduled for today.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {today.map((c) => <ClassCard key={c.id} c={c} />)}
            </div>
          )}
        </section>

        {/* Weekly Schedule */}
        <section>
          <h2 className="font-display text-xl mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold-deep" /> This Week
          </h2>
          <div className="bg-card border-2 border-border rounded-2xl ring-1 ring-foreground/5 shadow-elegant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground/60 w-32">Day</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground/60">Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, i) => (
                    <tr key={day} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 align-top font-medium">{day}</td>
                      <td className="px-4 py-3">
                        {weekly[i].length === 0 ? (
                          <span className="text-foreground/40 text-xs">—</span>
                        ) : (
                          <div className="space-y-2">
                            {weekly[i].map((c) => {
                              const d = new Date(c.starts_at);
                              const state = liveState(c);
                              return (
                                <div key={c.id} className="flex flex-wrap items-center gap-3">
                                  <span className="font-mono text-xs text-foreground/80 w-20">
                                    {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <span className="font-medium text-foreground">{c.enrollment?.course?.title || "Class"}</span>
                                  <span className="text-xs text-foreground/60 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {c.teacher?.full_name || "—"}</span>
                                  <StatusBadge state={state} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const NextClassHero = ({ c }: { c: ClassRow }) => {
  const start = new Date(c.starts_at);
  const state = liveState(c);
  const diff = +start - Date.now();

  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
  };

  return (
    <section className="mb-10 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 ring-1 ring-foreground/5 shadow-deep gradient-emerald p-6 sm:p-8">
        <div className="absolute top-4 right-4">
          <Bell className="h-5 w-5 text-gold animate-pulse" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold mb-2">
          {state === "live" ? "Live Now" : "Next Class"}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-background mb-2">
          {c.enrollment?.course?.title || "Class"}
        </h2>
        <p className="text-sm text-background/80 mb-1 flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4" /> {c.teacher?.full_name || "Teacher TBA"}
        </p>
        <p className="text-sm text-background/80 mb-4 flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {start.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {c.duration_min} min
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {state === "live" ? (
            <Badge className="bg-red-500 text-white animate-pulse">● LIVE</Badge>
          ) : (
            <div className="bg-background/15 backdrop-blur rounded-lg px-4 py-2 font-mono text-background">
              {fmt(diff)}
            </div>
          )}
          {c.meeting_url && state !== "completed" ? (
            <Button
              variant="gold"
              size="lg"
              disabled={state !== "live"}
              asChild={state === "live"}
            >
              {state === "live" ? (
                <a href={c.meeting_url} target="_blank" rel="noreferrer">
                  <Video className="h-4 w-4" /> Join Meeting
                </a>
              ) : (
                <span><Video className="h-4 w-4" /> Join Meeting</span>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

const ClassCard = ({ c }: { c: ClassRow }) => {
  const state = liveState(c);
  const d = new Date(c.starts_at);
  const isLive = state === "live";
  return (
    <article className={`bg-card border-2 rounded-2xl ring-1 ring-foreground/5 p-5 shadow-elegant transition-smooth hover:-translate-y-0.5 ${isLive ? "border-emerald shadow-deep" : "border-border"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold-deep flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> {c.enrollment?.course?.title || "Class"}
        </p>
        <StatusBadge state={state} />
      </div>
      <h3 className="font-display text-lg mb-1">{c.teacher?.full_name || "Teacher"}</h3>
      <p className="text-sm text-foreground/70 mb-1 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {c.duration_min} min
      </p>
      {c.meeting_url && state !== "completed" ? (
        <Button
          className="w-full mt-3"
          variant={isLive ? "gold" : "ghost"}
          disabled={!isLive}
          asChild={isLive}
        >
          {isLive ? (
            <a href={c.meeting_url} target="_blank" rel="noreferrer">
              <Video className="h-4 w-4" /> Join Meeting
            </a>
          ) : (
            <span><Video className="h-4 w-4" /> Join Meeting</span>
          )}
        </Button>
      ) : state === "completed" ? (
        <Button className="w-full mt-3" variant="ghost" disabled>Completed</Button>
      ) : (
        <p className="text-xs text-foreground/50 mt-3 text-center">No meeting link yet</p>
      )}
    </article>
  );
};

const StatusBadge = ({ state }: { state: "live" | "upcoming" | "completed" }) => {
  if (state === "live") return <Badge className="bg-red-500 text-white animate-pulse">● Live</Badge>;
  if (state === "completed") return <Badge variant="secondary">Completed</Badge>;
  return <Badge className="bg-emerald/15 text-emerald border-emerald/30">Upcoming</Badge>;
};

export default Schedule;
