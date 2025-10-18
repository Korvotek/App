import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}

interface TableShimmerProps {
  rows?: number;
  columns?: number;
}

export function TableShimmer({ rows = 5, columns = 6 }: TableShimmerProps) {
  return (
    <div className="rounded-lg border-2 border-border bg-white shadow-lg overflow-hidden">
      
      <div className="bg-gray-50 border-b-2 border-gray-200">
        <div className="flex h-12">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="flex-1 px-4 py-3 border-r border-gray-200 last:border-r-0 flex items-center">
              <Shimmer className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
      
      
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex h-16 border-b border-gray-200 last:border-b-0">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="flex-1 px-4 py-3 border-r border-gray-200 last:border-r-0 flex items-center">
              <Shimmer className="h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
