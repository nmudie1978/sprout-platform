import { Skeleton } from "@/components/ui/skeleton";

export default function CareerAdvisorLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Chat area */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="space-y-2 max-w-[60%]">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg mt-4" />
      </div>
    </div>
  );
}
