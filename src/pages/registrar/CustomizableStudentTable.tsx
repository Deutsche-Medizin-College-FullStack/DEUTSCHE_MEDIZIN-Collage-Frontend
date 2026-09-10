"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  Bookmark, // ← ADD THIS (or Save icon)
} from "lucide-react";

// ─── API ────────────────────────────────────────────────────────────────
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  loadFilterOptionsFromStorage,
  saveFilterOptionsToStorage,
} from "@/utils/storage";

const COLUMNS_STORAGE_KEY = "student-table-visible-columns";
// Session storage configuration
const STUDENTS_STORAGE_KEY = "student-table-data";
const STUDENTS_STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const FIELDS_STORAGE_KEY = "student-table-fields";
const FIELDS_STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Types ────────────────────────────────────────────────────────────────
interface NameEntity {
  id: number | string;
  name: string;
}

interface Student {
  id: number | string;
  firstNameENG: string;
  fatherNameENG?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  age?: number;
  studentRecentStatus?: string;
  departmentEnrolled?: NameEntity | string;
  batchClassYearSemester?: NameEntity | string;
  programModality?: NameEntity | string;
  academicYear?: string;
  documentStatus?: string;
  [key: string]: any;
}

interface FilterOptions {
  maritalStatuses?: NameEntity[];
  batches: NameEntity[];
  batchClassYearSemesters: NameEntity[];
  departments: NameEntity[];
  programModalities: NameEntity[];
  academicYears: NameEntity[];
  studentStatuses: NameEntity[];
  programLevels: NameEntity[];
  impairments?: NameEntity[];
  schoolBackgrounds?: NameEntity[]; // ← added

  // ... other fields you might want later
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CustomizableStudentTable() {
  const [fields, setFields] = useState<string[]>([]);
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);

  // State for filter group visibility
  const [showPersonalFilters, setShowPersonalFilters] = useState(false);
  const [showAcademicFilters, setShowAcademicFilters] = useState(false);
  const [showPerformanceFilters, setShowPerformanceFilters] = useState(false);
  const [showAdministrativeFilters, setShowAdministrativeFilters] =
    useState(false);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filters
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [programModalityFilter, setProgramModalityFilter] =
    useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [batchClassYearSemesterFilter, setBatchClassYearSemesterFilter] =
    useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [impairmentFilter, setImpairmentFilter] = useState<string>("all");
  const [programLevelFilter, setProgramLevelFilter] = useState<string>("all");
  // Marital Status
  const [maritalStatusFilter, setMaritalStatusFilter] = useState<string>("all");

