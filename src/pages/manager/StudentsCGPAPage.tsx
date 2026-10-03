"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  ChevronDown,
  Check,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiService from "@/components/api/apiService";
import { clearCacheForUrl } from "@/components/api/cacheService";
import endPoints from "@/components/api/endPoints";

// Interface from API response
interface StudentCGPA {
  studentId: number;
  idNumber: string;
  fullName: string;
  department: string;
  batchClassYearSemester: string;
  studentStatus: string;
  cgpa: number;
}

// ─── MultiSelect Dropdown Component ───
interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string; count?: number }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected =
    options.length > 0 && selectedValues.length === options.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
        {label}
      </Label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 py-2 text-left bg-white dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex items-center justify-between transition-colors"
      >
        <span className="truncate text-gray-800 dark:text-gray-200">
          {selectedValues.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-400">{placeholder}</span>
          ) : selectedValues.length === options.length ? (
            `All (${options.length}) selected`
          ) : (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {selectedValues.length} selected
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {selectedValues.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold rounded-full">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[260px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search box if options > 4 */}
          {options.length > 4 && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Quick Action Header: Select All / Clear */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700 text-xs">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.count !== undefined && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {opt.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Students CGPA Page ───
export default function StudentsCGPAPage() {
  const [students, setStudents] = useState<StudentCGPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<StudentCGPA[]>(
        endPoints.getAllStudentsCGPA
      );
      setStudents(response);
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

  const handleRefresh = async () => {
    await clearCacheForUrl(endPoints.getAllStudentsCGPA);
    await fetchStudents();
  };

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    return ["all", ...new Set(students.map((s) => s.department).filter(Boolean))].sort();
  }, [students]);

  // Unique Batch / Year / Semester options with count
  const batchOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const val = s.batchClassYearSemester || "Not Assigned";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.keys(counts)
      .sort()
      .map((val) => ({
        value: val,
        label: val,
        count: counts[val],
      }));
  }, [students]);

  // Unique Status options with count
  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const val = s.studentStatus || "Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.keys(counts)
      .sort()
      .map((val) => ({
        value: val,
        label: val.replace(/_/g, " "),
        count: counts[val],
      }));
  }, [students]);

  // Filter students based on all criteria
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search query
      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          student.fullName?.toLowerCase().includes(search) ||
          student.idNumber?.toLowerCase().includes(search) ||
          student.department?.toLowerCase().includes(search) ||
          student.studentStatus?.toLowerCase().includes(search) ||
          student.batchClassYearSemester?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Department filter
      if (
        selectedDepartment !== "all" &&
        student.department !== selectedDepartment
      ) {
        return false;
      }

      // Batch / Year / Semester multi-select filter
      if (selectedBatches.length > 0) {
        const studentBatch = student.batchClassYearSemester || "Not Assigned";
        if (!selectedBatches.includes(studentBatch)) {
          return false;
        }
      }

      // Status multi-select filter
      if (selectedStatuses.length > 0) {
        const studentStat = student.studentStatus || "Unknown";
        if (!selectedStatuses.includes(studentStat)) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchQuery, selectedDepartment, selectedBatches, selectedStatuses]);

  // Group filtered students by department
  const groupedByDepartment = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      const dept = student.department || "General";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(student);
      return acc;
    }, {} as Record<string, StudentCGPA[]>);
  }, [filteredStudents]);

  const sortedDepartments = useMemo(() => {
    return Object.keys(groupedByDepartment).sort();
  }, [groupedByDepartment]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDepartment !== "all" ||
    selectedBatches.length > 0 ||
    selectedStatuses.length > 0;

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("all");
    setSelectedBatches([]);
    setSelectedStatuses([]);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-base font-medium text-gray-600 dark:text-gray-300">
          Loading students &amp; academic records…
        </p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <AlertCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 text-center max-w-md">
          {error}
        </p>
        <Button
          onClick={fetchStudents}
          variant="outline"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ━━━━━━━━━━━━━ PAGE HEADER ━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Students &amp; CGPA Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View student grades, enrollment status, and academic progression
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━ FILTER CONTROL CARD ━━━━━━━━━━━━━ */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <Label
                htmlFor="search"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 block"
              >
                Search Students
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, ID number..."
                  className="pl-9 h-10 bg-white dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:border-blue-500"
                />
              </div>
            </div>

            {/* Department Single Filter */}
            <div>
              <Label
                htmlFor="department"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 block"
              >
                Department
              </Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger
                  id="department"
                  className="h-10 bg-white dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:border-blue-500"
                >
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch / Year / Semester Multi-Select */}
            <MultiSelectDropdown
              label="Batch / Year / Semester"
              placeholder="All Batches / Semesters"
              options={batchOptions}
              selectedValues={selectedBatches}
              onChange={setSelectedBatches}
            />

            {/* Status Multi-Select */}
            <MultiSelectDropdown
              label="Status"
              placeholder="All Statuses"
              options={statusOptions}
              selectedValues={selectedStatuses}
              onChange={setSelectedStatuses}
            />
          </div>

          {/* Active Filter Chips & Reset Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Showing{" "}
                <strong className="text-gray-900 dark:text-white">
                  {filteredStudents.length}
                </strong>{" "}
                of {students.length} students
              </span>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ━━━━━━━━━━━━━ STUDENT TABLES GROUPED BY DEPARTMENT ━━━━━━━━━━━━━ */}
      {sortedDepartments.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl py-16 text-center">
          <CardContent className="space-y-3">
            <Filter className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto opacity-40" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No students match your filter criteria
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Try adjusting your search terms or clearing selected batch/status filters
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllFilters}
              className="mt-2 text-xs border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDepartments.map((department) => {
            const deptStudents = groupedByDepartment[department];

            return (
              <Card
                key={department}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden"
              >
                <CardHeader className="bg-gray-100/80 dark:bg-gray-700/70 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {department} Department
                    </CardTitle>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      {deptStudents.length} student
                      {deptStudents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/90 dark:bg-gray-800">
                        <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 py-3 pl-6">
                            ID Number
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 py-3">
                            Full Name
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 py-3">
                            Batch / Year / Semester
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 py-3">
                            Status
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 py-3 text-right pr-6">
                            CGPA
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deptStudents.map((student) => {
                          const isHigh = student.cgpa >= 3.5;
                          const isGood = student.cgpa >= 3.0;
                          const isPass = student.cgpa >= 2.0;

                          const cgpaClass = isHigh
                            ? "text-emerald-600 dark:text-emerald-400 font-bold"
                            : isGood
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : isPass
                            ? "text-amber-600 dark:text-amber-400 font-bold"
                            : "text-amber-700 dark:text-amber-500 font-bold";

                          const statusUpper = (student.studentStatus || "").toUpperCase();
                          const statusStyle =
                            statusUpper.includes("ACTIVE") ||
                            statusUpper.includes("APPROVED") ||
                            statusUpper.includes("GRADUATED")
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : statusUpper.includes("INCOMPLETE") ||
                                statusUpper.includes("PENDING")
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800";

                          return (
                            <TableRow
                              key={student.studentId}
                              className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                            >
                              <TableCell className="font-semibold text-gray-900 dark:text-white pl-6 text-sm">
                                {student.idNumber}
                              </TableCell>
                              <TableCell className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                                {student.fullName}
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-300 text-sm">
                                {student.batchClassYearSemester || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2.5 py-0.5 font-medium rounded-full ${statusStyle}`}
                                >
                                  {student.studentStatus || "Unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell className={`text-right pr-6 text-sm ${cgpaClass}`}>
                                {typeof student.cgpa === "number"
                                  ? student.cgpa.toFixed(2)
                                  : student.cgpa}
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
