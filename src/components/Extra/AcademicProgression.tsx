import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  courseSource?: string;
  isReleased?: boolean;
  takenIn?: string;
  expectedIn?: string;
}

interface AcademicProgressionProps {
  studentId?: number;
  username?: string;
  fullName?: string;
  department?: string;
  currentStatus?: string;
  currentBatchClassYearSemester?: string;
  takenCourses?: Course[];
  totalTakenCourses?: number;
  totalTakenCreditHours?: number;
  remainingCourses?: Course[];
  totalRemainingCourses?: number;
  totalRemainingCreditHours?: number;
  isLoading?: boolean;
}

export const AcademicProgression: React.FC<AcademicProgressionProps> = ({
  studentId,
  username,
  fullName,
  department,
  currentStatus,
  currentBatchClassYearSemester,
  takenCourses = [],
  totalTakenCourses = 0,
  totalTakenCreditHours = 0,
  remainingCourses = [],
  totalRemainingCourses = 0,
  totalRemainingCreditHours = 0,
  isLoading = false,
}) => {
  const [showTakenCourses, setShowTakenCourses] = useState(false); // Start collapsed
  const [showRemainingCourses, setShowRemainingCourses] = useState(false); // Start collapsed

  const getStatusColor = (status: string = "") => {
    if (!status)
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "graduated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "drop_out":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  // Safe values with defaults
  const safeStatus = currentStatus || "Unknown";
  const safeDepartment = department || "Not Assigned";
  const safeBatch = currentBatchClassYearSemester || "Not Assigned";
  const safeFullName = fullName || "Unknown Student";
  const safeUsername = username || "N/A";

  // Calculate completion percentage safely
  const totalCourses = totalTakenCourses + totalRemainingCourses;
  const completionPercentage =
    totalCourses > 0
      ? ((totalTakenCourses / totalCourses) * 100).toFixed(1)
      : "0";

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            <span className="ml-3 text-gray-600">
              Loading academic progress...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      {/* Header - More Compact */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b py-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-400">
              Academic Progress
            </CardTitle>
            <CardDescription className="text-sm mt-0.5">
              {safeFullName} ({safeUsername})
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(safeStatus)} px-3 py-1 text-sm font-medium`}
          >
            {safeStatus}
          </Badge>
        </div>

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-600 dark:text-gray-400">Dept</div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {safeDepartment}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Batch
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {safeBatch}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Taken
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white">
              {totalTakenCourses} ({totalTakenCreditHours} cr)
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Remaining
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white">
              {totalRemainingCourses} ({totalRemainingCreditHours} cr)
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Progress Bar - New Addition */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, parseFloat(completionPercentage))}%`,
              }}
            />
          </div>
        </div>

        {/* Taken Courses Section - Table View */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowTakenCourses(!showTakenCourses)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Completed Courses ({takenCourses?.length || 0})
              </span>
            </div>
            {showTakenCourses ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {showTakenCourses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">Code</th>
                        <th className="px-4 py-2 text-left">Course Title</th>
                        <th className="px-4 py-2 text-center">Credits</th>
                        <th className="px-4 py-2 text-center">Taken In</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {takenCourses && takenCourses.length > 0 ? (
                        takenCourses.map((course) => {
                          // Debug: log each course to see what's coming from API
                          console.log(
                            "Course:",
                            course.courseCode,
                            "isReleased:",
                            course.isReleased,
                            "Type:",
                            typeof course.isReleased,
                          );

                          // Determine status text and color based on isReleased
                          const isReleased = course.isReleased === true; // Ensure boolean
                          const statusText = isReleased
                            ? "Released"
                            : "Pending";
                          const statusColor = isReleased
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

                          return (
                            <tr
                              key={course.courseId}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-2 font-mono text-xs">
                                {course.courseCode}
                              </td>
                              <td className="px-4 py-2">
                                <div
                                  className="truncate max-w-[200px]"
                                  title={course.courseTitle}
                                >
                                  {course.courseTitle}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center">
                                {course.creditHours}
                              </td>
                              <td className="px-4 py-2 text-center text-xs">
                                {course.takenIn || "—"}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <Badge
                                  className={`text-xs px-2 py-0 ${statusColor}`}
                                >
                                  {statusText}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-gray-500"
                          >
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No completed courses yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Remaining Courses Section - Table View */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowRemainingCourses(!showRemainingCourses)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Remaining Courses ({totalRemainingCourses})
              </span>
            </div>
            {showRemainingCourses ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <AnimatePresence>
            {showRemainingCourses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">Code</th>
                        <th className="px-4 py-2 text-left">Course Title</th>
                        <th className="px-4 py-2 text-center">Credits</th>
                        <th className="px-4 py-2 text-center">Expected</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {remainingCourses.length > 0 ? (
                        remainingCourses.map((course) => (
                          <tr
                            key={course.courseId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-2 font-mono text-xs">
                              {course.courseCode}
                            </td>
                            <td className="px-4 py-2">
                              <div
                                className="truncate max-w-[200px]"
                                title={course.courseTitle}
                              >
                                {course.courseTitle}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {course.creditHours}
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              {course.expectedIn || "TBD"}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400"
                              >
                                Planned
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-gray-500"
                          >
                            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">All courses completed! 🎉</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compact Summary - Replaces the long text */}
        {totalCourses > 0 && (
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Progress:</span>{" "}
                {totalTakenCourses} of {totalCourses} courses completed •
                <span className="ml-1">
                  {totalTakenCreditHours} credits earned,{" "}
                  {totalRemainingCreditHours} remaining
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
