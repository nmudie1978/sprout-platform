import type { Career } from "@/lib/career-pathways";

export interface DemoProps {
  careers: Career[];
}

export interface DemoMeta {
  id: string;
  name: string;
  philosophy: string;
  tone: string;
}
