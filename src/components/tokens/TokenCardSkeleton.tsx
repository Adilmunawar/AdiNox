
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const TokenCardSkeleton = () => (
  <Card className="relative overflow-hidden border-border/30 bg-card/70 backdrop-blur-sm p-4">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
    <div className="p-3 bg-secondary/20 border border-border/20 rounded-xl">
      <Skeleton className="h-8 w-40" />
    </div>
    <div className="mt-3 flex items-center justify-between">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  </Card>
);

export default TokenCardSkeleton;
