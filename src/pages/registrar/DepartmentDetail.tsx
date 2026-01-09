import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiService from "../../components/api/apiService";
import endPoints from "../../components/api/endPoints";

interface Course {
  id: number;
  ccode: string;
  ctitle: string;
  theoryHrs: number;
  labHrs: number;
  courseCategory: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  prerequisites: {
    id: number;
    name: string;
    ccode: string;
  }[];
  classYear: {
    id: number;
    name: string;
  };
  semester: {
    code: string;
    name: string;
  };
}

interface DepartmentData {
  dptID: number;
  deptName: string;
  totalCrHr: number | null;
  departmentCode: string;
  programModality?: {
    modalityCode: string;
    modality: string;
    programLevel: {
      code: string;
      name: string;
      active: boolean;
    };
  };
  programLevel?: {
    code: string;
    name: string;
    active: boolean;
  } | null;
}

interface DepartmentInfo {
  id: string;
  name: string;
  description: string;
  programLevelCode: string;
  modalityCode: string;
  programLevelName: string;
  modalityName: string;
  courses: Course[];
  years?: {
    id: string;
    name: string;
    semesters: {
      id: string;
      name: string;
      courses: any[];
    }[];
  }[];
  departmentData?: DepartmentData;
}

export default function DepartmentDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get data passed from navigation or fetch it
  const { 
    programLevelCode = "", 
    modalityCode = "", 
    departmentData: passedDepartmentData 
  } = (location.state as any) || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set());
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editValues, setEditValues] = useState({
    code: "",
    name: "",
    theoryHrs: "",
    labHrs: "",
    courseCategoryID: "",
    departmentID: "",
    classYearID: "",
    semesterCode: "",
    prerequisiteIds: [] as number[],
  });

  const [newCourse, setNewCourse] = useState({
    cTitle: "",
    cCode: "",
    theoryHrs: "",
    labHrs: "",
    courseCategoryID: "",
    departmentID: "",
    classYearID: "",
    semesterCode: "",
    prerequisiteIds: [] as number[],
  });

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentCoursesForPrerequisites, setDepartmentCoursesForPrerequisites] = useState<Course[]>([]);
  const [departmentDetails, setDepartmentDetails] = useState<DepartmentData | null>(null);

  // If we have passed department data, use it immediately
  useEffect(() => {
    if (passedDepartmentData) {
      setDepartmentDetails(passedDepartmentData);
      setDepartmentId(passedDepartmentData.dptID);
    }
  }, [passedDepartmentData]);

  // If no department data was passed, fetch it by ID
  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      if (!id) return;
      
      try {
        const deptId = parseInt(id);
        const response = await apiService.get(`/api/departments/${deptId}`);
        setDepartmentDetails(response);
        setDepartmentId(response.dptID);
      } catch (error) {
        console.error("Error fetching department details:", error);
        // If fetch fails, use passed data if available
        if (passedDepartmentData) {
          setDepartmentDetails(passedDepartmentData);
          setDepartmentId(passedDepartmentData.dptID);
        }
      }
    };

    // Only fetch if we don't have passed data
    if (!passedDepartmentData) {
      fetchDepartmentDetails();
    }
  }, [id, passedDepartmentData]);

  // Get level and modality names from department data
  const getProgramLevelAndModality = () => {
    // Use passed values as fallback
    let levelCode = programLevelCode;
    let modalityCodeValue = modalityCode;
    
    if (departmentDetails) {
      levelCode = departmentDetails.programModality?.programLevel?.code || 
                  departmentDetails.programLevel?.code || 
                  programLevelCode;
      modalityCodeValue = departmentDetails.programModality?.modalityCode || modalityCode;
    }
    
    return {
      programLevelCode: levelCode,
      modalityCode: modalityCodeValue,
      programLevelName: getLevelName(levelCode),
      modalityName: getModalityName(modalityCodeValue),
    };
  };

  const getLevelName = (code: string) => {
    if (departmentDetails?.programModality?.programLevel?.name) {
      return departmentDetails.programModality.programLevel.name;
    }
    
    const map: Record<string, string> = {
      BCH: "Bachelor's Degree",
      DEG: "Bachelor's Degree",
      DIP: "Diploma",
      MSC: "Master's Degree",
      PHD: "PhD",
      TVET: "TVET",
    };
    return map[code] || code || "Unknown Level";
  };

  const getModalityName = (code: string) => {
    if (departmentDetails?.programModality?.modality) {
      return departmentDetails.programModality.modality;
    }
    
    if (!code) return "Unknown";
    if (code.includes("REG") || code === "RG") return "Regular";
    if (code.includes("EXT")) return "Extension";
    if (code.includes("DIS")) return "Distance";
    if (code.includes("SUM")) return "Summer";
    if (code.includes("EVE")) return "Evening";
    return code.split("-")[0] || "Unknown";
  };

  const { programLevelCode: finalProgramLevelCode, modalityCode: finalModalityCode, 
          programLevelName, modalityName } = getProgramLevelAndModality();
  
  const fullProgramDisplay = `${modalityName} – ${programLevelName}`;

  // Fetch courses for prerequisites
  useEffect(() => {
    const fetchCoursesForPrerequisites = async () => {
      if (!departmentId) return;
      try {
        const courses = await apiService.get(`/courses/department/${departmentId}`);
        setDepartmentCoursesForPrerequisites(courses);
      } catch (error) {
        console.error("Error fetching courses for prerequisites:", error);
      }
    };

    if (departmentId) {
      fetchCoursesForPrerequisites();
    }
  }, [departmentId]);

  // Fetch department courses
  const fetchDepartmentCourses = async () => {
    if (!departmentId) return;

    try {
      setIsLoading(true);
      const departmentCourses = await apiService.get(`/courses/department/${departmentId}`);

      if (!departmentCourses || departmentCourses.length === 0) {
        setDepartment({
          id: id || "",
          name: departmentDetails?.deptName || id || "",
          description: `${departmentDetails?.deptName || id} Department`,
          programLevelCode: finalProgramLevelCode,
          modalityCode: finalModalityCode,
          programLevelName,
          modalityName,
          courses: [],
          departmentData: departmentDetails || undefined,
        });
        setIsLoading(false);
        return;
      }

      const groupedCourses = departmentCourses.reduce((acc: any, course: Course) => {
        const year = course.classYear?.name || "Unknown";
        const semester = course.semester?.name || "Unknown Semester";

        if (!acc[year]) acc[year] = {};
        if (!acc[year][semester]) acc[year][semester] = [];

        acc[year][semester].push({
          id: course.id.toString(),
          name: course.ctitle,
          code: course.ccode,
          creditHours: course.theoryHrs + course.labHrs,
          prerequisites: course.prerequisites?.map((p: any) => p.ccode || p.prerequisiteCode) || [],
          teacher: "Not Assigned", // API doesn't have teacher field
          theoryHrs: course.theoryHrs,
          labHrs: course.labHrs,
          category: course.courseCategory?.name || "Unknown",
          originalCourse: course,
        });

        return acc;
      }, {});

      const departmentInfo: DepartmentInfo = {
        id: id || "",
        name: departmentDetails?.deptName || departmentCourses[0]?.department.name || id || "",
        description: `${departmentDetails?.deptName || departmentCourses[0]?.department.name || id} Department`,
        programLevelCode: finalProgramLevelCode,
        modalityCode: finalModalityCode,
        programLevelName,
        modalityName,
        courses: departmentCourses,
        years: Object.entries(groupedCourses).map(([year, semesters]: [string, any]) => ({
          id: `year${year}`,
          name: `${year} Year`,
          semesters: Object.entries(semesters).map(([semester, courses]: [string, any], index) => ({
            id: `sem${index + 1}`,
            name: semester,
            courses: courses,
          })),
        })),
        departmentData: departmentDetails || undefined,
      };

      setDepartment(departmentInfo);

      if (departmentInfo.years && departmentInfo.years.length > 0) {
        setExpandedYears(new Set([departmentInfo.years[0].id]));
      }
    } catch (error) {
      console.error("Error fetching department courses:", error);
      setDepartment({
        id: id || "",
        name: departmentDetails?.deptName || id || "",
        description: `${departmentDetails?.deptName || id} Department`,
        programLevelCode: finalProgramLevelCode,
        modalityCode: finalModalityCode,
        programLevelName,
        modalityName,
        courses: [],
        departmentData: departmentDetails || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentCourses();
    } else {
      // If we don't have departmentId yet, set loading to false
      setIsLoading(false);
    }
  }, [departmentId, id, departmentDetails, finalProgramLevelCode, finalModalityCode, programLevelName, modalityName]);

  const toggleYear = (yearId: string) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(yearId)) {
      newExpandedYears.delete(yearId);
      const newExpandedSemesters = new Set(expandedSemesters);
      department?.years?.find(y => y.id === yearId)?.semesters.forEach(s => newExpandedSemesters.delete(s.id));
      setExpandedSemesters(newExpandedSemesters);
    } else {
      newExpandedYears.add(yearId);
    }
    setExpandedYears(newExpandedYears);
  };

  const toggleSemester = (semesterId: string) => {
    const newExpandedSemesters = new Set(expandedSemesters);
    if (newExpandedSemesters.has(semesterId)) {
      newExpandedSemesters.delete(semesterId);
    } else {
      newExpandedSemesters.add(semesterId);
    }
    setExpandedSemesters(newExpandedSemesters);
  };

  const getFilteredCourses = (courses: any[]) => {
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAddCourse = async () => {
    const {
      cTitle,
      cCode,
      theoryHrs,
      labHrs,
      courseCategoryID,
      departmentID,
      classYearID,
      semesterCode,
      prerequisiteIds,
    } = newCourse;

    if (!cTitle || !cCode || !theoryHrs || !labHrs || !courseCategoryID || !departmentID || !classYearID || !semesterCode) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await apiService.post(endPoints.courses, {
        cTitle,
        cCode,
        theoryHrs: parseInt(theoryHrs),
        labHrs: parseInt(labHrs),
        courseCategoryID: parseInt(courseCategoryID),
        departmentID: parseInt(departmentID),
        classYearID: parseInt(classYearID),
        semesterCode,
        prerequisiteIds,
      });

      if (response) {
        alert("Course added successfully!");
        // Refresh the course list
        await fetchDepartmentCourses();
        // Refresh prerequisites list
        const courses = await apiService.get(`/courses/department/${departmentId}`);
        setDepartmentCoursesForPrerequisites(courses);
        // Reset form
        setNewCourse({
          cTitle: "",
          cCode: "",
          theoryHrs: "",
          labHrs: "",
          courseCategoryID: "",
          departmentID: "",
          classYearID: "",
          semesterCode: "",
          prerequisiteIds: [],
        });
        setIsFormOpen(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to add course");
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse({ id: course.id, originalCourse: course.originalCourse });
    setEditValues({
      code: course.code,
      name: course.name,
      theoryHrs: course.theoryHrs.toString(),
      labHrs: course.labHrs.toString(),
      courseCategoryID: course.originalCourse?.courseCategory?.id?.toString() || "",
      departmentID: course.originalCourse?.department?.id?.toString() || "",
      classYearID: course.originalCourse?.classYear?.id?.toString() || "",
      semesterCode: course.originalCourse?.semester?.code || "",
      prerequisiteIds: course.originalCourse?.prerequisites?.map((p: any) => p.id) || [],
    });
  };

  const handleUpdateCourse = async (courseId: string) => {
    if (!editValues.code || !editValues.name || !editValues.theoryHrs || !editValues.labHrs) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await apiService.put(`/courses/${courseId}`, {
        cTitle: editValues.name,
        cCode: editValues.code,
        theoryHrs: parseInt(editValues.theoryHrs),
        labHrs: parseInt(editValues.labHrs),
        courseCategoryID: parseInt(editValues.courseCategoryID),
        departmentID: parseInt(editValues.departmentID),
        classYearID: parseInt(editValues.classYearID),
        semesterCode: editValues.semesterCode,
        prerequisiteIds: editValues.prerequisiteIds,
      });

      // Check for success message - adjust based on your API response
      if (response && (response.message === "Course updated successfully" || response.id)) {
        alert("Course updated successfully!");
        setEditingCourse(null);
        // Refresh the course list to show updated data
        await fetchDepartmentCourses();
        // Refresh prerequisites list
        const courses = await apiService.get(`/courses/department/${departmentId}`);
        setDepartmentCoursesForPrerequisites(courses);
      } else {
        // If no clear success message but response exists, assume success
        alert("Course updated successfully!");
        setEditingCourse(null);
        await fetchDepartmentCourses();
        const courses = await apiService.get(`/courses/department/${departmentId}`);
        setDepartmentCoursesForPrerequisites(courses);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      alert(error.response?.data?.error || error.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await apiService.delete(`/courses/${courseId}`);
      if (response.message === "Course deleted successfully") {
        alert("Course deleted successfully!");
        // Refresh the course list
        await fetchDepartmentCourses();
        // Refresh prerequisites list
        const courses = await apiService.get(`/courses/department/${departmentId}`);
        setDepartmentCoursesForPrerequisites(courses);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete course");
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditValues({
      code: "", name: "", theoryHrs: "", labHrs: "", courseCategoryID: "", departmentID: "", classYearID: "", semesterCode: "", prerequisiteIds: []
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600">Department Not Found</h1>
        <p className="text-gray-600 mt-2">The requested department does not exist or has no courses.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-5xl font-bold drop-shadow-lg">{department.name}</h1>
              <span className="px-6 py-2 bg-white/20 rounded-full text-lg font-bold backdrop-blur-sm">
                {fullProgramDisplay}
              </span>
            </div>
            <p className="mt-3 text-xl opacity-95">{department.description}</p>
            <div className="flex gap-6 mt-6">
              <p className="text-blue-100 font-medium">Total Courses: {department.courses.length}</p>
              <p className="text-blue-100 font-medium">Dept Code: {department.departmentData?.departmentCode || department.id}</p>
              <p className="text-blue-100 font-medium">Dept ID: {department.departmentData?.dptID || id}</p>
              <p className="text-blue-100 font-medium">Level: {programLevelName} | Mode: {modalityName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-6 py-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold">Back to Departments</span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all duration-300"
              />
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isFormOpen ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Course
              </span>
            )}
          </button>
        </div>

        {isFormOpen && (
          <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Course
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Course Title *" value={newCourse.cTitle} onChange={(e) => setNewCourse({ ...newCourse, cTitle: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="text" placeholder="Course Code *" value={newCourse.cCode} onChange={(e) => setNewCourse({ ...newCourse, cCode: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="number" placeholder="Theory Hours *" value={newCourse.theoryHrs} onChange={(e) => setNewCourse({ ...newCourse, theoryHrs: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="number" placeholder="Lab Hours *" value={newCourse.labHrs} onChange={(e) => setNewCourse({ ...newCourse, labHrs: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="number" placeholder="Category ID *" value={newCourse.courseCategoryID} onChange={(e) => setNewCourse({ ...newCourse, courseCategoryID: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="number" placeholder="Department ID *" value={newCourse.departmentID} onChange={(e) => setNewCourse({ ...newCourse, departmentID: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="number" placeholder="Class Year ID *" value={newCourse.classYearID} onChange={(e) => setNewCourse({ ...newCourse, classYearID: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <input type="text" placeholder="Semester Code *" value={newCourse.semesterCode} onChange={(e) => setNewCourse({ ...newCourse, semesterCode: e.target.value })} className="border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" />
              <div className="relative col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Prerequisites (Hold Ctrl/Cmd to select multiple)</label>
                <select
                  multiple
                  value={newCourse.prerequisiteIds.map(String)}
                  onChange={(e) => setNewCourse({ ...newCourse, prerequisiteIds: Array.from(e.target.selectedOptions, option => parseInt(option.value)).filter(val => !isNaN(val)) })}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[120px]"
                >
                  {departmentCoursesForPrerequisites.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.ccode} - {course.ctitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAddCourse}
              className="mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Course
              </span>
            </button>
          </div>
        )}
      </div>

      {department.years && department.years.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 text-center">Academic Structure</h2>
          {department.years.map((year) => (
            <div key={year.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <button
                onClick={() => toggleYear(year.id)}
                className="w-full p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex justify-between items-center group"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 transition-transform duration-300 group-hover:scale-110 ${expandedYears.has(year.id) ? 'rotate-90' : ''}`}>
                    <svg className={`w-8 h-8 text-blue-600 dark:text-blue-400 transform transition-transform duration-300 ${expandedYears.has(year.id) ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{year.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Expand to view semesters and courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{year.semesters.reduce((total, sem) => total + sem.courses.length, 0)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{year.semesters.length}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Semesters</div>
                  </div>
                </div>
              </button>

              {expandedYears.has(year.id) && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {year.semesters.map((semester) => (
                    <div key={semester.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <button
                        onClick={() => toggleSemester(semester.id)}
                        className="w-full p-6 pl-16 text-left hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 transition-transform duration-300 group-hover:scale-110">
                            <svg className={`w-5 h-5 text-green-600 dark:text-green-400 transform transition-transform duration-300 ${expandedSemesters.has(semester.id) ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{semester.name}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                            {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>

                      {expandedSemesters.has(semester.id) && (
                        <div className="bg-white dark:bg-gray-800 p-6">
                          {getFilteredCourses(semester.courses).length === 0 ? (
                            <div className="text-center py-12">
                              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">No courses found</div>
                              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No courses found</h3>
                              <p className="text-gray-500 dark:text-gray-500">
                                {searchTerm ? 'No courses match your search criteria.' : 'No courses available for this semester.'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Course Code</th>
                                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Course Name</th>
                                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Theory Hrs</th>
                                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Lab Hrs</th>
                                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Total Credits</th>
                                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Category</th>
                                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Prerequisites</th>
                                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getFilteredCourses(semester.courses).map((course, index) => (
                                    <tr
                                      key={course.id}
                                      className={`transition-all duration-300 ${editingCourse && editingCourse.id === course.id ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700" : index % 2 === 0 ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700"} border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
                                    >
                                      {editingCourse && editingCourse.id === course.id ? (
                                        <>
                                          <td className="p-4"><input type="text" value={editValues.code} onChange={(e) => setEditValues({ ...editValues, code: e.target.value })} className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" /></td>
                                          <td className="p-4"><input type="text" value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" /></td>
                                          <td className="p-4"><input type="number" value={editValues.theoryHrs} onChange={(e) => setEditValues({ ...editValues, theoryHrs: e.target.value })} className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" /></td>
                                          <td className="p-4"><input type="number" value={editValues.labHrs} onChange={(e) => setEditValues({ ...editValues, labHrs: e.target.value })} className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" /></td>
                                          <td className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300">{(parseInt(editValues.theoryHrs || '0') + parseInt(editValues.labHrs || '0'))}</td>
                                          <td className="p-4"><input type="number" value={editValues.courseCategoryID} onChange={(e) => setEditValues({ ...editValues, courseCategoryID: e.target.value })} className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" placeholder="Category ID" /></td>
                                          <td className="p-4">
                                            <select
                                              multiple
                                              value={editValues.prerequisiteIds.map(String)}
                                              onChange={(e) => setEditValues({ ...editValues, prerequisiteIds: Array.from(e.target.selectedOptions, option => parseInt(option.value)).filter(val => !isNaN(val)) })}
                                              className="w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[80px]"
                                            >
                                              {departmentCoursesForPrerequisites.map((prereqCourse) => (
                                                <option key={prereqCourse.id} value={prereqCourse.id}>
                                                  {prereqCourse.ccode} - {prereqCourse.ctitle}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                              <button onClick={() => handleUpdateCourse(course.originalCourse?.id || course.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save
                                              </button>
                                              <button onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancel
                                              </button>
                                            </div>
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="p-4 font-mono font-bold text-blue-700 dark:text-blue-300">{course.code}</td>
                                          <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{course.name}</td>
                                          <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">{course.theoryHrs}</td>
                                          <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">{course.labHrs}</td>
                                          <td className="p-4 text-center font-bold text-green-600 dark:text-green-400 text-lg">{course.creditHours}</td>
                                          <td className="p-4">
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">{course.category}</span>
                                          </td>
                                          <td className="p-4">
                                            {course.prerequisites.length > 0 ? (
                                              <div className="flex flex-wrap gap-1">
                                                {course.prerequisites.map((prereq: string, index: number) => (
                                                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                                    {prereq}
                                                  </span>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-gray-400 dark:text-gray-500 text-sm">None</span>
                                            )}
                                          </td>
                                          <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                              <button onClick={() => handleEditCourse(course)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                              </button>
                                              <button onClick={() => handleDeleteCourse(course.originalCourse?.id || course.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                              </button>
                                            </div>
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-12 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 text-center">
          <div className="text-yellow-500 dark:text-yellow-400 text-8xl mb-6">No Academic Structure Available</div>
          <h3 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">No Academic Structure Available</h3>
          <p className="text-yellow-600 dark:text-yellow-400 text-lg max-w-2xl mx-auto">
            There are no courses organized by year and semester for this department yet. Start by adding new courses using the "Create New Course" button above.
          </p>
        </div>
      )}
    </div>
  );
}