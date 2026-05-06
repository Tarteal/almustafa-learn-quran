import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";

export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!user) {
        if (!active) return;
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);

      // Primary: security-definer RPC (bypasses RLS edge cases)
      const rpc = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin" as any,
      });

      let admin = false;
      if (!rpc.error && rpc.data === true) {
        admin = true;
      } else {
        // Fallback: direct table read
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        admin = !!data;
      }

      if (!active) return;
      setIsAdmin(admin);
      setLoading(false);
    };

    if (authLoading) return;
    check();

    // Re-check whenever auth state changes (sign-in, token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
