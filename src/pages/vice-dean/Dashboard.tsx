"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useState, useEffect } from "react";
import apiService from "../../components/api/apiService";
import endPoints from "../../components/api/endPoints";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const getAlertIcon = (type) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "danger":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return null;
  }
};

export default function ViceDeanDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get(endPoints.viceDeanDashboard);
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Transform API data for charts
  const transformChartData = () => {
    if (!dashboardData) return {};

    // For Students by Department chart
    const departmentEntries = Object.entries(dashboardData.studentsPerDepartment || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const departmentLabels = departmentEntries.map(([dept]) => dept);
    const departmentData = departmentEntries.map(([, count]) => count);

    // For Enrollment Trend
    const enrollmentYears = Object.keys(dashboardData.enrollmentTrend || {});
    const enrollmentData = Object.values(dashboardData.enrollmentTrend || {});

    // For Gender Distribution
    const genderLabels = Object.keys(dashboardData.genderDistribution || {});
    const genderData = Object.values(dashboardData.genderDistribution || {});

    // Generate alerts based on actual data
    const generateAlerts = () => {
      const alerts = [];
      
      // Always show total students info
      alerts.push({
        id: 1,
        type: "info",
        text: `${dashboardData.totalStudents || 0} total students enrolled across all programs`,
      });
      
      // Show warning if exit exam pass rate is low
      if (dashboardData.exitExamPassRate < 85) {
        alerts.push({
          id: 2,
          type: "warning",
          text: `Exit exam pass rate is ${dashboardData.exitExamPassRate || 0}% - below target of 85%`,
        });
      }
      
      // Show department heads count
      alerts.push({
        id: 3,
        type: "info",
        text: `${dashboardData.totalDepartmentHeads || 0} department heads managing ${dashboardData.totalDepartments || 0} departments`,
      });

      return alerts.slice(0, 3); // Show only first 3 alerts
    };

    return {
      studentsByDept: {
        labels: departmentLabels,
        datasets: [
          {
            label: "Students",
            data: departmentData,
            backgroundColor: "#3B82F6",
          },
        ],
      },
      enrollmentTrend: {
        labels: enrollmentYears,
        datasets: [
          {
            label: "Enrollment",
            data: enrollmentData,
            borderColor: "#10B981",
            backgroundColor: "rgba(16,185,129,0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      genderDistribution: {
        labels: genderLabels,
        datasets: [
          {
            label: "Gender Distribution",
            data: genderData,
            backgroundColor: ["#3B82F6", "#EC4899"],
          },
        ],
      },
      alerts: generateAlerts(),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = transformChartData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Vice Dean Dashboard
          </h1>
          <div className="flex gap-2">
            <Link to="/vice-dean/create-department-head">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Create Department Head
              </Button>
            </Link>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Students
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.totalStudents?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Departments
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.totalDepartments || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Teachers
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.totalTeachers || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Department Heads
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.totalDepartmentHeads || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg lg:col-span-2">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Quick Alerts
              </h2>
              <ul className="space-y-2">
                {chartData.alerts?.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    {getAlertIcon(a.type)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {a.text}
                    </span>
                  </li>
                )) || <p className="text-gray-500">No alerts to display</p>}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                Academic Indicators
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Exit Exam Pass Rate
                  </h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {dashboardData.exitExamPassRate || 0}%
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Grade 12 Result
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {dashboardData.averageGrade12Result?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Modalities
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {dashboardData.activeModalities || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Students by Department (Top 5)
                </h3>
                <Bar
                  data={chartData.studentsByDept}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Enrollment Trend
                </h3>
                <Line
                  data={chartData.enrollmentTrend}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                  }}
                />
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Gender Distribution
                </h3>
                <Pie data={chartData.genderDistribution} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Students by Level & Modality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Students by Level
              </h3>
              <div className="space-y-2">
                {Object.entries(dashboardData.studentsByLevel || {}).map(([level, count]) => (
                  <div
                    key={level}
                    className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {level}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Students by Modality
              </h3>
              <div className="space-y-2">
                {Object.entries(dashboardData.studentsByModality || {}).map(([modality, count]) => (
                  <div
                    key={modality}
                    className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {modality}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}