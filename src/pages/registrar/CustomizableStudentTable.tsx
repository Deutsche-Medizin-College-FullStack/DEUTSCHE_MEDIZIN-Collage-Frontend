// import React, { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// const fakeStudents = [
//   {
//     userId: 1,
//     firstNameENG: "John",
//     firstNameAMH: "ዮሐንስ",
//     fatherNameENG: "Michael",
//     fatherNameAMH: "ሚካኤል",
//     grandfatherNameENG: "David",
//     grandfatherNameAMH: "ዳቪድ",
//     motherNameENG: "Anna",
//     motherNameAMH: "አና",
//     motherFatherNameENG: "Samuel",
//     motherFatherNameAMH: "ሳሙኤል",
//     gender: "MALE",
//     age: 20,
//     phoneNumber: "0912345678",
//     dateOfBirthEC: "2014-05-10",
//     dateOfBirthGC: "2005-01-15",
//     placeOfBirthWoreda: { id: 1, name: "Woreda A" },
//     placeOfBirthZone: { id: 1, name: "Zone A" },
//     placeOfBirthRegion: { id: 1, name: "Region A" },
//     currentAddressWoreda: { id: 2, name: "Woreda B" },
//     currentAddressZone: { id: 2, name: "Zone B" },
//     currentAddressRegion: { id: 2, name: "Region B" },
//     email: "john@example.com",
//     maritalStatus: "SINGLE",
//     impairment: { id: 1, name: "None" },
//     schoolBackground: { id: 1, name: "High School" },
//     contactPersonFirstNameENG: "Peter",
//     contactPersonFirstNameAMH: "ፒተር",
//     contactPersonLastNameENG: "Smith",
//     contactPersonLastNameAMH: "ስሚት",
//     contactPersonPhoneNumber: "0911122233",
//     contactPersonRelation: "Uncle",
//     dateEnrolledEC: "2018-09-01",
//     dateEnrolledGC: "2018-09-11",
//     batchClassYearSemester: { id: 1, name: "2023 Fall" },
//     studentRecentBatch: { id: 1, name: "2023 Fall" },
//     studentRecentStatus: "ACTIVE",
//     departmentEnrolled: { id: 1, name: "Computer Science" },
//     studentRecentDepartment: { id: 1, name: "Computer Science" },
//     programModality: { id: 1, name: "Regular" },
//     isTransfer: false,
//     exitExamUserID: null,
//     exitExamScore: null,
//     isStudentPassExitExam: false,
//     documentStatus: "INCOMPLETE",
//     remark: "Missing some documents",
//   },
//   {
//     userId: 2,
//     firstNameENG: "Sara",
//     firstNameAMH: "ሳራ",
//     fatherNameENG: "Daniel",
//     fatherNameAMH: "ዳንኤል",
//     grandfatherNameENG: "Abel",
//     grandfatherNameAMH: "አቤል",
//     motherNameENG: "Martha",
//     motherNameAMH: "ማርታ",
//     motherFatherNameENG: "Joseph",
//     motherFatherNameAMH: "ጆሴፍ",
//     gender: "FEMALE",
//     age: 22,
//     phoneNumber: "0923456789",
//     dateOfBirthEC: "2012-11-15",
//     dateOfBirthGC: "2003-03-20",
//     placeOfBirthWoreda: { id: 2, name: "Woreda C" },
//     placeOfBirthZone: { id: 2, name: "Zone C" },
//     placeOfBirthRegion: { id: 2, name: "Region C" },
//     currentAddressWoreda: { id: 3, name: "Woreda D" },
//     currentAddressZone: { id: 3, name: "Zone D" },
//     currentAddressRegion: { id: 3, name: "Region D" },
//     email: "sara@example.com",
//     maritalStatus: "MARRIED",
//     impairment: { id: 1, name: "None" },
//     schoolBackground: { id: 1, name: "High School" },
//     contactPersonFirstNameENG: "Mary",
//     contactPersonFirstNameAMH: "ማሪ",
//     contactPersonLastNameENG: "Johnson",
//     contactPersonLastNameAMH: "ጆንሰን",
//     contactPersonPhoneNumber: "0922233344",
//     contactPersonRelation: "Mother",
//     dateEnrolledEC: "2017-09-01",
//     dateEnrolledGC: "2017-09-11",
//     batchClassYearSemester: { id: 2, name: "2023 Spring" },
//     studentRecentBatch: { id: 2, name: "2023 Spring" },
//     studentRecentStatus: "ACTIVE",
//     departmentEnrolled: { id: 2, name: "Mathematics" },
//     studentRecentDepartment: { id: 2, name: "Mathematics" },
//     programModality: { id: 2, name: "Distance" },
//     isTransfer: true,
//     exitExamUserID: "EX12345",
//     exitExamScore: 87.5,
//     isStudentPassExitExam: true,
//     documentStatus: "COMPLETE",
//     remark: "",
//   },
// ];

