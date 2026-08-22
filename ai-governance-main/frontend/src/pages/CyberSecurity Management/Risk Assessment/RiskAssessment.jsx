import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Plus,
  Download,
  MessageSquare,
  Calendar,
  User,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Settings,
} from "lucide-react";
import riskMatrixService from "../../../services/riskMatrixService";
import { getProjects } from "@/services/projectService";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Menu, Transition } from "@headlessui/react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

const dashboardStatusOptions = ["Pending", "Completed", "Rejected"];

const getSeverityText = (severity) => {
  const level = Math.round(severity || 0);
  if (level >= 5) return "Critical";
  if (level >= 4) return "High";
  if (level >= 3) return "Medium";
  if (level >= 2) return "Low";
  return "Very Low";
};

// --- Isolated AddRiskForm Component to fix focus-loss issue ---
const AddRiskForm = ({ onAdd, onCancel, projects }) => {
  const [formData, setFormData] = useState({
    riskName: "",
    riskOwner: "",
    severity: 3,
    justification: "",
    mitigation: "",
    projectId: "cybersecurity-risk-assessment",
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm font-medium">Name</label>
        <Input
          value={formData.riskName}
          onChange={(e) => setFormData({ ...formData, riskName: e.target.value })}
          className="col-span-3"
          placeholder="Enter risk name"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm font-medium">Owner</label>
        <Input
          value={formData.riskOwner}
          onChange={(e) => setFormData({ ...formData, riskOwner: e.target.value })}
          className="col-span-3"
          placeholder="Enter owner name"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm font-medium">Project</label>
        <Select
          value={formData.projectId}
          onValueChange={(value) => setFormData({ ...formData, projectId: value })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label className="text-right text-sm font-medium">Severity</label>
        <Select
          value={String(formData.severity)}
          onValueChange={(val) => setFormData({ ...formData, severity: parseInt(val) })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Critical</SelectItem>
            <SelectItem value="4">High</SelectItem>
            <SelectItem value="3">Medium</SelectItem>
            <SelectItem value="2">Low</SelectItem>
            <SelectItem value="1">Very Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => onAdd(formData)}
          disabled={!formData.riskName || !formData.riskOwner}
        >
          Create Risk
        </Button>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onDismiss} className="p-1 rounded-full hover:bg-red-200">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const CyberSecurityRiskAssessment = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskDetailsExpanded, setRiskDetailsExpanded] = useState(false);
  const [riskAnalysisExpanded, setRiskAnalysisExpanded] = useState(true);
  const [riskMatrixResults, setRiskMatrixResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddRiskDialogOpen, setAddRiskDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);
  const [riskStats, setRiskStats] = useState({
    summary: { totalAssessments: 0, completedAssessments: 0, pendingAssessments: 0 },
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetchRiskMatrixResults();
    fetchRiskStats();
    fetchProjects();
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.custom-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const fetchRiskMatrixResults = async (params = {}) => {
    setLoading(true);
    const pageToFetch = params.page || 1;
    try {
      const response = await riskMatrixService.getRisksBySystemType("Cybersecurity", {
        page: pageToFetch,
        limit: pagination.limit,
        search: params.search !== undefined ? params.search : searchQuery,
        projectId: params.projectId !== undefined ? params.projectId : selectedProjectId,
        status: params.status !== undefined ? params.status : selectedStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRiskMatrixResults(response.risks || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (e) {
      setError(e.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      const allProjects = response.data || response || [];
      const formatted = allProjects.map(p => ({
        id: p.projectId || p._id,
        name: p.projectName || p.name || p.id
      }));
      setProjects(formatted);
    } catch (e) {
      console.error("Error fetching projects", e);
    }
  };

  const fetchRiskStats = async () => {
    try {
      const stats = await riskMatrixService.getRiskStatistics(selectedProjectId === "all" ? null : selectedProjectId);
      setRiskStats(stats);
      const newPieData = [
        { name: "Critical", value: stats.riskLevels?.Critical || 0, color: "#ef4444" },
        { name: "High", value: stats.riskLevels?.High || 0, color: "#f97316" },
        { name: "Medium", value: stats.riskLevels?.Medium || 0, color: "#eab308" },
        { name: "Low", value: stats.riskLevels?.Low || 0, color: "#22c55e" },
      ].filter(item => item.value > 0);
      setPieData(newPieData);
    } catch (e) {
      console.error("Stats error", e);
    }
  };

  const handleAddRisk = async (data) => {
    try {
      const enriched = {
        ...data,
        riskAssessmentId: `R-${Math.floor(Math.random() * 900 + 100)}`,
        sessionId: `S-${Date.now().toString().slice(-6)}`,
        systemType: "Cybersecurity",
      };
      await riskMatrixService.addRisk(data.projectId, enriched);
      setAddRiskDialogOpen(false);
      fetchRiskMatrixResults({ page: 1 });
      fetchRiskStats();
    } catch (e) {
      setError(e.message || "Failed to add risk.");
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await riskMatrixService.getRisksBySystemType("Cybersecurity", {
        limit: 1000,
        search: searchQuery,
        projectId: selectedProjectId,
        status: selectedStatus,
      });
      const worksheet = XLSX.utils.json_to_sheet((response.risks || []).map(r => ({
        ID: r.riskAssessmentId || r._id,
        Name: r.riskName,
        Severity: getSeverityText(r.severity),
        Status: r.status,
        Owner: r.riskOwner
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Risks");
      XLSX.writeFile(workbook, "Cybersecurity_Risks.xlsx");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await riskMatrixService.getRisksBySystemType("Cybersecurity", { limit: 1000 });
      const doc = new jsPDF();
      doc.text("Cybersecurity Risk Report", 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [["ID", "Name", "Severity", "Status"]],
        body: (response.risks || []).map(r => [r.riskAssessmentId, r.riskName, getSeverityText(r.severity), r.status])
      });
      doc.save("Cybersecurity_Risks.pdf");
    } finally {
      setIsExporting(false);
    }
  };

  const calculateHeatmapData = () => {
    const grid = Array.from({ length: 25 }, () => ({ intensity: 0, riskCount: 0 }));
    riskMatrixResults.forEach((risk) => {
      const severity = Math.round(risk.severity || 0);
      const impact = Math.min(Math.max(severity, 1), 5);
      const probability = Math.min(Math.max(severity, 1), 5);
      const index = (probability - 1) * 5 + (impact - 1);
      if (index >= 0 && index < 25) {
        grid[index].riskCount += 1;
        grid[index].intensity = Math.min(grid[index].riskCount / 5, 1);
      }
    });
    return grid;
  };

  const handleStatusUpdate = async (risk, nextStatus) => {
    try {
      await riskMatrixService.updateRiskStatus(risk.riskAssessmentId, risk.projectId, nextStatus);
      setActiveDropdown(null);
      fetchRiskMatrixResults();
    } catch (e) {
      setError("Failed to update status.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <ErrorDisplay message={error} onDismiss={() => setError(null)} />

      {currentView === "dashboard" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Cybersecurity Risk Manager</h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search risks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchRiskMatrixResults({ search: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Button onClick={() => setAddRiskDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-[150px] h-10">
              <Plus className="w-4 h-4 mr-2" /> Add risk
            </Button>

            <Menu as="div" className="relative">
              <Menu.Button as={Button} variant="outline" className="w-[150px] h-10" disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" /> {isExporting ? "Exporting..." : "Export"}
              </Menu.Button>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-1">
                  <Menu.Item>{({ active }) => (
                    <button onClick={handleExportExcel} className={cn("flex w-full items-center px-3 py-2 text-sm rounded-md", active && "bg-gray-100")}>Excel (.xlsx)</button>
                  )}</Menu.Item>
                  <Menu.Item>{({ active }) => (
                    <button onClick={handleExportPDF} className={cn("flex w-full items-center px-3 py-2 text-sm rounded-md", active && "bg-gray-100")}>PDF (.pdf)</button>
                  )}</Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <Select value={selectedProjectId} onValueChange={(val) => {
              setSelectedProjectId(val);
              fetchRiskMatrixResults({ projectId: val });
            }}>
              <SelectTrigger className="w-[220px] h-10">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(val) => {
              setSelectedStatus(val);
              fetchRiskMatrixResults({ status: val });
            }}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Strategy Progress</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {["Completed", "Pending", "Rejected"].map(s => (
                  <div key={s}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s}</span>
                      <span>{riskStats.summary?.[`${s.toLowerCase()}Assessments`] || 0}</span>
                    </div>
                    <Progress value={riskStats.summary?.totalAssessments > 0 ? (riskStats.summary?.[`${s.toLowerCase()}Assessments`] / riskStats.summary.totalAssessments) * 100 : 0} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Heat Map</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 h-32 w-full">
                  {calculateHeatmapData().map((c, i) => {
                    let b = "bg-gray-100 text-transparent";
                    if (c.riskCount > 0) {
                      if (c.intensity <= 0.3) b = "bg-yellow-200 text-yellow-800";
                      else if (c.intensity <= 0.6) b = "bg-orange-300 text-orange-900";
                      else if (c.intensity <= 0.8) b = "bg-red-400 text-white";
                      else b = "bg-red-600 text-white";
                    }
                    return (
                      <div
                        key={i}
                        className={`${b} rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors`}
                        title={`Risks: ${c.riskCount}`}
                      >
                        {c.riskCount > 0 ? c.riskCount : ""}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
                ) : riskMatrixResults.map(item => (
                  <TableRow key={item._id}>
                    <TableCell onClick={() => { setSelectedRisk(item); setCurrentView("detail"); }} className="font-medium text-blue-600 cursor-pointer">{item.riskAssessmentId}</TableCell>
                    <TableCell className="text-sm">{item.projectId}</TableCell>
                    <TableCell>{item.riskName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          item.severity >= 5
                            ? "bg-red-100 text-red-800"
                            : item.severity >= 4
                              ? "bg-orange-100 text-orange-800"
                              : item.severity >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        )}
                      >
                        {getSeverityText(item.severity)} ({item.severity})
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                    <TableCell className="text-right relative custom-dropdown">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === item._id ? null : item._id);
                        }}
                      >
                        <span className="sr-only">Open menu</span>•••
                      </Button>

                      {activeDropdown === item._id && (
                        <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-left overflow-hidden">
                          <button
                            onClick={() => handleStatusUpdate(item, "Completed")}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-b flex items-center text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item, "Pending")}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors border-b flex items-center text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item, "Rejected")}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                            Rejected
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination.pages > 1 && (
              <div className="p-4 border-t flex justify-between items-center bg-muted/20">
                <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchRiskMatrixResults({ page: pagination.page - 1 })}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchRiskMatrixResults({ page: pagination.page + 1 })}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Risk Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-xs text-muted-foreground">Name</label><p className="font-medium">{selectedRisk?.riskName}</p></div>
                <div><label className="text-xs text-muted-foreground">Justification</label><p className="text-sm">{selectedRisk?.justification || "N/A"}</p></div>
                <div><label className="text-xs text-muted-foreground">Mitigation</label><p className="text-sm">{selectedRisk?.mitigation || "N/A"}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Assessment Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm">Risk Score</span>
                  <Badge className="bg-red-500">{selectedRisk?.severity}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm">Status</span>
                  <Badge variant="outline">{selectedRisk?.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Owner</span>
                  <span className="text-sm font-medium">{selectedRisk?.riskOwner}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={isAddRiskDialogOpen} onOpenChange={setAddRiskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Cybersecurity Risk</DialogTitle></DialogHeader>
          <AddRiskForm
            projects={projects}
            onCancel={() => setAddRiskDialogOpen(false)}
            onAdd={handleAddRisk}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CyberSecurityRiskAssessment;
