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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

const HeadAssessmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approving, setApproving] = useState(false);

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
        endPoints.getDepartmentHeadAssessments
      );
      
      // Find the specific course assessment
      const course = response.data.find(
        item => item.teacherCourseAssignmentId.toString() === assignmentId
      );
      
      if (course) {
        setCourseData(course);
      } else {
        setError("Assessment not found");
        toast.error("Assessment not found");
      }
    } catch (err) {
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

  const handleApprove = async () => {
    if (!courseData) return;

    try {
      setApproving(true);
      // Call the approval API
      const response = await apiClient.put(
        endPoints.approveHeadAssessments,
        { teacherCourseAssignmentId: courseData.teacherCourseAssignmentId }
      );
      
      toast.success("Assessment approved successfully!");
      setShowApproveDialog(false);
      fetchAssessmentDetails(); // Refresh data
    } catch (err) {
      console.error("Error approving assessment:", err);
      toast.error(err.response?.data?.message || "Failed to approve assessment");
    } finally {
      setApproving(false);
    }
  };

  const getHeadApprovalBadge = (status) => {
    switch (status) {
      case 'APPROVED':
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentScore = (student, assessmentId) => {
    const score = student.scores.find(s => s.assessmentId === assessmentId);
    return score?.score?.toFixed(1) || "-";
  };

  const isAlreadyApproved = () => {
    return courseData?.assessments.some(assessment => assessment.headApproval === 'APPROVED');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading assessment details...</p>
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
            onClick={() => navigate("/head/assessments")}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/head/assessments")}
              className="p-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {courseData.courseTitle}
            </h1>
            {isAlreadyApproved() && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}
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
            {courseData.teacherInfo?.teacherName && (
              <div className="flex items-center">
                <FileCheck className="h-4 w-4 mr-1" />
                Teacher: {courseData.teacherInfo.teacherName}
              </div>
            )}
          </div>
        </div>

        {!isAlreadyApproved() && (
          <Button
            onClick={() => setShowApproveDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Approve Assessment
          </Button>
        )}
      </div>

      {/* Assessment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courseData.assessments.map(assessment => (
                <div key={assessment.assessmentId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{assessment.title}</span>
                    {getAssessmentStatusBadge(assessment.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Max Score:</span>
                      <span className="font-medium">{assessment.maxScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span>{formatDate(assessment.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Approval:</span>
                      {getHeadApprovalBadge(assessment.headApproval)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Title</p>
                <p className="font-medium">{courseData.courseTitle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Code</p>
                <p className="font-medium">{courseData.courseCode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Batch/Semester</p>
                <p className="font-medium">{courseData.batchClassYearSemester}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="font-medium">{courseData.students.length}</p>
              </div>
              {courseData.teacherInfo?.teacherName && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teacher</p>
                    <p className="font-medium">{courseData.teacherInfo.teacherName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                    <p className="font-medium">{courseData.teacherInfo.departmentName || "N/A"}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Scores Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Student Scores</CardTitle>
          <CardDescription>
            Read-only view of student scores. {isAlreadyApproved() ? "Assessment has been approved." : "Approve assessment to finalize scores."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[200px]">
                      Student
                    </TableHead>
                    {courseData.assessments.map(assessment => (
                      <TableHead key={assessment.assessmentId} className="min-w-[150px]">
                        <div className="space-y-1">
                          <div className="font-medium truncate" title={assessment.title}>
                            {assessment.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Max: {assessment.maxScore}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseData.students.map(student => (
                    <TableRow key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="sticky left-0 bg-white dark:bg-gray-900 z-10 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="font-medium">{student.fullNameENG}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student.studentIdNumber}
                          </div>
                        </div>
                      </TableCell>
                      {courseData.assessments.map(assessment => (
                        <TableCell key={`${student.studentId}-${assessment.assessmentId}`}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-20 h-8 px-3 py-1.5 rounded-md border ${getStudentScore(student, assessment.assessmentId) === "-" ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : "bg-gray-50 dark:bg-gray-800"}`}>
                              {getStudentScore(student, assessment.assessmentId)}
                            </div>
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              Approve Assessment
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 dark:text-green-300 font-medium">
                        Confirm Final Approval
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        This will finalize the assessment scores.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Before approving, please review:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>All scores have been reviewed</li>
                    <li>Assessment details are correct</li>
                    <li>Teacher has already approved these scores</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
                
                <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-medium mb-1">Summary:</p>
                  <p>{courseData.assessments.length} assessment(s)</p>
                  <p>{courseData.students.length} student(s)</p>
                  <p>Course: {courseData.courseTitle} ({courseData.courseCode})</p>
                </div>
                
                <p className="font-medium text-red-600 dark:text-red-400">
                  Note: After approval, scores will be finalized and cannot be changed.
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
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeadAssessmentDetail;