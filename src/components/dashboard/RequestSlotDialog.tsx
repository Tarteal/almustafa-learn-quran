import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CalendarPlus } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";

type Props = {
  enrollmentId: string;
  teacherId: string;
  originalClassId?: string;
  defaultStartsAt?: string; // ISO
  defaultDurationMin?: number;
};

const schema = z.object({
  date: z.date({ required_error: "Date required" }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time required"),
  duration: z.number().int().min(15).max(180),
  note: z.string().max(500).optional(),
});

const RequestSlotDialog = ({
  enrollmentId,
  teacherId,
  originalClassId,
  defaultStartsAt,
  defaultDurationMin = 30,
}: Props) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(defaultDurationMin);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const d = defaultStartsAt ? new Date(defaultStartsAt) : new Date(Date.now() + 24 * 3600_000);
      setDate(d);
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setDuration(defaultDurationMin);
      setNote("");
    }
  }, [open, defaultStartsAt, defaultDurationMin]);

  const onSubmit = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ date, time, duration, note });
    if (!parsed.success || !date) {
      toast.error(t("req.validation"));
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const requested = new Date(date);
    requested.setHours(h, m, 0, 0);

    setSubmitting(true);
    const { error } = await supabase.from("class_requests").insert({
      user_id: user.id,
      enrollment_id: enrollmentId,
      teacher_id: teacherId,
      original_class_id: originalClassId ?? null,
      requested_at: requested.toISOString(),
      duration_min: duration,
      note: note.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("req.error"));
      return;
    }
    toast.success(t("req.success"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CalendarPlus className="h-4 w-4" /> {t("req.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("req.title")}</DialogTitle>
          <DialogDescription>{t("req.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("req.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{t("req.date.pick")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="req-time">{t("req.time")}</Label>
              <Input id="req-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-dur">{t("req.duration")}</Label>
              <Input
                id="req-dur"
                type="number"
                min={15}
                max={180}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 30)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-note">{t("req.note")}</Label>
            <Textarea
              id="req-note"
              placeholder={t("req.note.ph")}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            {t("req.cancel")}
          </Button>
          <Button variant="emerald" onClick={onSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? t("req.submitting") : t("req.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestSlotDialog;
