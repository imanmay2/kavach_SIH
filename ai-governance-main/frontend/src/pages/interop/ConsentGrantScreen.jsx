import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, ChevronRight, Sparkles, Landmark, RefreshCw } from "lucide-react";
import { getDepartmentConsents, grantConsent } from "./api/interopApi";
import { MOCK_CONSENT_FIELDS } from "./data/mockData";
import ConsentFieldToggle from "./components/ConsentFieldToggle";

export default function ConsentGrantScreen() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [consentStates, setConsentStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConsents() {
      setLoading(true);
      try {
        const depts = await getDepartmentConsents("CITIZEN-001");
        setDepartments(depts);
        if (depts.length > 0) {
          setSelectedDept(depts[0]);
          const initialStates = {};
          depts.forEach(d => {
            initialStates[d.id] = { ...d.consents };
          });
          setConsentStates(initialStates);
        }
      } catch (err) {
        console.error("Failed to load department consents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConsents();
  }, []);

  const handleToggle = (fieldId) => {
    if (!selectedDept) return;
    setConsentStates(prev => ({
      ...prev,
      [selectedDept.id]: {
        ...prev[selectedDept.id],
        [fieldId]: !prev[selectedDept.id]?.[fieldId]
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedDept) return;
    setSaving(true);
    try {
      const currentDeptConsents = consentStates[selectedDept.id] || {};
      const res = await grantConsent("CITIZEN-001", selectedDept.id, currentDeptConsents);
      
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "success",
          "Consent Saved Successfully",
          res.message,
          5000
        );
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error("Error granting consent:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading consent configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Consent &amp; Data Sharing Console
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
              {departments.map((dept) => (
                <Card
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className={`p-4 cursor-pointer transition-all border ${
                    selectedDept?.id === dept.id
                      ? "border-primary bg-accent/50 shadow-sm"
                      : "border-border bg-card hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedDept?.id === dept.id ? "text-primary translate-x-1" : "text-muted-foreground"}`} />
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
            {selectedDept && (
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
                    {MOCK_CONSENT_FIELDS.map((field) => {
                      const isGranted = consentStates[selectedDept.id]?.[field.id] || false;
                      return (
                        <ConsentFieldToggle
                          key={field.id}
                          field={field}
                          isGranted={isGranted}
                          onToggle={() => handleToggle(field.id)}
                        />
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
                      disabled={saving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
                    >
                      {saving ? "Saving..." : "Grant Consent"}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
