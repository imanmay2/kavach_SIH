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
  DialogFooter,
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

// 1. Import Combobox components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
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
  Settings,
  X as XIcon,
  ChevronsUpDown, // 1. Import new icons
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react"; // 1. Import useMemo
import riskMatrixService from "../../../services/riskMatrixService";
import { getProjects } from "../../../services/projectService";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { clsx } from "clsx"; // 1. Import clsx and twMerge for cn
import { twMerge } from "tailwind-merge";

// Helper component for error display
const ErrorDisplay = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-500 transition-colors">
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

// 1. Add cn function
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

const AIRiskAssessment = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskDetailsExpanded, setRiskDetailsExpanded] = useState(false);
  const [riskAnalysisExpanded, setRiskAnalysisExpanded] = useState(true);
  const [riskMatrixResults, setRiskMatrixResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which row's dropdown is open

  // State for the Add Risk Dialog
  const [isAddRiskDialogOpen, setAddRiskDialogOpen] = useState(false);
  // AddRiskForm component to isolate state and fix typing focus bug
  const AddRiskForm = ({ isOpen, onOpenChange, onAdd, projects }) => {
    const [formData, setFormData] = useState({
      riskName: "",
      riskOwner: "",
      severity: 3,
      projectId: projects[0]?.id || "ai-risk-assessment",
    });

    const handleInternalAdd = () => {
      onAdd(formData);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-left">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskName" className="text-right">Name</label>
              <Input
                id="riskName"
                value={formData.riskName}
                onChange={(e) => setFormData({ ...formData, riskName: e.target.value })}
                className="col-span-3"
                placeholder="Enter risk name..."
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskOwner" className="text-right">Owner</label>
              <Input
                id="riskOwner"
                value={formData.riskOwner}
                onChange={(e) => setFormData({ ...formData, riskOwner: e.target.value })}
                className="col-span-3"
                placeholder="Risk owner name..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="severity" className="text-right">Severity</label>
              <Select
                value={String(formData.severity)}
                onValueChange={(v) => setFormData({ ...formData, severity: parseInt(v) })}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskProject" className="text-right">Project</label>
              <Select
                value={formData.projectId}
                onValueChange={(v) => setFormData({ ...formData, projectId: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleInternalAdd} className="w-full">Create Risk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Changed from 20 to 10
    total: 0,
    pages: 0,
  });

  const [error, setError] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);

  // 2. Add state for the Combobox popover
  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);

  const [barChartData, setBarChartData] = useState([]);

  const [riskStats, setRiskStats] = useState({
    summary: {
      totalAssessments: 0,
      completedAssessments: 0,
      pendingAssessments: 0,
    },
  });

  const [pieData, setPieData] = useState([
    { name: "Critical", value: 0, color: "#ef4444" },
    { name: "High", value: 0, color: "#f97316" },
    { name: "Medium", value: 0, color: "#eab308" },
    { name: "Low", value: 0, color: "#22c55e" },
  ]);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const handleRiskClick = (risk) => {
    setError(null);
    setSelectedRisk(risk);
    setCurrentView("detail");
  };

  const handleBackToDashboard = () => {
    setError(null);
    setCurrentView("dashboard");
    setSelectedRisk(null);
  };

  const fetchProjects = async () => {
    try {
      // 1. Fetch real projects from DB
      const response = await getProjects();
      const allProjects = response.data || response || [];
      const formattedProjects = allProjects.map(p => ({
        // Prioritize the human-readable projectId over the Mongo _id
        id: p.projectId || p._id || p.id,
        name: p.projectName || p.name || p.title
      }));

      // 2. Fetch existing risk projects to ensure legacy ones aren't missed
      const riskResponse = await riskMatrixService.getRisksBySystemType("AI", { limit: 1000 });
      const tableProjectIds = [...new Set((riskResponse.risks || []).map(r => r.projectId).filter(Boolean))];
      
      // Merge lists
      const finalProjects = [...formattedProjects];
      tableProjectIds.forEach(id => {
        if (!finalProjects.find(p => p.id === id)) {
          finalProjects.push({ id, name: id });
        }
      });

      setProjects(finalProjects);
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
  };

  // --- THE DIALOG WAS HERE, IT HAS BEEN MOVED ---

  const fetchRiskMatrixResults = async (params = {}) => {
    setError(null);
    setLoading(true);

    const newPage = params.page || 1;
    const newSearch = params.search !== undefined ? params.search : searchQuery;
    const newProjectId =
      params.projectId !== undefined ? params.projectId : selectedProjectId;
    const newStatus =
      params.status !== undefined ? params.status : selectedStatus;

    const pageToFetch = params.page ? newPage : 1;

    if (params.page) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    } else {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    try {
      const queryParams = {
        page: pageToFetch,
        limit: pagination.limit, // This will now use 10 from the state
        search: newSearch,
        projectId: newProjectId,
        status: newStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await riskMatrixService.getRisksBySystemType(
        "AI",
        queryParams
      );
      setRiskMatrixResults(response.risks || []);

      // --- ALSO UPDATED THE FALLBACK HERE ---
      setPagination(
        response.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      );
    } catch (e) {
      console.error("Error fetching risks:", e);
      setError(e.message || "Failed to fetch risks.");
      setRiskMatrixResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskStats = async () => {
    try {
      const stats = await riskMatrixService.getRiskStatistics(
        selectedProjectId === "all" ? null : selectedProjectId
      );
      setRiskStats(stats);

      const newPieData = [
        {
          name: "Critical",
          value: stats.riskLevels?.Critical || 0,
          color: "#ef4444",
        },
        { name: "High", value: stats.riskLevels?.High || 0, color: "#f97316" },
        {
          name: "Medium",
          value: stats.riskLevels?.Medium || 0,
          color: "#eab308",
        },
        { name: "Low", value: stats.riskLevels?.Low || 0, color: "#22c55e" },
      ].filter((item) => item.value > 0);
      setPieData(newPieData);
    } catch (e) {
      console.error("Error fetching risk statistics:", e);
      setError(e.message || "Failed to load statistics.");
    }
  };

  useEffect(() => {
    fetchRiskMatrixResults();
    fetchRiskStats();
    fetchProjects();
  }, []);

  // ... (useEffect for pieData remains the same) ...
  useEffect(() => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      setPieData([]); // Clear pie data if no results
      return;
    }
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const risk of riskMatrixResults) {
      const level = Math.round(risk.severity || 0);
      if (level >= 5) counts.Critical += 1;
      else if (level >= 4) counts.High += 1;
      else if (level >= 3) counts.Medium += 1;
      else if (level >= 2) counts.Low += 1;
    }

    // Filter out risk levels with 0 values
    const pieDataArray = [
      { name: "Critical", value: counts.Critical, color: "#ef4444" },
      { name: "High", value: counts.High, color: "#f97316" },
      { name: "Medium", value: counts.Medium, color: "#eab308" },
      { name: "Low", value: counts.Low, color: "#22c55e" },
    ].filter((item) => item.value > 0);

    setPieData(pieDataArray);
  }, [riskMatrixResults]);

  // ... (calculateStrategyProgress and calculateHeatmapData remain the same) ...
  const calculateStrategyProgress = () => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return { completed: 0, pending: 0, rejected: 0, total: 0 };
    }

    const strategyCounts = { completed: 0, pending: 0, rejected: 0 };

    riskMatrixResults.forEach((risk) => {
      const status = risk.status;
      // Count risks by their current status
      if (status === "Completed") {
        strategyCounts.completed += 1;
      } else if (status === "Pending") {
        strategyCounts.pending += 1;
      } else if (status === "Rejected") {
        strategyCounts.rejected += 1;
      }
    });

    const total = riskMatrixResults.length;
    return { ...strategyCounts, total };
  };

  const calculateHeatmapData = () => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return Array.from({ length: 25 }, () => ({ intensity: 0, riskCount: 0 }));
    }

    // Create a 5x5 grid representing different risk combinations
    // X-axis: Impact (1-5), Y-axis: Probability (1-5)
    const grid = Array.from({ length: 25 }, () => ({
      intensity: 0,
      riskCount: 0,
    }));

    riskMatrixResults.forEach((risk) => {
      // Map severity to impact and probability
      const severity = Math.round(risk.severity || 0);
      let impact, probability;

      if (severity >= 5) {
        impact = 5;
        probability = 5;
      } else if (severity >= 4) {
        impact = 4;
        probability = 4;
      } else if (severity >= 3) {
        impact = 3;
        probability = 3;
      } else if (severity >= 2) {
        impact = 2;
        probability = 2;
      } else {
        impact = 1;
        probability = 1;
      }

      // Calculate grid index (0-24)
      const gridIndex = (probability - 1) * 5 + (impact - 1);

      if (gridIndex >= 0 && gridIndex < 25) {
        grid[gridIndex].riskCount += 1;
        // Calculate intensity based on risk count (normalized)
        grid[gridIndex].intensity = Math.min(
          grid[gridIndex].riskCount /
            Math.max(1, riskMatrixResults.length / 10),
          1
        );
      }
    });

    return grid;
  };

  // ... (useEffect for barChartData remains the same) ...
  useEffect(() => {
    if (riskMatrixResults.length > 0) {
      const aggregatedData = riskMatrixResults.reduce((acc, risk) => {
        const key = risk.projectId || "Unassigned";
        if (!acc[key]) {
          acc[key] = { name: key, inherent: [], residual: [], target: [] };
        }
        acc[key].inherent.push(risk.severity);
        acc[key].residual.push(risk.residualScore || 0);
        acc[key].target.push(risk.targetScore || 0);
        return acc;
      }, {});
      const chartData = Object.values(aggregatedData).map((project) => {
        const avg = (arr) =>
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        return {
          name: project.name,
          inherent: avg(project.inherent),
          residual: avg(project.residual),
          target: avg(project.target),
        };
      });
      setBarChartData(chartData);
    } else {
      setBarChartData([]); // Clear chart data if no risks
    }
  }, [riskMatrixResults]);

  // 3. Create derived lists for recent and all other projects
  const { recentProjects, allOtherProjects } = useMemo(() => {
    const recents = projects.slice(0, 4);
    const others = projects.slice(4);
    return { recentProjects: recents, allOtherProjects: others };
  }, [projects]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchRiskMatrixResults({ search: query });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRiskMatrixResults({ page: newPage });
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectId(projectId);
    fetchRiskMatrixResults({ projectId: projectId });
    fetchRiskStats();
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    fetchRiskMatrixResults({ status: status });
  };

  // ... (handleStatusUpdate, handleAddRisk, getSeverityText, handleExportExcel, handleExportPDF remain the same) ...
  const handleStatusUpdate = async (risk, newStatus) => {
    setError(null);
    // Validation: Ensure projectId exists before attempting the update.
    if (!risk.projectId) {
      setError(`Cannot update risk "${risk.riskName}": Project ID is missing.`);
      console.error("Update failed: Project ID is missing for risk:", risk);
      return;
    }

    try {
      await riskMatrixService.updateRiskStatus(
        risk.riskAssessmentId,
        risk.projectId,
        newStatus
      );
      // Optimistically update the UI to feel faster
      setRiskMatrixResults((prevRisks) =>
        prevRisks.map((r) =>
          r._id === risk._id ? { ...r, status: newStatus } : r
        )
      );
      // Fetch stats again to keep charts in sync
      await fetchRiskStats();
    } catch (e) {
      console.error("Error updating risk status:", e);
      setError(e.message || "An unknown error occurred while updating status.");
    }
  };

  const handleAddRisk = async (riskData) => {
    setError(null);
    try {
      const projectId = riskData.projectId || "AI-Project";
      
      // Generate missing required fields
      const randomId = Math.floor(Math.random() * 900 + 100);
      const enrichedRiskData = {
        ...riskData,
        riskAssessmentId: `AI-${randomId}`,
        sessionId: `S-${Date.now().toString().slice(-6)}`,
        systemType: "AI System", // Ensure it's marked as AI
      };

      await riskMatrixService.addRisk(projectId, enrichedRiskData);
      
      alert(`Risk "${riskData.riskName}" created successfully!`);

      setAddRiskDialogOpen(false);

      // Refresh data
      await fetchRiskMatrixResults();
      await fetchRiskStats();
    } catch (e) {
      console.error("Error adding risk:", e);
      setError(e.message || "Failed to add risk.");
      alert(`Failed to add risk: ${e.message || "Unknown error"}`);
    }
  };

  const getSeverityText = (severity) => {
    const level = Math.round(severity);
    if (level >= 5) return "Critical";
    if (level >= 4) return "High";
    if (level >= 3) return "Medium";
    if (level >= 2) return "Low";
    return "Very Low";
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await riskMatrixService.getRisksBySystemType("AI", {
        limit: pagination.total || 1000,
        projectId: selectedProjectId,
        status: selectedStatus,
        search: searchQuery,
      });
      const allRisks = response.risks || [];
      const dataToExport = allRisks.map((risk) => ({
        "Risk ID": risk.riskAssessmentId,
        "Project ID": risk.projectId || "N/A",
        Name: risk.riskName,
        "Risk Level": `${getSeverityText(risk.severity)} (${risk.severity})`,
        Strategy: risk.status || "N/A",
        "Risk Owner": risk.createdBy?.name || risk.riskOwner || "N/A",
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AI Risks");
      XLSX.writeFile(workbook, "AI_Risks_Export.xlsx");
    } catch (e) {
      console.error("Error exporting to Excel:", e);
      setError(e.message || "Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await riskMatrixService.getRisksBySystemType("AI", {
        limit: pagination.total || 1000,
        projectId: selectedProjectId,
        status: selectedStatus,
        search: searchQuery,
      });
      const allRisks = response.risks || [];
      const doc = new jsPDF();
      doc.text("AI Risk Assessment Report", 14, 16);
      const tableColumn = ["Risk ID", "Name", "Level", "Strategy", "Owner"];
      const tableRows = [];
      allRisks.forEach((risk) => {
        const riskData = [
          risk.riskAssessmentId,
          risk.riskName,
          `${getSeverityText(risk.severity)} (${risk.severity})`,
          risk.status || "N/A",
          risk.createdBy?.name || risk.riskOwner || "N/A",
        ];
        tableRows.push(riskData);
      });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("AI_Risks_Export.pdf");
    } catch (e) {
      console.error("Error exporting to PDF:", e);
      setError(e.message || "Failed to export to PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // ... (ErrorDisplay component remains the same) ...
  const ErrorDisplay = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-red-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">AI Risk Manager</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="space-y-6 mt-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {/* --- THIS BUTTON IS NOW FIXED --- */}
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddRiskDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add risk
          </Button>
          <div className="relative custom-dropdown">
            <Button 
              variant="outline" 
              disabled={isExporting}
              onClick={() => setActiveDropdown(activeDropdown === 'export' ? null : 'export')}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export risks"}
            </Button>
            
            {activeDropdown === 'export' && (
              <div className="absolute left-0 top-11 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-left overflow-hidden">
                <button
                  onClick={() => {
                    handleExportExcel();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors border-b text-left"
                >
                  Export as Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors text-left"
                >
                  Export as PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* 4. REPLACE the old project <Select> with this new <Popover> Combobox */}
          <Select
            value={selectedProjectId}
            onValueChange={handleProjectFilterChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter (remains a Select) */}
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ... (Rest of DashboardView: charts, error display, table, pagination) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Strategy Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const strategyProgress = calculateStrategyProgress();
                return (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Completed</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.completed} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.completed /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.pending} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.pending /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Rejected</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.rejected} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.rejected /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Heat Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Impact (X) vs Probability (Y) - Color intensity shows risk
                  concentration
                </div>
                <div className="grid grid-cols-5 gap-1 h-24">
                  {(() => {
                    const heatmapData = calculateHeatmapData();
                    return heatmapData.map((cell, i) => {
                      let bgColor = "bg-gray-100";
                      if (cell.riskCount > 0) {
                        if (cell.intensity <= 0.3) bgColor = "bg-yellow-200";
                        else if (cell.intensity <= 0.6)
                          bgColor = "bg-orange-300";
                        else if (cell.intensity <= 0.8) bgColor = "bg-red-400";
                        else bgColor = "bg-red-600";
                      }

                      return (
                        <div
                          key={i}
                          className={`${bgColor} rounded-sm relative group cursor-pointer`}
                          title={`Impact: ${(i % 5) + 1}, Probability: ${
                            Math.floor(i / 5) + 1
                          }, Risks: ${cell.riskCount}`}
                        >
                          {cell.riskCount > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                              {cell.riskCount}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ErrorDisplay message={error} onDismiss={() => setError(null)} />

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>PROJECT ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Risk level</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Controls</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading risks...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : riskMatrixResults.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No risks found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  riskMatrixResults.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell
                        className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleRiskClick(item)}
                      >
                        {item.riskAssessmentId}
                      </TableCell>
                      <TableCell>{item.projectId || "Not set"}</TableCell>
                      <TableCell>{item.riskName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            item.severity >= 5
                              ? "bg-red-100 text-red-800"
                              : item.severity >= 4
                              ? "bg-orange-100 text-orange-800"
                              : item.severity >= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {getSeverityText(item.severity)} ({item.severity})
                        </Badge>
                      </TableCell>
                      <TableCell>{item.status || "Not Set"}</TableCell>
                      <TableCell>{item.controlCount || 0}</TableCell>
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {item.createdBy?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
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
                              onClick={() => {
                                handleStatusUpdate(item, "Completed");
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-b flex items-center"
                            >
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                              Completed
                            </button>
                            <button
                              onClick={() => {
                                handleStatusUpdate(item, "Pending");
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors border-b flex items-center"
                            >
                              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                              Pending
                            </button>
                            <button
                              onClick={() => {
                                handleStatusUpdate(item, "Rejected");
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                            >
                              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                              Rejected
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} risks
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* --- 
        THE DIALOG IS NOW HERE, inside DashboardView's return. 
        This is the correct place.
      --- */}
      <Dialog open={isAddRiskDialogOpen} onOpenChange={setAddRiskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Risk Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskName" className="text-right">
                Name
              </label>
              <Input
                id="riskName"
                value={newRiskData.riskName}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {/* Risk Owner */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskOwner" className="text-right">
                Owner
              </label>
              <Input
                id="riskOwner"
                value={newRiskData.riskOwner}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskOwner: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {/* Severity */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="severity" className="text-right">
                Severity
              </label>
              <Select
                value={String(newRiskData.severity)}
                onValueChange={(value) =>
                  setNewRiskData({ ...newRiskData, severity: parseInt(value) })
                }
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
            
            {/* Project Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskProject" className="text-right">
                Project
              </label>
              <Select
                value={newRiskData.projectId}
                onValueChange={(value) =>
                  setNewRiskData({ ...newRiskData, projectId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                  {projects.length === 0 && <span className="p-2 text-xs text-muted-foreground block text-center">No projects available</span>}
                </SelectContent>
              </Select>
            </div>
            {/* You could add Textarea for justification/mitigation here */}
          </div>
          <Button
            onClick={() => {
              handleAddRisk(newRiskData);
              // handleAddRisk will close the dialog on success
            }}
          >
            Create Risk
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ... (DetailView remains exactly the same) ...
  const DetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all risks
          </Button>
          <div className="text-sm text-muted-foreground">
            murat.uinnain@anecdotes.ai • Today • Last updated by
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedRisk?.riskAssessmentId}
            </h1>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800"
            >
              {getSeverityText(selectedRisk?.severity)} (
              {selectedRisk?.severity})
            </Badge>
            <Badge variant="outline">{selectedRisk?.status}</Badge>
          </div>
          <h2 className="text-xl text-muted-foreground mt-1">
            {selectedRisk?.riskName}
          </h2>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Link control
        </Button>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add document
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comments
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Tasks
        </Button>
        <Button variant="outline" size="sm">
          Activity log
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm">Residual risk automation</span>
          <Switch />
        </div>
      </div>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setRiskDetailsExpanded(!riskDetailsExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                riskDetailsExpanded ? "rotate-180" : ""
              }`}
            />
            Risk details
          </CardTitle>
        </CardHeader>
        {riskDetailsExpanded && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Risk details content will be displayed here
            </p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setRiskAnalysisExpanded(!riskAnalysisExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                riskAnalysisExpanded ? "rotate-180" : ""
              }`}
            />
            Risk analysis
          </CardTitle>
        </CardHeader>
        {riskAnalysisExpanded && (
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Inherent risk</h4>
              <div className="flex justify-around gap-4 items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Impact</span>
                  <Badge className="bg-pink-500 text-white ml-2">
                    Major (4)
                  </Badge>
                </div>
                <div className="text-center">×</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Likelihood
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    Possible (3)
                  </Badge>
                </div>
                <div className="text-center">=</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Risk level
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    High (12)
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">Not set</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Residual risk</h4>
              <div className="flex justify-around gap-4 items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Impact</span>
                  <Badge className="bg-pink-500 text-white ml-2">
                    Major (4)
                  </Badge>
                </div>
                <div className="text-center">×</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Likelihood
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    Possible (3)
                  </Badge>
                </div>
                <div className="text-center">=</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Risk level
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    High (12)
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">Not set</div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Target risk level
              </span>
              <Badge className="bg-teal-500 text-white ml-2">Medium</Badge>
            </div>
            <div className="text-right">
              <Button variant="link" className="text-blue-600">
                How is the Risk level calculated?
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex-1 text-left">
      <main className="p-6">
        {currentView === "dashboard" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-left">
              <h1 className="text-3xl font-bold text-foreground">AI Risk Manager</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setAddRiskDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add risk
                </Button>
                
                <div className="relative custom-dropdown">
                  <Button 
                    variant="outline" 
                    disabled={isExporting}
                    onClick={() => setActiveDropdown(activeDropdown === 'export' ? null : 'export')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export risks"}
                  </Button>
                  
                  {activeDropdown === 'export' && (
                    <div className="absolute left-0 top-11 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 text-left overflow-hidden">
                      <button
                        onClick={() => {
                          handleExportExcel();
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors border-b text-left"
                      >
                        Export as Excel (.xlsx)
                      </button>
                      <button
                        onClick={() => {
                          handleExportPDF();
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors text-left"
                      >
                        Export as PDF (.pdf)
                      </button>
                    </div>
                  )}
                </div>

                <Select
                  value={selectedProjectId}
                  onValueChange={handleProjectFilterChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Strategy Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const strategyProgress = calculateStrategyProgress();
                      return (
                        <>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Completed</span>
                              <span className="text-sm font-medium">
                                {strategyProgress.completed} risks
                              </span>
                            </div>
                            <Progress
                              value={
                                strategyProgress.total > 0
                                  ? (strategyProgress.completed /
                                      strategyProgress.total) *
                                    100
                                  : 0
                              }
                              className="h-3"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Pending</span>
                              <span className="text-sm font-medium">
                                {strategyProgress.pending} risks
                              </span>
                            </div>
                            <Progress
                              value={
                                strategyProgress.total > 0
                                  ? (strategyProgress.pending /
                                      strategyProgress.total) *
                                    100
                                  : 0
                              }
                              className="h-3"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Rejected</span>
                              <span className="text-sm font-medium">
                                {strategyProgress.rejected} risks
                              </span>
                            </div>
                            <Progress
                              value={
                                strategyProgress.total > 0
                                  ? (strategyProgress.rejected /
                                      strategyProgress.total) *
                                    100
                                  : 0
                              }
                              className="h-3"
                            />
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Heat Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Impact (X) vs Probability (Y) - Color intensity shows risk concentration
                      </div>
                      <div className="grid grid-cols-5 gap-1 h-24 text-left">
                        {(() => {
                          const heatmapData = calculateHeatmapData();
                          return heatmapData.map((cell, i) => {
                            let bgColor = "bg-gray-100";
                            if (cell.riskCount > 0) {
                              if (cell.intensity <= 0.3) bgColor = "bg-yellow-200";
                              else if (cell.intensity <= 0.6) bgColor = "bg-orange-300";
                              else if (cell.intensity <= 0.8) bgColor = "bg-red-400";
                              else bgColor = "bg-red-600";
                            }
                            return (
                              <div
                                key={i}
                                className={`${bgColor} rounded-sm relative group cursor-pointer`}
                                title={`Impact: ${(i % 5) + 1}, Probability: ${Math.floor(i / 5) + 1}, Risks: ${cell.riskCount}`}
                              >
                                {cell.riskCount > 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                    {cell.riskCount}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ErrorDisplay message={error} onDismiss={() => setError(null)} />

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>PROJECT ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Risk level</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Controls</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-left">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-2">Loading risks...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : riskMatrixResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-left">
                            No risks found for the selected filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        riskMatrixResults.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell
                              className="font-medium text-blue-600 cursor-pointer hover:underline text-left"
                              onClick={() => handleRiskClick(item)}
                            >
                              {item.riskAssessmentId}
                            </TableCell>
                            <TableCell className="text-left">{item.projectId || "Not set"}</TableCell>
                            <TableCell className="text-left">{item.riskName}</TableCell>
                            <TableCell className="text-left">
                              <Badge
                                variant="secondary"
                                className={
                                  item.severity >= 5
                                    ? "bg-red-100 text-red-800"
                                    : item.severity >= 4
                                    ? "bg-orange-100 text-orange-800"
                                    : item.severity >= 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {getSeverityText(item.severity)} ({item.severity})
                              </Badge>
                            </TableCell>
                            <TableCell className="text-left">{item.status || "Not Set"}</TableCell>
                            <TableCell className="text-left">{item.controlCount || 0}</TableCell>
                            <TableCell className="text-left">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs text-left">
                                  {item.createdBy?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="text-right relative custom-dropdown text-left">
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
                                    onClick={() => {
                                      handleStatusUpdate(item, "Completed");
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-b flex items-center"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Completed
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusUpdate(item, "Pending");
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors border-b flex items-center"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusUpdate(item, "Rejected");
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                    Rejected
                                  </button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>

                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t text-left">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} risks
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <AddRiskForm 
              isOpen={isAddRiskDialogOpen} 
              onOpenChange={setAddRiskDialogOpen}
              onAdd={handleAddRisk}
              projects={projects}
            />
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to all risks
                </Button>
                <div className="text-sm text-muted-foreground">
                  Today • Last updated by
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{selectedRisk?.riskAssessmentId}</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {getSeverityText(selectedRisk?.severity)} ({selectedRisk?.severity})
                  </Badge>
                  <Badge variant="outline">{selectedRisk?.status}</Badge>
                </div>
                <h2 className="text-xl text-muted-foreground mt-1">{selectedRisk?.riskName}</h2>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIRiskAssessment;
