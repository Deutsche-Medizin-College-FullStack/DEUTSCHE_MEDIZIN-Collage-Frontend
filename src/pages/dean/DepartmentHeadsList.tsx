"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  Search,
  Eye,
  Building,
  Phone,
  Mail,
  User,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Image,
  Plus,
  Filter,
} from "lucide-react";

interface DepartmentHead {
  id: number;
  username: string;
  firstNameENG: string;
  firstNameAMH: string;
  fatherNameENG: string;
  fatherNameAMH: string;
  grandfatherNameENG: string;
  grandfatherNameAMH: string;
  gender: string;
  phoneNumber: string;
  email: string;
  hiredDateGC: string;
  hiredDateEC: string;
  department: {
    id: number;
    name: string;
  };
  residenceRegion: { id: string; name: string };
  residenceZone: { id: string; name: string };
  residenceWoreda: { id: string; name: string };
  remark: string;
  active: boolean;
  hasPhoto: boolean;
  hasDocument: boolean;
}

export default function DepartmentHeadsList() {
  const navigate = useNavigate();
  const [departmentHeads, setDepartmentHeads] = useState<DepartmentHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchDepartmentHeads();
  }, []);

  const fetchDepartmentHeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DepartmentHead[]>(
        endPoints.departmentHeads
      );
      setDepartmentHeads(response.data);
    } catch (err: any) {
      console.error("Failed to load department heads:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load department heads. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredHeads = departmentHeads.filter((head) => {
    const matchesSearch =
      searchQuery === "" ||
      head.firstNameENG.toLowerCase().includes(searchQuery.toLowerCase()) ||
      head.fatherNameENG.toLowerCase().includes(searchQuery.toLowerCase()) ||
      head.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      head.phoneNumber.includes(searchQuery) ||
      head.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      head.department.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && head.active) ||
      (filterActive === "inactive" && !head.active);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'MALE' ? (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <User className="h-3 w-3" />
        <span className="text-xs">Male</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
        <User className="h-3 w-3" />
        <span className="text-xs">Female</span>
      </div>
    );
  };

  const getInitials = (firstName: string, fatherName: string) => {
    return `${firstName?.[0] || ''}${fatherName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Department Heads</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unable to Load Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
              {error}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchDepartmentHeads}>
            Retry
          </Button>
          <Button variant="default" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Department Heads
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and view all department heads across different departments
          </p>
        </div>
        <Button
          onClick={() => navigate("/dean/create-department-head")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Head
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Heads</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {departmentHeads.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Across all departments
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 border border-green-100 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Heads</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {departmentHeads.filter(h => h.active).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Currently active
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border border-red-100 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Heads</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {departmentHeads.filter(h => !h.active).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Not currently active
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border border-purple-100 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(departmentHeads.map(h => h.department.name)).size}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unique departments covered
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900 dark:text-white text-xl">Department Heads List</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Browse and manage all department heads
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{departmentHeads.filter(h => h.active).length} Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{departmentHeads.filter(h => !h.active).length} Inactive</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, username, phone, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="flex gap-1">
                  <Button
                    variant={filterActive === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("all")}
                    className="rounded-r-none"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterActive === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("active")}
                    className="rounded-none border-l-0 border-r-0"
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterActive === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("inactive")}
                    className="rounded-l-none"
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterActive("all");
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Department Head
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status & Info
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {filteredHeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No department heads found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                              {searchQuery || filterActive !== "all" 
                                ? "Try adjusting your search or filters" 
                                : "No department heads have been created yet"}
                            </p>
                          </div>
                          {(!searchQuery && filterActive === "all") && (
                            <Button 
                              onClick={() => navigate("/dean/create-department-head")}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create First Department Head
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHeads.map((head) => (
                      <tr key={head.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                {getInitials(head.firstNameENG, head.fatherNameENG)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {head.firstNameENG} {head.fatherNameENG}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                  @{head.username}
                                </code>
                                {getGenderIcon(head.gender)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-gray-800 rounded-lg">
                              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{head.department.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">ID: {head.department.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{head.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                {head.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(head.hiredDateGC)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                              EC: {head.hiredDateEC}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <Badge className={`${getStatusColor(head.active)}`}>
                              {head.active ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                  Inactive
                                </span>
                              )}
                            </Badge>
                            <div className="flex gap-1">
                              {head.hasPhoto && (
                                <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                  <Image className="h-3 w-3 mr-1" />
                                  Photo
                                </Badge>
                              )}
                              {head.hasDocument && (
                                <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Document
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dean/department-heads/${head.id}`)}
                            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
            <div>
              Showing <span className="font-medium text-gray-900 dark:text-white">{filteredHeads.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">{departmentHeads.length}</span> department heads
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Photo Available: {departmentHeads.filter(h => h.hasPhoto).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Document Available: {departmentHeads.filter(h => h.hasDocument).length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}