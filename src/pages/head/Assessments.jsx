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
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

const HeadAssessments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseAssessments, setCourseAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        endPoints.getDepartmentHeadAssessments
      );
      setCourseAssessments(response.data);
    } catch (err) {
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

  const getHeadApprovalBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  const getAssessmentStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter assessments based on search term
const filteredAssessments = courseAssessments.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.courseTitle.toLowerCase().includes(searchLower) ||
      course.courseCode.toLowerCase().includes(searchLower) ||
      course.batchClassYearSemester.toLowerCase().includes(searchLower) ||
      (course.teacherFullNameENG && course.teacherFullNameENG.toLowerCase().includes(searchLower)) ||
      (course.teacherFullNameAMH && course.teacherFullNameAMH.toLowerCase().includes(searchLower)) ||
      (course.teacherTitle && course.teacherTitle.toLowerCase().includes(searchLower)) ||
      course.assessments.some(assessment => 
        assessment.title.toLowerCase().includes(searchLower)
      )
    );
  });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and approve assessments submitted by teachers in your department
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by course, teacher, batch, or assessment..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={fetchAssessments} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Updated to show teacher count */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseAssessments.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Courses with assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(courseAssessments.map(course => course.teacherFullNameENG)).size}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Teachers submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courseAssessments.reduce((total, course) => total + course.assessments.length, 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">All assessments</p>
          </CardContent>
        </Card>
        <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Review
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {courseAssessments.reduce((total, course) => 
                total + course.assessments.filter(a => a.headApproval === 'PENDING' || !a.headApproval).length, 0
            )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting your approval</p>
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
            {courseAssessments.reduce((total, course) => 
                total + course.assessments.filter(a => a.headApproval === 'ACCEPTED').length, 0  // Change to 'ACCEPTED'
            )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Approved by you</p>
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
              {courseAssessments.reduce((total, course) => 
                total + course.assessments.filter(a => a.headApproval === 'APPROVED').length, 0
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Approved by you</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment List</CardTitle>
          <CardDescription>
            All assessments from teachers in your department that require review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Assessments Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "No assessments match your search criteria" 
                  : "No assessments have been submitted for review yet."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course & Teacher</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Teacher Status</TableHead>
                    <TableHead>Your Approval</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.flatMap(course =>
                    course.assessments.map(assessment => (
                      <TableRow key={`${course.teacherCourseAssignmentId}-${assessment.assessmentId}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{course.courseTitle}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {course.courseCode}
                              </div>
                              <div className="flex items-center mt-1">
                                <Users className="h-3 w-3 mr-1" />
                                {course.batchClassYearSemester}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{assessment.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Max Score: {assessment.maxScore}
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
                            <div className="font-medium">{course.teacherFullNameENG || "N/A"}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {course.teacherTitle || "Teacher"}
                            </div>
                            {course.teacherFullNameAMH && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {course.teacherFullNameAMH}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAssessmentStatusBadge(assessment.status)}
                        </TableCell>
                        <TableCell>
                          {getHeadApprovalBadge(assessment.headApproval)}
                        </TableCell>
                        <TableCell>
                          <Link to={`/head/assessments/${course.teacherCourseAssignmentId}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadAssessments;