import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportSummary, StudentSummary } from "./types";
import LOGO_BASE64 from "@/components/Extra/LOGO_BASE64";

interface PDFGeneratorProps {
  summary: ReportSummary;
}

export const generateGradeReportPDF = async ({
  summary,
}: PDFGeneratorProps) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 8;
  const marginRight = 8;

  // Extract unique courses
  const uniqueCourses = () => {
    const courseMap = new Map<string, string>();
    summary.students.forEach((student) => {
      student.courses.forEach((course) => {
        if (!courseMap.has(course.courseCode)) {
          courseMap.set(course.courseCode, course.courseName);
        }
      });
    });
    return Array.from(courseMap.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  };

  const courses = uniqueCourses();
  const students = summary.students;

  // Helper to check F grade
  const isFGrade = (grade: string | undefined): boolean => {
    if (!grade) return false;
    const upperGrade = grade.toUpperCase().trim();
    return (
      upperGrade === "F" || upperGrade === "F*" || upperGrade.startsWith("F")
    );
  };

  // Draw header (only on first page)
  const drawHeader = (isFirstPage: boolean) => {
    if (!isFirstPage) return;

    // Gold Title Strip
    doc.setFillColor(217, 119, 6);
    doc.rect(marginLeft, 8, pageWidth - marginLeft - marginRight, 6, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(summary.header.departmentBcysDisplay || "-", pageWidth / 2, 12.5, {
      align: "center",
    });

    // Logo - placed independently on left (doesn't push text)
    if (LOGO_BASE64) {
      try {
        doc.addImage(LOGO_BASE64, "PNG", 30, 15, 10, 10);
      } catch (e) {
        console.error("Failed to add logo", e);
      }
    }

    // College Name - keeps same Y positions
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      "DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE",
      pageWidth / 2,
      20,
      { align: "center" },
    );

    // Subtitle
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `SUMMARY OF GRADE REPORT FOR ${summary.header.batchName || ""} Batch ${summary.header.departmentName || ""} Students`,
      pageWidth / 2,
      24,
      { align: "center" },
    );

    // Academic Info Row
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const academicY = 30;
    doc.text(
      `Academic Year: ${summary.header.academicYear?.yearGC || "-"} (${summary.header.academicYear?.yearCode || "-"})`,
      marginLeft,
      academicY,
    );
    doc.text(
      `Class Year: ${summary.header.classYearName || "-"}`,
      marginLeft + 60,
      academicY,
    );
    doc.text(
      `Semester: ${summary.header.semesterName || "-"}`,
      marginLeft + 110,
      academicY,
    );
  };

  // Draw footer with signatures (right after table ends)
  const drawFooter = (isLastPage: boolean) => {
    if (!isLastPage) return;

    // Get where the table ended
    const finalY = (doc as any).lastAutoTable?.finalY || pageHeight - 30;

    // Add a small gap after table
    const footerY = finalY + 8;

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    // First row - REGISTRAR
    doc.text("REGISTRAR:", marginLeft + 10, footerY);
    doc.line(marginLeft + 38, footerY - 1, marginLeft + 78, footerY - 1);

    doc.text("SIGN:", marginLeft + 95, footerY);
    doc.line(marginLeft + 115, footerY - 1, marginLeft + 155, footerY - 1);

    doc.text("DATE:", marginLeft + 172, footerY);
    doc.line(marginLeft + 192, footerY - 1, marginLeft + 232, footerY - 1);

    // Second row - DEAN
    doc.text("DEAN:", marginLeft + 10, footerY + 8);
    doc.line(marginLeft + 38, footerY + 7, marginLeft + 78, footerY + 7);

    doc.text("SIGN:", marginLeft + 95, footerY + 8);
    doc.line(marginLeft + 115, footerY + 7, marginLeft + 155, footerY + 7);

    doc.text("DATE:", marginLeft + 172, footerY + 8);
    doc.line(marginLeft + 192, footerY + 7, marginLeft + 232, footerY + 7);
  };

  // Build table headers
  const buildTableHeaders = () => {
    const headers: any[] = [];

    // Student ID column
    headers.push({
      content: "Student ID",
      rowSpan: 2,
      styles: { halign: "center", valign: "middle" },
    });

    // Course columns (each with Score and Grade sub-columns)
    courses.forEach((course) => {
      headers.push({
        content: course.name,
        colSpan: 2,
        styles: { halign: "center", fillColor: [245, 158, 11] },
      });
    });

    // Summary columns
    headers.push({
      content: "Sem GPA",
      rowSpan: 2,
      styles: { halign: "center", fillColor: [245, 158, 11] },
    });
    headers.push({
      content: "CGPA",
      rowSpan: 2,
      styles: { halign: "center", fillColor: [245, 158, 11] },
    });
    headers.push({
      content: "Status",
      rowSpan: 2,
      styles: { halign: "center", fillColor: [245, 158, 11] },
    });

    return headers;
  };

  const buildSubHeaders = () => {
    const subHeaders: any[] = [];

    // NO empty cell for Student ID - rowSpan handles it

    // Score and Grade for each course
    courses.forEach(() => {
      subHeaders.push({
        content: "Score",
        styles: { fillColor: [100, 116, 139], textColor: [0, 0, 0] },
      });
      subHeaders.push({
        content: "Grade",
        styles: { fillColor: [100, 116, 139], textColor: [0, 0, 0] },
      });
    });

    // Empty for summary columns (their rowSpan handles them)
    subHeaders.push({ content: "" });
    subHeaders.push({ content: "" });
    subHeaders.push({ content: "" });

    return subHeaders;
  };

  // Build table body with alternating row colors
  const buildTableBody = () => {
    const body: any[] = [];

    students.forEach((student, index) => {
      const row: any[] = [];
      const isEvenRow = index % 2 === 0;

      // Student ID with name
      row.push({
        content:
          `${student.studentId}\n${student.firstName || ""} ${student.lastName || ""}`.trim(),
        styles: {
          halign: "left",
          valign: "middle",
          textColor: [0, 0, 0],
          fillColor: isEvenRow ? [255, 255, 255] : [254, 243, 199], // White or light orange (amber-50)
        },
      });

      // Course scores and grades
      courses.forEach((course) => {
        const studentCourse = student.courses.find(
          (c) => c.courseCode === course.code,
        );
        const score =
          studentCourse?.score !== undefined ? studentCourse.score : "-";
        const grade = studentCourse?.letterGrade || "-";
        const isF = isFGrade(grade);

        row.push({
          content: score,
          styles: {
            halign: "center",
            textColor: [0, 0, 0],
            fillColor: isEvenRow ? [255, 255, 255] : [254, 243, 199],
          },
        });

        row.push({
          content: grade,
          styles: {
            halign: "center",
            fillColor: isF
              ? [220, 38, 38]
              : isEvenRow
                ? [255, 255, 255]
                : [254, 243, 199],
            textColor: isF ? [255, 255, 255] : [0, 0, 0],
          },
        });
      });

      // Sem GPA
      row.push({
        content: student.semesterGPA?.toFixed(2) || "-",
        styles: {
          halign: "center",
          textColor: [0, 0, 0],
          fillColor: isEvenRow ? [255, 255, 255] : [254, 243, 199],
        },
      });

      // CGPA
      row.push({
        content: student.semesterCGPA?.toFixed(2) || "-",
        styles: {
          halign: "center",
          textColor: [0, 0, 0],
          fillColor: isEvenRow ? [255, 255, 255] : [254, 243, 199],
        },
      });

      // Status
      const isPassed = student.status?.toUpperCase() === "PASSED";
      row.push({
        content: student.status || "-",
        styles: {
          halign: "center",
          fillColor: isEvenRow ? [255, 255, 255] : [254, 243, 199],
          textColor: isPassed
            ? [34, 197, 94]
            : student.status?.toUpperCase() === "FAILED"
              ? [220, 38, 38]
              : [0, 0, 0],
        },
      });

      body.push(row);
    });

    return body;
  };

  // Track pages to know when to show header/footer
  let isFirstPage = true;
  let totalPages = 0;

  // First, render to calculate total pages
  const headers = buildTableHeaders();
  const subHeaders = buildSubHeaders();
  const body = buildTableBody();
  const tableStartY = 31;
  const footerReserve = 28;
  const estimatedHeaderHeight = 12;
  const minimumTableHeight = pageHeight - tableStartY - footerReserve;
  const minimumBodyRowHeight = students.length
    ? Math.max(
        0,
        (minimumTableHeight - estimatedHeaderHeight) / students.length,
      )
    : 0;

  // Draw initial header on first page
  drawHeader(true);

  autoTable(doc, {
    head: [headers, subHeaders],
    body: body,
    startY: tableStartY,
    margin: { left: marginLeft, right: marginRight },
    styles: {
      fontSize: 8,
      //   cellPadding: { top: 1.5, bottom: 1.5, left: 0.5, right: 0.5 },
      cellPadding: 0.5,
      valign: "middle",
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    bodyStyles: {
      minCellHeight: minimumBodyRowHeight,
    },
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [254, 243, 199], // Light orange for alternate rows
    },
    didDrawPage: (data) => {
      totalPages = data.pageCount;
    },
  });

  // Draw footer on the last page after table is complete
  const finalY = (doc as any).lastAutoTable?.finalY;
  if (finalY) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const footerY = finalY + 8;
    const marginLeft = 15;

    // First row - REGISTRAR
    doc.text("REGISTRAR:", marginLeft + 10, footerY);
    doc.line(marginLeft + 38, footerY - 1, marginLeft + 78, footerY - 1);
    doc.text("SIGN:", marginLeft + 95, footerY);
    doc.line(marginLeft + 115, footerY - 1, marginLeft + 155, footerY - 1);
    doc.text("DATE:", marginLeft + 172, footerY);
    doc.line(marginLeft + 192, footerY - 1, marginLeft + 232, footerY - 1);

    // Second row - DEAN
    doc.text("DEAN:", marginLeft + 10, footerY + 8);
    doc.line(marginLeft + 38, footerY + 7, marginLeft + 78, footerY + 7);
    doc.text("SIGN:", marginLeft + 95, footerY + 8);
    doc.line(marginLeft + 115, footerY + 7, marginLeft + 155, footerY + 7);
    doc.text("DATE:", marginLeft + 172, footerY + 8);
    doc.line(marginLeft + 192, footerY + 7, marginLeft + 232, footerY + 7);
  }

  // Save the PDF
  doc.save(
    `Academic_Summary_${summary.header.departmentBcysDisplay || "Report"}.pdf`,
  );
};
