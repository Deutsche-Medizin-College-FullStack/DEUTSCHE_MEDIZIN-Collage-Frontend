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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  User,
  Phone,
  GraduationCap,
  Activity,
  Users,
  Mars,
  Venus ,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  recentBcysName: string;
  studentRecentStatusName: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE";
}

interface Statistics {
  totalStudentsInDepartment: number;
  totalStudentsInCollege: number;
  percentageOfCollege: number;
  maleCount: number;
  femaleCount: number;
  activeStudentsCount: number;
  inactiveStudentsCount: number;
}

interface DepartmentStudentsResponse {
  students: Student[];
  statistics: Statistics;
}

export default function HeadStudents() {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentStudentsResponse | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartmentStudents();
  }, []);

    const fetchDepartmentStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<DepartmentStudentsResponse>(
          endPoints.departmentStudents  
        );
        setDepartmentData(response.data);
      } catch (err: any) {
        console.error("Failed to load students:", err);
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to load students. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

  const filtered = useMemo(() => {
    if (!departmentData?.students) return [];
    
    return departmentData.students.filter((s) => {
      const matchesQuery =
        s.fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(query.toLowerCase()) ||
        s.phoneNumber.includes(query);
      const matchesYear = year === "All" || s.recentBcysName.includes(year);
      return matchesQuery && matchesYear;
    });
  }, [query, year, departmentData]);

  const getYearOptions = () => {
    if (!departmentData?.students) return ["All"];
    
    const years = new Set<string>();
    departmentData.students.forEach(s => {
      const yearMatch = s.recentBcysName.match(/\b(?:Year|Sem)\s*\d+/);
      if (yearMatch) {
        years.add(yearMatch[0]);
      }
    });
    return ["All", ...Array.from(years)];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'graduated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'MALE' ? <Mars className="h-4 w-4" /> : <Venus  className="h-4 w-4" />;
  };

  const handleViewDetails = (studentId: number) => {
    navigate(`/head/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading department students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-lg text-red-600 text-center px-4">
          {error}
        </p>
        <Button
          variant="outline"
          onClick={fetchDepartmentStudents}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Department Students</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all students in your department
        </p>
      </div>

      {/* Statistics Cards */}
      {departmentData?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold">{departmentData.statistics.totalStudentsInDepartment}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {departmentData.statistics.percentageOfCollege.toFixed(1)}% of college total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Students</p>
                  <p className="text-2xl font-bold">{departmentData.statistics.activeStudentsCount}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {departmentData.statistics.inactiveStudentsCount} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Male Students</p>
                  <p className="text-2xl font-bold">{departmentData.statistics.maleCount}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Mars  className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {((departmentData.statistics.maleCount / departmentData.statistics.totalStudentsInDepartment) * 100).toFixed(1)}% of department
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Female Students</p>
                  <p className="text-2xl font-bold">{departmentData.statistics.femaleCount}</p>
                </div>
                <div className="p-3 rounded-full bg-pink-100">
                  <Venus  className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {((departmentData.statistics.femaleCount / departmentData.statistics.totalStudentsInDepartment) * 100).toFixed(1)}% of department
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            Search, filter, and view student profiles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by name, ID, or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Year/Semester</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {getYearOptions().map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Actions</label>
              <Button className="w-full" variant="outline">
                Export Data
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium text-gray-700">Student ID</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Full Name</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Gender</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Current Program</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Phone</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No students found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-100">
                          {student.studentId}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium">{student.fullName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getGenderIcon(student.gender)}
                          <span>{student.gender === 'MALE' ? 'Male' : 'Female'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{student.recentBcysName}</td>
                      <td className="py-3 px-4">{student.phoneNumber}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(student.studentRecentStatusName)}`}
                        >
                          {student.studentRecentStatusName}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(student.id)}
                          >
                            View Details
                          </Button>
                          
                          {/* Quick View Dialog */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedStudent(student)}
                              >
                                Quick View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Student Quick View</DialogTitle>
                              </DialogHeader>
                              {selectedStudent && (
                                <div className="space-y-4 mt-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">{selectedStudent.fullName}</p>
                                      <code className="text-sm text-gray-600 dark:text-gray-300">{selectedStudent.studentId}</code>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Gender</p>
                                      <p className="font-medium">{selectedStudent.gender}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Phone</p>
                                      <p className="font-medium">{selectedStudent.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Current Program</p>
                                      <p className="font-medium">{selectedStudent.recentBcysName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Status</p>
                                      <Badge 
                                        className={`mt-1 ${getStatusColor(selectedStudent.studentRecentStatusName)}`}
                                      >
                                        {selectedStudent.studentRecentStatusName}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t">
                                    <Button 
                                      variant="outline" 
                                      className="w-full"
                                      onClick={() => handleViewDetails(selectedStudent.id)}
                                    >
                                      View Full Profile
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{filtered.length}</span> of{' '}
              <span className="font-medium">{departmentData?.students.length || 0}</span> students
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{departmentData?.statistics.activeStudentsCount || 0} Active</span>
              <span className="mx-2">•</span>
              <Users className="h-4 w-4 text-blue-500" />
              <span>{departmentData?.statistics.totalStudentsInDepartment || 0} Total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}