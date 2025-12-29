import React, { useState, useEffect } from "react";
import { message, Input, Modal, InputNumber, Select } from "antd";
import apiClient from "../../components/api/apiClient"; 
import endPoints from "../../components/api/endPoints";

const initialData = [];

export default function StudentCourseScoreTable() {
  const [data, setData] = useState(initialData);
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch student course scores when pagination changes
  useEffect(() => {
    fetchStudentCourseScores();
  }, [pagination.current, pagination.pageSize, filters]);

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
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchStudentCourseScores = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.batchClassYearSemester && { bcysId: filters.batchClassYearSemester }),
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
            student: { name: item.studentName }
          },
          course: item.course || { id: null, displayName: "N/A" },
          batchClassYearSemester: item.bcys || { 
            displayName: "N/A",
            id: null
          },
          courseSource: item.courseSource || { id: null, displayName: "N/A" },
          score: item.score,
          isReleased: item.isReleased,
          rawData: item
        }));
        
        setData(formattedData);
        
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
          pageSize: response.data.size,
          current: response.data.page + 1,
        }));
      }
    } catch (error) {
      message.error("Failed to load student course scores");
      console.error("Error fetching student course scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelection = (key) => {
    setSelectedRowKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRowKeys.length === currentPageData.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(currentPageData.map(item => item.key));
    }
  };

  const applyBatchUpdate = async () => {
    try {
      const updates = selectedRowKeys.map(key => {
        const row = data.find(item => item.key === key);
        if (!row) return null;

        const updateData = {};
        
        if (batchValues.score !== "") {
          updateData.score = parseFloat(batchValues.score);
        }
        
        if (batchValues.isReleased !== null) {
          updateData.isReleased = batchValues.isReleased;
        }

        if (batchValues.courseSource) {
          updateData.courseSourceId = batchValues.courseSource;
        }

        return {
          id: row.id,
          ...updateData
        };
      }).filter(Boolean);

      await apiClient.put(endPoints.bulkUpdateScores, { updates });
      
      message.success("Batch update completed successfully");
      
      // Refresh data
      fetchStudentCourseScores();
      
      // Reset selection and batch values
      setSelectedRowKeys([]);
      setBatchValues({
        score: "",
        courseSource: "",
        isReleased: null,
      });
    } catch (error) {
      message.error("Failed to apply batch update");
      console.error("Error applying batch update:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
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

    try {
      await apiClient.put(
        endPoints.updateScore
          .replace(":studentId", editingRecord.studentId.id)
          .replace(":courseId", editingRecord.course.id)
          .replace(":batchClassYearSemesterId", editingRecord.batchClassYearSemester.id),
        { score: scoreValue }
      );
      message.success("Score updated successfully");
      setEditScoreModalVisible(false);
      setEditingRecord(null);
      fetchStudentCourseScores();
    } catch (error) {
      message.error("Failed to update score");
      console.error("Error updating score:", error);
    }
  };

  const handleToggleRelease = async (record) => {
    Modal.confirm({
      title: 'Confirm Release Status Change',
      content: `Are you sure you want to ${record.isReleased ? "unrelease" : "release"} this score?`,
      okText: 'Yes',
      cancelText: 'Cancel',
      className: 'dark:[&_.ant-modal-content]:bg-gray-800 dark:[&_.ant-modal-title]:text-gray-200 dark:[&_.ant-modal-body]:text-gray-300',
      onOk: async () => {
        try {
          await apiClient.put(
            endPoints.updateReleaseStatus
              .replace(":studentId", record.studentId.id)
              .replace(":courseId", record.course.id)
              .replace(":batchClassYearSemesterId", record.batchClassYearSemester.id),
            { isReleased: !record.isReleased }
          );
          message.success("Release status updated successfully");
          fetchStudentCourseScores();
        } catch (error) {
          message.error("Failed to update release status");
          console.error("Error updating release status:", error);
        }
      }
    });
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      status: "",
      batchClassYearSemester: "",
      search: "",
    });
    setSearchText("");
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearBatchUpdate = () => {
    setSelectedRowKeys([]);
    setBatchValues({
      score: "",
      courseSource: "",
      isReleased: null,
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handlePageSizeChange = (e) => {
    const pageSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, pageSize, current: 1 }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, data.length);
  const currentPageData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl dark:shadow-gray-900 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Student Course Scores
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage student scores and release status
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Department Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <Select
            value={filters.department || undefined}
            onChange={(value) => handleFilterChange("department", value)}
            className="w-full dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:border-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selection-placeholder]:text-gray-500"
            size="middle"
            placeholder={<span className="dark:text-gray-400">All Departments</span>}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.departments.map((dept) => (
              <Select.Option 
                key={dept.id} 
                value={dept.id} 
                className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Select
            value={filters.status || undefined}
            onChange={(value) => handleFilterChange("status", value)}
            className="w-full dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:border-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selection-placeholder]:text-gray-500"
            size="middle"
            placeholder={<span className="dark:text-gray-400">All Status</span>}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.studentStatuses.map((status) => (
              <Select.Option 
                key={status.id} 
                value={status.id} 
                className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {status.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Batch/Year/Semester Filter */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Batch/Year/Semester
          </label>
          <Select
            value={filters.batchClassYearSemester || undefined}
            onChange={(value) => handleFilterChange("batchClassYearSemester", value)}
            className="w-full dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:border-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selection-placeholder]:text-gray-500"
            size="middle"
            placeholder={<span className="dark:text-gray-400">All Batch/Year/Semester</span>}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.batchClassYearSemesters.map((bcys) => (
              <Select.Option 
                key={bcys.id} 
                value={bcys.id} 
                className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {bcys.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <Input.Search
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by Student ID or Name"
            className="w-full dark:[&_input]:bg-gray-800 dark:[&_input]:border-gray-700 dark:[&_input]:text-gray-200 dark:[&_input]::placeholder-gray-500"
            size="middle"
            allowClear
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Batch Update Section - Always visible */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <InputNumber
          placeholder="Score"
          min={0}
          max={100}
          step={0.1}
          value={batchValues.score}
          onChange={(value) => setBatchValues({ ...batchValues, score: value })}
          className="w-32 dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-200 dark:[&_input]:border-gray-700 dark:[&_input]::placeholder-gray-500"
          size="middle"
        />
        
        <Select
          placeholder="Course Source"
          value={batchValues.courseSource || undefined}
          onChange={(value) => setBatchValues({ ...batchValues, courseSource: value })}
          className="w-40 dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-700 dark:[&_.ant-select-selection-placeholder]:text-gray-500"
          size="middle"
          allowClear
        >
          <Select.Option value="">Select Course Source</Select.Option>
          {filterOptions.courseSources.map((source) => (
            <Select.Option key={source.id} value={source.id} className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              {source.name}
            </Select.Option>
          ))}
        </Select>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Release to Student
          </span>
          <Select
            value={batchValues.isReleased !== null ? (batchValues.isReleased ? 'yes' : 'no') : undefined}
            onChange={(value) => setBatchValues({ ...batchValues, isReleased: value === 'yes' ? true : value === 'no' ? false : null })}
            className="w-32 dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-700 dark:[&_.ant-select-selection-placeholder]:text-gray-500"
            size="middle"
            placeholder="Select Status"
            allowClear
          >
            <Select.Option value="yes" className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">Release</Select.Option>
            <Select.Option value="no" className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">Don't Release</Select.Option>
          </Select>
        </div>
        
        <button
          type="button"
          disabled={selectedRowKeys.length === 0}
          onClick={applyBatchUpdate}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          Apply to Selected ({selectedRowKeys.length})
        </button>

        {selectedRowKeys.length > 0 && (
          <button
            type="button"
            onClick={clearBatchUpdate}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRowKeys.length > 0 && selectedRowKeys.length === currentPageData.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('studentId')}
              >
                Student ID {sortConfig.key === 'studentId' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('studentName')}
              >
                Student Name {sortConfig.key === 'studentName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('course')}
              >
                Course {sortConfig.key === 'course' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('batchClassYearSemester')}
              >
                Batch/Year/Semester {sortConfig.key === 'batchClassYearSemester' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('courseSource')}
              >
                Course Source {sortConfig.key === 'courseSource' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('score')}
              >
                Score {sortConfig.key === 'score' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('isReleased')}
              >
                Released {sortConfig.key === 'isReleased' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No student course scores found
                </td>
              </tr>
            ) : (
              currentPageData.map((item, index) => (
                <tr 
                  key={item.key} 
                  className={`
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${selectedRowKeys.includes(item.key) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRowKeys.includes(item.key)}
                      onChange={() => handleRowSelection(item.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.studentId.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.studentId.student?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.course.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.batchClassYearSemester.displayName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.courseSource.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                    {item.score !== null && item.score !== undefined ? item.score.toFixed(2) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.isReleased 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {item.isReleased ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditScoreClick(item)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Edit Score
                      </button>
                      <button
                        onClick={() => handleToggleRelease(item)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          item.isReleased 
                            ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700' 
                            : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                        } text-white`}
                      >
                        {item.isReleased ? "Unrelease" : "Release"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.current === pageNum
                          ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
              <select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>
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
        className="dark:[&_.ant-modal-content]:bg-gray-800 
                  dark:[&_.ant-modal-title]:text-gray-200 
                  dark:[&_.ant-modal-close]:text-gray-400
                  dark:[&_.ant-modal-footer]:border-gray-700"
      >
        {editingRecord && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student: {editingRecord.studentId.student?.name || editingRecord.studentId.id}
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course: {editingRecord.course.displayName}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Score: {editingRecord.score !== null && editingRecord.score !== undefined ? editingRecord.score.toFixed(2) : "N/A"}
              </label>
              <InputNumber
                value={editScoreValue}
                onChange={setEditScoreValue}
                min={0}
                max={100}
                step={0.1}
                className="w-full dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-200 dark:[&_input]:border-gray-700"
                placeholder="Enter new score"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}