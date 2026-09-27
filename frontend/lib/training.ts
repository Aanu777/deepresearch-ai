import {
  createClient,
} from "@/lib/supabase/client";

import {
  secureFetch,
} from "@/lib/secure-transport";


const API_BASE =
  (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1"
  ).replace(
    /\/$/,
    ""
  );


async function getAuthHeaders():
  Promise<HeadersInit> {

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
      "You must be signed in to manage training data."
    );
  }

  return {
    Authorization:
      `Bearer ${accessToken}`,
  };
}


async function readError(
  response: Response
) {
  try {
    const payload =
      await response.json();

    if (
      typeof payload?.detail ===
        "string"
    ) {
      return payload.detail;
    }

  } catch {
    // Fall through.
  }

  return (
    `Training request failed (${response.status}).`
  );
}


export type TrainingSample = {
  id: string;
  source_type:
    | "conversation"
    | "research";
  prompt: string;
  target_response: string;
  feedback_reason:
    string | null;
  quality_score: number;
  redaction_count: number;
  created_at: string;
};


export type TrainingOverview = {
  total_examples: number;
  conversation_examples: number;
  research_examples: number;
  redactions: number;
  average_quality: number;
  samples:
    TrainingSample[];
};


export type TrainingExport = {
  manifest: {
    schema_version: number;
    format:
      | "sft"
      | "preference";
    total_examples: number;
    train_examples: number;
    validation_examples: number;
    redactions: number;
    generated_at: string;
  };
  train_jsonl: string;
  validation_jsonl: string;
};


export async function getTrainingOverview():
  Promise<TrainingOverview> {

  const headers =
    await getAuthHeaders();

  const response =
    await secureFetch(
      `${API_BASE}/training/`,
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

  return response.json();
}


export async function exportTrainingDataset(
  format:
    | "sft"
    | "preference"
): Promise<TrainingExport> {

  const headers =
    await getAuthHeaders();

  const response =
    await secureFetch(
      (
        `${API_BASE}/training/export`
        + `?format=${encodeURIComponent(
          format
        )}`
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

  return response.json();
}


export async function deleteTrainingExample(
  exampleId: string
) {
  const headers =
    await getAuthHeaders();

  const response =
    await secureFetch(
      (
        `${API_BASE}/training/`
        + encodeURIComponent(
          exampleId
        )
      ),
      {
        method:
          "DELETE",
        headers,
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


export async function clearTrainingDataset() {
  const headers =
    await getAuthHeaders();

  const response =
    await secureFetch(
      `${API_BASE}/training/`,
      {
        method:
          "DELETE",
        headers,
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
