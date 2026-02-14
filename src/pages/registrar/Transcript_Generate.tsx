"use client";
import * as XLSX from "xlsx";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ScrollText,
  FileText,
  ArrowLeft,
  Download,
  CheckSquare, 
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import { Square } from "lucide-react";
import { Loader2 } from "lucide-react";
import LOGO_BASE64 from "@/components/Extra/LOGO_BASE64";
type ReportCourse = {
  code: string;
  title: string;
  credit: number;
  grade: string;
  point: number;
  gp: number;
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
type ReportRecord = {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  admissionDate: string;
  program: string;
  academicYear: string;
  semester: string;
  classYear: string;
  enrollmentStatus: string;
  cgpa: number;
  earnedCredits: number;
  courses: ReportCourse[];
  batch: string;
  department: string;
};
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
  code: string;
  title: string;
  ch: number;
  grade: string;
  point: number;
};

type TranscriptSemester = {
  year: string;
  semester: string;
  courses: TranscriptCourse[];
  totalCH: number;
  totalPoint: number;
  gpa: number;
};

type TranscriptRecord = {
  student: {
    id: string;
    name: string;
    gender: string;
    dob: string;
    program: string;
    faculty: string;
    admissionDate: string;
    batch: string;
    department: string;
  };
  semesters: TranscriptSemester[];
};

type SearchType = "report" | "transcript";
type GradeInterval = {
  id: number;
  description: string;
  min: number;
  max: number;
  givenValue: number;
  gradeLetter: string;
};

