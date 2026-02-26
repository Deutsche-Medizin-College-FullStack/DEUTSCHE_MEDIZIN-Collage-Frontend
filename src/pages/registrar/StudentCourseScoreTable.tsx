import React, { useState, useEffect } from "react";
import { message, Input, Modal, InputNumber, Select } from "antd";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { useMemo } from "react";
const initialData = [];

export default function StudentCourseScoreTable() {
  const [data, setData] = useState(initialData);
  const { toast } = useToast(); // ← Add this
  const [allData, setAllData] = useState(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editScoreModalVisible, setEditScoreModalVisible] = useState(false);
  const [editScoreValue, setEditScoreValue] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [batchValues, setBatchValues] = useState({
    score: "",
    courseSource: "",
    isReleased: null,
    bcysId: "",
  });
  const [studentList, setStudentList] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [batchUpdateLoading, setBatchUpdateLoading] = useState(false); // ← Add this
  const [showInstructions, setShowInstructions] = useState(false); // ← Add this
  const [scoreInputError, setScoreInputError] = useState(false);
  const [editScoreError, setEditScoreError] = useState(false);
  const [filters, setFilters] = useState({
    courseId: "", // ← new
    bcysId: "", // renamed from batchClassYearSemester
    studentId: null, // better name than "search"
    isReleased: null, // null = all, true, false
    departmentId: "" as string | "", // ← new
    studentStatusId: "" as string | "", // ← Add this
  });

  const [filterOptions, setFilterOptions] = useState({
    // departments: [],
    // studentStatuses: [],
    // batches: [],
    // semesters: [],
    // academicYears: [],
    courseSources: [],
    //courses: [], // ← new or rename if you already have course list
    batchClassYearSemesters: [],
    departments: [] as Array<{ id: number; name: string }>, // ← new
    studentStatuses: [] as Array<{ id: number; name: string }>,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchStudentCourseScores();
  }, [
    pagination.current,
    pagination.pageSize,
    filters.courseId,
    filters.bcysId,
    filters.studentId,
    filters.isReleased,
    filters.departmentId,
    filters.studentStatusId, // ← Add this
  ]);

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get(endPoints.lookupsDropdown);
      console.log("lookupsDropdown response:", response.data);

      if (response.data) {
        setFilterOptions({
          departments: response.data.departments || [],
          batchClassYearSemesters: response.data.batchClassYearSemesters || [],
          courseSources: response.data.courseSources || [],
          studentStatuses: response.data.studentStatuses || [], // ← Add this
        });
      }
    } catch (error) {
      message.error("Failed to load filter options");
    }
  };

  const fetchStudnet = async () => {
    try {
      setStudentListLoading(true);

      const data = await apiClient.get(endPoints.studentUserNames);
      setStudentList(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setStudentListLoading(false);
    }
  };
  const fetchCourseList = async () => {
    try {
      setCoursesLoading(true);
      const data = await apiClient.get("/courses/list");
      setCourseList(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setCoursesLoading(false);
    }
  };
  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       const [lookupsRes, deptsRes] = await Promise.all([
  //         apiClient.get(endPoints.lookupsDropdown),
  //         apiClient.get(endPoints.departments), // or /departments/list — adjust path
  //       ]);

  //       setFilterOptions((prev) => ({
  //         ...prev,
  //         departments: deptsRes.data || [],
  //         batchClassYearSemesters:
  //           lookupsRes.data.batchClassYearSemesters || [],
  //         courseSources: lookupsRes.data.courseSources || [],
  //       }));
  //     } catch (err) {
  //       message.error("Failed to load filters");
  //     }
  //   };
  //   load();
  // }, []);
  useEffect(() => {
    fetchCourseList();
  }, []);
  useEffect(() => {
    fetchStudnet();
  }, []);
  const displayedData = useMemo(() => {
    if (!filters.departmentId) {
      return data; // show everything when no department filter
    }

    const selectedDeptId = Number(filters.departmentId);

    return data.filter((row) => row.department?.id === selectedDeptId);
  }, [data, filters.departmentId]);
  console.log("Raw data:", data);
  console.log("Filtered data:", displayedData);
  console.log("Selected department ID:", filters.departmentId);
  // useEffect(() => {
  //   // When department changes → immediately update the displayed table
  //   setData(displayedData);
  // }, [displayedData]); // ← reacts only when displayedData changes
  const fetchStudentCourseScores = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        sortBy: "score",
        sortDir: "desc",

        ...(filters.courseId && { courseId: filters.courseId }),
        ...(filters.bcysId && { bcysId: filters.bcysId }),
        ...(filters.studentId && { studentId: Number(filters.studentId) }),
        ...(filters.isReleased !== null && { isReleased: filters.isReleased }),
        ...(filters.departmentId && {
          departmentId: Number(filters.departmentId),
        }),
        ...(filters.studentStatusId && {
          // ← Add this
          studentStatusId: Number(filters.studentStatusId),
        }),
      };

      const response = await apiClient.get(endPoints.getAllScores, { params });
      console.log(response, "no no no");

      if (response.data?.content) {
        const formattedData = response.data.content.map((item) => ({
          key: item.id.toString(), // in the map inside fetchStudentCourseScores
          id: item.id,
          studentId: {
            id: item.studentId?.toString(),
            student: { name: item.studentName }, // ← most likely NOT returned
          },
          course: item.course || { id: null, displayName: "N/A" },
          department: item.department || { id: null, displayName: "N/A" },
          batchClassYearSemester: item.bcys || {
            id: item.bcys?.id?.toString(),
            displayName: item.bcys?.displayName || "N/A",
          },
          courseSource: item.courseSource || { id: null, displayName: "N/A" },
          score: item.score,
          isReleased: item.isReleased,
        }));

        setData(formattedData);
        // You can remove setAllData() — no longer needed (backend filters)

        // setPagination((prev) => ({
        //   ...prev,
        //   total: response.data.totalElements,
        //   current: response.data.page + 1,
        //   pageSize: response.data.size || prev.pageSize,
        // }));
        setPagination((prev) => {
          const newTotal = response.data.totalElements ?? prev.total;
          const newCurrent =
            response.data.page != null ? response.data.page + 1 : prev.current;
          const newSize = response.data.size ?? prev.pageSize;

          if (
            newTotal === prev.total &&
            newCurrent === prev.current &&
            newSize === prev.pageSize
          ) {
            return prev; // ← prevents re-render loop
          }

          return {
            ...prev,
            total: newTotal,
            current: newCurrent,
            pageSize: newSize,
          };
        });
      }
    } catch (error) {
      message.error("Failed to load student course scores");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelection = (key) => {
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSelectAll = () => {
    if (selectedRowKeys.length === data.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(data.map((item) => item.key));
    }
  };

  // Reusable bulk update function (used for batch, single edit, and single release)
  const applyUpdateViaBulk = async (updates) => {
    if (updates.length === 0) return;
    try {
      await apiClient.put(endPoints.bulkUpdateScores, { updates });
      message.success("Update successful");
      fetchStudentCourseScores();
    } catch (error) {
      console.error("Update failed:", error);
      message.error(error.response?.data?.error || "Update failed");
    }
  };

  const applyBatchUpdate = async () => {
    if (selectedRowKeys.length === 0) return;

    // Reset any previous errors
    setScoreInputError(false);

    // Validate score if provided
    if (batchValues.score !== "" && batchValues.score !== null) {
      // Check if it's a valid number
      if (isNaN(Number(batchValues.score))) {
        toast({
          title: "❌ Invalid Score",
          description: "Please enter a valid number for score",
          variant: "destructive",
        });
        setScoreInputError(true);
        return;
      }

      const scoreValue = parseFloat(batchValues.score);
      if (scoreValue < 0 || scoreValue > 100) {
        toast({
          title: "❌ Invalid Score",
          description: "Score must be between 0 and 100",
          variant: "destructive",
        });
        setScoreInputError(true);
        return;
      }
    }

    const updates = selectedRowKeys
      .map((key) => {
        const row = data.find((item) => item.key === key);
        if (!row) return null;

        const update = { id: row.id };
        let hasChange = false;

        // Score validation - already validated above, but double-check
        if (batchValues.score !== "" && !isNaN(Number(batchValues.score))) {
          const scoreValue = parseFloat(batchValues.score);
          update.score = scoreValue;
          hasChange = true;
        }

        if (batchValues.isReleased !== null) {
          update.isReleased = batchValues.isReleased;
          hasChange = true;
        }

        if (batchValues.courseSource) {
          update.courseSourceId = batchValues.courseSource;
          hasChange = true;
        }

        if (batchValues.bcysId) {
          update.batchClassYearSemesterId = batchValues.bcysId;
          hasChange = true;
        }

        return hasChange ? update : null;
      })
      .filter(Boolean);

    if (updates.length === 0) {
      toast({
        title: "ℹ️ No Changes",
        description: "No fields were changed to apply.",
        variant: "default",
      });
      return;
    }

    // Show loading state
    setBatchUpdateLoading(true);

    try {
      const response = await apiClient.put(endPoints.bulkUpdateScores, {
        updates,
      });

      // Show success toast with details
      const updatedFields = [];
      if (batchValues.score) updatedFields.push("scores");
      if (batchValues.courseSource) updatedFields.push("course sources");
      if (batchValues.bcysId) updatedFields.push("batch/year/semester");
      if (batchValues.isReleased !== null) updatedFields.push("release status");

      const fieldsUpdated = updatedFields.join(", ");

      toast({
        title: "✅ Update Successful",
        description: `Updated ${updates.length} record(s) successfully. ${fieldsUpdated ? `Changed: ${fieldsUpdated}` : ""}`,
        variant: "default",
      });

      setSelectedRowKeys([]);
      setBatchValues({
        score: "",
        courseSource: "",
        isReleased: null,
        bcysId: "",
      });
      setScoreInputError(false); // Clear any error state
      fetchStudentCourseScores();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Bulk update failed";

      toast({
        title: "❌ Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBatchUpdateLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleEditScoreClick = (record) => {
    setEditingRecord(record);
    setEditScoreValue(record.score || "");
    setEditScoreModalVisible(true);
  };

  const handleEditScoreSubmit = async () => {
    if (!editingRecord) return;

    // Validate score
    if (editScoreValue === "" || editScoreValue === null) {
      toast({
        title: "❌ Invalid Score",
        description: "Please enter a score",
        variant: "destructive",
      });
      setEditScoreError(true);
      return;
    }

    if (isNaN(Number(editScoreValue))) {
      toast({
        title: "❌ Invalid Score",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      setEditScoreError(true);
      return;
    }

    const scoreValue = parseFloat(editScoreValue);
    if (scoreValue < 0 || scoreValue > 100) {
      toast({
        title: "❌ Invalid Score",
        description: "Score must be between 0 and 100",
        variant: "destructive",
      });
      setEditScoreError(true);
      return;
    }

    const update = {
      id: editingRecord.id,
      score: scoreValue,
    };

    try {
      const response = await apiClient.put(endPoints.bulkUpdateScores, {
        updates: [update],
      });

      toast({
        title: "✅ Score Updated",
        description: `Successfully updated score to ${scoreValue.toFixed(2)} for ${editingRecord.studentId.student?.name || editingRecord.studentId.id}`,
        variant: "default",
      });

      setEditScoreModalVisible(false);
      setEditingRecord(null);
      setEditScoreError(false);
      fetchStudentCourseScores();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update score";
      toast({
        title: "❌ Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const [togglingRowId, setTogglingRowId] = useState(null);

  const handleToggleRelease = async (record) => {
    const newReleased = !record.isReleased;
    setTogglingRowId(record.id);

    const update = {
      id: record.id,
      isReleased: newReleased,
    };

    try {
      const response = await apiClient.put(endPoints.bulkUpdateScores, {
        updates: [update],
      });

      toast({
        title: newReleased ? "✅ Score Released" : "🔒 Score Unreleased",
        description: `${record.studentId.student?.name || record.studentId.id} - ${record.course.displayName} is now ${newReleased ? "visible to students" : "hidden from students"}`,
        variant: "default",
      });

      fetchStudentCourseScores();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update release status";

      toast({
        title: "❌ Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setTogglingRowId(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      courseId: "",
      bcysId: "",
      studentId: null,
      isReleased: null,
      studentStatusId: "", // ← Add this
      departmentId: "",
    });
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchStudentCourseScores();
  };

  const clearBatchUpdate = () => {
    setSelectedRowKeys([]);
    setBatchValues({
      score: "",
      courseSource: "",
      isReleased: null,
      bcysId: "",
    });
    setScoreInputError(false); // ← Clear error state
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const handlePageSizeChange = (e) => {
    const pageSize = Number(e.target.value);
    setPagination((prev) => ({ ...prev, pageSize, current: 1 }));
  };

  const from =
    pagination.total === 0
      ? 0
      : (pagination.current - 1) * pagination.pageSize + 1;
  const to = Math.min(
    pagination.current * pagination.pageSize,
    pagination.total,
  );
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Student Course Scores
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage student scores and release status
          </p>
        </div>

        {/* Help/Instructions Button */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {showInstructions ? "Hide Instructions" : "Show Instructions"}
          </span>
        </button>
      </div>

      {/* Instructions Panel - Toggle visibility */}
      {showInstructions && (
        <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Quick Guide & Instructions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  1
                </span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Adding New Records:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    New student course records cannot be added directly from
                    this page.
                    <span className="block mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <span className="font-medium text-yellow-800 dark:text-yellow-300">
                        ➡️ Need to add a course for a student?
                      </span>
                      <br />
                      Go to{" "}
                      <a
                        href="/registrar/registration-slips"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        Generate Registration Slip
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  2
                </span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Multiple Updates:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select multiple rows using checkboxes to batch update:
                    <span className="block mt-1 ml-2">
                      • <strong>Score</strong> - Set new scores (0-100)
                      <br />• <strong>Course Source</strong> - Change course
                      source
                      <br />• <strong>Batch/Year/Semester</strong> - Update
                      academic period
                      <br />• <strong>Release Status</strong> -
                      Release/unrelease in bulk
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  3
                </span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Release Status (IsReleased):
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    Controls score visibility to students and in official
                    documents:
                    <span className="block mt-1 ml-2">
                      •{" "}
                      <span className="text-green-600 dark:text-green-400">
                        Released ✓
                      </span>{" "}
                      - Scores visible to students and appear on
                      transcripts/student copies
                      <br />•{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        Unreleased ✗
                      </span>{" "}
                      - Scores hidden from students and excluded from
                      transcripts
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  4
                </span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Batch/Year/Semester (BCYS) Format:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    Format:{" "}
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                      [Batch]-[Year]-[Semester]
                    </code>
                    <span className="block mt-1 ml-2">
                      Examples:
                      <br />•{" "}
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                        2-5-S1
                      </code>{" "}
                      - Batch 2, Year 5, Semester 1<br />•{" "}
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                        1-3-S2
                      </code>{" "}
                      - Batch 1, Year 3, Semester 2<br />•{" "}
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                        3-1-S1
                      </code>{" "}
                      - Batch 3, Year 1, Semester 1
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  5
                </span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    About This Page:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    This comprehensive view displays all student scores across:
                    <span className="block mt-1 ml-2">
                      • All courses taken
                      <br />
                      • All academic periods (past and present)
                      <br />
                      • All departments and batches
                      <br />• Complete score history for transcript generation
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Tips */}
          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>
                <strong>Pro Tip:</strong> Use the filters above to narrow down
                specific departments, courses, or students before performing
                batch updates.
              </span>
            </p>

            {/* New Tip: Missing Records */}
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                <strong>Can't find what you're looking for?</strong> If a
                student, course, or any record is missing from this table, it
                means the student hasn't been registered for those courses yet.
                Head over to{" "}
                <a
                  href="/registrar/registration-slips"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Generate Registration Slip
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>{" "}
                to register the student for the required courses. Once
                registered, they will appear here automatically.
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <Select
            value={filters.departmentId || undefined}
            onChange={(v) => handleFilterChange("departmentId", v)}
            placeholder="All Departments"
            y
            allowClear
            showSearch
            className="w-full"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            <Select.Option value="">All Departments</Select.Option>

            {filterOptions.departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>

          <Select
            loading={coursesLoading}
            value={filters.courseId || undefined}
            onChange={(v) => handleFilterChange("courseId", v)}
            placeholder="All Courses"
            allowClear
            showSearch
            className="w-full"
            // optional: filterOption to improve search
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {courseList.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.title ||
                  c.cTitle ||
                  c.name ||
                  c.displayName ||
                  `Course ${c.id}`}{" "}
                {c.cCode}
              </Select.Option>
            ))}
          </Select>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <Select
            value={filters.departmentId || undefined}
            onChange={(value) => {
              // Reset course selection when department changes
              setFilters((prev) => ({
                ...prev,
                departmentId: value,
                courseId: undefined, // ← this prevents invalid course staying selected
              }));
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            placeholder="All Departments"
            allowClear
            showSearch
            className="w-full"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            <Select.Option value="">All Departments</Select.Option>
            {filterOptions.departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Course Filter – only shows matching department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>

          <Select
            loading={coursesLoading}
            value={filters.courseId || undefined}
            onChange={(v) => handleFilterChange("courseId", v)}
            placeholder={
              filters.departmentId
                ? "Courses in selected department"
                : "All Courses"
            }
            allowClear
            showSearch
            className="w-full"
            dropdownClassName="min-w-[340px] sm:min-w-[420px] md:min-w-[500px]" // wider for long names
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            optionLabelProp="label"
          >
            {/* Optional: All courses in the selected department */}
            {filters.departmentId && filters.departmentId !== "" && (
              <Select.Option value="">
                <span className="text-gray-500 dark:text-gray-400 italic">
                  All courses in this department
                </span>
              </Select.Option>
            )}

            {courseList
              .filter((course) => {
                // No department selected → show everything
                if (!filters.departmentId || filters.departmentId === "") {
                  return true;
                }

                // Get the selected department's NAME (because courses store department as string/name)
                const selectedDept = filterOptions.departments.find(
                  (d) => d.id === Number(filters.departmentId),
                );

                if (!selectedDept) return false;

                // Compare with course.department (which seems to be a string like "Medicine")
                return course.department === selectedDept.name;
              })
              .map((c) => {
                const title =
                  c.cTitle ||
                  c.title ||
                  c.name ||
                  c.displayName ||
                  `Course ${c.id}`;
                const codePart = c.cCode ? `(${c.cCode}) ` : "";
                const deptName = c.department || "—";

                const fullLabel = `${codePart}${title} — ${deptName}`;

                return (
                  <Select.Option key={c.id} value={c.id} label={fullLabel}>
                    <div className="flex flex-col text-sm py-0.5">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {codePart}
                        {title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {deptName}
                      </span>
                    </div>
                  </Select.Option>
                );
              })}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium ...">
            Batch/Year/Semester
          </label>
          <Select
            value={filters.bcysId || undefined}
            onChange={(v) => handleFilterChange("bcysId", v)}
            placeholder="All"
            allowClear
            className="w-full"
          >
            {filterOptions.batchClassYearSemesters.map((b) => (
              <Select.Option key={b.id} value={b.id}>
                {b.displayName || b.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Release Status - simple yes/no/all */}
        <div>
          <label className="block text-sm font-medium ...">Released</label>
          <Select
            value={filters.isReleased === null ? undefined : filters.isReleased}
            onChange={(v) =>
              handleFilterChange("isReleased", v === undefined ? null : v)
            }
            placeholder="All"
            allowClear
            className="w-full"
          >
            <Select.Option value={true}>Yes</Select.Option>
            <Select.Option value={false}>No</Select.Option>
          </Select>
        </div>

        {/* Student Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student Status
          </label>
          <Select
            value={filters.studentStatusId || undefined}
            onChange={(v) => handleFilterChange("studentStatusId", v)}
            placeholder="All Statuses"
            allowClear
            showSearch
            className="w-full"
            filterOption={(input, option) => {
              const label = option?.label ?? option?.children;
              if (typeof label === "string") {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            <Select.Option value="">All Statuses</Select.Option>
            {filterOptions.studentStatuses.map((status) => (
              <Select.Option
                key={status.id}
                value={status.id}
                label={status.name.replace(/_/g, " ")}
              >
                {status.name.replace(/_/g, " ")}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Student ID search - now more precise */}
        {/* <div>
          <label className="block text-sm font-medium ...">Student ID</label>
          <div className="relative">
            <input
              type="text"
              value={filters.studentId}
              onChange={(e) =>
                handleFilterChange("studentId", e.target.value.trim())
              }
              placeholder="Enter student ID"
              className="w-full px-4 py-2 ..."
            />
            {filters.studentId && (
              <button
                onClick={() => handleFilterChange("studentId", "")}
                className="absolute right-3 top-3 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student User Name
          </label>
          <Select
            loading={studentListLoading}
            value={filters.studentId ?? undefined}
            onChange={(v) => handleFilterChange("studentId", v)}
            placeholder="All Students"
            allowClear
            showSearch
            className="w-full"
            // optional: filterOption to improve search
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {studentList.map((c) => (
              <Select.Option key={c.userId} value={Number(c.userId)}>
                {c.username || c.userName || c.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mb-4 text-right">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Clear All Filters
        </button>
      </div>

      {/* Batch Update */}
      {selectedRowKeys.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <InputNumber
                // Remove min and max props
                step={0.1}
                value={batchValues.score}
                onChange={(v) => {
                  setBatchValues({ ...batchValues, score: v });
                  // Clear error when user starts typing
                  setScoreInputError(false);
                }}
                onBlur={() => {
                  // Validate on blur
                  if (batchValues.score !== "" && batchValues.score !== null) {
                    if (isNaN(Number(batchValues.score))) {
                      setScoreInputError(true);
                    } else {
                      const score = parseFloat(batchValues.score);
                      if (score < 0 || score > 100) {
                        setScoreInputError(true);
                      } else {
                        setScoreInputError(false);
                      }
                    }
                  } else {
                    setScoreInputError(false);
                  }
                }}
                placeholder="Score"
                className={`w-32 transition-colors duration-200 ${
                  scoreInputError
                    ? "[&_.ant-input-number]:border-red-500 [&_.ant-input-number]:dark:border-red-500 [&_.ant-input-number]:bg-red-50 dark:[&_.ant-input-number]:bg-red-900/20"
                    : batchValues.score &&
                        !isNaN(Number(batchValues.score)) &&
                        parseFloat(batchValues.score) >= 0 &&
                        parseFloat(batchValues.score) <= 100
                      ? "[&_.ant-input-number]:border-green-500 [&_.ant-input-number]:dark:border-green-500"
                      : ""
                } [&_.ant-input-number-input]:text-gray-900 [&_.ant-input-number-input]:dark:text-gray-200 [&_.ant-input-number-input::placeholder]:text-gray-500 [&_.ant-input-number-input::placeholder]:dark:text-gray-400`}
              />
              {scoreInputError && (
                <div className="absolute -bottom-5 left-0 text-xs text-red-500 dark:text-red-400">
                  Must be 0-100
                </div>
              )}
            </div>
            <Select
              value={batchValues.courseSource || undefined}
              onChange={(v) =>
                setBatchValues({ ...batchValues, courseSource: v })
              }
              placeholder="Course Source"
              allowClear
              className="w-48"
            >
              {filterOptions.courseSources.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>

            {/* NEW: Batch ClassYear Semester Dropdown */}
            <Select
              value={batchValues.bcysId || undefined}
              onChange={(v) => setBatchValues({ ...batchValues, bcysId: v })}
              placeholder="Batch/Year/Semester"
              allowClear
              className="w-48"
            >
              {filterOptions.batchClassYearSemesters.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              value={
                batchValues.isReleased !== null
                  ? batchValues.isReleased
                    ? "yes"
                    : "no"
                  : "no_change"
              }
              onChange={(v) =>
                setBatchValues({
                  ...batchValues,
                  isReleased: v === "yes" ? true : v === "no" ? false : null,
                })
              }
              placeholder="Change release status?"
              allowClear
              className="w-40"
            >
              <Select.Option value="no_change">No change</Select.Option>
              <Select.Option value="yes">Release</Select.Option>
              <Select.Option value="no">Don't Release</Select.Option>
            </Select>
            <button
              onClick={applyBatchUpdate}
              disabled={batchUpdateLoading}
              className={`px-5 py-2 rounded flex items-center gap-2 ${
                batchUpdateLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {batchUpdateLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Applying...</span>
                </>
              ) : (
                `Apply (${selectedRowKeys.length})`
              )}
            </button>
            <button
              onClick={clearBatchUpdate}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    data.length > 0 && selectedRowKeys.length === data.length
                  }
                  indeterminate={
                    selectedRowKeys.length > 0 &&
                    selectedRowKeys.length < data.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Batch/Year/Sem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Course Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Released
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-10">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              displayedData.map((item) => (
                <tr
                  key={item.key}
                  className={
                    selectedRowKeys.includes(item.key)
                      ? "bg-blue-50 dark:bg-blue-900/40 text-gray-900 dark:text-gray-100" // ← Updated
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50" // ← Optional hover effect
                  }
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRowKeys.includes(item.key)}
                      onChange={() => handleRowSelection(item.key)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">{item.studentId.id}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.studentId.student?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{item.course.displayName}</span>
                      <span className="text-gray-500 text-xs">
                        ({item.course.id})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.batchClassYearSemester.displayName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.courseSource.displayName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {item.score?.toFixed(2) || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.isReleased
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {item.isReleased ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleEditScoreClick(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        title="Edit Score"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleRelease(item)}
                        disabled={togglingRowId === item.id}
                        className={`
    relative overflow-hidden transition-transform active:scale-95
    ${
      item.isReleased
        ? "text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
        : "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
    }
    ${togglingRowId === item.id ? "opacity-50 cursor-wait" : ""}
  `}
                        title={item.isReleased ? "Unrelease" : "Release"}
                      >
                        {togglingRowId === item.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : item.isReleased ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <strong>{from}</strong> to <strong>{to}</strong> of{" "}
            <strong>{pagination.total}</strong> results
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Rows per page:
              </span>
              <select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ← Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (pagination.current <= 3) pageNum = i + 1;
                else if (pagination.current >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = pagination.current - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-md border text-sm font-medium ${
                      pagination.current === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === totalPages || totalPages === 0}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next →
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Score Modal */}
      <Modal
        title="Edit Score"
        open={editScoreModalVisible}
        onOk={handleEditScoreSubmit}
        onCancel={() => {
          setEditScoreModalVisible(false);
          setEditingRecord(null);
          setEditScoreError(false); // Reset error state
        }}
        okText="Update Score"
        cancelText="Cancel"
        className="dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-header]:bg-gray-800 dark:[&_.ant-modal-title]:text-gray-100 dark:[&_.ant-modal-body]:text-gray-100 dark:[&_.ant-modal-footer]:bg-gray-800"
      >
        {editingRecord && (
          <div className="space-y-4 text-gray-900 dark:text-gray-100">
            <p>
              <strong>Student:</strong>{" "}
              {editingRecord.studentId.student?.name ||
                editingRecord.studentId.id}
            </p>
            <p>
              <strong>Course:</strong> {editingRecord.course.displayName}
              {editingRecord.course.code && (
                <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                  ({editingRecord.course.code})
                </span>
              )}
            </p>
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                New Score (0-100)
              </label>
              <InputNumber
                // Remove min and max to prevent auto-clamping
                step={0.1}
                value={editScoreValue}
                onChange={(v) => {
                  setEditScoreValue(v);
                  setEditScoreError(false);
                }}
                onBlur={() => {
                  if (editScoreValue !== "" && editScoreValue !== null) {
                    if (isNaN(Number(editScoreValue))) {
                      setEditScoreError(true);
                    } else {
                      const score = parseFloat(editScoreValue);
                      if (score < 0 || score > 100) {
                        setEditScoreError(true);
                      } else {
                        setEditScoreError(false);
                      }
                    }
                  } else {
                    setEditScoreError(false);
                  }
                }}
                placeholder="Enter new score"
                className={`w-full transition-colors duration-200 ${
                  editScoreError
                    ? "[&_.ant-input-number]:border-red-500 [&_.ant-input-number]:dark:border-red-500 [&_.ant-input-number]:bg-red-50 dark:[&_.ant-input-number]:bg-red-900/20"
                    : editScoreValue &&
                        !isNaN(Number(editScoreValue)) &&
                        parseFloat(editScoreValue) >= 0 &&
                        parseFloat(editScoreValue) <= 100
                      ? "[&_.ant-input-number]:border-green-500 [&_.ant-input-number]:dark:border-green-500"
                      : ""
                }`}
              />
              {editScoreError && (
                <div className="absolute text-xs text-red-500 dark:text-red-400 mt-1">
                  Score must be between 0 and 100
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Global Dark Mode Fixes */}
      <style jsx global>{`
        /* Light mode dropdown styles (default) */
        .ant-select-selector {
          background-color: #ffffff !important;
          border-color: #d1d5db !important;
          color: #111827 !important;
        }
        .ant-select-selection-placeholder {
          color: #9ca3af !important;
        }
        .ant-select-arrow {
          color: #6b7280 !important;
        }

        /* Light mode InputNumber */
        .ant-input-number {
          background-color: #ffffff !important;
          border-color: #d1d5db !important;
        }
        .ant-input-number-input {
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        .ant-input-number-handler-wrap {
          background-color: #f9fafb !important;
        }

        /* Light mode dropdown menu */
        .ant-select-dropdown {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important;
        }
        .ant-select-item {
          color: #111827 !important;
        }
        .ant-select-item:hover {
          background-color: #f3f4f6 !important;
        }
        .ant-select-item-option-selected {
          background-color: #e6f7ff !important;
          color: #1890ff !important;
        }

        /* Dark mode dropdown styles - only apply when dark class is present */
        .dark .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          color: #d1d5db !important;
        }
        .dark .ant-select-selection-placeholder {
          color: #9ca3af !important;
        }
        .dark .ant-select-arrow {
          color: #9ca3af !important;
        }

        /* Dark mode InputNumber */
        .dark .ant-input-number {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .dark .ant-input-number-input {
          background-color: #1f2937 !important;
          color: #d1d5db !important;
        }
        .dark .ant-input-number-handler-wrap {
          background-color: #1f2937 !important;
        }

        /* Dark mode dropdown menu */
        .dark .ant-select-dropdown {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
        }
        .dark .ant-select-item {
          color: #d1d5db !important;
        }
        .dark .ant-select-item:hover {
          background-color: #374151 !important;
        }
        .dark .ant-select-item-option-selected {
          background-color: #1e3a8a !important;
          color: #93c5fd !important;
        }

        @keyframes pulse-success {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse-success {
          animation: pulse-success 0.5s ease-in-out;
        }
        /* Fade animation for instructions panel */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Improve code tag styling */
        code {
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
}
