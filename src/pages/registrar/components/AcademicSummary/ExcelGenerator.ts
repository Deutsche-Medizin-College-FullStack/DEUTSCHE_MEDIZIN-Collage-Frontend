import ExcelJS from "exceljs";
import type { ReportSummary } from "./types";
import LOGO_BASE64 from "@/components/Extra/LOGO_BASE64";

interface ExcelGeneratorProps {
  summary: ReportSummary;
}

const COLORS = {
  amber: "F59E0B",
  amberDark: "D97706",
  amberLight: "FEF3C7",
  slate: "64748B",
  red: "DC2626",
  green: "22C55E",
  white: "FFFFFF",
  black: "000000",
  border: "C8C8C8",
};

const thinBorder = (): ExcelJS.Borders => ({
  top: { style: "thin", color: { argb: COLORS.border } },
  bottom: { style: "thin", color: { argb: COLORS.border } },
  left: { style: "thin", color: { argb: COLORS.border } },
  right: { style: "thin", color: { argb: COLORS.border } },
  diagonal: {},
});

const isFGrade = (grade: string | null): boolean => {
  if (!grade) return false;
  const normalizedGrade = grade.toUpperCase().trim();
  return (
    normalizedGrade === "F" ||
    normalizedGrade === "F*" ||
    normalizedGrade.startsWith("F")
  );
};

const setFont = (
  cell: ExcelJS.Cell,
  options: { bold?: boolean; color?: string; size?: number },
) => {
  cell.font = {
    name: "Arial",
    size: options.size ?? 8,
    bold: options.bold ?? false,
    color: { argb: options.color ?? COLORS.black },
  };
};

const setCellStyle = (
  cell: ExcelJS.Cell,
  options: {
    fill?: string;
    bold?: boolean;
    color?: string;
    size?: number;
    horizontal?: ExcelJS.Alignment["horizontal"];
    vertical?: ExcelJS.Alignment["vertical"];
    wrapText?: boolean;
    border?: ExcelJS.Borders;
  } = {},
) => {
  if (options.fill) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: options.fill },
    };
  }
  setFont(cell, options);
  cell.alignment = {
    horizontal: options.horizontal ?? "center",
    vertical: options.vertical ?? "middle",
    wrapText: options.wrapText ?? true,
  };
  if (options.border) cell.border = options.border;
};

