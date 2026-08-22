import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function SlaStatusBadge({ status, daysPending = 0 }) {
  const isBreached = status === "Pending" && daysPending > 2;

  if (status === "Approved") {
    return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Approved</Badge>;
  }

  if (status === "In Review") {
    return <Badge className="bg-primary/10 text-primary border border-primary/20">In Review</Badge>;
  }

  if (isBreached) {
    return (
      <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase tracking-wide">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>SLA Breach</span>
      </div>
    );
  }

  return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</Badge>;
}
