"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
  GraduationCap,
  FileText,
  Building2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  TrendingUp,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiService from "@/components/api/apiService";
import { clearCacheForUrl } from "@/components/api/cacheService";
import endPoints from "@/components/api/endPoints";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

// Interfaces
interface DashboardData {
  studentOverview: {
    totalEnrolled: number;
    byDepartment: { departmentName: string; count: number }[];
    byProgramModality: { modality: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  applicationOverview: {
    totalApplied: number;
    pendingCount: number;
    byStatus: { status: string; count: number }[];
    byDepartment: { departmentName: string; count: number }[];
  };
  staffOverview: {
    totalTeachers: number;
    totalRegistrars: number;
    totalDepartmentHeads: number;
    totalDeansViceDeans: number;
    totalStaff: number;
  };
  departmentOverview: {
    totalDepartments: number;
  };
  operationalAlerts: {
    pendingApplications: number;
    studentsWithImpairments: number;
  };
  trends: {
    enrollmentOverYears: { academicYear: string; count: number }[];
  };
}

// ─── 3 Theme Colors (Strictly 3 Colors: Blue, Emerald, Amber) ───
const COLOR_PRIMARY = "#2563eb";   // Blue
const COLOR_SECONDARY = "#059669"; // Emerald
const COLOR_ALERT = "#d97706";     // Amber

// Alternating colors for Status bars and items
const STATUS_ALTERNATING_COLORS = [COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ALERT];

// ─── Animation variants ───
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

// ─── Detect dark mode ───
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

// ─── Stat Card sub-component ───
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
        <CardContent className="pt-6 pb-5 flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {label}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
              <CountUp end={value} duration={1.6} separator="," />
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ───
export default function GeneralManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = useIsDark();

  // Dropdown states for detailed breakdowns (hidden by default)
  const [showDeptDetails, setShowDeptDetails] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<DashboardData>(
        endPoints.getGeneralManagerDashboard
      );
      setData(response);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    await clearCacheForUrl(endPoints.getGeneralManagerDashboard);
    await fetchDashboard();
  };

