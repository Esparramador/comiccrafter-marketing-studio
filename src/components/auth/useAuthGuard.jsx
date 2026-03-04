import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Auth guard hook.
 * Returns { user, loading, isAdmin }
 * If not authenticated, redirects to login automatically (base44 handles this).
 * Use `isAdmin` to gate admin-only content.
 */
const ADMIN_EMAIL = "sadiagiljoan@gmail.com";

export function useAuthGuard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => {
        if (!u) {
          base44.auth.redirectToLogin(window.location.pathname);
        } else {
          setUser(u);
        }
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.pathname);
      })
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "admin" || user?.email === ADMIN_EMAIL;

  return { user, loading, isAdmin };
}