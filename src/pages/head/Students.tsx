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
  Venus,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
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

export default function HeadStudents() {
  const [query, setQuery] = useState("");
  const [selectedBcys, setSelectedBcys] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentStudentsResponse | null>(null);
  const [lookups, setLookups] = useState<LookupsResponse | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartmentStudents();
    fetchLookups();
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
    if (!departmentData?.students) return [];
    
    return departmentData.students.filter((s) => {
      const matchesQuery =
        s.fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(query.toLowerCase()) ||
        s.phoneNumber.includes(query);
      
      const matchesBcys = selectedBcys === "All" || s.recentBcysName === selectedBcys;
      
      return matchesQuery && matchesBcys;
    });
  }, [query, selectedBcys, departmentData]);

  const getStatusColor = (status: string) => {
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

  const getGenderIcon = (gender: string) => {
    return gender === 'MALE' ? <Mars className="h-4 w-4" /> : <Venus className="h-4 w-4" />;
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
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg text-red-600 dark:text-red-400 text-center px-4">
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Students</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage and view all students in your department
        </p>
      </div>

      {/* Statistics Cards */}
      {departmentData?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departmentData.statistics.totalStudentsInDepartment}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {departmentData.statistics.percentageOfCollege.toFixed(1)}% of college total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departmentData.statistics.activeStudentsCount}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {departmentData.statistics.inactiveStudentsCount} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Male Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departmentData.statistics.maleCount}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Mars className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {((departmentData.statistics.maleCount / departmentData.statistics.totalStudentsInDepartment) * 100).toFixed(1)}% of department
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Female Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{departmentData.statistics.femaleCount}</p>
                </div>
                <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30">
                  <Venus className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {((departmentData.statistics.femaleCount / departmentData.statistics.totalStudentsInDepartment) * 100).toFixed(1)}% of department
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
            Search, filter, and view student profiles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <Input
                placeholder="Search by name, ID, or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Filter by Batch/Class/Year/Semester
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                value={selectedBcys}
                onChange={(e) => setSelectedBcys(e.target.value)}
                disabled={loadingLookups}
              >
                <option value="All">All Batch-Classyear-Semester</option>
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
              {loadingLookups && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading filters...
                </div>
              )}
            </div>


          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Student ID</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Full Name</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Gender</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Current Batch/ClassYear/Semester</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Phone</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No students found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <tr key={student.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-100 font-mono">
                          {student.studentId}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{student.fullName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          {getGenderIcon(student.gender)}
                          <span>{student.gender === 'MALE' ? 'Male' : 'Female'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{student.recentBcysName}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{student.phoneNumber}</td>
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
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Quick View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-white">Student Quick View</DialogTitle>
                              </DialogHeader>
                              {selectedStudent && (
                                <div className="space-y-4 mt-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white">{selectedStudent.fullName}</p>
                                      <code className="text-sm text-gray-600 dark:text-gray-300 font-mono">{selectedStudent.studentId}</code>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                                      <p className="font-medium text-gray-900 dark:text-white">{selectedStudent.gender}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                      <p className="font-medium text-gray-900 dark:text-white">{selectedStudent.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Program</p>
                                      <p className="font-medium text-gray-900 dark:text-white">{selectedStudent.recentBcysName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                      <Badge 
                                        className={`mt-1 ${getStatusColor(selectedStudent.studentRecentStatusName)}`}
                                      >
                                        {selectedStudent.studentRecentStatusName}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button 
                                      variant="outline" 
                                      className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
            <div className="text-center sm:text-left">
              Showing <span className="font-medium text-gray-900 dark:text-white">{filtered.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">{departmentData?.students.length || 0}</span> students
            </div>
            <div className="flex items-center gap-2">
              {selectedBcys !== "All" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <Filter className="h-3 w-3" />
                  Filtered by: {selectedBcys}
                </div>
              )}
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span>{departmentData?.statistics.activeStudentsCount || 0} Active</span>
              <span className="mx-2 text-gray-400">•</span>
              <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>{departmentData?.statistics.totalStudentsInDepartment || 0} Total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}