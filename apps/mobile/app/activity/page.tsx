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
    <div className="w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-4">Activity</h2>
      <ActivityList activities={activities} />
    </div>
  );
}
