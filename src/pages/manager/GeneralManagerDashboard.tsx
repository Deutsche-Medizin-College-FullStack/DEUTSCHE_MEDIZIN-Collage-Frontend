"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
  GraduationCap,
  FileText,
  Building2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// Interfaces (based on your API response)
interface DashboardData {
  studentOverview: {
    totalEnrolled: number;
    byDepartment: { departmentName: string; count: number }[];
    byProgramModality: { modality: string; count: number }[];
    byStatus: { status: string; count: number }[];
    incompleteDocuments: number;
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

export default function GeneralManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DashboardData>(
        endPoints.getGeneralManagerDashboard
      );
      setData(response.data);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <AlertCircle className="h-20 w-20 text-red-500" />
        <p className="text-xl font-medium text-red-600 dark:text-red-400 text-center max-w-md">
          {error || "Unable to load dashboard data"}
        </p>
        <Button
          onClick={fetchDashboard}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="h-5 w-5" />
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

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">
          General Manager Dashboard
        </h1>
        <Button
          onClick={fetchDashboard}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Student Overview */}
      <Card className="border-blue-200 dark:border-blue-800 shadow-md">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
          <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
            <Users className="h-6 w-6" /> Student Overview
          </CardTitle>
          <CardDescription>
            Total enrolled: {studentOverview.totalEnrolled}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Incomplete Documents
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {studentOverview.incompleteDocuments}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By Status
            </p>
            <div className="flex flex-wrap gap-2">
              {studentOverview.byStatus.map((s) => (
                <Badge
                  key={s.status}
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-950/50"
                >
                  {s.status}: {s.count}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By Department
            </p>
            <div className="flex flex-wrap gap-2">
              {studentOverview.byDepartment.map((d) => (
                <Badge key={d.departmentName} variant="secondary">
                  {d.departmentName}: {d.count}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By Modality
            </p>
            <div className="flex flex-wrap gap-2">
              {studentOverview.byProgramModality.map((m) => (
                <Badge key={m.modality} variant="outline">
                  {m.modality}: {m.count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Overview */}
      <Card className="border-blue-200 dark:border-blue-800 shadow-md">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
          <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
            <FileText className="h-6 w-6" /> Application Overview
          </CardTitle>
          <CardDescription>
            Total applied: {applicationOverview.totalApplied}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {applicationOverview.pendingCount}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By Status
            </p>
            <div className="flex flex-wrap gap-2">
              {applicationOverview.byStatus.map((s) => (
                <Badge key={s.status} variant="outline">
                  {s.status}: {s.count}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              By Department
            </p>
            <div className="flex flex-wrap gap-2">
              {applicationOverview.byDepartment.map((d) => (
                <Badge key={d.departmentName} variant="secondary">
                  {d.departmentName}: {d.count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff & Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 dark:border-blue-800 shadow-md">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
              <Users className="h-6 w-6" /> Staff Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Teachers
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {staffOverview.totalTeachers}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Registrars
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {staffOverview.totalRegistrars}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Dept Heads
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {staffOverview.totalDepartmentHeads}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Deans/Vice-Deans
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {staffOverview.totalDeansViceDeans}
              </p>
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Staff
              </p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {staffOverview.totalStaff}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 shadow-md">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
              <Building2 className="h-6 w-6" /> Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-10">
            <div className="text-center space-y-4">
              <p className="text-6xl font-bold text-blue-700 dark:text-blue-300">
                {departmentOverview.totalDepartments}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Total Departments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Alerts & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 dark:border-blue-800 shadow-md">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" /> Operational Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <span className="font-medium">Pending Applications</span>
              <Badge variant="outline" className="text-xl px-4 py-2">
                {operationalAlerts.pendingApplications}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <span className="font-medium">Students with Impairments</span>
              <Badge variant="outline" className="text-xl px-4 py-2">
                {operationalAlerts.studentsWithImpairments}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 shadow-md">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
              <BarChart3 className="h-6 w-6" /> Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {trends.enrollmentOverYears.map((trend) => (
                <div
                  key={trend.academicYear}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <span className="font-medium">{trend.academicYear}</span>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {trend.count} students
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
