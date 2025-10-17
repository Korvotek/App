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
      console.error("Error signing out on client:", error);
    }

    try {
      const response = await fetch("/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const { message } = await response.json();
        console.error("Failed to clear server session:", message);
      }
    } catch (error) {
      console.error("Error calling server signout route:", error);
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
