import React from "react";
import { Card } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function ApplicationCard({ application, isSelected, onClick, statusBadge }) {
  return (
    <Card
      onClick={onClick}
      className={`p-5 cursor-pointer transition-all border ${
        isSelected
          ? "border-primary bg-accent/50 shadow-sm"
          : "border-border bg-card hover:bg-accent/20"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-primary font-bold">{application.id}</span>
        {statusBadge}
      </div>
      <h3 className="font-semibold text-foreground text-sm line-clamp-1">{application.title}</h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
        <Building className="h-3 w-3" />
        <span>{application.sector}</span>
      </div>
    </Card>
  );
}
