import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  BookOpen,
  Building,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

// Interfaces
interface Assessment {
  assessmentId: number;
  title: string;
  maxScore: number;
  dueDate: string;
  description?: string;
}

interface Student {
  studentId: number;
  studentIdNumber: string;
  fullNameENG: string;
  fullNameAMH: string;
  scores: Array<{
    assessmentId: number;
    score: number | null;
  }>;
}

interface CourseScoresResponse {
  message: string;
  teacherCourseAssignmentId: number;
  courseCode: string;
  courseTitle: string;
  batchClassYearSemester: string;
  assessments: Assessment[];
  students: Student[];
}

interface CreateAssessmentRequest {
  teacherCourseAssignmentId: number;
  assTitle: string;
  maxScore: number;
  dueDate: string;
  description: string;
}

interface RecordScoreRequest {
  assessmentId: number;
  studentId: number;
  score: number;
}

const AssessmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoresData, setScoresData] = useState<CourseScoresResponse | null>(null);
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [editingScores, setEditingScores] = useState<Record<string, Record<number, string>>>({});
  const [newAssessment, setNewAssessment] = useState<CreateAssessmentRequest>({
    teacherCourseAssignmentId: parseInt(assignmentId || "0"),
    assTitle: "",
    maxScore: 100,
    dueDate: "",
    description: ""
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Get course info from location state or fetch it
  const courseInfo = location.state || {
    courseTitle: "",
    courseCode: "",
    batch: ""
  };

  useEffect(() => {
    if (assignmentId) {
      fetchCourseScores();
    }
  }, [assignmentId]);

  const fetchCourseScores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CourseScoresResponse>(
        endPoints.getCourseScores.replace(":teacherCourseAssignmentId", assignmentId!)
      );
      setScoresData(response.data);
      
      // Initialize editing scores
      const initialScores: Record<string, Record<number, string>> = {};
      response.data.students.forEach(student => {
        initialScores[student.studentId] = {};
        response.data.assessments.forEach(assessment => {
          const score = student.scores.find(s => s.assessmentId === assessment.assessmentId);
          initialScores[student.studentId][assessment.assessmentId] = score?.score?.toString() || "";
        });
      });
      setEditingScores(initialScores);
    } catch (err: any) {
      console.error("Error fetching course scores:", err);
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

  const handleCreateAssessment = async () => {
    if (!newAssessment.assTitle.trim()) {
      toast.error("Assessment title is required");
      return;
    }
    if (newAssessment.maxScore <= 0) {
      toast.error("Max score must be greater than 0");
      return;
    }
    if (!newAssessment.dueDate) {
      toast.error("Due date is required");
      return;
    }

    try {
      setCreateLoading(true);
      await apiClient.post(endPoints.createAssessment, newAssessment);
      toast.success("Assessment created successfully!");
      setShowAddAssessment(false);
      setNewAssessment({
        teacherCourseAssignmentId: parseInt(assignmentId || "0"),
        assTitle: "",
        maxScore: 100,
        dueDate: "",
        description: ""
      });
      fetchCourseScores(); // Refresh data
    } catch (err: any) {
      console.error("Error creating assessment:", err);
      toast.error(err.response?.data?.error || "Failed to create assessment");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleScoreChange = (studentId: number, assessmentId: number, value: string) => {
    setEditingScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentId]: value
      }
    }));
  };

  const saveStudentScore = async (studentId: number, assessmentId: number) => {
    const scoreValue = editingScores[studentId]?.[assessmentId];
    if (!scoreValue || isNaN(parseFloat(scoreValue))) {
      toast.error("Please enter a valid score");
      return;
    }

    const score = parseFloat(scoreValue);
    const assessment = scoresData?.assessments.find(a => a.assessmentId === assessmentId);
    
    if (assessment && score > assessment.maxScore) {
      toast.error(`Score (${score}) exceeds max score (${assessment.maxScore})`);
      return;
    }

    try {
      const payload: RecordScoreRequest = {
        assessmentId,
        studentId,
        score
      };
      
      // Check if score already exists
      const existingScore = scoresData?.students
        .find(s => s.studentId === studentId)
        ?.scores.find(s => s.assessmentId === assessmentId);
      
      if (existingScore?.score !== null && existingScore?.score !== undefined) {
        // Update existing score
        await apiClient.put(
          endPoints.updateStudentScore
            .replace(":assessmentId", assessmentId.toString())
            .replace(":studentId", studentId.toString()),
          { score }
        );
        toast.success("Score updated successfully!");
      } else {
        // Create new score
        await apiClient.post(endPoints.recordStudentScore, payload);
        toast.success("Score recorded successfully!");
      }
      
      fetchCourseScores(); // Refresh data
    } catch (err: any) {
      console.error("Error saving score:", err);
      toast.error(err.response?.data?.error || "Failed to save score");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={fetchCourseScores}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const courseTitle = scoresData?.courseTitle || courseInfo.courseTitle || "Course";
  const courseCode = scoresData?.courseCode || courseInfo.courseCode || "";
  const batch = scoresData?.batchClassYearSemester || courseInfo.batch || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Link
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Courses
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {courseTitle}
                </h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  {courseCode}
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {batch}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {scoresData?.students.length || 0} students
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {scoresData?.assessments.length || 0} assessments
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAddAssessment(true)}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment
            </Button>
          </div>
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Manage assessments and student scores. Click on a score to edit, then click the check button to save.
          </p>
        </div>

        {/* Assessment Grid */}
        {scoresData && scoresData.students.length > 0 && scoresData.assessments.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                      Student
                    </th>
                    {scoresData.assessments.map((assessment) => (
                      <th
                        key={assessment.assessmentId}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[180px]"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold">{assessment.title}</div>
                          <div className="text-xs text-gray-400">
                            Max: {assessment.maxScore}
                          </div>
                          {assessment.dueDate && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {formatDate(assessment.dueDate)}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {scoresData.students.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        <div className="space-y-1">
                          <div className="font-medium">{student.fullNameENG}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.studentIdNumber}
                          </div>
                        </div>
                      </td>
                      {scoresData.assessments.map((assessment) => {
                        const studentScore = student.scores.find(
                          s => s.assessmentId === assessment.assessmentId
                        );
                        const scoreValue = studentScore?.score;
                        const editingValue = editingScores[student.studentId]?.[assessment.assessmentId] || "";
                        
                        return (
                          <td
                            key={`${student.studentId}-${assessment.assessmentId}`}
                            className="px-4 py-3 whitespace-nowrap text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max={assessment.maxScore}
                                step="0.1"
                                value={editingValue}
                                onChange={(e) => handleScoreChange(student.studentId, assessment.assessmentId, e.target.value)}
                                className="w-24"
                                placeholder="Enter score"
                              />
                              {editingValue !== (scoreValue?.toString() || "") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveStudentScore(student.studentId, assessment.assessmentId)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {scoreValue !== null && scoreValue !== undefined && (
                                <span className="text-xs text-gray-500">
                                  Saved: {scoreValue}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Assessment Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {scoresData?.students.length === 0 
                ? "No students enrolled in this course yet." 
                : "No assessments have been created for this course."}
            </p>
            <Button onClick={() => setShowAddAssessment(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Assessment
            </Button>
          </div>
        )}

        {/* Add Assessment Dialog */}
        <Dialog open={showAddAssessment} onOpenChange={setShowAddAssessment}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Add a new assessment for {courseTitle}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={newAssessment.assTitle}
                  onChange={(e) => setNewAssessment({...newAssessment, assTitle: e.target.value})}
                  placeholder="e.g., Midterm Exam, Quiz 1, Final Project"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    step="0.1"
                    value={newAssessment.maxScore}
                    onChange={(e) => setNewAssessment({...newAssessment, maxScore: parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssessment.dueDate}
                    onChange={(e) => setNewAssessment({...newAssessment, dueDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
                  placeholder="Assessment instructions, topics covered, etc."
                  rows={3}
                />
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Course Assignment ID: {assignmentId}</p>
                <p>Course: {courseTitle} ({courseCode})</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddAssessment(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssessment}
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assessment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Summary Info */}
        {scoresData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Course Info</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scoresData.courseTitle} ({scoresData.courseCode})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Batch: {scoresData.batchClassYearSemester}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">Students</h3>
              <p className="text-2xl font-bold">{scoresData.students.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enrolled in this course
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-1">Assessments</h3>
              <p className="text-2xl font-bold">{scoresData.assessments.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created for this course
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;