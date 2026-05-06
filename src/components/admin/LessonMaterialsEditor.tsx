import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Upload, Video, FileText, Music, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type MaterialKind = "video" | "pdf" | "audio" | "link";
export type LessonMaterial = {
  id: string;
  lesson_id: string;
  kind: MaterialKind;
  title: string;
  url: string;
  storage_path: string | null;
  order_index: number;
  is_published: boolean;
};

const BUCKET = "lesson-materials";

const kindIcon = (k: MaterialKind) => {
  if (k === "video") return <Video className="h-4 w-4" />;
  if (k === "pdf") return <FileText className="h-4 w-4" />;
  if (k === "audio") return <Music className="h-4 w-4" />;
  return <LinkIcon className="h-4 w-4" />;
};

const acceptFor = (k: MaterialKind) => {
  if (k === "video") return "video/*";
  if (k === "pdf") return "application/pdf";
  if (k === "audio") return "audio/*";
  return undefined;
};

interface Props {
  open: boolean;
  onClose: () => void;
  lessonId: string | null;
  lessonTitle?: string;
}

export const LessonMaterialsEditor = ({ open, onClose, lessonId, lessonTitle }: Props) => {
  const [items, setItems] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // form state
  const [kind, setKind] = useState<MaterialKind>("video");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!lessonId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("lesson_materials")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
    if (error) toast.error(error.message);
    setItems((data as LessonMaterial[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open && lessonId) {
      load();
      setKind("video"); setTitle(""); setUrl("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lessonId]);

  const addLink = async () => {
    if (!lessonId) return;
    if (!title.trim() || !url.trim()) return toast.error("Title and URL required");
    const nextOrder = (items[items.length - 1]?.order_index ?? -1) + 1;
    const { error } = await supabase.from("lesson_materials").insert({
      lesson_id: lessonId, kind, title: title.trim(), url: url.trim(), order_index: nextOrder, is_published: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Material added");
    setTitle(""); setUrl("");
    load();
  };

  const handleFileUpload = async (file: File) => {
    if (!lessonId) return;
    if (!title.trim()) return toast.error("Set a title before uploading");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${lessonId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const nextOrder = (items[items.length - 1]?.order_index ?? -1) + 1;
      const { error } = await supabase.from("lesson_materials").insert({
        lesson_id: lessonId, kind, title: title.trim(), url: pub.publicUrl, storage_path: path,
        order_index: nextOrder, is_published: true,
      });
      if (error) throw error;
      toast.success("File uploaded");
      setTitle(""); setUrl("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (m: LessonMaterial) => {
    if (m.storage_path) {
      await supabase.storage.from(BUCKET).remove([m.storage_path]);
    }
    const { error } = await supabase.from("lesson_materials").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const togglePublished = async (m: LessonMaterial) => {
    const { error } = await supabase.from("lesson_materials").update({ is_published: !m.is_published }).eq("id", m.id);
    if (error) return toast.error(error.message);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const a = items[idx];
    const b = items[idx + dir];
    if (!a || !b) return;
    // swap order_index values
    await Promise.all([
      supabase.from("lesson_materials").update({ order_index: b.order_index }).eq("id", a.id),
      supabase.from("lesson_materials").update({ order_index: a.order_index }).eq("id", b.id),
    ]);
    load();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-card">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Lesson materials</SheetTitle>
          <SheetDescription>{lessonTitle || "Attach video, PDF, audio or external links in order."}</SheetDescription>
        </SheetHeader>

        {/* Add new material */}
        <div className="mt-6 border border-border rounded-xl p-4 space-y-3 bg-background/50">
          <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">Add material</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as MaterialKind)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="link">External link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro video" />
            </div>
          </div>

          {kind === "link" ? (
            <div>
              <Label className="text-xs">URL</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                <Button variant="emerald" onClick={addLink}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-xs">Upload file or paste URL</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                <Input
                  ref={fileRef}
                  type="file"
                  accept={acceptFor(kind)}
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste a hosted URL" />
                <Button variant="outline" onClick={addLink} disabled={uploading}>
                  <Plus className="h-4 w-4" /> Add URL
                </Button>
              </div>
              {uploading && <p className="text-xs text-foreground/60 flex items-center gap-2 mt-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
            </div>
          )}
        </div>

        {/* List */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold mb-3">
            Materials ({items.length})
          </p>
          {loading ? (
            <div className="grid place-items-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <p className="text-sm text-foreground/60 text-center py-6">No materials yet.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((m, idx) => (
                <li key={m.id} className="border border-border rounded-lg p-3 flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === 0} onClick={() => move(idx, -1)}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-foreground/70">{kindIcon(m.kind)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.title}</p>
                    <p className="text-xs text-foreground/60 truncate flex items-center gap-1">
                      <Badge variant="outline" className="capitalize text-[10px]">{m.kind}</Badge>
                      <a href={m.url} target="_blank" rel="noreferrer" className="hover:underline truncate inline-flex items-center gap-1">
                        {m.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Switch checked={m.is_published} onCheckedChange={() => togglePublished(m)} />
                      <span className="text-[10px] uppercase tracking-wider text-foreground/60">
                        {m.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{m.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>This removes the material and any uploaded file.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(m)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LessonMaterialsEditor;
