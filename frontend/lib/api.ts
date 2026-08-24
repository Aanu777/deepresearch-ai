import axios from "axios";

import { createClient } from "@/lib/supabase/client";


// ============================================================
// API CLIENT
// ============================================================

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1",
});


// ============================================================
// AUTH INTERCEPTOR
// ============================================================
//
// Automatically attaches the current Supabase access token
// to every request going to the FastAPI backend.
//
// This is what allows FastAPI to identify:
//
//     User A → User A's chats
//     User B → User B's chats
//
// ============================================================

api.interceptors.request.use(
  async (config) => {

    try {

      const supabase =
        createClient();

      const {
        data,
      } =
        await supabase.auth.getSession();

      const accessToken =
        data.session?.access_token;

      if (accessToken) {

        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }

    } catch (error) {

      console.error(
        "Failed to attach Supabase access token:",
        error
      );
    }

    return config;
  }
);