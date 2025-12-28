"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// Interface from your API response
interface StudentCGPA {
  studentId: number;
  idNumber: string;
  fullName: string;
  department: string;
  batchClassYearSemester: string;
  studentStatus: string;
  cgpa: number;
}

export default function StudentsCGPAPage() {
  const [students, setStudents] = useState<StudentCGPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all"); // NEW: department filter

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<StudentCGPA[]>(
        endPoints.getAllStudentsCGPA
      );
      setStudents(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Get unique departments for the filter dropdown
  const departments = [
    "all",
    ...new Set(students.map((s) => s.department)),
  ].sort();

  // Filter students: first by department, then by search
  const filteredStudents = students
    .filter((student) =>
      selectedDepartment === "all"
        ? true
        : student.department === selectedDepartment
    )
    .filter((student) => {
      const search = searchQuery.toLowerCase();
      return (
        student.fullName.toLowerCase().includes(search) ||
        student.idNumber.toLowerCase().includes(search) ||
        student.department.toLowerCase().includes(search) ||
        student.studentStatus.toLowerCase().includes(search)
      );
    });

  // Group filtered students by department
  const groupedByDepartment = filteredStudents.reduce((acc, student) => {
    const dept = student.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(student);
    return acc;
  }, {} as Record<string, StudentCGPA[]>);

  // Sort departments alphabetically
  const sortedDepartments = Object.keys(groupedByDepartment).sort();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading students...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <AlertCircle className="h-20 w-20 text-red-500" />
        <p className="text-xl font-medium text-red-600 dark:text-red-400 text-center max-w-md">
          {error}
        </p>
        <Button
          onClick={fetchStudents}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">
          Students & CGPA Overview
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="w-full sm:w-80">
            <Label
              htmlFor="search"
              className="text-gray-700 dark:text-gray-300"
            >
              Search Students
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, ID, department, status..."
                className="pl-10 border-blue-300 dark:border-blue-700 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-80">
            <Label
              htmlFor="department"
              className="text-gray-700 dark:text-gray-300"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="mt-1 border-blue-300 dark:border-blue-700 focus:ring-blue-500">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refresh */}
          <Button
            onClick={fetchStudents}
            variant="outline"
            className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 mt-6 sm:mt-0"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Grouped Tables by Department */}
      {sortedDepartments.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No students found matching your search or department filter.
        </div>
      ) : (
        <div className="space-y-10">
          {sortedDepartments.map((department) => {
            const deptStudents = groupedByDepartment[department];

            return (
              <Card
                key={department}
                className="border-blue-200 dark:border-blue-800 shadow-md"
              >
                <CardHeader className="bg-blue-50 dark:bg-blue-950/50">
                  <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    {department} Department
                  </CardTitle>
                  <CardDescription>
                    {deptStudents.length} student
                    {deptStudents.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Batch / Year / Semester</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">CGPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deptStudents.map((student) => {
                          const cgpaColor =
                            student.cgpa >= 3.5
                              ? "text-green-600 dark:text-green-400 font-bold"
                              : student.cgpa >= 3.0
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : student.cgpa >= 2.0
                              ? "text-yellow-600 dark:text-yellow-400 font-bold"
                              : "text-red-600 dark:text-red-400 font-bold";

                          const statusColor =
                            student.studentStatus === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : student.studentStatus === "Incomplete"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";

                          return (
                            <TableRow
                              key={student.studentId}
                              className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {student.idNumber}
                              </TableCell>
                              <TableCell>{student.fullName}</TableCell>
                              <TableCell>
                                {student.batchClassYearSemester}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={statusColor}
                                >
                                  {student.studentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className={`text-right ${cgpaColor}`}>
                                {student.cgpa.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
