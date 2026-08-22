import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, FileText, ShieldCheck, RefreshCw, Eye, Sparkles } from "lucide-react";
import { getApplicationsForCitizen } from "./api/interopApi";
import ApplicationCard from "./components/ApplicationCard";
import StageTimeline from "./components/StageTimeline";
import SlaStatusBadge from "./components/SlaStatusBadge";

export default function CitizenTracker() {
  const [citizen, setCitizen] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getApplicationsForCitizen("CITIZEN-001");
        setCitizen(data.citizen);
        setApplications(data.applications);
        if (data.applications.length > 0) {
          setSelectedApp(data.applications[0]);
        }
      } catch (err) {
        console.error("Failed to load citizen applications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredApps = applications.filter(app =>
    app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading citizen applications...</p>
        </div>
      </div>
    );
  }

  // Determine index of selected app to check if it's after the first application
  const selectedIndex = applications.findIndex(a => a?.id === selectedApp?.id);
  const isAfterFirstApp = selectedIndex > 0;

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Citizen Portal — My Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Applicant: <span className="font-semibold text-foreground">{citizen?.name}</span> ({citizen?.company}) • GSTIN: <span className="font-mono text-xs">{citizen?.gstin}</span>
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Data Reuse Highlight Banner */}
        <Card className="p-4 bg-primary/5 border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Interoperable Data Reuse Active
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your verified Corporate Identity, PAN &amp; GSTIN credentials are automatically reused across all applications. No repeated document uploads needed.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary shrink-0">
            {citizen?.verifiedFields?.length || 0} Reused Tokens
          </Badge>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications List for Rajesh Kumar */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Applications ({filteredApps.length})</h2>
            {filteredApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                isSelected={selectedApp?.id === app.id}
                onClick={() => setSelectedApp(app)}
                statusBadge={<SlaStatusBadge status={app.currentStatus} daysPending={app.daysPending} />}
              />
            ))}
          </div>

          {/* Timeline View Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedApp && (
              <Card className="border-border bg-card text-card-foreground shadow-md overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/30">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono text-primary font-bold">{selectedApp.id}</span>
                        <SlaStatusBadge status={selectedApp.currentStatus} daysPending={selectedApp.daysPending} />
                      </div>
                      <CardTitle className="text-xl mt-2 text-foreground">{selectedApp.title}</CardTitle>
                      <CardDescription className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted on: {selectedApp.submissionDate}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Overall Completion</span>
                      <span className="text-2xl font-bold text-primary">{selectedApp.overallProgress}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">

                  {/* Reused Credentials Pill List with Reused Badge */}
                  <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Pre-verified Data Automatically Shared:</span>
                      </div>
                      {isAfterFirstApp && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                          ✓ Reused from previous application
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedApp.reusedFields?.map((field, i) => (
                        <Badge key={i} variant="outline" className="text-[11px] bg-background border-border text-muted-foreground flex items-center gap-1">
                          <span>✓ {field}</span>
                          {isAfterFirstApp && (
                            <span className="text-[9px] text-emerald-500 font-semibold">(Reused)</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Verification Progress</span>
                      <span>{selectedApp.overallProgress === 100 ? "Certificate Issued" : "Processing Clearance"}</span>
                    </div>
                    <Progress value={selectedApp.overallProgress} className="h-2.5 bg-muted [&>div]:bg-primary" />
                  </div>

                  {/* Stepper Timeline */}
                  <StageTimeline stages={selectedApp.stages} />

                  {/* Summary Footer */}
                  <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Last updated: {selectedApp.lastUpdate}</span>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>View Application Dossier</span>
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
