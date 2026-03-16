import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

interface Department {
  dptID: number;
  deptName: string;
  totalCrHr: number | null;
  departmentCode: string;
  programModality: {
    modalityCode: string;
    modality: string;
    programLevel: {
      code: string;
      name: string;
      active: boolean;
    };
  };
  programLevel: {
    code: string;
    name: string;
    active: boolean;
  };
}

interface Course {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  prerequisites: string[];
  teacher: string;
}

export default function DeanDepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [courseError, setCourseError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  interface RawCourse {
    id: number;
    ccode: string;
    ctitle: string;
    theoryHrs: number;
    labHrs: number;
    prerequisites: string[]; // or number[] if they are IDs
  }
  interface DisplayCourse {
    id: number;
    code: string;
    name: string;
    creditHours: number;
    prerequisites: string[];
    teacher?: string; // optional - you don't have this yet
  }
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setCourseError(null);
      setCourses([]);

      try {
        const params = {
          departmentId: Number(id), // ← use the :id from URL (department id)
          // categoryId: ???,                 // add later when you have UI selector
          classYearId: 1, // ← temporary – replace with real value
          semesterId: 1, // ← temporary – replace with real value
        };

        const query = new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
          )
        ).toString();

        const url = `/courses?${query}`; // adjust base path if needed
        // or: const url = `${endPoints.courses}?${query}`;

        console.log("Fetching courses from:", url);

        const res = await apiService.get(endPoints.allCourses);
        //    or if apiService returns axios-like → res.data
        //    if it's raw fetch → await (await fetch(url)).json()

        console.log("Raw response data:", res);
        let courseArray;
        if (Array.isArray(res)) {
          courseArray = res; // ← raw fetch style / direct json
        } else if (res && Array.isArray(res.data)) {
          courseArray = res.data; // ← fallback for axios-like
        } else if (res?.courses && Array.isArray(res.courses)) {
          courseArray = res.courses; // rare – some APIs wrap in {courses: [...]}
        } else {
          throw new Error("Response is not in expected array format");
        }

        // ── Transform backend → frontend shape ───────────────────────
        const mappedCourses: DisplayCourse[] = courseArray.map((raw: any) => {
          const credit = raw.theoryHrs || 0;
          const labCredit = raw.labHrs ? Math.floor(raw.labHrs / 2) : 0; // ← adjust formula as needed

          return {
            id: raw.id,
            code: raw.ccode || raw.code || "—",
            name: raw.ctitle || raw.name || "Unnamed",
            creditHours: credit + labCredit,
            prerequisites: Array.isArray(raw.prerequisites)
              ? raw.prerequisites
              : [],
            teacher: raw.teacher || raw.instructor || "Not Assigned",
          };
        });

        setCourses(mappedCourses);

        if (mappedCourses.length === 0) {
          setCourseError("No courses found");
        }
      } catch (err: any) {
        console.error("Courses fetch failed:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load courses";
        setCourseError(msg);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (id) {
      fetchDepartmentDetails();
    }
  }, [id]);

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch department details
      const deptResponse = await apiService.get(
        endPoints.getDepartmentById(id)
      );
      setDepartment(deptResponse);

      // Note: The API doesn't provide courses by department in the current structure
      // For now, we'll show a placeholder message
      // In a real app, you would fetch courses for this department from another endpoint
      setCourses([]);
    } catch (err) {
      console.error("Error fetching department details:", err);
      setError(err.response?.data?.error || "Department not found");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDepartmentDetails();
  };

  if (loading) {
    return (
      <div className="p-10 space-y-10">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="p-10 space-y-10">
        <div>
          <Button
            className="bg-blue-600 text-white"
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Button>
        </div>
        <div className="bg-red-500 p-8 rounded-2xl shadow-lg text-white">
          <h1 className="text-4xl font-bold">Error</h1>
          <p className="mt-2 text-lg">{error || "Department not found"}</p>
          <Button
            className="mt-4 bg-white text-red-600 hover:bg-gray-100"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const allTeachers = Array.from(new Set(courses.map((c) => c.teacher))).sort();

  return (
    <div className="p-10 space-y-10">
      {/* Go Back Button */}
      <div>
        <Button
          className="bg-blue-600 text-white"
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Departments
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 rounded-2xl shadow-lg text-white">
        <h1 className="text-4xl font-bold">{department.deptName}</h1>
        <p className="mt-2 text-lg">
          Department Code: {department.departmentCode}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm opacity-80">Program Level</p>
            <p className="text-lg font-semibold">
              {department.programLevel?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">Modality</p>
            <p className="text-lg font-semibold">
              {department.programModality?.modality || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">Total Credits</p>
            <p className="text-lg font-semibold">
              {department.totalCrHr !== null ? department.totalCrHr : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        />

        {allTeachers.length > 0 && (
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            <option value="">All Teachers</option>
            {allTeachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Courses Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
          Courses
        </h2>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              No Course Data Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Course information for this department is not available in the
              current API.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Note: The department API endpoint provides basic department
              information but not course details. Course data would need to be
              fetched from a separate endpoint if available.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-gray-800 dark:text-gray-200">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-3 border">Course Code</th>
                <th className="p-3 border">Course Name</th>
                <th className="p-3 border">Credit Hours</th>
                <th className="p-3 border">Prerequisites</th>
                <th className="p-3 border">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {courses
                .filter((course) => {
                  const matchesSearch =
                    course.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    course.code
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const matchesTeacher =
                    selectedTeacher === "" ||
                    course.teacher === selectedTeacher;
                  return matchesSearch && matchesTeacher;
                })
                .map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-3 border font-mono">{course.code}</td>
                    <td className="p-3 border">{course.name}</td>
                    <td className="p-3 border text-center">
                      {course.creditHours}
                    </td>
                    <td className="p-3 border">
                      {course.prerequisites.length > 0
                        ? course.prerequisites.join(", ")
                        : "None"}
                    </td>
                    <td className="p-3 border">{course.teacher}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Department Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Department Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Department ID:
              </span>
              <span className="font-medium">{department.dptID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Department Code:
              </span>
              <span className="font-medium">{department.departmentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Program Level:
              </span>
              <span className="font-medium">
                {department.programLevel?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Program Level Code:
              </span>
              <span className="font-medium">
                {department.programLevel?.code}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Program Modality
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Modality:
              </span>
              <span className="font-medium">
                {department.programModality?.modality}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Modality Code:
              </span>
              <span className="font-medium">
                {department.programModality?.modalityCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Credit Hours:
              </span>
              <span className="font-medium">
                {department.totalCrHr !== null
                  ? department.totalCrHr
                  : "Not Specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Program Active:
              </span>
              <span
                className={`font-medium ${
                  department.programLevel?.active
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {department.programLevel?.active ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
