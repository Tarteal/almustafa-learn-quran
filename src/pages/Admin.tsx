import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Users, GraduationCap, BookOpen, ListChecks, Plus, Pencil, Trash2, ShieldCheck, ArrowLeft, Eye, CalendarCheck, CreditCard, ClipboardList, Video, Paperclip, UserCheck, UserPlus, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import LessonMaterialsEditor from "@/components/admin/LessonMaterialsEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { isSafeHttpUrl } from "@/lib/url-safety";

type Profile = { id: string; full_name: string | null; phone: string | null; created_at: string; approval_status?: string };
type Enrollment = { id: string; user_id: string; course_id: string; plan: string; status: string; created_at: string };
type Course = { id: string; title: string; slug: string; level: string | null; duration: string | null; price_monthly: number | null; description: string | null; plan: string | null };
type Teacher = { id: string; full_name: string; email: string | null; whatsapp: string | null; country: string | null; specialization: string | null; bio: string | null; years_experience: number | null; topics: string[]; avatar_url: string | null; user_id?: string | null };
type Lesson = { id: string; course_id: string; title: string; summary: string | null; order_index: number; duration_min: number; is_published?: boolean };

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/admin", { replace: true });
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center px-4 bg-background">
        <div className="max-w-md w-full bg-card border-2 border-border ring-1 ring-foreground/5 rounded-2xl p-8 text-center shadow-elegant">
          <ShieldCheck className="h-10 w-10 mx-auto text-gold-deep mb-3" />
          <h1 className="font-display text-2xl mb-2">Admin access required</h1>
          <p className="text-sm text-foreground/70 mb-6">
            Your account isn't an admin. Ask an existing admin to grant the <code className="font-mono text-xs">admin</code> role to your user via the backend.
          </p>
          <Button asChild variant="emerald"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-background pattern-bg">
      <SEO title="Admin · Almustafa Quran Academy" description="Manage students, teachers, courses, and lessons." />
      <div className="container max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-1">Admin</p>
            <h1 className="font-display text-3xl">Manage academy</h1>
          </div>
          <Button asChild variant="ghost"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link></Button>
        </header>

        <Tabs defaultValue="approvals" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-7 w-full mb-8 h-auto">
            <TabsTrigger value="approvals" className="gap-2 py-2.5"><UserPlus className="h-4 w-4" /> Approvals</TabsTrigger>
            <TabsTrigger value="students" className="gap-2 py-2.5"><Users className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2 py-2.5"><GraduationCap className="h-4 w-4" /> Teachers</TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2 py-2.5"><UserCheck className="h-4 w-4" /> Assign</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 py-2.5"><BookOpen className="h-4 w-4" /> Courses</TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2 py-2.5"><ListChecks className="h-4 w-4" /> Lessons</TabsTrigger>
            <TabsTrigger value="classes" className="gap-2 py-2.5"><Video className="h-4 w-4" /> Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals"><ApprovalsPanel /></TabsContent>
          <TabsContent value="students"><StudentsPanel /></TabsContent>
          <TabsContent value="teachers"><TeachersPanel /></TabsContent>
          <TabsContent value="assignments"><AssignmentsPanel /></TabsContent>
          <TabsContent value="courses"><CoursesPanel /></TabsContent>
          <TabsContent value="lessons"><LessonsPanel /></TabsContent>
          <TabsContent value="classes"><ClassesPanel /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

/* ---------------- Shared card wrapper ---------------- */
const Panel = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-card border-2 border-border ring-1 ring-foreground/5 rounded-2xl p-6 sm:p-8 shadow-elegant">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="font-display text-xl">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

/* ---------------- Approvals ---------------- */
type AppRole = "admin" | "moderator" | "user" | "teacher";
type PendingProfile = Profile & { approval_status: string };

