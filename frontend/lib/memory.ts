import {
  createClient,
} from "@/lib/supabase/client";


const SUPABASE_URL =
  (
    process.env
      .NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).replace(
    /\/$/,
    ""
  );

const SUPABASE_KEY =
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";


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


async function authHeaders() {
  if (
    !SUPABASE_URL ||
    !SUPABASE_KEY
  ) {
    throw new Error(
      "Supabase is not configured."
    );
  }

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

  return {
    apikey:
      SUPABASE_KEY,

    Authorization:
      `Bearer ${accessToken}`,

    "Content-Type":
      "application/json",
  };
}


async function readError(
  response: Response
) {
  try {
    const payload =
      await response.json();

    if (
      typeof payload?.message ===
        "string"
    ) {
      return payload.message;
    }

    if (
      typeof payload?.error ===
        "string"
    ) {
      return payload.error;
    }

  } catch {
    // Fall through.
  }

  return (
    `Memory request failed (${response.status}).`
  );
}


export async function getMemories():
  Promise<UserMemory[]> {

  const headers =
    await authHeaders();

  const params =
    new URLSearchParams({
      select:
        "id,kind,content,confidence,importance,source_type,created_at,updated_at",

      is_active:
        "eq.true",

      order:
        "importance.desc,updated_at.desc",

      limit:
        "200",
    });

  const response =
    await fetch(
      (
        `${SUPABASE_URL}/rest/v1/user_memories?`
        + params.toString()
      ),
      {
        headers,
        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await readError(
        response
      )
    );
  }

  const payload =
    await response.json();

  return Array.isArray(
    payload
  )
    ? payload as UserMemory[]
    : [];
}


export async function deleteMemory(
  memoryId: string
) {
  const headers =
    await authHeaders();

  const response =
    await fetch(
      (
        `${SUPABASE_URL}/rest/v1/user_memories`
        + `?id=eq.${encodeURIComponent(
          memoryId
        )}`
      ),
      {
        method:
          "DELETE",

        headers: {
          ...headers,
          Prefer:
            "return=minimal",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      await readError(
        response
      )
    );
  }
}


export async function clearMemories() {
  const headers =
    await authHeaders();

  const response =
    await fetch(
      (
        `${SUPABASE_URL}/rest/v1/user_memories`
        + "?is_active=eq.true"
      ),
      {
        method:
          "DELETE",

        headers: {
          ...headers,
          Prefer:
            "return=minimal",
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      await readError(
        response
      )
    );
  }
}
