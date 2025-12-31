import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  Award,
  ClipboardList,
  BarChart3,
   Hash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

interface DashboardCourse {
  assignmentId: number;
  courseCode: string;
  courseTitle: string;
  batchClassYearSemester: string;
  studentCount: number;
}

interface TeacherDashboardResponse {
  message: string;
  teacherNameENG: string;
  teacherNameAMH: string;
  department: string;
  totalAssignedCourses: number;
  totalStudents: number;
  totalAssessmentsCreated: number;
  pendingAssessments: number;
  recentCourses: DashboardCourse[];
}

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<TeacherDashboardResponse>(
          endPoints.teacherDashboard
        );
        setDashboardData(response.data);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.error || 
          err.message || 
          "Failed to load dashboard data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const teacherName = dashboardData?.teacherNameENG || "Teacher";
  const department = dashboardData?.department || "Department";
  const totalCourses = dashboardData?.totalAssignedCourses || 0;
  const totalStudents = dashboardData?.totalStudents || 0;
  const totalAssessments = dashboardData?.totalAssessmentsCreated || 0;
  const pendingAssessments = dashboardData?.pendingAssessments || 0;
  const recentCourses = dashboardData?.recentCourses || [];

  // Calculate assessment completion percentage
  const assessmentCompletion = totalAssessments > 0 
    ? Math.round(((totalAssessments - pendingAssessments) / totalAssessments) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {teacherName}!
            </h1>
            <p className="text-blue-100 opacity-90">
              {dashboardData?.teacherNameAMH && (
                <span className="block mb-1">{dashboardData.teacherNameAMH}</span>
              )}
              Ready to inspire the next generation of professionals?
            </p>
            <p className="text-sm text-blue-200 mt-2">
              Today is {formatDate()}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/20 backdrop-blur-sm">
            {department} Department
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Assigned Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCourses}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Currently teaching
            </p>
            {recentCourses.length > 0 && (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                Latest: {recentCourses[0].courseTitle}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all courses
            </p>
            <div className="mt-3 flex items-center">
              <Activity className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Active learners
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Assessments
            </CardTitle>
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAssessments}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Created this semester
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-medium">{pendingAssessments}</span>
              </div>
              <Progress value={assessmentCompletion} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Teaching Load
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalCourses > 0 ? "Active" : "None"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current semester
            </p>
            <div className="mt-3 flex items-center">
              <Clock className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {totalCourses} course{totalCourses !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Recent Courses
            </CardTitle>
            <CardDescription>Your currently assigned courses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course, index) => (
                  <div key={course.assignmentId} className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {course.courseTitle}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                          <Hash className="h-3 w-3 mr-1" />
                          {course.courseCode}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {course.batchClassYearSemester}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="h-3 w-3 mr-1" />
                        {course.studentCount} student{course.studentCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/teacher/assessments/${course.assignmentId}`} state={{
                          courseTitle: course.courseTitle,
                          courseCode: course.courseCode,
                          batch: course.batchClassYearSemester
                        }}>
                          <Button size="sm" variant="ghost" className="h-7">
                            <FileText className="h-3 w-3 mr-1" />
                            Assessments
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/teacher/courses">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Courses
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No courses assigned yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Teaching Statistics
            </CardTitle>
            <CardDescription>Your academic performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Student Distribution */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Student Distribution</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {totalStudents} total
                  </span>
                </div>
                <div className="space-y-1">
                  {recentCourses.map((course) => (
                    <div key={course.assignmentId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                        {course.courseCode}
                      </span>
                      <div className="flex items-center flex-1">
                        <Progress 
                          value={totalStudents > 0 ? (course.studentCount / totalStudents) * 100 : 0} 
                          className="h-2 flex-1 mx-2" 
                        />
                        <span className="font-medium min-w-[40px] text-right">
                          {course.studentCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Status */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Assessment Status</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {totalAssessments - pendingAssessments} of {totalAssessments}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-medium">
                      {totalAssessments - pendingAssessments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-medium">{pendingAssessments}</span>
                  </div>
                  <Progress 
                    value={assessmentCompletion} 
                    className="h-2" 
                  />
                </div>
              </div>

              {/* Department Performance */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Department</span>
                  </div>
                  <Badge variant="outline">{department}</Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  You're contributing to the {department} department with {totalCourses} active course{totalCourses !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/teacher/courses">
              <Button variant="outline" className="h-20 w-full flex-col bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <BookOpen className="h-6 w-6 mb-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">My Courses</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  View all courses
                </span>
              </Button>
            </Link>

            <Link to={`/teacher/assessments/${recentCourses[0]?.assignmentId || ''}`} 
                  state={recentCourses[0] ? {
                    courseTitle: recentCourses[0].courseTitle,
                    courseCode: recentCourses[0].courseCode,
                    batch: recentCourses[0].batchClassYearSemester
                  } : {}}>
              <Button 
                variant="outline" 
                className="h-20 w-full flex-col bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20"
                disabled={!recentCourses[0]}
              >
                <FileText className="h-6 w-6 mb-2 text-green-600 dark:text-green-400" />
                <span className="font-medium">Assessments</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Manage scores
                </span>
              </Button>
            </Link>

            <Link to="/teacher/profile">
              <Button variant="outline" className="h-20 w-full flex-col bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <ClipboardList className="h-6 w-6 mb-2 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">Profile</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  View profile
                </span>
              </Button>
            </Link>

            <Button 
              variant="outline" 
              className="h-20 w-full flex-col bg-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={() => window.open('/teacher/reports', '_blank')}
            >
              <TrendingUp className="h-6 w-6 mb-2 text-orange-600 dark:text-orange-400" />
              <span className="font-medium">Reports</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Generate reports
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}