"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ReportType =
  | "Student Performance"
  | "Class Performance"
  | "Department Performance"
  | "Attendance";

export default function DeanReports() {
  const [reportType, setReportType] = useState<ReportType>(
    "Student Performance"
  );
  const [dept, setDept] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const summary = useMemo(() => {
    return {
      totalRecords: 124,
      averageGpa: 3.18,
      attendanceAvg: 89,
    };
  }, [reportType, dept, from, to]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          Academic Reports
        </h1>

        {/* Controls */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Report Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option>Student Performance</option>
                <option>Class Performance</option>
                <option>Department Performance</option>
                <option>Attendance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Department
              </label>
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                <option>All</option>
                <option>Medicine</option>
                <option>Pharmacy</option>
                <option>Radiology</option>
                <option>Nursing</option>
                <option>Dentistry</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                From
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                To
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Records
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.totalRecords}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average GPA
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.averageGpa.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attendance Avg
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary.attendanceAvg}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-4 flex flex-wrap gap-3">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Generate Report
            </Button>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            >
              Download Excel
            </Button>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-400">
                  <th className="p-2">Name</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Semester</th>
                  <th className="p-2">GPA</th>
                  <th className="p-2">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-2">Student {i + 1}</td>
                    <td className="p-2">
                      {
                        [
                          "Medicine",
                          "Pharmacy",
                          "Radiology",
                          "Nursing",
                          "Dentistry",
                        ][i % 5]
                      }
                    </td>
                    <td className="p-2">
                      {["Sem 1", "Sem 2", "Sem 3", "Sem 4"][i % 4]}
                    </td>
                    <td className="p-2">{(2.8 + (i % 5) * 0.2).toFixed(2)}</td>
                    <td className="p-2">{85 + (i % 7)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
