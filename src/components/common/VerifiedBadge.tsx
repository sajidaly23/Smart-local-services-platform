import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerifiedBadgeProps {
  status: "verified" | "pending" | "rejected";
  showText?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  status,
  showText = true,
}) => {
  if (status === "verified") {
    return (
      <Badge variant="teal" size="sm">
        <CheckCircle2 className="h-3.5 w-3.5 text-tealbrand-600 shrink-0" />
        {showText && <span>Verified Specialist</span>}
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge variant="warning" size="sm">
        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        {showText && <span>Verification Pending</span>}
      </Badge>
    );
  }

  return (
    <Badge variant="danger" size="sm">
      <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
      {showText && <span>Unverified</span>}
    </Badge>
  );
};

