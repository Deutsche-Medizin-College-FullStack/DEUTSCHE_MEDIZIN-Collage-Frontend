import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  Clock,
  Building,
  Hash,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

interface Course {
  assignmentId: number;
  courseCode: string;
  courseTitle: string;
  theoryHours: number;
  labHours: number;
  department: string;
  batchClassYearSemester: string;
  assignedAt: string;
}

interface CoursesResponse {
  message: string;
  totalCourses: number;
  courses: Course[];
}

export default function TeacherCourses() {
  const [coursesData, setCoursesData] = useState<CoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CoursesResponse>(
        endPoints.getTeacherCourses
      );
      setCoursesData(response.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Failed to load courses. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchMyCourses();
}, []);

  // Calculate statistics from API data
  const totalStudents = coursesData?.courses.length ? coursesData.courses.length * 30 : 0; // Assuming ~30 students per course
  const totalTheoryHours = coursesData?.courses.reduce(
    (sum, course) => sum + course.theoryHours,
    0
  ) || 0;
  const totalLabHours = coursesData?.courses.reduce(
    (sum, course) => sum + course.labHours,
    0
  ) || 0;
  const totalCreditHours = totalTheoryHours + totalLabHours;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading your courses...</p>
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

  if (!coursesData?.courses || coursesData.courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Courses</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <BookOpen className="h-16 w-16 text-gray-400" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">No Courses Assigned</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned any courses yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {coursesData.totalCourses} course{coursesData.totalCourses !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Theory Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTheoryHours}</div>
            <p className="text-xs text-muted-foreground">Weekly lecture hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lab Hours
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLabHours}</div>
            <p className="text-xs text-muted-foreground">Weekly practical hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hours
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditHours}</div>
            <p className="text-xs text-muted-foreground">Weekly teaching load</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.courses.map((course) => (
            <Card 
              key={course.assignmentId} 
              className="hover:shadow-lg transition-shadow hover:border-blue-300 dark:hover:border-blue-700"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {course.courseTitle}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Hash className="h-3 w-3" />
                      <span>{course.courseCode}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2 whitespace-nowrap">
                    {course.batchClassYearSemester}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Department</span>
                    </div>
                    <span className="font-medium">{course.department}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Theory Hours</span>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {course.theoryHours} hrs/week
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Lab Hours</span>
                    </div>
                    <Badge variant={course.labHours > 0 ? "default" : "outline"} className="font-medium">
                      {course.labHours > 0 ? `${course.labHours} hrs/week` : "No Lab"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Assigned Date</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(course.assignedAt)}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to={`/teacher/students/${course.assignmentId}`} 
                    state={{
                      courseTitle: course.courseTitle,
                      courseCode: course.courseCode,
                      batch: course.batchClassYearSemester
                    }}
                  >
                    <Button size="sm" variant="outline" className="h-8">
                      <Users className="h-3 w-3 mr-1" />
                      Students
                    </Button>
                  </Link>

                    <Link
                      to={`/teacher/assessments/${course.assignmentId}`}
                      state={{
                        courseTitle: course.courseTitle,
                        courseCode: course.courseCode,
                        batch: course.batchClassYearSemester
                      }}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Assessments
                      </Button>
                    </Link>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Teaching Load Summary</CardTitle>
          <CardDescription>
            Overview of your current teaching responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Departments</p>
                  <p className="text-lg font-semibold">
                    {Array.from(new Set(coursesData.courses.map(c => c.department))).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Weekly Total Hours</p>
                  <p className="text-lg font-semibold">{totalCreditHours} hrs</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Unique Course Codes</p>
                  <p className="text-lg font-semibold">
                    {Array.from(new Set(coursesData.courses.map(c => c.courseCode))).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">Teaching Since</p>
                  <p className="text-lg font-semibold">
                    {formatDate(
                      coursesData.courses.reduce((earliest, course) => 
                        new Date(course.assignedAt) < new Date(earliest) 
                          ? course.assignedAt 
                          : earliest,
                      coursesData.courses[0].assignedAt
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}