// const CustomStudentTable = () => {
//   const allKeys = Object.keys(fakeStudents[0]);
//   const defaultColumns = [
//     "userId",
//     "firstNameENG",
//     "fatherNameENG",
//     "gender",
//     "age",
//     "phoneNumber",
//   ];
//   const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedGender, setSelectGender] = useState("");
//   const filteredGender = fakeStudents.filter((student) =>
//     selectedGender ? student.gender == selectedGender : true
//   );

//   const filteredStudents = fakeStudents.filter((student) => {
//     const matchedSearch = searchTerm
//       ? Object.values(student).some(
//           (value) =>
//             value &&
//             value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       : true;
//     const matchedGender = selectedGender
//       ? student.gender == selectedGender
//       : true;
//     return matchedGender && matchedSearch;
//   });

//   const filter = filteredStudents.map((el) => {
//     return Object.fromEntries(
//       Object.entries(el).filter(([key]) => visibleColumns.includes(key))
//     );
//   });

//   const toggleColumn = (key) => {
//     setVisibleColumns((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const renderCell = (student, key) => {
//     const value = student[key];
//     if (value && typeof value === "object") {
//       return value.name || JSON.stringify(value);
//     }
//     return value?.toString() || "-";
//   };

//   function exportToExcel() {
//     const worksheet = XLSX.utils.json_to_sheet(filter);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//     XLSX.writeFile(workbook, "DynamicTable.xlsx");
//   }

//   function exportToPDF() {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [visibleColumns],
//       body: filteredStudents.map((student) =>
//         visibleColumns.map((key) => renderCell(student, key))
//       ),
//       styles: { fontSize: 10, cellPadding: 2 },
//       headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
//       margin: { top: 10 },
//     });
//     doc.save("student_table_report.pdf");
//   }

//   const tableRef = useRef(null);

//   return (
//     <div className="px-4 sm:px-6 lg:px-8 w-full">
//       <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
//         Customizable Student Table
//       </h1>

//       <div className="flex justify-between">
//         <motion.button
//           onClick={() => setIsCollapsed((prev) => !prev)}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
//         >
//           {isCollapsed ? "Show Filters" : "Hide Filters"}
//         </motion.button>
//         <div className="flex space-x-2">
//           <motion.button
//             onClick={exportToExcel}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
//           >
//             Export Excel
//           </motion.button>
//           <motion.button
//             onClick={exportToPDF}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="mb-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 transition-colors"
//           >
//             Export to PDF
//           </motion.button>
//         </div>
//       </div>

//       {!isCollapsed && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6"
//         >
//           <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
//             Select the columns below to filter what is shown in the table.
//           </p>
//           <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {allKeys.map((key) => (
//               <label
//                 key={key}
//                 className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <input
//                   type="checkbox"
//                   checked={visibleColumns.includes(key)}
//                   onChange={() => toggleColumn(key)}
//                   className="h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
//                 />
//                 <span className="capitalize text-gray-700 dark:text-gray-300">
//                   {key}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         <input
//           type="text"
//           placeholder="Search students..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
//         />
//         <select className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
//           <option value="">All Impairments</option>
//           <option value="visual">Visual</option>
//           <option value="hearing">Hearing</option>
//           <option value="physical">Physical</option>
//         </select>
//         <select className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
//           <option value="">All Batches</option>
//           <option value="2020">2020</option>
//           <option value="2021">2021</option>
//           <option value="2022">2022</option>
//         </select>
//         <select className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
//           <option value="">All Classes</option>
//           <option value="A">Class A</option>
//           <option value="B">Class B</option>
//           <option value="C">Class C</option>
//         </select>
//         <select className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
//           <option value="">All Semesters</option>
//           <option value="1">1st Semester</option>
//           <option value="2">2nd Semester</option>
//         </select>
//         <select className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
//           <option value="">All Status</option>
//           <option value="single">Single</option>
//           <option value="married">Married</option>
//         </select>
//         <select
//           onChange={(e) => setSelectGender(e.target.value)}
//           className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
//         >
//           <option value="">All Gender</option>
//           <option value="FEMALE">Women</option>
//           <option value="MALE">Men</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto max-w-[960px] mx-auto">
//         {/* <div className="overflow-x-auto w-full max-w-[960px] lg:max-w-none mx-auto"> */}

//         <table
//           ref={tableRef}
//           className="w-full table-auto border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg"
//           role="grid"
//           aria-label="Customizable Student Table"
//         >
//           <thead className="bg-blue-50 dark:bg-gray-700">
//             <tr>
//               {visibleColumns.map((key) => (
//                 <th
//                   key={key}
//                   className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-blue-600 dark:text-blue-400 font-semibold"
//                 >
//                   {key}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredStudents.map((student) => (
//               <tr
//                 key={student.userId}
//                 className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
//               >
//                 {visibleColumns.map((key) => (
//                   <td
//                     key={key}
//                     className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
//                   >
//                     {renderCell(student, key)}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CustomStudentTable;
"use client";

import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// shadcn/ui components
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
} from "lucide-react";

// Your API setup — keep as they are
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// ─── Types ────────────────────────────────────────────────────────────────
interface NameEntity {
  id: number;
  name: string;
}