const addBrowserDownload = (buffer: ExcelJS.Buffer, fileName: string) => {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const generateGradeReportExcel = async ({
  summary,
}: ExcelGeneratorProps): Promise<void> => {
  const courseMap = new Map<string, string>();
  summary.students.forEach((student) => {
    student.courses.forEach((course) => {
      if (!courseMap.has(course.courseCode)) {
        courseMap.set(course.courseCode, course.courseName);
      }
    });
  });

  const courses = Array.from(courseMap.entries()).map(([code, name]) => ({
    code,
    name,
  }));
  const columnCount = 1 + courses.length * 2 + 3;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Deutsche Hochschule für Medizin";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Academic Summary", {
    pageSetup: {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalDpi: 300,
      verticalDpi: 300,
    },
    properties: { defaultRowHeight: 20 },
  });
  worksheet.pageSetup.margins = {
    left: 0.3,
    right: 0.3,
    top: 0.4,
    bottom: 0.4,
    header: 0.2,
    footer: 0.2,
  };
  worksheet.views = [{ state: "frozen", xSplit: 1, ySplit: 6 }];
  worksheet.pageSetup.printTitlesRow = "5:6";

  for (let column = 1; column <= columnCount; column += 1) {
    worksheet.getColumn(column).width = column === 1 ? 25 : 12;
  }

  worksheet.mergeCells(1, 1, 1, columnCount);
  worksheet.getCell(1, 1).value = summary.header.departmentBcysDisplay || "-";
  worksheet.getRow(1).height = 24;
  for (let column = 1; column <= columnCount; column += 1) {
    setCellStyle(worksheet.getCell(1, column), {
      fill: COLORS.amberDark,
      bold: true,
      color: COLORS.white,
      size: 10,
      border: thinBorder(),
    });
  }

  worksheet.mergeCells(2, 1, 2, columnCount);
  worksheet.getCell(2, 1).value =
    "DEUTSCHE HOCHSCHULE FÜR MEDIZIN MEDICAL COLLEGE";
  worksheet.getRow(2).height = 22;
  for (let column = 1; column <= columnCount; column += 1) {
    setCellStyle(worksheet.getCell(2, column), {
      bold: true,
      size: 9,
      border: thinBorder(),
    });
  }

  worksheet.mergeCells(3, 1, 3, columnCount);
  worksheet.getCell(3, 1).value =
    `SUMMARY OF GRADE REPORT FOR ${summary.header.batchName || ""} Batch ${summary.header.departmentName || ""} Students`;
  worksheet.getRow(3).height = 20;
  for (let column = 1; column <= columnCount; column += 1) {
    setCellStyle(worksheet.getCell(3, column), {
      size: 8,
      border: thinBorder(),
    });
  }

  worksheet.getCell(4, 1).value =
    `Academic Year: ${summary.header.academicYear?.yearGC || "-"} (${summary.header.academicYear?.yearCode || "-"})`;
  worksheet.getCell(4, 2).value =
    `Class Year: ${summary.header.classYearName || "-"}`;
  worksheet.getCell(4, 3).value =
    `Semester: ${summary.header.semesterName || "-"}`;
  worksheet.mergeCells(4, 4, 4, columnCount);
  worksheet.getRow(4).height = 20;
  for (let column = 1; column <= columnCount; column += 1) {
    setCellStyle(worksheet.getCell(4, column), {
      bold: true,
      size: 8,
      horizontal: "left",
      border: thinBorder(),
    });
  }

  worksheet.getCell(5, 1).value = "Student ID";
  worksheet.mergeCells(5, 1, 6, 1);
  let currentColumn = 2;
  courses.forEach((course) => {
    worksheet.getCell(5, currentColumn).value = course.name;
    worksheet.mergeCells(5, currentColumn, 5, currentColumn + 1);
    worksheet.getColumn(currentColumn).width = Math.max(
      16,
      Math.min(32, course.name.length + 4),
    );
    worksheet.getColumn(currentColumn + 1).width = 12;
    currentColumn += 2;
  });
  ["Sem GPA", "CGPA", "Status"].forEach((label) => {
    worksheet.getCell(5, currentColumn).value = label;
    worksheet.mergeCells(5, currentColumn, 6, currentColumn);
    currentColumn += 1;
  });

  currentColumn = 2;
  courses.forEach(() => {
    worksheet.getCell(6, currentColumn).value = "Score";
    worksheet.getCell(6, currentColumn + 1).value = "Grade";
    currentColumn += 2;
  });
  worksheet.getRow(5).height = 30;
  worksheet.getRow(6).height = 22;

  for (let row = 5; row <= 6; row += 1) {
    for (let column = 1; column <= columnCount; column += 1) {
      setCellStyle(worksheet.getCell(row, column), {
        fill: row === 5 ? COLORS.amber : COLORS.slate,
        bold: true,
        color: COLORS.black,
        size: row === 5 ? 9 : 8,
        border: thinBorder(),
      });
    }
  }

  summary.students.forEach((student, studentIndex) => {
    const rowNumber = 7 + studentIndex;
    const row = worksheet.getRow(rowNumber);
    const rowFill = studentIndex % 2 === 0 ? COLORS.white : COLORS.amberLight;
    row.height = 30;

    row.getCell(1).value =
      `${student.studentId}\n${student.firstName || ""} ${student.lastName || ""}`.trim();
    setCellStyle(row.getCell(1), {
      fill: rowFill,
      horizontal: "left",
      border: thinBorder(),
    });

    currentColumn = 2;
    courses.forEach((course) => {
      const studentCourse = student.courses.find(
        (item) => item.courseCode === course.code,
      );
      row.getCell(currentColumn).value =
        studentCourse?.score === null || studentCourse?.score === undefined
          ? "-"
          : studentCourse.score;
      row.getCell(currentColumn + 1).value = studentCourse?.letterGrade || "-";
      setCellStyle(row.getCell(currentColumn), {
        fill: rowFill,
        border: thinBorder(),
      });
      setCellStyle(row.getCell(currentColumn + 1), {
        fill: isFGrade(studentCourse?.letterGrade || null)
          ? COLORS.red
          : rowFill,
        color: isFGrade(studentCourse?.letterGrade || null)
          ? COLORS.white
          : COLORS.black,
        bold: isFGrade(studentCourse?.letterGrade || null),
        border: thinBorder(),
      });
      currentColumn += 2;
    });

    row.getCell(currentColumn).value =
      student.semesterGPA === null || student.semesterGPA === undefined
        ? "-"
        : student.semesterGPA;
    row.getCell(currentColumn + 1).value =
      student.semesterCGPA === null || student.semesterCGPA === undefined
        ? "-"
        : student.semesterCGPA;
    row.getCell(currentColumn + 2).value = student.status || "-";
    for (let column = currentColumn; column <= currentColumn + 2; column += 1) {
      setCellStyle(row.getCell(column), {
        fill: rowFill,
        color:
          column === currentColumn + 2 &&
          student.status?.toUpperCase() === "PASSED"
            ? COLORS.green
            : column === currentColumn + 2 &&
                student.status?.toUpperCase() === "FAILED"
              ? COLORS.red
              : COLORS.black,
        bold: column === currentColumn + 2,
        border: thinBorder(),
      });
    }
    row.getCell(currentColumn).numFmt = "0.00";
    row.getCell(currentColumn + 1).numFmt = "0.00";
  });

  const footerStartRow = 8 + summary.students.length;
  worksheet.getRow(footerStartRow).height = 10;
  worksheet.getRow(footerStartRow + 1).height = 22;
  worksheet.getRow(footerStartRow + 2).height = 22;
  const footerRows = [
    ["REGISTRAR:", "", "", "SIGN:", "", "", "DATE:"],
    ["DEAN:", "", "", "SIGN:", "", "", "DATE:"],
  ];
  footerRows.forEach((values, index) => {
    const row = worksheet.getRow(footerStartRow + 1 + index);
    values.forEach((value, column) => {
      row.getCell(column + 1).value = value;
      row.getCell(column + 1).border = {
        bottom: { style: "thin", color: { argb: COLORS.black } },
      };
      setFont(row.getCell(column + 1), { bold: true, size: 9 });
      row.getCell(column + 1).alignment = { vertical: "middle" };
    });
  });

  if (LOGO_BASE64) {
    const imageId = workbook.addImage({
      base64: LOGO_BASE64,
      extension: "jpeg",
    });
    worksheet.addImage(imageId, {
      tl: { col: 2.2, row: 1.15 },
      ext: { width: 52, height: 52 },
    });
  }

  worksheet.autoFilter = {
    from: { row: 6, column: 1 },
    to: { row: 6 + summary.students.length, column: columnCount },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  addBrowserDownload(
    buffer,
    `Academic_Summary_${summary.header.departmentBcysDisplay || "Report"}.xlsx`,
  );
};

export default generateGradeReportExcel;
