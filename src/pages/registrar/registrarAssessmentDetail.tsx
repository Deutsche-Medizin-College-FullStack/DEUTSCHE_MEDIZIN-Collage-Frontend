import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  Users,
  Calendar,
  FileCheck,
  Lock,
  ShieldCheck,
  Eye,
  ChevronLeft,
  FileText,
  BarChart,
  Calculator,
  Check,
  X,
  ShieldAlert,
  Award,
  Save,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

const RegistrarAssessmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchAssessmentDetails();
    }
  }, [assignmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        endPoints.getRegistrarDeanApprovedScores
      );
      
      // Find the specific course assessment
      const course = response.data.find(
        (item: any) => item.teacherCourseAssignmentId.toString() === assignmentId
      );
      
      if (course) {
        setCourseData(course);
      } else {
        setError("Course assessment not found");
        toast.error("Course assessment not found");
      }
    } catch (err: any) {
      console.error("Error fetching assessment details:", err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "Failed to load assessment details. Please try again later."
      );
      toast.error("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalApproveReject = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!courseData) return;

    try {
      if (status === 'ACCEPTED') {
        setApproving(true);
      } else {
        setRejecting(true);
      }
      
      // Call the API endpoint for final approval/rejection
      const endpoint = endPoints.registrarFinalApproveAll
        .replace(":teacherCourseAssignmentId", courseData.teacherCourseAssignmentId.toString());
      
      const response = await apiClient.put(
        `${endpoint}?status=${status}`,
        {}
      );
      
      toast.success(response.data.message || `Course ${status === 'ACCEPTED' ? 'approved' : 'rejected'} successfully!`);
      
      if (status === 'ACCEPTED') {
        setShowApproveDialog(false);
      } else {
        setShowRejectDialog(false);
      }
      
      fetchAssessmentDetails(); // Refresh data
    } catch (err: any) {
      console.error(`Error ${status === 'ACCEPTED' ? 'approving' : 'rejecting'} course:`, err);
      
      if (err.response?.status === 403) {
        toast.error("Access denied. You don't have permission to approve/reject assessments for this course.");
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(`Failed to ${status === 'ACCEPTED' ? 'approve' : 'reject'} course. Please try again.`);
      }
    } finally {
      if (status === 'ACCEPTED') {
        setApproving(false);
      } else {
        setRejecting(false);
      }
    }
  };

  const getCourseStatus = () => {
    if (!courseData || !courseData.assessments) return 'PENDING';
    
    const assessments = courseData.assessments;
    
    // If all assessments are registrar approved
    if (assessments.every((a: any) => a.registrarApproval === 'ACCEPTED')) {
      return 'ACCEPTED';
    }
    
    // If any assessment is registrar rejected
    if (assessments.some((a: any) => a.registrarApproval === 'REJECTED')) {
      return 'REJECTED';
    }
    
    // Check if all assessments are head-approved and pending registrar approval
    const allHeadApproved = assessments.every((a: any) => a.headApproval === 'ACCEPTED');
    const hasPendingRegistrar = assessments.some((a: any) => a.registrarApproval === 'PENDING');
    
    if (allHeadApproved && hasPendingRegistrar) {
      return 'PENDING';
    }
    
    return 'PENDING';
  };

  const getCourseStatusBadge = () => {
    const status = getCourseStatus();
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-4 w-4 mr-1" />
          Approved
        </Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <XCircle className="h-4 w-4 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-4 w-4 mr-1" />
          Pending
        </Badge>;
    }
  };

  const getAssessmentStatusBadge = (assessment: any) => {
    switch (assessment.registrarApproval) {
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

  const getHeadApprovalBadge = (assessment: any) => {
    switch (assessment.headApproval) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentScore = (student: any, assessmentId: number) => {
    const score = student.scores?.find((s: any) => s.assessmentId === assessmentId);
    return score?.score || null;
  };

  // Calculate total score for a student across all assessments
  const getStudentTotalScore = (student: any) => {
    if (!courseData?.assessments) return 0;
    
    let total = 0;
    courseData.assessments.forEach((assessment: any) => {
      const score = getStudentScore(student, assessment.assessmentId);
      if (score !== null && !isNaN(score)) {
        total += parseFloat(score);
      }
    });
    return total.toFixed(1);
  };

  // Calculate total possible score (sum of all assessment max scores)
  const getTotalPossibleScore = () => {
    if (!courseData?.assessments) return 0;
    
    return courseData.assessments.reduce((total: number, assessment: any) => {
      return total + (assessment.maxScore || 0);
    }, 0);
  };

  const canTakeAction = () => {
    const status = getCourseStatus();
    
    // Check if all assessments are head-approved first
    const allHeadApproved = courseData?.assessments?.every((a: any) => a.headApproval === 'ACCEPTED');
    
    return status === 'PENDING' && allHeadApproved;
  };

  const getAssessmentCountByStatus = () => {
    if (!courseData?.assessments) return { pending: 0, approved: 0, rejected: 0 };
    
    const assessments = courseData.assessments;
    return {
      pending: assessments.filter((a: any) => a.registrarApproval === 'PENDING').length,
      approved: assessments.filter((a: any) => a.registrarApproval === 'ACCEPTED').length,
      rejected: assessments.filter((a: any) => a.registrarApproval === 'REJECTED').length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading course assessment details...</p>
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
            onClick={() => navigate("/registrar/assessments")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
          <Button
            variant="default"
            onClick={fetchAssessmentDetails}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  const courseStatus = getCourseStatus();
  const totalPossibleScore = getTotalPossibleScore();
  const allHeadApproved = courseData?.assessments?.every((a: any) => a.headApproval === 'ACCEPTED');
  const assessmentCounts = getAssessmentCountByStatus();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/registrar/assessments")} className="p-0" >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assessments
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {courseData.courseTitle}
            </h1>
            {getCourseStatusBadge()}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {courseData.courseCode}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {courseData.batchClassYearSemester}
            </div>
            {courseData.teacherName && (
              <div className="flex items-center">
                <FileCheck className="h-4 w-4 mr-1" />
                Teacher: {courseData.teacherName}
              </div>
            )}
          </div>
        </div>

        {canTakeAction() ? (
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowRejectDialog(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject All
            </Button>
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Approve All
            </Button>
          </div>
        ) : !allHeadApproved ? (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Waiting for department head approval
          </Badge>
        ) : (
          <Badge variant="outline" className={
            courseStatus === 'ACCEPTED' 
              ? "text-green-600 border-green-300" 
              : "text-red-600 border-red-300"
          }>
            {courseStatus === 'ACCEPTED' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Finalized
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Course Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Title</p>
                <p className="font-medium">{courseData.courseTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Code</p>
                <p className="font-medium">{courseData.courseCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Teacher Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teacher Name</p>
                <p className="font-medium">{courseData.teacherName || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Batch/Semester</p>
                <p className="font-medium">{courseData.batchClassYearSemester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="font-medium">{courseData.students?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Assessments Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</p>
                <p className="font-medium">{courseData.assessments?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Possible Score</p>
                <p className="font-medium">{totalPossibleScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved:</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {assessmentCounts.approved}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending:</span>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  {assessmentCounts.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rejected:</span>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {assessmentCounts.rejected}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>
            All assessments in this course that have been approved by the department head
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courseData.assessments && courseData.assessments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Title</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Head Approval</TableHead>
                    <TableHead>Registrar Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseData.assessments.map((assessment: any) => (
                    <TableRow key={assessment.assessmentId}>
                      <TableCell>
                        <div className="font-medium">{assessment.title}</div>
                        <div className="text-sm text-gray-500">
                          ID: {assessment.assessmentId}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {assessment.maxScore}
                      </TableCell>
                      <TableCell>
                        {formatDate(assessment.dueDate)}
                      </TableCell>
                      <TableCell>
                        {getHeadApprovalBadge(assessment)}
                      </TableCell>
                      <TableCell>
                        {getAssessmentStatusBadge(assessment)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No assessments found for this course.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Scores Grid with Total Column */}
      <Card>
        <CardHeader>
          <CardTitle>Student Scores (Read Only)</CardTitle>
          <CardDescription>
            {courseStatus === 'ACCEPTED' 
              ? "Course has been finalized. Scores are now official and cannot be changed." 
              : courseStatus === 'REJECTED'
              ? "Course has been rejected. Department head needs to make corrections."
              : allHeadApproved
              ? "All assessments approved by department head. Review scores before final approval."
              : "Waiting for department head to approve all assessments."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courseData.students && courseData.students.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-800">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[200px]">
                        Student
                      </TableHead>
                      {courseData.assessments?.map((assessment: any) => (
                        <TableHead key={assessment.assessmentId} className="min-w-[150px]">
                          <div className="space-y-1">
                            <div className="font-medium truncate" title={assessment.title}>
                              {assessment.title}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Max: {assessment.maxScore}
                              </div>
                              {getHeadApprovalBadge(assessment)}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[120px]">
                        <div className="space-y-1">
                          <div className="font-medium">Total Score</div>
                          <div className="text-xs text-gray-500">
                            Max: {totalPossibleScore}
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.students.map((student: any) => {
                      const totalScore = getStudentTotalScore(student);
                      return (
                        <TableRow key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="sticky left-0 bg-white dark:bg-gray-900 z-10 min-w-[200px]">
                            <div className="space-y-1">
                              <div className="font-medium">{student.fullNameENG}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {student.studentIdNumber}
                              </div>
                              {student.fullNameAMH && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {student.fullNameAMH}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {courseData.assessments?.map((assessment: any) => {
                            const score = getStudentScore(student, assessment.assessmentId);
                            const displayScore = score !== null ? score.toFixed(1) : "-";
                            return (
                              <TableCell key={`${student.studentId}-${assessment.assessmentId}`}>
                                <div className={`w-20 h-8 px-3 py-1.5 rounded-md border text-center ${displayScore === "-" ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : "bg-gray-50 dark:bg-gray-800"}`}>
                                  {displayScore}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 min-w-[120px]">
                            <div className={`w-full h-8 px-3 py-1.5 rounded-md border text-center font-medium ${parseFloat(totalScore) > 0 ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                              {totalScore}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No students found for this course.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve All Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              Final Approval - All Assessments
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 dark:text-green-300 font-medium">
                        Finalize All Scores
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        This will approve ALL assessments and make scores official.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Requirements Check:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      All assessments approved by department head ✓
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      All student scores recorded ✓
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      No missing assessment data ✓
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">What happens when you approve:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>All assessments will be marked as ACCEPTED by registrar</li>
                    <li>Total scores will be calculated for each student</li>
                    <li>Scores will be saved to StudentCourseScore table</li>
                    <li>Grades will be marked as released (isReleased = true)</li>
                    <li>Students will be able to see their final grades</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
                
                <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-medium mb-1">Course Summary:</p>
                  <p>Course: {courseData.courseTitle} ({courseData.courseCode})</p>
                  <p>Teacher: {courseData.teacherName}</p>
                  <p>Batch: {courseData.batchClassYearSemester}</p>
                  <p>Assessments: {courseData.assessments?.length || 0}</p>
                  <p>Students: {courseData.students?.length || 0}</p>
                </div>
                
                <p className="font-medium text-red-600 dark:text-red-400">
                  ⚠️ Warning: This action will finalize all scores. Make sure all scores are correct before proceeding.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={approving}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleFinalApproveReject('ACCEPTED')}
              disabled={approving}
            >
              {approving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Finalize All Scores
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject All Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              Reject All Assessments
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 dark:text-red-300 font-medium">
                        Reject All Assessments
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        This will reject ALL assessments and return the course to the department head.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">What happens when you reject:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>All assessments will be marked as REJECTED by registrar</li>
                    <li>Department head will be notified</li>
                    <li>Department head will need to review and resubmit</li>
                    <li>No scores will be saved or released</li>
                    <li>You will need to review the course again after resubmission</li>
                  </ul>
                </div>
                
                <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-medium mb-1">Course Summary:</p>
                  <p>Course: {courseData.courseTitle} ({courseData.courseCode})</p>
                  <p>Teacher: {courseData.teacherName}</p>
                  <p>Batch: {courseData.batchClassYearSemester}</p>
                  <p>Assessments: {courseData.assessments?.length || 0}</p>
                  <p>Students: {courseData.students?.length || 0}</p>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="font-medium mb-1">Please specify reason for rejection:</p>
                  <p className="text-sm">(This will be communicated to the department head)</p>
                </div>
                
                <p className="font-medium">
                  Are you sure you want to reject all assessments in this course?
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleFinalApproveReject('REJECTED')}
              disabled={rejecting}
            >
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject All Assessments
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrarAssessmentDetail;