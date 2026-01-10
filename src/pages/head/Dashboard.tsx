
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
  Users,
  BookOpen,
  UserCheck,
  AlertTriangle,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

interface DepartmentHeadDashboardResponse {
  departmentInfo: {
    departmentName: string;
    modality: string;
    level: string;
  };
  summary: {
    totalStudents: number;
    totalCourses: number;
    totalTeachers: number;
  };
  pendingApprovals: {
    teacher: string;
    assessments: number;
    course: string;
  }[];
  instructors: {
    totalTeachers: number;
    unassigned: number;
    newlyHired: number;
  };
  students: {
    newIntake: number;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation(["departmentHead", "common"]);
  const [data, setData] = useState<DepartmentHeadDashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiService.get<DepartmentHeadDashboardResponse>(
          endPoints.departmentHeadDashboard
        );
        setData(response);
      } catch (error) {
        console.error("Error loading department head dashboard data:", error);
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

  const { departmentInfo, summary, pendingApprovals, instructors, students } =
    data;

  const hasPendingApprovals = pendingApprovals.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to Department Head Dashboard
        </h1>
        <p className="text-blue-100">
          {departmentInfo.departmentName} • {departmentInfo.modality} •{" "}
          {departmentInfo.level}
        </p>
      </div>

      {/* Pending Approvals Warning */}
      {hasPendingApprovals && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Action Required</p>
                <p className="text-sm text-yellow-800 mt-1">
                  You have {pendingApprovals.length} assessment approval(s)
                  waiting for review.
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
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Offered courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Instructors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructors.totalTeachers}
            </div>
            <p className="text-xs text-muted-foreground">
              {instructors.unassigned} unassigned • {instructors.newlyHired}{" "}
              newly hired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Student Intake
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.newIntake}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assessment Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Assessment Approvals
            </CardTitle>
            <CardDescription>
              Teacher-submitted assessments awaiting your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No pending approvals at this time
                </p>
              ) : (
                pendingApprovals.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.teacher}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.course}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.assessments} pending
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructor Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Instructor Overview
            </CardTitle>
            <CardDescription>Current staffing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Total Instructors</p>
                    <p className="text-sm text-muted-foreground">
                      Active teaching staff
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold">
                  {instructors.totalTeachers}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-medium">Unassigned</p>
                    <p className="text-sm text-muted-foreground">
                      Not yet assigned to courses
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold">
                  {instructors.unassigned}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Newly Hired</p>
                    <p className="text-sm text-muted-foreground">
                      Recently joined
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold">
                  {instructors.newlyHired}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
