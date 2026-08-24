import { createClient } from "@/lib/supabase/client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";


// ============================================================
// AUTHENTICATED REQUEST HEADERS
// ============================================================

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Failed to get Supabase session:",
      error
    );
  }

  const accessToken =
    data.session?.access_token;

  if (!accessToken) {
    throw new Error(
      "You must be signed in to use Deep Research."
    );
  }

  return {
    Authorization:
      `Bearer ${accessToken}`,
  };
}


// ============================================================
// CREATE NEW RESEARCH CONVERSATION
// ============================================================

export async function createResearch(
  query: string,
  pdfFile?: File | null
) {

  const formData =
    new FormData();

  formData.append(
    "query",
    query
  );

  if (pdfFile) {

    formData.append(
      "pdf",
      pdfFile
    );
  }

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${API_BASE}/research/`,
      {
        method: "POST",

        headers,

        body: formData,
      }
    );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `Failed to create research: ${response.status} ${text}`
    );
  }

  return response.json();
}


// ============================================================
// SEND FOLLOW-UP QUESTION
// ============================================================

export async function sendResearchQuestion(
  chatId: string,
  query: string
) {

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${API_BASE}/research/${encodeURIComponent(
        chatId
      )}/question`,
      {
        method: "POST",

        headers: {
          ...headers,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          query,
        }),
      }
    );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `Failed to send research question: ${response.status} ${text}`
    );
  }

  return response.json();
}


// ============================================================
// GET RESEARCH JOB
// ============================================================

export async function getResearch(
  jobId: string
) {

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${API_BASE}/research/${encodeURIComponent(
        jobId
      )}`,
      {
        method: "GET",

        headers,

        cache: "no-store",
      }
    );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `Failed to get research: ${response.status} ${text}`
    );
  }

  return response.json();
}


// ============================================================
// GET RESEARCH HISTORY
// ============================================================

export async function getResearchHistory() {

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${API_BASE}/research/`,
      {
        method: "GET",

        headers,

        cache: "no-store",
      }
    );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `Failed to get research history: ${response.status} ${text}`
    );
  }

  return response.json();
}
