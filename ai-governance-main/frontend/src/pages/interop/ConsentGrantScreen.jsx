import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, ChevronRight, Sparkles, Landmark } from "lucide-react";

const DATA_FIELDS = [
  { id: "pan", name: "Corporate PAN Card Verification", desc: "Permanent Account Number authentication for tax compliance checks.", category: "Identity & Legal" },
  { id: "gstin", name: "GSTIN Registry Details", desc: "GST registration status and monthly filing logs validation.", category: "Identity & Legal" },
  { id: "pollution", name: "MPCB Emissions Log & NOC", desc: "Air and water pollution discharge audit records and NOC parameters.", category: "Environmental & Health" },
  { id: "fire", name: "Fire Safety Equipment Certifications", desc: "Audit records and inspection reports of installed fire systems.", category: "Safety & Operations" },
  { id: "blueprint", name: "Structural Layout & Factory Blueprint", desc: "Floorplans, height declarations, and structural audit approvals.", category: "Safety & Operations" },
  { id: "electricity", name: "MSEDCL Electricity Load Logs", desc: "Power supply capacity, consumption rates, and billing compliance.", category: "Utility & Resources" }
];

const DEPARTMENTS = [
  { id: "mcgm", name: "Municipal Corporation (MCGM)", desc: "Primary municipal authority reviewing zoning and local clearances." },
  { id: "fire_dept", name: "State Fire & Emergency Services", desc: "Verifying building fire safety and evacuation guidelines." },
  { id: "mpcb", name: "Pollution Control Board (MPCB)", desc: "Regulating environmental emissions, disposal protocols, and ecological compliance." }
];

export default function ConsentGrantScreen() {
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [consentStates, setConsentStates] = useState(
    DEPARTMENTS.reduce((acc, dept) => {
      acc[dept.id] = DATA_FIELDS.reduce((fAcc, field) => {
        fAcc[field.id] = dept.id === "mcgm" && (field.id === "pan" || field.id === "gstin");
        return fAcc;
      }, {});
      return acc;
    }, {})
  );

  const handleToggle = (fieldId) => {
    setConsentStates(prev => ({
      ...prev,
      [selectedDept.id]: {
        ...prev[selectedDept.id],
        [fieldId]: !prev[selectedDept.id][fieldId]
      }
    }));
  };

  const handleSave = () => {
    if (typeof window.showNotification === "function") {
      window.showNotification(
        "success",
        "Consent Saved Successfully",
        `Granular data sharing consents updated for ${selectedDept.name}. Logged on the Kavach Ledger.`,
        5000
      );
    } else {
      alert(`Consent saved for ${selectedDept.name}!`);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Consent & Data Sharing Console
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and grant granular access to your company’s compliance documents to verifying departments.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Kavach Consent Engine v1.2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Department Selection Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Departments</h2>
            <div className="space-y-3">
              {DEPARTMENTS.map((dept) => (
                <Card
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className={`p-4 cursor-pointer transition-all border ${
                    selectedDept.id === dept.id
                      ? "border-primary bg-accent/50 shadow-sm"
                      : "border-border bg-card hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedDept.id === dept.id ? "text-primary translate-x-1" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{dept.desc}</p>
                </Card>
              ))}
            </div>
            
            {/* Info Tip */}
            <Card className="p-4 bg-muted/40 border border-border space-y-2 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Audit Ledger Guarantee</p>
                All consent grants and revocations are logged as cryptographically signed events on the Kavach distributed compliance ledger.
              </div>
            </Card>
          </div>

          {/* Granular Toggles Card */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border text-card-foreground shadow-md overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <Landmark className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl text-foreground">Granular Access Rules</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground mt-1">
                  Define what information <span className="text-primary font-bold">{selectedDept.name}</span> is authorized to access during reviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Consent Toggle List */}
                <div className="space-y-4">
                  {DATA_FIELDS.map((field) => {
                    const isGranted = consentStates[selectedDept.id][field.id] || false;
                    return (
                      <div
                        key={field.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                          isGranted 
                            ? "bg-accent/30 border-border" 
                            : "bg-muted/20 border-border opacity-70"
                        }`}
                      >
                        <div className="space-y-1 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{field.name}</span>
                            <Badge variant="outline" className="text-[10px] py-0.5 border-border text-muted-foreground bg-muted/50">{field.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{field.desc}</p>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            id={`switch-${field.id}`}
                            checked={isGranted}
                            onCheckedChange={() => handleToggle(field.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Save Area */}
                <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Real-time verification rules will apply instantly</span>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
                  >
                    Grant Consent
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
