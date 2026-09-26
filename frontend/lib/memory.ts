import {
  createClient,
} from "@/lib/supabase/client";

import {
  secureFetch,
} from "@/lib/secure-transport";


const API_URL =
  (
    process.env
      .NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1"
  ).replace(
    /\/$/,
    ""
  );


export type UserMemory = {
  id: string;
  kind:
    | "preference"
    | "correction"
    | "profile"
    | "project"
    | "goal"
    | "fact";
  content: string;
  confidence: number;
  importance: number;
  source_type:
    | "conversation"
    | "research"
    | "manual";
  created_at: string;
  updated_at: string;
};


async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
) {
  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .getSession();

  if (error) {
    throw new Error(
      error.message
    );
  }

  const accessToken =
    data.session
      ?.access_token;

  if (!accessToken) {
    throw new Error(
      "You are not signed in."
    );
  }

  const headers =
    new Headers(
      options.headers
    );

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`
  );

  const response =
    await secureFetch(
      `${API_URL}/memory${path}`,
      {
        ...options,
        headers,
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await readApiError(
        response
      )
    );
  }

  return response;
}


async function readApiError(
  response: Response
) {
  try {
    const data =
      await response.json();

    if (
      typeof data?.detail ===
      "string"
    ) {
      return data.detail;
    }

  } catch {
    // Fall through to generic message.
  }

  return (
    `Memory request failed (${response.status}).`
  );
}


export async function getMemories():
  Promise<UserMemory[]> {

  const response =
    await authenticatedFetch(
      "/"
    );

  const data =
    await response.json();

  return Array.isArray(
    data?.memories
  )
    ? data.memories
    : [];
}


export async function deleteMemory(
  memoryId: string
) {
  await authenticatedFetch(
    `/${encodeURIComponent(
      memoryId
    )}`,
    {
      method: "DELETE",
    }
  );
}


export async function clearMemories() {
  await authenticatedFetch(
    "/",
    {
      method: "DELETE",
    }
  );
}
