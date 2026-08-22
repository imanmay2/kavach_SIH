import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, AlertCircle, CheckCircle, Clock, ShieldAlert, Download, Filter, Search } from "lucide-react";

// Mock Official Applications Database
const MOCK_DB = [
  { id: "APP-2026-8912", applicant: "Rajesh Kumar (Aditya Textiles Ltd)", sector: "Textiles", stage: "Fire NOC Review", daysPending: 4, status: "Pending" },
  { id: "APP-2026-3044", applicant: "Sunita Deshmukh (Sahyadri Food Processing)", sector: "Food Processing", stage: "Approved", daysPending: 0, status: "Approved" },
  { id: "APP-2026-4410", applicant: "Amit Patel (Vanguard Manufacturing Corp)", sector: "Manufacturing", stage: "Municipal Corporation", daysPending: 1, status: "Pending" },
  { id: "APP-2026-9022", applicant: "Vikram Malhotra (Aura Pharmaceuticals)", sector: "Pharmaceuticals", stage: "Pollution Control Board", daysPending: 3, status: "Pending" },
  { id: "APP-2026-1189", applicant: "Priya Sharma (Blue Horizon Chemicals)", sector: "Chemicals", stage: "Municipal Corporation", daysPending: 5, status: "Pending" },
  { id: "APP-2026-5561", applicant: "Anand Joshi (Joshi Food Processing)", sector: "Food Processing", stage: "Approved", daysPending: 0, status: "Approved" }
];

export default function OfficialDashboard() {
  const [filterSector, setFilterSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic calculations
  const totalApps = MOCK_DB.length;
  const pendingApps = MOCK_DB.filter(app => app.status === "Pending").length;
  const approvedApps = MOCK_DB.filter(app => app.status === "Approved").length;
  const slaBreaches = MOCK_DB.filter(app => app.status === "Pending" && app.daysPending > 2).length;

  const filteredDB = MOCK_DB.filter(app => {
    const matchesSector = filterSector === "All" || app.sector === filterSector;
    const matchesSearch = app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.stage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

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
              <option value="Chemicals">Chemicals</option>
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
                {filteredDB.map((app) => {
                  const isBreached = app.status === "Pending" && app.daysPending > 2;
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
                          {app.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className={isBreached ? "text-destructive font-bold" : "text-foreground"}>
                        {app.daysPending} {app.daysPending === 1 ? "day" : "days"}
                      </TableCell>
                      <TableCell>
                        {app.status === "Approved" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Approved</Badge>
                        ) : isBreached ? (
                          <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase tracking-wide">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>SLA Breach</span>
                          </div>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">On Track</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredDB.length === 0 && (
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
