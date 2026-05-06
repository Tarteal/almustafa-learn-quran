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
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user ?? user;

      if (!currentUser) {
        if (!active) return;
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: currentUser.id,
        _role: "admin",
      });

      const admin = !error && data === true;

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
