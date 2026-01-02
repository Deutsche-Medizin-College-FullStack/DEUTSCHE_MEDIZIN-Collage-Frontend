import React, { useState, useEffect } from "react";
import { message, Input, Modal, InputNumber, Select } from "antd";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";
import { Pencil, Eye, EyeOff } from "lucide-react";

const initialData = [];

export default function StudentCourseScoreTable() {
  const [data, setData] = useState(initialData);
  const [allData, setAllData] = useState(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editScoreModalVisible, setEditScoreModalVisible] = useState(false);
  const [editScoreValue, setEditScoreValue] = useState("");

  const [batchValues, setBatchValues] = useState({
    score: "",
    courseSource: "",
    isReleased: null,
  });

  const [filters, setFilters] = useState({
    department: "",
    status: "",
    batchClassYearSemester: "",
    search: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    studentStatuses: [],
    batches: [],
    semesters: [],
    academicYears: [],
    courseSources: [],
    batchClassYearSemesters: [],
    classYears: [],
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
    filters.department,
    filters.status,
    filters.search,
  ]);

  useEffect(() => {
    if (filters.batchClassYearSemester && allData.length > 0) {
      const filtered = allData.filter(
        (item) => item.batchClassYearSemester.id === filters.batchClassYearSemester
      );
      setData(filtered);
    } else if (!filters.batchClassYearSemester && allData.length > 0) {
      setData(allData);
    }
  }, [filters.batchClassYearSemester, allData]);

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get(endPoints.lookupsDropdown);
      if (response.data) {
        setFilterOptions({
          departments: response.data.departments || [],
          studentStatuses: response.data.studentStatuses || [],
          batches: response.data.batches || [],
          semesters: response.data.semesters || [],
          academicYears: response.data.academicYears || [],
          courseSources: response.data.courseSources || [],
          batchClassYearSemesters: response.data.batchClassYearSemesters || [],
          classYears: response.data.classYears || [],
        });
      }
    } catch (error) {
      message.error("Failed to load filter options");
    }
  };

  const fetchStudentCourseScores = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.status && { statusId: filters.status }),
      };

      const response = await apiClient.get(endPoints.getAllScores, { params });

      if (response.data) {
        const formattedData = response.data.content.map((item) => ({
          key: item.id?.toString(),
          id: item.id,
          studentId: {
            id: item.studentId?.toString(),
            student: { name: item.studentName },
          },
          course: item.course || { id: null, displayName: "N/A" },
          batchClassYearSemester:
            item.bcys || {
              id: item.bcys?.id?.toString(),
              displayName: item.bcys?.displayName || "N/A",
            },
          courseSource: item.courseSource || { id: null, displayName: "N/A" },
          score: item.score,
          isReleased: item.isReleased,
          rawData: item,
        }));

        setData(formattedData);
        setAllData(formattedData);

        setPagination((prev) => ({
          ...prev,
          total: response.data.totalElements,
          current: response.data.page + 1,
          pageSize: response.data.size,
        }));
      }
    } catch (error) {
      message.error("Failed to load student course scores");
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

  // Reusable function to apply update via bulk endpoint (works for single & multiple)
  const applyUpdateViaBulk = async (updates) => {
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
    const updates = selectedRowKeys
      .map((key) => {
        const row = data.find((item) => item.key === key);
        if (!row) return null;

        const updateData = {};
        if (batchValues.score !== "") updateData.score = parseFloat(batchValues.score);
        if (batchValues.isReleased !== null) updateData.isReleased = batchValues.isReleased;
        if (batchValues.courseSource) updateData.courseSourceId = batchValues.courseSource;

        return { id: row.id, ...updateData };
      })
      .filter(Boolean);

    if (updates.length === 0) return;

    await applyUpdateViaBulk(updates);
    setSelectedRowKeys([]);
    setBatchValues({ score: "", courseSource: "", isReleased: null });
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
      message.error("Please enter a valid score between 0 and 100");
      return;
    }

    const updates = [{
      id: editingRecord.id,
      score: scoreValue
    }];

    await applyUpdateViaBulk(updates);
    setEditScoreModalVisible(false);
    setEditingRecord(null);
  };

  const handleToggleRelease = (record) => {
    Modal.confirm({
      title: "Confirm Release Status",
      content: (
        <p>
          Are you sure you want to{" "}
          <strong>{record.isReleased ? "unrelease" : "release"}</strong> this score
          for <strong>{record.studentId.student?.name || record.studentId.id}</strong>?
        </p>
      ),
      okText: record.isReleased ? "Unrelease" : "Release",
      okButtonProps: {
        className: record.isReleased ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"
      },
      cancelText: "Cancel",
      onOk: async () => {
        const updates = [{
          id: record.id,
          isReleased: !record.isReleased
        }];
        await applyUpdateViaBulk(updates);
      },
    });
  };

  const clearFilters = () => {
    setFilters({ department: "", status: "", batchClassYearSemester: "", search: "" });
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

  const from = pagination.total === 0 ? 0 : (pagination.current - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.current * pagination.pageSize, pagination.total);
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Student Course Scores</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage student scores and release status</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
          <Select
            value={filters.department || undefined}
            onChange={(v) => handleFilterChange("department", v)}
            placeholder="All Departments"
            allowClear
            showSearch
            className="w-full"
            dropdownClassName="dark:bg-gray-800"
          >
            {filterOptions.departments.map((d) => (
              <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <Select
            value={filters.status || undefined}
            onChange={(v) => handleFilterChange("status", v)}
            placeholder="All Status"
            allowClear
            className="w-full"
            dropdownClassName="dark:bg-gray-800"
          >
            {filterOptions.studentStatuses.map((s) => (
              <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch/Year/Semester</label>
          <Select
            value={filters.batchClassYearSemester || undefined}
            onChange={(v) => handleFilterChange("batchClassYearSemester", v)}
            placeholder="All"
            allowClear
            className="w-full"
            dropdownClassName="dark:bg-gray-800"
          >
            {filterOptions.batchClassYearSemesters.map((b) => (
              <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Student ID or Name"
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200"
            />
            {searchText && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-3 text-gray-500">✕</button>
            )}
          </div>
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
            <InputNumber min={0} max={100} step={0.1} value={batchValues.score} onChange={(v) => setBatchValues({ ...batchValues, score: v })} placeholder="Score" />
            <Select value={batchValues.courseSource || undefined} onChange={(v) => setBatchValues({ ...batchValues, courseSource: v })} placeholder="Course Source" allowClear className="w-48">
              {filterOptions.courseSources.map((s) => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
            </Select>
            <Select
              value={batchValues.isReleased !== null ? (batchValues.isReleased ? "yes" : "no") : undefined}
              onChange={(v) => setBatchValues({ ...batchValues, isReleased: v === "yes" ? true : v === "no" ? false : null })}
              placeholder="Release?"
              allowClear
              className="w-40"
            >
              <Select.Option value="yes">Release</Select.Option>
              <Select.Option value="no">Don't Release</Select.Option>
            </Select>
            <button onClick={applyBatchUpdate} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Apply ({selectedRowKeys.length})
            </button>
            <button onClick={clearBatchUpdate} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400">
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
                <input type="checkbox" checked={selectedRowKeys.length === data.length && data.length > 0} onChange={handleSelectAll} className="rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Batch/Year/Sem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Released</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-500">No records found</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.key} className={selectedRowKeys.includes(item.key) ? "bg-blue-50 dark:bg-blue-900/30" : ""}>
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedRowKeys.includes(item.key)} onChange={() => handleRowSelection(item.key)} /></td>
                  <td className="px-6 py-4 text-sm">{item.studentId.id}</td>
                  <td className="px-6 py-4 text-sm">{item.studentId.student?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">{item.course.displayName}</td>
                  <td className="px-6 py-4 text-sm">{item.batchClassYearSemester.displayName}</td>
                  <td className="px-6 py-4 text-sm">{item.courseSource.displayName}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.score?.toFixed(2) || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isReleased ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                      {item.isReleased ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditScoreClick(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        title="Edit Score"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleRelease(item)}
                        className={item.isReleased 
                          ? "text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200" 
                          : "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"}
                        title={item.isReleased ? "Unrelease" : "Release"}
                      >
                        {item.isReleased ? <EyeOff size={16} /> : <Eye size={16} />}
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
            Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{pagination.total}</strong> results
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
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
                else if (pagination.current >= totalPages - 2) pageNum = totalPages - 4 + i;
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
        className="dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-title]:text-gray-200"
      >
        {editingRecord && (
          <div className="space-y-4">
            <p><strong>Student:</strong> {editingRecord.studentId.student?.name || editingRecord.studentId.id}</p>
            <p><strong>Course:</strong> {editingRecord.course.displayName}</p>
            <div>
              <label className="block text-sm font-medium mb-2">New Score (0-100)</label>
              <InputNumber
                min={0}
                max={100}
                step={0.1}
                value={editScoreValue}
                onChange={setEditScoreValue}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Dark mode fixes for AntD Select */}
      <style jsx global>{`
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