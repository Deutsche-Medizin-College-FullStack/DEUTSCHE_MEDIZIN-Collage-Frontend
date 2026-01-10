"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  Users, 
  Building, 
  UserCog, 
  GraduationCap, 
  Award, 
  TrendingUp,
  AlertTriangle,
  FileText,
  Calendar,
  BarChart3,
  User,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
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

interface DeanDashboardData {
  totalStudents: number;
  totalDepartments: number;
  totalDepartmentHeads: number;
  activeModalities: number;
  activeLevels: number;
  studentsByLevel: Record<string, number>;
  studentsByModality: Record<string, number>;
  studentsPerDepartment: Record<string, number>;
  enrollmentTrend: Record<string, number>;
  genderDistribution: Record<string, number>;
  totalTeachers: number;
  averageGrade12Result: number;
  exitExamPassRate: number;
}

const upcomingEvents = [
  { id: 1, title: "Midterm Exams", date: "Oct 12", note: "All departments" },
  {
    id: 2,
    title: "Grade Submission Deadline",
    date: "Oct 25",
    note: "Semester 1",
  },
  {
    id: 3,
    title: "Results Announcement",
    date: "Nov 02",
    note: "Portal + Notice",
  },
];

const alerts = [
  { id: 1, type: "warning", text: "12 students at academic risk (GPA < 2.0)" },
  { id: 2, type: "danger", text: "3 disciplinary cases pending review" },
  { id: 3, type: "info", text: "7 course change requests awaiting approval" },
];

export default function DeanDashboard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DeanDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DeanDashboardData>(
        endPoints.deanDashboard
      );
      setDashboardData(response.data);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from API response
  const prepareDepartmentChartData = () => {
    if (!dashboardData?.studentsPerDepartment) return null;
    
    const labels = Object.keys(dashboardData.studentsPerDepartment);
    const data = Object.values(dashboardData.studentsPerDepartment);
    
    // Generate colors based on number of departments
    const colors = labels.map((_, index) => {
      const hue = (index * 137.508) % 360; // Golden angle approximation
      return `hsl(${hue}, 70%, 60%)`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('60%)', '40%)')),
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareGenderChartData = () => {
    if (!dashboardData?.genderDistribution) return null;
    
    const labels = Object.keys(dashboardData.genderDistribution).map(gender => 
      gender === 'MALE' ? 'Male' : 'Female'
    );
    const data = Object.values(dashboardData.genderDistribution);
    
    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data,
          backgroundColor: ['#3B82F6', '#EC4899'], // Blue for Male, Pink for Female
          hoverBackgroundColor: ['#2563EB', '#DB2777'],
        },
      ],
    };
  };

  const prepareLevelChartData = () => {
    if (!dashboardData?.studentsByLevel) return null;
    
    const labels = Object.keys(dashboardData.studentsByLevel);
    const data = Object.values(dashboardData.studentsByLevel);
    
    return {
      labels,
      datasets: [
        {
          label: 'Students by Program Level',
          data,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareModalityChartData = () => {
    if (!dashboardData?.studentsByModality) return null;
    
    const labels = Object.keys(dashboardData.studentsByModality);
    const data = Object.values(dashboardData.studentsByModality);
    
    // Generate colors
    const colors = labels.map((_, index) => {
      const hue = (index * 97.508) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Students by Modality',
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('60%)', '40%)')),
          borderWidth: 1,
        },
      ],
    };
  };

  const statsCards = [
    {
      label: "Total Students",
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Departments",
      value: dashboardData?.totalDepartments || 0,
      icon: Building,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Department Heads",
      value: dashboardData?.totalDepartmentHeads || 0,
      icon: UserCog,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Total Teachers",
      value: dashboardData?.totalTeachers || 0,
      icon: GraduationCap,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Active Modalities",
      value: dashboardData?.activeModalities || 0,
      icon: Award,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      label: "Program Levels",
      value: dashboardData?.activeLevels || 0,
      icon: TrendingUp,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  const performanceMetrics = [
    {
      label: "Average Grade 12 Result",
      value: dashboardData?.averageGrade12Result?.toFixed(2) || "0.00",
      icon: BarChart3,
      color: "text-emerald-600 dark:text-emerald-400",
      suffix: " points",
    },
    {
      label: "Exit Exam Pass Rate",
      value: dashboardData?.exitExamPassRate?.toFixed(1) || "0.0",
      icon: dashboardData?.exitExamPassRate > 50 ? CheckCircle : XCircle,
      color: dashboardData?.exitExamPassRate > 50 
        ? "text-green-600 dark:text-green-400" 
        : "text-red-600 dark:text-red-400",
      suffix: "%",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to load dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Dean Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive overview of college statistics and performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dean/students">
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600">
                <Users className="h-4 w-4" />
                View Students
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${metric.color.replace('text', 'bg')} bg-opacity-20`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </p>
                      <p className={`text-3xl font-bold ${metric.color} mt-1`}>
                        {metric.value}
                        <span className="text-lg">{metric.suffix}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Analytics & Distribution
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-4 w-4" />
              Real-time Statistics
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Students by Department
                  </h3>
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                {prepareDepartmentChartData() ? (
                  <div className="h-64">
                    <Bar
                      data={prepareDepartmentChartData()!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (context) => `Students: ${context.parsed.y}`
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#6B7280',
                              font: {
                                size: 11
                              }
                            },
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: '#6B7280',
                              font: {
                                size: 11
                              }
                            },
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No department data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Gender Distribution
                  </h3>
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                {prepareGenderChartData() ? (
                  <div className="h-64">
                    <Doughnut
                      data={prepareGenderChartData()!}
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
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.label}: ${context.parsed} students`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No gender data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Level Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Students by Program Level
                  </h3>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                {prepareLevelChartData() ? (
                  <div className="h-64">
                    <Bar
                      data={prepareLevelChartData()!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (context) => `Students: ${context.parsed.y}`
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#6B7280',
                            },
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: '#6B7280',
                            },
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No program level data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Modality Distribution */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Students by Modality
                  </h3>
                  <Award className="h-5 w-5 text-gray-400" />
                </div>
                {prepareModalityChartData() ? (
                  <div className="h-64">
                    <Pie
                      data={prepareModalityChartData()!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: '#6B7280',
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.label}: ${context.parsed} students`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No modality data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}