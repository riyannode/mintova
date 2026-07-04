"use client";

import { ActivityList } from "@/components/ActivityList";
import { getActivities } from "@/lib/activity-store";
import { useState, useEffect } from "react";
import type { ActivityEntry } from "@/lib/activity-store";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  return (
    <div className="w-full max-w-[420px]">
      <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Activity</h2>
      <ActivityList activities={activities} />
    </div>
  );
}
