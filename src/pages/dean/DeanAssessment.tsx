import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileCheck, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Search,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// ======================= TYPES ========================
interface DeanAssessment {
  message?: string;
  teacherCourseAssignmentId: number;
  teacherName: string;
  courseCode: string;
  courseTitle: string;
  batchClassYearSemester: string;
  departmentName?: string;
  assessments: Assessment[];
  students: StudentScore[];
}

interface Assessment {
  assessmentId: number;
  title: string;
  maxScore: number;
  dueDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  headApproval: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  deanApproval: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  registrarApproval: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface StudentScore {
  studentId: number;
  studentIdNumber: string;
  fullNameENG: string;
  fullNameAMH: string;
  scores: Score[];
}

interface Score {
  assessmentId: number;
  score: number;
}

interface BulkApproveResponse {
  message: string;
  count: number;
  statusApplied: 'ACCEPTED' | 'REJECTED';
}

interface CourseStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

// ======================= DEAN ASSESSMENT PAGE COMPONENT ========================
const DeanAssessment: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseAssessments, setCourseAssessments] = useState<DeanAssessment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DeanAssessment[]>(
        endPoints.getDeanHeadApprovedScores
      );
      setCourseAssessments(response.data || []);
    } catch (err: any) {
      console.error("Error fetching assessments:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Failed to load assessment data. Please try again later."
      );
      toast.error("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  };

  const getOverallCourseStatus = (course: DeanAssessment): string => {
    const assessments = course.assessments || [];
    
    // Check if all assessments are dean approved
    if (assessments.every((a) => a.deanApproval === 'ACCEPTED')) {
      return 'ACCEPTED';
    }
    
    // Check if any assessment is dean rejected
    if (assessments.some((a) => a.deanApproval === 'REJECTED')) {
      return 'REJECTED';
    }
    
    // Check if any assessment needs dean approval
    if (assessments.some((a) => 
      a.deanApproval === 'PENDING' && 
      a.headApproval === 'ACCEPTED'
    )) {
      return 'PENDING';
    }
    
    return 'PENDING';
  };

  const getCourseStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getHeadApprovalBadge = (course: DeanAssessment): JSX.Element => {
    const assessments = course.assessments || [];
    
    if (assessments.every((a) => a.headApproval === 'ACCEPTED')) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <ShieldCheck className="h-3 w-3 mr-1" />
          All Approved
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        In Progress
      </Badge>
    );
  };

  const getDeanApprovalBadge = (course: DeanAssessment): JSX.Element => {
    const assessments = course.assessments || [];
    
    if (assessments.every((a) => a.deanApproval === 'ACCEPTED')) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <Shield className="h-3 w-3 mr-1" />
          All Approved
        </Badge>
      );
    }
    
    if (assessments.some((a) => a.deanApproval === 'REJECTED')) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Some Rejected
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter courses based on search term and status
  const filteredCourses = courseAssessments.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    const courseStatus = getOverallCourseStatus(course);
    
    // Apply status filter
    if (filterStatus !== "ALL" && courseStatus !== filterStatus) {
      return false;
    }
    
    // Apply search filter
    return (
      course.courseTitle?.toLowerCase().includes(searchLower) ||
      course.courseCode?.toLowerCase().includes(searchLower) ||
      course.batchClassYearSemester?.toLowerCase().includes(searchLower) ||
      (course.teacherName && course.teacherName.toLowerCase().includes(searchLower))
    );
  });

  // Calculate statistics
  const getStatusCounts = (): CourseStatusCounts => {
    const counts: CourseStatusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    courseAssessments.forEach(course => {
      const status = getOverallCourseStatus(course);
      if (status === 'PENDING') counts.pending++;
      if (status === 'ACCEPTED') counts.approved++;
      if (status === 'REJECTED') counts.rejected++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">{error}</p>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={fetchAssessments}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dean Assessment Approval</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve course assessments that have been approved by department heads across the university
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by course, teacher, department, or batch..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ALL")}
              >
                All ({courseAssessments.length})
              </Button>
              <Button
                variant={filterStatus === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("PENDING")}
                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300"
              >
                Pending ({statusCounts.pending})
              </Button>
              <Button
                variant={filterStatus === "ACCEPTED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ACCEPTED")}
                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
              >
                Approved ({statusCounts.approved})
              </Button>
              <Button
                variant={filterStatus === "REJECTED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("REJECTED")}
                className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
              >
                Rejected ({statusCounts.rejected})
              </Button>
            </div>
            <Button onClick={fetchAssessments} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseAssessments.length}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Head-approved courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {statusCounts.pending}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Need your review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statusCounts.approved}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Dean approved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statusCounts.rejected}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Returned to heads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Assessment List</CardTitle>
          <CardDescription>
            All courses with assessments that have been approved by department heads and need dean approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== "ALL" 
                  ? "No courses match your search criteria" 
                  : "No head-approved courses are available for review yet."}
              </p>
              {(searchTerm || filterStatus !== "ALL") && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("ALL");
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Head Approval</TableHead>
                    <TableHead>Dean Status</TableHead>
                    <TableHead>Registrar Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course: DeanAssessment) => {
                    const courseStatus = getOverallCourseStatus(course);
                    
                    return (
                      <TableRow key={course.teacherCourseAssignmentId}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{course.courseTitle}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {course.courseCode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {course.batchClassYearSemester}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{course.teacherName || "N/A"}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Teacher
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{course.assessments?.length || 0} assessments</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Students: {course.students?.length || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getHeadApprovalBadge(course)}
                        </TableCell>
                        <TableCell>
                          {getDeanApprovalBadge(course)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            course.assessments?.[0]?.registrarApproval === 'ACCEPTED' 
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : course.assessments?.[0]?.registrarApproval === 'REJECTED'
                              ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                              : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                          }>
                            {course.assessments?.[0]?.registrarApproval || 'PENDING'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link to={`/dean/assessments/${course.teacherCourseAssignmentId}`}>
                            <Button 
                              variant={courseStatus === 'PENDING' ? "default" : "outline"} 
                              size="sm" 
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              {courseStatus === 'PENDING' ? 'Review Course' : 'View Details'}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeanAssessment;