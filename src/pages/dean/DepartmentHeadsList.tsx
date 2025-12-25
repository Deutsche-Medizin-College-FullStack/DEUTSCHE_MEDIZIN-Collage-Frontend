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
  Edit,
  Building,
  Phone,
  Mail,
  User,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
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
    modality: string;
    level: string;
  };
  residenceRegion: { id: string; name: string };
  residenceZone: { id: string; name: string };
  residenceWoreda: { id: string; name: string };
  remark: string;
  isActive: boolean;
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
      (filterActive === "active" && head.isActive) ||
      (filterActive === "inactive" && !head.isActive);

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

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'MALE' ? (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <User className="h-4 w-4" />
        <span className="text-sm">Male</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
        <User className="h-4 w-4" />
        <span className="text-sm">Female</span>
      </div>
    );
  };

  const getInitials = (firstName: string, fatherName: string) => {
    return `${firstName?.[0] || ''}${fatherName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading department heads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg text-red-600 dark:text-red-400 text-center px-4">
          {error}
        </p>
        <Button variant="outline" onClick={fetchDepartmentHeads}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Department Heads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all department heads in the college
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dean/create-department-head")}
            className="border-gray-300 dark:border-gray-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Heads</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {departmentHeads.length}
                </p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Heads</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {departmentHeads.filter(h => h.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Heads</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {departmentHeads.filter(h => !h.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Departments</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(departmentHeads.map(h => h.department.name)).size}
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
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Department Heads Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Search, filter, and manage department heads
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, username, phone, email, or department"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Filter</label>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("all")}
                  className={filterActive === "all" ? "" : "border-gray-300 dark:border-gray-600"}
                >
                  All
                </Button>
                <Button
                  variant={filterActive === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("active")}
                  className={filterActive === "active" ? "" : "border-gray-300 dark:border-gray-600"}
                >
                  Active
                </Button>
                <Button
                  variant={filterActive === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive("inactive")}
                  className={filterActive === "inactive" ? "" : "border-gray-300 dark:border-gray-600"}
                >
                  Inactive
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 invisible">Export</label>
              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600">
                Export Data
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Head Info</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Department</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Appointment Date</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No department heads found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredHeads.map((head) => (
                    <tr key={head.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {getInitials(head.firstNameENG, head.fatherNameENG)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {head.firstNameENG} {head.fatherNameENG}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                @{head.username}
                              </code>
                              {getGenderIcon(head.gender)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{head.department.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Shield className="h-3 w-3" />
                            <span>{head.department.level}</span>
                            <span className="mx-1">•</span>
                            <span>{head.department.modality}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{head.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                              {head.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatDate(head.hiredDateGC)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            EC: {head.hiredDateEC}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(head.isActive)}`}>
                          {head.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="mt-1 space-x-2">
                          {head.hasPhoto && (
                            <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                              Photo
                            </Badge>
                          )}
                          {head.hasDocument && (
                            <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                              Document
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dean/department-heads/${head.id}`)}
                            className="border-gray-300 dark:border-gray-600"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dean/department-heads/${head.id}/edit`)}
                            className="border-gray-300 dark:border-gray-600"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
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
              Showing <span className="font-medium text-gray-900 dark:text-white">{filteredHeads.length}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">{departmentHeads.length}</span> department heads
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>{departmentHeads.filter(h => h.isActive).length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                <span>{departmentHeads.filter(h => !h.isActive).length} Inactive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}