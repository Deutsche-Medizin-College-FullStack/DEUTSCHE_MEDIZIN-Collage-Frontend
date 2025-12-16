"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

interface DashboardResponse {
  profileSummary: {
    studentId: number;
    fullName: string;
    department: string;
    programModality: string;
    currentClassYear: string;
    currentSemester: string;
    academicStatus: string;
    profilePhoto: string | null;
  };
  academicProgress: {
    totalCompletedCreditHours: number;
    currentCGPA: number;
    lastSemesterGPA: number | null;
  };
  currentSemesterCourses: {
    courseCode: string;
    courseTitle: string;
    creditHours: number;
  }[];
  recentGrades: {
    classYear: string;
    semester: string;
    courseCode: string;
    courseTitle: string;
    letterGrade: string | null;
    gradePoint: number | null;
  }[];
  documentStatus: {
    registrationDocumentStatus: string;
    studentPhotoUploadStatus: string;
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation(["student", "common"]);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiService.get<DashboardResponse>(
          endPoints.studentDashboard
        );
        setData(response);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("common:loading") || "Loading..."}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const {
    profileSummary,
    academicProgress,
    currentSemesterCourses,
    recentGrades,
    documentStatus,
  } = data;

  const currentSemesterCredits = currentSemesterCourses.reduce(
    (sum, course) => sum + course.creditHours,
    0
  );

  const firstName = profileSummary.fullName.split(" ")[0];

  const hasDocumentIssues =
    documentStatus.registrationDocumentStatus === "INCOMPLETE" ||
    documentStatus.studentPhotoUploadStatus === "NOT_UPLOADED";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t("dashboard.welcome", { name: firstName }) ||
            `Welcome back, ${firstName}`}
        </h1>
        <p className="text-blue-100">
          {profileSummary.department} • Year {profileSummary.currentClassYear} •{" "}
          {profileSummary.currentSemester}
        </p>
      </div>

      {/* Document Status Warning */}
      {hasDocumentIssues && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Action Required</p>
                <p className="text-sm text-yellow-800 mt-1">
                  {documentStatus.registrationDocumentStatus === "INCOMPLETE" &&
                    "Your registration documents are incomplete. "}
                  {documentStatus.studentPhotoUploadStatus === "NOT_UPLOADED" &&
                    "Please upload your profile photo."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {academicProgress.currentCGPA !== null
                ? academicProgress.currentCGPA.toFixed(2)
                : "N/A"}
            </div>
            {academicProgress.currentCGPA === null && (
              <p className="text-xs text-muted-foreground mt-1">
                No grades recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Credits
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {academicProgress.totalCompletedCreditHours}
            </div>
            <p className="text-xs text-muted-foreground">Credit hours earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSemesterCourses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSemesterCredits} Cr this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {profileSummary.academicStatus.toLowerCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              {profileSummary.programModality}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Semester Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Semester Courses
            </CardTitle>
            <CardDescription>{profileSummary.currentSemester}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentSemesterCourses.map((course) => (
                <div
                  key={course.courseCode}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{course.courseCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.courseTitle}
                    </p>
                  </div>
                  <Badge variant="secondary">{course.creditHours} Cr</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades - FIXED HERE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Grades
            </CardTitle>
            <CardDescription>From previous semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div
                  key={grade.courseCode}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    {/* FIXED: was "course.courseCode" → now "grade.courseCode" */}
                    <p className="font-medium text-sm">{grade.courseCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {grade.courseTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    {grade.letterGrade ? (
                      <>
                        <Badge
                          variant={
                            grade.letterGrade.startsWith("A")
                              ? "default"
                              : "secondary"
                          }
                        >
                          {grade.letterGrade}
                        </Badge>
                        {grade.gradePoint !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {grade.gradePoint.toFixed(1)} pts
                          </p>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <BookOpen className="h-8 w-8 mb-2" />
              <span className="text-sm">View Grades</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <Calendar className="h-8 w-8 mb-2" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <GraduationCap className="h-8 w-8 mb-2" />
              <span className="text-sm">My Courses</span>
            </Button>
            <Button
              onClick={() => {
                navigate("/student/grades");
              }}
              variant="outline"
              className="h-24 flex flex-col"
            >
              <User className="h-8 w-8 mb-2" />
              <span className="text-sm">Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
