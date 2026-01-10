"use client";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import apiService from "../../components/api/apiService";
import endPoints from "../../components/api/endPoints";

type Student = {
  studentId: number;
  idNumber: string;
  fullName: string;
  department: string;
  batchClassYearSemester: string;
  studentStatus: string;
  cgpa: number;
};

export default function ViceDeanStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [dept, setDept] = useState("All");
  const [selected, setSelected] = useState<Student | undefined>(undefined);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get(endPoints.getAllStudentsCGPA_VD);
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.error || "Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique departments for filter
  const departments = useMemo(() => {
    const depts = students.map(s => s.department);
    return Array.from(new Set(depts)).sort();
  }, [students]);

  // Extract unique statuses for filter
  const statuses = useMemo(() => {
    const stats = students.map(s => s.studentStatus);
    return Array.from(new Set(stats)).sort();
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery = 
        s.fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.idNumber.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All" || s.studentStatus === status;
      const matchesDept = dept === "All" || s.department === dept;
      return matchesQuery && matchesStatus && matchesDept;
    });
  }, [query, status, dept, students]);

  const handleReset = () => {
    setQuery("");
    setStatus("All");
    setDept("All");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Error Loading Students
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchStudents}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Student Overview
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              onClick={fetchStudents}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
            <input
              placeholder="Search by name or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="All">All Statuses</option>
              {statuses.map((stat) => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <div className="flex gap-2 lg:col-span-2">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 flex-1"
                onClick={handleReset}
              >
                Reset Filters
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 dark:text-gray-400">
                  <th className="p-2">ID Number</th>
                  <th className="p-2">Full Name</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Batch/Year/Semester</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">CGPA</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No students found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.studentId}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-2">{s.idNumber}</td>
                      <td className="p-2">{s.fullName}</td>
                      <td className="p-2">{s.department}</td>
                      <td className="p-2">{s.batchClassYearSemester}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          s.studentStatus === "Active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : s.studentStatus === "Graduated"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {s.studentStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`font-semibold ${
                          s.cgpa >= 3.5 
                            ? "text-green-600 dark:text-green-400"
                            : s.cgpa >= 2.5
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {s.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                          onClick={() => setSelected(s)}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Student Detail Modal (Sheet) */}
        <Sheet
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(undefined)}
        >
          <SheetContent
            side="right"
            className="w-[85vw] sm:max-w-3xl lg:max-w-4xl pl-8 pr-6 data-[state=open]:duration-150 data-[state=closed]:duration-150"
          >
            {selected && (
              <div className="space-y-4">
                <SheetHeader>
                  <SheetTitle className="text-blue-600 dark:text-blue-400">
                    {selected.fullName} • {selected.idNumber}
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Department
                    </p>
                    <p className="font-medium">{selected.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Batch/Year/Semester
                    </p>
                    <p className="font-medium">{selected.batchClassYearSemester}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selected.studentStatus === "Active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selected.studentStatus === "Graduated"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {selected.studentStatus}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Academic Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Student ID
                        </span>
                        <span className="font-medium">{selected.idNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Student ID (Internal)
                        </span>
                        <span className="font-medium">{selected.studentId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Enrollment Period
                        </span>
                        <span className="font-medium">{selected.batchClassYearSemester}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Academic Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Cumulative GPA
                        </span>
                        <span className={`font-bold text-lg ${
                          selected.cgpa >= 3.5 
                            ? "text-green-600 dark:text-green-400"
                            : selected.cgpa >= 2.5
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {selected.cgpa.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Academic Standing
                        </span>
                        <span className={`font-medium ${
                          selected.cgpa >= 3.5 
                            ? "text-green-600 dark:text-green-400"
                            : selected.cgpa >= 2.5
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {selected.cgpa >= 3.5 
                            ? "Excellent" 
                            : selected.cgpa >= 2.5 
                            ? "Good" 
                            : "Needs Improvement"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Department Ranking
                        </span>
                        <span className="font-medium">Not Available</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        CGPA
                      </p>
                      <p className={`text-2xl font-bold ${
                        selected.cgpa >= 3.5 
                          ? "text-green-600 dark:text-green-400"
                          : selected.cgpa >= 2.5
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {selected.cgpa.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Academic Status
                      </p>
                      <p className={`text-lg font-bold ${
                        selected.studentStatus === "Active" 
                          ? "text-green-600 dark:text-green-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {selected.studentStatus}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Department
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {selected.department}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Note: Detailed academic records, attendance, and course-specific grades 
                    are available through the department head or academic records system.
                  </p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Students
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {students.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg CGPA (All)
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {students.length > 0 
                  ? (students.reduce((a, c) => a + c.cgpa, 0) / students.length).toFixed(2)
                  : "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Students
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {students.filter(s => s.studentStatus === "Active").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Graduated
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {students.filter(s => s.studentStatus === "Graduated").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Students with CGPA ≥ 3.5
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {students.filter(s => s.cgpa >= 3.5).length}
                <span className="text-sm font-normal ml-2 text-gray-500">
                  ({(students.length > 0 
                    ? (students.filter(s => s.cgpa >= 3.5).length / students.length * 100).toFixed(1)
                    : "0")}%)
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Students with CGPA &lt; 2.0
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {students.filter(s => s.cgpa < 2.0).length}
                <span className="text-sm font-normal ml-2 text-gray-500">
                  ({(students.length > 0 
                    ? (students.filter(s => s.cgpa < 2.0).length / students.length * 100).toFixed(1)
                    : "0")}%)
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently Filtered
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filtered.length}
                <span className="text-sm font-normal ml-2 text-gray-500">
                  of {students.length}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}