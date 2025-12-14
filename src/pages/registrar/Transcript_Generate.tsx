"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ScrollText,
  FileText,
  ArrowLeft,
  Download,
  CheckSquare, // ← ADD THIS LINE
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import { Square } from "lucide-react";
import { Loader2 } from "lucide-react";
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
  const [selectedBatch, setSelectedBatch] = useState<string>(""); // "" = no batch selected yet
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all"); // "all" = all departments
  // const [selectedDropDown, setSelectedDropDown] = useState<string>("all");
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
  // === DEMO BATCH DATA ===
  const fakeResponse = {
    idNumber: "STUD-05",
    fullName: "Henok Kebede Desse",
    gender: "MALE",
    programModality: {
      id: "RG",
      name: "Regular",
    },
    programLevel: {
      id: null,
      name: null,
    },
    dateEnrolledGC: "2025-09-01",
    department: {
      id: 2,
      name: "Medicine",
    },
    dateOfBirthGC: "2023-01-01",
    classyear: {
      id: 1,
      name: "1",
    },
    semester: {
      id: "S1",
      name: "First Semester",
    },
    academicYear: null,
    courses: [
      {
        courseCode: "PHYS1011",
        courseTitle: "Human Physilogy",
        totalCrHrs: 6,
        letterGrade: "A+",
        gradePoint: 24.0,
      },
    ],
    semesterGPA: 4.0,
    semesterCGPA: 4.0,
    status: "PASSED",
  };

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
          apiService.get(endPoints.semesters || "/api/semesters"), // e.g., returns [{ id: "S1", name: "First Semester" }]
          apiService.get(endPoints.classYears || "/api/class-years"), // e.g., returns [{ id: 1, name: "Year 1" }]
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

  ///////////// NEEDED AN ATTENTION

  // useEffect(() => {
  //   if (searchType !== "report" || selectedStudents.length === 0) {
  //     setRealReports([]);
  //     return;
  //   }
  //   const fetchReports = async () => {
  //     setLoadingReports(true);
  //     setError(null);
  //     try {
  //       const response = await apiService.post(endPoints.generateGradeReport, {
  //         studentIds: selectedStudents,
  //       });
  //       setRealReports(response.gradeReports || []);
  //     } catch (err) {
  //       setError(
  //         "Failed to generate reports: " + (err.message || "Server error")
  //       );
  //       setRealReports([]);
  //     } finally {
  //       setLoadingReports(false);
  //     }
  //   };
  //   fetchReports();
  // }, []);
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

  // const handleBackToChoice = () => {
  //   setSearchType(null);
  //   setSearchTerm("");
  //   setSelectedBatch("");
  //   setSelectedDepartment("all");
  // };

  // const exportToPDF = () => {
  //   if (!searchType || !selectedBatch) return;

  //   const isReport = searchType === "report";
  //   const doc = new jsPDF("p", "mm", "a4");

  //   const list = isReport ? filteredReports : filteredTranscripts;

  //   if (list.length === 0) return;

  //   list.forEach((item, index) => {
  //     if (index > 0) {
  //       doc.addPage();
  //     }

  //     if (isReport) {
  //       const r = item as ReportRecord;

  //       doc.setFontSize(14);
  //       doc.text("DEUTSCHE HÖHERE MEDIZINISCHE HOCHSCHULE", 10, 15);
  //       doc.setFontSize(11);
  //       doc.text(`Report Card - ${r.academicYear} ${r.semester}`, 10, 22);

  //       doc.setFontSize(10);
  //       doc.text(`ID: ${r.id}`, 10, 30);
  //       doc.text(`Name: ${r.name}`, 10, 36);
  //       doc.text(`Program: ${r.program}`, 10, 42);
  //       doc.text(`Batch: ${r.batch}`, 10, 48);
  //       doc.text(`Department: ${r.department}`, 10, 54);
  //       doc.text(`CGPA: ${r.cgpa}`, 120, 30);
  //       doc.text(`Credits: ${r.earnedCredits}`, 120, 36);

  //       const body = r.courses.map((c) => [
  //         c.code,
  //         c.title,
  //         c.credit,
  //         c.grade,
  //         c.point.toFixed(2),
  //         c.gp.toFixed(2),
  //       ]);

  //       autoTable(doc, {
  //         startY: 60,
  //         head: [["Code", "Title", "Credit", "Grade", "Point", "GP×CH"]],
  //         body,
  //         theme: "grid",
  //         styles: { fontSize: 9 },
  //       });

  //       doc.text(
  //         `Generated for batch ${selectedBatch}${
  //           selectedDepartment !== "all" ? ` - ${selectedDepartment}` : ""
  //         }`,
  //         10,
  //         290
  //       );
  //     } else {
  //       const t = item as TranscriptRecord;

  //       doc.setFontSize(14);
  //       doc.text("DEUTSCHE HOCHSCHULE FÜR MEDIZIN", 10, 15);
  //       doc.setFontSize(11);
  //       doc.text("STUDENT ACADEMIC TRANSCRIPT", 10, 22);

  //       doc.setFontSize(10);
  //       doc.text(`ID: ${t.student.id}`, 10, 30);
  //       doc.text(`Name: ${t.student.name}`, 10, 36);
  //       doc.text(`Program: ${t.student.program}`, 10, 42);
  //       doc.text(`Batch: ${t.student.batch}`, 10, 48);
  //       doc.text(`Department: ${t.student.department}`, 10, 54);
  //       doc.text(`Faculty: ${t.student.faculty}`, 10, 60);
  //       doc.text(`Admission: ${t.student.admissionDate}`, 10, 66);

  //       let currentY = 74;

  //       t.semesters.forEach((s, sIndex) => {
  //         if (sIndex > 0 && currentY > 220) {
  //           doc.addPage();
  //           currentY = 20;
  //         }

  //         doc.setFontSize(11);
  //         doc.text(`${s.year} - ${s.semester} (GPA: ${s.gpa})`, 10, currentY);
  //         currentY += 6;

  //         const body = s.courses.map((c) => [
  //           c.code,
  //           c.title,
  //           c.ch,
  //           c.grade,
  //           c.point,
  //         ]);

  //         autoTable(doc, {
  //           startY: currentY,
  //           head: [["Code", "Title", "CH", "Grade", "Point"]],
  //           body,
  //           theme: "grid",
  //           styles: { fontSize: 9 },
  //           margin: { left: 10, right: 10 },
  //         });

  //         // @ts-ignore: autoTable types
  //         currentY = (doc as any).lastAutoTable.finalY + 10;
  //       });

  //       doc.text(
  //         `Generated for batch ${selectedBatch}${
  //           selectedDepartment !== "all" ? ` - ${selectedDepartment}` : ""
  //         }`,
  //         10,
  //         290
  //       );
  //     }
  //   });

  //   const fileName =
  //     searchType === "report"
  //       ? "ReportCards-Filtered.pdf"
  //       : "Transcripts-Filtered.pdf";

  //   doc.save(fileName);
  // };
  const exportToPDF = () => {
    if (!searchType || (searchType === "report" && realReports.length === 0))
      return;

    const doc = new jsPDF("p", "mm", "a4");
    const reports = searchType === "report" ? realReports : realTranscripts;

    reports.forEach((item, index) => {
      if (index > 0) doc.addPage();

      if (searchType === "report") {
        const r = item as RealGradeReport;
        doc.setFontSize(14);
        doc.text("DEUTSCHE HÖHERE MEDIZINISCHE HOCHSCHULE", 10, 15);
        doc.setFontSize(11);
        doc.text("Student Academic Grade Report", 10, 22);

        // Student Info
        doc.setFontSize(10);
        doc.text(`ID: ${r.idNumber}`, 10, 30);
        doc.text(`Name: ${r.fullName}`, 10, 36);
        doc.text(`Department: ${r.department.name}`, 10, 42);
        doc.text(`Program: ${r.programModality.name}`, 10, 48);

        let y = 60;
        r.studentCopies.forEach((copy) => {
          if (y > 240) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(11);
          doc.text(
            `${copy.academicYear || "Current"} - ${
              copy.semester.name
            } (GPA: ${copy.semesterGPA.toFixed(2)})`,
            10,
            y
          );
          y += 8;

          const body = copy.courses.map((c) => [
            c.courseCode,
            c.courseTitle,
            c.totalCrHrs,
            c.letterGrade,
            c.gradePoint.toFixed(1),
          ]);

          autoTable(doc, {
            startY: y,
            head: [["Code", "Title", "CrH", "Grade", "Point"]],
            body,
            theme: "grid",
            styles: { fontSize: 9 },
          });
          y = (doc as any).lastAutoTable.finalY + 10;
        });
      }
      // Transcript PDF logic remains same (you can update later)
    });

    doc.save(searchType === "report" ? "GradeReports.pdf" : "Transcripts.pdf");
  };

  // === TYPE SELECTION SCREEN ===
  if (!searchType) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md">
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
                label: "Report Cards",
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
                  className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border-2 font-medium text-sm transition-all bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
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

  // return (
  //   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors">
  //     <div className="max-w-7xl mx-auto">
  //       <div className="flex flex-col gap-4 mb-6">
  //         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  //           <button
  //             onClick={handleBackToChoice}
  //             className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg hover:underline"
  //           >
  //             <ArrowLeft className="w-5 h-5" /> Back to Type
  //           </button>

  //           <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
  //             <div className="relative flex-1 min-w-[220px]">
  //               <input
  //                 type="text"
  //                 placeholder={`Search by ID, name or program (${
  //                   isReport ? "Report" : "Transcript"
  //                 })`}
  //                 value={searchTerm}
  //                 onChange={(e) => setSearchTerm(e.target.value)}
  //                 className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base focus:border-blue-600 dark:focus:border-blue-500 outline-none transition"
  //                 disabled={!selectedBatch}
  //               />
  //               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
  //             </div>

  //             <button
  //               onClick={exportToPDF}
  //               disabled={!selectedBatch || activeList.length === 0}
  //               className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow text-sm sm:text-base font-semibold transition ${
  //                 !selectedBatch || activeList.length === 0
  //                   ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
  //                   : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
  //               }`}
  //             >
  //               <Download className="w-5 h-5" /> Export Filtered (PDF)
  //             </button>
  //           </div>
  //         </div>

  //         <div className="flex flex-col sm:flex-row gap-3">
  //           <select
  //             value={selectedBatch}
  //             onChange={(e) => setSelectedBatch(e.target.value)}
  //             className="w-full sm:w-56 px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-800 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-500 outline-none"
  //           >
  //             <option value="">Select batch to view records</option>
  //             <option value="all">All Batches</option>
  //             {batch.map((b) => (
  //               <option key={b.id} value={b.id}>
  //                 {b.batchName}
  //               </option>
  //             ))}
  //           </select>
  //           <select
  //             value={selectedDepartment}
  //             onChange={(e) => setSelectedDepartment(e.target.value)}
  //             className="w-full sm:w-56 px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-800 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-500 outline-none"
  //           >
  //             <option value="">Select deparment to view records</option>
  //             <option value="all">All Department</option>
  //             {deparment.map((b) => (
  //               <option key={b.dptID} value={b.dptID}>
  //                 {b.deptName}
  //               </option>
  //             ))}
  //           </select>
  //           <select
  //             value={manyGradingSystem}
  //             onChange={(e) => setManyGradingSystem(e.target.value)}
  //             className="w-full sm:w-56 px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-800 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-500 outline-none"
  //             // disabled={!selectedBatch}
  //           >
  //             <option value="">Select Grading System</option>

  //             {gradingSystems.map((d) => (
  //               <option key={d.versionName} value={d.versionName}>
  //                 {d.versionName}
  //               </option>
  //             ))}
  //           </select>
  //         </div>
  //       </div>

  //       {!selectedBatch && (
  //         <div className="mt-12 text-center text-gray-600 dark:text-gray-300">
  //           <p className="text-lg">
  //             Please select a batch above to view student records.
  //           </p>
  //         </div>
  //       )}

  //       {selectedBatch && (
  //         <>
  //           <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
  //             {isReport ? "Report Cards" : "Transcripts"} ({count} students)
  //           </h2>

  //           {isReport ? (
  //             <div className="space-y-8">
  //               {loadingReports ? (
  //                 <div className="flex flex-col items-center justify-center py-20">
  //                   <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  //                   <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
  //                     Loading student reports...
  //                   </p>
  //                 </div>
  //               ) : Error ? (
  //                 <div className="text-center py-20">
  //                   <div className="text-red-600 dark:text-red-400 mb-4">
  //                     <svg
  //                       className="w-16 h-16 mx-auto"
  //                       fill="currentColor"
  //                       viewBox="0 0 20 20"
  //                     >
  //                       <path
  //                         fillRule="evenodd"
  //                         d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
  //                         clipRule="evenodd"
  //                       />
  //                     </svg>
  //                   </div>
  //                   <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
  //                     Failed to load student reports
  //                   </p>
  //                   <p className="text-gray-600 dark:text-gray-400 mb-6">
  //                     {Error}
  //                   </p>
  //                   <button
  //                     onClick={() => window.location.reload()} // or call your fetch function again
  //                     className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
  //                   >
  //                     Try Again
  //                   </button>
  //                 </div>
  //               ) : studentReport.length > 0 ? (
  //                 studentReport.map((r, i) => (
  //                   <MyReport key={i} reportData={r} />
  //                 ))
  //               ) : (
  //                 <p className="text-center text-gray-600 dark:text-gray-300 mt-8">
  //                   No real student reports found. (Demo report cards are shown
  //                   below if any)
  //                 </p>
  //               )}

  //               {/* Keep your fake/demo report cards visible always */}
  //               {filteredReports.length === 0 && !loadingReports && (
  //                 <p className="text-center text-gray-600 dark:text-gray-300 mt-8">
  //                   No demo students found for current filters.
  //                 </p>
  //               )}
  //             </div>
  //           ) : (
  //             // Transcripts remain unchanged
  //             <div className="space-y-8">
  //               {filteredTranscripts.map((t) => (
  //                 <TranscriptView key={t.student.id} transcript={t} />
  //               ))}
  //               {filteredTranscripts.length === 0 && (
  //                 <p className="text-center text-gray-600 dark:text-gray-300 mt-8">
  //                   No students found for current batch/department/search.
  //                 </p>
  //               )}
  //             </div>
  //           )}
  //         </>
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToChoice}
            className="flex items-center gap-2 text-blue-600 hover:underline"
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
            className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download /> Export PDF (
            {searchType === "report"
              ? realReports.length
              : transcriptBatch.length}
            )
          </button>
        </div>

        {searchType === "report" ? (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Select Students for Grade Report
            </h2>

            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              <button
                onClick={toggleAllVisible}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
                  <label className="block text-sm font-medium mb-2">
                    Semester
                  </label>
                  <select
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    disabled={loadingDropdowns}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50"
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
                  <label className="block text-sm font-medium mb-2">
                    Class Year
                  </label>
                  <select
                    value={selectedClassYearId}
                    onChange={(e) => setSelectedClassYearId(e.target.value)}
                    disabled={loadingDropdowns}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50"
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
                <div className="text-xl font-semibold">
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
                      // const reportsArray =
                      //   response?.gradeReports ?? response ?? [];
                      // const data = Array.isArray(response)
                      //   ? response
                      //   : response?.data && Array.isArray(response.data)
                      //   ? response.data
                      //   : [];
                      // setRealReports(
                      //   Array.isArray(reportsArray) ? reportsArray : []
                      // );
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
                  className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition ${
                    selectedStudents.length === 0 ||
                    !selectedSemesterId ||
                    !selectedClassYearId ||
                    loadingDropdowns
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
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
              <div className="bg-white rounded-lg shadow overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">ID / Username</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <td className="p-3">
                          {selectedStudents.includes(student.studentId) ? (
                            <CheckSquare className="text-blue-600" />
                          ) : (
                            <Square />
                          )}
                        </td>
                        <td className="p-3">{student.username}</td>
                        <td className="p-3">{student.fullNameENG}</td>
                        <td className="p-3">{student.departmentName}</td>
                        <td className="p-3">{student.bcysDisplayName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-xl font-semibold">
              Selected: {selectedCount} student{selectedCount !== 1 ? "s" : ""}
            </div>

            {loadingReports && (
              <div className="mt-8 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto" />
              </div>
            )}

            <div className="mt-8 space-y-8">
              {realReports.map((report, i) => (
                <RealReportView key={i} report={report} />
              ))}
              {realReports.length === 0 &&
                !loadingReports &&
                selectedCount > 0 && (
                  <p className="text-center text-gray-500">
                    No reports generated yet.
                  </p>
                )}
            </div>
          </>
        ) : (
          // Existing transcript demo view (unchanged)
          // <div className="space-y-8">
          //   {transcriptBatch.map((t) => (
          //     <TranscriptView key={t.student.id} transcript={t} />
          //   ))}
          // </div>
          <>
            <h2 className="text-2xl font-bold mb-4">
              Select Students for Transcript
            </h2>

            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              <button
                onClick={toggleAllVisible}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
              <div className="bg-white rounded-lg shadow overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Select</th>
                      <th className="p-3 text-left">ID / Username</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleStudent(student.studentId)}
                      >
                        <td className="p-3">
                          {selectedStudents.includes(student.studentId) ? (
                            <CheckSquare className="text-blue-600" />
                          ) : (
                            <Square />
                          )}
                        </td>
                        <td className="p-3">{student.username}</td>
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
              <div className="text-xl font-semibold">
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
                className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition ${
                  selectedStudents.length === 0 || loadingTranscripts
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
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
                <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                <p className="mt-4">Loading real transcripts...</p>
              </div>
            )}

            <div className="mt-8 space-y-8">
              {realTranscripts.length > 0 ? (
                realTranscripts.map((report, i) => (
                  <DynamicTranscriptView key={i} report={report} />
                ))
              ) : selectedCount > 0 && !loadingTranscripts ? (
                <p className="text-center text-gray-500 py-10">
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
function RealReportView({ report }: { report: RealGradeReport }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 text-center">
        <h1 className="text-3xl font-bold">
          DEUTSCHE HÖHERE MEDIZINISCHE HOCHSCHULE
        </h1>
        <p className="text-lg">Student Academic Grade Report</p>
        {report.dateIssuedGC && (
          <p className="text-sm opacity-90 mt-2">
            Issued: {report.dateIssuedGC}
          </p>
        )}
      </div>

      {/* Student Basic Info Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50">
        <div>
          <strong>ID:</strong> {report.idNumber}
        </div>
        <div>
          <strong>Name:</strong> {report.fullName}
        </div>
        <div>
          <strong>Gender:</strong> {report.gender}
        </div>
        <div>
          <strong>Date of Birth:</strong> {report.birthDateGC}
        </div>
        <div>
          <strong>Department:</strong> {report.department.name}
        </div>
        <div>
          <strong>Program:</strong> {report.programModality.name}
        </div>
        <div>
          <strong>Enrolled:</strong> {report.dateEnrolledGC}
        </div>
        <div className="md:col-span-4">
          <strong>Program Level:</strong> {report.programLevel?.name || "N/A"}
        </div>
      </div>

      {/* Semester Copies */}
      {report.studentCopies.map((copy, idx) => (
        <div key={idx} className="border-t pt-6 px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">
              {copy.academicYear || "Current Year"} - {copy.semester.name}
            </h3>
            <div className="text-right">
              <span className="text-sm text-gray-600">Class Year:</span>{" "}
              <strong>{copy.classyear.name}</strong>
              <br />
              <span className="text-sm text-gray-600">Status:</span>{" "}
              <strong
                className={
                  copy.status === "PASSED" ? "text-green-600" : "text-red-600"
                }
              >
                {copy.status}
              </strong>
            </div>
          </div>

          <div className="mb-4 text-right">
            <span className="text-lg font-semibold">
              Semester GPA: {copy.semesterGPA.toFixed(2)} | Cumulative GPA:{" "}
              {copy.semesterCGPA.toFixed(2)}
            </span>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Title</th>
                <th className="p-2">CrH</th>
                <th className="p-2">Grade</th>
                <th className="p-2">Point</th>
              </tr>
            </thead>
            <tbody>
              {copy.courses.map((c, i) => (
                <tr key={i}>
                  <td className="p-2">{c.courseCode}</td>
                  <td className="p-2">{c.courseTitle}</td>
                  <td className="p-2 text-center">{c.totalCrHrs}</td>
                  <td className="p-2 text-center font-bold">{c.letterGrade}</td>
                  <td className="p-2 text-center">{c.gradePoint.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function MyReport({ reportData }) {
  console.log(reportData, "testing testinig");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          DEUTSCHE HÖHERE MEDIZINISCHE HOCHSCHULE
        </h1>
        <p className="text-lg opacity-90">
          Student Academic Record - Student Copy
        </p>
      </div>

      <div className="m-4 sm:m-8 rounded-lg overflow-hidden"></div>

      {/* STUDENT INFO TABLE */}
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              ID Number
            </td>
            <td className="px-4 py-3">{reportData.idNumber}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Date of Birth (GC)
            </td>
            <td className="px-4 py-3">{reportData.dateOfBirthGC}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Gender
            </td>
            <td className="px-4 py-3">{reportData.gender}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Date Enrolled (GC)
            </td>
            <td className="px-4 py-3">{reportData.dateEnrolledGC}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Full Name
            </td>
            <td className="px-4 py-3">{reportData.fullName}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Program Modality
            </td>
            <td className="px-4 py-3">{reportData?.programModality?.name}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Program Level
            </td>
            <td className="px-4 py-3">
              {reportData?.programLevel?.name || "-"}
            </td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Department
            </td>
            <td className="px-4 py-3">{reportData?.department?.name}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Class Year
            </td>
            <td className="px-4 py-3">{reportData?.classyear?.name}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Semester
            </td>
            <td className="px-4 py-3">{reportData?.semester?.name}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Academic Year
            </td>
            <td className="px-4 py-3">{reportData.academicYear || "-"}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Status
            </td>
            <td className="px-4 py-3">{reportData.status}</td>
          </tr>

          <tr className="border-b border-yellow-300 dark:border-yellow-700">
            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Semester GPA
            </td>
            <td className="px-4 py-3">{reportData.semesterGPA}</td>

            <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
              Cumulative GPA
            </td>
            <td className="px-4 py-3">{reportData.semesterCGPA}</td>
          </tr>
        </tbody>
      </table>

      {/* COURSES TABLE */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Courses</h2>

        <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">Course Code</th>
              <th className="px-4 py-2">Course Title</th>
              <th className="px-4 py-2">Cr Hrs</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Grade Point</th>
            </tr>
          </thead>

          <tbody>
            {reportData.courses.map((course, i) => (
              <tr
                key={i}
                className="border-t border-gray-300 dark:border-gray-700"
              >
                <td className="px-4 py-2">{course.courseCode}</td>
                <td className="px-4 py-2">{course.courseTitle}</td>
                <td className="px-4 py-2">{course.totalCrHrs}</td>
                <td className="px-4 py-2">{course.letterGrade}</td>
                <td className="px-4 py-2">{course.gradePoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportCardView({ reportData }: { reportData: ReportRecord }) {
  const totalCredits = reportData.courses.reduce((a, c) => a + c.credit, 0);
  const totalGP = reportData.courses.reduce((a, c) => a + c.gp, 0);
  const semesterGPA = Number((totalGP / totalCredits).toFixed(2));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-800 dark:to-blue-950 text-white p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          DEUTSCHE HÖHERE MEDIZINISCHE HOCHSCHULE
        </h1>
        <p className="text-lg opacity-90">
          Student Academic Record - Student Copy
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 m-4 sm:m-8 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                ID Number
              </td>
              <td className="px-4 py-3">{reportData.id}</td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Date of Birth
              </td>
              <td className="px-4 py-3">{reportData.dateOfBirth}</td>
            </tr>
            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Name
              </td>
              <td className="px-4 py-3">{reportData.name}</td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Program
              </td>
              <td className="px-4 py-3">{reportData.program}</td>
            </tr>
            <tr className="border-b border-yellow-300 dark:border-yellow-700">
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Batch
              </td>
              <td className="px-4 py-3">{reportData.batch}</td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Department
              </td>
              <td className="px-4 py-3">{reportData.department}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
                Academic Year
              </td>
              <td className="px-4 py-3">{reportData.academicYear}</td>
              <td className="px-4 py-3 font-bold bg-yellow-200 dark:bg-yellow-800">
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
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center">Point</th>
                <th className="px-4 py-3 text-center">GP×CH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                <td colSpan={2} className="px-4 py-4 text-right">
                  Total
                </td>
                <td className="px-4 py-4 text-center">{totalCredits}</td>
                <td className="px-4 py-4 text-center">-</td>
                <td className="px-4 py-4 text-center">-</td>
                <td className="px-4 py-4 text-center">{totalGP.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/40">
                <td colSpan={4} className="px-4 py-4 text-right text-lg">
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
          <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 rounded-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Cumulative GPA
            </p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {reportData.cgpa}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Credits Earned
            </p>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
              {reportData.earnedCredits}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-400 dark:border-purple-600 rounded-lg p-6">
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
  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl border-4 border-black dark:border-gray-600 font-mono text-xs sm:text-sm overflow-x-auto">
      <div className="text-center py-4 bg-cyan-100 dark:bg-cyan-900 border-b-4 border-black dark:border-gray-600">
        <h1 className="text-xl sm:text-2xl font-bold">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN
        </h1>
        <h2 className="text-lg sm:text-xl font-bold">
          STUDENT ACADEMIC TRANSCRIPT
        </h2>
        <p className="font-bold">OFFICE OF REGISTRAR</p>
        {report.dateIssuedGC && (
          <p className="text-sm mt-2 opacity-90">
            Issued on: {report.dateIssuedGC}
          </p>
        )}
      </div>

      <div className="p-4">
        <table className="w-full border-collapse mb-6">
          <tbody>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">ID Number</td>
              <td className="px-3 py-2">{report.idNumber}</td>
              <td className="px-3 py-2 font-bold">Full Name</td>
              <td colSpan={5} className="px-3 py-2">
                {report.fullName}
              </td>
            </tr>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">Sex</td>
              <td className="px-3 py-2">{report.gender}</td>
              <td className="px-3 py-2 font-bold">Date of Birth</td>
              <td className="px-3 py-2">{report.birthDateGC}</td>
              <td className="px-3 py-2 font-bold">Program</td>
              <td className="px-3 py-2">{report.programModality.name}</td>
              <td className="px-3 py-2 font-bold">Faculty</td>
              <td className="px-3 py-2">Faculty of Health Sciences</td>
            </tr>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">Batch</td>
              <td className="px-3 py-2">—</td>
              <td className="px-3 py-2 font-bold">Department</td>
              <td className="px-3 py-2">{report.department.name}</td>
              <td className="px-3 py-2 font-bold">Date of Admission</td>
              <td colSpan={3} className="px-3 py-2">
                {report.dateEnrolledGC}
              </td>
            </tr>
          </tbody>
        </table>

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
                className="border-4 border-black dark:border-gray-600"
              >
                <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-xs sm:text-sm">
                  Academic Year: {copy.academicYear || "N/A"} G.C •{" "}
                  {copy.semester.name} • Class Year {copy.classyear.name}
                </div>
                <table className="w-full border border-gray-600 dark:border-gray-500">
                  <thead className="bg-gray-300 dark:bg-gray-700">
                    <tr>
                      <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                        Course Code
                      </th>
                      <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                        Course Title
                      </th>
                      <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                        CH
                      </th>
                      <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                        Grade
                      </th>
                      <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                        Point
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {copy.courses.map((c, j) => (
                      <tr
                        key={j}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">
                          {c.courseCode}
                        </td>
                        <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">
                          {c.courseTitle}
                        </td>
                        <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center">
                          {c.totalCrHrs}
                        </td>
                        <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center font-bold text-blue-700 dark:text-blue-400">
                          {c.letterGrade}
                        </td>
                        <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center">
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

        <div className="grid grid-cols-2 gap-8 sm:gap-16 p-8 sm:p-12 border-t-4 border-black dark:border-gray-600 mt-8">
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed rounded-xl mb-4 bg-gray-100 dark:bg-gray-700"></div>
            <p className="font-bold text-base sm:text-lg">REGISTRAR OFFICE</p>
          </div>
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed rounded-xl mb-4 bg-gray-100 dark:bg-gray-700"></div>
            <p className="font-bold text-base sm:text-lg">DEAN OFFICE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
function TranscriptView({ transcript }: { transcript: TranscriptRecord }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl border-4 border-black dark:border-gray-600 font-mono text-xs sm:text-sm overflow-x-auto">
      <div className="text-center py-4 bg-cyan-100 dark:bg-cyan-900 border-b-4 border-black dark:border-gray-600">
        <h1 className="text-xl sm:text-2xl font-bold">
          DEUTSCHE HOCHSCHULE FÜR MEDIZIN
        </h1>
        <h2 className="text-lg sm:text-xl font-bold">
          STUDENT ACADEMIC TRANSCRIPT
        </h2>
        <p className="font-bold">OFFICE OF REGISTRAR</p>
      </div>

      <div className="p-4">
        <table className="w-full border-collapse mb-6">
          <tbody>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">ID Number</td>
              <td className="px-3 py-2">{transcript.student.id}</td>
              <td className="px-3 py-2 font-bold">Full Name</td>
              <td colSpan={5} className="px-3 py-2">
                {transcript.student.name}
              </td>
            </tr>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">Sex</td>
              <td className="px-3 py-2">{transcript.student.gender}</td>
              <td className="px-3 py-2 font-bold">Date of Birth</td>
              <td className="px-3 py-2">{transcript.student.dob}</td>
              <td className="px-3 py-2 font-bold">Program</td>
              <td className="px-3 py-2">{transcript.student.program}</td>
              <td className="px-3 py-2 font-bold">Faculty</td>
              <td className="px-3 py-2">{transcript.student.faculty}</td>
            </tr>
            <tr className="bg-cyan-100 dark:bg-cyan-900 border-2 border-black dark:border-gray-600">
              <td className="px-3 py-2 font-bold">Batch</td>
              <td className="px-3 py-2">{transcript.student.batch}</td>
              <td className="px-3 py-2 font-bold">Department</td>
              <td className="px-3 py-2">{transcript.student.department}</td>
              <td className="px-3 py-2 font-bold">Date of Admission</td>
              <td colSpan={3} className="px-3 py-2">
                {transcript.student.admissionDate}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transcript.semesters.map((sem, i) => (
            <div key={i} className="border-4 border-black dark:border-gray-600">
              <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-center text-xs sm:text-sm">
                Academic Year: {sem.year} G.C • {sem.semester} • Class Year I
              </div>
              <table className="w-full border border-gray-600 dark:border-gray-500">
                <thead className="bg-gray-300 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                      Course Code
                    </th>
                    <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                      Course Title
                    </th>
                    <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                      CH
                    </th>
                    <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                      Grade
                    </th>
                    <th className="border border-gray-600 dark:border-gray-500 px-2 py-1">
                      Point
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sem.courses.map((c, j) => (
                    <tr
                      key={j}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">
                        {c.code}
                      </td>
                      <td className="border border-gray-400 dark:border-gray-600 px-2 py-1">
                        {c.title}
                      </td>
                      <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center">
                        {c.ch}
                      </td>
                      <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center font-bold text-blue-700 dark:text-blue-400">
                        {c.grade}
                      </td>
                      <td className="border border-gray-400 dark:border-gray-600 px-2 py-1 text-center">
                        {c.point}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-orange-500 dark:bg-orange-600 text-white font-bold px-3 py-2 text-right text-xs sm:text-sm">
                TOTAL {sem.totalCH} CH → {sem.totalPoint} Points → GPA:{" "}
                {sem.gpa}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:gap-16 p-8 sm:p-12 border-t-4 border-black dark:border-gray-600 mt-8">
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed rounded-xl mb-4 bg-gray-100 dark:bg-gray-700"></div>
            <p className="font-bold text-base sm:text-lg">REGISTRAR OFFICE</p>
          </div>
          <div className="text-center">
            <div className="h-28 sm:h-32 border-4 border-dashed rounded-xl mb-4 bg-gray-100 dark:bg-gray-700"></div>
            <p className="font-bold text-base sm:text-lg">DEAN OFFICE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
