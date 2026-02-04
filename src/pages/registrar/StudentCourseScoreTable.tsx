import React, { useState, useEffect } from "react";
import { message, Input, Modal, InputNumber, Select } from "antd";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { useMemo } from "react";
const initialData = [];

export default function StudentCourseScoreTable() {
  const [data, setData] = useState(initialData);
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
  });
  const [studentList, setStudentList] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  // const [filters, setFilters] = useState({
  //   department: "",
  //   status: "",
  //   batchClassYearSemester: "",
  //   search: "",
  // });
  const [filters, setFilters] = useState({
    courseId: "", // ← new
    bcysId: "", // renamed from batchClassYearSemester
    studentId: null, // better name than "search"
    isReleased: null, // null = all, true, false
    departmentId: "" as string | "", // ← new
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
    // classYears: [],
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
  ]);

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get(endPoints.lookupsDropdown);
      console.log("lookupsDropdown response:", response.data); // ← look here!

      if (response.data) {
        setFilterOptions({
          departments: response.data.departments || [], // ← hope this key exists
          batchClassYearSemesters: response.data.batchClassYearSemesters || [],
          courseSources: response.data.courseSources || [],
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
        sortBy: "score", // or make dynamic later
        sortDir: "desc",

        ...(filters.courseId && { courseId: filters.courseId }),
        ...(filters.bcysId && { bcysId: filters.bcysId }),
        ...(filters.studentId && { studentId: Number(filters.studentId) }),
        ...(filters.isReleased !== null && { isReleased: filters.isReleased }),
        ...(filters.departmentId && {
          departmentId: Number(filters.departmentId),
        }), // ← NEW
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
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
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

    const updates = selectedRowKeys
      .map((key) => {
        const row = data.find((item) => item.key === key);
        if (!row) return null;

        const update = { id: row.id };

        let hasChange = false;

        if (batchValues.score !== "" && !isNaN(Number(batchValues.score))) {
          update.score = parseFloat(batchValues.score);
          hasChange = true;
        }

        if (batchValues.isReleased !== null) {
          update.isReleased = batchValues.isReleased;
          hasChange = true;
        }

        if (batchValues.courseSource) {
          // empty string or undefined → skip
          update.courseSourceId = batchValues.courseSource;
          hasChange = true;
        }

        return hasChange ? update : null;
      })
      .filter(Boolean);

    if (updates.length === 0) {
      message.info("No fields were changed to apply.");
      return;
    }

    try {
      await apiClient.put(endPoints.bulkUpdateScores, { updates });
      message.success(`Updated ${updates.length} record(s) successfully`);
      setSelectedRowKeys([]);
      setBatchValues({ score: "", courseSource: "", isReleased: null });
      fetchStudentCourseScores();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Bulk update failed");
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

    const scoreValue = parseFloat(editScoreValue);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      message.error("Score must be between 0 and 100");
      return;
    }

    const update = {
      id: editingRecord.id,
      score: scoreValue,
    };

    try {
      await apiClient.put(endPoints.bulkUpdateScores, { updates: [update] });
      message.success("Score updated");
      setEditScoreModalVisible(false);
      setEditingRecord(null);
      fetchStudentCourseScores();
    } catch (err) {
      message.error("Failed to update score");
      console.error(err);
    }
  };

  const handleToggleRelease = async (record) => {
    const newReleased = !record.isReleased;

    const update = {
      id: record.id,
      isReleased: newReleased,
    };

    try {
      await apiClient.put(endPoints.bulkUpdateScores, { updates: [update] });
      message.success(`Score ${newReleased ? "released" : "unreleased"}`);
      fetchStudentCourseScores();
    } catch (err) {
      message.error("Failed to update release status");
      console.error(err);
    }
  };
  const clearFilters = () => {
    // setFilters({
    //   department: "",
    //   status: "",
    //   batchClassYearSemester: "",
    //   search: "",
    // });
    setFilters({
      courseId: "",
      bcysId: "",
      studentId: null,
      isReleased: null,
    });
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchStudentCourseScores();
  };

  const clearBatchUpdate = () => {
    setSelectedRowKeys([]);
    setBatchValues({ score: "", courseSource: "", isReleased: null });
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
    pagination.total
  );
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Student Course Scores
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage student scores and release status
        </p>
      </div>

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
                  (d) => d.id === Number(filters.departmentId)
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
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              value={batchValues.score}
              onChange={(v) => setBatchValues({ ...batchValues, score: v })}
              placeholder="Score"
              className="w-32 [&_.ant-input-number-input]:text-gray-900 [&_.ant-input-number-input]:dark:text-gray-200 [&_.ant-input-number-input::placeholder]:text-gray-500 [&_.ant-input-number-input::placeholder]:dark:text-gray-400"
            />
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
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply ({selectedRowKeys.length})
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
                    selectedRowKeys.includes(item.key) ? "bg-blue-50 ..." : ""
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
                        className={
                          item.isReleased
                            ? "text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                            : "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        }
                        title={item.isReleased ? "Unrelease" : "Release"}
                      >
                        {item.isReleased ? (
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
            </p>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                New Score (0-100)
              </label>
              <InputNumber
                min={0}
                max={100}
                step={0.1}
                value={editScoreValue}
                onChange={setEditScoreValue}
                className="w-full [&_.ant-input-number]:bg-gray-700 [&_.ant-input-number]:dark:bg-gray-700 [&_.ant-input-number-input]:text-gray-100"
                placeholder="Enter new score"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Global Dark Mode Fixes */}
      <style jsx global>{`
        /* Select dropdown input */
        .ant-select-selector {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
          color: #d1d5db !important;
        }
        .ant-select-selection-placeholder {
          color: #9ca3af !important;
        }
        .ant-select-arrow {
          color: #9ca3af !important;
        }

        /* InputNumber in dark mode */
        .ant-input-number {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .ant-input-number-input {
          background-color: #1f2937 !important;
          color: #d1d5db !important;
        }
        .ant-input-number-handler-wrap {
          background-color: #1f2937 !important;
        }

        /* Dropdown menu */
        .ant-select-dropdown {
          background-color: #1f2937 !important;
        }
        .ant-select-item {
          color: #d1d5db !important;
        }
        .ant-select-item:hover {
          background-color: #374151 !important;
        }
      `}</style>
    </div>
  );
}
