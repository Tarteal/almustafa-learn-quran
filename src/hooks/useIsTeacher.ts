import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";

export const useIsTeacher = () => {
  const { user, loading: authLoading } = useAuth();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!user) { setTeacherId(null); setLoading(false); return; }
      const { data } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      setTeacherId((data as any)?.id ?? null);
      setLoading(false);
    };
    if (!authLoading) check();
    return () => { active = false; };
  }, [user, authLoading]);

  return { isTeacher: !!teacherId, teacherId, loading: loading || authLoading };
};
