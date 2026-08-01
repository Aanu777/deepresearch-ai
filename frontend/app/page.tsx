"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    api.get("/")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("Backend Offline"));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">
        DeepResearch AI
      </h1>

      <p className="text-xl">
        {message}
      </p>
    </main>
  );
}