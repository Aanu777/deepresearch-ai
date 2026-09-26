import {
  createClient,
} from "@/lib/supabase/client";


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


export async function getMemories():
  Promise<UserMemory[]> {

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "user_memories"
      )
      .select(
        [
          "id",
          "kind",
          "content",
          "confidence",
          "importance",
          "source_type",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "importance",
        {
          ascending:
            false,
        }
      )
      .order(
        "updated_at",
        {
          ascending:
            false,
        }
      )
      .limit(
        200
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (
    data ??
    []
  ) as UserMemory[];
}


export async function deleteMemory(
  memoryId: string
) {
  const supabase =
    createClient();

  const {
    error,
  } =
    await supabase
      .from(
        "user_memories"
      )
      .delete()
      .eq(
        "id",
        memoryId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }
}


export async function clearMemories() {
  const supabase =
    createClient();

  const {
    error,
  } =
    await supabase
      .from(
        "user_memories"
      )
      .delete()
      .eq(
        "is_active",
        true
      );

  if (error) {
    throw new Error(
      error.message
    );
  }
}