  // ── Chart.js global theme defaults ──
  useMemo(() => {
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.15)";
    ChartJS.defaults.color = textColor;
    ChartJS.defaults.borderColor = gridColor;
  }, [isDark]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-300">
          Loading dashboard data…
        </p>
      </div>
    );
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <AlertCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 text-center max-w-md">
          {error || "Unable to load dashboard data"}
        </p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Try Again
        </Button>
      </div>
    );
  }

  const {
    studentOverview,
    applicationOverview,
    staffOverview,
    departmentOverview,
    operationalAlerts,
    trends,
  } = data;

  // ── Chart data configurations ──

  // Students by Department (Horizontal Bar)
  const deptBarData = {
    labels: studentOverview.byDepartment.map((d) => d.departmentName),
    datasets: [
      {
        label: "Enrolled Students",
        data: studentOverview.byDepartment.map((d) => d.count),
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  // Students by Status (Horizontal Bar) with Alternating Colors
  const statusLabels = studentOverview.byStatus.map((s) =>
    s.status.replace(/_/g, " ")
  );
  const statusBarData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Students",
        data: studentOverview.byStatus.map((s) => s.count),
        backgroundColor: studentOverview.byStatus.map(
          (_, i) =>
            STATUS_ALTERNATING_COLORS[i % STATUS_ALTERNATING_COLORS.length]
        ),
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  // Applications by Status (Horizontal Bar)
  const appStatusBarData = {
    labels: applicationOverview.byStatus.map((s) =>
      s.status.replace(/_/g, " ")
    ),
    datasets: [
      {
        label: "Applications",
        data: applicationOverview.byStatus.map((s) => s.count),
        backgroundColor: applicationOverview.byStatus.map(
          (_, i) =>
            [COLOR_PRIMARY, COLOR_ALERT, COLOR_SECONDARY][
              i % 3
            ]
        ),
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  // Applications by Department (Vertical Bar)
  const appDeptBarData = {
    labels: applicationOverview.byDepartment.map((d) => d.departmentName),
    datasets: [
      {
        label: "Applications",
        data: applicationOverview.byDepartment.map((d) => d.count),
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 4,
      },
    ],
  };

  // Staff breakdown (Horizontal Bar)
  const staffBarData = {
    labels: ["Teachers", "Registrars", "Dept Heads", "Deans / Vice-Deans"],
    datasets: [
      {
        label: "Staff Count",
        data: [
          staffOverview.totalTeachers,
          staffOverview.totalRegistrars,
          staffOverview.totalDepartmentHeads,
          staffOverview.totalDeansViceDeans,
        ],
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  // Enrollment Trends (Line)
  const enrollmentLineData = {
    labels: trends.enrollmentOverYears.map((t) => t.academicYear),
    datasets: [
      {
        label: "Students Enrolled",
        data: trends.enrollmentOverYears.map((t) => t.count),
        borderColor: COLOR_PRIMARY,
        backgroundColor: isDark
          ? "rgba(37,99,235,0.15)"
          : "rgba(37,99,235,0.08)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: COLOR_PRIMARY,
        pointBorderColor: isDark ? "#1f2937" : "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // ── Chart Options with Custom Animation Speeds (Growing from 0) ──
  const barChartOptions = (
    indexAxis: "x" | "y" = "x",
    animationDuration = 1200,
    easing: any = "easeOutQuart"
  ) => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis,
    animation: {
      duration: animationDuration,
      easing,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#e5e7eb" : "#374151",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: indexAxis === "y",
          color: isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.12)",
        },
        ticks: { font: { size: 11 } },
        beginAtZero: true,
      },
      y: {
        grid: {
          display: indexAxis === "x",
          color: isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.12)",
        },
        ticks: { font: { size: 11 } },
        beginAtZero: true,
      },
    },
  });

  const lineChartOptions = (
    animationDuration = 2400,
    easing: any = "easeInOutQuart"
  ) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animationDuration,
      easing,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#e5e7eb" : "#374151",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: {
          color: isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.12)",
        },
        ticks: { font: { size: 11 } },
        beginAtZero: true,
      },
    },
  });

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ━━━━━━━━━━━━━ HEADER ━━━━━━━━━━━━━ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Institution Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time snapshot of students, staff, applications, and academic operations
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Refresh Data
        </Button>
      </motion.div>

      {/* ━━━━━━━━━━━━━ TOP KPI STAT CARDS ━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={GraduationCap}
          label="Total Students Enrolled"
          value={studentOverview.totalEnrolled}
          subtitle="Across all departments"
        />
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={applicationOverview.totalApplied}
          subtitle="All-time applications received"
        />
        <StatCard
          icon={Users}
          label="Total Staff Members"
          value={staffOverview.totalStaff}
          subtitle="Faculty & administrative staff"
        />
        <StatCard
          icon={Building2}
          label="Academic Departments"
          value={departmentOverview.totalDepartments}
          subtitle="Active degree programs"
        />
      </div>

      {/* ━━━━━━━━━━━━━ OPERATIONAL ALERTS ━━━━━━━━━━━━━ */}
      {(operationalAlerts.pendingApplications > 0 ||
        operationalAlerts.studentsWithImpairments > 0) && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardContent className="py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Action Items &amp; Operational Alerts
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {operationalAlerts.pendingApplications > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Pending Applications
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Awaiting review and decision
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      <CountUp
                        end={operationalAlerts.pendingApplications}
                        duration={1.2}
                      />
                    </span>
                  </div>
                )}
                {operationalAlerts.studentsWithImpairments > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Students with Impairments
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Registered for accessibility support
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      <CountUp
                        end={operationalAlerts.studentsWithImpairments}
                        duration={1.2}
                      />
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ━━━━━━━━━━━━━ STUDENT INSIGHTS ━━━━━━━━━━━━━ */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Enrollment &amp; Status Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Students by Department (Animation speed: 1200ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900 dark:text-white">
                Students by Department
              </CardTitle>
              <CardDescription>
                Exact count and distribution of students across all academic departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Chart visualization (grows from 0 at 1200ms) */}
              <div className="h-52">
                <Bar
                  data={deptBarData}
                  options={barChartOptions("y", 1200, "easeOutQuart")}
                />
              </div>

              {/* Dropdown Button to reveal/hide detailed counts */}
              <button
                type="button"
                onClick={() => setShowDeptDetails((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                <span className="flex items-center gap-2">
                  <span>
                    {showDeptDetails
                      ? "Hide Department Details"
                      : "View Department Details"}
                  </span>
                  <span className="text-gray-400 font-normal">
                    ({studentOverview.byDepartment.length} departments)
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
                    showDeptDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Collapsible Animated Detailed Progression Bars */}
              <AnimatePresence>
                {showDeptDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden space-y-3 pt-1 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                      Detailed Department Counts
                    </p>
                    {studentOverview.byDepartment.map((dept, i) => {
                      const pct =
                        studentOverview.totalEnrolled > 0
                          ? Math.round(
                              (dept.count / studentOverview.totalEnrolled) * 100
                            )
                          : 0;
                      return (
                        <div key={dept.departmentName} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs">
                              {dept.departmentName}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              <CountUp end={dept.count} duration={1.2} />{" "}
                              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                students (<CountUp end={pct} duration={1.2} />%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{
                                duration: 1.1,
                                ease: "easeOut",
                                delay: i * 0.08,
                              }}
                              className="bg-blue-600 h-2.5 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Card 2: Students by Status (Alternating Colors, Animation speed: 1800ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900 dark:text-white">
                Students by Status
              </CardTitle>
              <CardDescription>
                Current enrollment status distribution with alternating colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Chart visualization with alternating colors (grows from 0 at 1800ms) */}
              <div className="h-52">
                <Bar
                  data={statusBarData}
                  options={barChartOptions("y", 1800, "easeOutCubic")}
                />
              </div>

              {/* Dropdown Button to reveal/hide status details */}
              <button
                type="button"
                onClick={() => setShowStatusDetails((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                <span className="flex items-center gap-2">
                  <span>
                    {showStatusDetails
                      ? "Hide Status Breakdown"
                      : "View Status Breakdown"}
                  </span>
                  <span className="text-gray-400 font-normal">
                    ({studentOverview.byStatus.length} statuses)
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
                    showStatusDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Collapsible Animated Status Breakdown */}
              <AnimatePresence>
                {showStatusDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden space-y-4 pt-1 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                      Status Breakdown
                    </p>
                    <div className="space-y-3">
                      {studentOverview.byStatus.map((item, i) => {
                        const pct =
                          studentOverview.totalEnrolled > 0
                            ? Math.round(
                                (item.count / studentOverview.totalEnrolled) * 100
                              )
                            : 0;
                        const barColor =
                          STATUS_ALTERNATING_COLORS[
                            i % STATUS_ALTERNATING_COLORS.length
                          ];

                        return (
                          <div key={item.status} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {item.status.replace(/_/g, " ")}
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                <CountUp end={item.count} duration={1.2} />{" "}
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                  students (<CountUp end={pct} duration={1.2} />%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min(pct, 100)}%` }}
                                transition={{
                                  duration: 1.1,
                                  ease: "easeOut",
                                  delay: i * 0.08,
                                }}
                                style={{ backgroundColor: barColor }}
                                className="h-2.5 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Program Modality Section inside the dropdown */}
                    {studentOverview.byProgramModality.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                          Program Modality
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {studentOverview.byProgramModality.map((m, i) => {
                            const pct =
                              studentOverview.totalEnrolled > 0
                                ? Math.round(
                                    (m.count / studentOverview.totalEnrolled) * 100
                                  )
                                : 0;
                            const modColor =
                              STATUS_ALTERNATING_COLORS[
                                i % STATUS_ALTERNATING_COLORS.length
                              ];
                            return (
                              <div
                                key={m.modality}
                                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {m.modality}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                  <CountUp end={m.count} duration={1.2} />{" "}
                                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                    (<CountUp end={pct} duration={1.2} />%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.min(pct, 100)}%` }}
                                    transition={{
                                      duration: 1.1,
                                      ease: "easeOut",
                                      delay: i * 0.1,
                                    }}
                                    style={{ backgroundColor: modColor }}
                                    className="h-1.5 rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ━━━━━━━━━━━━━ APPLICATION OVERVIEW ━━━━━━━━━━━━━ */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Application Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications by Status (Animation speed: 1400ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 dark:text-white">
                Applications by Status
              </CardTitle>
              <CardDescription>
                Breakdown of applications across processing stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={appStatusBarData}
                  options={barChartOptions("y", 1400, "easeOutQuad")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Applications by Department (Animation speed: 2000ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 dark:text-white">
                Applications per Department
              </CardTitle>
              <CardDescription>
                Number of applications submitted for each department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={appDeptBarData}
                  options={barChartOptions("x", 2000, "easeOutQuart")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ━━━━━━━━━━━━━ STAFF & ENROLLMENT TRENDS ━━━━━━━━━━━━━ */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Breakdown (Animation speed: 1600ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base text-gray-900 dark:text-white">
                  Staff Composition
                </CardTitle>
              </div>
              <CardDescription>
                Distribution across academic, administrative, and leadership roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Bar
                  data={staffBarData}
                  options={barChartOptions("y", 1600, "easeOutCubic")}
                />
              </div>

              {/* Total Staff highlight */}
              <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Campus Staff
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <CountUp end={staffOverview.totalStaff} duration={1.4} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Trends (Animation speed: 2500ms) */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base text-gray-900 dark:text-white">
                  Enrollment Over the Years
                </CardTitle>
              </div>
              <CardDescription>
                Historical student enrollment count per academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={enrollmentLineData}
                  options={lineChartOptions(2500, "easeInOutQuart")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
