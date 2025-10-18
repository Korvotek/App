"use client";

import { supabase } from "@/lib/supabase/client";

export const auth = {
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
    }

    try {
      await fetch("/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
    }
  },

  getUser: async () => {
    return await supabase.auth.getUser();
  },

  getSession: async () => {
    return await supabase.auth.getSession();
  },

  onAuthStateChange: (
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
