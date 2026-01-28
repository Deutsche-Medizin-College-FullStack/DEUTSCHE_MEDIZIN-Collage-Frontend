"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import Carousel from "@/components/Extra/Carousel";
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
import { 
  Users, 
  UserPlus, 
  FileText, 
  AlertCircle, 
  GraduationCap,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

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



export default function RegistrarDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endPoints.getRegistrarDashboard);
      setDashboardData(response.data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Failed to load dashboard data. Please try again later."
      );
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from API response
  const genderDistributionData = dashboardData?.applicantGenderDistribution ? {
    labels: Object.keys(dashboardData.applicantGenderDistribution),
    datasets: [
      {
        label: 'Gender Distribution',
        data: Object.values(dashboardData.applicantGenderDistribution),
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 1,
      },
    ],
  } : {
    labels: ['MALE', 'FEMALE'],
    datasets: [{
      label: 'Gender Distribution',
      data: [0, 0],
      backgroundColor: ['#3B82F6', '#EC4899'],
    }],
  };

  const enrollmentByDepartmentData = dashboardData?.enrollmentByDepartment ? {
    labels: Object.keys(dashboardData.enrollmentByDepartment),
    datasets: [
      {
        label: 'Students Enrolled',
        data: Object.values(dashboardData.enrollmentByDepartment),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4'
        ],
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      label: 'Students Enrolled',
      data: [0],
      backgroundColor: ['#9CA3AF'],
    }],
  };

  const averageScoresData = dashboardData?.averageScoresByDepartment ? {
    labels: Object.keys(dashboardData.averageScoresByDepartment),
    datasets: [
      {
        label: 'Average Score',
        data: Object.values(dashboardData.averageScoresByDepartment),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      label: 'Average Score',
      data: [0],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    }],
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Unknown
        </Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="default"
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Overview of applicants, students, and academic performance
          </p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          >
            <GraduationCap className="h-10 w-10" />
          </motion.div>
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              👋 Welcome, Registrar
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              Manage student applications, monitor academic performance, and oversee enrollment statistics across all departments.
            </p>
          </div>
          <Button 
            onClick={fetchDashboardData}
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            Refresh Data
          </Button>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applicants</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {dashboardData?.totalApplicants || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="text-yellow-600 font-medium">{dashboardData?.pendingApplicants || 0}</span> pending
                  </p>
                </div>
                <UserPlus className="h-10 w-10 text-blue-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered Students</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {dashboardData?.registeredStudents || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="text-green-600 font-medium">{dashboardData?.activeStudents || 0}</span> active
                  </p>
                </div>
                <Users className="h-10 w-10 text-green-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Incomplete Documents</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {dashboardData?.incompleteDocuments || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Need attention
                  </p>
                </div>
                <FileText className="h-10 w-10 text-yellow-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Departments</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {dashboardData?.totalDepartments || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Active programs
                  </p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Applicants Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/registrar/add-student">
                  <Button className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    Add New Student
                  </Button>
                </Link>
                <Link to="/registrar/scores">
                  <Button className="w-full h-12 bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                    Review Score
                  </Button>
                </Link>
                <Link to="/registrar/students">
                  <Button className="w-full h-12 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                    Manage Students
                  </Button>
                </Link>
                <Link to="/registrar/assessments">
                  <Button className="w-full h-12 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
                    Approve Assessments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applicants */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Recent Applicants
                </h2>
                <Link
                  to="/registrar/applications"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {dashboardData?.recentApplicants?.length > 0 ? (
                  dashboardData.recentApplicants.slice(0, 5).map((applicant: any) => (
                    <div key={applicant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{applicant.firstNameENG}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{applicant.departmentEnrolled}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getApplicationStatusBadge(applicant.applicationStatus)}
                        <Link to={`/registrar/applications/${applicant.id}`}>
                          <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent applicants</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gender Distribution */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                Applicant Gender Distribution
              </h3>
              <div className="h-64">
                <Doughnut 
                  data={genderDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#6B7280',
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enrollment by Department */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                Enrollment by Department
              </h3>
              <div className="h-64">
                <Bar
                  data={enrollmentByDepartmentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#6B7280'
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#6B7280'
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Average Scores by Department */}
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                Average Scores by Department
              </h3>
              <div className="h-64">
                <Line
                  data={averageScoresData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          color: '#6B7280'
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#6B7280'
                        },
                        grid: {
                          color: 'rgba(107, 114, 128, 0.1)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#6B7280'
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Score Alerts */}
        {dashboardData?.lowScoreAlerts?.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Low Score Alerts (Students Below 50%)
                </h2>
                <Badge variant="outline" className="border-yellow-300 text-yellow-600 dark:border-yellow-700 dark:text-yellow-400">
                  {dashboardData.lowScoreAlerts.length} students
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.lowScoreAlerts.map((alert: any, index: number) => (
                  <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{alert.fullName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {alert.studentId}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        {alert.avgScore.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                      Below average performance - Needs academic support
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty States for Enrollment Trends if no data */}
        {(!dashboardData?.enrollmentTrendsByAcademicYear || dashboardData.enrollmentTrendsByAcademicYear.length === 0) && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Enrollment Trends
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No enrollment trend data available for the current academic years.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}