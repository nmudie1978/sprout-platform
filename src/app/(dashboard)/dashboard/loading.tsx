import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-[100vh] bg-[#0c0f1a] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-48 bg-slate-800/50" />
          <Skeleton className="h-8 w-28 rounded-2xl bg-slate-800/50" />
        </div>

        {/* Journey hero */}
        <div className="rounded-3xl bg-slate-800/30 border border-slate-700/30 p-6 mb-6">
          <div className="flex items-center gap-8">
            <Skeleton className="w-24 h-24 rounded-full bg-slate-700/40 shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-40 bg-slate-700/40" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-1.5 rounded-full bg-slate-700/40" />
                ))}
              </div>
              <Skeleton className="h-3 w-48 bg-slate-700/40" />
            </div>
          </div>
        </div>

        {/* Primary cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl bg-slate-800/30 border border-slate-700/30 p-5">
              <Skeleton className="w-10 h-10 rounded-2xl bg-slate-700/40 mb-3" />
              <Skeleton className="h-4 w-28 bg-slate-700/40 mb-2" />
              <Skeleton className="h-3 w-full bg-slate-700/40 mb-4" />
              <Skeleton className="h-3 w-24 bg-slate-700/40" />
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-3xl bg-slate-800/30 border border-slate-700/30 p-4 space-y-3">
              <Skeleton className="h-4 w-32 bg-slate-700/40" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 rounded-xl bg-slate-700/40" />
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-slate-800/30 border border-slate-700/30 p-4 space-y-3">
            <Skeleton className="h-4 w-24 bg-slate-700/40" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 rounded-xl bg-slate-700/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
