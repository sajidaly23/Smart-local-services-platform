import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = "Loading...",
  className = "min-h-[200px]",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <span className="text-sm font-medium text-slate-500">{message}</span>
    </div>
  );
};

