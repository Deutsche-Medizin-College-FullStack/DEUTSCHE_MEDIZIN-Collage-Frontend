"use client";

import ExcelJS from "exceljs";
import type { Cell as ExcelCell } from "exceljs";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  ScrollText,
  FileText,
  ArrowLeft,
  Download,
  CheckSquare,
  Square,
  Loader2,
  Printer,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import LOGO_BASE64 from "@/components/Extra/LOGO_BASE64";
import { useToast } from "@/hooks/use-toast";

// Types
type GradeReportCourse = {
  courseCode: string;
  courseTitle: string;
  totalCrHrs: number;
  letterGrade: string;
  gradePoint: number;
};

type StudentCopy = {
  classyear: { id: number; name: string };
  semester: { id: string; name: string };
  academicYear: string | null;
  courses: GradeReportCourse[];
  semesterGPA: number;
  semesterCGPA: number;
  semesterGPALetter?: string;
  semesterCGPALetter?: string;
  previousCredit?: number;
  previousGradePoint?: number;
  previousCGPA?: number;
  previousCGPALetter?: string;
  cumulativeCredit?: number;
  cumulativeTotalPoint?: number;
  status: string;
};

type RealGradeReport = {
  idNumber: string;
  fullName: string;
  gender: string;
  birthDateGC: string;
  dateEnrolledGC: string;
  dateIssuedGC?: string;
  studentBCYS?: string;
  programModality: { id: string; name: string };
  programLevel: { id: string | null; name: string | null };
  department: { id: number; name: string };
  studentCopies: StudentCopy[];
};

type TranscriptCourse = {
  courseCode: string;
  courseTitle: string;
  totalCrHrs: number;
  letterGrade: string;
  gradePoint: number;
};

type TranscriptCopy = {
  classyear: { id: number; name: string };
  semester: { id: string; name: string };
  academicYear: string | null;
  courses: TranscriptCourse[];
  semesterGPA: number;
  semesterCGPA: number;
  status: string;
};

type RealTranscript = {
  idNumber: string;
  fullName: string;
  gender: string;
  birthDateGC: string;
  dateEnrolledGC: string;
  dateIssuedGC?: string;
  programModality: { id: string; name: string };
  programLevel: { id: string | null; name: string | null };
  department: { id: number; name: string };
  studentCopies: TranscriptCopy[];
  footerText?: string;
};

type StudentForSelection = {
  studentId: number;
  username: string;
  fullNameENG: string;
  fullNameAMH?: string;
  bcysDisplayName: string;
  departmentName: string;
  departmentId: number;
  programModalityName: string;
};

type SearchType = "report" | "transcript";

const ACADEMIC_YEAR_NOT_PROVIDED = "Not Provided";
const MAX_STUDENTS_LIMIT = 20; // You can change this value anytime

const getAcademicYearString = (academicYear: any): string => {
  if (!academicYear) return ACADEMIC_YEAR_NOT_PROVIDED;
  if (typeof academicYear === "string") {
    const value = academicYear.trim();
    return value.length > 0 ? value : ACADEMIC_YEAR_NOT_PROVIDED;
  }
  if (typeof academicYear === "object") {
    const value =
      academicYear.yearCode || academicYear.yearGC || academicYear.name;
    if (typeof value === "string") {
      const normalized = value.trim();
      return normalized.length > 0 ? normalized : ACADEMIC_YEAR_NOT_PROVIDED;
    }
    return ACADEMIC_YEAR_NOT_PROVIDED;
  }
  return ACADEMIC_YEAR_NOT_PROVIDED;
};

const getClassDescription = (letterGrade?: string): string => {
  if (!letterGrade) return "N/A";

  switch (letterGrade.toUpperCase()) {
    case "A+":
    case "A":
    case "A-":
      return "Excellent";
    case "B+":
      return "Very Good";
    case "B":
      return "Good";
    case "B-":
      return "Fairly Good";
    case "C+":
      return "Satisfactory";
    case "C":
      return "Fair";
    case "C-":
    case "D+":
    case "D":
    case "D-":
      return "Below Pass";
    case "F":
      return "Fail";
    case "I":
      return "Incomplete";
    default:
      return "N/A";
  }
};