  // Date Class End Range
  const [dateClassEndRange, setDateClassEndRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  // Date Graduated Range
  const [dateGraduatedRange, setDateGraduatedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  // Total Courses Registered Range
  const [totalCoursesRange, setTotalCoursesRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });

  // Original Batch Filter
  const [originalBatchFilter, setOriginalBatchFilter] = useState<string>("all");

  // Add these after your existing filter states
  const [schoolBackgroundFilter, setSchoolBackgroundFilter] =
    useState<string>("all");
  const [isTransferFilter, setIsTransferFilter] = useState<string>("all");
  const [documentStatusFilter, setDocumentStatusFilter] =
    useState<string>("all");
  const [exitExamFilter, setExitExamFilter] = useState<string>("all");

  // Range filters
  // All range filter states
  const [ageRange, setAgeRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });
  const [dateEnrolledRange, setDateEnrolledRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });
  const [dateOfBirthRange, setDateOfBirthRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });
  const [cgpaRange, setCgpaRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });
  const [exitExamScoreRange, setExitExamScoreRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });
  const [grade12ResultRange, setGrade12ResultRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });
  const [creditHoursRange, setCreditHoursRange] = useState<{
    min: number | null;
    max: number | null;
  }>({
    min: null,
    max: null,
  });

  // Fetch metadata, filters & data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get available fields
        // 1. Get available fields - with session storage
        let allFields;
        const cachedFields = loadFieldsFromStorage();

        if (cachedFields && !isRefreshing) {
          allFields = cachedFields;
          console.log("Loaded fields from session storage");
        } else {
          const fieldsRes = await apiClient.get<string[]>(endPoints.fields);
          allFields = fieldsRes.data ?? [];
          saveFieldsToStorage(allFields);
          console.log("Fetched fields from API and saved to storage");
        }
        setFields(allFields);

        // Default visible columns
        const defaults = [
          "username",
          "firstNameENG",
          "fatherNameENG",
          "studentRecentStatus",
          "departmentEnrolled",
          "batchClassYearSemester",
        ].filter((f) => allFields.includes(f));

        // Try to load saved columns from localStorage
        const savedColumns = localStorage.getItem(COLUMNS_STORAGE_KEY);
        if (savedColumns) {
          try {
            const parsed = JSON.parse(savedColumns);
            const validSaved = parsed.filter((col: string) =>
              allFields.includes(col),
            );
            if (validSaved.length > 0) {
              setVisibleColumns(validSaved);
            } else {
              setVisibleColumns(
                defaults.length > 0 ? defaults : allFields.slice(0, 10),
              );
            }
          } catch (e) {
            setVisibleColumns(
              defaults.length > 0 ? defaults : allFields.slice(0, 10),
            );
          }
        } else {
          setVisibleColumns(
            defaults.length > 0 ? defaults : allFields.slice(0, 10),
          );
        }

        // 2. Get filter options - with session storage
        let filterOptionsData;
        const cachedFilterOptions = loadFilterOptionsFromStorage();

        if (cachedFilterOptions && !isRefreshing) {
          filterOptionsData = cachedFilterOptions;
        } else {
          const optionsRes = await apiClient.get<FilterOptions>(
            endPoints.lookupsDropdown || "/filters/options",
          );
          filterOptionsData = optionsRes.data;
          saveFilterOptionsToStorage(filterOptionsData);
          console.log("Fetched filter options from API and saved to storage");
        }
        setFilterOptions(filterOptionsData);

        // 3. Get students - with session storage (ONLY ONE FETCH!)
        let studentsData;
        const cachedStudents = loadStudentsFromStorage();

        if (cachedStudents && !isRefreshing) {
          studentsData = cachedStudents;
          console.log("Loaded students from session storage");
        } else {
          const studentsRes = await apiClient.get<Student[]>(
            endPoints.allStudents,
          );
          studentsData = studentsRes.data ?? [];
          saveStudentsToStorage(studentsData);
          console.log("Fetched students from API and saved to storage");
        }

        if (mounted) {
          setStudents(studentsData);
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.error || err.message || "Failed to load data";
        if (mounted) setError(msg);
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isRefreshing]);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    if (visibleColumns.length > 0) {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Save students to session storage with timestamp
  const saveStudentsToStorage = (studentsData: Student[]) => {
    const storageData = {
      data: studentsData,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(storageData));
  };

  // Load students from session storage
  const loadStudentsFromStorage = (): Student[] | null => {
    const stored = sessionStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!stored) return null;

    try {
      const { data, timestamp } = JSON.parse(stored);
      const isExpired = Date.now() - timestamp > STUDENTS_STORAGE_DURATION;

      if (isExpired) {
        sessionStorage.removeItem(STUDENTS_STORAGE_KEY);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  };

  // Save fields to session storage
  const saveFieldsToStorage = (fieldsData: string[]) => {
    const storageData = {
      data: fieldsData,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(storageData));
  };

  // Load fields from session storage
  const loadFieldsFromStorage = (): string[] | null => {
    const stored = sessionStorage.getItem(FIELDS_STORAGE_KEY);
    if (!stored) return null;

    try {
      const { data, timestamp } = JSON.parse(stored);
      const isExpired = Date.now() - timestamp > FIELDS_STORAGE_DURATION;

      if (isExpired) {
        sessionStorage.removeItem(FIELDS_STORAGE_KEY);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setGenderFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setProgramModalityFilter("all");
    setAcademicYearFilter("all");
    setBatchClassYearSemesterFilter("all");
    setBatchFilter("all"); // ← ADD THIS
    setImpairmentFilter("all");
    setProgramLevelFilter("all");

    setSchoolBackgroundFilter("all");
    setIsTransferFilter("all");
    setDocumentStatusFilter("all");
    setExitExamFilter("all");

    setAgeRange({ min: null, max: null });
    setCgpaRange({ min: null, max: null });
    setExitExamScoreRange({ min: null, max: null });
    setGrade12ResultRange({ min: null, max: null });
    setCreditHoursRange({ min: null, max: null });
    setDateOfBirthRange({ start: null, end: null });
    setDateEnrolledRange({ start: null, end: null });

    setMaritalStatusFilter("all");
    setOriginalBatchFilter("all");
    setDateClassEndRange({ start: null, end: null });
    setDateGraduatedRange({ start: null, end: null });
    setTotalCoursesRange({ min: null, max: null });

    // Also expand all filter groups
    setShowPersonalFilters(true);
    setShowAcademicFilters(true);
    setShowPerformanceFilters(true);
    setShowAdministrativeFilters(true);
  };
  // Add this helper function near the top of your component (after states)
  const getEntityId = (value: any): string => {
    if (value == null) return "";

    // Most common case: it's the foreign key (id) directly
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    // Second most common: full object reference
    if (typeof value === "object" && value !== null && "id" in value) {
      return String(value.id);
    }

    // Last resort fallback
    return "";
  };
  // Filtered students (memoized)
  const filteredStudents = useMemo(() => {
    const result = students.filter((student) => {
      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const hit = visibleColumns.some((col) => {
          const v = student[col];
          if (!v) return false;
          const str = typeof v === "object" && "name" in v ? v.name : String(v);
          return str.toLowerCase().includes(term);
        });
        if (!hit) return false;
      }

      // Gender
      if (genderFilter !== "all" && student.gender !== genderFilter)
        return false;
      //=================================================================================================================
      // School Background filter
      if (
        schoolBackgroundFilter !== "all" &&
        getEntityId(student.schoolBackground) !== schoolBackgroundFilter
      ) {
        return false;
      }

      // IsTransfer filter
      if (isTransferFilter !== "all") {
        const transferValue = student.isTransfer;
        let displayValue = "Non-Transfer"; // default for null/false

        if (transferValue === true) {
          displayValue = "Transfer";
        } else if (transferValue === false || transferValue == null) {
          displayValue = "Non-Transfer";
        }

        if (displayValue !== isTransferFilter) {
          return false;
        }
      }

      // Document Status filter
      if (
        documentStatusFilter !== "all" &&
        student.documentStatus !== documentStatusFilter
      ) {
        return false;
      }

      // Exit Exam filter - using exitExamPassStatuses
      if (exitExamFilter !== "all") {
        const examValue = student.isStudentPassExitExam;
        if (examValue !== exitExamFilter) {
          return false;
        }
      }
      //=================================================================================================================
      if (statusFilter !== "all") {
        let studentStatusValue = "";

        // Handle different possible formats
        if (typeof student.studentRecentStatus === "string") {
          studentStatusValue = student.studentRecentStatus;
        } else if (
          student.studentRecentStatus &&
          typeof student.studentRecentStatus === "object"
        ) {
          studentStatusValue = (student.studentRecentStatus as any).name || "";
        }

        // Find the selected status option from lookup
        const selectedStatus = filterOptions?.studentStatuses?.find(
          (s) => String(s.id) === statusFilter,
        );

        if (!selectedStatus) return false;

        // Compare names (case-insensitive + clean underscores)
        const selectedName = selectedStatus.name
          .replace(/_/g, " ")
          .toLowerCase();

        const studentName = studentStatusValue.replace(/_/g, " ").toLowerCase();

        if (studentName !== selectedName) {
          return false;
        }
      }

      // Department
      if (
        departmentFilter !== "all" &&
        getEntityId(student.departmentEnrolled) !== departmentFilter
      ) {
        return false;
      }

      // Program Modality - FIXED
      if (
        programModalityFilter !== "all" &&
        getEntityId(student.programModality) !== programModalityFilter
      ) {
        return false;
      }

      // Academic Year
      if (
        academicYearFilter !== "all" &&
        getEntityId(student.academicYear) !== academicYearFilter
      ) {
        return false;
      }
      // Impairment filter
      if (
        impairmentFilter !== "all" &&
        getEntityId(student.impairment) !== impairmentFilter
      ) {
        return false;
      }

      // Program Level filter
      if (
        programLevelFilter !== "all" &&
        getEntityId(student.programLevel) !== programLevelFilter
      ) {
        return false;
      }

      // Batch / Year / Semester
      if (
        batchClassYearSemesterFilter !== "all" &&
        getEntityId(student.batchClassYearSemester) !==
          batchClassYearSemesterFilter
      ) {
        return false;
      }

      // Batch filter
      if (
        batchFilter !== "all" &&
        getEntityId(student.recentBatch) !== batchFilter
      ) {
        return false;
      }

      //========================================================
      // Age Range - FIXED
      if (
        ageRange.min !== null &&
        student.age !== null &&
        student.age < ageRange.min
      )
        return false;
      if (
        ageRange.max !== null &&
        student.age !== null &&
        student.age > ageRange.max
      )
        return false;

      // CGPA Range - FIXED
      if (
        cgpaRange.min !== null &&
        student.cgpa !== null &&
        student.cgpa < cgpaRange.min
      )
        return false;
      if (
        cgpaRange.max !== null &&
        student.cgpa !== null &&
        student.cgpa > cgpaRange.max
      )
        return false;

      // Exit Exam Score Range - FIXED
      if (
        exitExamScoreRange.min !== null &&
        student.exitExamScore !== null &&
        student.exitExamScore < exitExamScoreRange.min
      )
        return false;
      if (
        exitExamScoreRange.max !== null &&
        student.exitExamScore !== null &&
        student.exitExamScore > exitExamScoreRange.max
      )
        return false;

      // Grade 12 Result Range - FIXED
      if (
        grade12ResultRange.min !== null &&
        student.grade12Result !== null &&
        student.grade12Result < grade12ResultRange.min
      )
        return false;
      if (
        grade12ResultRange.max !== null &&
        student.grade12Result !== null &&
        student.grade12Result > grade12ResultRange.max
      )
        return false;

      // Exit Exam Score Range
      if (
        exitExamScoreRange.min !== null &&
        (student.exitExamScore === null ||
          student.exitExamScore < exitExamScoreRange.min)
      )
        return false;
      if (
        exitExamScoreRange.max !== null &&
        (student.exitExamScore === null ||
          student.exitExamScore > exitExamScoreRange.max)
      )
        return false;

      // Grade 12 Result Range
      if (
        grade12ResultRange.min !== null &&
        (student.grade12Result === null ||
          student.grade12Result < grade12ResultRange.min)
      )
        return false;
      if (
        grade12ResultRange.max !== null &&
        (student.grade12Result === null ||
          student.grade12Result > grade12ResultRange.max)
      )
        return false;

      // Credit Hours Range
      if (
        creditHoursRange.min !== null &&
        (student.totalEarnedCreditHours === null ||
          student.totalEarnedCreditHours < creditHoursRange.min)
      )
        return false;
      if (
        creditHoursRange.max !== null &&
        (student.totalEarnedCreditHours === null ||
          student.totalEarnedCreditHours > creditHoursRange.max)
      )
        return false;

      // Date of Birth Range
      if (dateOfBirthRange.start || dateOfBirthRange.end) {
        const birthDate = student.dateOfBirthGC;

        // Only apply filter if student has a birth date
        if (birthDate) {
          const birth = new Date(birthDate);

          if (
            dateOfBirthRange.start &&
            birth < new Date(dateOfBirthRange.start)
          )
            return false;
          if (dateOfBirthRange.end) {
            const endDate = new Date(dateOfBirthRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (birth > endDate) return false;
          }
        }
        // If student doesn't have birth date but we have range filter, should we filter them out?
        // Currently: they pass through (not filtered out)
      }

      // Date Enrolled Range (keep your existing)
      if (dateEnrolledRange.start || dateEnrolledRange.end) {
        const enrolledDate = student.dateEnrolledGC;

        // Only apply filter if student has an enrolled date
        if (enrolledDate) {
          const enrolled = new Date(enrolledDate);

          if (
            dateEnrolledRange.start &&
            enrolled < new Date(dateEnrolledRange.start)
          )
            return false;
          if (dateEnrolledRange.end) {
            const endDate = new Date(dateEnrolledRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (enrolled > endDate) return false;
          }
        }
        // If student doesn't have enrolled date but we have range filter, they pass through
      }

      // Marital Status
      if (
        maritalStatusFilter !== "all" &&
        student.maritalStatus !== maritalStatusFilter
      )
        return false;

      // Original Batch
      if (
        originalBatchFilter !== "all" &&
        getEntityId(student.batch) !== originalBatchFilter
      )
        return false;

      // Date Class End Range
      if (dateClassEndRange.start || dateClassEndRange.end) {
        const date = student.dateClassEndGC;
        if (date) {
          const dateObj = new Date(date);
          if (
            dateClassEndRange.start &&
            dateObj < new Date(dateClassEndRange.start)
          )
            return false;
          if (dateClassEndRange.end) {
            const endDate = new Date(dateClassEndRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (dateObj > endDate) return false;
          }
        }
      }

      // Date Graduated Range
      if (dateGraduatedRange.start || dateGraduatedRange.end) {
        const date = student.dateGraduated;
        if (date) {
          const dateObj = new Date(date);
          if (
            dateGraduatedRange.start &&
            dateObj < new Date(dateGraduatedRange.start)
          )
            return false;
          if (dateGraduatedRange.end) {
            const endDate = new Date(dateGraduatedRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (dateObj > endDate) return false;
          }
        }
      }

      // Total Courses Registered Range
      if (
        totalCoursesRange.min !== null &&
        student.totalCoursesRegistered !== null &&
        student.totalCoursesRegistered < totalCoursesRange.min
      )
        return false;
      if (
        totalCoursesRange.max !== null &&
        student.totalCoursesRegistered !== null &&
        student.totalCoursesRegistered > totalCoursesRange.max
      )
        return false;

      return true;
    });
    console.log("Filtered students count:", result.length);
    return result;
  }, [
    students,
    searchTerm,
    genderFilter,
    statusFilter,
    departmentFilter,
    programModalityFilter,
    academicYearFilter,
    impairmentFilter, // ← new
    programLevelFilter,
    batchClassYearSemesterFilter,
    batchFilter, // ← ADD THIS
    visibleColumns,
    //====================================
    schoolBackgroundFilter,
    isTransferFilter,
    documentStatusFilter,
    exitExamFilter,

    ageRange,
    cgpaRange,
    exitExamScoreRange,
    grade12ResultRange,
    creditHoursRange,
    dateOfBirthRange,
    dateEnrolledRange,
    maritalStatusFilter,
    originalBatchFilter,
    dateClassEndRange,
    dateGraduatedRange,
    totalCoursesRange,
  ]);

  // Sorted students based on filter results
  const sortedStudents = useMemo(() => {
    if (!sortColumn) return filteredStudents;

    return [...filteredStudents].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle nested objects (like {name: "something"})
      if (aValue && typeof aValue === "object" && "name" in aValue)
        aValue = aValue.name;
      if (bValue && typeof bValue === "object" && "name" in bValue)
        bValue = bValue.name;

      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different data types
      const isNumber = typeof aValue === "number" && typeof bValue === "number";
      const isDate = !isNaN(Date.parse(aValue)) && !isNaN(Date.parse(bValue));

      let comparison = 0;
      if (isNumber) {
        comparison = aValue - bValue;
      } else if (isDate) {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredStudents, sortColumn, sortDirection]);

  //===============================================================================
  // Range handlers (create similar ones for all ranges)
  const handleRangeChange = (
    setter: any,
    field: "min" | "max",
    value: string,
  ) => {
    setter((prev: any) => ({
      ...prev,
      [field]: value === "" ? null : parseFloat(value),
    }));
  };

  const handleDateChange = (
    setter: any,
    field: "start" | "end",
    value: string,
  ) => {
    setter((prev: any) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  // Get distinct values for the new filters
  const distinctDocumentStatuses = useMemo(() => {
    const statuses = new Set<string>();
    students.forEach((student) => {
      if (student.documentStatus) {
        statuses.add(student.documentStatus);
      }
    });
    return Array.from(statuses).sort();
  }, [students]);

  const distinctTransferStatuses = useMemo(() => {
    const transfers = new Set<string>();
    students.forEach((student) => {
      const value = student.isTransfer;
      if (value === true || value === false) {
        transfers.add(value ? "Transfer" : "Non-Transfer");
      } else if (value == null) {
        transfers.add("Non-Transfer"); // null means false
      }
    });
    return Array.from(transfers).sort();
  }, [students]);

  // const distinctExitExamStatuses = useMemo(() => {
  //   const exams = new Set<string>();
  //   students.forEach((student) => {
  //     const value = student.isStudentPassExitExam;
  //     if (value === true) {
  //       exams.add("Passed");
  //     } else if (value === false) {
  //       exams.add("Not Passed");
  //     } else if (value == null) {
  //       exams.add("Not Taken Yet");
  //     }
  //   });
  //   return Array.from(exams).sort();
  // }, [students]);
  //===============================================================================
  const getDisplayValue = (student: Student, field: string): string => {
    const value = student[field];
    if (value == null) return "—";
    if (typeof value === "object" && value?.name) return value.name;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Deutsche Hochschule für Medizin";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Students", {
      properties: { defaultRowHeight: 20 },
    });
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const headerFill = "FFC800";
    const borderColor = "BFBFBF";
    const thinBorder = {
      top: { style: "thin" as const, color: { argb: borderColor } },
      bottom: { style: "thin" as const, color: { argb: borderColor } },
      left: { style: "thin" as const, color: { argb: borderColor } },
      right: { style: "thin" as const, color: { argb: borderColor } },
    };

    worksheet.columns = visibleColumns.map((column) => ({
      header: column,
      key: column,
      width: Math.max(
        16,
        Math.min(
          45,
          Math.max(
            column.length + 2,
            ...filteredStudents.map(
              (student) => getDisplayValue(student, column).length + 2,
            ),
          ),
        ),
      ),
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "000000" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: headerFill },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = thinBorder;
    });

    filteredStudents.forEach((student) => {
      const row = worksheet.addRow(
        visibleColumns.map((column) => getDisplayValue(student, column)),
      );
      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10, color: { argb: "000000" } };
        cell.alignment = {
          horizontal: "left",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = thinBorder;
      });
      const longestValue = row.values
        .slice(1)
        .reduce((max, value) => Math.max(max, String(value ?? "").length), 0);
      row.height = Math.max(20, 18 + Math.ceil(longestValue / 45) * 10);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students_export.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [visibleColumns.map((c) => c.replace(/([A-Z])/g, " $1"))],
      body: filteredStudents.map((s) =>
        visibleColumns.map((col) => getDisplayValue(s, col)),
      ),
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { top: 10 },
      theme: "grid",
    });
    doc.save("students_export.pdf");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-4 flex-col">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">
          Loading student records...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" /> Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Student Records
              </CardTitle>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnsPanel(!showColumnsPanel)}
              >
                {showColumnsPanel ? (
                  <ChevronUp className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-2 h-4 w-4" />
                )}
                Columns
              </Button>
              {/* Save button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.setItem(
                    COLUMNS_STORAGE_KEY,
                    JSON.stringify(visibleColumns),
                  );
                  // Optional: Show a toast notification
                  toast({
                    title: "Success",
                    description: "Column preferences saved!",
                    status: "success",
                  });
                }}
              >
                <Bookmark className="mr-2 h-4 w-4" /> Save Columns
              </Button>
              <Button variant="outline" size="sm" onClick={exportExcel}>
                <Download className="mr-2 h-4 w-4" /> Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Column selection */}
          {showColumnsPanel && (
            <div className="rounded-lg border bg-muted/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">
                  Visible Columns ({visibleColumns.length}/{fields.length}{" "}
                  selected)
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisibleColumns([...fields])}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisibleColumns([])}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {fields.map((field) => (
                  <div
                    key={field}
                    className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${
                      visibleColumns.includes(field)
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={`col-${field}`}
                      checked={visibleColumns.includes(field)}
                      onCheckedChange={() => {
                        setVisibleColumns((prev) =>
                          prev.includes(field)
                            ? prev.filter((f) => f !== field)
                            : [...prev, field],
                        );
                      }}
                    />
                    <Label
                      htmlFor={`col-${field}`}
                      className={`cursor-pointer text-sm font-normal capitalize ${
                        visibleColumns.includes(field)
                          ? "text-primary font-medium"
                          : ""
                      }`}
                    >
                      {field.replace(/([A-Z])/g, " $1")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Organized Filter Groups */}
          <div className="space-y-4">
            {/* PERSONAL INFO FILTERS */}
            <div className="border-b border-border/50 pb-3">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors"
                onClick={() => setShowPersonalFilters(!showPersonalFilters)}
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Personal Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonalFilters(!showPersonalFilters);
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showPersonalFilters ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </Button>
              </div>

              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  showPersonalFilters
                    ? "max-h-[2000px] opacity-100 mt-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {" "}
                  {/* Gender */}
                  <div>
                    <Label className="mb-1.5 text-sm">Gender</Label>
                    <Select
                      value={genderFilter}
                      onValueChange={setGenderFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Age Range Filter */}
                  <div>
                    <Label className="mb-1.5 text-sm">Age Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={ageRange.min === null ? "" : ageRange.min}
                        onChange={(e) =>
                          handleRangeChange(setAgeRange, "min", e.target.value)
                        }
                        min="15"
                        max="100"
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={ageRange.max === null ? "" : ageRange.max}
                        onChange={(e) =>
                          handleRangeChange(setAgeRange, "max", e.target.value)
                        }
                        min="15"
                        max="100"
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Impairment */}
                  <div>
                    <Label className="mb-1.5 text-sm">Impairment</Label>
                    <Select
                      value={impairmentFilter}
                      onValueChange={setImpairmentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Impairments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Impairments</SelectItem>
                        {filterOptions?.impairments?.map((imp) => (
                          <SelectItem key={imp.id} value={String(imp.id)}>
                            {imp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Marital Status */}
                  <div>
                    <Label className="mb-1.5 text-sm">Marital Status</Label>
                    <Select
                      value={maritalStatusFilter}
                      onValueChange={setMaritalStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions?.maritalStatuses?.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Date of Birth Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Date of Birth Range
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">
                          From:
                        </Label>
                        <Input
                          type="date"
                          value={dateOfBirthRange.start || ""}
                          onChange={(e) =>
                            setDateOfBirthRange((prev) => ({
                              ...prev,
                              start: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">To:</Label>
                        <Input
                          type="date"
                          value={dateOfBirthRange.end || ""}
                          onChange={(e) =>
                            setDateOfBirthRange((prev) => ({
                              ...prev,
                              end: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACADEMIC INFO FILTERS */}
            <div className="border-b border-border/50 pb-3">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors"
                onClick={() => setShowAcademicFilters(!showAcademicFilters)}
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Academic Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAcademicFilters(!showAcademicFilters);
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showAcademicFilters ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </Button>
              </div>

              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  showAcademicFilters
                    ? "max-h-[2000px] opacity-100 mt-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {" "}
                  {/* Department */}
                  <div>
                    <Label className="mb-1.5 text-sm">Department</Label>
                    <Select
                      value={departmentFilter}
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {filterOptions?.departments?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Program Modality */}
                  <div>
                    <Label className="mb-1.5 text-sm">Program Modality</Label>
                    <Select
                      value={programModalityFilter}
                      onValueChange={setProgramModalityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Modalities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modalities</SelectItem>
                        {filterOptions?.programModalities?.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Program Level */}
                  <div>
                    <Label className="mb-1.5 text-sm">Program Level</Label>
                    <Select
                      value={programLevelFilter}
                      onValueChange={setProgramLevelFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Program Levels</SelectItem>
                        {filterOptions?.programLevels?.map((level) => (
                          <SelectItem key={level.id} value={String(level.id)}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Academic Year */}
                  {/* <div>
                    <Label className="mb-1.5 text-sm">Academic Year</Label>
                    <Select
                      value={academicYearFilter}
                      onValueChange={setAcademicYearFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Academic Years</SelectItem>
                        {filterOptions?.academicYears?.map((y) => (
                          <SelectItem key={y.id} value={String(y.id)}>
                            {y.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  {/* Batch */}
                  <div>
                    <Label className="mb-1.5 text-sm">Recent Batch</Label>
                    <Select value={batchFilter} onValueChange={setBatchFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {filterOptions?.batches?.map((batch) => (
                          <SelectItem key={batch.id} value={String(batch.id)}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Original Batch */}
                  <div>
                    <Label className="mb-1.5 text-sm">Original Batch</Label>
                    <Select
                      value={originalBatchFilter}
                      onValueChange={setOriginalBatchFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {filterOptions?.batches?.map((batch) => (
                          <SelectItem key={batch.id} value={String(batch.id)}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Batch / Year / Semester */}
                  <div>
                    <Label className="mb-1.5 text-sm">Recent BCYS</Label>
                    <Select
                      value={batchClassYearSemesterFilter}
                      onValueChange={setBatchClassYearSemesterFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All BCYS</SelectItem>
                        {filterOptions?.batchClassYearSemesters?.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* School Background */}
                  <div>
                    <Label className="mb-1.5 text-sm">School Background</Label>
                    <Select
                      value={schoolBackgroundFilter}
                      onValueChange={setSchoolBackgroundFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Backgrounds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Backgrounds</SelectItem>
                        {filterOptions?.schoolBackgrounds?.map((bg) => (
                          <SelectItem key={bg.id} value={String(bg.id)}>
                            {bg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Status */}
                  <div>
                    <Label className="mb-1.5 text-sm">Recent Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions?.studentStatuses?.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* PERFORMANCE FILTERS */}
            <div className="border-b border-border/50 pb-3">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors"
                onClick={() =>
                  setShowPerformanceFilters(!showPerformanceFilters)
                }
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Performance & Scores
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPerformanceFilters(!showPerformanceFilters);
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showPerformanceFilters ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </Button>
              </div>

              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  showPerformanceFilters
                    ? "max-h-[500px] opacity-100 mt-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {" "}
                  {/* CGPA Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">CGPA Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        step="0.1"
                        min="0"
                        max="4.0"
                        value={cgpaRange.min === null ? "" : cgpaRange.min}
                        onChange={(e) =>
                          setCgpaRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        step="0.1"
                        min="0"
                        max="4.0"
                        value={cgpaRange.max === null ? "" : cgpaRange.max}
                        onChange={(e) =>
                          setCgpaRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Exit Exam Score Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Exit Exam Score Range
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={
                          exitExamScoreRange.min === null
                            ? ""
                            : exitExamScoreRange.min
                        }
                        onChange={(e) =>
                          setExitExamScoreRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={
                          exitExamScoreRange.max === null
                            ? ""
                            : exitExamScoreRange.max
                        }
                        onChange={(e) =>
                          setExitExamScoreRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Grade 12 Result Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Grade 12 Score Range
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={
                          grade12ResultRange.min === null
                            ? ""
                            : grade12ResultRange.min
                        }
                        onChange={(e) =>
                          setGrade12ResultRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={
                          grade12ResultRange.max === null
                            ? ""
                            : grade12ResultRange.max
                        }
                        onChange={(e) =>
                          setGrade12ResultRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Total Credit Hours Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">Credit Hours Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={
                          creditHoursRange.min === null
                            ? ""
                            : creditHoursRange.min
                        }
                        onChange={(e) =>
                          setCreditHoursRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={
                          creditHoursRange.max === null
                            ? ""
                            : creditHoursRange.max
                        }
                        onChange={(e) =>
                          setCreditHoursRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Total Courses Registered Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Total Courses Registered
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={
                          totalCoursesRange.min === null
                            ? ""
                            : totalCoursesRange.min
                        }
                        onChange={(e) =>
                          setTotalCoursesRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={
                          totalCoursesRange.max === null
                            ? ""
                            : totalCoursesRange.max
                        }
                        onChange={(e) =>
                          setTotalCoursesRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value),
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {/* Exit Exam Status */}
                  <div>
                    <Label className="mb-1.5 text-sm">Exit Exam Status</Label>
                    <Select
                      value={exitExamFilter}
                      onValueChange={setExitExamFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Exit Exam Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Exit Exam Status
                        </SelectItem>
                        {filterOptions?.exitExamPassStatuses?.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* ADMINISTRATIVE FILTERS */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors"
                onClick={() =>
                  setShowAdministrativeFilters(!showAdministrativeFilters)
                }
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Administrative
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAdministrativeFilters(!showAdministrativeFilters);
                  }}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showAdministrativeFilters ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </Button>
              </div>

              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  showAdministrativeFilters
                    ? "max-h-[500px] opacity-100 mt-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {" "}
                  {/* Document Status */}
                  <div>
                    <Label className="mb-1.5 text-sm">Document Status</Label>
                    <Select
                      value={documentStatusFilter}
                      onValueChange={setDocumentStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Document Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Document Status</SelectItem>
                        {distinctDocumentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Transfer Status */}
                  <div>
                    <Label className="mb-1.5 text-sm">Transfer Status</Label>
                    <Select
                      value={isTransferFilter}
                      onValueChange={setIsTransferFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Transfer Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transfer Status</SelectItem>
                        {distinctTransferStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Date Enrolled Range Filter */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Enrollment Date Range
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">
                          From:
                        </Label>
                        <Input
                          type="date"
                          value={dateEnrolledRange.start || ""}
                          onChange={(e) =>
                            setDateEnrolledRange((prev) => ({
                              ...prev,
                              start: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">To:</Label>
                        <Input
                          type="date"
                          value={dateEnrolledRange.end || ""}
                          onChange={(e) =>
                            setDateEnrolledRange((prev) => ({
                              ...prev,
                              end: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Date Class End Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Class End Date Range
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">From:</Label>
                        <Input
                          type="date"
                          value={dateClassEndRange.start || ""}
                          onChange={(e) =>
                            setDateClassEndRange((prev) => ({
                              ...prev,
                              start: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">To:</Label>
                        <Input
                          type="date"
                          value={dateClassEndRange.end || ""}
                          onChange={(e) =>
                            setDateClassEndRange((prev) => ({
                              ...prev,
                              end: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Date Graduated Range */}
                  <div>
                    <Label className="mb-1.5 text-sm">
                      Graduation Date Range
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">From:</Label>
                        <Input
                          type="date"
                          value={dateGraduatedRange.start || ""}
                          onChange={(e) =>
                            setDateGraduatedRange((prev) => ({
                              ...prev,
                              start: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">To:</Label>
                        <Input
                          type="date"
                          value={dateGraduatedRange.end || ""}
                          onChange={(e) =>
                            setDateGraduatedRange((prev) => ({
                              ...prev,
                              end: e.target.value || null,
                            }))
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex items-center justify-between mt-1.5 mb-4">
            <CardDescription>
              {sortedStudents.length} record
              {sortedStudents.length !== 1 ? "s" : ""} found
            </CardDescription>

            <Button
              variant="outline"
              size="sm"
              // In your refresh button, remove setLoading(true) since it's handled by isRefreshing
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  // Refresh students
                  const studentsRes = await apiClient.get<Student[]>(
                    endPoints.allStudents,
                  );
                  const freshData = studentsRes.data ?? [];
                  setStudents(freshData);
                  saveStudentsToStorage(freshData);

                  // Refresh filter options
                  const optionsRes = await apiClient.get<FilterOptions>(
                    endPoints.lookupsDropdown || "/filters/options",
                  );
                  const freshOptions = optionsRes.data;
                  setFilterOptions(freshOptions);
                  saveFilterOptionsToStorage(freshOptions);

                  // Refresh fields
                  const fieldsRes = await apiClient.get<string[]>(
                    endPoints.fields,
                  );
                  const freshFields = fieldsRes.data ?? [];
                  setFields(freshFields);
                  saveFieldsToStorage(freshFields);

                  toast({
                    title: "Success",
                    description:
                      "Student data and filter options refreshed from server!",
                  });
                } catch (err) {
                  toast({
                    title: "Error",
                    description: "Failed to refresh data",
                    variant: "destructive",
                  });
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto overflow-y-auto rounded-md border max-h-[100vh] [&_[data-slot=table-container]]:overflow-visible">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 backdrop-blur-md supports-[backdrop-filter]:bg-muted/40 sticky top-0 z-20">
                  {visibleColumns.map((col) => (
                    <TableHead
                      key={col}
                      className="whitespace-nowrap capitalize backdrop-blur-md supports-[backdrop-filter]:bg-muted/40 border-b cursor-pointer hover:bg-muted/80 transition-colors group"
                      style={{
                        position: "sticky",
                        top: 0,
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        backgroundColor: "rgba(var(--muted), 0.6)",
                      }}
                      onClick={() => {
                        if (sortColumn === col) {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc",
                          );
                        } else {
                          setSortColumn(col);
                          setSortDirection("asc");
                        }
                      }}
                      title={`Click to sort by ${col.replace(/([A-Z])/g, " $1")}`}
                    >
                      <div className="flex items-center gap-1">
                        {col.replace(/([A-Z])/g, " $1")}
                        {sortColumn === col && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                        {sortColumn !== col && (
                          <span className="text-xs opacity-0 group-hover:opacity-50">
                            ↕
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="h-48 text-center text-muted-foreground"
                    >
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((student) => (
                    <TableRow key={student.id ?? Math.random()}>
                      {visibleColumns.map((col) => (
                        <TableCell key={col} className="py-3">
                          {getDisplayValue(student, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
