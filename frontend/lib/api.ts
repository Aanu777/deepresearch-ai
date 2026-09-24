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
// This allows FastAPI to identify and authorize the
// currently signed-in user.
//
// ============================================================

api.interceptors.request.use(
  async (config) => {
    try {
      const supabase =
        createClient();

      const {
        data,
        error,
      } =
        await supabase.auth.getSession();

      if (error) {
        console.error(
          "Failed to get Supabase session:",
          error
        );
      }

      const accessToken =
        data.session?.access_token;

      if (accessToken) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }

      return config;
    } catch (error) {
      console.error(
        "Failed to attach Supabase access token:",
        error
      );

      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// Keeps API errors visible and consistent while still allowing
// the calling component/context to handle the actual error.
//
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error?.response?.status;

    const detail =
      error?.response?.data?.detail;

    if (status) {
      console.error(
        `API request failed (${status}):`,
        detail ||
          error.message
      );
    }

    return Promise.reject(error);
  }
);