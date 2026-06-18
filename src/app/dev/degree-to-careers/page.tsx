"use client";

import { useState } from "react";
import type { Career } from "@/lib/career-pathways";
import { DegreeToCareers } from "@/components/discovery/degree-to-careers";

export default function Dev() {
  const [picked, setPicked] = useState<Career | null>(null);
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <DegreeToCareers onOpen={setPicked} defaultOpenFieldId="computer-science-software" />
      {picked && <p className="text-sm text-muted-foreground">Clicked: {picked.title}</p>}
    </div>
  );
}