export default function Transcript_Generate() {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [allStudents, setAllStudents] = useState<StudentForSelection[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [realReports, setRealReports] = useState<RealGradeReport[]>([]);
  const [realTranscripts, setRealTranscripts] = useState<RealTranscript[]>([]);
  const [Error, setError] = useState<string | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [semesters, setSemesters] = useState<
    { academicPeriodCode: string; name: string }[]
  >([]);
  const [classYears, setClassYears] = useState<
    { id: number; classYear: string }[]
  >([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedClassYearId, setSelectedClassYearId] = useState<string>("");
  // ===== NEW: Sorting & Filtering State =====
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentForSelection | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // ===== UPDATED: Applied Filters (affects table) =====
  const [filters, setFilters] = useState<{
    departmentName?: string[];
    bcysDisplayName?: string[];
  }>({});

  // ===== NEW: Pending Filters (UI state inside dropdown) =====
  const [pendingFilters, setPendingFilters] = useState<{
    departmentName?: string[];
    bcysDisplayName?: string[];
  }>({});
  // ====================================================

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Refs for fixed positioning dropdowns outside scroll container
  const deptHeaderRef = useRef<HTMLTableCellElement>(null);
  const bcysHeaderRef = useRef<HTMLTableCellElement>(null);
  const reportsSectionRef = useRef<HTMLDivElement>(null);
  const transcriptsSectionRef = useRef<HTMLDivElement>(null);
  // ==========================================

  // Auto-scroll to generated results
  useEffect(() => {
    if (realReports.length > 0 && reportsSectionRef.current) {
      setTimeout(() => {
        reportsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [realReports]);

  useEffect(() => {
    if (realTranscripts.length > 0 && transcriptsSectionRef.current) {
      setTimeout(() => {
        transcriptsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [realTranscripts]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const students = await apiService.get(endPoints.studentsSlip);
        setAllStudents(students || []);
      } catch (err: any) {
        setError(
          "Failed to load students: " + (err?.message || "Unknown error"),
        );
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const [semesterRes, classYearRes] = await Promise.all([
          apiService.get(endPoints.semesters || "/api/semesters"),
          apiService.get(endPoints.classYears || "/api/class-years"),
        ]);
        setSemesters(semesterRes || []);
        setClassYears(classYearRes || []);
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
        setError("Failed to load semester or class year options.");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, []);

  // ===== UPDATED: Combined search + filter + sort =====
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...allStudents];

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullNameENG?.toLowerCase().includes(term) ||
          s.username?.toLowerCase().includes(term),
      );
    }

    // ===== UPDATED: Multi-select Column Filters =====
    if (filters.departmentName) {
      // If array is empty, it means "Select None" (Show nothing)
      // If array has items, show matching
      if (filters.departmentName.length === 0) {
        result = [];
      } else {
        result = result.filter((s) =>
          filters.departmentName!.includes(s.departmentName),
        );
      }
    }

    if (filters.bcysDisplayName) {
      if (filters.bcysDisplayName.length === 0) {
        result = [];
      } else {
        result = result.filter((s) =>
          filters.bcysDisplayName!.includes(s.bcysDisplayName),
        );
      }
    }
    // ================================================
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (bVal == null) return sortConfig.direction === "asc" ? -1 : 1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          const cmp = aVal.localeCompare(bVal);
          return sortConfig.direction === "asc" ? cmp : -cmp;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allStudents, searchTerm, filters, sortConfig]);
  // ====================================================

  // ===== NEW: Distinct values for filter dropdowns =====
  const distinctDepartments = useMemo(() => {
    return [...new Set(allStudents.map((s) => s.departmentName))]
      .filter(Boolean)
      .sort();
  }, [allStudents]);

  const distinctBCYS = useMemo(() => {
    return [...new Set(allStudents.map((s) => s.bcysDisplayName))]
      .filter(Boolean)
      .sort();
  }, [allStudents]);
  // =====================================================

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredAndSortedStudents.map((s) => s.studentId);
    const allSelected = visibleIds.every((id) => selectedStudents.includes(id));
    if (allSelected) {
      setSelectedStudents((prev) =>
        prev.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      setSelectedStudents((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const selectedCount = selectedStudents.length;

  const handleBackToChoice = () => {
    setSearchType(null);
    setSelectedStudents([]);
    setSearchTerm("");
    setRealReports([]);
    setRealTranscripts([]);
  };

  const handleGenerateReports = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    // CHECK MAX STUDENTS LIMIT
    if (selectedStudents.length > MAX_STUDENTS_LIMIT) {
      toast({
        title: "Too many students selected",
        description: `You can only generate reports for up to ${MAX_STUDENTS_LIMIT} students at a time. Please deselect ${selectedStudents.length - MAX_STUDENTS_LIMIT} student(s).`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedSemesterId || !selectedClassYearId) {
      setError("Please select both Semester and Class Year");
      return;
    }

    setLoadingReports(true);
    setError(null);

    try {
      const response = await apiService.post(endPoints.studentCopy, {
        semesterId: selectedSemesterId,
        classYearId: Number(selectedClassYearId),
        studentIds: selectedStudents,
      });

      console.log("Student Copy Response:", response);

      // Ensure response is an array
      const reportsArray = Array.isArray(response)
        ? response
        : response?.data && Array.isArray(response.data)
          ? response.data
          : response && typeof response === "object"
            ? [response]
            : [];

      // Check if response is empty
      if (reportsArray.length === 0) {
        toast({
          title: "No results found",
          description:
            "No student copy data available for the selected students.",
          variant: "destructive",
        });
        setRealReports([]);
        return;
      }

      // Check for students with no data (empty courses)
      const studentsWithNoData: string[] = [];

      const transformedReports: RealGradeReport[] = reportsArray
        .map((item: any) => {
          // Check if this student has no courses/data
          if (!item.courses || item.courses.length === 0) {
            studentsWithNoData.push(
              item.idNumber || item.studentId || "Unknown",
            );
            return null;
          }

          return {
            idNumber: item.idNumber || item.studentId || "N/A",
            fullName: item.fullName || item.studentName || "Unknown",
            gender: item.gender || "N/A",
            birthDateGC: item.dateOfBirthGC || item.birthDate || "N/A",
            dateEnrolledGC: item.dateEnrolledGC || item.enrollmentDate || "N/A",
            dateIssuedGC: new Date()
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(/ /g, "-"),
            studentBCYS: item.studentBCYS || item.bcysDisplayName || "N/A",
            programModality: item.programModality || {
              id: "1",
              name: "Regular",
            },
            programLevel: item.programLevel || { id: "1", name: "Degree" },
            department: item.department || { id: 1, name: "Unknown" },
            studentCopies: [
              {
                classyear: item.classyear || { id: 1, name: "II" },
                semester: item.semester || { id: "1", name: "I" },
                academicYear: getAcademicYearString(item.academicYear),
                courses: Array.isArray(item.courses)
                  ? item.courses.map((c: any) => ({
                      courseCode: c.courseCode || c.code || "N/A",
                      courseTitle: c.courseTitle || c.title || "Unknown",
                      totalCrHrs: c.totalCrHrs || c.credits || 0,
                      letterGrade: c.letterGrade || c.grade || "N/A",
                      gradePoint: c.gradePoint || c.points || 0,
                    }))
                  : [],
                semesterGPA: item.semesterGPA || 0,
                semesterCGPA: item.semesterCGPA || 0,
                semesterGPALetter: item.semesterGPALetter || "N/A",
                semesterCGPALetter: item.semesterCGPALetter || "N/A",
                previousCredit: item.previousCredit || 0,
                previousGradePoint: item.previousGradePoint || 0,
                previousCGPA: item.previousCGPA || 0,
                previousCGPALetter: item.previousCGPALetter || "N/A",
                status: item.status || "PASSED",
              },
            ],
          };
        })
        .filter((report): report is RealGradeReport => report !== null);

      // Toast for students with no data
      if (studentsWithNoData.length > 0) {
        toast({
          title: "Some students have no data",
          description: `No student copy available for: ${studentsWithNoData.join(", ")}`,
          variant: "destructive",
        });
      }

      console.log("Transformed Reports:", transformedReports);
      setRealReports(transformedReports);
      setActiveTabIndex(0);

      // Success toast if we have reports
      if (transformedReports.length > 0) {
        toast({
          title: "Reports Generated",
          description: `Successfully generated ${transformedReports.length} student cop${transformedReports.length === 1 ? "y" : "ies"}.`,
        });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate student copies";

      // Toast for error
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });

      setError(message);
      setRealReports([]);
    } finally {
      setLoadingReports(false);
    }
  };
  // Generate Transcripts
  const handleGenerateTranscripts = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    // CHECK MAX STUDENTS LIMIT
    if (selectedStudents.length > MAX_STUDENTS_LIMIT) {
      toast({
        title: "Too many students selected",
        description: `You can only generate transcripts for up to ${MAX_STUDENTS_LIMIT} students at a time. Please deselect ${selectedStudents.length - MAX_STUDENTS_LIMIT} student(s).`,
        variant: "destructive",
      });
      return;
    }

    setLoadingReports(true);
    setError(null);

    try {
      let response;
      try {
        response = await apiService.post(
          endPoints.generateGradeReport || "/api/transcripts/generate",
          {
            studentIds: selectedStudents,
          },
        );
      } catch (error) {
        response = await apiService.post(endPoints.studentCopy, {
          studentIds: selectedStudents,
          includeAllSemesters: true,
        });
      }

      console.log("Transcript Response:", response);

      let transcripts: RealTranscript[] = [];

      if (response?.gradeReports && Array.isArray(response.gradeReports)) {
        transcripts = response.gradeReports;
      } else if (Array.isArray(response)) {
        transcripts = response;
      } else if (response?.data && Array.isArray(response.data)) {
        transcripts = response.data;
      } else if (response && typeof response === "object") {
        transcripts = [response];
      }

      // Check if response is empty
      if (transcripts.length === 0) {
        toast({
          title: "No results found",
          description:
            "No transcript data available for the selected students.",
          variant: "destructive",
        });
        setRealTranscripts([]);
        return;
      }

      // Check for students with no data (empty studentCopies)
      const studentsWithNoData: string[] = [];

      const validTranscripts = transcripts.filter((t) => {
        if (!t.studentCopies || t.studentCopies.length === 0) {
          studentsWithNoData.push(t.idNumber || "Unknown");
          return false;
        }
        return true;
      });

      // Toast for students with no data
      if (studentsWithNoData.length > 0) {
        toast({
          title: "Some students have no data",
          description: `No transcript available for: ${studentsWithNoData.join(", ")}`,
          variant: "destructive",
        });
      }

      setRealTranscripts(validTranscripts);
      setActiveTabIndex(0);

      // Success toast if we have transcripts
      if (validTranscripts.length > 0) {
        toast({
          title: "Transcripts Generated",
          description: `Successfully generated ${validTranscripts.length} transcript${validTranscripts.length === 1 ? "" : "s"}.`,
        });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate transcripts";

      // Toast for error
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });

      setError(message);
      setRealTranscripts([]);
    } finally {
      setLoadingReports(false);
    }
  };

  // ========== STUDENT COPY PDF GENERATION (Portrait, 2 students per page, stacked tables) ==========
  const exportStudentCopyToPDF = () => {
    if (realReports.length === 0) {
      alert("No data to export. Generate first.");
      return;
    }

    // PORTRAIT orientation
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;

    // Calculate height for each student (half page)
    const studentHeight = (pageHeight - 20) / 2;

    realReports.forEach((report, index) => {
      // Start new page for every 2 students
      if (index % 2 === 0 && index > 0) {
        doc.addPage();
      }

      // Calculate y position based on whether it's first or second student on page
      let y = margin;
      if (index % 2 === 1) {
        y = margin + studentHeight + 4;
      }

      // Draw divider line between students
      if (index % 2 === 1) {
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([3, 3], 0);
        doc.line(margin, y - 8, pageWidth - margin, y - 8);
        doc.setLineDashPattern([], 0);
      }

      // ===== GOLDEN YELLOW HEADER BAND =====
      doc.setFillColor(255, 215, 0);
      doc.rect(0, y - 7, pageWidth, 18, "F");

      // Logo
      try {
        doc.addImage(LOGO_BASE64, "PNG", margin + 4, y - 5, 14, 14);
      } catch (e) {}

      // College name and BCYS
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(report.studentBCYS || "N/A", pageWidth / 2, y - 2, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE",
        pageWidth / 2,
        y + 2,
        { align: "center" },
      );

      y += 6;

      // Title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("STUDENT ACADEMIC RECORD", pageWidth / 2, y + 2, {
        align: "center",
      });
      y += 4;

      // ===== STUDENT INFO TABLE (6 columns - full width) =====
      autoTable(doc, {
        startY: y + 1,
        body: [
          [
            "ID Number",
            report.idNumber || "",
            "Date Of Admission",
            report.dateEnrolledGC || "",
            "Date Of Birth",
            report.birthDateGC || "",
          ],
          [
            "Name of Student",
            report.fullName || "",
            "Enrolment Type",
            report.programModality?.name || "Regular",
            "Date Issued",
            report.dateIssuedGC || "",
          ],
          [
            "Sex",
            report.gender || "",
            "Department",
            report.department?.name || "",
            "",
            "",
          ],
          [
            "Program",
            report.programLevel?.name || "Degree",
            "Field of Study",
            report.department?.name || "",
            "",
            "",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 1.2,
          lineWidth: 0.15,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 28, fillColor: [255, 255, 200] },
          1: { cellWidth: 42 },
          2: { fontStyle: "bold", cellWidth: 28, fillColor: [255, 255, 200] },
          3: { cellWidth: 42 },
          4: { fontStyle: "bold", cellWidth: 24, fillColor: [255, 255, 200] },
          5: { cellWidth: 36 },
        },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 2;

      const copy = report.studentCopies[0];
      if (copy) {
        // ===== ACADEMIC YEAR / CLASS YEAR / SEMESTER LINE =====
        y += 3;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Academic Year: ${getAcademicYearString(copy.academicYear)}   \tClass Year: ${copy.classyear?.name || "II"}   \tSemester: ${copy.semester?.name || "I"}`,
          margin,
          y,
        );
        y += 1;

        // ===== CALCULATE TOTALS =====
        const totalCr = copy.courses.reduce(
          (sum, c) => sum + (c.totalCrHrs || 0),
          0,
        );
        const totalPoint = copy.courses.reduce(
          (sum, c) => sum + (c.gradePoint || 0),
          0,
        );

        // ===== COURSES TABLE (Full Width) =====
        const coursesData: any[] = copy.courses.map((c) => [
          c.courseTitle || "",
          c.courseCode || "",
          c.totalCrHrs?.toFixed(2) || "0.00",
          c.letterGrade || "",
          c.gradePoint?.toFixed(2) || "0.00",
        ]);

        // Add TOTAL row
        coursesData.push([
          {
            content: "",
            styles: { fontStyle: "bold" as const, fillColor: [255, 255, 255] },
          },
          { content: "Total", styles: { fontStyle: "bold" as const } },
          {
            content: totalCr.toFixed(2),
            styles: { fontStyle: "bold" as const },
          },
          { content: "", styles: { fontStyle: "bold" as const } },
          {
            content: totalPoint.toFixed(2),
            styles: { fontStyle: "bold" as const },
          },
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Course Title", "Code", "Cr.Hr.", "Grade", "Point"]],
          body: coursesData,
          theme: "grid",
          styles: {
            fontSize: 7,
            cellPadding: 0.5,
            lineWidth: 0.15,
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [255, 200, 0], // Solid dark orange
            textColor: [0, 0, 0], // White text for visibility
            fontStyle: "bold",
            fontSize: 7,
          },
          columnStyles: {
            0: { cellWidth: 80, halign: "left" },
            1: { cellWidth: 28, halign: "center" },
            2: { cellWidth: 18, halign: "center" },
            3: { cellWidth: 22, halign: "center" },
            4: { cellWidth: 22, halign: "center" },
          },
          // Keep only the Total row styling
          didDrawCell: (data: any) => {
            if (data.row.index === copy.courses.length) {
              if (data.column.index === 0) {
                const cell = data.cell;
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(255, 255, 255);
                doc.rect(
                  cell.x + 0.5,
                  cell.y + 0.5,
                  cell.width - 1,
                  cell.height - 1,
                  "FD",
                );
              }
              doc.setFont("helvetica", "bold");
            }
          },
          margin: { left: margin, right: margin },
        });

        // Override the total row styling by re-drawing it in bold
        // Alternative approach: use willDrawCell to set font before drawing
        // The didDrawCell above handles visual styling

        y = (doc as any).lastAutoTable.finalY; // No gap - directly next table

        // ===== PREVIOUS/SEMESTER DATA =====
        const prevTotalCredit = copy.previousCredit || 0;
        const prevTotalGP = copy.previousGradePoint || 0;
        const prevCGPA = copy.previousCGPA || 0;
        const prevCGPALetter = copy.previousCGPALetter || "N/A";

        const cumulativeCredit = prevTotalCredit + totalCr;
        const cumulativeGP = prevTotalGP + totalPoint;
        const cumulativeGPA = cumulativeGP / cumulativeCredit;

        // ===== SUMMARY TABLE with gradient header =====
        autoTable(doc, {
          startY: y,
          head: [["Summary", "Credit", "GP", "ANG", "ALG"]],
          body: [
            [
              "Previous",
              prevTotalCredit.toFixed(2),
              prevTotalGP.toFixed(2),
              prevCGPA.toFixed(2),
              prevCGPALetter,
            ],
            [
              "Semester",
              totalCr.toFixed(2),
              totalPoint.toFixed(2),
              copy.semesterGPA?.toFixed(2) || "0.00",
              copy.semesterGPALetter || "N/A",
            ],
            [
              "Cumulative",
              cumulativeCredit.toFixed(2),
              cumulativeGP.toFixed(2),
              cumulativeGPA.toFixed(2),
              copy.semesterCGPALetter || "N/A",
            ],
            ["Status", copy.status || "PASSED", "", "", ""],
            [
              "Class Desc",
              getClassDescription(copy.semesterCGPALetter),
              "",
              "",
              "",
            ],
          ],
          theme: "grid",
          styles: {
            fontSize: 7,
            cellPadding: 0.8,
            lineWidth: 0.15,
            fillColor: [255, 248, 220],
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [255, 200, 0], // Solid dark orange
            textColor: [0, 0, 0], // White text
            fontStyle: "bold",
            fontSize: 7.5,
          },
          columnStyles: {
            0: { cellWidth: 35, halign: "left", fontStyle: "bold" },
            1: { cellWidth: 20, halign: "center" },
            2: { cellWidth: 14, halign: "center" },
            3: { cellWidth: 14, halign: "center" },
            4: { cellWidth: 14, halign: "center" },
          },
          // NO didDrawCell needed - simple and clean!
          margin: { left: margin, right: margin },
        });

        y = (doc as any).lastAutoTable.finalY + 3;

        // ===== GRADING SCALE =====
        doc.setFontSize(5);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass, F=Fail",
          margin,
          y,
          { maxWidth: pageWidth - margin * 2 },
        );
        y += 2;

        // ===== FOOTER NOTE =====
        doc.setFontSize(5);
        doc.setTextColor(100, 100, 100);
        doc.text(
          "**(Course Repeated), *(Courses Taken from other university/College), DATE ISSUE & [Date]",
          margin,
          y,
        );
        y += 8;

        // ===== SIGNATURES =====
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("REGISTRAR:", margin, y);
        doc.text("DEAN/VICE DEAN:", pageWidth / 2 + 5, y);

        doc.setFont("helvetica", "normal");
        doc.text("____________________", margin + 22, y);
        doc.text("____________________", pageWidth / 2 + 32, y);
      }
    });

    doc.save("Student_Academic_Record.pdf");
  };

  // ========== TRANSCRIPT PDF GENERATION (optimized for one page) ==========
  const exportTranscriptToPDF = () => {
    if (realTranscripts.length === 0) {
      alert("No data to export. Generate first.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4"); // Portrait
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 4;
    const columnWidth = (pageWidth - margin * 2.2) / 2; // Increased to match wider title column

    realTranscripts.forEach((transcript, index) => {
      if (index > 0) doc.addPage();

      let y = margin;

      // Header with logo
      try {
        doc.addImage(LOGO_BASE64, "PNG", 70, y + 5, 10, 10);
      } catch (e) {
        console.warn("Logo failed to load in PDF", e);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        "DEUTSCHE HOCHSCHULE FÜR MEDIZIN COLLEGE",
        pageWidth / 2,
        y + 4,
        {
          align: "center",
        },
      );

      doc.setFontSize(9);
      doc.text("STUDENT ACADEMIC RECORD", pageWidth / 2, y + 8, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICE OF THE REGISTRAR", pageWidth / 2, y + 12, {
        align: "center",
      });

      if (transcript.dateIssuedGC) {
        doc.setFontSize(7);
        doc.text(`Issued: ${transcript.dateIssuedGC}`, pageWidth / 2, y + 16, {
          align: "center",
        });
        y += 18;
      } else {
        y += 16;
      }

      // Student Info Table
      const tableWidth = 180;
      const centerX = (pageWidth - tableWidth) / 2;

      autoTable(doc, {
        startY: y,
        body: [
          [
            "ID Number",
            transcript.idNumber || "",
            "Birth Date",
            transcript.birthDateGC || "",
          ],
          [
            "Full Name",
            transcript.fullName || "",
            "Enrolment Type",
            transcript.programModality?.name || "-",
          ],
          [
            "Sex",
            transcript.gender || "",
            "Department",
            transcript.department?.name || "-",
          ],
          [
            "Program",
            transcript.programLevel?.name || "-",
            "Field of Study",
            transcript.department?.name || "-",
          ],
          [
            "Date Of Admission",
            transcript.dateEnrolledGC || "",
            "Date Issued",
            transcript.dateIssuedGC || "",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 5.5,
          cellPadding: 0.8,
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          halign: "center",
        },
        columnStyles: {
          0: {
            fontStyle: "bold",
            cellWidth: 25,
            fillColor: [235, 245, 255],
            halign: "left",
          },
          1: {
            cellWidth: 65,
            halign: "left",
            fontStyle: "bold",
          },
          2: {
            fontStyle: "bold",
            cellWidth: 25,
            fillColor: [235, 245, 255],
            halign: "left",
          },
          3: {
            cellWidth: 65,
            halign: "left",
          },
        },
        margin: { left: centerX },
      });

      y = (doc as any).lastAutoTable.finalY + 2;

      // Process semesters - STACKED VERTICALLY WITH NO SPACE
      for (let i = 0; i < transcript.studentCopies.length; i += 2) {
        let leftStartY = y;
        let rightStartY = y;

        // Left semester
        const leftCopy = transcript.studentCopies[i];
        if (leftCopy) {
          let currentY = leftStartY;
          const headerWidth = columnWidth;

          // Semester header
          doc.setFillColor(255, 140, 0);
          doc.rect(margin, currentY, headerWidth, 4.5, "F");
          doc.setTextColor(2, 26, 84);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          const headerText = `Acaddemic Year: ${getAcademicYearString(leftCopy.academicYear)}        •        ClassYear: ${leftCopy.classyear?.name || "I"}        •        ${leftCopy.semester?.name || "First Semester"}`;
          doc.text(headerText, margin + headerWidth / 2, currentY + 2.8, {
            align: "center",
          });
          currentY += 4.5;
          doc.setTextColor(0, 0, 0);

          // Courses table
          const coursesData = leftCopy.courses.map((c, j) => [
            (j + 1).toString(),
            c.courseCode || "",
            c.courseTitle || "",
            c.totalCrHrs?.toFixed(2) || "0",
            c.letterGrade || "",
            c.gradePoint?.toFixed(2) || "0",
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Code", "Title", "CH", "Gr", "Pt"]],
            body: coursesData,
            theme: "grid",
            styles: {
              fontSize: 6.5,
              cellPadding: 0.8,
              lineWidth: 0.05,
              textColor: [0, 0, 0],
              overflow: "linebreak",
            },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 7,
            },
            columnStyles: {
              0: { cellWidth: 4, halign: "center" },
              1: { cellWidth: 22, halign: "left" },
              2: { cellWidth: 50, halign: "left" }, // INCREASED: 40 → 48
              3: { cellWidth: 8, halign: "center" },
              4: { cellWidth: 7, halign: "center" },
              5: { cellWidth: 10, halign: "center" },
            },
            margin: { left: margin, right: pageWidth - margin - columnWidth },
          });

          currentY = (doc as any).lastAutoTable.finalY + 1.5;

          // Summary stats - NO BACKGROUND, BLACK TEXT, MORE SPACING
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(
            `SGPA: ${leftCopy.semesterGPA.toFixed(2)}    CGPA: ${leftCopy.semesterCGPA.toFixed(2)}    Status: ${leftCopy.status}`,
            margin + 1.5,
            currentY + 2.5,
          );
          currentY += 4;
          doc.setTextColor(0, 0, 0);

          leftStartY = currentY;
        }

        // Right semester
        const rightCopy = transcript.studentCopies[i + 1];
        if (rightCopy) {
          let currentY = rightStartY;
          const rightX = pageWidth / 2 + margin / 2;
          const headerWidth = columnWidth;

          // Semester header
          doc.setFillColor(255, 140, 0);
          doc.rect(rightX, currentY, headerWidth, 4.5, "F");
          doc.setTextColor(2, 26, 84);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          const headerText = `Academic Year: ${getAcademicYearString(rightCopy.academicYear)}        •        ClassYear: ${rightCopy.classyear?.name || "I"}        •        ${rightCopy.semester?.name || "First Semester"}`;
          doc.text(headerText, rightX + headerWidth / 2, currentY + 2.8, {
            align: "center",
          });
          currentY += 4.5;
          doc.setTextColor(0, 0, 0);

          // Courses table
          const coursesData = rightCopy.courses.map((c, j) => [
            (j + 1).toString(),
            c.courseCode || "",
            c.courseTitle || "",
            c.totalCrHrs?.toFixed(2) || "0",
            c.letterGrade || "",
            c.gradePoint?.toFixed(2) || "0",
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Code", "Title", "CH", "Gr", "Pt"]],
            body: coursesData,
            theme: "grid",
            styles: {
              fontSize: 6.5,
              cellPadding: 0.8,
              lineWidth: 0.05,
              textColor: [0, 0, 0],
              overflow: "linebreak",
            },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 7,
            },
            columnStyles: {
              0: { cellWidth: 4, halign: "center" },
              1: { cellWidth: 22, halign: "left" },
              2: { cellWidth: 50, halign: "left" }, // INCREASED: 40 → 48
              3: { cellWidth: 8, halign: "center" },
              4: { cellWidth: 7, halign: "center" },
              5: { cellWidth: 10, halign: "center" },
            },
            margin: { left: rightX, right: margin },
          });

          currentY = (doc as any).lastAutoTable.finalY + 1.5;

          // Summary stats - NO BACKGROUND, BLACK TEXT, MORE SPACING
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(
            `SGPA: ${rightCopy.semesterGPA.toFixed(2)}    CGPA: ${rightCopy.semesterCGPA.toFixed(2)}    Status: ${rightCopy.status}`,
            rightX + 1.5,
            currentY + 2.5,
          );
          currentY += 4;
          doc.setTextColor(0, 0, 0);

          rightStartY = currentY;
        }

        // Calculate y position for next row - NO SEPARATOR LINE, MINIMAL SPACE
        y = Math.max(leftStartY, rightStartY);

        // Add just 1mm space between semester rows if there are more semesters
        if (i + 2 < transcript.studentCopies.length) {
          y += 1;
        }
      }

      // Signatures - with more space from top
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }

      y += 15; // More space before signatures

      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text("______________________________", pageWidth * 0.25, y, {
        align: "center",
      });
      doc.text("______________________________", pageWidth * 0.75, y, {
        align: "center",
      });
      y += 4; // More space between line and labels

      doc.setFontSize(6);
      doc.text("Registrar", pageWidth * 0.25, y + 3, { align: "center" });
      doc.text("Dean", pageWidth * 0.75, y + 3, { align: "center" });

      y += 12; // More space before footer

      // Footer section - tighter line spacing
      if (transcript.footerText) {
        const footerLines = transcript.footerText.split("\n");

        doc.setFontSize(5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);

        footerLines.forEach((line, lineIndex) => {
          doc.text(line, pageWidth / 2, y + lineIndex * 2, {
            // Tighter spacing: 3.5 → 2.5
            align: "center",
            maxWidth: pageWidth - margin * 2,
          });
        });
      }
    });

    doc.save("Student_Transcript.pdf");
  };

  // ========== EXCEL GENERATION ==========
  const exportStudentCopyToExcel = async () => {
    if (realReports.length === 0) {
      alert("No data available to export. Generate reports first.");
      return;
    }

    const colors = {
      header: "FFD700",
      tableHeader: "FFC800",
      label: "FFFFC8",
      summary: "FFF8DC",
      border: "000000",
      black: "000000",
      white: "FFFFFF",
      muted: "666666",
    };
    const thinBorder = {
      top: { style: "thin" as const, color: { argb: colors.border } },
      bottom: { style: "thin" as const, color: { argb: colors.border } },
      left: { style: "thin" as const, color: { argb: colors.border } },
      right: { style: "thin" as const, color: { argb: colors.border } },
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Deutsche Hochschule für Medizin";
    workbook.created = new Date();
    const logoImageId = workbook.addImage({
      base64: LOGO_BASE64,
      extension: "jpeg",
    });

    const styleCell = (
      cell: ExcelCell,
      options: {
        fill?: string;
        bold?: boolean;
        color?: string;
        size?: number;
        horizontal?: "left" | "center" | "right";
        border?: typeof thinBorder;
      } = {},
    ) => {
      cell.font = {
        name: "Arial",
        size: options.size || 8,
        bold: options.bold || false,
        color: { argb: options.color || colors.black },
      };
      cell.alignment = {
        horizontal: options.horizontal || "left",
        vertical: "middle",
        wrapText: true,
      };
      if (options.fill) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: options.fill },
        };
      }
      if (options.border) cell.border = options.border;
    };

    const setRowHeight = (row: ExcelJS.Row, minimum = 18) => {
      const textLength = row.values
        .slice(1)
        .reduce((max, value) => Math.max(max, String(value ?? "").length), 0);
      row.height = Math.max(minimum, 18 + Math.ceil(textLength / 45) * 10);
    };

    realReports.forEach((report, index) => {
      const copy = report.studentCopies[0];
      if (!copy) return;

      const totalCr = copy.courses.reduce(
        (sum, c) => sum + (c.totalCrHrs || 0),
        0,
      );
      const totalPoint = copy.courses.reduce(
        (sum, c) => sum + (c.gradePoint || 0),
        0,
      );
      const prevTotalCredit = copy.previousCredit || 0;
      const prevTotalGP = copy.previousGradePoint || 0;
      const prevCGPA = copy.previousCGPA || 0;
      const prevCGPALetter = copy.previousCGPALetter || "N/A";
      const cumulativeCredit = prevTotalCredit + totalCr;
      const cumulativeGP = prevTotalGP + totalPoint;

      const worksheet = workbook.addWorksheet(
        `${report.idNumber || `Student_${index + 1}`}`.slice(0, 31),
        { properties: { defaultRowHeight: 18 } },
      );
      worksheet.columns = [
        { key: "a", width: 27 },
        { key: "b", width: 29 },
        { key: "c", width: 27 },
        { key: "d", width: 29 },
        { key: "e", width: 25 },
        { key: "f", width: 29 },
      ];

      worksheet.mergeCells("A1:F1");
      worksheet.mergeCells("A2:F2");
      worksheet.mergeCells("A3:F3");
      worksheet.getCell("A1").value = report.studentBCYS || "N/A";
      worksheet.getCell("A2").value =
        "DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE";
      worksheet.getCell("A3").value = "STUDENT ACADEMIC RECORD";
      worksheet.addImage(logoImageId, {
        tl: { col: 0.15, row: 0.1 },
        ext: { width: 55, height: 55 },
      });
      ["A1", "A2", "A3"].forEach((address) => {
        const cell = worksheet.getCell(address);
        styleCell(cell, {
          fill: colors.header,
          bold: true,
          size: address === "A1" ? 14 : address === "A3" ? 12 : 9,
          horizontal: "center",
        });
      });
      worksheet.getRow(1).height = 24;
      worksheet.getRow(2).height = 18;
      worksheet.getRow(3).height = 22;

      const infoRows = [
        [
          "ID Number",
          report.idNumber || "",
          "Date Of Admission",
          report.dateEnrolledGC || "",
          "Date Of Birth",
          report.birthDateGC || "",
        ],
        [
          "Name of Student",
          report.fullName || "",
          "Enrolment Type",
          report.programModality?.name || "Regular",
          "Date Issued",
          report.dateIssuedGC || "",
        ],
        [
          "Sex",
          report.gender || "",
          "Department",
          report.department?.name || "",
          "",
          "",
        ],
        [
          "Program",
          report.programLevel?.name || "Degree",
          "Field of Study",
          report.department?.name || "",
          "",
          "",
        ],
      ];
      infoRows.forEach((values) => {
        const row = worksheet.addRow(values);
        values.forEach((value, columnIndex) => {
          styleCell(row.getCell(columnIndex + 1), {
            fill: columnIndex % 2 === 0 ? colors.label : colors.white,
            bold: columnIndex % 2 === 0,
            border: thinBorder,
          });
        });
        setRowHeight(row);
      });

      const academicRow = worksheet.addRow([
        `Academic Year: ${getAcademicYearString(copy.academicYear)}    Class Year: ${copy.classyear?.name || "II"}    Semester: ${copy.semester?.name || "I"}`,
      ]);
      worksheet.mergeCells(`A${academicRow.number}:F${academicRow.number}`);
      styleCell(academicRow.getCell(1), { bold: true, size: 9 });
      setRowHeight(academicRow, 22);

      const courseHeader = worksheet.addRow([
        "Course Title",
        "Code",
        "Cr.Hr.",
        "Grade",
        "Point",
      ]);
      courseHeader.eachCell((cell) =>
        styleCell(cell, {
          fill: colors.tableHeader,
          bold: true,
          horizontal: "center",
          border: thinBorder,
        }),
      );
      setRowHeight(courseHeader, 22);

      copy.courses.forEach((course) => {
        const row = worksheet.addRow([
          course.courseTitle || "",
          course.courseCode || "",
          course.totalCrHrs?.toFixed(2) || "0.00",
          course.letterGrade || "",
          course.gradePoint?.toFixed(2) || "0.00",
        ]);
        row.eachCell((cell, columnIndex) =>
          styleCell(cell, {
            horizontal: columnIndex === 1 ? "left" : "center",
            border: thinBorder,
            bold: columnIndex === 4,
            color: columnIndex === 4 ? "0000FF" : colors.black,
          }),
        );
        setRowHeight(row);
      });

      const totalRow = worksheet.addRow([
        "",
        "Total",
        totalCr.toFixed(2),
        "",
        totalPoint.toFixed(2),
      ]);
      totalRow.eachCell((cell, columnIndex) =>
        styleCell(cell, {
          bold: true,
          horizontal: columnIndex === 2 ? "left" : "center",
          border: thinBorder,
        }),
      );
      setRowHeight(totalRow);

      const summaryHeader = worksheet.addRow([
        "Summary",
        "Credit",
        "GP",
        "ANG",
        "ALG",
      ]);
      summaryHeader.eachCell((cell) =>
        styleCell(cell, {
          fill: colors.tableHeader,
          bold: true,
          horizontal: "center",
          border: thinBorder,
        }),
      );
      setRowHeight(summaryHeader, 22);

      const summaryRows = [
        [
          "Previous",
          prevTotalCredit.toFixed(2),
          prevTotalGP.toFixed(2),
          prevCGPA.toFixed(2),
          prevCGPALetter,
        ],
        [
          "Semester",
          totalCr.toFixed(2),
          totalPoint.toFixed(2),
          copy.semesterGPA?.toFixed(2) || "0.00",
          copy.semesterGPALetter || "N/A",
        ],
        [
          "Cumulative",
          cumulativeCredit.toFixed(2),
          cumulativeGP.toFixed(2),
          (cumulativeGP / cumulativeCredit).toFixed(2),
          copy.semesterCGPALetter || "N/A",
        ],
        ["Status", copy.status || "PASSED", "", "", ""],
        [
          "Class Desc",
          getClassDescription(copy.semesterCGPALetter),
          "",
          "",
          "",
        ],
      ];
      summaryRows.forEach((values) => {
        const row = worksheet.addRow(values);
        row.eachCell((cell, columnIndex) =>
          styleCell(cell, {
            fill: colors.summary,
            bold: columnIndex === 1,
            horizontal: columnIndex === 1 ? "left" : "center",
            border: thinBorder,
          }),
        );
        setRowHeight(row);
      });

      const gradingRow = worksheet.addRow([
        "Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass, F=Fail",
      ]);
      worksheet.mergeCells(`A${gradingRow.number}:F${gradingRow.number}`);
      styleCell(gradingRow.getCell(1), { size: 7, color: colors.black });
      setRowHeight(gradingRow, 32);

      const noteRow = worksheet.addRow([
        "**(Course Repeated), *(Courses Taken from other university/College), DATE ISSUE & [Date]",
      ]);
      worksheet.mergeCells(`A${noteRow.number}:F${noteRow.number}`);
      styleCell(noteRow.getCell(1), { size: 7, color: colors.muted });
      setRowHeight(noteRow, 22);

      const signatureRow = worksheet.addRow([
        "REGISTRAR: ____________________",
        "",
        "",
        "DEAN/VICE DEAN: ____________________",
      ]);
      worksheet.mergeCells(`A${signatureRow.number}:C${signatureRow.number}`);
      worksheet.mergeCells(`D${signatureRow.number}:F${signatureRow.number}`);
      styleCell(signatureRow.getCell(1), { bold: true });
      styleCell(signatureRow.getCell(4), { bold: true });
      signatureRow.getCell(1).alignment = { horizontal: "center" };
      signatureRow.getCell(4).alignment = { horizontal: "center" };
      setRowHeight(signatureRow, 28);

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (!cell.alignment?.wrapText) {
            cell.alignment = {
              ...cell.alignment,
              vertical: "middle",
              wrapText: true,
            };
          }
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Student_Academic_Records.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportTranscriptToExcel = async () => {
    if (realTranscripts.length === 0) {
      alert("No data available to export. Generate transcripts first.");
      return;
    }

    const colors = {
      orange: "F97316",
      orangeDark: "FF8C00",
      gray: "F0F0F0",
      border: "BFBFBF",
      black: "000000",
      white: "FFFFFF",
      blue: "1D4ED8",
    };
    const thinBorder = {
      top: { style: "thin" as const, color: { argb: colors.border } },
      bottom: { style: "thin" as const, color: { argb: colors.border } },
      left: { style: "thin" as const, color: { argb: colors.border } },
      right: { style: "thin" as const, color: { argb: colors.border } },
      diagonal: {},
    };
    const applyStyle = (
      cell: ExcelCell,
      options: {
        fill?: string;
        bold?: boolean;
        color?: string;
        size?: number;
        horizontal?: "left" | "center" | "right";
        border?: typeof thinBorder;
      } = {},
    ) => {
      if (options.fill) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: options.fill },
        };
      }
      cell.font = {
        name: "Arial",
        size: options.size || 8,
        bold: options.bold || false,
        color: { argb: options.color || colors.black },
      };
      cell.alignment = {
        horizontal: options.horizontal || "center",
        vertical: "middle",
        wrapText: true,
      };
      if (options.border) cell.border = options.border;
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Deutsche Hochschule für Medizin";
    workbook.created = new Date();

    realTranscripts.forEach((transcript, index) => {
      const worksheet = workbook.addWorksheet(
        `${transcript.idNumber || `Transcript_${index + 1}`}`.slice(0, 31),
        {
          pageSetup: {
            orientation: "portrait",
            paperSize: 9,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
          },
          properties: { defaultRowHeight: 18 },
        },
      );
      worksheet.pageSetup.margins = {
        left: 0.25,
        right: 0.25,
        top: 0.35,
        bottom: 0.35,
        header: 0.15,
        footer: 0.15,
      };

      const totalColumns = 13;

      // ---------- Column Widths ----------
      worksheet.getColumn(1).width = 5;
      worksheet.getColumn(2).width = 17;
      worksheet.getColumn(3).width = 29;
      worksheet.getColumn(4).width = 8;
      worksheet.getColumn(5).width = 9;
      worksheet.getColumn(6).width = 9;
      worksheet.getColumn(7).width = 3;
      for (let column = 8; column <= 13; column += 1) {
        worksheet.getColumn(column).width = worksheet.getColumn(
          column - 7,
        ).width;
      }

      // ---------- Header (Rows 1-4) ----------
      worksheet.mergeCells(1, 3, 1, totalColumns);
      worksheet.getCell(1, 3).value = "DEUTSCHE HOCHSCHULE FÜR MEDIZIN COLLEGE";
      worksheet.getRow(1).height = 24;
      worksheet.mergeCells(2, 3, 2, totalColumns);
      worksheet.getCell(2, 3).value = "STUDENT ACADEMIC RECORD";
      worksheet.getRow(2).height = 22;
      worksheet.mergeCells(3, 3, 3, totalColumns);
      worksheet.getCell(3, 3).value = "OFFICE OF THE REGISTRAR";
      worksheet.getRow(3).height = 20;
      worksheet.mergeCells(4, 3, 4, totalColumns);
      worksheet.getCell(4, 3).value = transcript.dateIssuedGC
        ? `Issued: ${transcript.dateIssuedGC}`
        : "";
      worksheet.getRow(4).height = 18;
      for (let row = 1; row <= 4; row += 1) {
        for (let column = 1; column <= totalColumns; column += 1) {
          applyStyle(worksheet.getCell(row, column), {
            bold: row < 4,
            size: row === 1 ? 10 : row === 2 ? 9 : 8,
            border: thinBorder,
          });
        }
      }

      if (LOGO_BASE64) {
        const imageId = workbook.addImage({
          base64: LOGO_BASE64,
          extension: "jpeg",
        });
        worksheet.addImage(imageId, {
          tl: { col: 3, row: 0.5 },
          ext: { width: 84, height: 84 },
        });
      }

      // ============================================================
      // Student Info Section (Rows 6-10) – Full Width
      // ============================================================
      const info = [
        [
          "ID Number",
          transcript.idNumber,
          "Birth Date",
          transcript.birthDateGC,
        ],
        [
          "Full Name",
          transcript.fullName,
          "Enrolment Type",
          transcript.programModality?.name || "-",
        ],
        [
          "Sex",
          transcript.gender,
          "Department",
          transcript.department?.name || "-",
        ],
        [
          "Program",
          transcript.programLevel?.name || "-",
          "Field of Study",
          transcript.department?.name || "-",
        ],
        [
          "Date Of Admission",
          transcript.dateEnrolledGC,
          "Date Issued",
          transcript.dateIssuedGC || "",
        ],
      ];

      info.forEach((values, index) => {
        const row = worksheet.getRow(6 + index);
        row.height = 22;

        // Label 1 (cols 1-2 merged)
        worksheet.mergeCells(6 + index, 1, 6 + index, 2);
        const label1 = row.getCell(1);
        label1.value = values[0];
        applyStyle(label1, {
          fill: colors.gray,
          bold: true,
          horizontal: "left",
          border: thinBorder,
        });

        // Value 1 (cols 3-6 merged)
        worksheet.mergeCells(6 + index, 3, 6 + index, 6);
        const value1 = row.getCell(3);
        value1.value = values[1];
        applyStyle(value1, { horizontal: "left", border: thinBorder });

        // Label 2 (cols 7-9 merged)
        worksheet.mergeCells(6 + index, 7, 6 + index, 9);
        const label2 = row.getCell(7);
        label2.value = values[2];
        applyStyle(label2, {
          fill: colors.gray,
          bold: true,
          horizontal: "left",
          border: thinBorder,
        });

        // Value 2 (cols 10-13 merged)
        worksheet.mergeCells(6 + index, 10, 6 + index, 13);
        const value2 = row.getCell(10);
        value2.value = values[3];
        applyStyle(value2, { horizontal: "left", border: thinBorder });
      });

      // ---------- Semester Blocks ----------
      let currentRow = 12;
      for (
        let semesterIndex = 0;
        semesterIndex < transcript.studentCopies.length;
        semesterIndex += 2
      ) {
        const copies = [
          transcript.studentCopies[semesterIndex],
          transcript.studentCopies[semesterIndex + 1],
        ];
        const blockColumns = [1, 8];
        let blockEndRow = currentRow;

        copies.forEach((copy, blockIndex) => {
          if (!copy) return;
          const startColumn = blockColumns[blockIndex];
          const endColumn = startColumn + 5;
          worksheet.mergeCells(currentRow, startColumn, currentRow, endColumn);
          const semesterHeader = worksheet.getCell(currentRow, startColumn);
          semesterHeader.value = `${getAcademicYearString(copy.academicYear)} • Year ${copy.classyear?.name || "I"} • ${copy.semester?.name || "First Semester"}`;
          worksheet.getRow(currentRow).height = 24;
          applyStyle(semesterHeader, {
            fill: colors.orangeDark,
            bold: true,
            color: colors.white,
            size: 7,
            border: thinBorder,
          });
          const headerRow = worksheet.getRow(currentRow + 1);
          ["No", "Code", "Title", "CH", "Grade", "Point"].forEach(
            (label, offset) => {
              headerRow.getCell(startColumn + offset).value = label;
              applyStyle(headerRow.getCell(startColumn + offset), {
                fill: colors.gray,
                bold: true,
                size: 7,
                border: thinBorder,
              });
            },
          );
          const courseStartRow = currentRow + 2;
          copy.courses.forEach((course, courseIndex) => {
            const row = worksheet.getRow(courseStartRow + courseIndex);
            row.height = Math.max(
              18,
              Math.ceil(String(course.courseTitle).length / 28) * 15,
            );
            const values = [
              courseIndex + 1,
              course.courseCode,
              course.courseTitle,
              course.totalCrHrs,
              course.letterGrade,
              course.gradePoint,
            ];
            values.forEach((value, offset) => {
              row.getCell(startColumn + offset).value = value;
              applyStyle(row.getCell(startColumn + offset), {
                color: offset === 4 ? colors.blue : colors.black,
                bold: offset === 4,
                size: 7,
                horizontal: offset === 2 ? "left" : "center",
                border: thinBorder,
              });
            });
            row.getCell(startColumn + 3).numFmt = "0.00";
            row.getCell(startColumn + 5).numFmt = "0.00";
          });
          const summaryRow = courseStartRow + Math.max(copy.courses.length, 1);
          const totalCredit = copy.courses.reduce(
            (sum, course) => sum + (course.totalCrHrs || 0),
            0,
          );
          const totalPoints = copy.courses.reduce(
            (sum, course) => sum + (course.gradePoint || 0),
            0,
          );
          worksheet.mergeCells(summaryRow, startColumn, summaryRow, endColumn);
          worksheet.getCell(summaryRow, startColumn).value =
            `SGPA: ${copy.semesterGPA.toFixed(2)} | CGPA: ${copy.semesterCGPA.toFixed(2)} | Status: ${copy.status}`;
          applyStyle(worksheet.getCell(summaryRow, startColumn), {
            fill: colors.orangeDark,
            bold: true,
            color: colors.white,
            size: 7,
            horizontal: "left",
            border: thinBorder,
          });
          worksheet.getCell(summaryRow, startColumn).note =
            `Total Cr.Hr: ${totalCredit.toFixed(2)} | Points: ${totalPoints.toFixed(2)}`;
          blockEndRow = Math.max(blockEndRow, summaryRow);
        });
        currentRow = blockEndRow + 2;
      }

      // ============================================================
      // 🟢 MODIFIED: Signature Section - Labels aligned under dashes
      // ============================================================
      const footerRow = currentRow + 1;

      // ---- Dashes Row (footerRow) ----
      // Left dash (cols 1-5 merged) - centered
      worksheet.mergeCells(footerRow, 1, footerRow, 5);
      const dashLeft = worksheet.getCell(footerRow, 1);
      dashLeft.value = "________________________";
      applyStyle(dashLeft, {
        border: thinBorder,
        horizontal: "center",
        size: 8,
      });

      // Right dash (cols 9-13 merged) - centered
      worksheet.mergeCells(footerRow, 9, footerRow, 13);
      const dashRight = worksheet.getCell(footerRow, 9);
      dashRight.value = "________________________";
      applyStyle(dashRight, {
        border: thinBorder,
        horizontal: "center",
        size: 8,
      });

      // ---- Labels Row (footerRow + 1) - directly under the dashes ----
      // Left label (cols 1-5 merged) - centered under left dash
      worksheet.mergeCells(footerRow + 1, 1, footerRow + 1, 5);
      const labelLeft = worksheet.getCell(footerRow + 1, 1);
      labelLeft.value = "Registrar";
      applyStyle(labelLeft, {
        bold: true,
        size: 8,
        horizontal: "center",
      });

      // Right label (cols 9-13 merged) - centered under right dash
      worksheet.mergeCells(footerRow + 1, 9, footerRow + 1, 13);
      const labelRight = worksheet.getCell(footerRow + 1, 9);
      labelRight.value = "Dean";
      applyStyle(labelRight, {
        bold: true,
        size: 8,
        horizontal: "center",
      });

      // ---------- Footer Text (if any) ----------
      if (transcript.footerText) {
        const footerTextRow = footerRow + 3;
        worksheet.mergeCells(footerTextRow, 1, footerTextRow, totalColumns);
        worksheet.getCell(footerTextRow, 1).value = transcript.footerText;
        worksheet.getRow(footerTextRow).height = Math.max(
          22,
          transcript.footerText.split("\n").length * 18,
        );
        applyStyle(worksheet.getCell(footerTextRow, 1), {
          size: 7,
          color: "3C3C3C",
          border: thinBorder,
        });
      }

      // ============================================================
      // 🟢 MODIFIED: Removed frozen panes - now scrollable
      // ============================================================
      // worksheet.views = [{ state: "frozen", ySplit: 13 }]; // COMMENTED OUT
      // worksheet.pageSetup.printTitlesRow = "1:13"; // COMMENTED OUT
      // The above lines are removed so the worksheet scrolls normally
    });

    // ---------- Save the workbook ----------
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Student_Transcripts.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ===== PRINT FUNCTIONS =====
  const printStudentCopy = () => {
    if (realReports.length === 0) {
      alert("No data to print. Generate first.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;

    let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Academic Records</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; background: white; color: black; }
        .page { page-break-after: always; }
        .header { background-color: #FFD700; padding: 10px; text-align: center; position: relative; height: 60px; }
        .logo { position: absolute; left: 10px; top: 5px; width: 50px; height: 50px; background: #ccc; }
        h2, h3, h4 { margin: 5px 0; color: black; }
        table { border-collapse: collapse; width: 100%; margin: 8px 0; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 5px; text-align: left; color: black; }
        th { background-color: #FFC800; color: black; font-weight: bold; text-align: center; }
        .student-info td:first-child, .student-info td:nth-child(3), .student-info td:nth-child(5) { background-color: #FFFFE0; font-weight: bold; color: black; }
        .course-table th { background-color: #FFC800; color: black; }
        .summary-table th { background-color: #FFC800; color: black; }
        .summary-table td { background-color: #FFF8DC; color: black; }
        .total-row td { font-weight: bold; background-color: #FFF8DC; }
        .total-row td:first-child { background-color: white; border: none; }
        .signature { margin-top: 20px; display: flex; justify-content: space-between; color: black; }
        .grading-scale { font-size: 10px; margin-top: 8px; color: black; }
        .footer-note { font-size: 10px; margin-top: 6px; color: #666; }
        .academic-line { font-weight: bold; margin: 10px 0; color: black; font-size: 12px; }
      </style>
    </head>
    <body>
  `;

    realReports.forEach((report) => {
      const copy = report.studentCopies[0];
      if (!copy) return;

      // Calculate totals
      const totalCr = copy.courses.reduce(
        (sum: any, c: { totalCrHrs: any }) => sum + (c.totalCrHrs || 0),
        0,
      );
      const totalPoint = copy.courses.reduce(
        (sum: any, c: { gradePoint: any }) => sum + (c.gradePoint || 0),
        0,
      );

      // Previous/semester data
      const prevTotalCredit = copy.previousCredit || 0;
      const prevTotalGP = copy.previousGradePoint || 0;
      const prevCGPA = copy.previousCGPA || 0;
      const prevCGPALetter = copy.previousCGPALetter || "N/A";

      const cumulativeCredit = prevTotalCredit + totalCr;
      const cumulativeGP = prevTotalGP + totalPoint;

      printContent += `
      <div class="page">
        <div class="header">
          <div class="logo"></div>
          <h3>MD1_[PC_I]</h3>
          <div>DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE</div>
          <h4>STUDENT ACADEMIC RECORD</h4>
        </div>

        <table class="student-info">
          <tr>
            <td>ID Number</td><td>${report.idNumber || ""}</td>
            <td>Date Of Admission</td><td>${report.dateEnrolledGC || ""}</td>
            <td>Date Of Birth</td><td>${report.birthDateGC || ""}</td>
          </tr>
          <tr>
            <td>Name of Student</td><td>${report.fullName || ""}</td>
            <td>Enrolment Type</td><td>${report.programModality?.name || "Regular"}</td>
            <td>Date Issued</td><td>${report.dateIssuedGC || ""}</td>
          </tr>
          <tr>
            <td>Sex</td><td>${report.gender || ""}</td>
            <td>Department</td><td>${report.department?.name || ""}</td>
            <td></td><td></td>
          </tr>
          <tr>
            <td>Program</td><td>${report.programLevel?.name || "Degree"}</td>
            <td>Field of Study</td><td>${report.department?.name || ""}</td>
            <td></td><td></td>
          </tr>
        </table>

        <div class="academic-line">
          Academic Year: ${getAcademicYearString(copy.academicYear)}   Class Year: ${copy.classyear?.name || "II"}   Semester: ${copy.semester?.name || "I"}
        </div>

        <!-- COURSES TABLE with Total Row -->
        <table class="course-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Code</th>
              <th>Cr.Hr.</th>
              <th>Grade</th>
              <th>Point</th>
            </tr>
          </thead>
          <tbody>
            ${copy.courses
              .map(
                (c: {
                  courseTitle: any;
                  courseCode: any;
                  totalCrHrs: any;
                  letterGrade: any;
                  gradePoint: any;
                }) => `
              <tr>
                <td>${c.courseTitle || ""}</td>
                <td style="text-align: center">${c.courseCode || ""}</td>
                <td style="text-align: center">${(c.totalCrHrs || 0).toFixed(2)}</td>
                <td style="text-align: center; font-weight: bold; color: blue;">${c.letterGrade || ""}</td>
                <td style="text-align: center">${(c.gradePoint || 0).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
            <!-- TOTAL ROW -->
            <tr class="total-row">
              <td style="background: white; border: none;"></td>
              <td style="text-align: center; font-weight: bold;">Total</td>
              <td style="text-align: center; font-weight: bold;">${totalCr.toFixed(2)}</td>
              <td style="text-align: center;"></td>
              <td style="text-align: center; font-weight: bold;">${totalPoint.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- SUMMARY TABLE (stacked below, same width) -->
        <table class="summary-table">
          <thead>
            <tr>
              <th>Summary</th>
              <th>Credit</th>
              <th>GP</th>
              <th>ANG</th>
              <th>ALG</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Previous</strong></td>
              <td style="text-align: center">${prevTotalCredit.toFixed(2)}</td>
              <td style="text-align: center">${prevTotalGP.toFixed(2)}</td>
              <td style="text-align: center">${prevCGPA.toFixed(2)}</td>
              <td style="text-align: center">${prevCGPALetter}</td>
            </tr>
            <tr>
              <td><strong>Semester</strong></td>
              <td style="text-align: center">${totalCr.toFixed(2)}</td>
              <td style="text-align: center">${totalPoint.toFixed(2)}</td>
              <td style="text-align: center">${(copy.semesterGPA || 0).toFixed(2)}</td>
              <td style="text-align: center">${copy.semesterGPALetter || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Cumulative</strong></td>
              <td style="text-align: center">${cumulativeCredit.toFixed(2)}</td>
              <td style="text-align: center">${cumulativeGP.toFixed(2)}</td>
              <td style="text-align: center">${(cumulativeGP / cumulativeCredit).toFixed(2)}</td>
              <td style="text-align: center">${copy.semesterCGPALetter || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td style="text-align: center">${copy.status || "PASSED"}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><strong>Class Desc</strong></td>
              <td style="text-align: center">${getClassDescription(copy.semesterCGPALetter)}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="grading-scale">
          Grading System: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete<br>
          A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass Mark, F=Fail
        </div>

        <div class="footer-note">
          **(Course Repeated), *(Courses Taken from other university/College), DATE ISSUE & [Date]
        </div>

        <div class="signature">
          <div>REGISTRAR: ____________________</div>
          <div>DEAN/VICE DEAN: ____________________</div>
        </div>
      </div>
    `;
    });

    printContent += `</body></html>`;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const printTranscript = () => {
    if (realTranscripts.length === 0) {
      alert("No data to print. Generate first.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Transcripts</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 11px; background: white; color: black; }
          .page { page-break-after: always; }
          .header { text-align: center; margin-bottom: 20px; color: black; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid black; }
          th, td { border: 1px solid black; padding: 4px; text-align: left; color: black; }
          th { background-color: #ddd; font-weight: bold; text-align: center; color: black; }
          .student-info td { border: 1px solid black; padding: 5px; color: black; }
          .semester-header { font-weight: bold; margin-top: 15px; background-color: #f0f0f0; padding: 5px; color: black; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; color: black; }
        </style>
      </head>
      <body>
    `;

    realTranscripts.forEach((transcript) => {
      printContent += `
        <div class="page">
          <div class="header">
            <h3>DEUTSCHE HOCHSCHULE FÜR MEDIZIN</h3>
            <h4>STUDENT ACADEMIC TRANSCRIPT</h4>
            <div>OFFICE OF THE REGISTRAR</div>
            ${transcript.dateIssuedGC ? `<div>Issued on: ${transcript.dateIssuedGC}</div>` : ""}
          </div>

          <table class="student-info">
            <tr><td><strong>ID Number</strong></td><td>${transcript.idNumber}</td><td><strong>Birth Date</strong></td><td>${transcript.birthDateGC}</td></tr>
            <tr><td><strong>Full Name</strong></td><td>${transcript.fullName}</td><td><strong>Enrolment Type</strong></td><td>${transcript.programModality?.name || "-"}</td></tr>
            <tr><td><strong>Sex</strong></td><td>${transcript.gender}</td><td><strong>Department</strong></td><td>${transcript.department?.name || "-"}</td></tr>
            <tr><td><strong>Program</strong></td><td>${transcript.programLevel?.name || "-"}</td><td><strong>Field of Study</strong></td><td>${transcript.department?.name || "-"}</td></tr>
            <tr><td><strong>Date Of Admission</strong></td><td>${transcript.dateEnrolledGC}</td><td><strong>Date Issued</strong></td><td>${transcript.dateIssuedGC || ""}</td></tr>
          </table>

          ${transcript.studentCopies
            .map((copy) => {
              return `
              <div class="semester-header" style="text-align: center;">
                ${getAcademicYearString(copy.academicYear)} • Year ${copy.classyear?.name || "I"} • ${copy.semester?.name || "First Semester"}
              </div>
              <table>
                <thead><tr><th>No</th><th>Code</th><th>Course Title</th><th>CH</th><th>Grade</th><th>Point</th></tr></thead>
                <tbody>
                  ${copy.courses
                    .map(
                      (c, i) => `
                    <tr>
                      <td style="text-align: center">${i + 1}</td>
                      <td>${c.courseCode}</td>
                      <td>${c.courseTitle}</td>
                      <td style="text-align: center">${c.totalCrHrs.toFixed(2)}</td>
                      <td style="text-align: center; font-weight: bold; color: blue;">${c.letterGrade}</td>
                      <td style="text-align: center">${c.gradePoint.toFixed(2)}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
              <div style="background-color: #FF8C00; color: white; padding: 4px; font-size: 11px; text-align: right; margin-bottom: 15px; margin-top: 5px;">
                SGPA: ${copy.semesterGPA.toFixed(2)} | CGPA: ${copy.semesterCGPA.toFixed(2)} | Status: ${copy.status}
              </div>
            `;
            })
            .join("")}

          <div class="signature" style="margin-top: 40px;">
            <div>_________________<br>Registrar<br>Date: _____</div>
            <div>_________________<br>Dean<br>Date: _____</div>
          </div>
        </div>
      `;
    });

    printContent += `</body></html>`;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // Type Selection Screen
  if (!searchType) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
            Student Records
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Choose what you want to view.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setSearchType("report")}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border-2 font-medium text-sm transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              Student Copy
            </button>
            <button
              onClick={() => setSearchType("transcript")}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border-2 font-medium text-sm transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105"
            >
              <ScrollText className="w-5 h-5" />
              Transcripts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isReport = searchType === "report";

  // ===== UPDATED: Header Click Handler =====
  const handleHeaderClick = (
    key: keyof StudentForSelection,
    isFilterable: boolean,
  ) => {
    if (isFilterable) {
      handleDropdownOpen(key as "departmentName" | "bcysDisplayName");
    } else {
      setSortConfig((prev) => ({
        key,
        direction:
          prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  // ===== NEW: Toggle sort direction (for use inside dropdown) =====
  const toggleSort = (key: keyof StudentForSelection) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  // ===========================================

  // ===== NEW: Toggle Select All =====
  const toggleSelectAll = (column: "departmentName" | "bcysDisplayName") => {
    setFilters((prev) => {
      const current = prev[column];
      // If undefined or has items, clear it (Show All = undefined)
      // If undefined, we set to [] (Show None) to allow manual selection
      if (current === undefined) {
        return { ...prev, [column]: [] };
      }
      // If it has items (or is empty), remove the filter key to show All
      const next = { ...prev };
      delete next[column];
      return next;
    });
  };

  // ===== UPDATED: Filter & Dropdown Handlers =====
  const handleDropdownOpen = (column: "departmentName" | "bcysDisplayName") => {
    const isOpen = openDropdown === column;
    if (!isOpen) {
      // Initialize pending state with currently applied filters (or empty array)
      const currentApplied = filters[column];
      setPendingFilters((prev) => ({
        ...prev,
        [column]: currentApplied ? [...currentApplied] : [],
      }));
    }
    setOpenDropdown(isOpen ? null : column);
  };

  const togglePendingValue = (
    column: "departmentName" | "bcysDisplayName",
    value: string,
  ) => {
    setPendingFilters((prev) => {
      const current = prev[column] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [column]: next };
    });
  };

  const togglePendingSelectAll = (
    column: "departmentName" | "bcysDisplayName",
    distinctValues: string[],
  ) => {
    setPendingFilters((prev) => {
      const current = prev[column] || [];
      const isAllSelected =
        distinctValues.length > 0 && current.length === distinctValues.length;
      return {
        ...prev,
        [column]: isAllSelected ? [] : [...distinctValues],
      };
    });
  };

  const applyPendingFilters = (
    column: "departmentName" | "bcysDisplayName",
  ) => {
    setFilters((prev) => {
      const next = { ...prev };
      const pending = pendingFilters[column];
      // If empty or undefined, clear the filter (show all)
      if (!pending || pending.length === 0) {
        delete next[column];
      } else {
        next[column] = pending;
      }
      return next;
    });
    setOpenDropdown(null);
  };

  const clearAppliedFilter = (column: "departmentName" | "bcysDisplayName") => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[column];
      return next;
    });
    setOpenDropdown(null);
  };
  // =====================================================

  // ===== UPDATED: Filter Dropdown with Fixed Positioning =====
  const FilterDropdown = ({
    columnKey,
    distinctValues,
    label,
    anchorRef,
  }: {
    columnKey: "departmentName" | "bcysDisplayName";
    distinctValues: string[];
    label: string;
    anchorRef: React.RefObject<HTMLTableCellElement | null>;
  }) => {
    const isOpen = openDropdown === columnKey;
    const pending = pendingFilters[columnKey] || [];
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (isOpen && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 4, left: rect.left });
      }
    }, [isOpen, anchorRef]);

    const isAllSelected =
      distinctValues.length > 0 && pending.length === distinctValues.length;
    const isIndeterminate =
      pending.length > 0 && pending.length < distinctValues.length;

    if (!isOpen) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
        <div
          className="fixed z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
            {label}
          </div>

          <label className="flex items-center space-x-2 px-2 py-2 border-b border-gray-200 dark:border-gray-700 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate;
              }}
              onChange={() => togglePendingSelectAll(columnKey, distinctValues)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isAllSelected
                ? "Select All"
                : isIndeterminate
                  ? `(${pending.length} selected)`
                  : "Select All"}
            </span>
          </label>

          <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
            {distinctValues.map((value) => (
              <label
                key={value}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={pending.includes(value)}
                  onChange={() => togglePendingValue(columnKey, value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                  {value}
                </span>
                <span className="text-xs text-gray-400">
                  (
                  {
                    allStudents.filter(
                      (s) =>
                        (columnKey === "departmentName"
                          ? s.departmentName
                          : s.bcysDisplayName) === value,
                    ).length
                  }
                  )
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => applyPendingFilters(columnKey)}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Apply Filter
            </button>
            <button
              onClick={() => clearAppliedFilter(columnKey)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Clear
            </button>
          </div>

          <button
            onClick={() => toggleSort(columnKey)}
            className="w-full mt-2 text-left px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort:{" "}
            {sortConfig.key === columnKey
              ? sortConfig.direction === "asc"
                ? "▲ Asc"
                : "▼ Desc"
              : "Off"}
          </button>
        </div>
      </>
    );
  };
  // ========================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToChoice}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <ArrowLeft /> Back
          </button>
          {/* Download buttons moved down next to results */}
          <div></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {isReport
              ? "Select Students for Grade Report"
              : "Select Students for Transcript"}
          </h2>

          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={toggleAllVisible}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {filteredAndSortedStudents.every((s) =>
                selectedStudents.includes(s.studentId),
              )
                ? "Deselect All"
                : "Select All Visible"}
            </button>
          </div>

          {isReport && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Semester
                </label>
                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-900 dark:text-white">
                    Select Semester
                  </option>
                  {semesters.map((sem) => (
                    <option
                      key={sem.academicPeriodCode}
                      value={sem.academicPeriodCode}
                      className="text-gray-900 dark:text-white"
                    >
                      {sem.academicPeriodCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Class Year
                </label>
                <select
                  value={selectedClassYearId}
                  onChange={(e) => setSelectedClassYearId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-900 dark:text-white">
                    Select Class Year
                  </option>
                  {classYears.map((cy) => (
                    <option
                      key={cy.id}
                      value={cy.id}
                      className="text-gray-900 dark:text-white"
                    >
                      {cy.classYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {selectedCount}
              </span>{" "}
              student{selectedCount !== 1 ? "s" : ""}
            </div>

            {(filters.departmentName || filters.bcysDisplayName) && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline ml-2"
              >
                ✕ Clear all filters
              </button>
            )}
            <button
              onClick={
                isReport ? handleGenerateReports : handleGenerateTranscripts
              }
              disabled={
                selectedStudents.length === 0 ||
                (isReport && (!selectedSemesterId || !selectedClassYearId)) ||
                loadingReports
              }
              className={`px-6 py-2 rounded-lg font-bold text-white shadow transition ${
                selectedStudents.length === 0 ||
                (isReport && (!selectedSemesterId || !selectedClassYearId)) ||
                loadingReports
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : isReport
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              }`}
            >
              {loadingReports ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Generating...
                </>
              ) : isReport ? (
                "Generate Student Copies"
              ) : (
                "Generate Transcripts"
              )}
            </button>
          </div>

          {Error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
              {Error}
            </div>
          )}
        </div>

        {/* Student List with improved dark mode visibility */}
        {loadingStudents ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading students...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Filtered Count Indicator */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filteredAndSortedStudents.length} student
                {filteredAndSortedStudents.length !== 1 ? "s" : ""}
              </span>
              {(searchTerm ||
                filters.departmentName?.length ||
                filters.bcysDisplayName?.length) && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  filtered
                </span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">
                      Select
                    </th>

                    <th
                      className="p-0 text-left text-gray-700 dark:text-gray-200 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      onClick={() => handleHeaderClick("username", false)}
                    >
                      <div className="w-full h-full p-3 flex items-center gap-1">
                        ID{" "}
                        {sortConfig.key === "username" && (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>

                    <th
                      className="p-0 text-left text-gray-700 dark:text-gray-200 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      onClick={() => handleHeaderClick("fullNameENG", false)}
                    >
                      <div className="w-full h-full p-3 flex items-center gap-1">
                        Name{" "}
                        {sortConfig.key === "fullNameENG" && (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Department */}
                    <th
                      ref={deptHeaderRef}
                      className="p-0 text-left text-gray-700 dark:text-gray-200 font-semibold"
                    >
                      <div
                        className="w-full h-full p-3 flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        onClick={() =>
                          handleHeaderClick("departmentName", true)
                        }
                      >
                        <div className="flex items-center gap-1">
                          <span>Department</span>
                          {sortConfig.key === "departmentName" && (
                            <span className="text-xs">
                              {sortConfig.direction === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                          {filters.departmentName &&
                            filters.departmentName.length > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                                {filters.departmentName.length}
                              </span>
                            )}
                        </div>
                        <svg
                          className="w-3 h-3 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                      </div>
                      <FilterDropdown
                        columnKey="departmentName"
                        distinctValues={distinctDepartments}
                        label="Filter by Department"
                        anchorRef={deptHeaderRef}
                      />
                    </th>

                    {/* BCYS */}
                    <th
                      ref={bcysHeaderRef}
                      className="p-0 text-left text-gray-700 dark:text-gray-200 font-semibold"
                    >
                      <div
                        className="w-full h-full p-3 flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        onClick={() =>
                          handleHeaderClick("bcysDisplayName", true)
                        }
                      >
                        <div className="flex items-center gap-1">
                          <span>Recent BCYS</span>
                          {sortConfig.key === "bcysDisplayName" && (
                            <span className="text-xs">
                              {sortConfig.direction === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                          {filters.bcysDisplayName &&
                            filters.bcysDisplayName.length > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                                {filters.bcysDisplayName.length}
                              </span>
                            )}
                        </div>
                        <svg
                          className="w-3 h-3 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                      </div>
                      <FilterDropdown
                        columnKey="bcysDisplayName"
                        distinctValues={distinctBCYS}
                        label="Filter by BCYS"
                        anchorRef={bcysHeaderRef}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedStudents.length > 0 ? (
                    filteredAndSortedStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedStudents.includes(student.studentId)
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : "bg-white dark:bg-gray-800"
                        }`}
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <td className="p-3">
                          {selectedStudents.includes(student.studentId) ? (
                            <CheckSquare className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="text-gray-400 dark:text-gray-500" />
                          )}
                        </td>
                        <td className="p-3 font-mono text-gray-700 dark:text-gray-300">
                          {student.username}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {student.fullNameENG}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {student.departmentName}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {student.bcysDisplayName}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results with Tabs */}
        {isReport && realReports.length > 0 && (
          <div ref={reportsSectionRef} className="mt-8">
            {/* Download Buttons - Moved down here */}
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={exportStudentCopyToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={exportStudentCopyToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Download size={16} /> Excel
              </button>
              <button
                onClick={printStudentCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Printer size={16} /> Print
              </button>
            </div>

            {/* Tabs Header */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="tabs-container flex">
                {realReports.map((report, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTabIndex(index)}
                    className={`
          px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
          flex items-center gap-2 whitespace-nowrap flex-shrink-0
          ${
            activeTabIndex === index
              ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-gray-700 -mb-px"
              : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent"
          }
        `}
                  >
                    <span className="font-mono">{report.idNumber}</span>
                    {activeTabIndex === index && (
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-b-lg p-4">
              {realReports[activeTabIndex] && (
                <StudentCopyView report={realReports[activeTabIndex]} />
              )}
            </div>
          </div>
        )}

        {!isReport && realTranscripts.length > 0 && (
          <div ref={transcriptsSectionRef} className="mt-8">
            {/* Download Buttons - Moved down here */}
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={exportTranscriptToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={exportTranscriptToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Download size={16} /> Excel
              </button>
              <button
                onClick={printTranscript}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Printer size={16} /> Print
              </button>
            </div>

            {/* Tabs Header */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="tabs-container flex">
                {realTranscripts.map((transcript, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTabIndex(index)}
                    className={`
          px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
          flex items-center gap-2 whitespace-nowrap flex-shrink-0
          ${
            activeTabIndex === index
              ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-gray-700 -mb-px"
              : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent"
          }
        `}
                  >
                    <span className="font-mono">{transcript.idNumber}</span>
                    {activeTabIndex === index && (
                      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-b-lg p-4">
              {realTranscripts[activeTabIndex] && (
                <TranscriptView transcript={realTranscripts[activeTabIndex]} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== STUDENT COPY VIEW COMPONENT with side-by-side tables =====
function StudentCopyView({ report }: { report: RealGradeReport }) {
  const copy = report.studentCopies[0];
  if (!copy) return null;

  const getAcademicYearString = (academicYear: any): string => {
    if (!academicYear) return ACADEMIC_YEAR_NOT_PROVIDED;
    if (typeof academicYear === "string") {
      const value = academicYear.trim();
      return value.length > 0 ? value : ACADEMIC_YEAR_NOT_PROVIDED;
    }
    if (typeof academicYear === "object") {
      const value =
        academicYear.yearCode || academicYear.yearGC || academicYear.name;
      if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : ACADEMIC_YEAR_NOT_PROVIDED;
      }
      return ACADEMIC_YEAR_NOT_PROVIDED;
    }
    return ACADEMIC_YEAR_NOT_PROVIDED;
  };

  const totalCr = copy.courses.reduce(
    (sum: any, c: { totalCrHrs: any }) => sum + (c.totalCrHrs || 0),
    0,
  );
  const totalPoint = copy.courses.reduce(
    (sum: any, c: { gradePoint: any }) => sum + (c.gradePoint || 0),
    0,
  );

  // REPLACE THESE HARDCODED VALUES:
  const prevTotalCredit = copy.previousCredit || 0;
  const prevTotalGP = copy.previousGradePoint || 0;
  const prevCGPA = copy.previousCGPA || 0;
  const prevCGPALetter = copy.previousCGPALetter || "N/A";

  const cumulativeCredit = prevTotalCredit + totalCr;
  const cumulativeGP = prevTotalGP + totalPoint;
  const academicYearStr = getAcademicYearString(copy.academicYear);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-yellow-400 dark:bg-yellow-500 p-3 relative">
        <div className="text-center">
          <div className="font-bold text-lg text-gray-900 dark:text-gray-900">
            {report.studentBCYS || "N/A"}
          </div>
          <div className="text-xs text-gray-800 dark:text-gray-800">
            DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE
          </div>
          <div className="font-bold text-base mt-1 text-gray-900 dark:text-gray-900">
            STUDENT ACADEMIC RECORD
          </div>
        </div>
      </div>

      <div className="p-3">
        {/* 6-Column Student Info Table */}
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">
                ID Number
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600 w-1/6">
                {report.idNumber}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">
                Date Of Admission
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600 w-1/6">
                {report.dateEnrolledGC}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">
                Date Of Birth
              </td>
              <td className="p-1 w-1/6">{report.birthDateGC}</td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Name of Student
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.fullName}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Enrolment Type
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.programModality?.name || "Regular"}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Date Issued
              </td>
              <td className="p-1">{report.dateIssuedGC}</td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Sex
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.gender}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Department
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.department?.name}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600"></td>
              <td className="p-1"></td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Program
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.programLevel?.name || "Degree"}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">
                Field of Study
              </td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                {report.department?.name}
              </td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600"></td>
              <td className="p-1"></td>
            </tr>
          </tbody>
        </table>

        <div className="font-bold mt-2 mb-1 text-xs text-gray-900 dark:text-white">
          Academic Year: {academicYearStr} Class Year:{" "}
          {copy.classyear?.name || "II"} Semester: {copy.semester?.name || "I"}
        </div>

        {/* Side-by-side tables */}
        <div className="flex gap-2 mt-1">
          {/* Courses Table */}
          <div className="w-2/3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-500 dark:bg-blue-600 text-white">
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-left">
                    Course Title
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    Code
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    Cr.Hr.
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    Grade
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    Point
                  </th>
                </tr>
              </thead>
              <tbody>
                {copy.courses.map((c, i) => (
                  <tr
                    key={i}
                    className="border border-gray-300 dark:border-gray-600"
                  >
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600">
                      {c.courseTitle}
                    </td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center">
                      {c.courseCode}
                    </td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center">
                      {(c.totalCrHrs || 0).toFixed(2)}
                    </td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center font-bold text-blue-600 dark:text-blue-400">
                      {c.letterGrade}
                    </td>
                    <td className="p-1 text-center text-gray-900 dark:text-gray-300">
                      {(c.gradePoint || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-xs mt-1 text-gray-900 dark:text-white">
              Total: {totalCr.toFixed(2)} | GR: {totalPoint.toFixed(2)} |
              F=Below 40
            </div>
          </div>

          {/* Summary Table - FIXED DARK MODE BACKGROUND */}
          <div className="w-1/3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-500 dark:bg-blue-600 text-white">
                  <th className="p-1 border border-gray-300 dark:border-gray-600">
                    Summary
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    Credit
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    GP
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    ANG
                  </th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    ALG
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">
                    Previous
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {prevTotalCredit.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {prevTotalGP.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {prevCGPA.toFixed(2)}
                  </td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">
                    {prevCGPALetter}
                  </td>
                </tr>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">
                    Semestre
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {totalCr.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {totalPoint.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {(copy.semesterGPA || 0).toFixed(2)}
                  </td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">
                    {copy.semesterGPALetter || "N/A"}
                  </td>
                </tr>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">
                    Cumulative
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {cumulativeCredit.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {cumulativeGP.toFixed(2)}
                  </td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">
                    {(cumulativeGP / cumulativeCredit).toFixed(2)}
                  </td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">
                    {copy.semesterCGPALetter || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="font-bold mt-2 text-xs text-gray-900 dark:text-white">
          Status: Pass | Status Description: Very Good
        </div>

        <div className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 leading-tight">
          Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00,
          D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory,
          C=Fair, D=Below Pass, F=Fail
        </div>

        <div className="text-[10px] mt-1 text-gray-500 dark:text-gray-500">
          "Course Repeated", "Courses Taken from other university/College", DATE
          ISSUE & [Date]
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-900 dark:text-white">
          <div>
            <span className="font-bold">REGISTRAR:</span> __________
          </div>
          <div>
            <span className="font-bold">DEAN/VICE DEAN:</span> __________
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== TRANSCRIPT VIEW COMPONENT (without FINAL CGPA) =====
function TranscriptView({ transcript }: { transcript: RealTranscript }) {
  // Helper function to safely get academic year string
  const getAcademicYearString = (academicYear: any): string => {
    if (!academicYear) return ACADEMIC_YEAR_NOT_PROVIDED;
    if (typeof academicYear === "string") {
      const value = academicYear.trim();
      return value.length > 0 ? value : ACADEMIC_YEAR_NOT_PROVIDED;
    }
    if (typeof academicYear === "object") {
      const value =
        academicYear.yearCode || academicYear.yearGC || academicYear.name;
      if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : ACADEMIC_YEAR_NOT_PROVIDED;
      }
      return ACADEMIC_YEAR_NOT_PROVIDED;
    }
    return ACADEMIC_YEAR_NOT_PROVIDED;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
      <div className="flex items-center mb-6">
        <img
          src="/assets/companylogo.jpg"
          alt="College Logo"
          className="w-12 h-12 mr-4"
          onError={(e) =>
            ((e.target as HTMLImageElement).style.display = "none")
          }
        />
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            DEUTSCHE HOCHSCHULE FÜR MEDIZIN
          </h2>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            STUDENT ACADEMIC RECORD
          </h3>
          <p className="font-bold text-gray-700 dark:text-gray-300">
            OFFICE OF THE REGISTRAR
          </p>
          {transcript.dateIssuedGC && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              Issued on: {transcript.dateIssuedGC}
            </p>
          )}
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white w-1/4 border-r border-gray-300 dark:border-gray-600">
              ID Number
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 w-1/4 border-r border-gray-300 dark:border-gray-600">
              {transcript.idNumber}
            </td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white w-1/4 border-r border-gray-300 dark:border-gray-600">
              Birth Date
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 w-1/4">
              {transcript.birthDateGC}
            </td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Full Name
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
              {transcript.fullName}
            </td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Enrolment Type
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300">
              {transcript.programModality?.name || "-"}
            </td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Sex
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
              {transcript.gender}
            </td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Department
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300">
              {transcript.department?.name || "-"}
            </td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Program
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
              {transcript.programLevel?.name || "-"}
            </td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Field of Study
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300">
              {transcript.department?.name || "-"}
            </td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Date of Admission
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
              {transcript.dateEnrolledGC}
            </td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
              Date Issued
            </td>
            <td className="p-2 text-gray-700 dark:text-gray-300">
              {transcript.dateIssuedGC}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transcript.studentCopies.map((copy, idx) => {
          const academicYearStr = getAcademicYearString(copy.academicYear);
          const semesterName = copy.semester?.name || "First Semester";
          const classYearName = copy.classyear?.name || "I";

          return (
            <div
              key={idx}
              className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden"
            >
              <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-sm">
                {academicYearStr} • Year {classYearName} • {semesterName}
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      No
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      Code
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      CH
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      Grade
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                      Point
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {copy.courses.map((c, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">
                        {i + 1}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                        {c.courseCode}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                        {c.courseTitle}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">
                        {c.totalCrHrs.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        {c.letterGrade}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">
                        {c.gradePoint.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className="bg-orange-500 dark:bg-orange-600 text-white px-3 py-3 text-xs"
                style={{ marginTop: "2px" }}
              >
                SGPA: {copy.semesterGPA.toFixed(2)} | CGPA:{" "}
                {copy.semesterCGPA.toFixed(2)} | Status: {copy.status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t-2 border-gray-400 dark:border-gray-600">
        <div className="text-center">
          <div className="border-b-2 border-black dark:border-gray-300 w-48 mx-auto mb-2"></div>
          <p className="font-bold text-gray-900 dark:text-white">Registrar</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Date: ________
          </p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-black dark:border-gray-300 w-48 mx-auto mb-2"></div>
          <p className="font-bold text-gray-900 dark:text-white">Dean</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Date: ________
          </p>
        </div>
      </div>

      {/* Footer Section */}
      {transcript.footerText && (
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
          {transcript.footerText.split("\n").map((line, index) => (
            <p
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1"
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
