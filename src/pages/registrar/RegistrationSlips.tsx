import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Printer,
  FileText,
  User,
  Calendar,
  BookOpen,
  Plus,
  Trash2,
  Filter,
  Check,
  CheckSquare,
  Square,
  Eye,
  X,
  CheckCircle,
  Circle,
  ChevronDown,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Mock toast for now - replace with actual toast library if needed
const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") {
      console.log("Success:", msg);
      alert(msg);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      console.error("Error:", msg);
      alert(msg);
    }
  },
};

interface Student {
  studentId: number;
  username: string;
  fullNameAMH: string;
  fullNameENG: string;
  bcysId: number;
  bcysDisplayName: string;
  departmentId: number;
  departmentName: string;
  programModalityCode: string;
  programModalityName: string;
  programLevelCode: string;
  programLevelName: string;
  age?: number;
  sex?: string;
  batch?: string;
  yearOfStudy?: string;
  semester?: string;
  accepted?: boolean;
}

interface Course {
  id: number;
  ccode: string;
  ctitle: string;
  theoryHrs: number;
  labHrs: number;
  creditHours?: number;
}

interface RegistrationCourse {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  lectureHours: number;
  labHours: number;
  totalHours: number;
}

interface FilterData {
  departments: Array<{ id: number; name: string }>;
  batches: Array<{ id: number; name: string }>;
  enrollmentTypes: Array<{ id: string; name: string }>;
  classYears: Array<{ id: number; name: string }>;
  semesters: Array<{ id: string; name: string }>;
  academicYears: Array<{ id: string; name: string }>;
  programLevels: Array<{ id: string; name: string }>;
  programModalities: Array<{ id: string; name: string }>;
}

interface ApiStudent {
  studentId: number;
  username: string;
  fullNameAMH: string;
  fullNameENG: string;
  bcysId: number;
  bcysDisplayName: string;
  departmentId: number;
  departmentName: string;
  programModalityCode: string;
  programModalityName: string;
  programLevelCode: string;
  programLevelName: string;
}

interface Bcys {
  bcysId: number;
  batchId: number;
  classYearId: number;
  semesterId: string;
  entryYearId: number | null;
  classStartGC: string | null;
  classStartEC: string | null;
  classEndGC: string | null;
  classEndEC: string | null;
  gradingSystemId: number;
  name: string;
}

interface PreviewStudent {
  studentId: number;
  username: string;
  fullNameEng: string;
  fullNameAmh: string;
  age: number;
  gender: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  classYearId: number;
  classYearName: string;
  semesterId: string;
  semesterName: string;
  academicYearCode: string;
  academicYearGC: string;
  academicYearEC: string;
  enrollmentTypeCode: string;
  enrollmentTypeName: string;
  batchDisplayName: string;
  courses: Array<{
    courseId: number;
    code: string;
    title: string;
    lectureHours: number;
    labHours: number;
    totalHours: number;
  }>;
  accepted?: boolean;
}

interface GenerateSlipRequest {
  batchClassYearSemesterId: number;
  sourceId: number;
  students: Array<{
    studentId: number;
    courseIds: number[];
  }>;
}

interface GenerateSlipResponse {
  batchClassYearSemesterId: number;
  sourceId: number;
  totalStudents: number;
  successful: number;
  failed: number;
  results: Array<{
    studentId: number;
    success: boolean;
    message: string;
    enrolledCount: number;
  }>;
  errors: string[];
}

