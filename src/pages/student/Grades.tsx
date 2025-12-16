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
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Download,
  TrendingUp,
  CalendarDays,
  Award,
  BarChart3,
  User,
  School,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

interface Course {
  courseCode: string;
  courseTitle: string;
  totalCrHrs: number;
  letterGrade: string;
  gradePoint: number;
}

interface StudentCopy {
  classyear: { id: number; name: string };
  semester: { id: string; name: string };
  academicYear?: string | null;
  courses: Course[];
  semesterGPA: number;
  semesterCGPA: number;
  status: string;
}

interface StudentData {
  idNumber: string;
  fullName: string;
  gender: string;
  birthDateGC: string;
  programModality: { id: string; name: string };
  programLevel: { id: string | null; name: string | null };
  department: { id: number; name: string };
  dateEnrolledGC: string;
  dateIssuedGC: string;
  studentCopies: StudentCopy[];
}

export default function StudentGradeReport() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openYears, setOpenYears] = useState<{ [key: number]: boolean }>({});
  const [openSemesters, setOpenSemesters] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchGradeReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.get(endPoints.studentGradeReports); // "/api/student/grade-reports"
        console.log(response);
        const apiData = response;

        // Correctly extract the first student from gradeReports array
        if (apiData.gradeReports && apiData.gradeReports.length > 0) {
          const student = apiData.gradeReports[0];

          // Ensure studentCopies exists
          if (student.studentCopies && student.studentCopies.length > 0) {
            setStudentData(student);

            // Auto-open first year and first semester
            setOpenYears({ 0: true });
            setOpenSemesters({ "0-0": true });
          } else {
            setError("No semester grade data available for this student.");
          }
        } else {
          setError("No student grade report found.");
        }
      } catch (err: any) {
        console.error("Error fetching grade report:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load grade report. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGradeReport();
  }, []);

  // Calculations
  const totalCreditsAttempted =
    studentData?.studentCopies.reduce(
      (sum, copy) =>
        sum + copy.courses.reduce((acc, course) => acc + course.totalCrHrs, 0),
      0
    ) || 0;

  const totalGradePoints =
    studentData?.studentCopies.reduce(
      (sum, copy) =>
        sum + copy.courses.reduce((acc, course) => acc + course.gradePoint, 0),
      0
    ) || 0;

  const overallGPA =
    totalCreditsAttempted > 0
      ? (totalGradePoints / totalCreditsAttempted).toFixed(4)
      : "0.00";

  const latestCGPA =
    studentData?.studentCopies.length > 0
      ? studentData.studentCopies[
          studentData.studentCopies.length - 1
        ].semesterCGPA.toFixed(4)
      : "0.00";

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-blue-600 text-white";
    if (grade.includes("B")) return "bg-blue-500 text-white";
    if (grade.includes("C")) return "bg-gray-500 text-white";
    if (grade === "F") return "bg-red-600 text-white";
    return "bg-gray-400 text-white";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {error || "No data available."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Academic Grade Report
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Student Info */}
        <Card className="border-blue-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full Name
              </p>
              <p className="font-semibold">{studentData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID Number
              </p>
              <p className="font-semibold">{studentData.idNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Department
              </p>
              <p className="font-semibold">{studentData.department.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Program
              </p>
              <p className="font-semibold">
                {studentData.programModality.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enrolled
              </p>
              <p className="font-semibold flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                {studentData.dateEnrolledGC}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Report Issued
              </p>
              <p className="font-semibold">{studentData.dateIssuedGC}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallGPA}
              </div>
              <p className="text-xs text-muted-foreground">4.0 Scale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Credits
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCreditsAttempted}</div>
              <p className="text-xs text-muted-foreground">Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {studentData.studentCopies[0]?.status || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Good Standing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current CGPA
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {latestCGPA}
              </div>
              <Progress value={parseFloat(latestCGPA) * 25} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card className="border-blue-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400 flex items-center">
              <School className="mr-2 h-5 w-5" />
              Detailed Academic Results
            </CardTitle>
            <CardDescription>
              Course grades by year and semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentData.studentCopies.map((copy, idx) => (
              <div key={idx} className="mb-8 last:mb-0">
                {/* Year */}
                <button
                  onClick={() =>
                    setOpenYears((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-lg font-semibold transition-colors border ${
                    openYears[idx]
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="flex items-center">
                    {openYears[idx] ? (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                    Year {copy.classyear.name}
                  </span>
                </button>

                {openYears[idx] && (
                  <div className="mt-4">
                    {/* Semester */}
                    <button
                      onClick={() =>
                        setOpenSemesters((prev) => ({
                          ...prev,
                          [`${idx}-0`]: !prev[`${idx}-0`],
                        }))
                      }
                      className={`w-full flex items-center p-3 rounded-lg font-medium text-left transition-colors border ml-4 sm:ml-8 ${
                        openSemesters[`${idx}-0`]
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      {openSemesters[`${idx}-0`] ? (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                      {copy.semester.name} (GPA: {copy.semesterGPA.toFixed(4)} |
                      CGPA: {copy.semesterCGPA.toFixed(4)})
                    </button>

                    {openSemesters[`${idx}-0`] && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                          <thead className="bg-blue-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Course Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Course Title
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Cr. Hrs
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Grade
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Points
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {copy.courses.map((course, cIdx) => (
                              <tr
                                key={cIdx}
                                className="hover:bg-blue-50 dark:hover:bg-gray-800"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {course.courseCode}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                  {course.courseTitle}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">
                                  {course.totalCrHrs}
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                  <Badge
                                    className={getGradeColor(
                                      course.letterGrade
                                    )}
                                  >
                                    {course.letterGrade}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-mono text-gray-900 dark:text-gray-100">
                                  {course.gradePoint.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
