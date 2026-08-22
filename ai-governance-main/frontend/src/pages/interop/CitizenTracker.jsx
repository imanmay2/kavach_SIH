import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building, Calendar, FileText, CheckCircle2, Eye } from "lucide-react";

// Realistic Indian Mock Data
const MOCK_APPLICATIONS = [
  {
    id: "APP-2026-8912",
    applicant: "Rajesh Kumar (Aditya Textiles Ltd)",
    sector: "Textiles",
    submissionDate: "2026-08-10",
    lastUpdate: "2026-08-22",
    currentStatus: "In Review",
    stages: [
      { name: "Submission", status: "completed", date: "2026-08-10", dept: "Portal System" },
      { name: "Municipal Corporation", status: "completed", date: "2026-08-14", dept: "MCGM (Mumbai)" },
      { name: "Fire NOC Review", status: "current", date: "2026-08-18", dept: "Mumbai Fire Brigade" },
      { name: "Pollution Control Board", status: "pending", date: null, dept: "MPCB" }
    ],
    overallProgress: 60
  },
  {
    id: "APP-2026-3044",
    applicant: "Sunita Deshmukh (Sahyadri Food Processing)",
    sector: "Food Processing",
    submissionDate: "2026-08-01",
    lastUpdate: "2026-08-18",
    currentStatus: "Approved",
    stages: [
      { name: "Submission", status: "completed", date: "2026-08-01", dept: "Portal System" },
      { name: "Municipal Corporation", status: "completed", date: "2026-08-05", dept: "Pune Municipal Corp" },
      { name: "Fire NOC Review", status: "completed", date: "2026-08-12", dept: "Pune Fire Dept" },
      { name: "Pollution Control Board", status: "completed", date: "2026-08-18", dept: "MPCB" }
    ],
    overallProgress: 100
  },
  {
    id: "APP-2026-4410",
    applicant: "Amit Patel (Vanguard Manufacturing Corp)",
    sector: "Manufacturing",
    submissionDate: "2026-08-20",
    lastUpdate: "2026-08-21",
    currentStatus: "Pending",
    stages: [
      { name: "Submission", status: "completed", date: "2026-08-20", dept: "Portal System" },
      { name: "Municipal Corporation", status: "current", date: "2026-08-21", dept: "GIDC (Gujarat)" },
      { name: "Fire NOC Review", status: "pending", date: null, dept: "Gujarat Fire Safety" },
      { name: "Pollution Control Board", status: "pending", date: null, dept: "GPCB" }
    ],
    overallProgress: 25
  }
];

export default function CitizenTracker() {
  const [selectedApp, setSelectedApp] = useState(MOCK_APPLICATIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = MOCK_APPLICATIONS.filter(app =>
    app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Approved</Badge>;
      case "In Review":
        return <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">In Review</Badge>;
      case "Pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Citizen Application Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your industrial compliance certificates and multi-department approvals in real-time.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Applications</h2>
            {filteredApps.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-border bg-card">
                No applications found.
              </Card>
            ) : (
              filteredApps.map((app) => (
                <Card
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 cursor-pointer transition-all border ${
                    selectedApp.id === app.id
                      ? "border-primary bg-accent/50 shadow-sm"
                      : "border-border bg-card hover:bg-accent/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-mono text-primary font-bold">{app.id}</span>
                    {getStatusBadge(app.currentStatus)}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1">{app.applicant}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <Building className="h-3 w-3" />
                    <span>Sector: {app.sector}</span>
                  </div>
                </Card>
              ))
            )}
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
                        {getStatusBadge(selectedApp.currentStatus)}
                      </div>
                      <CardTitle className="text-xl mt-2 text-foreground">{selectedApp.applicant}</CardTitle>
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
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Verification Progress</span>
                      <span>{selectedApp.overallProgress === 100 ? "Ready for Issuance" : "Processing"}</span>
                    </div>
                    <Progress value={selectedApp.overallProgress} className="h-2.5 bg-muted [&>div]:bg-primary" />
                  </div>

                  {/* Stepper Timeline */}
                  <div className="relative pl-6 border-l-2 border-border ml-4 space-y-8">
                    {selectedApp.stages.map((stage, idx) => {
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

                  {/* Summary Footer */}
                  <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Last dynamic scan updated on: {selectedApp.lastUpdate}</span>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>View Full Dossier</span>
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
