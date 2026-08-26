import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando produto">
      <Skeleton className="h-5 w-72" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
