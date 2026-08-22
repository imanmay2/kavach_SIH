import React from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function ConsentFieldToggle({ field, isGranted, onToggle }) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
        isGranted 
          ? "bg-accent/30 border-border" 
          : "bg-muted/20 border-border opacity-70"
      }`}
    >
      <div className="space-y-1 max-w-[80%]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{field.name}</span>
          <Badge variant="outline" className="text-[10px] py-0.5 border-border text-muted-foreground bg-muted/50">
            {field.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{field.desc}</p>
      </div>
      <div className="flex items-center">
        <Switch
          id={`switch-${field.id}`}
          checked={isGranted}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
}