const ApprovalsPanel = () => {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [roles, setRoles] = useState<{ user_id: string; role: AppRole }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [pRes, rRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at, approval_status").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    setProfiles((pRes.data as PendingProfile[]) || []);
    setRoles((rRes.data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (p: PendingProfile, role: AppRole) => {
    setBusy(p.id);
    try {
      const hasRole = roles.some((r) => r.user_id === p.id && r.role === role);
      if (!hasRole) {
        const { error: rErr } = await supabase.from("user_roles").insert({ user_id: p.id, role });
        if (rErr && !rErr.message.includes("duplicate")) throw rErr;
      }
      if (role === "teacher") {
        const { data: t } = await supabase.from("teachers").select("id").eq("user_id", p.id).maybeSingle();
        if (!t) {
          const { error: tErr } = await supabase.from("teachers").insert({ user_id: p.id, full_name: p.full_name || "New teacher" });
          if (tErr) throw tErr;
        }
      }
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: "approved", approved_at: new Date().toISOString() } as any)
        .eq("id", p.id);
      if (error) throw error;
      toast.success(`Approved as ${role}`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve");
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (p: PendingProfile, approval_status: string) => {
    setBusy(p.id);
    const { error } = await supabase.from("profiles").update({ approval_status } as any).eq("id", p.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  if (loading) return <Loader />;

  const filtered = profiles.filter((p) => filter === "all" || (p.approval_status || "pending") === filter);
  const pendingCount = profiles.filter((p) => (p.approval_status || "pending") === "pending").length;

  return (
    <Panel
      title={`Sign-up approvals${pendingCount ? ` (${pendingCount} pending)` : ""}`}
      action={
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="space-y-3">
        {filtered.map((p) => {
          const userRoles = roles.filter((r) => r.user_id === p.id).map((r) => r.role);
          const status = p.approval_status || "pending";
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{p.full_name || <span className="text-foreground/50">Unnamed user</span>}</p>
                  <Badge variant={status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary"} className="capitalize">{status}</Badge>
                  {userRoles.map((r) => (
                    <Badge key={r} variant="outline" className="capitalize">{r}</Badge>
                  ))}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  {p.phone || "no phone"} · joined {new Date(p.created_at).toLocaleDateString()}
                </p>
                <p className="text-[10px] font-mono text-foreground/40 mt-0.5">{p.id}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {status !== "approved" && (
                  <>
                    <Select onValueChange={(v: AppRole) => approve(p, v)} disabled={busy === p.id}>
                      <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Approve as…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(p, "rejected")} disabled={busy === p.id}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    )}
                  </>
                )}
                {status !== "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(p, "pending")} disabled={busy === p.id}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-foreground/60">No {filter === "all" ? "" : filter} sign-ups.</div>
        )}
      </div>
    </Panel>
  );
};

/* ---------------- Students ---------------- */
const StudentsPanel = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [pRes, eRes, cRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("id, user_id, course_id, plan, status, created_at").order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, slug, level, duration, price_monthly, description, plan"),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    setProfiles((pRes.data as Profile[]) || []);
    const courses = (cRes.data as Course[]) || [];
    const enr = ((eRes.data as Enrollment[]) || []).map((e) => ({ ...e, course: courses.find((c) => c.id === e.course_id) }));
    setEnrollments(enr);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Enrollment updated");
    load();
  };

  const deleteEnrollment = async (id: string) => {
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Enrollment deleted");
    load();
  };

  const [detailsId, setDetailsId] = useState<string | null>(null);

  if (loading) return <Loader />;

  const detailsProfile = profiles.find((p) => p.id === detailsId) || null;

  return (
    <div className="space-y-6">
      <Panel title={`Students (${profiles.length})`}>
        <div className="overflow-x-auto -mx-6 sm:-mx-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-foreground/60 border-b border-border">
                <th className="px-6 sm:px-8 py-3">Name</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Joined</th>
                <th className="py-3">Enrollments</th>
                <th className="px-6 sm:px-8 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const count = enrollments.filter((e) => e.user_id === p.id).length;
                return (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-6 sm:px-8 py-3 font-medium">{p.full_name || <span className="text-foreground/50">—</span>}</td>
                    <td className="py-3 text-foreground/70">{p.phone || "—"}</td>
                    <td className="py-3 text-foreground/70">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3">{count}</td>
                    <td className="px-6 sm:px-8 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setDetailsId(p.id)}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {profiles.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-foreground/60">No students yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <StudentDetailsDrawer
        open={!!detailsId}
        onClose={() => setDetailsId(null)}
        profile={detailsProfile}
      />

      <Panel title={`Enrollments (${enrollments.length})`}>
        <div className="overflow-x-auto -mx-6 sm:-mx-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-foreground/60 border-b border-border">
                <th className="px-6 sm:px-8 py-3">Course</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Status</th>
                <th className="py-3">Created</th>
                <th className="px-6 sm:px-8 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="px-6 sm:px-8 py-3 font-medium">{e.course?.title || e.course_id.slice(0, 8)}</td>
                  <td className="py-3 text-foreground/70">{e.plan}</td>
                  <td className="py-3">
                    <Select value={e.status} onValueChange={(v) => updateStatus(e.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">pending</SelectItem>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="completed">completed</SelectItem>
                        <SelectItem value="cancelled">cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 text-foreground/70">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-6 sm:px-8 py-3 text-right">
                    <ConfirmDelete onConfirm={() => deleteEnrollment(e.id)} label="Delete enrollment?" />
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-foreground/60">No enrollments.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

/* ---------------- Teachers ---------------- */
const emptyTeacher: Partial<Teacher> = { full_name: "", email: "", whatsapp: "", country: "", specialization: "", bio: "", years_experience: 0, topics: [], avatar_url: "", user_id: "" };

type RoleRow = { user_id: string; role: string };

const TeachersPanel = () => {
  const [items, setItems] = useState<Teacher[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Teacher> | null>(null);

  const load = async () => {
    setLoading(true);
    const [tRes, pRes, rRes] = await Promise.all([
      supabase.from("teachers").select("*").order("full_name"),
      supabase.from("profiles").select("id, full_name, phone, created_at").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (tRes.error) toast.error(tRes.error.message);
    setItems((tRes.data as Teacher[]) || []);
    setProfiles((pRes.data as Profile[]) || []);
    setRoles((rRes.data as RoleRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...emptyTeacher }); setDialogOpen(true); };
  const openEdit = (t: Teacher) => { setEditing({ ...t }); setDialogOpen(true); };

  const save = async () => {
    if (!editing) return;
    if (!editing.full_name?.trim()) return toast.error("Full name required");
    const payload: any = {
      full_name: editing.full_name,
      email: editing.email || null,
      whatsapp: editing.whatsapp || null,
      country: editing.country || null,
      specialization: editing.specialization || null,
      bio: editing.bio || null,
      years_experience: editing.years_experience ? Number(editing.years_experience) : null,
      avatar_url: editing.avatar_url || null,
      topics: typeof editing.topics === "string" ? (editing.topics as any).split(",").map((s: string) => s.trim()).filter(Boolean) : (editing.topics || []),
      user_id: editing.user_id ? editing.user_id : null,
    };
    const res = editing.id
      ? await supabase.from("teachers").update(payload).eq("id", editing.id)
      : await supabase.from("teachers").insert(payload);
    if (res.error) return toast.error(res.error.message);
    // If linked to a user, also grant 'teacher' role (ignore unique conflict)
    if (editing.user_id) {
      await supabase.from("user_roles").insert({ user_id: editing.user_id, role: "teacher" as any });
    }
    toast.success(editing.id ? "Teacher updated" : "Teacher created");
    setDialogOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Teacher deleted"); load();
  };

  const grantTeacherRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "teacher" as any });
    if (error && !error.message.toLowerCase().includes("duplicate")) return toast.error(error.message);
    toast.success("Teacher role granted");
    load();
  };

  if (loading) return <Loader />;

  // Verification helpers
  const profileById = (id?: string | null) => profiles.find((p) => p.id === id);
  const hasTeacherRole = (uid?: string | null) => !!uid && roles.some((r) => r.user_id === uid && r.role === "teacher");
  const orphanRoleUsers = roles
    .filter((r) => r.role === "teacher" && !items.some((t) => t.user_id === r.user_id))
    .map((r) => ({ user_id: r.user_id, profile: profileById(r.user_id) }));

  return (
    <div className="space-y-6">
      {orphanRoleUsers.length > 0 && (
        <Panel title={`⚠ Unlinked teacher accounts (${orphanRoleUsers.length})`}>
          <p className="text-sm text-foreground/70 mb-4">
            These users have the <code className="text-xs">teacher</code> role but aren't linked to a teacher profile. They will see "access permission required" until linked.
          </p>
          <div className="space-y-2">
            {orphanRoleUsers.map((o) => (
              <div key={o.user_id} className="border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{o.profile?.full_name || "Unknown user"}</p>
                  <p className="text-[11px] text-foreground/50 font-mono truncate">{o.user_id}</p>
                </div>
                <LinkOrphanButton
                  userId={o.user_id}
                  defaultName={o.profile?.full_name || ""}
                  teachers={items}
                  reload={load}
                />
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel
        title={`Teachers (${items.length})`}
        action={<Button variant="emerald" onClick={openNew}><Plus className="h-4 w-4" /> New teacher</Button>}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((t) => {
            const linked = !!t.user_id;
            const profile = profileById(t.user_id);
            const roleOk = hasTeacherRole(t.user_id);
            const status = !linked
              ? { label: "Not linked", cls: "bg-muted text-foreground" }
              : !roleOk
              ? { label: "Missing role", cls: "bg-destructive text-destructive-foreground" }
              : { label: "Verified", cls: "bg-emerald text-white" };
            return (
              <div key={t.id} className="border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{t.full_name}</p>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                  </div>
                  <p className="text-xs text-foreground/60 truncate">{t.specialization || "—"} · {t.country || "—"}</p>
                  <p className="text-xs text-foreground/60 truncate">{t.email || profile?.full_name || ""}</p>
                  {linked && (
                    <p className="text-[11px] text-foreground/50 font-mono truncate mt-1">user: {t.user_id}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <ConfirmDelete onConfirm={() => remove(t.id)} label={`Delete ${t.full_name}?`} />
                  </div>
                  {linked && !roleOk && (
                    <Button size="sm" variant="emerald" onClick={() => grantTeacherRole(t.user_id!)}>
                      Grant role
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-sm text-foreground/60 col-span-full text-center py-6">No teachers yet.</p>}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit teacher" : "New teacher"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <Field label="Full name *"><Input value={editing.full_name || ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email"><Input value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
                  <Field label="WhatsApp"><Input value={editing.whatsapp || ""} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Country"><Input value={editing.country || ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></Field>
                  <Field label="Years exp."><Input type="number" value={editing.years_experience ?? ""} onChange={(e) => setEditing({ ...editing, years_experience: Number(e.target.value) })} /></Field>
                </div>
                <Field label="Specialization"><Input value={editing.specialization || ""} onChange={(e) => setEditing({ ...editing, specialization: e.target.value })} /></Field>
                <Field label="Topics (comma separated)"><Input value={Array.isArray(editing.topics) ? editing.topics.join(", ") : (editing.topics as any) || ""} onChange={(e) => setEditing({ ...editing, topics: e.target.value as any })} /></Field>
                <Field label="Avatar URL"><Input value={editing.avatar_url || ""} onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })} /></Field>
                <Field label="Bio"><Textarea rows={3} value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></Field>
                <Field label="Linked user account — grants login access">
                  <Select
                    value={editing.user_id || "__none__"}
                    onValueChange={(v) => setEditing({ ...editing, user_id: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not linked —</SelectItem>
                      {profiles.map((p) => {
                        const taken = items.find((t) => t.user_id === p.id && t.id !== editing.id);
                        return (
                          <SelectItem key={p.id} value={p.id} disabled={!!taken}>
                            {p.full_name || "(no name)"} {p.phone ? `· ${p.phone}` : ""} {taken ? `· linked to ${taken.full_name}` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </Field>
                {editing.user_id && (
                  <p className="text-[11px] text-foreground/60">
                    Saving will also grant the <code className="text-xs">teacher</code> role to this user.
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="emerald" onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Panel>
    </div>
  );
};

const LinkOrphanButton = ({
  userId, defaultName, teachers, reload,
}: { userId: string; defaultName: string; teachers: Teacher[]; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [teacherId, setTeacherId] = useState("");
  const [newName, setNewName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    if (mode === "existing") {
      if (!teacherId) { setSaving(false); return toast.error("Pick a teacher"); }
      const { error } = await supabase.from("teachers").update({ user_id: userId }).eq("id", teacherId);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      if (!newName.trim()) { setSaving(false); return toast.error("Name required"); }
      const { error } = await supabase.from("teachers").insert({ full_name: newName, user_id: userId });
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    setSaving(false); setOpen(false);
    toast.success("Linked");
    reload();
  };

  const unlinked = teachers.filter((t) => !t.user_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="emerald">Link</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Link teacher profile</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant={mode === "existing" ? "emerald" : "outline"} onClick={() => setMode("existing")}>Existing teacher</Button>
            <Button size="sm" variant={mode === "new" ? "emerald" : "outline"} onClick={() => setMode("new")}>Create new</Button>
          </div>
          {mode === "existing" ? (
            <Field label="Choose unlinked teacher">
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {unlinked.length === 0 && <SelectItem value="__none__" disabled>No unlinked teachers</SelectItem>}
                  {unlinked.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          ) : (
            <Field label="Full name">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Field>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="emerald" onClick={submit} disabled={saving}>{saving ? "Linking..." : "Link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Assignments (Teacher ↔ Student enrollment) ---------------- */
type AssignmentRow = { enrollment_id: string; teacher_id: string; assigned_at: string };

const AssignmentsPanel = () => {
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course; profile?: Profile })[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [eRes, tRes, cRes, pRes, aRes] = await Promise.all([
      supabase.from("enrollments").select("id, user_id, course_id, plan, status, created_at").order("created_at", { ascending: false }),
      supabase.from("teachers").select("*").order("full_name"),
      supabase.from("courses").select("id, title, slug, level, duration, price_monthly, description, plan"),
      supabase.from("profiles").select("id, full_name, phone, created_at"),
      supabase.from("enrollment_teachers").select("enrollment_id, teacher_id, assigned_at"),
    ]);
    if (eRes.error) toast.error(eRes.error.message);
    const courses = (cRes.data as Course[]) || [];
    const profiles = (pRes.data as Profile[]) || [];
    setEnrollments(((eRes.data as Enrollment[]) || []).map((e) => ({
      ...e,
      course: courses.find((c) => c.id === e.course_id),
      profile: profiles.find((p) => p.id === e.user_id),
    })));
    setTeachers((tRes.data as Teacher[]) || []);
    setAssignments((aRes.data as AssignmentRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const teacherOf = (enrId: string) => assignments.find((a) => a.enrollment_id === enrId);

  const assign = async (enrollmentId: string, teacherId: string) => {
    setSavingId(enrollmentId);
    // upsert (enrollment_id is primary key — one teacher per enrollment)
    const { error } = await supabase
      .from("enrollment_teachers")
      .upsert({ enrollment_id: enrollmentId, teacher_id: teacherId }, { onConflict: "enrollment_id" });
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Teacher assigned");
    load();
  };

  const unassign = async (enrollmentId: string) => {
    setSavingId(enrollmentId);
    const { error } = await supabase.from("enrollment_teachers").delete().eq("enrollment_id", enrollmentId);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Teacher unassigned");
    load();
  };

  if (loading) return <Loader />;

  const q = search.trim().toLowerCase();
  const rows = enrollments.filter((e) => {
    const a = teacherOf(e.id);
    if (filter === "assigned" && !a) return false;
    if (filter === "unassigned" && a) return false;
    if (!q) return true;
    return (
      (e.profile?.full_name || "").toLowerCase().includes(q) ||
      (e.course?.title || "").toLowerCase().includes(q)
    );
  });

  const unassignedCount = enrollments.filter((e) => !teacherOf(e.id)).length;

  return (
    <Panel
      title={`Assign teachers (${enrollments.length} enrollments · ${unassignedCount} unassigned)`}
      action={
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search student or course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56"
          />
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <p className="text-sm text-foreground/70 mb-4">
        Each enrollment can have one assigned teacher. Picking a teacher will replace any previous assignment for that enrollment.
      </p>
      <div className="space-y-2">
        {rows.map((e) => {
          const a = teacherOf(e.id);
          const currentTeacher = a ? teachers.find((t) => t.id === a.teacher_id) : null;
          return (
            <div key={e.id} className="border border-border rounded-xl p-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-sm truncate">
                  {e.profile?.full_name || "Student"} <span className="text-foreground/50">·</span>{" "}
                  <span className="text-foreground/70">{e.course?.title || "Course"}</span>
                </p>
                <p className="text-[11px] text-foreground/60">
                  Plan {e.plan} · <span className="capitalize">{e.status}</span>
                  {currentTeacher && <> · Currently: <span className="text-emerald font-medium">{currentTeacher.full_name}</span></>}
                  {!currentTeacher && <> · <span className="text-destructive font-medium">No teacher</span></>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={a?.teacher_id || ""}
                  onValueChange={(v) => assign(e.id, v)}
                  disabled={savingId === e.id}
                >
                  <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Assign teacher…" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                    {teachers.length === 0 && <SelectItem value="__none__" disabled>No teachers available</SelectItem>}
                  </SelectContent>
                </Select>
                {a && (
                  <Button size="sm" variant="ghost" onClick={() => unassign(e.id)} disabled={savingId === e.id}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-foreground/60 text-center py-6">No matching enrollments.</p>}
      </div>
    </Panel>
  );
};

/* ---------------- Courses ---------------- */
const emptyCourse: Partial<Course> = { title: "", slug: "", level: "", duration: "", price_monthly: 0, description: "", plan: "" };

const CoursesPanel = () => {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Course> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("courses").select("*").order("title");
    if (error) toast.error(error.message);
    setItems((data as Course[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim() || !editing.slug?.trim()) return toast.error("Title and slug required");
    const payload: any = {
      title: editing.title, slug: editing.slug, level: editing.level || null,
      duration: editing.duration || null, price_monthly: editing.price_monthly ? Number(editing.price_monthly) : null,
      description: editing.description || null, plan: editing.plan || null,
    };
    const res = editing.id
      ? await supabase.from("courses").update(payload).eq("id", editing.id)
      : await supabase.from("courses").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? "Course updated" : "Course created");
    setDialogOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Course deleted"); load();
  };

  if (loading) return <Loader />;

  return (
    <Panel
      title={`Courses (${items.length})`}
      action={<Button variant="emerald" onClick={() => { setEditing({ ...emptyCourse }); setDialogOpen(true); }}><Plus className="h-4 w-4" /> New course</Button>}
    >
      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="border border-border rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{c.title} <span className="text-xs text-foreground/60 font-mono">/{c.slug}</span></p>
              <p className="text-xs text-foreground/60">{c.level || "—"} · {c.duration || "—"} · {c.price_monthly ? `$${c.price_monthly}/mo` : "no price"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...c }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <ConfirmDelete onConfirm={() => remove(c.id)} label={`Delete ${c.title}?`} />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-foreground/60 text-center py-6">No courses yet.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit course" : "New course"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title *"><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
                <Field label="Slug *"><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Level"><Input value={editing.level || ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })} /></Field>
                <Field label="Duration"><Input value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></Field>
                <Field label="Price /mo"><Input type="number" value={editing.price_monthly ?? ""} onChange={(e) => setEditing({ ...editing, price_monthly: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Plan"><Input value={editing.plan || ""} onChange={(e) => setEditing({ ...editing, plan: e.target.value })} /></Field>
              <Field label="Description"><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="emerald" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
};

/* ---------------- Lessons ---------------- */
const emptyLesson: Partial<Lesson> = { title: "", summary: "", order_index: 0, duration_min: 30, course_id: "", is_published: false };

const LessonsPanel = () => {
  const [items, setItems] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [materialsLessonId, setMaterialsLessonId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [lRes, cRes] = await Promise.all([
      supabase.from("lessons").select("*").order("course_id").order("order_index"),
      supabase.from("courses").select("id, title, slug, level, duration, price_monthly, description, plan").order("title"),
    ]);
    if (lRes.error) toast.error(lRes.error.message);
    setItems((lRes.data as Lesson[]) || []);
    setCourses((cRes.data as Course[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim() || !editing.course_id) return toast.error("Title and course required");
    const payload: any = {
      title: editing.title, summary: editing.summary || null,
      order_index: Number(editing.order_index || 0),
      duration_min: Number(editing.duration_min || 30),
      course_id: editing.course_id,
      is_published: !!editing.is_published,
    };
    const res = editing.id
      ? await supabase.from("lessons").update(payload).eq("id", editing.id)
      : await supabase.from("lessons").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? "Lesson updated" : "Lesson created");
    setDialogOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lesson deleted"); load();
  };

  const filtered = courseFilter === "all" ? items : items.filter((l) => l.course_id === courseFilter);
  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title || id.slice(0, 8);

  if (loading) return <Loader />;

  return (
    <Panel
      title={`Lessons (${filtered.length})`}
      action={
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Filter course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="emerald" onClick={() => { setEditing({ ...emptyLesson, course_id: courseFilter !== "all" ? courseFilter : "" }); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New lesson
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        {filtered.map((l) => (
          <div key={l.id} className="border border-border rounded-xl p-3 flex items-center gap-3">
            <span className="font-mono text-xs text-foreground/60 w-8 text-center">{l.order_index}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate flex items-center gap-2">
                {l.title}
                {l.is_published ? (
                  <Badge variant="default" className="text-[10px]">Published</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                )}
              </p>
              <p className="text-xs text-foreground/60 truncate">{courseTitle(l.course_id)} · {l.duration_min} min</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setMaterialsLessonId(l.id)}>
                <Paperclip className="h-4 w-4" /> Materials
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...l }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <ConfirmDelete onConfirm={() => remove(l.id)} label={`Delete "${l.title}"?`} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-foreground/60 text-center py-6">No lessons.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit lesson" : "New lesson"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Course *">
                <Select value={editing.course_id || ""} onValueChange={(v) => setEditing({ ...editing, course_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Title *"><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Order"><Input type="number" value={editing.order_index ?? 0} onChange={(e) => setEditing({ ...editing, order_index: Number(e.target.value) })} /></Field>
                <Field label="Duration (min)"><Input type="number" value={editing.duration_min ?? 30} onChange={(e) => setEditing({ ...editing, duration_min: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Summary"><Textarea rows={3} value={editing.summary || ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} /></Field>
              <div className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-xs text-foreground/60">Visible to enrolled students.</p>
                </div>
                <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="emerald" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LessonMaterialsEditor
        open={!!materialsLessonId}
        onClose={() => setMaterialsLessonId(null)}
        lessonId={materialsLessonId}
        lessonTitle={items.find((l) => l.id === materialsLessonId)?.title}
      />
    </Panel>
  );
};

/* ---------------- Classes ---------------- */
type ClassFull = {
  id: string;
  enrollment_id: string;
  teacher_id: string;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  status: string;
};

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyClass: Partial<ClassFull> = {
  enrollment_id: "", teacher_id: "", starts_at: new Date().toISOString(), duration_min: 30, meeting_url: "", status: "scheduled",
};

const ClassesPanel = () => {
  const [items, setItems] = useState<ClassFull[]>([]);
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course; profile?: Profile })[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ClassFull> | null>(null);

  const load = async () => {
    setLoading(true);
    const [clsRes, eRes, cRes, tRes, pRes] = await Promise.all([
      supabase.from("classes").select("*").order("starts_at", { ascending: false }),
      supabase.from("enrollments").select("id, user_id, course_id, plan, status, created_at"),
      supabase.from("courses").select("id, title, slug, level, duration, price_monthly, description, plan"),
      supabase.from("teachers").select("*").order("full_name"),
      supabase.from("profiles").select("id, full_name, phone, created_at"),
    ]);
    if (clsRes.error) toast.error(clsRes.error.message);
    setItems((clsRes.data as ClassFull[]) || []);
    const courses = (cRes.data as Course[]) || [];
    const profiles = (pRes.data as Profile[]) || [];
    setEnrollments(((eRes.data as Enrollment[]) || []).map((e) => ({
      ...e,
      course: courses.find((c) => c.id === e.course_id),
      profile: profiles.find((p) => p.id === e.user_id),
    })));
    setTeachers((tRes.data as Teacher[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.enrollment_id || !editing.teacher_id || !editing.starts_at) {
      return toast.error("Enrollment, teacher and start time required");
    }
    const payload: any = {
      enrollment_id: editing.enrollment_id,
      teacher_id: editing.teacher_id,
      starts_at: new Date(editing.starts_at).toISOString(),
      duration_min: Number(editing.duration_min || 30),
      meeting_url: editing.meeting_url || null,
      status: editing.status || "scheduled",
    };
    const res = editing.id
      ? await supabase.from("classes").update(payload).eq("id", editing.id)
      : await supabase.from("classes").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? "Class updated" : "Class created");
    setDialogOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Class deleted"); load();
  };

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.full_name || id.slice(0, 8);
  const enrLabel = (id: string) => {
    const e = enrollments.find((x) => x.id === id);
    if (!e) return id.slice(0, 8);
    return `${e.profile?.full_name || "Student"} — ${e.course?.title || "Course"}`;
  };

  if (loading) return <Loader />;

  return (
    <Panel
      title={`Classes (${items.length})`}
      action={
        <Button variant="emerald" onClick={() => { setEditing({ ...emptyClass }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> New class
        </Button>
      }
    >
      <div className="space-y-2">
        {items.map((c) => {
          const d = new Date(c.starts_at);
          return (
            <div key={c.id} className="border border-border rounded-xl p-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{enrLabel(c.enrollment_id)}</p>
                <p className="text-xs text-foreground/60 truncate">
                  {teacherName(c.teacher_id)} · {d.toLocaleString()} · {c.duration_min} min · <span className="capitalize">{c.status}</span>
                  {c.meeting_url ? <span className="text-emerald"> · Zoom ✓</span> : <span className="text-foreground/40"> · No link</span>}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...c, starts_at: toLocalInput(c.starts_at) as any }); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDelete onConfirm={() => remove(c.id)} label="Delete this class?" />
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-foreground/60 text-center py-6">No classes scheduled.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit class" : "New class"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Enrollment (Student — Course) *">
                <Select value={editing.enrollment_id || ""} onValueChange={(v) => setEditing({ ...editing, enrollment_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select enrollment" /></SelectTrigger>
                  <SelectContent>
                    {enrollments.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.profile?.full_name || "Student"} — {e.course?.title || "Course"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Teacher *">
                <Select value={editing.teacher_id || ""} onValueChange={(v) => setEditing({ ...editing, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date & Time *">
                  <Input
                    type="datetime-local"
                    value={typeof editing.starts_at === "string" && editing.starts_at.includes("T") && !editing.starts_at.endsWith("Z")
                      ? editing.starts_at
                      : toLocalInput(editing.starts_at || new Date().toISOString())}
                    onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })}
                  />
                </Field>
                <Field label="Duration (min)">
                  <Input type="number" value={editing.duration_min ?? 30} onChange={(e) => setEditing({ ...editing, duration_min: Number(e.target.value) })} />
                </Field>
              </div>
              <Field label="Zoom Meeting URL">
                <Input placeholder="https://zoom.us/j/..." value={editing.meeting_url || ""} onChange={(e) => setEditing({ ...editing, meeting_url: e.target.value })} />
              </Field>
              <Field label="Status">
                <Select value={editing.status || "scheduled"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="emerald" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
};

/* ---------------- Helpers ---------------- */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-foreground font-medium text-xs uppercase tracking-wider">{label}</Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const Loader = () => (
  <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
);

const ConfirmDelete = ({ onConfirm, label }: { onConfirm: () => void; label: string }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{label}</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/* ---------------- Student details drawer ---------------- */
type ClassRow = { id: string; starts_at: string; status: string; duration_min: number; enrollment_id: string };
type LessonProgressRow = { id: string; lesson_id: string; completed_at: string; lesson?: { title: string; course_id: string } };

const StudentDetailsDrawer = ({
  open, onClose, profile,
}: { open: boolean; onClose: () => void; profile: Profile | null }) => {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course })[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);

  useEffect(() => {
    if (!open || !profile) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const eRes = await supabase
        .from("enrollments")
        .select("id, user_id, course_id, plan, status, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      const enr = (eRes.data as Enrollment[]) || [];
      const courseIds = Array.from(new Set(enr.map((e) => e.course_id)));
      const enrIds = enr.map((e) => e.id);

      const [cRes, clsRes, lpRes] = await Promise.all([
        courseIds.length
          ? supabase.from("courses").select("*").in("id", courseIds)
          : Promise.resolve({ data: [] as Course[] } as any),
        enrIds.length
          ? supabase.from("classes").select("id, starts_at, status, duration_min, enrollment_id").in("enrollment_id", enrIds).order("starts_at", { ascending: false })
          : Promise.resolve({ data: [] as ClassRow[] } as any),
        supabase.from("lesson_progress").select("id, lesson_id, completed_at, lesson:lessons(title, course_id)").eq("user_id", profile.id).order("completed_at", { ascending: false }).limit(50),
      ]);

      if (cancelled) return;
      const courses = (cRes.data as Course[]) || [];
      setEnrollments(enr.map((e) => ({ ...e, course: courses.find((c) => c.id === e.course_id) })));
      setClasses((clsRes.data as ClassRow[]) || []);
      setProgress((lpRes.data as any) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, profile]);

  const attended = classes.filter((c) => c.status === "completed").length;
  const upcoming = classes.filter((c) => c.status === "scheduled" && new Date(c.starts_at) > new Date()).length;
  const cancelled = classes.filter((c) => c.status === "cancelled").length;
  const total = classes.length;
  const attendanceRate = total ? Math.round((attended / total) * 100) : 0;

  const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "active" || s === "completed" || s === "scheduled") return "default";
    if (s === "pending") return "secondary";
    if (s === "cancelled") return "destructive";
    return "outline";
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-card">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{profile?.full_name || "Student"}</SheetTitle>
          <SheetDescription>
            {profile?.phone || "No phone"} · Joined {profile ? new Date(profile.created_at).toLocaleDateString() : ""}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="py-12"><Loader /></div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Subscription / Payment */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                <CreditCard className="h-4 w-4 text-gold-deep" /> Subscription & Payment
              </h3>
              {enrollments.length === 0 ? (
                <p className="text-sm text-foreground/60">No active subscriptions.</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((e) => (
                    <div key={e.id} className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{e.course?.title || "Course"}</p>
                        <p className="text-xs text-foreground/60">
                          Plan: <span className="font-mono">{e.plan}</span>
                          {e.course?.price_monthly ? ` · $${e.course.price_monthly}/mo` : ""}
                        </p>
                      </div>
                      <Badge variant={statusVariant(e.status)} className="capitalize">{e.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Enrolled Courses */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                <BookOpen className="h-4 w-4 text-gold-deep" /> Enrolled Courses ({enrollments.length})
              </h3>
              {enrollments.length === 0 ? (
                <p className="text-sm text-foreground/60">No enrollments.</p>
              ) : (
                <ul className="space-y-2">
                  {enrollments.map((e) => (
                    <li key={e.id} className="text-sm border-l-2 border-gold-deep/40 pl-3">
                      <p className="font-medium">{e.course?.title || e.course_id.slice(0, 8)}</p>
                      <p className="text-xs text-foreground/60">
                        {e.course?.level || "—"} · {e.course?.duration || "—"} · enrolled {new Date(e.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Attendance */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                <CalendarCheck className="h-4 w-4 text-gold-deep" /> Attendance
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <Stat label="Rate" value={`${attendanceRate}%`} />
                <Stat label="Attended" value={attended} />
                <Stat label="Upcoming" value={upcoming} />
                <Stat label="Cancelled" value={cancelled} />
              </div>
              {classes.length === 0 ? (
                <p className="text-sm text-foreground/60">No classes scheduled.</p>
              ) : (
                <ul className="space-y-1.5 max-h-56 overflow-y-auto">
                  {classes.slice(0, 10).map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-sm border-b border-border/60 py-1.5">
                      <span className="text-foreground/80">{new Date(c.starts_at).toLocaleString()}</span>
                      <Badge variant={statusVariant(c.status)} className="capitalize">{c.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Assignments / Progress */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                <ClipboardList className="h-4 w-4 text-gold-deep" /> Assignments & Lesson Progress
              </h3>
              {progress.length === 0 ? (
                <p className="text-sm text-foreground/60">No completed lessons yet.</p>
              ) : (
                <ul className="space-y-1.5 max-h-56 overflow-y-auto">
                  {progress.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm border-b border-border/60 py-1.5">
                      <span className="text-foreground/80 truncate pr-2">{p.lesson?.title || p.lesson_id.slice(0, 8)}</span>
                      <span className="text-xs text-foreground/60 shrink-0">{new Date(p.completed_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border border-border rounded-lg p-2 text-center">
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-foreground/60">{label}</p>
  </div>
);

export default Admin;
