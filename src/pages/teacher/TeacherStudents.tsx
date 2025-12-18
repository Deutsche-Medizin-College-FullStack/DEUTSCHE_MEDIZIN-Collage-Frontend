import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Mail, 
  Phone, 
  Download, 
  Filter, 
  Users,
  Loader2,
  AlertCircle,
  Building
} from "lucide-react";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";
import { toast } from "sonner";

// Interface for student data from API
interface Student {
  studentId: number;
  studentIdNumber: string;
  fullNameENG: string;
  fullNameAMH: string;
  email: string;
  phoneNumber: string;
  department: string;
  program: string;
}

interface CourseStudentsResponse {
  message: string;
  totalStudents: number;
  students: Student[];
}

export default function TeacherStudents() {
  const location = useLocation();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Get course info from location state
  const courseInfoFromState = location.state || {};
  const [courseInfo, setCourseInfo] = useState({
    name: courseInfoFromState.courseTitle || "",
    code: courseInfoFromState.courseCode || "",
    batch: courseInfoFromState.batch || "",
    totalStudents: 0
  });

  useEffect(() => {
    if (assignmentId) {
      fetchCourseStudents();
    }
  }, [assignmentId]);

  const fetchCourseStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use assignmentId from params
      const response = await apiClient.get<CourseStudentsResponse>(
        endPoints.getCourseStudents.replace(":teacherCourseAssignmentId", assignmentId!)
      );
      
      // Ensure all student properties have safe defaults
      const safeStudents = response.data.students.map(student => ({
        ...student,
        fullNameENG: student.fullNameENG || "",
        studentIdNumber: student.studentIdNumber || "",
        email: student.email || "",
        phoneNumber: student.phoneNumber || "",
        department: student.department || "",
        program: student.program || "",
        fullNameAMH: student.fullNameAMH || ""
      }));
      
      setStudents(safeStudents);
      setCourseInfo(prev => ({
        ...prev,
        totalStudents: response.data.totalStudents
      }));
      
      toast.success(response.data.message || "Students loaded successfully");
      
    } catch (err: any) {
      console.error("Error fetching students:", err);
      const errorMessage = err.response?.data?.error || 
        err.message || 
        "Failed to load student data. Please try again later.";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Safe filter function with null/undefined checks
  const filteredStudents = students.filter((student) => {
    if (!student) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Check each property safely
    return (
      (student.fullNameENG && student.fullNameENG.toLowerCase().includes(searchTermLower)) ||
      (student.studentIdNumber && student.studentIdNumber.toLowerCase().includes(searchTermLower)) ||
      (student.email && student.email.toLowerCase().includes(searchTermLower)) ||
      (student.fullNameAMH && student.fullNameAMH.toLowerCase().includes(searchTermLower)) ||
      (student.phoneNumber && student.phoneNumber.includes(searchTerm)) ||
      (student.department && student.department.toLowerCase().includes(searchTermLower)) ||
      (student.program && student.program.toLowerCase().includes(searchTermLower))
    );
  });

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .filter(char => char) // Remove empty strings
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone.trim() === "") return "Not provided";
    // Basic formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading student data...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 px-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-red-600">Error Loading Students</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={fetchCourseStudents}
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Students
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {courseInfo.name} {courseInfo.code && `(${courseInfo.code})`}
              {courseInfo.batch && ` • ${courseInfo.batch}`} •{" "}
              {courseInfo.totalStudents} student{courseInfo.totalStudents !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {students.length > 0 && (
              <Button 
                className="bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300"
                onClick={() => {
                  // Export functionality
                  const csvContent = [
                    ['Student ID', 'Name (ENG)', 'Name (AMH)', 'Email', 'Phone', 'Department', 'Program'],
                    ...students.map(s => [
                      s.studentIdNumber || '',
                      s.fullNameENG || '',
                      s.fullNameAMH || '',
                      s.email || '',
                      s.phoneNumber || '',
                      s.department || '',
                      s.program || ''
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `students-course-${assignmentId}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  
                  toast.success("Student list exported successfully!");
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export List
              </Button>
            )}
            <Button
              variant="outline"
              className="border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={fetchCourseStudents}
            >
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Student Statistics - Only show Total Students and Departments */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Total Students
                </CardTitle>
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {students.length}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enrolled in this course
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Departments
                </CardTitle>
                <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(students.map(s => s.department || "").filter(Boolean)).size}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Unique departments
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Student List */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Student List
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {students.length > 0 
                ? "View student information for this course" 
                : "No students enrolled in this course"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      placeholder="Search students by name, ID, email, or phone..."
                      className="pl-10 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Student Table */}
                {filteredStudents.length > 0 ? (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <th className="text-left py-4 px-6 font-semibold">Student</th>
                            <th className="text-left py-4 px-6 font-semibold">Contact Information</th>
                            <th className="text-left py-4 px-6 font-semibold">Academic Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student) => (
                            <tr
                              key={student.studentId}
                              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-10 w-10 bg-blue-100 dark:bg-blue-900">
                                    <AvatarImage src="" alt={student.fullNameENG || "Student"} />
                                    <AvatarFallback className="bg-blue-500 text-white">
                                      {getInitials(student.fullNameENG)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {student.fullNameENG || "No Name Provided"}
                                    </div>
                                    {student.fullNameAMH && student.fullNameAMH.trim() !== "" && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {student.fullNameAMH}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      ID: {student.studentIdNumber || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm">
                                    <Mail className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                    <span className="text-blue-600 dark:text-blue-400 truncate" title={student.email || "No email"}>
                                      {student.email || "No email provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                    <span title={student.phoneNumber || ""}>
                                      {formatPhoneNumber(student.phoneNumber)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Department:</span>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                                      {student.department || "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Program:</span>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                                      {student.program || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        Showing {filteredStudents.length} of {students.length} students
                        {searchTerm && ` matching "${searchTerm}"`}
                      </div>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  // Show "no results found" message when search returns no results
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      No students found matching "{searchTerm}" in this course
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                      <Button
                        variant="default"
                        onClick={fetchCourseStudents}
                      >
                        <Loader2 className="mr-2 h-4 w-4" />
                        Refresh List
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Show "no students enrolled" message when course has no students
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Students Enrolled
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  There are no students enrolled in this course yet.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={fetchCourseStudents}
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => window.history.back()}
                  >
                    Back to Courses
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Summary - Show department distribution only */}
        {students.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Department Distribution
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Breakdown of students by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  students.reduce((acc, student) => {
                    if (!student) return acc;
                    const dept = student.department || "Unknown";
                    acc[dept] = (acc[dept] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                .sort((a, b) => b[1] - a[1]) // Sort by count descending
                .map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dept}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 mr-3">
                        {count} student{count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({Math.round((count / students.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}