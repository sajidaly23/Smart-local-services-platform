import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalReviews,
  size = "md",
  showValue = true,
  interactive = false,
  onRate,
}) => {
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-semibold",
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = rating >= starIndex;
          const isPartial = !isFilled && rating > starIndex - 1;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starIndex)}
              className={cn(
                "p-0.5 transition-transform",
                interactive && "hover:scale-125 cursor-pointer focus:outline-none"
              )}
            >
              <Star
                className={cn(
                  iconSizes[size],
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : isPartial
                    ? "fill-amber-200 text-amber-400"
                    : "fill-slate-100 text-slate-300"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("text-slate-700 font-medium", textSizes[size])}>
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className={cn("text-slate-400", textSizes[size])}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