type GradingSystem = {
  versionName: string;
  departmentId: string;
  remark: string;
  intervals: GradeInterval;
};
export default function Transcript_Generate() {
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [loadingStudentCopy, setLoadingStudentCopy] = useState(false);
  const [realReports, setRealReports] = useState<RealGradeReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all"); 
  const [selectedDropDown, setSelectedDropDown] = useState([]);
  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>(
    []
  );
  const [classYears, setClassYears] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [gradingSystems, setGradingSystem] = useState<GradingSystem[]>([]);
  const [Error, setError] = useState<string | null>(null);
  const [batch, setBatches] = useState([]);
  const [deparment, setDepartment] = useState([]);
  const [studentReport, setStudentReport] = useState([]);
  const [studentReport1, setStudentReport1] = useState();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedClassYearId, setSelectedClassYearId] = useState<string>("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [allStudents, setAllStudents] = useState<StudentForSelection[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [manyGradingSystem, setManyGradingSystem] = useState<string>("all");
  const [realTranscripts, setRealTranscripts] = useState<RealGradeReport[]>([]);

  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  useEffect(() => {
    const fetchGradingSystem = async () => {
      try {
        const response = await apiService.get(endPoints.gradingSystem);

        setGradingSystem(response);
        console.log(response);
        // setManyGradingSystem(response.map((e) => e.versionName));
      } catch (error) {
        console.error("Failed to fetch Grading System:", error);
        setError("Failed to load Grading System. Please try again later.");
      }
    };
    const fetchBatches = async () => {
      try {
        const response = await apiService.get(endPoints.batches);

        setBatches(response);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch Batches:", error);
        setError("Failed to load Batches. Please try again later.");
      }
    };
    const fetchDepartment = async () => {
      try {
        const deparments = await apiService.get(endPoints.departments);
        setDepartment(deparments);
      } catch (error) {
        console.error("Failed to fetch Depatments:", error);
        setError("Failed to load Departments. Please try again later.");
      }
    };
    fetchDepartment();
    fetchGradingSystem();
    fetchBatches();
  }, []);
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        // Adjust these endpoints based on your actual API
        const [semesterRes, classYearRes] = await Promise.all([
          apiService.get(endPoints.semesters || "/api/semesters"), 
          apiService.get(endPoints.classYears || "/api/class-years"), 
        ]);
        console.log(semesterRes, classYearRes);
        setSemesters(semesterRes || []);
        setClassYears(classYearRes || []);
      } catch (err) {
        console.error("Failed to load semesters/class years:", err);
        setError("Failed to load semester or class year options.");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);
  const baseReport: ReportRecord = {
    id: "DHMC/MRT-1821-16",
    name: "Aisha Mohammed Ali",
    gender: "Female",
    dateOfBirth: "15 March 2000",
    admissionDate: "September 2016",
    program: "Medical Radiology Technology",
    academicYear: "2024/2025",
    semester: "Second Semester",
    classYear: "Level 400",
    enrollmentStatus: "Regular",
    cgpa: 3.91,
    earnedCredits: 142.0,
    batch: "2024/2025",
    department: "Radiology",
    courses: [
      {
        code: "ANAT 421",
        title: "Anatomy IV",
        credit: 4.0,
        grade: "A",
        point: 4.0,
        gp: 16.0,
      },
      {
        code: "PHYS 423",
        title: "Physics IV",
        credit: 3.0,
        grade: "A-",
        point: 3.7,
        gp: 11.1,
      },
      {
        code: "BIO 424",
        title: "Biochemistry",
        credit: 3.0,
        grade: "B+",
        point: 3.3,
        gp: 9.9,
      },
      {
        code: "MICR 425",
        title: "Microbiology",
        credit: 3.0,
        grade: "A",
        point: 4.0,
        gp: 12.0,
      },
      {
        code: "PHRM 426",
        title: "Pharmacology",
        credit: 3.0,
        grade: "B+",
        point: 3.3,
        gp: 9.9,
      },
      {
        code: "PATH 427",
        title: "Pathology",
        credit: 4.0,
        grade: "A",
        point: 4.0,
        gp: 16.0,
      },
      {
        code: "ETHC 428",
        title: "Ethics & Research",
        credit: 2.0,
        grade: 4.0,
        point: 4.0,
        gp: 8.0,
      },
    ],
  };

  const reportBatch: ReportRecord[] = [
    baseReport,
    {
      ...baseReport,
      id: "DHMC/MRT-1821-17",
      name: "Second Student Demo",
      cgpa: 3.55,
      batch: "2024/2025",
      department: "Radiology",
    },
    {
      ...baseReport,
      id: "DHMC/MRT-1821-18",
      name: "Third Student Demo",
      cgpa: 3.2,
      batch: "2023/2024",
      department: "Nursing",
      program: "Nursing",
    },
  ];

  const baseTranscript: TranscriptRecord = {
    student: {
      id: "DHMC.NUR-75-14",
      name: "Mabeyna Habila Makenson",
      gender: "Female",
      dob: "01 Jan 1995",
      program: "Nursing",
      faculty: "Faculty of Nursing",
      admissionDate: "11-Oct-2021",
      batch: "2021/2022",
      department: "Nursing",
    },
    semesters: [
      {
        year: "2021/2022",
        semester: "Semester I",
        courses: [
          {
            code: "ENG 1011",
            title: "Communicative English Skills I",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "Psyc 1012",
            title: "General Psychology",
            ch: 3.0,
            grade: "B+",
            point: 9.9,
          },
          {
            code: "MATH 1014",
            title: "Mathematics",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "ICT 1012",
            title: "Critical Thinking",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "GEES 1011",
            title: "Geography of Ethiopia and the Horn",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "SPRT 1012",
            title: "Physical Fitness",
            ch: 0.0,
            grade: "PASS",
            point: 0.0,
          },
          {
            code: "SNS 1014",
            title: "Inclusiveness",
            ch: 2.0,
            grade: "B+",
            point: 7.0,
          },
          {
            code: "GJT 1014",
            title: "Global Trend",
            ch: 2.0,
            grade: "B",
            point: 6.0,
          },
        ],
        totalCH: 22.0,
        totalPoint: 76.75,
        gpa: 3.49,
      },
      {
        year: "2021/2022",
        semester: "Semester II",
        courses: [
          {
            code: "ENG 1012",
            title: "Communicative English Skill-II",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "Chem 1023",
            title: "General Chemistry",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "Anat 1013",
            title: "Anatomy & Physiology",
            ch: 4.0,
            grade: "A",
            point: 16.0,
          },
          {
            code: "ICT 1012",
            title: "Introduction to Emerging Technology",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
          {
            code: "MCIE 1013",
            title: "Moral & Civic Education",
            ch: 2.0,
            grade: "A",
            point: 8.0,
          },
          {
            code: "Hist 1012",
            title: "History of Ethiopia",
            ch: 3.0,
            grade: "B+",
            point: 9.9,
          },
          {
            code: "Eco 1014",
            title: "Economics",
            ch: 3.0,
            grade: "A",
            point: 12.0,
          },
        ],
        totalCH: 21.0,
        totalPoint: 93.9,
        gpa: 4.47,
      },
    ],
  };

  const transcriptBatch: TranscriptRecord[] = [
    baseTranscript,
    {
      ...baseTranscript,
      student: {
        ...baseTranscript.student,
        id: "DHMC.NUR-75-15",
        name: "Second Transcript Demo",
        batch: "2021/2022",
        department: "Nursing",
      },
    },
    {
      ...baseTranscript,
      student: {
        ...baseTranscript.student,
        id: "DHMC.NUR-75-16",
        name: "Third Transcript Demo",
        batch: "2020/2021",
        department: "Radiology",
        program: "Medical Radiology Technology",
      },
    },
  ];
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const students = await apiService.get(endPoints.studentsSlip); // Adjust endpoint name if needed
        setAllStudents(students || []);
        console.log(students);
      } catch (err) {
        setError(
          "Failed to load students: " + (err?.message || "Unknown error")
        );
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const toggleAllVisible = () => {
    const visibleIds = filteredStudents.map((s) => s.studentId);
    const allSelected = visibleIds.every((id) => selectedStudents.includes(id));
    if (allSelected) {
      setSelectedStudents((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedStudents((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    const term = searchTerm.toLowerCase();
    return allStudents.filter(
      (s) =>
        s.fullNameENG.toLowerCase().includes(term) ||
        s.idNumber?.toLowerCase().includes(term) ||
        s.username.toLowerCase().includes(term)
    );
  }, [allStudents, searchTerm]);
  const selectedCount = selectedStudents.length;
  const handleBackToChoice = () => {
    setSearchType(null);
    setSelectedStudents([]);
    setSearchTerm("");
    setRealReports([]);
  };
  // === BATCH & DEPARTMENT OPTIONS ===

  const allReportBatches = Array.from(new Set(reportBatch.map((r) => r.batch)));
  const allReportDepartments = Array.from(
    new Set(reportBatch.map((r) => r.department))
  );

  const allTranscriptBatches = Array.from(
    new Set(transcriptBatch.map((t) => t.student.batch))
  );
  const allTranscriptDepartments = Array.from(
    new Set(transcriptBatch.map((t) => t.student.department))
  );

  const batches =
    searchType === "report" ? allReportBatches : allTranscriptBatches;
  const departments =
    searchType === "report" ? allReportDepartments : allTranscriptDepartments;

  // === FILTERED LISTS (batch + department + search) ===

  const filteredReports = useMemo(() => {
    let list = reportBatch;

    if (!selectedBatch) {
      return [];
    }

    if (selectedBatch !== "all") {
      list = list.filter((r) => r.batch === selectedBatch);
    }

    if (selectedDepartment !== "all") {
      list = list.filter((r) => r.department === selectedDepartment);
    }

    const term = searchTerm.toLowerCase();
    if (!term) return list;

    return list.filter(
      (r) =>
        r.id.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.program.toLowerCase().includes(term)
    );
  }, [searchTerm, selectedBatch, selectedDepartment, reportBatch]);

  const filteredTranscripts = useMemo(() => {
    let list = transcriptBatch;

    if (!selectedBatch) {
      return [];
    }

    if (selectedBatch !== "all") {
      list = list.filter((t) => t.student.batch === selectedBatch);
    }

    if (selectedDepartment !== "all") {
      list = list.filter((t) => t.student.department === selectedDepartment);
    }

    const term = searchTerm.toLowerCase();
    if (!term) return list;

    return list.filter(
      (t) =>
        t.student.id.toLowerCase().includes(term) ||
        t.student.name.toLowerCase().includes(term) ||
        t.student.program.toLowerCase().includes(term)
    );
  }, [searchTerm, selectedBatch, selectedDepartment, transcriptBatch]);

  // Helper function to sanitize sheet names (Excel limit: 31 chars, no special chars)
  const sanitizeSheetName = (name: string): string => {
    return name
      .replace(/[\\\/\?\*\[\]:]/g, "_") // Replace invalid chars
      .slice(0, 31); // Excel sheet name limit
  };

  // Prepare Student Copy data for Excel export (Matching PDF Landscape Design)
  const prepareStudentCopySheets = (report: RealGradeReport) => {
    const sheets: Record<string, any[][]> = {};

    report.studentCopies.forEach((copy, index) => {
      const sheetData: any[][] = [];

      // Yellow Header Band equivalent in Excel
      sheetData.push(["MD1_[PC_I]"]);
      sheetData.push(["DEUTSCHE HOCHSCHULE FÜR MEDIZINE MEDICAL COLLEGE"]);
      sheetData.push(["STUDENT ACADEMIC RECORD"]);
      sheetData.push([]);

      // Student Info Table (PDF 4-column layout)
      sheetData.push([
        "ID Number",
        report.idNumber || "",
        "Date Of Admission",
        report.dateEnrolledGC || "",
      ]);
      sheetData.push([
        "Name of Student",
        report.fullName || "",
        "Enrolment Type",
        report.programModality?.name || "Regular",
      ]);
      sheetData.push([
        "Sex",
        report.gender || "",
        "Department",
        report.department?.name || "",
      ]);
      sheetData.push([
        "Program",
        report.programLevel?.name || "Degree",
        "Field of Study",
        report.department?.name || "Medicine",
      ]);
      sheetData.push([
        "Date Of Birth",
        report.birthDateGC || "",
        "Date Issued",
        report.dateIssuedGC || new Date().toLocaleDateString("en-GB"),
      ]);
      sheetData.push([]);

      // Academic Period Info
      sheetData.push([
        `Academic Year: ${copy.academicYear || "N/A"}   Class Year: ${copy.classyear?.name || "PC I"
        }   Semester: ${copy.semester?.name || "Year Based"}`,
      ]);
      sheetData.push([]);

      // Courses Table Header
      sheetData.push([
        "Course Title",
        "Course Code",
        "Cr.Hr.",
        "Letter Grade",
        "Gr.Point",
      ]);

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

      // Totals Line
      const totalCr = copy.courses.reduce((sum, c) => sum + (c.totalCrHrs || 0), 0);
      const totalPoint = copy.courses.reduce((sum, c) => sum + (c.gradePoint || 0), 0);
      sheetData.push(["Total:", "", totalCr.toFixed(2), "", totalPoint.toFixed(2)]);
      sheetData.push([]);

      // Summary Table Calculation (matching PDF logic)
      const currentIndex = report.studentCopies.indexOf(copy);
      const previousCopies = report.studentCopies.slice(0, currentIndex);

      let prevTotalCredit = 0;
      let prevTotalGP = 0;
      let prevCGPA = "N/A";

      if (previousCopies.length > 0) {
        previousCopies.forEach((prevCopy) => {
          prevTotalCredit += prevCopy.courses.reduce(
            (sum, c) => sum + (c.totalCrHrs || 0),
            0
          );
          prevTotalGP += prevCopy.courses.reduce(
            (sum, c) => sum + (c.gradePoint || 0),
            0
          );
        });
        prevCGPA =
          previousCopies[previousCopies.length - 1].semesterCGPA?.toFixed(2) ||
          "N/A";
      }

      const cumulativeCredit = copy.cumulativeCredit ? copy.cumulativeCredit : (prevTotalCredit + totalCr);
      const cumulativeGP = copy.cumulativeTotalPoint ? copy.cumulativeTotalPoint : (prevTotalGP + totalPoint);

      sheetData.push(["Summary", "Credit", "GP", "ANG", "ALG"]);
      sheetData.push([
        "Previous TOTAL",
        previousCopies.length > 0 ? prevTotalCredit.toFixed(2) : "N/A",
        previousCopies.length > 0 ? prevTotalGP.toFixed(2) : "N/A",
        prevCGPA,
        previousCopies.length > 0
          ? prevTotalGP / prevTotalCredit >= 2
            ? "C"
            : "F"
          : "N/A",
      ]);
      sheetData.push([
        "Semestre TOTAL",
        totalCr.toFixed(2),
        totalPoint.toFixed(2),
        copy.semesterGPA?.toFixed(2) || "N/A",
        copy.status || "N/A",
      ]);
      sheetData.push([
        "Cummulative",
        typeof cumulativeCredit === "number" ? cumulativeCredit.toFixed(2) : cumulativeCredit,
        typeof cumulativeGP === "number" ? cumulativeGP.toFixed(2) : cumulativeGP,
        copy.semesterCGPA?.toFixed(2) || "N/A",
        copy.semesterCGPAGrade || (copy.semesterCGPA >= 2 ? "C" : "F"),
      ]);
      sheetData.push([
        "Notes:",
        copy.status === "PASSED"
          ? "Pass"
          : copy.status === "FAILED"
            ? "Re-Exam"
            : "Pass & Re-Exam",
      ]);
      sheetData.push([]);

      // Grading Scale
      sheetData.push(["Grading Scale:"]);
      sheetData.push(["Point Score", "Grade"]);
      sheetData.push(["85-100", "A"]);
      sheetData.push(["80-85", "B+"]);
      sheetData.push(["70-80", "B"]);
      sheetData.push(["65-70", "C+"]);
      sheetData.push(["60-65", "C"]);
      sheetData.push(["50-60", "D"]);
      sheetData.push(["Below 50", "F"]);
      sheetData.push([]);

      // Signatures
      sheetData.push([
        "REGISTRAR: ______________________",
        "",
        "",
        "DEAN/VICE DEAN: ______________________",
      ]);

      const sheetName = `${copy.semester?.name || "Semester"}_${copy.classyear?.name || index + 1
        }`;
      sheets[sheetName] = sheetData;
    });

    return sheets;
  };

  // Prepare Transcript data for Excel export (Matching PDF Portrait Design)
  const prepareTranscriptSheets = (report: RealGradeReport) => {
    const sheets: Record<string, any[][]> = {};
    const sheetData: any[][] = [];

    // Header
    sheetData.push(["DEUTSCHE HOCHSCHULE FÜR MEDIZIN"]);
    sheetData.push(["STUDENT ACADEMIC TRANSCRIPT"]);
    sheetData.push(["OFFICE OF THE REGISTRAR"]);
    if (report.dateIssuedGC) {
      sheetData.push([`Issued on: ${report.dateIssuedGC}`]);
    }
    sheetData.push([]); // Empty row

    // Student Info
    sheetData.push([
      "ID Number:",
      report.idNumber,
      "Date of Admission:",
      report.dateEnrolledGC,
    ]);
    sheetData.push([
      "Name of Student:",
      report.fullName,
      "Program Modality:",
      report.programModality?.name || "-",
    ]);
    sheetData.push([
      "Sex:",
      report.gender,
      "Field of Study:",
      report.department?.name || "-",
    ]);
    sheetData.push([
      "Date Of Birth:",
      report.birthDateGC,
      "Level:",
      report.programLevel?.name || "-",
    ]);
    sheetData.push([]); // Empty row

    // Process each semester
    report.studentCopies.forEach((copy) => {
      sheetData.push([
        `Academic Year: ${copy.academicYear || "N/A"}   Class Year: ${copy.classyear?.name || "N/A"
        }`,
      ]);
      sheetData.push([`Semester: ${copy.semester?.name || "N/A"}`]);
      sheetData.push([`SGPA: ${copy.semesterGPA.toFixed(2)}   ${copy.status}`]);
      sheetData.push([]);

      sheetData.push([
        "No",
        "Code",
        "Course Title",
        "Cr.Hr",
        "Letter Grade",
        "Gr Point",
      ]);

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
      const totalPoints = copy.courses.reduce(
        (sum, c) => sum + (c.gradePoint || 0),
        0
      );

      sheetData.push([
        `TOTAL Cr.Hr: ${totalCH.toFixed(2)}   Points: ${totalPoints.toFixed(
          2
        )}   SGPA: ${copy.semesterGPA.toFixed(2)}`,
      ]);
      sheetData.push([]); // Empty row between semesters
    });

    // Final CGPA
    const finalCGPA =
      report.studentCopies.length > 0
        ? report.studentCopies[
          report.studentCopies.length - 1
        ].semesterCGPA.toFixed(2)
        : "N/A";
    sheetData.push(["Cumulative GPA (CGPA):", finalCGPA]);
    sheetData.push([]);
    sheetData.push([]);

    // Signatures
    sheetData.push([
      "_________________________________________",
      "",
      "_________________________________________",
    ]);
    sheetData.push([
      "Registrar / Office of the Registrar",
      "",
      "Dean Office",
    ]);
    sheetData.push(["Date: ____________________", "", "Date: ____________________"]);

    sheets["Transcript"] = sheetData;
    return sheets;
  };

  const exportToExcel = () => {
    if (!searchType) return;

    const filename =
      searchType === "report" ? "Student_Copies.xlsx" : "Transcripts.xlsx";

    console.log("Starting export...");

    // ── THIS IS THE MOST IMPORTANT LINE ──
    // Use the REAL generated data, not demo/fake arrays
    const items = searchType === "report" ? realReports : realTranscripts;

    console.log("Exporting items count:", items.length);
    console.log("First item:", items[0]); // ← debug
    if (items.length >= 2) {
      console.log("Second item:", items[1]); // ← debug
    }

    if (items.length === 0) {
      alert("No data available to export. Generate reports/transcripts first.");
      return;
    }

    const wb = XLSX.utils.book_new();

    items.forEach((report, index) => {
      console.log(
        `Processing student ${index + 1}:`,
        report.idNumber,
        report.fullName
      );

      let sheets;
      if (searchType === "report") {
        sheets = prepareStudentCopySheets(report);
      } else {
        sheets = prepareTranscriptSheets(report);
      }

      Object.entries(sheets).forEach(([sheetName, data]) => {
        const prefix =
          items.length > 1
            ? `${report.idNumber || "Student"}_${index + 1}_`
            : "";

        const safeName = `${prefix}${sanitizeSheetName(sheetName)}`.slice(
          0,
          31
        );

        console.log(`→ Creating sheet: ${safeName}`);

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      });
    });

    // Write and download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("Download triggered");
  };

  const exportToPDF = () => {
    if (!searchType) return;
    const items = searchType === "report" ? realReports : realTranscripts;

    if (items.length === 0) {
      alert("No data to export. Generate first.");
      return;
    }

    // Create PDF document ONCE based on type
    const orientation = searchType === "report" ? "l" : "p";
    const doc = new jsPDF(orientation, "mm", "a4");

    items.forEach((item, index) => {
      // ═══════════════════════════════════════════════════════
      // STUDENT COPY (REPORT) - New Compact Landscape Design
      // ═══════════════════════════════════════════════════════
      if (searchType === "report") {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 8;

        if (index > 0) doc.addPage();

        let y = margin;

        // ────────────────────────────────────────────────
        //  YELLOW HEADER BAND (like your image)
        // ────────────────────────────────────────────────
        doc.setFillColor(212, 175, 55); // More golden yellow like image
        doc.rect(0, 0, pageWidth, 24, "F"); // Reduced from 28 to 24

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("MD1_[PC_I]", pageWidth / 2, 9, { align: "center" });

        doc.setFontSize(9);
        doc.text(
          "DEUTSCHE HOCHSCHULE FÜR MEDIZINE MEDICAL COLLEGE",
          pageWidth / 2,
          16,
          { align: "center" }
        );

        // Logo placeholder
        doc.setFontSize(8);
        // doc.text("[Logo]", margin + 3, 24);
        doc.addImage(LOGO_BASE64, "PNG", margin + 5, 2, 24, 24);
        y = 28; // Start closer

        // ────────────────────────────────────────────────
        // STUDENT INFO TABLE (using actual table)
        // ────────────────────────────────────────────────
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("STUDENT ACADEMIC RECORD", pageWidth / 2, y, {
          align: "center",
        });
        y += 6;

        // Use autoTable for student info for better alignment
        autoTable(doc, {
          startY: y,
          head: [],
          body: [
            [
              "ID Number",
              item.idNumber || "",
              "Date Of Admission",
              item.dateEnrolledGC || "",
            ],
            [
              "Name of Student",
              item.fullName || "",
              "Enrolment Type",
              item.programModality?.name || "Regular",
            ],
            [
              "Sex",
              item.gender || "",
              "Department",
              item.department?.name || "",
            ],
            [
              "Program",
              item.programLevel?.name || "Degree",
              "Field of Study",
              item.department?.name || "Medicine",
            ],
            [
              "Date Of Birth",
              item.birthDateGC || "",
              "Date Issued",
              item.dateIssuedGC || new Date().toLocaleDateString("en-GB"),
            ],
          ],
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            lineWidth: 0.2,
            textColor: [0, 0, 0],
          },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40 },
            1: { cellWidth: 65 },
            2: { fontStyle: "bold", cellWidth: 40 },
            3: { cellWidth: 65 },
          },
          margin: { left: margin, right: margin },
        });

        y = (doc as any).lastAutoTable.finalY + 6;

        // ────────────────────────────────────────────────
        // ACADEMIC PERIOD
        // ────────────────────────────────────────────────
        const copy = item.studentCopies[0];
        if (copy) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Academic Year: ${copy.academicYear || "N/A"}   Class Year: ${copy.classyear?.name || "PC I"
            }   Semester: ${copy.semester?.name || "Year Based"}`,
            margin,
            y
          );
          y += 7;
        }

        // ────────────────────────────────────────────────
        // COURSES TABLE (Blue header like image)
        // ────────────────────────────────────────────────
        autoTable(doc, {
          startY: y,
          head: [
            [
              "Course Title",
              "Course Code",
              "Cr.Hr.",
              "Letter Grade",
              "Gr.Point",
            ],
          ],
          body:
            copy?.courses.map((c) => [
              c.courseTitle || "",
              c.courseCode || "",
              c.totalCrHrs?.toFixed(2) || "",
              c.letterGrade || "",
              c.gradePoint?.toFixed(2) || "",
            ]) || [],
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            lineWidth: 0.2,
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [135, 206, 235], // Sky blue like image
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 70, halign: "left" },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 18, halign: "center" },
            3: { cellWidth: 25, halign: "center" },
            4: { cellWidth: 22, halign: "center" },
          },
          margin: { left: margin, right: pageWidth - 95 }, // Leave room for grading scale
        });

        const tableEnd = (doc as any).lastAutoTable.finalY;

        // ────────────────────────────────────────────────
        // GRADING SCALE (right side, positioned beside table)
        // ────────────────────────────────────────────────
        const scaleX = pageWidth - 85;
        let scaleY = y + 10;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Point Score", scaleX, scaleY);
        scaleY += 5;
        doc.setFont("helvetica", "normal");
        doc.text("A=(85-100)", scaleX, scaleY);
        scaleY += 4;
        doc.text("B+=(80-85)", scaleX, scaleY);
        scaleY += 4;
        doc.text("B=(70-80)", scaleX, scaleY);
        scaleY += 4;
        doc.text("C+=(65-70)", scaleX, scaleY);
        scaleY += 4;
        doc.text("C=(60-65)", scaleX, scaleY);
        scaleY += 4;
        doc.text("D=(50-60)", scaleX, scaleY);
        scaleY += 4;
        doc.text("F=Below 50", scaleX, scaleY);

        y = tableEnd + 4;

        // ────────────────────────────────────────────────
        // TOTAL LINE
        // ────────────────────────────────────────────────
        if (copy) {
          const totalCr = copy.courses.reduce(
            (sum, c) => sum + (c.totalCrHrs || 0),
            0
          );
          const totalPoint = copy.courses.reduce(
            (sum, c) => sum + (c.gradePoint || 0),
            0
          );

          doc.setFontSize(8);
          doc.text(`Total:`, margin, y);
          doc.text(`${totalCr.toFixed(2)}`, margin + 80, y, { align: "right" });
          doc.text(`${totalPoint.toFixed(2)}`, margin + 165, y, {
            align: "right",
          });
          y += 6;

          // ────────────────────────────────────────────────
          // SUMMARY TABLE (beige/tan like image)
          // ────────────────────────────────────────────────

          // Calculate previous totals (all semesters before current one)
          const currentIndex = item.studentCopies.indexOf(copy);
          const previousCopies = item.studentCopies.slice(0, currentIndex);

          let prevTotalCredit = 0;
          let prevTotalGP = 0;
          let prevCGPA = "N/A";

          if (previousCopies.length > 0) {
            // Sum all previous semesters
            previousCopies.forEach((prevCopy) => {
              prevTotalCredit += prevCopy.courses.reduce(
                (sum, c) => sum + (c.totalCrHrs || 0),
                0
              );
              prevTotalGP += prevCopy.courses.reduce(
                (sum, c) => sum + (c.gradePoint || 0),
                0
              );
            });
            // Get CGPA from last previous semester
            prevCGPA =
              previousCopies[previousCopies.length - 1].semesterCGPA?.toFixed(
                2
              ) || "N/A";
          }

          // Calculate cumulative (previous + current)
          const cumulativeCredit = prevTotalCredit + totalCr;
          const cumulativeGP = prevTotalGP + totalPoint;

          autoTable(doc, {
            startY: y,
            head: [["Summary", "Credit", "GP", "ANG", "ALG"]],
            body: [
              [
                "Previous TOTAL",
                previousCopies.length > 0 ? prevTotalCredit.toFixed(2) : "N/A",
                previousCopies.length > 0 ? prevTotalGP.toFixed(2) : "N/A",
                prevCGPA,
                previousCopies.length > 0
                  ? prevTotalGP / prevTotalCredit >= 2
                    ? "C"
                    : "F"
                  : "N/A",
              ],
              [
                "Semestre TOTAL",
                totalCr.toFixed(2),
                totalPoint.toFixed(2),
                copy.semesterGPA?.toFixed(2) || "N/A",
                copy.status || "N/A",
              ],
              [
                "Cummulative",
                // cumulativeCredit.toFixed(2),
                copy.cumulativeCredit ? copy.cumulativeCredit : "N/A",
                copy.cumulativeTotalPoint ? copy.cumulativeTotalPoint : "N/A",
                copy.semesterCGPA?.toFixed(2) || "N/A",
                copy.semesterCGPAGrade ? copy.semesterCGPAGrade : "N/A",
              ],
              [
                "Notes:",
                copy.status === "PASSED"
                  ? "Pass"
                  : copy.status === "FAILED"
                    ? "Re-Exam"
                    : "Pass & Re-Exam",
                "",
                "",
                "",
              ],
            ],
            theme: "grid",
            styles: {
              fontSize: 8,
              cellPadding: 2,
              lineWidth: 0.2,
              fillColor: [245, 222, 179], // Wheat/beige
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [135, 206, 235], // Blue header
              fontStyle: "bold",
            },
            columnStyles: {
              0: { cellWidth: 35 },
              1: { cellWidth: 20, halign: "center" },
              2: { cellWidth: 20, halign: "center" },
              3: { cellWidth: 20, halign: "center" },
              4: { cellWidth: 20, halign: "center" },
            },
            margin: { left: margin, right: margin },
          });

          y = (doc as any).lastAutoTable.finalY + 15;
        }

        // ────────────────────────────────────────────────
        // SIGNATURES (bottom)
        // ────────────────────────────────────────────────
        y = pageHeight - 18;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("REGISTRAR: ______________________", margin, y);
        doc.text(
          "DEAN/VICE DEAN: ______________________",
          pageWidth / 2 + 10,
          y
        );
      } else {
        // ═══════════════════════════════════════════════════════
        // TRANSCRIPT - Original Two-Column Portrait Design
        // ═══════════════════════════════════════════════════════
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 9;

        if (index > 0) doc.addPage();

        let y = 10;
        const r = item as RealGradeReport;

        // Header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DEUTSCHE HOCHSCHULE FÜR MEDIZIN", pageWidth / 2, y, {
          align: "center",
        });
        y += 5;
        doc.setFontSize(9.5);
        doc.text("STUDENT ACADEMIC TRANSCRIPT", pageWidth / 2, y, {
          align: "center",
        });
        y += 4;
        doc.setFontSize(8);
        doc.text("OFFICE OF THE REGISTRAR", pageWidth / 2, y, {
          align: "center",
        });
        y += 4;
        if (r.dateIssuedGC) {
          doc.setFontSize(7.5);
          doc.text(`Issued on: ${r.dateIssuedGC}`, pageWidth / 2, y, {
            align: "center",
          });
          y += 4;
        }
        y += 3;

        // Student info
        doc.setFontSize(7.5);
        const leftX = margin;
        const rightX = pageWidth / 2 + 2;
        const info = [
          [`ID: ${r.idNumber}`, `Date of Admission: ${r.dateEnrolledGC}`],
          [
            `Name: ${r.fullName.substring(0, 28)}${r.fullName.length > 28 ? "…" : ""
            }`,
            `Program: ${r.programModality?.name?.substring(0, 20) || "-"}`,
          ],
          [
            `Sex: ${r.gender}`,
            `Field of Study: ${r.department?.name?.substring(0, 20) || "-"}`,
          ],
          [
            `Date of Birth: ${r.birthDateGC}`,
            `Level: ${r.programLevel?.name?.substring(0, 16) || "-"}`,
          ],
        ];
        info.forEach(([l, rgt], i) => {
          const rowY = y + i * 3.4;
          doc.setFont("helvetica", "bold");
          doc.text(l.split(":")[0] + ":", leftX, rowY);
          doc.setFont("helvetica", "normal");
          doc.text(l.split(":")[1]?.trim() || "", leftX + 16, rowY);
          doc.setFont("helvetica", "bold");
          doc.text(rgt.split(":")[0] + ":", rightX, rowY);
          doc.setFont("helvetica", "normal");
          doc.text(rgt.split(":")[1]?.trim() || "", rightX + 20, rowY);
        });
        y += info.length * 3.4 + 7;

        // Semesters in two columns
        let leftBottom = y;
        let rightBottom = y;
        const colWidth = (pageWidth - margin * 3) / 2;

        r.studentCopies.forEach((copy, idx) => {
          const isLeft = idx % 2 === 0;
          const colX = isLeft ? margin : pageWidth / 2 + margin / 2;
          let cy = isLeft ? leftBottom : rightBottom;

          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          const line1 = `Academic Year: ${copy.academicYear || "N/A"
            }   Class Year: ${copy.classyear.name}`;
          doc.text(line1, colX, cy);
          cy += 4.5;
          doc.text(`Semester: ${copy.semester.name}`, colX, cy);
          cy += 5;

          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.text(
            `SGPA: ${copy.semesterGPA.toFixed(2)}   ${copy.status}`,
            colX,
            cy
          );
          cy += 4.5;

          const body = copy.courses.map((c, i) => [
            (i + 1).toString(),
            c.courseCode,
            c.courseTitle,
            c.totalCrHrs.toFixed(2),
            c.letterGrade,
            c.gradePoint.toFixed(2),
          ]);

          autoTable(doc, {
            startY: cy,
            head: [
              [
                "No",
                "Code",
                "Course Title",
                "Cr.Hr",
                "Letter Grade",
                "Gr Point",
              ],
            ],
            body,
            theme: "grid",
            margin: { left: colX, right: pageWidth - colX - colWidth },
            styles: {
              fontSize: 7,
              cellPadding: 1.2,
              overflow: "linebreak",
              lineWidth: 0.1,
              valign: "middle",
              textColor: [0, 0, 0],
            },
            headStyles: {
              fontSize: 7.2,
              fillColor: [220, 220, 220],
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              fontStyle: "bold",
            },
            columnStyles: {
              0: { cellWidth: 7, halign: "center" },
              1: { cellWidth: 22, halign: "left" },
              2: { cellWidth: "auto" },
              3: { cellWidth: 11, halign: "center" },
              4: { cellWidth: 10, halign: "center" },
              5: { cellWidth: 12, halign: "center" },
            },
            didParseCell: (data) => {
              if (data.column.index === 2 && data.cell.section === "body") {
                data.cell.styles.fontSize = 6.6;
              }
            },
          });

          cy = (doc as any).lastAutoTable.finalY + 3.5;

          doc.setFontSize(7);
          const totCH = copy.courses.reduce((s, c) => s + c.totalCrHrs, 0);
          const totPt = copy.courses.reduce((s, c) => s + c.gradePoint, 0);
          doc.text(
            `TOTAL Cr.Hr: ${totCH.toFixed(2)}   Points: ${totPt.toFixed(
              2
            )}   SGPA: ${copy.semesterGPA.toFixed(2)}`,
            colX,
            cy
          );

          if (isLeft) leftBottom = Math.max(leftBottom, cy + 6);
          else rightBottom = Math.max(rightBottom, cy + 6);
        });

        y = Math.max(leftBottom, rightBottom) + 8;

        // Final CGPA
        const finalCGPA =
          r.studentCopies.length > 0
            ? r.studentCopies[r.studentCopies.length - 1].semesterCGPA.toFixed(
              2
            )
            : "N/A";

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`Cumulative GPA (CGPA): ${finalCGPA}`, margin, y);
        y += 6;

        // Signatures
        if (y < 225) y = 225;
        if (y > 270) {
          doc.addPage();
          y = 18;
        }

        doc.setFontSize(9);
        doc.text(
          "_________________________________________",
          pageWidth * 0.25,
          y,
          { align: "center" }
        );
        doc.setFontSize(8.5);
        doc.text(
          "Registrar / Office of the Registrar",
          pageWidth * 0.25,
          y + 5,
          { align: "center" }
        );
        doc.setFontSize(8);
        doc.text("Date: ____________________", pageWidth * 0.25, y + 10, {
          align: "center",
        });

        doc.setFontSize(9);
        doc.text(
          "_________________________________________",
          pageWidth * 0.75,
          y,
          { align: "center" }
        );
        doc.setFontSize(8.5);
        doc.text("Dean Office", pageWidth * 0.75, y + 5, { align: "center" });
        doc.setFontSize(8);
        doc.text("Date: ____________________", pageWidth * 0.75, y + 10, {
          align: "center",
        });
      }
    });

    // Save the PDF after all pages are added
    doc.save(
      searchType === "report"
        ? "Student_Academic_Record.pdf"
        : "Transcripts.pdf"
    );
  };

  // === TYPE SELECTION SCREEN ===
  if (!searchType) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
            Student Records
          </h1>

          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Choose what you want to view.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
            {[
              {
                type: "report" as const,
                label: "Student Copy",
                icon: FileText,
              },
              {
                type: "transcript" as const,
                label: "Transcripts",
                icon: ScrollText,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setSearchType(item.type);
                    setSelectedBatch("");
                    setSelectedDepartment("all");
                  }}
                  className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border-2 font-medium text-sm transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 active:scale-95"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // === MAIN LIST VIEW ===
  const isReport = searchType === "report";
  const activeList = isReport ? filteredReports : filteredTranscripts;
  const count = selectedBatch ? activeList.length : 0;

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
          <button
            onClick={exportToPDF}
            disabled={
              searchType === "report"
                ? realReports.length === 0
                : transcriptBatch.length === 0
            }
            className="flex items-center gap-2 px-5 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            <Download /> Export PDF (
            {searchType === "report"
              ? realReports.length
              : transcriptBatch.length}
            )
          </button>
          <button
            type="button" 
            onClick={exportToExcel}
            disabled={
              (searchType === "report" && realReports.length === 0) ||
              (searchType === "transcript" && realTranscripts.length === 0)
            }
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Excel ({realReports.length || realTranscripts.length})
          </button>
        </div>

        {searchType === "report" ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Select Students for Grade Report
            </h2>

            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={toggleAllVisible}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {filteredStudents.every((s) =>
                  selectedStudents.includes(s.studentId)
                )
                  ? "Deselect"
                  : "Select"}{" "}
                All Visible
              </button>
            </div>
            <div className="mt-6 space-y-6">
              {/* Semester & Class Year Selection */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Semester
                  </label>
                  <select
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    disabled={loadingDropdowns}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">
                      {loadingDropdowns
                        ? "Loading semesters..."
                        : "Select Semester"}
                    </option>
                    {semesters.map((sem) => (
                      <option
                        key={sem.academicPeriodCode}
                        value={sem.academicPeriodCode}
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
                    disabled={loadingDropdowns}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">
                      {loadingDropdowns
                        ? "Loading class years..."
                        : "Select Class Year"}
                    </option>
                    {classYears.map((cy) => (
                      <option key={cy.id} value={cy.id}>
                        {cy.classYear}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected count + Generate button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Selected: {selectedCount} student
                  {selectedCount !== 1 ? "s" : ""}
                </div>

                <button
                  onClick={async () => {
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
                      const response = await apiService.post(
                        // "/api/student-copy/generate",
                        endPoints.studentCopy,

                        {
                          semesterId: selectedSemesterId,
                          classYearId: Number(selectedClassYearId),
                          studentIds: selectedStudents,
                        }
                      );
                     
                      const reportsArray = Array.isArray(response)
                        ? response
                        : [];

                      // Transform into RealGradeReport format expected by RealReportView
                      const transformedReports: RealGradeReport[] =
                        reportsArray.map((item: any) => ({
                          idNumber: item.idNumber,
                          fullName: item.fullName,
                          gender: item.gender,
                          birthDateGC: item.dateOfBirthGC,
                          dateEnrolledGC: item.dateEnrolledGC,
                          programModality: item.programModality,
                          programLevel: item.programLevel,
                          department: item.department,
                          // Wrap the single semester data into studentCopies array
                          studentCopies: [
                            {
                              classyear: item.classyear,
                              semester: item.semester,
                              academicYear: item.academicYear,
                              courses: item.courses.map((c: any) => ({
                                courseCode: c.courseCode,
                                courseTitle: c.courseTitle,
                                totalCrHrs: c.totalCrHrs,
                                letterGrade: c.letterGrade,
                                gradePoint: c.gradePoint,
                              })),
                              semesterGPA: item.semesterGPA,
                              semesterCGPA: item.semesterCGPA,
                              status: item.status,
                            },
                          ],
                        }));

                      setRealReports(transformedReports);
                    } catch (err: any) {
                      const message =
                        err?.response?.data?.error ||
                        err?.message ||
                        "Failed to generate student copies";
                      setError(message);
                      setRealReports([]);
                    } finally {
                      setLoadingReports(false);
                    }
                  }}
                  disabled={
                    selectedStudents.length === 0 ||
                    !selectedSemesterId ||
                    !selectedClassYearId ||
                    loadingReports ||
                    loadingDropdowns
                  }
                  className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition ${selectedStudents.length === 0 ||
                    !selectedSemesterId ||
                    !selectedClassYearId ||
                    loadingDropdowns
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    }`}
                >
                  {loadingReports ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin inline mr-3" />
                      Generating Copies...
                    </>
                  ) : (
                    "Generate Student Copies"
                  )}
                </button>
              </div>

              {/* Error Display */}
              {Error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
                  {Error}
                </div>
              )}
            </div>

            {loadingStudents ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                <p>Loading students...</p>
              </div>
            ) : Error ? (
              <div className="text-red-600 text-center py-10">{Error}</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                    <tr className="text-gray-700 dark:text-gray-200">
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">ID / Username</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <td className="p-3">
                          {selectedStudents.includes(student.studentId) ? (
                            <CheckSquare className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="text-gray-400 dark:text-gray-500" />
                          )}
                        </td>
                        <td className="p-3 font-mono">{student.username}</td>
                        <td className="p-3">{student.fullNameENG}</td>
                        <td className="p-3">{student.departmentName}</td>
                        <td className="p-3">{student.bcysDisplayName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Selected: {selectedCount} student{selectedCount !== 1 ? "s" : ""}
            </div>

            {loadingReports && (
              <div className="mt-8 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
              </div>
            )}

            <div className="mt-8 space-y-8">
              {realReports.map((report, i) => (
                <RealReportView key={i} report={report} />
              ))}
              {realReports.length === 0 &&
                !loadingReports &&
                selectedCount > 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No reports generated yet.
                  </p>
                )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Select Students for Transcript
            </h2>

            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={toggleAllVisible}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {filteredStudents.every((s) =>
                  selectedStudents.includes(s.studentId)
                )
                  ? "Deselect"
                  : "Select"}{" "}
                All Visible
              </button>
            </div>

            {/* Same student list table */}
            {loadingStudents ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                <p>Loading students...</p>
              </div>
            ) : Error ? (
              <div className="text-red-600 text-center py-10">{Error}</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                    <tr className="text-gray-700 dark:text-gray-200">
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">ID / Username</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <td className="p-3">
                          {selectedStudents.includes(student.studentId) ? (
                            <CheckSquare className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="text-gray-400 dark:text-gray-500" />
                          )}
                        </td>
                        <td className="p-3 font-mono">{student.username}</td>
                        <td className="p-3">{student.fullNameENG}</td>
                        <td className="p-3">{student.departmentName}</td>
                        <td className="p-3">{student.bcysDisplayName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Selected: {selectedCount} student
                {selectedCount !== 1 ? "s" : ""}
              </div>

              <button
                onClick={async () => {
                  if (selectedStudents.length === 0) {
                    setError("Please select at least one student");
                    return;
                  }

                  setLoadingTranscripts(true);
                  setError(null);

                  try {
                    const response = await apiService.post(
                      endPoints.generateGradeReport,
                      {
                        studentIds: selectedStudents,
                      }
                    );

                    console.log("Transcript Response:", response);

                    const reportsArray = response?.gradeReports ?? [];
                    setRealTranscripts(
                      Array.isArray(reportsArray) ? reportsArray : []
                    );
                  } catch (err: any) {
                    const message =
                      err?.response?.data?.error ||
                      err?.message ||
                      "Failed to generate transcripts";
                    setError(message);
                    setRealTranscripts([]);
                  } finally {
                    setLoadingTranscripts(false);
                  }
                }}
                disabled={selectedStudents.length === 0 || loadingTranscripts}
                className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition ${selectedStudents.length === 0 || loadingTranscripts
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  }`}
              >
                {loadingTranscripts ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin inline mr-3" />
                    Generating Transcripts...
                  </>
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

            {loadingTranscripts && (
              <div className="mt-8 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-600 dark:text-purple-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading real transcripts...
                </p>
              </div>
            )}

            <div className="mt-8 space-y-8">
              {realTranscripts.length > 0 ? (
                realTranscripts.map((report, i) => (
                  <DynamicTranscriptView key={i} report={report} />
                ))
              ) : selectedCount > 0 && !loadingTranscripts ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                  No transcripts generated yet.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// === PRESENTATION COMPONENTS ===
// ────────────────────────────────────────────────
//  Helper: flatten + format one student copy (grade report)
// ────────────────────────────────────────────────
function sanitizeSheetName(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 31);
}

function prepareStudentCopySheets(report: RealGradeReport) {
  const sheets: Record<string, any[][]> = {};

  // ── Student Info ── proper headers + values as array of arrays
  sheets["Student Info"] = [
    [
      "ID Number",
      "Full Name",
      "Gender",
      "Date of Birth (GC)",
      "Date Enrolled (GC)",
      "Department",
      "Program Modality",
      "Program Level",
    ],
    [
      report.idNumber || "",
      report.fullName || "",
      report.gender || "",
      report.birthDateGC || "",
      report.dateEnrolledGC || "",
      report.department?.name || "",
      report.programModality?.name || "",
      report.programLevel?.name || "N/A",
    ],
  ];

  // ── One sheet per semester copy ── (this part was already mostly correct)
  report.studentCopies.forEach((copy) => {
    const sheetName = sanitizeSheetName(
      `Sem_${copy.semester?.name || "Unknown"}`
    );

    const header = [
      "No",
      "Course Code",
      "Course Title",
      "Cr.Hrs",
      "Letter Grade",
      "Grade Point",
    ];

    const rows = copy.courses.map((c, i) => [
      i + 1,
      c.courseCode || "",
      c.courseTitle || "",
      c.totalCrHrs || 0,
      c.letterGrade || "",
      Number(c.gradePoint || 0).toFixed(2),
    ]);

    const totalCr = copy.courses.reduce(
      (sum, c) => sum + (c.totalCrHrs || 0),
      0
    );
    const totalPt = copy.courses.reduce(
      (sum, c) => sum + (c.gradePoint || 0),
      0
    );

    rows.push(["TOTAL", "", "", totalCr.toFixed(2), "", totalPt.toFixed(2)]);
    rows.push([
      "",
      "",
      "",
      "",
      "SGPA",
      Number(copy.semesterGPA || 0).toFixed(2),
    ]);
    rows.push([
      "",
      "",
      "",
      "",
      "CGPA",
      Number(copy.semesterCGPA || 0).toFixed(2),
    ]);
    rows.push(["", "", "", "", "Status", copy.status || ""]);

    sheets[sheetName] = [header, ...rows];
  });

  return sheets;
}

// Same fix for transcripts (copy-paste & adjust field names if needed)
function prepareTranscriptSheets(report: RealGradeReport) {
  const sheets: Record<string, any[][]> = {};

  // ── Student Info ── same structure
  sheets["Student Info"] = [
    [
      "ID Number",
      "Full Name",
      "Gender",
      "Date of Birth (GC)",
      "Date Enrolled (GC)",
      "Department",
      "Program Modality",
      "Program Level",
    ],
    [
      report.idNumber || "",
      report.fullName || "",
      report.gender || "",
      report.birthDateGC || "",
      report.dateEnrolledGC || "",
      report.department?.name || "",
      report.programModality?.name || "",
      report.programLevel?.name || "N/A",
    ],
  ];

  // Semester sheets — same as above
  report.studentCopies.forEach((copy) => {
    const sheetName = sanitizeSheetName(
      `Sem_${copy.semester?.name || "Unknown"}`
    );

    const header = [
      "No",
      "Course Code",
      "Course Title",
      "Cr.Hrs",
      "Letter Grade",
      "Grade Point",
    ];

    const rows = copy.courses.map((c, i) => [
      i + 1,
      c.courseCode || "",
      c.courseTitle || "",
      c.totalCrHrs || 0,
      c.letterGrade || "",
      Number(c.gradePoint || 0).toFixed(2),
    ]);

    const totalCr = copy.courses.reduce(
      (sum, c) => sum + (c.totalCrHrs || 0),
      0
    );
    const totalPt = copy.courses.reduce(
      (sum, c) => sum + (c.gradePoint || 0),
      0
    );

    rows.push(["TOTAL", "", "", totalCr.toFixed(2), "", totalPt.toFixed(2)]);
    rows.push([
      "",
      "",
      "",
      "",
      "SGPA",
      Number(copy.semesterGPA || 0).toFixed(2),
    ]);
    rows.push([
      "",
      "",
      "",
      "",
      "CGPA",
      Number(copy.semesterCGPA || 0).toFixed(2),
    ]);
    rows.push(["", "", "", "", "Status", copy.status || ""]);

    sheets[sheetName] = [header, ...rows];
  });

  // Optional: final CGPA summary sheet
  if (report.studentCopies.length > 0) {
    const lastCopy = report.studentCopies[report.studentCopies.length - 1];
    sheets["Final CGPA"] = [
      [
        "Final Cumulative GPA (CGPA)",
        Number(lastCopy.semesterCGPA || 0).toFixed(2),
      ],
    ];
  }

  return sheets;
}
function RealReportView({ report }: { report: RealGradeReport }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN{" "}
        </h1>
        <p className="text-lg opacity-90">Student Academic Report</p>
        {report.dateIssuedGC && (
          <p className="text-sm opacity-80 mt-2">
            Issued: {report.dateIssuedGC}
          </p>
        )}
      </div>

      {/* Student Basic Info */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
        <div>
          <strong className="text-gray-900 dark:text-white">ID:</strong>{" "}
          {report.idNumber}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">Name:</strong>{" "}
          {report.fullName}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">Gender:</strong>{" "}
          {report.gender}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">
            Date of Birth:
          </strong>{" "}
          {report.birthDateGC}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">Department:</strong>{" "}
          {report.department.name}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">Program:</strong>{" "}
          {report.programLevel.name}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">Enrolled:</strong>{" "}
          {report.dateEnrolledGC}
        </div>
        <div className="md:col-span-4">
          <strong className="text-gray-900 dark:text-white">
            Program Level:
          </strong>{" "}
          {report.programLevel?.name || "N/A"}
        </div>
        <div>
          <strong className="text-gray-900 dark:text-white">
            Enrollment Type:
          </strong>{" "}
          {report.programModality.name}
        </div>
      </div>

      {/* Semester sections */}
      {report.studentCopies.map((copy, idx) => (
        <div
          key={idx}
          className="border-t border-gray-200 dark:border-gray-700 pt-6 px-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {copy.academicYear || "Current Year"} - {copy.semester.name}
            </h3>
            <div className="text-right">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Class Year:
              </span>{" "}
              <strong className="text-gray-900 dark:text-white">
                {copy.classyear.name}
              </strong>
              <br />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status:
              </span>{" "}
              <strong
                className={
                  copy.status === "PASSED"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {copy.status}
              </strong>
            </div>
          </div>

          <div className="mb-4 text-right">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Semester GPA: {copy.semesterGPA.toFixed(2)} | Cumulative GPA:{" "}
              {copy.semesterCGPA.toFixed(2)}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-center">CrH</th>
                  <th className="p-3 text-center">Letter Grade</th>
                  <th className="p-3 text-center">Gr. Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {copy.courses.map((c, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-3 font-mono">{c.courseCode}</td>
                    <td className="p-3">{c.courseTitle}</td>
                    <td className="p-3 text-center">{c.totalCrHrs}</td>
                    <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">
                      {c.letterGrade}
                    </td>
                    <td className="p-3 text-center">
                      {c.gradePoint.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ────────────────────────────────────────────────
          SIGNATURE AREA - added here
      ──────────────────────────────────────────────── */}
      <div className="px-6 py-10 border-t border-gray-300 dark:border-gray-600 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          {/* Registrar signature */}
          <div>
            <div className="border-t-2 border-black dark:border-gray-300 w-64 mx-auto mt-16 mb-2"></div>
            <p className="font-medium text-gray-900 dark:text-white">
              Registrar / Office of the Registrar
            </p>
          </div>

          {/* Department Head / Dean signature */}
          {/* <div>
            <div className="border-t-2 border-black dark:border-gray-300 w-64 mx-auto mt-16 mb-2"></div>
            <p className="font-medium text-gray-900 dark:text-white">
              Head of Department / Dean
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date: ____________________
            </p>
          </div> */}
        </div>

        {/* Optional: Official stamp area */}
      </div>
    </div>
  );
}

function MyReport({ reportData }) {
  console.log(reportData, "testing testinig");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-6 transition-colors">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN{" "}
        </h1>
        <p className="text-lg opacity-90">
          Student Academic Record - Student Copy
        </p>
      </div>

      <div className="m-4 sm:m-8 rounded-lg overflow-hidden"></div>

      {/* STUDENT INFO TABLE */}
      <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                ID Number
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.idNumber}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Date of Birth (GC)
              </td>
              <td className="px-4 py-3">{reportData.dateOfBirthGC}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Gender
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.gender}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Date Enrolled (GC)
              </td>
              <td className="px-4 py-3">{reportData.dateEnrolledGC}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Full Name
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.fullName}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Program Modality
              </td>
              <td className="px-4 py-3">{reportData?.programModality?.name}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Program Level
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData?.programLevel?.name || "-"}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Department
              </td>
              <td className="px-4 py-3">{reportData?.department?.name}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Class Year:
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData?.classyear?.name}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Semester
              </td>
              <td className="px-4 py-3">{reportData?.semester?.name}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Academic Year
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.academicYear || "-"}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Status
              </td>
              <td className="px-4 py-3">{reportData.status}</td>
            </tr>

            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Semester GPA
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.semesterGPA}
              </td>

              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Cumulative GPA
              </td>
              <td className="px-4 py-3">{reportData.semesterCGPA}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* COURSES TABLE */}
      <div className="p-6 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Courses
        </h2>

        <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">Course Code</th>
                <th className="px-4 py-3 text-left">Course Title</th>
                <th className="px-4 py-3 text-center">Cr Hrs</th>
                <th className="px-4 py-3 text-center">Letter Grade</th>
                <th className="px-4 py-3 text-center">Gr. Point</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-300 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {reportData.courses.map((course, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono">{course.courseCode}</td>
                  <td className="px-4 py-3">{course.courseTitle}</td>
                  <td className="px-4 py-3 text-center">{course.totalCrHrs}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                    {course.letterGrade}
                  </td>
                  <td className="px-4 py-3 text-center">{course.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCardView({ reportData }: { reportData: ReportRecord }) {
  const totalCredits = reportData.courses.reduce((a, c) => a + c.credit, 0);
  const totalGP = reportData.courses.reduce((a, c) => a + c.gp, 0);
  const semesterGPA = Number((totalGP / totalCredits).toFixed(2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN{" "}
        </h1>
        <p className="text-lg opacity-90">
          Student Academic Record - Student Copy
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 dark:border-yellow-600/50 m-4 sm:m-8 rounded-lg overflow-hidden backdrop-blur-sm">
        <table className="w-full text-sm border-collapse">
          <tbody className="text-gray-700 dark:text-gray-300">
            <tr className="border-b border-yellow-300 dark:border-yellow-700/50">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                ID Number
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.id}
              </td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Date of Birth
              </td>
              <td className="px-4 py-3">{reportData.dateOfBirth}</td>
            </tr>
            <tr className="border-b border-yellow-300 dark:border-yellow-700/50">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Name
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.name}
              </td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Program
              </td>
              <td className="px-4 py-3">{reportData.program}</td>
            </tr>
            <tr className="border-b border-yellow-300 dark:border-yellow-700/50">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Batch
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.batch}
              </td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Department
              </td>
              <td className="px-4 py-3">{reportData.department}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Academic Year
              </td>
              <td className="px-4 py-3 border-r border-yellow-300 dark:border-yellow-700/50">
                {reportData.academicYear}
              </td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800/40 text-gray-900 dark:text-white border-r border-yellow-300 dark:border-yellow-700/50">
                Semester
              </td>
              <td className="px-4 py-3">{reportData.semester}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-8 pb-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800 dark:text-blue-300">
          {reportData.academicYear} - {reportData.semester}
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-600">
          <table className="w-full text-sm sm:text-base">
            <thead className="bg-blue-700 dark:bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-center">Credit</th>
                <th className="px-4 py-3 text-center">Letter Grade</th>
                <th className="px-4 py-3 text-center">Gr. Point</th>
                <th className="px-4 py-3 text-center">GP×CH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {reportData.courses.map((c, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-center">{c.credit}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700 dark:text-blue-400">
                    {c.grade}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.point.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">{c.gp.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                <td colSpan={2} className="px-4 py-4 text-right">
                  Total
                </td>
                <td className="px-4 py-4 text-center">{totalCredits}</td>
                <td className="px-4 py-4 text-center">-</td>
                <td className="px-4 py-4 text-center">-</td>
                <td className="px-4 py-4 text-center">{totalGP.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/40">
                <td
                  colSpan={4}
                  className="px-4 py-4 text-right text-lg text-gray-900 dark:text-gray-100"
                >
                  Semester GPA
                </td>
                <td
                  colSpan={2}
                  className="px-4 py-4 text-center text-3xl font-bold text-blue-700 dark:text-blue-300"
                >
                  {semesterGPA}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600/50 rounded-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Cumulative GPA
            </p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {reportData.cgpa}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600/50 rounded-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Credits Earned
            </p>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
              {reportData.earnedCredits}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-600/50 rounded-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">Status</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              Good Standing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DynamicTranscriptView({ report }: { report: RealGradeReport }) {
  // Find the FINAL (last) CGPA from the last semester copy
  const finalCGPA =
    report.studentCopies.length > 0
      ? report.studentCopies[
        report.studentCopies.length - 1
      ].semesterCGPA.toFixed(2)
      : "N/A";

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl border-4 border-black dark:border-gray-600 font-mono text-xs sm:text-sm overflow-x-auto transition-colors">
      <div className="text-center py-4 bg-cyan-100 dark:bg-cyan-900 border-b-4 border-black dark:border-gray-600">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN
        </h1>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          STUDENT ACADEMIC TRANSCRIPT
        </h2>
        <p className="font-bold text-gray-800 dark:text-gray-300">
          OFFICE OF REGISTRAR
        </p>
        {report.dateIssuedGC && (
          <p className="text-sm mt-2 opacity-90 text-gray-700 dark:text-gray-400">
            Issued on: {report.dateIssuedGC}
          </p>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800">
        {/* Student info table - unchanged */}
        <table className="w-full border-collapse mb-6">
          <tbody>
            <tr className="bg-cyan-100 dark:bg-cyan-900/50 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold text-gray-900 dark:text-white border-r border-black dark:border-gray-600">
                ID Number
              </td>
              <td className="px-3 py-2 text-gray-800 dark:text-gray-300 border-r border-black dark:border-gray-600">
                {report.idNumber}
              </td>
              <td className="px-3 py-2 font-bold text-gray-900 dark:text-white border-r border-black dark:border-gray-600">
                Full Name
              </td>
              <td
                colSpan={5}
                className="px-3 py-2 text-gray-800 dark:text-gray-300"
              >
                {report.fullName}
              </td>
            </tr>
            {/* ... rest of your student info rows ... */}
            {/* (keep your existing rows for Sex, DOB, Program, etc.) */}
          </tbody>
        </table>

        {/* Semesters grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {report.studentCopies.map((copy, i) => {
            const totalCH = copy.courses.reduce(
              (sum, c) => sum + c.totalCrHrs,
              0
            );
            const totalPoints = copy.courses.reduce(
              (sum, c) => sum + c.gradePoint,
              0
            );

            return (
              <div
                key={i}
                className="border-4 border-black dark:border-gray-600 overflow-hidden"
              >
                <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-xs sm:text-sm">
                  Academic Year: {copy.academicYear || "N/A"} G.C • Semester:{" "}
                  {copy.semester.name} • Class Year: {copy.classyear.name}
                </div>
                <table className="w-full border-collapse bg-white dark:bg-gray-800">
                  <thead className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <tr>
                      <th className="border border-black dark:border-gray-600 px-2 py-1">
                        Code
                      </th>
                      <th className="border border-black dark:border-gray-600 px-2 py-1">
                        Title
                      </th>
                      <th className="border border-black dark:border-gray-600 px-2 py-1">
                        CH
                      </th>
                      <th className="border border-black dark:border-gray-600 px-2 py-1">
                        Letter Grade
                      </th>
                      <th className="border border-black dark:border-gray-600 px-2 py-1">
                        Gr. Point
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-300">
                    {copy.courses.map((c, j) => (
                      <tr
                        key={j}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="border border-black dark:border-gray-600 px-2 py-1 font-mono">
                          {c.courseCode}
                        </td>
                        <td className="border border-black dark:border-gray-600 px-2 py-1">
                          {c.courseTitle}
                        </td>
                        <td className="border border-black dark:border-gray-600 px-2 py-1 text-center">
                          {c.totalCrHrs}
                        </td>
                        <td className="border border-black dark:border-gray-600 px-2 py-1 text-center font-bold text-blue-700 dark:text-blue-400">
                          {c.letterGrade}
                        </td>
                        <td className="border border-black dark:border-gray-600 px-2 py-1 text-center font-mono">
                          {c.gradePoint.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-right text-xs sm:text-sm">
                  TOTAL {totalCH} CH → {totalPoints.toFixed(1)} Points → GPA:{" "}
                  {copy.semesterGPA.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* FINAL CGPA - shown only once at the bottom */}
        <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-600 rounded-lg text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            FINAL CUMULATIVE GPA (CGPA): {finalCGPA}
          </p>
        </div>

        {/* Signature area */}
        <div className="grid grid-cols-2 gap-8 sm:gap-16 p-8 sm:p-12 border-t-4 border-black dark:border-gray-600 mt-8">
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900/40"></div>
            <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              REGISTRAR OFFICE
            </p>
          </div>
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900/40"></div>
            <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              DEAN OFFICE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function TranscriptView({ transcript }: { transcript: TranscriptRecord }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      {/* Header stays the same */}
      <div className="text-center py-4 bg-cyan-100 dark:bg-cyan-900 border-b-4 border-black dark:border-gray-600">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN
        </h1>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
          STUDENT ACADEMIC TRANSCRIPT
        </h2>
        <p className="font-bold text-gray-800 dark:text-gray-300 mt-1">
          OFFICE OF REGISTRAR
        </p>
      </div>

      {/* FIXED COMPACT STUDENT INFO TABLE - 3 rows like your picture */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm border-2 border-black dark:border-gray-600">
          <tbody>
            {/* Row 1: ID + Full Name (wide name) */}
            <tr className="bg-cyan-100 dark:bg-cyan-900/50">
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold w-28">
                ID Number
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.id}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold w-28">
                Full Name
              </td>
              <td
                colSpan={4}
                className="border border-black dark:border-gray-600 px-3 py-2 font-medium"
              >
                {transcript.student.name}
              </td>
            </tr>

            {/* Row 2: Sex, DOB, Program, Enrollment, Birth Date, Issue Date, Field of Study */}
            <tr className="bg-white dark:bg-gray-800">
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Sex
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.gender}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Date of Birth
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.dob}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Program
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.program}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Enrollment Type
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                Regular
              </td>
            </tr>

            {/* Row 3: Batch, Department, Date of Admission */}
            <tr className="bg-cyan-100 dark:bg-cyan-900/50">
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Batch
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.batch || "—"}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Department
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2">
                {transcript.student.department}
              </td>
              <td className="border border-black dark:border-gray-600 px-3 py-2 font-bold">
                Date of Admission
              </td>
              <td
                colSpan={3}
                className="border border-black dark:border-gray-600 px-3 py-2"
              >
                {transcript.student.admissionDate}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Semesters grid - unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {transcript.semesters.map((sem, i) => (
          <div
            key={i}
            className="border-4 border-black dark:border-gray-600 overflow-hidden"
          >
            <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-xs sm:text-sm">
              Academic Year: {sem.year} G.C • {sem.semester} • Class Year I
            </div>
            <table className="w-full border-collapse bg-white dark:bg-gray-800">
              <thead className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <tr>
                  <th className="border border-black dark:border-gray-600 px-2 py-1">
                    Code
                  </th>
                  <th className="border border-black dark:border-gray-600 px-2 py-1">
                    Title
                  </th>
                  <th className="border border-black dark:border-gray-600 px-2 py-1">
                    CH
                  </th>
                  <th className="border border-black dark:border-gray-600 px-2 py-1">
                    Letter Grade
                  </th>
                  <th className="border border-black dark:border-gray-600 px-2 py-1">
                    Gr. Point
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-gray-300">
                {sem.courses.map((c, j) => (
                  <tr
                    key={j}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="border border-black dark:border-gray-600 px-2 py-1 font-mono">
                      {c.code}
                    </td>
                    <td className="border border-black dark:border-gray-600 px-2 py-1">
                      {c.title}
                    </td>
                    <td className="border border-black dark:border-gray-600 px-2 py-1 text-center">
                      {c.ch}
                    </td>
                    <td className="border border-black dark:border-gray-600 px-2 py-1 text-center font-bold text-blue-700 dark:text-blue-400">
                      {c.grade}
                    </td>
                    <td className="border border-black dark:border-gray-600 px-2 py-1 text-center font-mono">
                      {c.point}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-right text-xs sm:text-sm">
              TOTAL {sem.totalCH} CH → {sem.totalPoint} Points → GPA: {sem.gpa}
            </div>
          </div>
        ))}
      </div>

      {/* Signature area - unchanged */}
      <div className="grid grid-cols-2 gap-8 sm:gap-16 p-8 sm:p-12 border-t-4 border-black dark:border-gray-600 mt-8">
        <div className="text-center">
          <div className="h-28 sm:h-32 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900/40"></div>
          <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
            REGISTRAR OFFICE
          </p>
        </div>
        <div className="text-center">
          <div className="h-28 sm:h-32 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900/40"></div>
          <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
            DEAN OFFICE
          </p>
        </div>
      </div>
    </div>
  );
}
