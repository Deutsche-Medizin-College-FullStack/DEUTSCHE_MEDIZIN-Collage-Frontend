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

  const getOverallCourseStatus = (course) => {
    const assessments = course.assessments || [];
    
    // If all assessments are approved
    if (assessments.every(a => a.headApproval === 'ACCEPTED')) {
      return 'ACCEPTED';
    }
    
    // If any assessment is rejected
    if (assessments.some(a => a.headApproval === 'REJECTED')) {
      return 'REJECTED';
    }
    
    // If any assessment is pending
    if (assessments.some(a => a.headApproval === 'PENDING' || !a.headApproval)) {
      return 'PENDING';
    }
    
    // Default to pending if no assessments
    return 'PENDING';
  };

  const getCourseStatusBadge = (status) => {
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

  const getTeacherStatus = (course) => {
    const assessments = course.assessments || [];
    
    // Check if all assessments are accepted by teacher
    if (assessments.length === 0) return 'NONE';
    
    if (assessments.every(a => a.status === 'ACCEPTED')) {
      return 'ALL_ACCEPTED';
    }
    
    if (assessments.some(a => a.status === 'ACCEPTED')) {
      return 'SOME_ACCEPTED';
    }
    
    return 'NONE_ACCEPTED';
  };

  const getTeacherStatusBadge = (status) => {
    switch (status) {
      case 'ALL_ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Accepted
        </Badge>;
      case 'SOME_ACCEPTED':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Partially Accepted
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <Clock className="h-3 w-3 mr-1" />
          Not Accepted
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

  // Filter courses based on search term
  const filteredCourses = courseAssessments.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.courseTitle.toLowerCase().includes(searchLower) ||
      course.courseCode.toLowerCase().includes(searchLower) ||
      course.batchClassYearSemester.toLowerCase().includes(searchLower) ||
      (course.teacherFullNameENG && course.teacherFullNameENG.toLowerCase().includes(searchLower)) ||
      (course.teacherFullNameAMH && course.teacherFullNameAMH.toLowerCase().includes(searchLower))
    );
  });

  // Calculate statistics
  const pendingCoursesCount = courseAssessments.filter(course => 
    getOverallCourseStatus(course) === 'PENDING'
  ).length;

  const approvedCoursesCount = courseAssessments.filter(course => 
    getOverallCourseStatus(course) === 'ACCEPTED'
  ).length;

  const rejectedCoursesCount = courseAssessments.filter(course => 
    getOverallCourseStatus(course) === 'REJECTED'
  ).length;

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
          Review and approve course assessments submitted by teachers in your department
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by course, teacher, or batch..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchAssessments} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Updated to show course counts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <BookOpen className="h-4 w-4" />
            Total Courses
          </div>
          <div className="text-2xl font-bold">{courseAssessments.length}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <Users className="h-4 w-4" />
            Teachers
          </div>
          <div className="text-2xl font-bold">
            {new Set(courseAssessments.map(course => course.teacherFullNameENG)).size}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <FileCheck className="h-4 w-4" />
            Assessments
          </div>
          <div className="text-2xl font-bold">
            {courseAssessments.reduce((total, course) => total + (course.assessments?.length || 0), 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending Courses
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingCoursesCount}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Approved Courses
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {approvedCoursesCount}
          </div>
        </div>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Assessment List</CardTitle>
          <CardDescription>
            All courses with assessments requiring your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "No courses match your search criteria" 
                  : "No courses with assessments have been submitted for review yet."}
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
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Teacher Approval</TableHead>
                    <TableHead>Your Approval</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const courseStatus = getOverallCourseStatus(course);
                    const teacherStatus = getTeacherStatus(course);
                    
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
                          <div className="space-y-1">
                            <div className="font-medium">{course.assessments?.length || 0} assessments</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Total Students: {course.students?.length || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTeacherStatusBadge(teacherStatus)}
                        </TableCell>
                        <TableCell>
                          {getCourseStatusBadge(courseStatus)}
                        </TableCell>
                        <TableCell>
                          <Link to={`/head/assessments/${course.teacherCourseAssignmentId}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Review Course
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

export default HeadAssessments;