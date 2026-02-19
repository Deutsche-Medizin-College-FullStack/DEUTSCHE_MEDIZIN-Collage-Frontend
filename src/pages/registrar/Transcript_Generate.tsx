"use client";

import * as XLSX from "xlsx";
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
  semesterCGPAGrade?: string;
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

export default function Transcript_Generate() {
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [allStudents, setAllStudents] = useState<StudentForSelection[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [realReports, setRealReports] = useState<RealGradeReport[]>([]);
  const [realTranscripts, setRealTranscripts] = useState<RealTranscript[]>([]);
  const [Error, setError] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<{ academicPeriodCode: string; name: string }[]>([]);
  const [classYears, setClassYears] = useState<{ id: number; classYear: string }[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedClassYearId, setSelectedClassYearId] = useState<string>("");

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const students = await apiService.get(endPoints.studentsSlip);
        setAllStudents(students || []);
      } catch (err: any) {
        setError("Failed to load students: " + (err?.message || "Unknown error"));
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

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    const term = searchTerm.toLowerCase();
    return allStudents.filter(
      (s) =>
        s.fullNameENG.toLowerCase().includes(term) ||
        s.username?.toLowerCase().includes(term)
    );
  }, [allStudents, searchTerm]);

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredStudents.map((s) => s.studentId);
    const allSelected = visibleIds.every((id) => selectedStudents.includes(id));
    if (allSelected) {
      setSelectedStudents((prev) => prev.filter((id) => !visibleIds.includes(id)));
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

// Generate Student Copies
const handleGenerateReports = async () => {
  if (selectedStudents.length === 0) {
    setError("Please select at least one student");
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
    const reportsArray = Array.isArray(response) ? response : 
                        (response?.data && Array.isArray(response.data)) ? response.data :
                        (response && typeof response === 'object') ? [response] : [];

    const transformedReports: RealGradeReport[] = reportsArray.map((item: any) => {
      // Helper function to safely get academic year string
      const getAcademicYearString = (academicYear: any): string => {
        if (!academicYear) return "2023/24G.C/2016ec";
        if (typeof academicYear === 'string') return academicYear;
        if (typeof academicYear === 'object') {
          return academicYear.yearCode || academicYear.yearGC || "2023/24G.C/2016ec";
        }
        return "2023/24G.C/2016ec";
      };

      return {
        idNumber: item.idNumber || item.studentId || "N/A",
        fullName: item.fullName || item.studentName || "Unknown",
        gender: item.gender || "N/A",
        birthDateGC: item.dateOfBirthGC || item.birthDate || "N/A",
        dateEnrolledGC: item.dateEnrolledGC || item.enrollmentDate || "N/A",
        dateIssuedGC: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        programModality: item.programModality || { id: "1", name: "Regular" },
        programLevel: item.programLevel || { id: "1", name: "Degree" },
        department: item.department || { id: 1, name: "Unknown" },
        studentCopies: [
          {
            classyear: item.classyear || { id: 1, name: "II" },
            semester: item.semester || { id: "1", name: "I" },
            academicYear: getAcademicYearString(item.academicYear),
            courses: Array.isArray(item.courses) ? item.courses.map((c: any) => ({
              courseCode: c.courseCode || c.code || "N/A",
              courseTitle: c.courseTitle || c.title || "Unknown",
              totalCrHrs: c.totalCrHrs || c.credits || 0,
              letterGrade: c.letterGrade || c.grade || "N/A",
              gradePoint: c.gradePoint || c.points || 0,
            })) : [],
            semesterGPA: item.semesterGPA || 0,
            semesterCGPA: item.semesterCGPA || 0,
            status: item.status || "PASSED",
          },
        ],
      };
    });

    console.log("Transformed Reports:", transformedReports);
    setRealReports(transformedReports);
  } catch (err: any) {
    const message = err?.response?.data?.error || err?.message || "Failed to generate student copies";
    setError(message);
    
    // Create mock data for testing
    const mockReports = selectedStudents.map((id, idx) => ({
      idNumber: `STU${id}`,
      fullName: `Student ${idx + 1}`,
      gender: idx % 2 === 0 ? "Male" : "Female",
      birthDateGC: "1995-01-01",
      dateEnrolledGC: "2021-10-11",
      dateIssuedGC: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      programModality: { id: "1", name: "Regular" },
      programLevel: { id: "1", name: "Degree" },
      department: { id: 1, name: "Medical Radiotechnology" },
      studentCopies: [
        {
          classyear: { id: 1, name: "II" },
          semester: { id: "1", name: "I" },
          academicYear: "2023/24G.C/2016ec",
          courses: [
            {
              courseCode: "RAD SM_2174",
              courseTitle: "ANATOMY",
              totalCrHrs: 6.00,
              letterGrade: "A-",
              gradePoint: 22.50,
            },
            {
              courseCode: "RAD SM_2175",
              courseTitle: "PHYSIOLOGY",
              totalCrHrs: 3.00,
              letterGrade: "A+",
              gradePoint: 12.00,
            },
            {
              courseCode: "RAD SM_2176",
              courseTitle: "BIOCHEMISTRY",
              totalCrHrs: 2.00,
              letterGrade: "A",
              gradePoint: 8.00,
            },
          ],
          semesterGPA: 3.8,
          semesterCGPA: 3.8,
          status: "PASSED",
        },
      ],
    }));
    setRealReports(mockReports);
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

  setLoadingReports(true);
  setError(null);

  try {
    // Try multiple possible endpoints for transcript generation
    let response;
    try {
      response = await apiService.post(endPoints.generateGradeReport || "/api/transcripts/generate", {
        studentIds: selectedStudents,
      });
    } catch (error) {
      // Fallback to student copy endpoint with all semesters
      response = await apiService.post(endPoints.studentCopy, {
        studentIds: selectedStudents,
        includeAllSemesters: true,
      });
    }

    console.log("Transcript Response:", response);

    // Handle different response formats
    let transcripts: RealTranscript[] = [];

    if (response?.gradeReports && Array.isArray(response.gradeReports)) {
      transcripts = response.gradeReports;
    } else if (Array.isArray(response)) {
      transcripts = response;
    } else if (response?.data && Array.isArray(response.data)) {
      transcripts = response.data;
    } else if (response && typeof response === 'object') {
      // If response is a single object, wrap it in an array
      transcripts = [response];
    }

    // If still no transcripts, create mock data for testing
    if (transcripts.length === 0) {
      console.warn("No transcripts received, creating mock data");
      transcripts = selectedStudents.map((id, idx) => {
        const student = allStudents.find(s => s.studentId === id);
        return {
          idNumber: student?.username || `STU${id}`,
          fullName: student?.fullNameENG || `Student ${idx + 1}`,
          gender: "Male",
          birthDateGC: "1995-01-01",
          dateEnrolledGC: "2021-10-11",
          dateIssuedGC: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
          programModality: { id: "1", name: "Regular" },
          programLevel: { id: "1", name: "Degree" },
          department: { id: 1, name: student?.departmentName || "Nursing" },
          studentCopies: [
            {
              classyear: { id: 1, name: "I" },
              semester: { id: "1", name: "First Semester" },
              academicYear: "2024G.C/2016ec",
              courses: [
                {
                  courseCode: "ENGL 1011",
                  courseTitle: "Communicative English Skills I",
                  totalCrHrs: 3,
                  letterGrade: "A",
                  gradePoint: 12.0,
                },
                {
                  courseCode: "PSYC 1012",
                  courseTitle: "General Psychology",
                  totalCrHrs: 3,
                  letterGrade: "B+",
                  gradePoint: 9.9,
                },
                {
                  courseCode: "MATH 1014",
                  courseTitle: "Mathematics",
                  totalCrHrs: 3,
                  letterGrade: "A",
                  gradePoint: 12.0,
                },
              ],
              semesterGPA: 3.8,
              semesterCGPA: 3.8,
              status: "PASSED",
            },
            {
              classyear: { id: 1, name: "I" },
              semester: { id: "2", name: "Second Semester" },
              academicYear: "2024G.C/2016ec",
              courses: [
                {
                  courseCode: "ANAT 1013",
                  courseTitle: "Anatomy & Physiology",
                  totalCrHrs: 4,
                  letterGrade: "A",
                  gradePoint: 16.0,
                },
                {
                  courseCode: "CHEM 1023",
                  courseTitle: "General Chemistry",
                  totalCrHrs: 3,
                  letterGrade: "A",
                  gradePoint: 12.0,
                },
              ],
              semesterGPA: 4.0,
              semesterCGPA: 3.9,
              status: "PASSED",
            },
          ],
        };
      });
    }

    setRealTranscripts(transcripts);
  } catch (err: any) {
    const message = err?.response?.data?.error || err?.message || "Failed to generate transcripts";
    setError(message);
    
    // Create mock data for testing even on error
    const mockTranscripts = selectedStudents.map((id, idx) => {
      const student = allStudents.find(s => s.studentId === id);
      return {
        idNumber: student?.username || `STU${id}`,
        fullName: student?.fullNameENG || `Student ${idx + 1}`,
        gender: "Male",
        birthDateGC: "1995-01-01",
        dateEnrolledGC: "2021-10-11",
        dateIssuedGC: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        programModality: { id: "1", name: "Regular" },
        programLevel: { id: "1", name: "Degree" },
        department: { id: 1, name: student?.departmentName || "Nursing" },
        studentCopies: [
          {
            classyear: { id: 1, name: "I" },
            semester: { id: "1", name: "First Semester" },
            academicYear: "2024G.C/2016ec",
            courses: [
              {
                courseCode: "ENGL 1011",
                courseTitle: "Communicative English Skills I",
                totalCrHrs: 3,
                letterGrade: "A",
                gradePoint: 12.0,
              },
              {
                courseCode: "PSYC 1012",
                courseTitle: "General Psychology",
                totalCrHrs: 3,
                letterGrade: "B+",
                gradePoint: 9.9,
              },
            ],
            semesterGPA: 3.8,
            semesterCGPA: 3.8,
            status: "PASSED",
          },
        ],
      };
    });
    setRealTranscripts(mockTranscripts);
  } finally {
    setLoadingReports(false);
  }
};

// ========== STUDENT COPY PDF GENERATION (optimized for multiple students with side-by-side tables) ==========
const exportStudentCopyToPDF = () => {
  if (realReports.length === 0) {
    alert("No data to export. Generate first.");
    return;
  }

  const doc = new jsPDF("l", "mm", "a4"); // Landscape
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

    // Golden Yellow Header Band
    doc.setFillColor(255, 215, 0);
    doc.rect(0, y - 7, pageWidth, 18, "F");

    // Logo
    try {
      doc.addImage(LOGO_BASE64, "PNG", margin + 4, y - 5, 14, 14);
    } catch (e) {}

    doc.setFontSize(12); // Increased from 8
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("MD1_[PC_I]", pageWidth / 2, y - 2, { align: "center" });

    doc.setFontSize(8); // Increased from 5
    doc.setFont("helvetica", "normal");
    doc.text("DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE", pageWidth / 2, y + 2, { align: "center" });

    y += 6;

    // Title
    doc.setFontSize(10); // Increased from 7
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT ACADEMIC RECORD", pageWidth / 2, y + 2, { align: "center" });
    y += 4;

    // Student Info Table - 6 columns (3 pairs) - INCREASED SIZES
    autoTable(doc, {
      startY: y + 1,
      body: [
        ["ID Number", report.idNumber || "", "Date Of Admission", report.dateEnrolledGC || "", "Date Of Birth", report.birthDateGC || ""],
        ["Name of Student", report.fullName || "", "Enrolment Type", report.programModality?.name || "Regular", "Date Issued", report.dateIssuedGC || ""],
        ["Sex", report.gender || "", "Department", report.department?.name || "", "", ""],
        ["Program", report.programLevel?.name || "Degree", "Field of Study", report.department?.name || "", "", ""],
      ],
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.2, lineWidth: 0.15, textColor: [0, 0, 0] }, // Increased from 4.5
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 30, fillColor: [255, 255, 200] }, // Increased from 25
        1: { cellWidth: 45 }, // Increased from 35
        2: { fontStyle: "bold", cellWidth: 30, fillColor: [255, 255, 200] }, // Increased from 25
        3: { cellWidth: 45 }, // Increased from 35
        4: { fontStyle: "bold", cellWidth: 25, fillColor: [255, 255, 200] }, // Increased from 20
        5: { cellWidth: 35 }, // Increased from 30
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    const copy = report.studentCopies[0];
    if (copy) {
      // Academic Year
      doc.setFontSize(7); // Increased from 5
      doc.setFont("helvetica", "bold");
      doc.text(
        `Academic Year: ${copy.academicYear || "2023/24G.C/2016ec"}   Class Year: ${copy.classyear?.name || "II"}   Semester: ${copy.semester?.name || "I"}   MRT_121`,
        margin,
        y
      );
      y += 3;

      // Calculate positions for side-by-side tables - INCREASED WIDTHS
      const leftTableWidth = 150; // Increased from 120
      const rightTableWidth = 80;  // Increased from 60
      const gap = 6; // Gap between tables
      
      // Left side - Courses Table
      const coursesData = copy.courses.map((c) => [
        c.courseTitle || "",
        c.courseCode || "",
        c.totalCrHrs?.toFixed(2) || "0.00",
        c.letterGrade || "",
        c.gradePoint?.toFixed(2) || "0.00",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Course Title", "Code", "Cr.Hr.", "Grade", "Point"]],
        body: coursesData,
        theme: "grid",
        styles: { fontSize: 6, cellPadding: 0.8, lineWidth: 0.15, textColor: [0, 0, 0] }, // Increased from 4
        headStyles: {
          fillColor: [100, 149, 237],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7, // Increased from 4.5
        },
        columnStyles: {
          0: { cellWidth: 65, halign: "left" }, // Increased from 50
          1: { cellWidth: 25, halign: "center" }, // Increased from 20
          2: { cellWidth: 15, halign: "center" }, // Increased from 10
          3: { cellWidth: 20, halign: "center" }, // Increased from 15
          4: { cellWidth: 18, halign: "center" }, // Increased from 12
        },
        margin: { left: margin, right: pageWidth - margin - leftTableWidth - gap - rightTableWidth },
      });

      // Total under courses table
      const totalCr = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
      const totalPoint = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
      
      const coursesEndY = (doc as any).lastAutoTable.finalY;
      
      doc.setFontSize(7); // Increased from 4.5
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${totalCr.toFixed(2)}`, margin + 105, coursesEndY + 3);
      doc.text(`GR: ${totalPoint.toFixed(2)}`, margin + 130, coursesEndY + 3);
      doc.setFontSize(6); // Increased from 4
      doc.setFont("helvetica", "normal");

      // Right side - Summary Table
      const prevTotalCredit = 44.00;
      const prevTotalGP = 176.00;
      const cumulativeCredit = prevTotalCredit + totalCr;
      const cumulativeGP = prevTotalGP + totalPoint;
      const cumulativeGPA = cumulativeGP / cumulativeCredit;

      autoTable(doc, {
        startY: y,
        head: [["Summary", "Credit", "GP", "ANG", "ALG"]],
        body: [
          ["Previous", prevTotalCredit.toFixed(2), prevTotalGP.toFixed(2), "4.00", "A"],
          ["Semestre", totalCr.toFixed(2), totalPoint.toFixed(2), copy.semesterGPA?.toFixed(2) || "3.80", "A"],
          ["Cumulative", cumulativeCredit.toFixed(2), cumulativeGP.toFixed(2), cumulativeGPA.toFixed(2), "A"],
        ],
        theme: "grid",
        styles: {
          fontSize: 6, // Increased from 4
          cellPadding: 0.8, // Increased from 0.5
          lineWidth: 0.15,
          fillColor: [255, 248, 220],
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [100, 149, 237],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7, // Increased from 4.5
        },
        columnStyles: {
          0: { cellWidth: 28, halign: "left" }, // Increased from 22
          1: { cellWidth: 14, halign: "center" }, // Increased from 10
          2: { cellWidth: 14, halign: "center" }, // Increased from 10
          3: { cellWidth: 14, halign: "center" }, // Increased from 10
          4: { cellWidth: 14, halign: "center" }, // Increased from 10
        },
        margin: { left: margin + leftTableWidth + gap, right: margin },
      });

      y = Math.max(coursesEndY, (doc as any).lastAutoTable.finalY) + 4;

      // Status line
      doc.setFontSize(7); // Increased from 4.5
      doc.setFont("helvetica", "bold");
      doc.text(`Status: Pass | Status Description: Very Good`, margin, y);
      y += 3;

      // Grading Scale - Single line
      doc.setFontSize(5); // Increased from 3.5
      doc.setFont("helvetica", "normal");
      doc.text("Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass, F=Fail", 
        margin, y, { maxWidth: pageWidth - margin * 2 });
      y += 3;

      // Footer Note
      doc.setFontSize(5); // Increased from 3.5
      doc.setTextColor(100, 100, 100);
      doc.text('"Course Repeated", "Courses Taken from other university/College", DATE ISSUE & [Date]', margin, y);
      y += 4;

      // Signatures
      doc.setFontSize(7); // Increased from 4.5
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("REGISTRAR:", margin, y);
      doc.text("DEAN/VICE DEAN:", pageWidth / 2 + 15, y);

      doc.setFont("helvetica", "normal");
      doc.text("__________", margin + 20, y);
      doc.text("__________", pageWidth / 2 + 40, y);
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
    const margin = 5;
    const columnWidth = (pageWidth - margin * 2.5) / 2;

    realTranscripts.forEach((transcript, index) => {
      if (index > 0) doc.addPage();

      let y = margin + 2;

      // Header with logo
      try {
        doc.addImage(LOGO_BASE64, "PNG", 70, y + 5, 10, 10);
      } catch (e) {
        console.warn("Logo failed to load in PDF", e);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DEUTSCHE HOCHSCHULE FÜR MEDIZIN", pageWidth / 2, y + 4, { align: "center" });

      doc.setFontSize(9);
      doc.text("STUDENT ACADEMIC RECORD", pageWidth / 2, y + 8, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICE OF THE REGISTRAR", pageWidth / 2, y + 12, { align: "center" });

      if (transcript.dateIssuedGC) {
        doc.setFontSize(7);
        doc.text(`Issued: ${transcript.dateIssuedGC}`, pageWidth / 2, y + 16, { align: "center" });
        y += 18;
      } else {
        y += 16;
      }

      // Student Info Table - Full labels as requested
        const tableWidth = 130; 
        const centerX = (pageWidth - tableWidth) / 2;

        autoTable(doc, {
          startY: y,
          body: [
            ["ID Number", transcript.idNumber || "", "Birth Date", transcript.birthDateGC || ""],
            ["Full Name", transcript.fullName?.substring(0, 25) || "", "Enrolment Type", transcript.programModality?.name?.substring(0, 10) || "-"],
            ["Sex", transcript.gender || "", "Department", transcript.department?.name?.substring(0, 15) || "-"],
            ["Program", transcript.programLevel?.name?.substring(0, 10) || "-", "Field of Study", transcript.department?.name?.substring(0, 15) || "-"],
            ["Date Of Admission", transcript.dateEnrolledGC || "", "Date Issued", transcript.dateIssuedGC || ""],
          ],
          theme: "grid",
          styles: { fontSize: 6, cellPadding: 1, lineWidth: 0.1, textColor: [0, 0, 0], halign: "center" },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 25, fillColor: [235, 245, 255], halign: "left" },
            1: { cellWidth: 40, halign: "left" },
            2: { fontStyle: "bold", cellWidth: 25, fillColor: [235, 245, 255], halign: "left" },
            3: { cellWidth: 40, halign: "left" },
          },
          margin: { left: centerX },
        });

      y = (doc as any).lastAutoTable.finalY + 4;

      // Process semesters in pairs
      for (let i = 0; i < transcript.studentCopies.length; i += 2) {
        let leftStartY = y;
        let rightStartY = y;

        // Left semester
        const leftCopy = transcript.studentCopies[i];
        if (leftCopy) {
          let currentY = leftStartY;
          const headerWidth = columnWidth * 0.82;
          // Semester header - centered with full text
          doc.setFillColor(255, 140, 0);
          doc.rect(margin, currentY - 2, headerWidth, 4, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(5);
          doc.setFont("helvetica", "bold");
          const headerText = `${leftCopy.academicYear || "2024G.C/2016ec"} • Year ${leftCopy.classyear?.name || "I"} • ${leftCopy.semester?.name || "First Semester"}`;
          doc.text(headerText, margin + headerWidth / 2, currentY, { align: "center" });
          currentY += 3;
          doc.setTextColor(0, 0, 0);

          // Courses table
          const coursesData = leftCopy.courses.map((c, j) => [
            (j + 1).toString(),
            c.courseCode?.substring(0, 15) || "",
            c.courseTitle?.substring(0, 40) || "",
            c.totalCrHrs?.toFixed(2) || "0",
            c.letterGrade || "",
            c.gradePoint?.toFixed(2) || "0",
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Code", "Title", "CH", "Gr", "Pt"]],
            body: coursesData,
            theme: "grid",
            styles: { fontSize: 4.5, cellPadding: 0.5, lineWidth: 0.05, textColor: [0, 0, 0], overflow: 'linebreak' },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 5,
            },
            columnStyles: {
              0: { cellWidth: 3, halign: "center" },
              1: { cellWidth: 18 },
              2: { cellWidth: 35 },
              3: { cellWidth: 10, halign: "center" },
              4: { cellWidth: 5, halign: "center" },
              5: { cellWidth: 10, halign: "center" },
            },
            margin: { left: margin, right: pageWidth - margin - columnWidth },
          });

          currentY = (doc as any).lastAutoTable.finalY + 2;

          // Summary stats - increased font size and moved down
          doc.setFillColor(255, 140, 0);
          doc.rect(margin, currentY, headerWidth, 3.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6); // Increased font size
          doc.setFont("helvetica", "bold");
          doc.text(`SGPA:${leftCopy.semesterGPA.toFixed(2)}  CGPA:${leftCopy.semesterCGPA.toFixed(2)}  Status:${leftCopy.status}`, margin + 1, currentY + 2);
          currentY += 4;
          doc.setTextColor(0, 0, 0);

          leftStartY = currentY;
        }

        // Right semester
        const rightCopy = transcript.studentCopies[i + 1];
        if (rightCopy) {
          let currentY = rightStartY;
          const rightX = pageWidth / 2 + margin / 2;
          const headerWidth = columnWidth * 0.82;

          // Semester header - centered with full text
          doc.setFillColor(255, 140, 0);
          doc.rect(rightX, currentY - 2, headerWidth, 4, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(5);
          doc.setFont("helvetica", "bold");
          const headerText = `${rightCopy.academicYear || "2024G.C/2016ec"} • Year ${rightCopy.classyear?.name || "I"} • ${rightCopy.semester?.name || "First Semester"}`;
          doc.text(headerText, rightX + headerWidth/2, currentY, { align: "center" });
          currentY += 3;
          doc.setTextColor(0, 0, 0);

          // Courses table
          const coursesData = rightCopy.courses.map((c, j) => [
            (j + 1).toString(),
            c.courseCode?.substring(0, 15) || "",
            c.courseTitle?.substring(0, 40) || "",
            c.totalCrHrs?.toFixed(2) || "0",
            c.letterGrade || "",
            c.gradePoint?.toFixed(2) || "0",
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Code", "Title", "CH", "Gr", "Pt"]],
            body: coursesData,
            theme: "grid",
            styles: { fontSize: 4.5, cellPadding: 0.5, lineWidth: 0.05, textColor: [0, 0, 0], overflow: 'linebreak' },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 5,
            },
            columnStyles: {
              0: { cellWidth: 3, halign: "center" },
              1: { cellWidth: 18 },
              2: { cellWidth: 35 },
              3: { cellWidth: 10, halign: "center" },
              4: { cellWidth: 5, halign: "center" },
              5: { cellWidth: 10, halign: "center" },
            },
            margin: { left: rightX, right: margin },
          });

          currentY = (doc as any).lastAutoTable.finalY + 2;
        
          // Summary stats - increased font size and moved down
          doc.setFillColor(255, 140, 0);
          doc.rect(rightX, currentY, headerWidth, 3.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6); // Increased font size
          doc.setFont("helvetica", "bold");
          doc.text(`SGPA:${rightCopy.semesterGPA.toFixed(2)}  CGPA:${rightCopy.semesterCGPA.toFixed(2)}  Status:${rightCopy.status}`, rightX + 1, currentY + 2);
          currentY += 4;
          doc.setTextColor(0, 0, 0);

          rightStartY = currentY;
        }

        y = Math.max(leftStartY, rightStartY) + 2;

        // Draw horizontal separator line after each semester pair
          doc.setDrawColor(180, 180, 180); // light gray (optional)
          doc.setLineWidth(0.3);

          doc.line(
            margin,                 // start X (left margin)
            y,                      // start Y
            pageWidth - margin,     // end X (right margin)
            y                       // end Y (same Y → horizontal line)
          );

          // add space after the line
          y += 4;
      }

      // Signatures - moved down to prevent overlap
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }

      y += 5; // Add extra space before signatures

      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);
      doc.text("______________________________", pageWidth * 0.25, y, { align: "center" });
      doc.text("______________________________", pageWidth * 0.75, y, { align: "center" });
      y += 2;
      doc.setFontSize(5);
      doc.text("Registrar", pageWidth * 0.25, y + 3, { align: "center" });
      doc.text("Dean", pageWidth * 0.75, y + 3, { align: "center" });
      y += 10;
      doc.text("Date: ___________________", pageWidth * 0.25, y, { align: "center" });
      doc.text("Date: ___________________", pageWidth * 0.75, y, { align: "center" });
 
      y += 10;
          // Grading Scale - Single line
              doc.setFontSize(6);
              doc.setFont("helvetica", "normal");

              doc.text(
                "Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass, F=Fail",
                pageWidth / 2,
                y,
                {
                  align: "center",
                  maxWidth: pageWidth - margin * 2
                }
              );

              y += 5;

      // Footer Note
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        doc.text(
          '"Course Repeated", "Courses Taken from other university/College", DATE ISSUE & [Date]',
          pageWidth / 2,
          y,
          { align: "center" }
        );

        y += 4;
    });
     
    doc.save("Student_Transcript.pdf");
  };

  // ========== EXCEL GENERATION ==========
  const exportStudentCopyToExcel = () => {
    if (realReports.length === 0) {
      alert("No data available to export. Generate reports first.");
      return;
    }

    const wb = XLSX.utils.book_new();

    realReports.forEach((report, index) => {
      const copy = report.studentCopies[0];
      if (!copy) return;

      const sheetData: any[][] = [];

      // Header
      sheetData.push(["MD1_[PC_I]"]);
      sheetData.push(["DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE"]);
      sheetData.push(["STUDENT ACADEMIC RECORD"]);
      sheetData.push([]);

      // Student Info
      sheetData.push(["ID Number", report.idNumber || "", "Date Of Admission", report.dateEnrolledGC || ""]);
      sheetData.push(["Name of Student", report.fullName || "", "Enrolment Type", report.programModality?.name || "Regular"]);
      sheetData.push(["Sex", report.gender || "", "Department", report.department?.name || ""]);
      sheetData.push(["Program", report.programLevel?.name || "Degree", "Field of Study", report.department?.name || ""]);
      sheetData.push(["Date Of Birth", report.birthDateGC || "", "Date Issued", report.dateIssuedGC || ""]);
      sheetData.push([]);

      // Academic Year
      sheetData.push([`Academic Year: ${copy.academicYear || "2023/24G.C/2016ec"}   Class Year: ${copy.classyear?.name || "II"}   Semester: ${copy.semester?.name || "I"}   MRT_121`]);
      sheetData.push([]);

      // Courses Table Header
      sheetData.push(["Course Title", "Course Code", "Cr.Hr.", "Letter Grade", "Gr.Point"]);

      // Courses Data
      copy.courses.forEach((c) => {
        sheetData.push([
          c.courseTitle || "",
          c.courseCode || "",
          c.totalCrHrs?.toFixed(2) || "0.00",
          c.letterGrade || "",
          c.gradePoint?.toFixed(2) || "0.00",
        ]);
      });

      // Totals
      const totalCr = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
      const totalPoint = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
      sheetData.push([]);
      sheetData.push(["Total:", "", totalCr.toFixed(2), "GR:", totalPoint.toFixed(2), "F=Below 40"]);
      sheetData.push([]);

      // Summary Table
      const prevTotalCredit = 44.00;
      const prevTotalGP = 176.00;
      const cumulativeCredit = prevTotalCredit + totalCr;
      const cumulativeGP = prevTotalGP + totalPoint;

      sheetData.push(["Summary", "Credit", "GP", "ANG", "ALG"]);
      sheetData.push(["Previous TOTAL", prevTotalCredit.toFixed(2), prevTotalGP.toFixed(2), "4.00", "A"]);
      sheetData.push(["Semestre TOTAL", totalCr.toFixed(2), totalPoint.toFixed(2), copy.semesterGPA?.toFixed(2) || "3.80", "A"]);
      sheetData.push(["Cumulative", cumulativeCredit.toFixed(2), cumulativeGP.toFixed(2), (cumulativeGP / cumulativeCredit).toFixed(2), "A"]);
      sheetData.push([]);

      // Status
      sheetData.push(["Status: Pass", "", "Status Description: Very Good"]);
      sheetData.push([]);

      // Grading System
      sheetData.push(["Grading System:"]);
      sheetData.push(["A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete"]);
      sheetData.push(["A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass Mark, F=Fail"]);
      sheetData.push([]);

      // Footer Note
      sheetData.push(['"Course Repeated", "Courses Taken from other university/College", DATE ISSUE & [Date]']);
      sheetData.push([]);

      // Signatures
      sheetData.push(["REGISTRAR: _________________________", "", "", "DEAN/VICE DEAN: _________________________"]);

      const sheetName = `${report.idNumber || `Student_${index + 1}`}`.slice(0, 31);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws['!cols'] = [
        { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, "Student_Academic_Records.xlsx");
  };

  const exportTranscriptToExcel = () => {
    if (realTranscripts.length === 0) {
      alert("No data available to export. Generate transcripts first.");
      return;
    }

    const wb = XLSX.utils.book_new();

    realTranscripts.forEach((transcript, index) => {
      const sheetData: any[][] = [];

      // Header
      sheetData.push(["DEUTSCHE HOCHSCHULE FÜR MEDIZIN"]);
      sheetData.push(["STUDENT ACADEMIC TRANSCRIPT"]);
      sheetData.push(["OFFICE OF THE REGISTRAR"]);
      if (transcript.dateIssuedGC) {
        sheetData.push([`Issued on: ${transcript.dateIssuedGC}`]);
      }
      sheetData.push([]);

      // Student Info
      sheetData.push(["ID Number:", transcript.idNumber, "Date of Admission:", transcript.dateEnrolledGC]);
      sheetData.push(["Full Name:", transcript.fullName, "Program Modality:", transcript.programModality?.name || "-"]);
      sheetData.push(["Sex:", transcript.gender, "Field of Study:", transcript.department?.name || "-"]);
      sheetData.push(["Date Of Birth:", transcript.birthDateGC, "Level:", transcript.programLevel?.name || "-"]);
      sheetData.push([]);

      // Semesters
      transcript.studentCopies.forEach((copy) => {
        sheetData.push([`Academic Year: ${copy.academicYear || "N/A"}   Class Year: ${copy.classyear?.name || "N/A"}`]);
        sheetData.push([`Semester: ${copy.semester?.name || "N/A"}`]);
        sheetData.push([]);
        sheetData.push(["No", "Code", "Course Title", "Cr.Hr", "Letter Grade", "Gr Point"]);

        copy.courses.forEach((course, i) => {
          sheetData.push([
            (i + 1).toString(),
            course.courseCode,
            course.courseTitle,
            course.totalCrHrs.toFixed(2),
            course.letterGrade,
            course.gradePoint.toFixed(2),
          ]);
        });

        const totalCH = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
        const totalPoints = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
        sheetData.push([`TOTAL Cr.Hr: ${totalCH.toFixed(2)}   Points: ${totalPoints.toFixed(2)}   SGPA: ${copy.semesterGPA.toFixed(2)}`]);
        sheetData.push([]);
      });

      // Signatures
      sheetData.push(["_________________________________________", "", "_________________________________________"]);
      sheetData.push(["Registrar / Office of the Registrar", "", "Dean Office"]);
      sheetData.push(["Date: ____________________", "", "Date: ____________________"]);

      const sheetName = `${transcript.idNumber || `Transcript_${index + 1}`}`.slice(0, 31);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      ws['!cols'] = [
        { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, "Student_Transcripts.xlsx");
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
          table { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid black; }
          th, td { border: 1px solid black; padding: 6px; text-align: left; color: black; }
          th { background-color: #6495ED; color: white; font-weight: bold; text-align: center; }
          .student-info td:first-child, .student-info td:nth-child(3) { background-color: #FFFFE0; font-weight: bold; color: black; }
          .summary td { background-color: #FFF8DC; color: black; }
          .total-line { font-weight: bold; text-align: right; margin-top: 5px; color: black; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; color: black; }
          .grading-scale { font-size: 11px; margin-top: 10px; color: black; }
          .status { font-weight: bold; margin: 10px 0; color: black; }
          .footer-note { font-size: 11px; margin-top: 10px; color: #666; }
        </style>
      </head>
      <body>
    `;

    realReports.forEach((report) => {
      const copy = report.studentCopies[0];
      if (!copy) return;

      const totalCr = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
      const totalPoint = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
      const prevTotalCredit = 44.00;
      const prevTotalGP = 176.00;
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
            <tr><td>ID Number</td><td>${report.idNumber || ''}</td><td>Date Of Admission</td><td>${report.dateEnrolledGC || ''}</td></tr>
            <tr><td>Name of Student</td><td>${report.fullName || ''}</td><td>Enrolment Type</td><td>${report.programModality?.name || 'Regular'}</td></tr>
            <tr><td>Sex</td><td>${report.gender || ''}</td><td>Department</td><td>${report.department?.name || ''}</td></tr>
            <tr><td>Program</td><td>${report.programLevel?.name || 'Degree'}</td><td>Field of Study</td><td>${report.department?.name || ''}</td></tr>
            <tr><td>Date Of Birth</td><td>${report.birthDateGC || ''}</td><td>Date Issued</td><td>${report.dateIssuedGC || ''}</td></tr>
          </table>

          <div style="font-weight: bold; margin: 10px 0; color: black;">
            Academic Year: ${copy.academicYear || '2023/24G.C/2016ec'}   Class Year: ${copy.classyear?.name || 'II'}   Semester: ${copy.semester?.name || 'I'}   MRT_121
          </div>

          <table>
            <thead><tr><th>Course Title</th><th>Course Code</th><th>Cr.Hr.</th><th>Letter Grade</th><th>Gr.Point</th></tr></thead>
            <tbody>
              ${copy.courses.map(c => `
                <tr>
                  <td>${c.courseTitle || ''}</td>
                  <td>${c.courseCode || ''}</td>
                  <td style="text-align: center">${(c.totalCrHrs || 0).toFixed(2)}</td>
                  <td style="text-align: center; font-weight: bold; color: blue;">${c.letterGrade || ''}</td>
                  <td style="text-align: center">${(c.gradePoint || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-line">Total: ${totalCr.toFixed(2)}   GR: ${totalPoint.toFixed(2)}   F=Below 40</div>

          <table class="summary">
            <thead><tr><th>Summary</th><th>Credit</th><th>GP</th><th>ANG</th><th>ALG</th></tr></thead>
            <tbody>
              <tr><td>Previous TOTAL</td><td>${prevTotalCredit.toFixed(2)}</td><td>${prevTotalGP.toFixed(2)}</td><td>4.00</td><td>A</td></tr>
              <tr><td>Semestre TOTAL</td><td>${totalCr.toFixed(2)}</td><td>${totalPoint.toFixed(2)}</td><td>${(copy.semesterGPA || 3.80).toFixed(2)}</td><td>A</td></tr>
              <tr><td>Cumulative</td><td>${cumulativeCredit.toFixed(2)}</td><td>${cumulativeGP.toFixed(2)}</td><td>${(cumulativeGP / cumulativeCredit).toFixed(2)}</td><td>A</td></tr>
            </tbody>
          </table>

          <div class="status">Status: Pass   Status Description: Very Good</div>

          <div class="grading-scale">
            Grading System: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete<br>
            A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass Mark, F=Fail
          </div>

          <div class="footer-note">
            "Course Repeated", "Courses Taken from other university/College", DATE ISSUE & [Date]
          </div>

          <div class="signature">
            <div>REGISTRAR: _________________________</div>
            <div>DEAN/VICE DEAN: _________________________</div>
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
            ${transcript.dateIssuedGC ? `<div>Issued on: ${transcript.dateIssuedGC}</div>` : ''}
          </div>

          <table class="student-info">
            <tr><td><strong>ID Number</strong></td><td>${transcript.idNumber}</td><td><strong>Birth Date</strong></td><td>${transcript.birthDateGC}</td></tr>
            <tr><td><strong>Full Name</strong></td><td>${transcript.fullName}</td><td><strong>Enrolment Type</strong></td><td>${transcript.programModality?.name || '-'}</td></tr>
            <tr><td><strong>Sex</strong></td><td>${transcript.gender}</td><td><strong>Department</strong></td><td>${transcript.department?.name || '-'}</td></tr>
            <tr><td><strong>Program</strong></td><td>${transcript.programLevel?.name || '-'}</td><td><strong>Field of Study</strong></td><td>${transcript.department?.name || '-'}</td></tr>
            <tr><td><strong>Date Of Admission</strong></td><td>${transcript.dateEnrolledGC}</td><td><strong>Date Issued</strong></td><td>${transcript.dateIssuedGC || ''}</td></tr>
          </table>

          ${transcript.studentCopies.map(copy => {
            return `
              <div class="semester-header" style="text-align: center;">
                ${copy.academicYear || '2024G.C/2016ec'} • Year ${copy.classyear?.name || 'I'} • ${copy.semester?.name || 'First Semester'}
              </div>
              <table>
                <thead><tr><th>No</th><th>Code</th><th>Course Title</th><th>CH</th><th>Grade</th><th>Point</th></tr></thead>
                <tbody>
                  ${copy.courses.map((c, i) => `
                    <tr>
                      <td style="text-align: center">${i + 1}</td>
                      <td>${c.courseCode}</td>
                      <td>${c.courseTitle}</td>
                      <td style="text-align: center">${c.totalCrHrs.toFixed(2)}</td>
                      <td style="text-align: center; font-weight: bold; color: blue;">${c.letterGrade}</td>
                      <td style="text-align: center">${c.gradePoint.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="background-color: #FF8C00; color: white; padding: 4px; font-size: 11px; text-align: right; margin-bottom: 15px; margin-top: 5px;">
                SGPA: ${copy.semesterGPA.toFixed(2)} | CGPA: ${copy.semesterCGPA.toFixed(2)} | Status: ${copy.status}
              </div>
            `;
          }).join('')}

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
          <div className="flex gap-2">
            <button
              onClick={isReport ? exportStudentCopyToPDF : exportTranscriptToPDF}
              disabled={isReport ? realReports.length === 0 : realTranscripts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download size={18} /> PDF
            </button>
            <button
              onClick={isReport ? exportStudentCopyToExcel : exportTranscriptToExcel}
              disabled={isReport ? realReports.length === 0 : realTranscripts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Download size={18} /> Excel
            </button>
            <button
              onClick={isReport ? printStudentCopy : printTranscript}
              disabled={isReport ? realReports.length === 0 : realTranscripts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {isReport ? "Select Students for Grade Report" : "Select Students for Transcript"}
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
              {filteredStudents.every((s) => selectedStudents.includes(s.studentId))
                ? "Deselect All"
                : "Select All Visible"}
            </button>
          </div>

          {isReport && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Semester</label>
                <select
                  value={selectedSemesterId}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-900 dark:text-white">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem.academicPeriodCode} value={sem.academicPeriodCode} className="text-gray-900 dark:text-white">
                      {sem.academicPeriodCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Class Year</label>
                <select
                  value={selectedClassYearId}
                  onChange={(e) => setSelectedClassYearId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="" className="text-gray-900 dark:text-white">Select Class Year</option>
                  {classYears.map((cy) => (
                    <option key={cy.id} value={cy.id} className="text-gray-900 dark:text-white">
                      {cy.classYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected: <span className="text-blue-600 dark:text-blue-400">{selectedCount}</span> student{selectedCount !== 1 ? "s" : ""}
            </div>
            <button
              onClick={isReport ? handleGenerateReports : handleGenerateTranscripts}
              disabled={selectedStudents.length === 0 || (isReport && (!selectedSemesterId || !selectedClassYearId)) || loadingReports}
              className={`px-6 py-2 rounded-lg font-bold text-white shadow transition ${
                selectedStudents.length === 0 || (isReport && (!selectedSemesterId || !selectedClassYearId)) || loadingReports
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
              ) : (
                isReport ? "Generate Student Copies" : "Generate Transcripts"
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
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading students...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Select</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">ID</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Name</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Department</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-200 font-semibold">Batch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          selectedStudents.includes(student.studentId)
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : 'bg-white dark:bg-gray-800'
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
                        <td className="p-3 font-mono text-gray-700 dark:text-gray-300">{student.username}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{student.fullNameENG}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{student.departmentName}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{student.bcysDisplayName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generated Reports Section with improved visibility */}
        {isReport && realReports.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Reports</h3>
            {realReports.map((report, index) => (
              <StudentCopyView key={index} report={report} />
            ))}
          </div>
        )}

        {!isReport && realTranscripts.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Transcripts</h3>
            {realTranscripts.map((transcript, index) => (
              <TranscriptView key={index} transcript={transcript} />
            ))}
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
    if (!academicYear) return "2023/24G.C/2016ec";
    if (typeof academicYear === 'string') return academicYear;
    if (typeof academicYear === 'object') {
      return academicYear.yearCode || academicYear.yearGC || "2023/24G.C/2016ec";
    }
    return "2023/24G.C/2016ec";
  };

  const totalCr = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
  const totalPoint = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
  const prevTotalCredit = 44.00;
  const prevTotalGP = 176.00;
  const cumulativeCredit = prevTotalCredit + totalCr;
  const cumulativeGP = prevTotalGP + totalPoint;
  const academicYearStr = getAcademicYearString(copy.academicYear);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-yellow-400 dark:bg-yellow-500 p-3 relative">
        <div className="text-center">
          <div className="font-bold text-lg text-gray-900 dark:text-gray-900">MD1_[PC_I]</div>
          <div className="text-xs text-gray-800 dark:text-gray-800">DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE</div>
          <div className="font-bold text-base mt-1 text-gray-900 dark:text-gray-900">STUDENT ACADEMIC RECORD</div>
        </div>
      </div>

      <div className="p-3">
        {/* 6-Column Student Info Table */}
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">ID Number</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600 w-1/6">{report.idNumber}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">Date Of Admission</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600 w-1/6">{report.dateEnrolledGC}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600 w-1/6">Date Of Birth</td>
              <td className="p-1 w-1/6">{report.birthDateGC}</td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Name of Student</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.fullName}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Enrolment Type</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.programModality?.name || "Regular"}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Date Issued</td>
              <td className="p-1">{report.dateIssuedGC}</td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Sex</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.gender}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Department</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.department?.name}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600"></td>
              <td className="p-1"></td>
            </tr>
            <tr className="border border-gray-300 dark:border-gray-600">
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Program</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.programLevel?.name || "Degree"}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600">Field of Study</td>
              <td className="p-1 border-r border-gray-300 dark:border-gray-600">{report.department?.name}</td>
              <td className="p-1 bg-yellow-100 dark:bg-yellow-900/40 font-bold border-r border-gray-300 dark:border-gray-600"></td>
              <td className="p-1"></td>
            </tr>
          </tbody>
        </table>

        <div className="font-bold mt-2 mb-1 text-xs text-gray-900 dark:text-white">
          Academic Year: {academicYearStr}   Class Year: {copy.classyear?.name || "II"}   Semester: {copy.semester?.name || "I"}   MRT_121
        </div>

        {/* Side-by-side tables */}
        <div className="flex gap-2 mt-1">
          {/* Courses Table */}
          <div className="w-2/3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-500 dark:bg-blue-600 text-white">
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-left">Course Title</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">Code</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">Cr.Hr.</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">Grade</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">Point</th>
                </tr>
              </thead>
              <tbody>
                {copy.courses.map((c, i) => (
                  <tr key={i} className="border border-gray-300 dark:border-gray-600">
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600">{c.courseTitle}</td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center">{c.courseCode}</td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center">{(c.totalCrHrs || 0).toFixed(2)}</td>
                    <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center font-bold text-blue-600 dark:text-blue-400">{c.letterGrade}</td>
                    <td className="p-1 text-center text-gray-900 dark:text-gray-300">{(c.gradePoint || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-xs mt-1 text-gray-900 dark:text-white">
              Total: {totalCr.toFixed(2)} | GR: {totalPoint.toFixed(2)} | F=Below 40
            </div>
          </div>

          {/* Summary Table - FIXED DARK MODE BACKGROUND */}
          <div className="w-1/3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-500 dark:bg-blue-600 text-white">
                  <th className="p-1 border border-gray-300 dark:border-gray-600">Summary</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">Credit</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">GP</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">ANG</th>
                  <th className="p-1 border border-gray-300 dark:border-gray-600 text-center">ALG</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">Previous</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{prevTotalCredit.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{prevTotalGP.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">4.00</td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">A</td>
                </tr>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">Semestre</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{totalCr.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{totalPoint.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{(copy.semesterGPA || 3.80).toFixed(2)}</td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">A</td>
                </tr>
                <tr className="border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/60">
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-white">Cumulative</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{cumulativeCredit.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{cumulativeGP.toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white">{(cumulativeGP / cumulativeCredit).toFixed(2)}</td>
                  <td className="p-1 text-center text-gray-900 dark:text-white">A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="font-bold mt-2 text-xs text-gray-900 dark:text-white">
          Status: Pass | Status Description: Very Good
        </div>

        <div className="text-[10px] mt-1 text-gray-600 dark:text-gray-400 leading-tight">
          Grading: A+,A=4, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, F=0.00, I=Incomplete | A=Excellent, B+=Good, C+=Satisfactory, C=Fair, D=Below Pass, F=Fail
        </div>

        <div className="text-[10px] mt-1 text-gray-500 dark:text-gray-500">
          "Course Repeated", "Courses Taken from other university/College", DATE ISSUE & [Date]
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-900 dark:text-white">
          <div><span className="font-bold">REGISTRAR:</span> __________</div>
          <div><span className="font-bold">DEAN/VICE DEAN:</span> __________</div>
        </div>
      </div>
    </div>
  );
}

// ===== TRANSCRIPT VIEW COMPONENT (without FINAL CGPA) =====
function TranscriptView({ transcript }: { transcript: RealTranscript }) {
  // Helper function to safely get academic year string
  const getAcademicYearString = (academicYear: any): string => {
    if (!academicYear) return "2024G.C/2016ec";
    if (typeof academicYear === 'string') return academicYear;
    if (typeof academicYear === 'object') {
      // If it's an object with yearCode or yearGC properties
      return academicYear.yearCode || academicYear.yearGC || "2024G.C/2016ec";
    }
    return "2024G.C/2016ec";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
      <div className="flex items-center mb-6">
        <img src="/assets/companylogo.jpg" alt="College Logo" className="w-12 h-12 mr-4" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">DEUTSCHE HOCHSCHULE FÜR MEDIZIN</h2>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">STUDENT ACADEMIC RECORD</h3>
          <p className="font-bold text-gray-700 dark:text-gray-300">OFFICE OF THE REGISTRAR</p>
          {transcript.dateIssuedGC && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Issued on: {transcript.dateIssuedGC}</p>
          )}
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white w-1/4 border-r border-gray-300 dark:border-gray-600">ID Number</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 w-1/4 border-r border-gray-300 dark:border-gray-600">{transcript.idNumber}</td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white w-1/4 border-r border-gray-300 dark:border-gray-600">Birth Date</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 w-1/4">{transcript.birthDateGC}</td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Full Name</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">{transcript.fullName}</td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Enrolment Type</td>
            <td className="p-2 text-gray-700 dark:text-gray-300">{transcript.programModality?.name || '-'}</td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Sex</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">{transcript.gender}</td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Department</td>
            <td className="p-2 text-gray-700 dark:text-gray-300">{transcript.department?.name || '-'}</td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Program</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">{transcript.programLevel?.name || '-'}</td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Field of Study</td>
            <td className="p-2 text-gray-700 dark:text-gray-300">{transcript.department?.name || '-'}</td>
          </tr>
          <tr className="border border-gray-300 dark:border-gray-600">
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Date of Admission</td>
            <td className="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">{transcript.dateEnrolledGC}</td>
            <td className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">Date Issued</td>
            <td className="p-2 text-gray-700 dark:text-gray-300">{transcript.dateIssuedGC}</td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {transcript.studentCopies.map((copy, idx) => {
          const academicYearStr = getAcademicYearString(copy.academicYear);
          const semesterName = copy.semester?.name || "First Semester";
          const classYearName = copy.classyear?.name || "I";
          
          return (
            <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
              <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-sm">
                {academicYearStr} • Year {classYearName} • {semesterName}
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">No</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">Code</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">Title</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">CH</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">Grade</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">Point</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.courses.map((c, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">{i + 1}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">{c.courseCode}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300">{c.courseTitle}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">{c.totalCrHrs.toFixed(2)}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-bold text-blue-600 dark:text-blue-400">{c.letterGrade}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs text-gray-700 dark:text-gray-300">{c.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-orange-500 dark:bg-orange-600 text-white px-3 py-3 text-xs" style={{ marginTop: '2px' }}>
                SGPA: {copy.semesterGPA.toFixed(2)} | CGPA: {copy.semesterCGPA.toFixed(2)} | Status: {copy.status}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t-2 border-gray-400 dark:border-gray-600">
        <div className="text-center">
          <div className="border-b-2 border-black dark:border-gray-300 w-48 mx-auto mb-2"></div>
          <p className="font-bold text-gray-900 dark:text-white">Registrar</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Date: ________</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-black dark:border-gray-300 w-48 mx-auto mb-2"></div>
          <p className="font-bold text-gray-900 dark:text-white">Dean</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Date: ________</p>
        </div>
      </div>
    </div>
  );
}