export default function RegistrationSlips() {
  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [registrationCourses, setRegistrationCourses] = useState<
    RegistrationCourse[]
  >([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Add a new state for dropdown visibility
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const dateOfRegistration = new Date().toISOString().split("T")[0];
  const [batchClassYear, setBatchClassYear] = useState("");
  const [paymentReceiptNo, setPaymentReceiptNo] = useState("");

  // Filter states
  const [filterData, setFilterData] = useState<FilterData>({
    departments: [],
    batches: [],
    enrollmentTypes: [],
    classYears: [],
    semesters: [],
    academicYears: [],
    programLevels: [],
    programModalities: [],
  });

  const [filters, setFilters] = useState({
    departmentId: "",
    batchId: "",
    enrollmentTypeId: "",
    classYearId: "",
    semesterId: "",
    academicYearId: "",
    programLevelId: "",
    programModalityId: "",
  });

  const [bcysList, setBcysList] = useState<Bcys[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // New states for preview functionality
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewStudent[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewStudent, setSelectedPreviewStudent] =
    useState<PreviewStudent | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generatingSlips, setGeneratingSlips] = useState(false);
  const [slipsGenerated, setSlipsGenerated] = useState(false);

  // Add new state for course search
  const [courseSearch, setCourseSearch] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  // Function to select only a single student
  const handleSelectSingleStudent = (student: Student) => {
    setSelectedStudents([student]);
  };

  useEffect(() => {
    // Initialize payment receipt number
    setPaymentReceiptNo("");

    // Fetch students, filter data, and BCYS
    fetchStudents();
    fetchFilterData();
    fetchBcysList();
  }, []);

  useEffect(() => {
    if (selectedStudents.length > 0) {
      const studentIds = selectedStudents.map((s) => s.studentId);
      fetchCourses(studentIds);
    } else {
      // Clear courses when no students are selected
      setCourses([]);
      setFilteredCourses([]);
    }
  }, [selectedStudents]);

  // Filter courses based on search
  useEffect(() => {
    if (courses.length > 0) {
      if (!courseSearch.trim()) {
        setFilteredCourses(courses);
      } else {
        const searchTerm = courseSearch.toLowerCase().trim();
        const filtered = courses.filter(
          (course) =>
            (course.ccode && course.ccode.toLowerCase().includes(searchTerm)) ||
            (course.ctitle &&
              course.ctitle.toLowerCase().includes(searchTerm)) ||
            (course.ccode &&
              course.ctitle &&
              `${course.ccode} ${course.ctitle}`
                .toLowerCase()
                .includes(searchTerm))
        );
        setFilteredCourses(filtered);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [courses, courseSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset slipsGenerated when preview data changes
  useEffect(() => {
    setSlipsGenerated(false);
  }, [previewData]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(endPoints.studentsSlip);

      // Check if response is valid
      if (!Array.isArray(response)) {
        console.error("Invalid students response:", response);
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        toast.error("Failed to fetch students: Invalid response format");
        return;
      }

      // Transform API response to match our Student interface
      const transformedStudents: Student[] = response.map(
        (student: ApiStudent) => ({
          studentId: student.studentId || 0,
          username: student.username || "",
          fullNameAMH: student.fullNameAMH || "",
          fullNameENG: student.fullNameENG || "",
          bcysId: student.bcysId || 0,
          bcysDisplayName: student.bcysDisplayName || "",
          departmentId: student.departmentId || 0,
          departmentName: student.departmentName || "",
          programModalityCode: student.programModalityCode || "",
          programModalityName: student.programModalityName || "",
          programLevelCode: student.programLevelCode || "",
          programLevelName: student.programLevelName || "",
          age: 22,
          sex: "Male",
          batch: (student.bcysDisplayName || "").split("-")[0] || "2024",
          yearOfStudy: `Year ${
            (student.bcysDisplayName || "").split("-")[1] || "1"
          }`,
          semester:
            (student.bcysDisplayName || "").split("-")[2] === "1"
              ? "Semester 1"
              : "Semester 2",
          accepted: false,
        })
      );

      setStudents(transformedStudents);
      setFilteredStudents(transformedStudents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
      toast.error("Failed to fetch students");
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const fetchFilterData = async () => {
    try {
      const response = await apiService.get(endPoints.lookupsDropdown);
      if (response && typeof response === "object") {
        setFilterData({
          departments: Array.isArray(response.departments)
            ? response.departments
            : [],
          batches: Array.isArray(response.batches) ? response.batches : [],
          enrollmentTypes: Array.isArray(response.enrollmentTypes)
            ? response.enrollmentTypes
            : [],
          classYears: Array.isArray(response.classYears)
            ? response.classYears
            : [],
          semesters: Array.isArray(response.semesters)
            ? response.semesters
            : [],
          academicYears: Array.isArray(response.academicYears)
            ? response.academicYears
            : [],
          programLevels: Array.isArray(response.programLevels)
            ? response.programLevels
            : [],
          programModalities: Array.isArray(response.programModalities)
            ? response.programModalities
            : [],
        });
      } else {
        console.error("Invalid filter data response:", response);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  const fetchBcysList = async () => {
    try {
      const response = await apiService.get(endPoints.batchClassSemsterYear);
      if (Array.isArray(response)) {
        setBcysList(response);
      } else {
        console.error("Invalid BCYS response:", response);
        setBcysList([]);
      }
    } catch (error) {
      console.error("Error fetching BCYS list:", error);
      setBcysList([]);
    }
  };

  const fetchCourses = async (studentIds?: number[]) => {
    try {
      setCoursesLoading(true);
      console.log("Fetching courses from:", endPoints.slipCourses);

      let response;
      if (studentIds && studentIds.length > 0) {
        // If student IDs are provided, fetch courses for specific students
        console.log("Fetching courses for student IDs:", studentIds);
        response = await apiService.post(endPoints.slipCourses, { studentIds });
      } else {
        // Fallback to original behavior if no student IDs
        response = await apiService.get(endPoints.slipCourses);
      }

      console.log("Courses API response structure:", response);

      // Check if response is valid
      if (Array.isArray(response)) {
        console.log("Courses loaded successfully:", response.length, "courses");

        // Transform the API response to match our Course interface
        const transformedCourses = response.map((course: any) => {
          // Calculate total credit hours (usually theory + lab)
          const totalHours =
            (course.lectureHours || course.theoryHrs || 0) +
            (course.labHours || course.labHrs || 0);

          return {
            id: course.courseId || course.id || 0,
            ccode: course.code || course.ccode || "N/A",
            ctitle: course.title || course.ctitle || "Unknown Course",
            theoryHrs: course.lectureHours || course.theoryHrs || 0,
            labHrs: course.labHours || course.labHrs || 0,
            creditHours: totalHours,
          };
        });

        setCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
        console.log("Transformed courses:", transformedCourses.slice(0, 3));
      } else {
        console.error("Invalid courses response:", response);
        setCourses([]);
        setFilteredCourses([]);
        toast.error("Failed to load courses: Invalid response format");
      }

      setCoursesLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCoursesLoading(false);
      toast.error("Failed to load courses");
      setCourses([]);
      setFilteredCourses([]);
    }
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(query, filters);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    applyFiltersAndSearch(searchQuery, newFilters);
  };

  const applyFiltersAndSearch = (
    searchQuery: string = "",
    currentFilters = filters
  ) => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (student) =>
          (student.fullNameENG?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (student.fullNameAMH?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (student.username?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          student.studentId?.toString().includes(searchQuery)
      );
    }

    // Apply other filters
    if (currentFilters.departmentId) {
      const departmentName = filterData.departments.find(
        (d) => d.id?.toString() === currentFilters.departmentId
      )?.name;
      if (departmentName) {
        filtered = filtered.filter(
          (student) => student.departmentName === departmentName
        );
      }
    }

    if (currentFilters.batchId) {
      const batchName = filterData.batches.find(
        (b) => b.id?.toString() === currentFilters.batchId
      )?.name;
      if (batchName) {
        filtered = filtered.filter((student) => student.batch === batchName);
      }
    }

    if (currentFilters.enrollmentTypeId) {
      const enrollmentTypeName = filterData.enrollmentTypes.find(
        (e) => e.id === currentFilters.enrollmentTypeId
      )?.name;
      if (enrollmentTypeName) {
        filtered = filtered.filter(
          (student) => student.programModalityName === enrollmentTypeName
        );
      }
    }

    if (currentFilters.classYearId) {
      const classYearName = filterData.classYears.find(
        (c) => c.id?.toString() === currentFilters.classYearId
      )?.name;
      if (classYearName) {
        filtered = filtered.filter((student) =>
          student.yearOfStudy?.includes(classYearName)
        );
      }
    }

    if (currentFilters.semesterId) {
      const semesterName = filterData.semesters.find(
        (s) => s.id === currentFilters.semesterId
      )?.name;
      if (semesterName) {
        filtered = filtered.filter((student) =>
          student.semester?.toLowerCase().includes(semesterName.toLowerCase())
        );
      }
    }

    if (currentFilters.programLevelId) {
      filtered = filtered.filter(
        (student) => student.programLevelCode === currentFilters.programLevelId
      );
    }

    if (currentFilters.programModalityId) {
      filtered = filtered.filter(
        (student) =>
          student.programModalityCode === currentFilters.programModalityId
      );
    }

    setFilteredStudents(filtered);
    setSelectAll(false);
  };

  const handleSelectStudent = (student: Student) => {
    const isSelected = selectedStudents.some(
      (s) => s.studentId === student.studentId
    );
    if (isSelected) {
      setSelectedStudents((prev) =>
        prev.filter((s) => s.studentId !== student.studentId)
      );
    } else {
      setSelectedStudents((prev) => [...prev, student]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...filteredStudents]);
    }
    setSelectAll(!selectAll);
  };

  const isStudentSelected = (studentId: number) => {
    return selectedStudents.some((s) => s.studentId === studentId);
  };

  // Handle multiple course selection
  const handleCourseSelectionChange = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Select all visible courses in dropdown
  const handleSelectAllVisibleCourses = () => {
    if (filteredCourses.length === 0) return;

    const visibleCourseIds = filteredCourses.map((course) =>
      course.id.toString()
    );
    const allSelected = visibleCourseIds.every((id) =>
      selectedCourseIds.includes(id)
    );

    if (allSelected) {
      // Deselect all visible courses
      setSelectedCourseIds((prev) =>
        prev.filter((id) => !visibleCourseIds.includes(id))
      );
    } else {
      // Select all visible courses
      const newSelection = [...selectedCourseIds];
      visibleCourseIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      setSelectedCourseIds(newSelection);
    }
  };

  // Add multiple courses at once
  const handleAddMultipleCourses = () => {
    if (selectedCourseIds.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    const newCourses: RegistrationCourse[] = [];

    selectedCourseIds.forEach((courseIdStr) => {
      const courseId = parseInt(courseIdStr);
      const course = courses.find((c) => c && c.id === courseId); // Changed from cid to id

      if (
        course &&
        !registrationCourses.some((rc) => rc.courseId === course.id)
      ) {
        const totalHours = (course.theoryHrs || 0) + (course.labHrs || 0);

        const newCourse: RegistrationCourse = {
          id: Date.now() + Math.random(),
          courseId: course.id, // Changed from cid to id
          courseCode: course.ccode || "N/A",
          courseTitle: course.ctitle || "Unknown Course",
          lectureHours: course.theoryHrs || 0,
          labHours: course.labHrs || 0,
          totalHours: totalHours,
        };
        newCourses.push(newCourse);
      }
    });

    if (newCourses.length > 0) {
      setRegistrationCourses([...registrationCourses, ...newCourses]);
      setSelectedCourseIds([]);
      toast.success(`${newCourses.length} course(s) added successfully`);
    } else {
      toast.error("Selected courses are already added or not found");
    }
  };

  const handleRemoveCourse = (id: number) => {
    setRegistrationCourses(
      registrationCourses.filter((course) => course.id !== id)
    );
  };

  const calculateTotals = () => {
    const lectureTotal = registrationCourses.reduce(
      (sum, course) => sum + (course.lectureHours || 0),
      0
    );
    const labTotal = registrationCourses.reduce(
      (sum, course) => sum + (course.labHours || 0),
      0
    );
    const total = registrationCourses.reduce(
      (sum, course) => sum + (course.totalHours || 0),
      0
    );
    return { lectureTotal, labTotal, total };
  };

  const handleClearFilters = () => {
    setFilters({
      departmentId: "",
      batchId: "",
      enrollmentTypeId: "",
      classYearId: "",
      semesterId: "",
      academicYearId: "",
      programLevelId: "",
      programModalityId: "",
    });
    setSearchQuery("");
    setFilteredStudents(students);
    setSelectAll(false);
  };

  // Clear all selected courses
  const handleClearSelectedCourses = () => {
    setRegistrationCourses([]);
    setSelectedCourseIds([]);
  };

  // Handle course search
  const handleCourseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseSearch(e.target.value);
  };

  // Clear course search
  const clearCourseSearch = () => {
    setCourseSearch("");
  };

  // New function to handle slip preview
  const handleSlipPreview = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (registrationCourses.length === 0) {
      toast.error("Please select at least one course");
      return;
    }

    if (!batchClassYear) {
      toast.error("Please select a Batch Class Year");
      return;
    }

    try {
      setPreviewLoading(true);

      const studentIds = selectedStudents.map((s) => s.studentId);
      const courseIds = registrationCourses.map((c) => c.courseId);

      // Debug: Log what we're sending
      console.log("Sending preview request with:", {
        studentIds,
        courseIds,
        batchClassYearSemesterId: parseInt(batchClassYear),
        batchClassYearString: batchClassYear,
      });

      // Check if endpoint exists
      if (!endPoints.slipPreview) {
        console.error("Slip preview endpoint not defined in endPoints");
        toast.error("Configuration error: Preview endpoint not found");
        setPreviewLoading(false);
        return;
      }

      // Make the API call with better error handling
      const response = await apiService.post(endPoints.slipPreview, {
        studentIds,
        courseIds,
        batchClassYearSemesterId: parseInt(batchClassYear),
      });

      // Debug: Log the response
      console.log("Preview API response:", response);

      if (Array.isArray(response)) {
        // Add accepted property to each student
        const previewWithAcceptance = response.map(
          (student: PreviewStudent) => ({
            ...student,
            accepted: false,
          })
        );
        setPreviewData(previewWithAcceptance);
        setShowPreview(true);
        toast.success(`Preview generated for ${response.length} student(s)`);
      } else if (response && typeof response === "object") {
        // Handle possible error response objects
        if (response.error) {
          toast.error(`API Error: ${response.error}`);
        } else {
          console.error("Unexpected response format:", response);
          toast.error("Unexpected response format from server");
        }
      } else {
        console.error("Invalid preview response:", response);
        toast.error("Invalid data received from server");
      }

      setPreviewLoading(false);
    } catch (error: any) {
      console.error("Error generating preview:", error);

      // Detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        if (error.response.status === 403) {
          toast.error(
            "Access denied (403). Please check your permissions or authentication."
          );
        } else if (error.response.status === 401) {
          toast.error("Unauthorized (401). Please log in again.");
        } else if (error.response.status === 404) {
          toast.error(
            "Endpoint not found (404). Please check the API configuration."
          );
        } else if (error.response.status === 400) {
          toast.error(
            `Bad request (400): ${
              error.response.data?.error || "Invalid request data"
            }`
          );
        } else if (error.response.data?.error) {
          toast.error(`Server error: ${error.response.data.error}`);
        } else {
          toast.error(
            `Server error: ${error.response.status} ${error.response.statusText}`
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error(
          "No response from server. Please check your network connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
        toast.error(`Request failed: ${error.message}`);
      }

      setPreviewLoading(false);
      setPreviewData([]);
    }
  };

  // Function to toggle acceptance for a student
  const toggleStudentAcceptance = (studentId: number) => {
    setPreviewData((prev) =>
      prev.map((student) =>
        student.studentId === studentId
          ? { ...student, accepted: !student.accepted }
          : student
      )
    );
  };

  // Function to accept all students
  const handleAcceptAll = () => {
    setPreviewData((prev) =>
      prev.map((student) => ({ ...student, accepted: true }))
    );
  };

  // Function to reject all students
  const handleRejectAll = () => {
    setPreviewData((prev) =>
      prev.map((student) => ({ ...student, accepted: false }))
    );
  };

  // Get accepted students
  const getAcceptedStudents = () => {
    return previewData.filter((student) => student.accepted);
  };

  // Add new function to generate slips via API
  const handleGenerateSlips = async () => {
    const acceptedStudents = getAcceptedStudents();
    if (acceptedStudents.length === 0) {
      toast.error("Please accept at least one student to generate slips");
      return;
    }

    if (!batchClassYear) {
      toast.error("Please select a Batch Class Year");
      return;
    }

    try {
      setGeneratingSlips(true);

      const requestData: GenerateSlipRequest = {
        batchClassYearSemesterId: parseInt(batchClassYear),
        sourceId: 1, // You might need to get this from context or user
        students: acceptedStudents.map((student) => ({
          studentId: student.studentId,
          courseIds: student.courses.map((course) => course.courseId),
        })),
      };

      console.log("Generating slips with data:", requestData);

      // Call the generate slips API
      const response: GenerateSlipResponse = await apiService.post(
        endPoints.generateSlips,
        requestData
      );

      console.log("Generate slips response:", response);

      if (response) {
        // Successfully generated slips
        const successCount = response.successful || 0;
        const failedCount = response.failed || 0;
        const total = response.totalStudents || 0;

        // Show detailed results
        let message = `Successfully generated slips for ${successCount} out of ${total} students.`;

        if (failedCount > 0 && response.results) {
          const failedStudents = response.results.filter((r) => !r.success);
          if (failedStudents.length > 0) {
            message += `\n\nFailed for ${failedCount} student(s):`;
            failedStudents.forEach((result, index) => {
              if (index < 3) {
                // Show first 3 failures
                message += `\n• Student ${result.studentId}: ${
                  result.message || "Unknown error"
                }`;
              }
            });
            if (failedStudents.length > 3) {
              message += `\n• ... and ${failedStudents.length - 3} more`;
            }
          }
        }

        if (response.errors && response.errors.length > 0) {
          message += `\n\nErrors: ${response.errors.join(", ")}`;
        }

        alert(`Slips Generated Successfully!\n\n${message}`);

        // Mark slips as generated so PDF/Excel/Print can be used
        setSlipsGenerated(true);

        // Only proceed with PDF generation if there were successful registrations
        if (successCount > 0) {
          // You can automatically generate PDF here if desired:
          // generatePDF();
        }
      }

      setGeneratingSlips(false);
    } catch (error: any) {
      console.error("Error generating slips:", error);
      setGeneratingSlips(false);

      if (error.response?.data?.error) {
        toast.error(`Failed to generate slips: ${error.response.data.error}`);
      } else {
        toast.error("Failed to generate slips. Please try again.");
      }
    }
  };

  // Generate PDF for multiple students
  const generatePDF = async () => {
    if (!slipsGenerated) {
      toast.error("Please generate slips first before creating PDF");
      return;
    }

    const acceptedStudents = getAcceptedStudents();
    if (acceptedStudents.length === 0) {
      toast.error("Please accept at least one student to generate PDF");
      return;
    }

    try {
      setGenerating(true);

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 15;
      const right = 15;
      const usableWidth = pageWidth - left - right;

      for (let i = 0; i < acceptedStudents.length; i++) {
        const student = acceptedStudents[i];

        if (i > 0) {
          doc.addPage();
        }

        let headerY = 15;

        // Load logo
        try {
          const fetchDataUrl = async (url: string) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Image fetch failed");
            const blob = await res.blob();
            return await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          };

          const dataUrl = await fetchDataUrl("/assets/companylogo.jpg");
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = dataUrl;
          });

          const imgDisplayWidth = 28;
          const imgDisplayHeight =
            (img.naturalHeight / img.naturalWidth) * imgDisplayWidth;
          const imgX = (pageWidth - imgDisplayWidth) / 2;
          const imgY = 10;
          doc.addImage(dataUrl, imgX, imgY, imgDisplayWidth, imgDisplayHeight);
          headerY = imgY + imgDisplayHeight + 4;
        } catch {
          headerY = 15;
        }

        // Add header texts
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("DEUTSCHE HOCHSCHULE FÜR MEDIZIN", pageWidth / 2, headerY, {
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.text(
          "Deutsche Hochschule für Medizin College",
          pageWidth / 2,
          headerY + 6,
          { align: "center" }
        );
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("OFFICE OF REGISTRAR", pageWidth / 2, headerY + 12, {
          align: "center",
        });
        doc.text("COURSE REGISTRATION SLIP", pageWidth / 2, headerY + 18, {
          align: "center",
        });

        // separator
        const sepY = headerY + 22;
        doc.setLineWidth(0.5);
        doc.line(left, sepY, pageWidth - right, sepY);

        // Student info
        doc.setFontSize(10);
        let curY = sepY + 8;
        const wrap = (
          text: string,
          x: number,
          y: number,
          maxW: number,
          fontSize = 10,
          lineHeight = 5
        ) => {
          doc.setFontSize(fontSize);
          const lines = (doc as any).splitTextToSize(text, maxW);
          doc.text(lines, x, y);
          return y + lines.length * lineHeight;
        };

        curY = wrap(
          `Full Name of Student: ${student.fullNameEng || ""}`,
          left,
          curY,
          usableWidth
        );
        curY = wrap(
          `Date of Registration: ${dateOfRegistration}`,
          left,
          curY + 2,
          usableWidth
        );
        curY = wrap(
          `Department: ${student.departmentName || ""}, Year Of Study: ${
            student.classYearName || ""
          }, Semester: ${student.semesterName || ""}`,
          left,
          curY + 2,
          usableWidth
        );

        // ID / Age / Sex on one line
        const idLine = `ID No.: ${student.username || ""}    Age: ${
          student.age || ""
        }    Sex: ${student.gender || ""}`;
        doc.setFontSize(10);
        doc.text(idLine, left, curY + 6);
        curY += 10;

        // Payment / Batch Class Year / Enrollment on one line
        const selectedBcys = bcysList.find(
          (b) => b.bcysId?.toString() === batchClassYear
        );
        const bcysName = selectedBcys ? selectedBcys.name : "________________";
        const payLine = `Payment Receipt No.: ${
          paymentReceiptNo || "________________"
        }    Batch Class Year: ${bcysName}    Enrollment Type: ${
          student.enrollmentTypeName || ""
        }`;
        doc.text(payLine, left, curY + 2);

        // Course registration table
        doc.setFontSize(12);
        const introY = curY + 8;
        const introTextY = Math.max(introY, 70);
        doc.text(
          "I am applying to be registered for the following courses.",
          left,
          introTextY
        );

        const tableStartY = Math.max(95, introTextY + 6);

        const tableData = (student.courses || []).map((course, index) => [
          (index + 1).toString(),
          course.code || "",
          course.title || "",
          course.lectureHours?.toString() || "0",
          course.labHours?.toString() || "0",
          course.totalHours?.toString() || "0",
        ]);

        const lectureTotal = (student.courses || []).reduce(
          (sum, course) => sum + (course.lectureHours || 0),
          0
        );
        const labTotal = (student.courses || []).reduce(
          (sum, course) => sum + (course.labHours || 0),
          0
        );
        const total = (student.courses || []).reduce(
          (sum, course) => sum + (course.totalHours || 0),
          0
        );

        tableData.push([
          "",
          "",
          "Total",
          lectureTotal.toString(),
          labTotal.toString(),
          total.toString(),
        ]);

        autoTable(doc, {
          startY: tableStartY,
          head: [
            [
              "R.No.",
              "COURSE CODE",
              "COURSE TITLE",
              "Lecture",
              "Lab/prac",
              "Total",
            ],
          ],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [66, 133, 244] },
          margin: { left: 14, right: 14 },
        });

        // Footer signatures
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.text("Student signature _____________________", left, finalY);
        doc.text("Total", pageWidth - right - 40, finalY);
        doc.text(`${total}`, pageWidth - right - 10, finalY);

        const financeText =
          "Finance Head _____________________ Signature _____________________ Date _____________________";
        const deptText =
          "Department Head _____________________ Signature _____________________ Date _____________________";
        const sigFontSize = 9;
        doc.setFontSize(sigFontSize);
        doc.text(financeText, left, finalY + 12, { maxWidth: usableWidth });
        doc.text(deptText, left, finalY + 22, { maxWidth: usableWidth });

        // Notes
        const notesStartY = finalY + 32;
        const notes = [
          "NB.",
          "1. A student is not allowed to be registered for a course(s) if he/she has an 'I' or 'F' grade(s) for its prerequisite(s).",
          "2. This form must be filled & signed in three copies and one copy should be submitted to the registrar, one for the department and one for the student him/her self.",
          "3. The semester total load to be taken must not be less than 12 and greater than 22 C.H. for regular program.",
          "4. The registration slip must be returned to the registration office within the specified date of registration. Otherwise will be penalized.",
        ];

        let notesFont = 9;
        let linesCount = 0;
        const bottomMargin = 12;
        while (notesFont >= 7) {
          linesCount = 0;
          for (const n of notes) {
            const lines = (doc as any).splitTextToSize(n, usableWidth);
            linesCount += lines.length;
          }
          const neededHeight = linesCount * (notesFont * 0.9);
          if (notesStartY + neededHeight + bottomMargin <= pageHeight) break;
          notesFont -= 1;
        }

        doc.setFontSize(notesFont);
        let ny = notesStartY;
        for (const n of notes) {
          const lines = (doc as any).splitTextToSize(n, usableWidth);
          doc.text(lines, left, ny);
          ny += lines.length * (notesFont * 0.9);
        }
      }

      // Save PDF
      doc.save(`Registration_Slips_${Date.now()}.pdf`);

      toast.success("PDF generated successfully!");
      setGenerating(false);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      setGenerating(false);
      toast.error("Failed to generate PDF");
    }
  };

  // Generate Excel for multiple students
  const generateExcel = () => {
    if (!slipsGenerated) {
      toast.error("Please generate slips first before creating Excel");
      return;
    }

    const acceptedStudents = getAcceptedStudents();
    if (acceptedStudents.length === 0) {
      toast.error("Please accept at least one student to generate Excel");
      return;
    }

    const wb = XLSX.utils.book_new();

    acceptedStudents.forEach((student, studentIndex) => {
      const selectedBcys = bcysList.find(
        (b) => b.bcysId?.toString() === batchClassYear
      );
      const bcysName = selectedBcys ? selectedBcys.name : "________________";

      const slipData = [
        ["DEUTSCHE HOCHSCHULE FÜR MEDIZIN"],
        ["Deutsche Hochschule für Medizin College"],
        ["OFFICE OF REGISTRAR"],
        ["COURSE REGISTRATION SLIP"],
        [],
        [
          `Full Name of Student: ${student.fullNameEng || ""}`,
          `Date of Registration: ${dateOfRegistration}`,
        ],
        [
          `Department: ${student.departmentName || ""}, Year Of Study: ${
            student.classYearName || ""
          }, Semester: ${student.semesterName || ""}`,
        ],
        [
          `ID No.: ${student.username || ""}`,
          `Age: ${student.age || ""}`,
          `Sex: ${student.gender || ""}`,
        ],
        [
          `Payment Receipt No.: ${paymentReceiptNo || "________________"}`,
          `Batch Class Year: ${bcysName}`,
          `Enrollment Type: ${student.enrollmentTypeName || ""}`,
        ],
        [],
        ["I am applying to be registered for the following courses."],
        [],
        [
          "R.No.",
          "COURSE CODE",
          "COURSE TITLE",
          "Lecture",
          "Lab/prac",
          "Total",
        ],
      ];

      (student.courses || []).forEach((course, index) => {
        slipData.push([
          (index + 1).toString(),
          course.code || "",
          course.title || "",
          course.lectureHours?.toString() || "0",
          course.labHours?.toString() || "0",
          course.totalHours?.toString() || "0",
        ]);
      });

      const lectureTotal = (student.courses || []).reduce(
        (sum, course) => sum + (course.lectureHours || 0),
        0
      );
      const labTotal = (student.courses || []).reduce(
        (sum, course) => sum + (course.labHours || 0),
        0
      );
      const total = (student.courses || []).reduce(
        (sum, course) => sum + (course.totalHours || 0),
        0
      );

      slipData.push([
        "",
        "",
        "Total",
        lectureTotal.toString(),
        labTotal.toString(),
        total.toString(),
      ]);

      slipData.push([]);
      slipData.push([
        "Student signature _____________________",
        "",
        "",
        "",
        "Total",
        total.toString(),
      ]);
      slipData.push([]);
      slipData.push([
        "Finance Head _____________________ Signature _____________________ Date _____________________",
      ]);
      slipData.push([
        "Department Head _____________________ Signature _____________________ Date _____________________",
      ]);
      slipData.push([]);
      slipData.push(["NB."]);
      slipData.push([
        "1. A student is not allowed to be registered for a course (s) if he/she has an 'I' or 'F' grade (s) for its prerequisites (s).",
      ]);
      slipData.push([
        "2. This form must be filled & signed in three copies and one copy should be submitted to the registrar, one for the department and one for the student him/her self.",
      ]);
      slipData.push([
        "3. The semester total load to be taken must not be less than 12 and greater than 22 C.H. for regular program.",
      ]);
      slipData.push([
        "4. The registration slip must be returned to the registration office within the specified date of registration. Otherwise will be penalized.",
      ]);

      const ws = XLSX.utils.aoa_to_sheet(slipData);

      const colWidths = [
        { wch: 8 }, // R.No.
        { wch: 15 }, // Course Code
        { wch: 40 }, // Course Title
        { wch: 10 }, // Lecture
        { wch: 10 }, // Lab/prac
        { wch: 10 }, // Total
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, `Student_${student.studentId}`);
    });

    XLSX.writeFile(wb, `Registration_Slips_${Date.now()}.xlsx`);
    toast.success("Excel file generated successfully!");
  };

  const handlePrint = () => {
    if (!slipsGenerated) {
      toast.error("Please generate slips first before printing");
      return;
    }

    const acceptedStudents = getAcceptedStudents();
    if (acceptedStudents.length === 0) {
      toast.error("Please accept at least one student to print");
      return;
    }

    // Create HTML for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      let printContent = "";

      acceptedStudents.forEach((student, index) => {
        const selectedBcys = bcysList.find(
          (b) => b.bcysId?.toString() === batchClassYear
        );
        const bcysName = selectedBcys ? selectedBcys.name : "________________";
        const lectureTotal = (student.courses || []).reduce(
          (sum, course) => sum + (course.lectureHours || 0),
          0
        );
        const labTotal = (student.courses || []).reduce(
          (sum, course) => sum + (course.labHours || 0),
          0
        );
        const total = (student.courses || []).reduce(
          (sum, course) => sum + (course.totalHours || 0),
          0
        );

        printContent += `
          <div style="page-break-after: ${
            index < acceptedStudents.length - 1 ? "always" : "auto"
          }; margin-bottom: 40px;">
            <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 18px;">DEUTSCHE HOCHSCHULE FÜR MEDIZIN</div>
              <div style="font-size: 14px;">Deutsche Hochschule für Medizin College</div>
              <div style="font-weight: bold; margin-top: 10px;">OFFICE OF REGISTRAR</div>
              <div style="font-weight: bold;">COURSE REGISTRATION SLIP</div>
            </div>

            <div style="font-size: 11px; margin-bottom: 20px;">
              <div><strong>Full Name of Student:</strong> ${
                student.fullNameEng || ""
              }</div>
              <div><strong>Date of Registration:</strong> ${dateOfRegistration}</div>
              <div><strong>Department:</strong> ${
                student.departmentName || ""
              }, <strong>Year Of Study:</strong> ${
          student.classYearName || ""
        }, <strong>Semester:</strong> ${student.semesterName || ""}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 10px;">
                <div><strong>ID No.:</strong> ${student.username || ""}</div>
                <div><strong>Age:</strong> ${student.age || ""}</div>
                <div><strong>Sex:</strong> ${student.gender || ""}</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 10px;">
                <div><strong>Payment Receipt No.:</strong> ${
                  paymentReceiptNo || "________________"
                }</div>
                <div><strong>Batch Class Year:</strong> ${bcysName}</div>
                <div><strong>Enrollment Type:</strong> ${
                  student.enrollmentTypeName || ""
                }</div>
              </div>
            </div>

            <div style="font-size: 11px;">
              <div style="font-weight: bold; margin-bottom: 10px;">I am applying to be registered for the following courses.</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                  <tr style="background-color: #4a90e2; color: white;">
                    <th style="padding: 6px; border: 1px solid #ddd; width: 8%;">R.No.</th>
                    <th style="padding: 6px; border: 1px solid #ddd; width: 15%;">COURSE CODE</th>
                    <th style="padding: 6px; border: 1px solid #ddd; width: 40%;">COURSE TITLE</th>
                    <th style="padding: 6px; border: 1px solid #ddd; width: 10%;">Lecture</th>
                    <th style="padding: 6px; border: 1px solid #ddd; width: 10%;">Lab/prac</th>
                    <th style="padding: 6px; border: 1px solid #ddd; width: 10%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(student.courses || [])
                    .map(
                      (course, index) => `
                    <tr>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        index + 1
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        course.code || ""
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        course.title || ""
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        course.lectureHours || 0
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        course.labHours || 0
                      }</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${
                        course.totalHours || 0
                      }</td>
                    </tr>
                  `
                    )
                    .join("")}
                  <tr style="font-weight: bold; background-color: #f0f0f0;">
                    <td colspan="3" style="padding: 6px; border: 1px solid #ddd;">Total</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${lectureTotal}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${labTotal}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="font-size: 10px; margin-top: 30px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>Student signature _____________________</div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span>Total</span>
                  <span style="font-weight: bold;">${total}</span>
                </div>
              </div>
              <div style="margin-bottom: 10px;">Finance Head _____________________ Signature _____________________ Date _____________________</div>
              <div style="margin-bottom: 10px;">Department Head _____________________ Signature _____________________ Date _____________________</div>
            </div>

            <div style="font-size: 9px; margin-top: 20px; padding: 16px; background-color: #f9f9f9; border-radius: 4px;">
              <div style="font-weight: bold;">NB.</div>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 5px;">A student is not allowed to be registered for a course (s) if he/she has an "I" or "F" grade (s) for its prerequisites (s).</li>
                <li style="margin-bottom: 5px;">This form must be filled & signed in three copies and one copy should be submitted to the registrar, one for the department and one for the student him/her self.</li>
                <li style="margin-bottom: 5px;">The semester total load to be taken must not be less than 12 and greater than 22 C.H. for regular program.</li>
                <li style="margin-bottom: 5px;">The registration slip must be returned to the registration office within the specified date of registration. Otherwise will be penalized.</li>
              </ol>
            </div>
          </div>
        `;
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Registration Slips</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // Function to open preview dialog for a specific student
  const openPreviewDialog = (student: PreviewStudent) => {
    setSelectedPreviewStudent(student);
    setPreviewDialogOpen(true);
  };

  // Close preview dialog
  const closePreviewDialog = () => {
    setPreviewDialogOpen(false);
    setSelectedPreviewStudent(null);
  };

  // Calculate totals for a specific student
  const calculateStudentTotals = (student: PreviewStudent) => {
    const lectureTotal = (student.courses || []).reduce(
      (sum, course) => sum + (course.lectureHours || 0),
      0
    );
    const labTotal = (student.courses || []).reduce(
      (sum, course) => sum + (course.labHours || 0),
      0
    );
    const total = (student.courses || []).reduce(
      (sum, course) => sum + (course.totalHours || 0),
      0
    );
    return { lectureTotal, labTotal, total };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Course Registration Slips
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate registration slips for students in PDF or Excel format
          </p>
        </div>
      </div>

      {/* Top Section: Student and Course Selection Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Student Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Search & Filter Students
            </CardTitle>
            <CardDescription>
              Find and select students to generate registration slips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ID, or username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Label>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Department Filter */}
                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs">
                    Department
                  </Label>
                  <Select
                    value={filters.departmentId}
                    onValueChange={(value) =>
                      handleFilterChange("departmentId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Batch Filter */}
                <div className="space-y-1">
                  <Label htmlFor="batch" className="text-xs">
                    Batch
                  </Label>
                  <Select
                    value={filters.batchId}
                    onValueChange={(value) =>
                      handleFilterChange("batchId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enrollment Type Filter */}
                <div className="space-y-1">
                  <Label htmlFor="enrollmentType" className="text-xs">
                    Enrollment Type
                  </Label>
                  <Select
                    value={filters.enrollmentTypeId}
                    onValueChange={(value) =>
                      handleFilterChange("enrollmentTypeId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.enrollmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Level Filter */}
                <div className="space-y-1">
                  <Label htmlFor="programLevel" className="text-xs">
                    Program Level
                  </Label>
                  <Select
                    value={filters.programLevelId}
                    onValueChange={(value) =>
                      handleFilterChange("programLevelId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.programLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Year Filter */}
                <div className="space-y-1">
                  <Label htmlFor="classYear" className="text-xs">
                    Class Year
                  </Label>
                  <Select
                    value={filters.classYearId}
                    onValueChange={(value) =>
                      handleFilterChange("classYearId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.classYears.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Modality Filter */}
                <div className="space-y-1">
                  <Label htmlFor="programModality" className="text-xs">
                    Program Modality
                  </Label>
                  <Select
                    value={filters.programModalityId}
                    onValueChange={(value) =>
                      handleFilterChange("programModalityId", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Modalities" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterData.programModalities.map((modality) => (
                        <SelectItem key={modality.id} value={modality.id}>
                          {modality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Student List Header */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSelectAll}
                  className="h-8"
                >
                  {selectAll ? (
                    <CheckSquare className="h-4 w-4 mr-1" />
                  ) : (
                    <Square className="h-4 w-4 mr-1" />
                  )}
                  {selectAll ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-sm text-gray-500">
                  {filteredStudents.length} students found
                </span>
              </div>
              <span className="text-sm font-medium">
                Selected: {selectedStudents.length}
              </span>
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading students...
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto opacity-50 mb-2" />
                  <p>No students found</p>
                  <p className="text-sm">
                    Try adjusting your filters or search
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = isStudentSelected(student.studentId);
                  return (
                    <Card
                      key={student.studentId}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded border ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {student.fullNameENG}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {student.username} |{" "}
                                {student.departmentName}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Batch: {student.batch} | {student.yearOfStudy} |{" "}
                                {student.programModalityName}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSingleStudent(student);
                            }}
                          >
                            Select Only
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Selection
            </CardTitle>
            <CardDescription>
              Select multiple courses and add them at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-class-year">Batch Class Year</Label>
                <Select
                  value={batchClassYear}
                  onValueChange={setBatchClassYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch Class Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {bcysList.map((bcys) => (
                      <SelectItem
                        key={bcys.bcysId}
                        value={bcys.bcysId.toString()}
                      >
                        {bcys.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-receipt">Payment Receipt No.</Label>
                <Input
                  id="payment-receipt"
                  type="text"
                  placeholder="Enter payment receipt number"
                  value={paymentReceiptNo}
                  onChange={(e) => setPaymentReceiptNo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="course">Select Courses</Label>
                  {courses.length === 0 && !coursesLoading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log("Retrying course fetch...");
                        fetchCourses();
                      }}
                      className="h-6 text-xs"
                    >
                      Retry Load (API returned{" "}
                      {Array.isArray(courses) ? courses.length : "invalid"}{" "}
                      courses)
                    </Button>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {selectedCourseIds.length} selected
                </span>
              </div>

              {/* Custom dropdown for course selection */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    if (selectedStudents.length === 0) {
                      toast.error("Please select at least one student first");
                      return;
                    }

                    if (courses.length === 0 && !coursesLoading) {
                      console.log("No courses loaded, retrying fetch...");
                      const studentIds = selectedStudents.map(
                        (s) => s.studentId
                      );
                      fetchCourses(studentIds);
                    } else {
                      setIsCourseDropdownOpen(!isCourseDropdownOpen);
                      // Clear search when opening dropdown
                      if (!isCourseDropdownOpen) {
                        setCourseSearch("");
                      }
                    }
                  }}
                >
                  <span>
                    {selectedCourseIds.length > 0
                      ? `${selectedCourseIds.length} course${
                          selectedCourseIds.length > 1 ? "s" : ""
                        } selected`
                      : selectedStudents.length > 0
                      ? "Select Courses"
                      : "Select Students First"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isCourseDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {isCourseDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto">
                    {coursesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading courses...
                        </p>
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>
                          {selectedStudents.length === 0
                            ? "Please select students first"
                            : "No courses available for selected students"}
                        </p>
                        <p className="text-xs">
                          {selectedStudents.length === 0
                            ? "Select students from the left panel"
                            : "Courses will appear after student selection"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {/* Course Search Bar */}
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:text-gray-500" />
                          <Input
                            placeholder="Search courses by code or title..."
                            value={courseSearch}
                            onChange={handleCourseSearch}
                            className="pl-10 pr-8 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            autoFocus
                          />
                          {courseSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearCourseSearch}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3 text-gray-400" />
                            </Button>
                          )}
                        </div>

                        {/* Select All Visible Courses Button */}
                        {filteredCourses.length > 0 && (
                          <div className="flex items-center justify-between mb-2 px-2 py-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSelectAllVisibleCourses}
                              className="h-7 text-xs"
                            >
                              {filteredCourses.every((course) =>
                                selectedCourseIds.includes(course.id.toString())
                              ) ? (
                                <>
                                  <CheckSquare className="h-3 w-3 mr-1" />
                                  Deselect All Visible
                                </>
                              ) : (
                                <>
                                  <Square className="h-3 w-3 mr-1" />
                                  Select All Visible
                                </>
                              )}
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {filteredCourses.length} course
                              {filteredCourses.length !== 1 ? "s" : ""} found
                            </span>
                          </div>
                        )}

                        {/* Course List */}
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {filteredCourses.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p>No courses found for "{courseSearch}"</p>
                              <p className="text-xs mt-1">
                                Try a different search term
                              </p>
                            </div>
                          ) : (
                            filteredCourses.map((course) => {
                              // Use the correct property names from the API
                              const courseId = course?.id || 0;
                              const courseCode = course?.ccode || "N/A";
                              const courseTitle =
                                course?.ctitle || "Unknown Course";
                              const lectureHours = course?.theoryHrs || 0;
                              const labHours = course?.labHrs || 0;
                              const creditHours = lectureHours + labHours;

                              return (
                                <div
                                  key={courseId}
                                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    selectedCourseIds.includes(
                                      courseId.toString()
                                    )
                                      ? "bg-blue-50 dark:bg-blue-900/30"
                                      : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent dropdown from closing
                                    handleCourseSelectionChange(
                                      courseId.toString()
                                    );
                                  }}
                                >
                                  <div
                                    className={`w-5 h-5 flex items-center justify-center rounded border mr-3 ${
                                      selectedCourseIds.includes(
                                        courseId.toString()
                                      )
                                        ? "bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}
                                  >
                                    {selectedCourseIds.includes(
                                      courseId.toString()
                                    ) && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {courseCode}
                                      </span>{" "}
                                      - {courseTitle}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Lecture: {lectureHours}h | Lab: {labHours}
                                      h | Total: {creditHours} CH
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Show search results summary */}
                        {courseSearch && filteredCourses.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                              Showing {filteredCourses.length} of{" "}
                              {courses.length} courses
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddMultipleCourses}
                  className="flex-1"
                  disabled={selectedCourseIds.length === 0 || coursesLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected ({selectedCourseIds.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearSelectedCourses}
                  disabled={registrationCourses.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Selected Courses ({registrationCourses.length})</Label>
                <span className="text-sm text-gray-500">
                  Total: {calculateTotals().total} credit hours
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-16">Lecture</TableHead>
                      <TableHead className="w-16">Lab</TableHead>
                      <TableHead className="w-16">Total</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium text-xs">
                          {course.courseCode}
                        </TableCell>
                        <TableCell className="text-xs">
                          {course.courseTitle}
                        </TableCell>
                        <TableCell className="text-xs">
                          {course.lectureHours}
                        </TableCell>
                        <TableCell className="text-xs">
                          {course.labHours}
                        </TableCell>
                        <TableCell className="text-xs">
                          {course.totalHours}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCourse(course.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {registrationCourses.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          No courses selected yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Selected Students Summary */}
            {selectedStudents.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="mb-2">
                  Selected Students ({selectedStudents.length})
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedStudents.slice(0, 5).map((student) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span>{student.fullNameENG}</span>
                      <span className="text-xs text-gray-500">
                        {student.studentId}
                      </span>
                    </div>
                  ))}
                  {selectedStudents.length > 5 && (
                    <div className="text-center text-sm text-gray-500 p-2">
                      ... and {selectedStudents.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slip Preview Button */}
            <div className="pt-4">
              <Button
                onClick={handleSlipPreview}
                className="w-full"
                disabled={
                  selectedStudents.length === 0 ||
                  registrationCourses.length === 0 ||
                  !batchClassYear ||
                  previewLoading
                }
              >
                {previewLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Preview...
                  </>
                ) : (
                  "Slip Preview"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section - Only shown after clicking Slip Preview */}
      {showPreview && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registration Slips Preview
            </CardTitle>
            <CardDescription>
              Review and accept students for slip generation.{" "}
              {getAcceptedStudents().length} of {previewData.length} students
              accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Accept All / Reject All Buttons */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAcceptAll}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleRejectAll}>
                  <X className="h-4 w-4 mr-1" />
                  Unselect All
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    getAcceptedStudents().length === 0
                      ? "destructive"
                      : "default"
                  }
                >
                  {getAcceptedStudents().length} Selected
                </Badge>
                {slipsGenerated && (
                  <Badge className="bg-green-500">Slips Generated</Badge>
                )}
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Batch Class Year</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead className="w-20">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((student) => {
                    const { total } = calculateStudentTotals(student);
                    return (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleStudentAcceptance(student.studentId)
                            }
                            className="h-7 w-7 p-0"
                          >
                            {student.accepted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.fullNameEng}</TableCell>
                        <TableCell>{student.departmentName}</TableCell>
                        <TableCell>{student.batchDisplayName}</TableCell>
                        <TableCell>
                          {student.courses?.length || 0} courses
                        </TableCell>
                        <TableCell>{total} hours</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreviewDialog(student)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <div className="mr-4">
                <span className="text-sm text-gray-600">
                  Selected: {getAcceptedStudents().length} student(s)
                </span>
              </div>

              {/* Generate Button - Must be clicked first */}
              <Button
                onClick={handleGenerateSlips}
                className="bg-green-600 hover:bg-green-700"
                disabled={
                  getAcceptedStudents().length === 0 ||
                  generatingSlips ||
                  slipsGenerated
                }
              >
                {generatingSlips ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Generate Slips
                  </>
                )}
              </Button>

              {/* PDF, Excel, Print buttons - only enabled after slips are generated */}
              <Button
                onClick={generatePDF}
                variant="outline"
                disabled={
                  !slipsGenerated ||
                  generating ||
                  getAcceptedStudents().length === 0
                }
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </>
                )}
              </Button>
              <Button
                onClick={generateExcel}
                variant="outline"
                disabled={!slipsGenerated || getAcceptedStudents().length === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handlePrint}
                disabled={!slipsGenerated || getAcceptedStudents().length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Slip Preview - {selectedPreviewStudent?.fullNameEng}</span>
              <Button variant="ghost" size="sm" onClick={closePreviewDialog}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Preview of registration slip for{" "}
              {selectedPreviewStudent?.fullNameEng}
            </DialogDescription>
          </DialogHeader>

          {selectedPreviewStudent && (
            <div className="border rounded-lg p-6 bg-white space-y-6">
              {/* Slip Preview Header */}
              <div className="text-center border-b pb-4">
                <div className="font-bold text-lg">
                  DEUTSCHE HOCHSCHULE FÜR MEDIZIN
                </div>
                <div className="text-sm">
                  Deutsche Hochschule für Medizin College
                </div>
                <div className="font-bold mt-2">OFFICE OF REGISTRAR</div>
                <div className="font-bold">COURSE REGISTRATION SLIP</div>
              </div>

              {/* Student Info */}
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Full Name of Student:</strong>{" "}
                  {selectedPreviewStudent.fullNameEng}
                </div>
                <div>
                  <strong>Date of Registration:</strong> {dateOfRegistration}
                </div>
                <div>
                  <strong>Department:</strong>{" "}
                  {selectedPreviewStudent.departmentName},
                  <strong> Year Of Study:</strong>{" "}
                  {selectedPreviewStudent.classYearName},
                  <strong> Semester:</strong>{" "}
                  {selectedPreviewStudent.semesterName}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <strong>ID No.:</strong> {selectedPreviewStudent.username}
                  </div>
                  <div>
                    <strong>Age:</strong> {selectedPreviewStudent.age}
                  </div>
                  <div>
                    <strong>Sex:</strong> {selectedPreviewStudent.gender}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <strong>Payment Receipt No.:</strong>{" "}
                    {paymentReceiptNo || "________________"}
                  </div>
                  <div>
                    <strong>Batch Class Year:</strong>{" "}
                    {selectedPreviewStudent.batchDisplayName}
                  </div>
                  <div>
                    <strong>Enrollment Type:</strong>{" "}
                    {selectedPreviewStudent.enrollmentTypeName}
                  </div>
                </div>
              </div>

              {/* Course Table Preview */}
              <div className="text-sm">
                <div className="font-bold mb-3">
                  I am applying to be registered for the following courses.
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">R.No.</TableHead>
                        <TableHead>COURSE CODE</TableHead>
                        <TableHead>COURSE TITLE</TableHead>
                        <TableHead className="w-20">Lecture</TableHead>
                        <TableHead className="w-20">Lab/prac</TableHead>
                        <TableHead className="w-20">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedPreviewStudent.courses || []).map(
                        (course, index) => (
                          <TableRow key={course.courseId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{course.code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.lectureHours}</TableCell>
                            <TableCell>{course.labHours}</TableCell>
                            <TableCell>{course.totalHours}</TableCell>
                          </TableRow>
                        )
                      )}
                      {(selectedPreviewStudent.courses || []).length > 0 && (
                        <TableRow className="font-bold bg-gray-100">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell>
                            {
                              calculateStudentTotals(selectedPreviewStudent)
                                .lectureTotal
                            }
                          </TableCell>
                          <TableCell>
                            {
                              calculateStudentTotals(selectedPreviewStudent)
                                .labTotal
                            }
                          </TableCell>
                          <TableCell>
                            {
                              calculateStudentTotals(selectedPreviewStudent)
                                .total
                            }
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Signatures Preview */}
              <div className="text-sm space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <div>Student signature _____________________</div>
                  <div className="flex items-center gap-4">
                    <span>Total</span>
                    <span className="font-bold">
                      {calculateStudentTotals(selectedPreviewStudent).total}
                    </span>
                  </div>
                </div>
                <div>
                  Finance Head _____________________ Signature
                  _____________________ Date _____________________
                </div>
                <div>
                  Department Head _____________________ Signature
                  _____________________ Date _____________________
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs space-y-2 mt-8 p-4 bg-gray-50 rounded">
                <div className="font-bold">NB.</div>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    A student is not allowed to be registered for a course (s)
                    if he/has an "I" or "F" grade (s) for its prerequisites (s).
                  </li>
                  <li>
                    This form must be filled & signed in three copies and one
                    copy should be submitted to the registrar, one for the
                    department and one for the student him/her self.
                  </li>
                  <li>
                    The semester total load to be taken must not be less than 12
                    and greater than 22 C.L. He for regular program.
                  </li>
                  <li>
                    The registration slip must be returned to the registration
                    office within the specified date of registration. Otherwise
                    will be penalized.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
