import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-56 w-full rounded-2xl sm:h-72" />
      <div className="space-y-4">
        <Skeleton className="h-7 w-52" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-6 w-3/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
