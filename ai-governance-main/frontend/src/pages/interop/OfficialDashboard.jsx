import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, CheckCircle, Clock, ShieldAlert, Download, Filter, Search, RefreshCw } from "lucide-react";
import { getAllApplications } from "./api/interopApi";
import SlaStatusBadge from "./components/SlaStatusBadge";

export default function OfficialDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAllApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to load applications for official dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dynamic calculations from applications array
  const totalApps = applications.length;
  const pendingApps = applications.filter(app => app.currentStatus === "Pending" || app.currentStatus === "In Review").length;
  const approvedApps = applications.filter(app => app.currentStatus === "Approved").length;
  const slaBreaches = applications.filter(app => app.daysPending > 2).length;

  const filteredApps = applications.filter(app => {
    const matchesSector = filterSector === "All" || app.sector === filterSector;
    const matchesSearch = app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard queue...</p>
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
              Official Approval Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Internal multi-departmental interop review console and compliance monitor.
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2 border-border text-foreground self-start md:self-auto">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border text-card-foreground">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Applications</span>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{totalApps}</h3>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending Approvals</span>
                <h3 className="text-3xl font-bold mt-1 text-amber-500">{pendingApps}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Approved Certificates</span>
                <h3 className="text-3xl font-bold mt-1 text-emerald-500">{approvedApps}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">SLA Breaches (&gt; 2 Days)</span>
                <h3 className="text-3xl font-bold mt-1 text-destructive">{slaBreaches}</h3>
              </div>
              <div className="p-3 bg-destructive/10 text-destructive rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-xl">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search applicant or stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border text-foreground text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-background border border-border text-foreground py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Sectors</option>
              <option value="Textiles">Textiles</option>
              <option value="Food Processing">Food Processing</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
            </select>
          </div>
        </div>

        {/* Table List Card */}
        <Card className="bg-card border-border text-card-foreground overflow-hidden shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow>
                  <TableHead className="text-foreground font-bold">App ID</TableHead>
                  <TableHead className="text-foreground font-bold">Applicant</TableHead>
                  <TableHead className="text-foreground font-bold">Sector</TableHead>
                  <TableHead className="text-foreground font-bold">Current Stage</TableHead>
                  <TableHead className="text-foreground font-bold">Days Pending</TableHead>
                  <TableHead className="text-foreground font-bold">SLA Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => {
                  const isBreached = app.daysPending > 2;
                  const currentStageName = app.stages?.find(s => s.status === "current")?.name || app.stages[app.stages.length - 1]?.name || "Review";
                  
                  return (
                    <TableRow 
                      key={app.id} 
                      className={`border-b border-border transition-colors ${
                        isBreached ? "bg-destructive/10 border-l-4 border-l-destructive" : "hover:bg-accent/20"
                      }`}
                    >
                      <TableCell className="font-mono font-bold text-muted-foreground">{app.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{app.applicant}</TableCell>
                      <TableCell>{app.sector}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-foreground bg-muted/40">
                          {currentStageName}
                        </Badge>
                      </TableCell>
                      <TableCell className={isBreached ? "text-destructive font-bold" : "text-foreground"}>
                        {app.daysPending} {app.daysPending === 1 ? "day" : "days"}
                      </TableCell>
                      <TableCell>
                        <SlaStatusBadge status={app.currentStatus} daysPending={app.daysPending} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredApps.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-medium">
                No matching applications found in the review queue.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