interface Student {
  id: number | string;
  firstNameENG: string;
  firstNameAMH?: string;
  fatherNameENG?: string;
  fatherNameAMH?: string;
  grandfatherNameENG?: string;
  grandfatherNameAMH?: string;
  motherNameENG?: string;
  motherNameAMH?: string;
  motherFatherNameENG?: string;
  motherFatherNameAMH?: string;
  gender?: "MALE" | "FEMALE" | string;
  age?: number;
  phoneNumber?: string;
  dateOfBirthEC?: string;
  dateOfBirthGC?: string;
  placeOfBirthWoreda?: NameEntity;
  placeOfBirthZone?: NameEntity;
  placeOfBirthRegion?: NameEntity;
  currentAddressWoreda?: NameEntity;
  currentAddressZone?: NameEntity;
  currentAddressRegion?: NameEntity;
  email?: string;
  maritalStatus?: string;
  impairment?: NameEntity;
  schoolBackground?: NameEntity;
  studentPhoto?: string;
  contactPersonFirstNameENG?: string;
  contactPersonFirstNameAMH?: string;
  contactPersonLastNameENG?: string;
  contactPersonLastNameAMH?: string;
  contactPersonPhoneNumber?: string;
  contactPersonRelation?: string;
  dateEnrolledEC?: string;
  dateEnrolledGC?: string;
  academicYear?: string;
  batchClassYearSemester?: NameEntity | string;
  studentRecentStatus?: string;
  departmentEnrolled?: NameEntity | string;
  programModality?: NameEntity | string;
  documentStatus?: string;
  remark?: string;
  isTransfer?: boolean;
  exitExamUserID?: string | null;
  exitExamScore?: number | null;
  isStudentPassExitExam?: boolean;
  [key: string]: any;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CustomizableStudentTable() {
  const [fields, setFields] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);

  // Filters — using "all" instead of "" to avoid SelectItem validation error
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch metadata + data
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get available fields
        const fieldsRes = await apiClient.get<string[]>(endPoints.fields);
        const allFields = fieldsRes.data ?? [];
        setFields(allFields);

        // Sensible default columns
        const defaults = [
          "id",
          "firstNameENG",
          "fatherNameENG",
          "gender",
          "phoneNumber",
          "age",
          "studentRecentStatus",
          "departmentEnrolled",
          "batchClassYearSemester",
          "documentStatus",
        ].filter((f) => allFields.includes(f));

        setVisibleColumns(
          defaults.length > 0 ? defaults : allFields.slice(0, 8)
        );

        // 2. Get actual student records — keep using endPoints.students
        const studentsRes = await apiClient.get<Student[]>(endPoints.students);
        if (mounted) {
          setStudents(studentsRes.data ?? []);
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

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Filtered students (memoized)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search across visible columns
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

      // Gender filter — skip when "all"
      if (genderFilter !== "all" && student.gender !== genderFilter) {
        return false;
      }

      // Status filter — skip when "all"
      if (
        statusFilter !== "all" &&
        student.studentRecentStatus !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [students, searchTerm, genderFilter, statusFilter, visibleColumns]);

  // Helpers
  const toggleColumn = (field: string) => {
    setVisibleColumns((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const getDisplayValue = (student: Student, field: string): string => {
    const value = student[field];
    if (value == null) return "—";
    if (typeof value === "object" && value?.name) return value.name;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const exportExcel = () => {
    const exportData = filteredStudents.map((s) =>
      Object.fromEntries(
        visibleColumns.map((col) => [col, getDisplayValue(s, col)])
      )
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_export.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [visibleColumns],
      body: filteredStudents.map((s) =>
        visibleColumns.map((col) => getDisplayValue(s, col))
      ),
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { top: 12, left: 10, right: 10 },
    });
    doc.save("students_export.pdf");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Loading student records...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle /> Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
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
              <CardDescription className="mt-1.5">
                {filteredStudents.length} record
                {filteredStudents.length !== 1 ? "s" : ""} found
              </CardDescription>
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
          {/* Column selection panel */}
          {showColumnsPanel && (
            <div className="rounded-lg border bg-card/50 p-5">
              <Label className="mb-3 block text-base font-medium">
                Visible Columns
              </Label>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {fields.map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={`col-${field}`}
                      checked={visibleColumns.includes(field)}
                      onCheckedChange={() => toggleColumn(field)}
                    />
                    <Label
                      htmlFor={`col-${field}`}
                      className="cursor-pointer text-sm font-normal capitalize leading-none"
                    >
                      {field.replace(/([A-Z])/g, " $1")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <Label className="mb-1.5 text-sm">Gender</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="DROPPED">Dropped</SelectItem>
                  {/* Add more statuses according to your actual data */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  {visibleColumns.map((col) => (
                    <TableHead
                      key={col}
                      className="whitespace-nowrap capitalize"
                    >
                      {col.replace(/([A-Z])/g, " $1")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="h-40 text-center text-muted-foreground"
                    >
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
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
