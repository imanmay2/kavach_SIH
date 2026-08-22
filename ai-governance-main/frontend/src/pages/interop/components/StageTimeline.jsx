import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building, CheckCircle2 } from "lucide-react";

export default function StageTimeline({ stages = [] }) {
  return (
    <div className="relative pl-6 border-l-2 border-border ml-4 space-y-8">
      {stages.map((stage, idx) => {
        const isCompleted = stage.status === "completed";
        const isCurrent = stage.status === "current";
        
        return (
          <div key={idx} className="relative">
            {/* Indicator Dot */}
            <div
              className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? "bg-background border-emerald-500 text-emerald-500"
                  : isCurrent
                  ? "bg-primary border-primary text-primary-foreground animate-pulse"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">{idx + 1}</span>
              )}
            </div>

            {/* Stage Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pl-3">
              <div>
                <h4 className={`font-semibold text-base transition-colors ${
                  isCompleted ? "text-foreground" : isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                }`}>
                  {stage.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Building className="h-3 w-3" />
                  <span>{stage.dept}</span>
                </div>
              </div>
              <div className="text-right">
                {stage.date ? (
                  <Badge variant="outline" className="border-border bg-muted/50 text-foreground">
                    {stage.date}
                  </Badge>
                ) : isCurrent ? (
                  <Badge className="bg-primary/10 text-primary border border-primary/20">Active Stage</Badge>
                ) : (
                  <Badge variant="outline" className="border-border text-muted-foreground">Pending</Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
