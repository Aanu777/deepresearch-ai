"use client";

import { useEffect, useState } from "react";
import TimelineItem from "./TimelineItem";

type TimelineEvent = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const demoEvents: TimelineEvent[] = [
  {
    id: 1,
    title: "Planner",
    description: "Creating research strategy...",
    completed: true,
  },
  {
    id: 2,
    title: "Searcher",
    description: "Searching academic sources...",
    completed: true,
  },
  {
    id: 3,
    title: "Reflection",
    description: "Comparing evidence...",
    completed: false,
  },
  {
    id: 4,
    title: "Writer",
    description: "Preparing final report...",
    completed: false,
  },
];

export default function AgentTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    setEvents([]);

    demoEvents.forEach((event, i) => {
      setTimeout(() => {
        setEvents((prev) => [...prev, event]);
      }, i * 700);
    });
  }, []);

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <TimelineItem
          key={event.id}
          title={event.title}
          description={event.description}
          completed={event.completed}
        />
      ))}
    </div>
  );
}