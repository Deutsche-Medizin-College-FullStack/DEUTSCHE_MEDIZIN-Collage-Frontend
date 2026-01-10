"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Loader2,
  GraduationCap,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  studentId: number;
  idNumber: string;
  fullName: string;
  department: string;
  batchClassYearSemester: string;
  studentStatus: string;
  cgpa: number;
}

interface Statistics {
  totalStudentsInCollege: number;
  maleCount: number;
  femaleCount: number;
  activeStudentsCount: number;
  inactiveStudentsCount: number;
  averageCGPA: number;
}

interface LookupOption {
  name: string;
  id: string | number;
}

interface LookupsResponse {
  batchClassYearSemesters: LookupOption[];
  batches: LookupOption[];
  enrollmentTypes: LookupOption[];
  courseCategories: LookupOption[];
  classYears: LookupOption[];
  departments: LookupOption[];
  semesters: LookupOption[];
  courseSources: LookupOption[];
  academicYears: LookupOption[];
  impairments: LookupOption[];
  studentStatuses: LookupOption[];
  programLevels: LookupOption[];
  programModalities: LookupOption[];
}

export default function DeanStudents() {
  const [query, setQuery] = useState("");
  const [selectedBcys, setSelectedBcys] = useState<string>("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [lookups, setLookups] = useState<LookupsResponse | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchLookups();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct endpoint for Dean to get all students with CGPA
      const response = await apiClient.get(endPoints.getAllStudentsCGPA_DN);
      
      console.log("API Response:", response.data); // Debug log
      
      let studentData: Student[] = [];
      
      // Handle the response structure
      if (Array.isArray(response.data)) {
        studentData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        studentData = response.data.data;
      } else if (response.data?.students && Array.isArray(response.data.students)) {
        studentData = response.data.students;
      }
      
      // Ensure we have an array
      if (!Array.isArray(studentData)) {
        console.error("Student data is not an array:", studentData);
        studentData = [];
      }
      
      setStudents(studentData);
      
      // Calculate statistics from student data
      calculateStatistics(studentData);
      
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load students. Please try again later."
      );
      // Set empty arrays to prevent errors
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (studentList: Student[]) => {
    if (!Array.isArray(studentList)) {
      studentList = [];
    }
    
    const activeCount = studentList.filter(s => 
      s?.studentStatus?.toLowerCase() === "active"
    ).length;
    
    // Note: Gender information is not provided in the API response
    // You may need to update this if gender is added to the API
    const maleCount = 0; // Placeholder - update when gender data is available
    const femaleCount = 0; // Placeholder - update when gender data is available
    
    // Calculate average CGPA
    const totalCGPA = studentList.reduce((sum, student) => sum + (student.cgpa || 0), 0);
    const averageCGPA = studentList.length > 0 ? totalCGPA / studentList.length : 0;
    
    const stats: Statistics = {
      totalStudentsInCollege: studentList.length,
      maleCount: maleCount,
      femaleCount: femaleCount,
      activeStudentsCount: activeCount,
      inactiveStudentsCount: studentList.length - activeCount,
      averageCGPA: parseFloat(averageCGPA.toFixed(2))
    };
    
    setStatistics(stats);
  };

  const fetchLookups = async () => {
    try {
      setLoadingLookups(true);
      const response = await apiClient.get<LookupsResponse>(
        endPoints.lookupsDropdown
      );
      setLookups(response.data);
    } catch (err: any) {
      console.error("Failed to load lookups:", err);
    } finally {
      setLoadingLookups(false);
    }
  };

  const filtered = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    
    return students.filter((s) => {
      if (!s) return false;
      
      const name = s.fullName || '';
      const idNumber = s.idNumber || '';
      const department = s.department || '';
      const bcys = s.batchClassYearSemester || '';
      const status = s.studentStatus || '';
      
      const matchesQuery =
        name.toLowerCase().includes(query.toLowerCase()) ||
        idNumber.toLowerCase().includes(query.toLowerCase());
      
      const matchesBcys = selectedBcys === "All" || bcys === selectedBcys;
      const matchesDepartment = selectedDepartment === "All" || department === selectedDepartment;
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      
      return matchesQuery && matchesBcys && matchesDepartment && matchesStatus;
    });
  }, [query, selectedBcys, selectedDepartment, selectedStatus, students]);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getCGPAcolor = (cgpa: number) => {
    if (cgpa >= 3.5) return 'text-green-600 dark:text-green-400';
    if (cgpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
    if (cgpa >= 2.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg text-red-600 dark:text-red-400 text-center px-4">
          {error}
        </p>
        <Button
          variant="outline"
          onClick={fetchStudents}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">College Students</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View all students across the college with their academic performance
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalStudentsInCollege}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.activeStudentsCount}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {statistics.inactiveStudentsCount} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average CGPA</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.averageCGPA.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                College-wide average
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {[...new Set(students.map(s => s.department))].length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Filter className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Across all departments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Student Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Search, filter, and view student profiles across all departments
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <Input
                placeholder="Search by name or ID number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Batch/Class/Year/Semester
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                value={selectedBcys}
                onChange={(e) => setSelectedBcys(e.target.value)}
                disabled={loadingLookups}
              >
                <option value="All">All Programs</option>
                {loadingLookups ? (
                  <option disabled>Loading options...</option>
                ) : (
                  lookups?.batchClassYearSemesters?.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                {[...new Set(students.map(s => s.department))].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          {loadingLookups && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading filters...
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">ID Number</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Full Name</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Department</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Program</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">CGPA</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {students.length === 0 ? "No students found in the system" : "No students found matching your criteria"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.studentId} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-100 font-mono">
                          {student.idNumber || 'N/A'}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{student.fullName || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{student.department || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{student.batchClassYearSemester || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className={`font-bold ${getCGPAcolor(student.cgpa)}`}>
                          {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(student.studentStatus)}`}
                        >
                          {student.studentStatus || 'Unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
            <div className="text-center sm:text-left">
              Showing <span className="font-medium text-gray-900 dark:text-white">{filtered.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">{students.length || 0}</span> students
            </div>
            <div className="flex items-center gap-2">
              {(selectedBcys !== "All" || selectedDepartment !== "All" || selectedStatus !== "All") && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <Filter className="h-3 w-3" />
                  {selectedBcys !== "All" && <span>Program: {selectedBcys}</span>}
                  {selectedDepartment !== "All" && <span>Dept: {selectedDepartment}</span>}
                  {selectedStatus !== "All" && <span>Status: {selectedStatus}</span>}
                </div>
              )}
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span>{statistics?.activeStudentsCount || 0} Active</span>
              <span className="mx-2 text-gray-400">•</span>
              <GraduationCap className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span>Avg CGPA: {statistics?.averageCGPA.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}