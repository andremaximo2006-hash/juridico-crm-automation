import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200",
        className
      )}
    />
  );
}

export function KanbanSkeleton() {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col w-64">
            <div className="flex items-center gap-2 mb-3 px-1 py-2 rounded-lg bg-slate-50">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="ml-auto h-5 w-6 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                <div key={j} className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <div className="flex justify-end pt-1 border-t border-slate-100">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100">
        <div className="flex gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i === 0 ? "w-32" : i === cols - 1 ? "w-20 ml-auto" : "w-24"}`} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className={`h-4 ${j === 0 ? "w-36" : j === cols - 1 ? "w-16 ml-auto" : "w-28"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
