import React, { useState, useEffect, useMemo } from "react";
import { Table, message, Spin, Input, Modal, InputNumber, Select } from "antd";
import apiClient from "../../components/api/apiClient"; 
import endPoints from "../../components/api/endPoints";

const initialData = [];

export default function StudentCourseScoreTable() {
  const [data, setData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
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
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    total: 0,
  });
  
  const [searchText, setSearchText] = useState("");

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch student course scores when pagination changes
  useEffect(() => {
    fetchStudentCourseScores();
  }, [pagination.current, pagination.pageSize]);

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
        page: pagination.current - 1, // Backend expects 0-based index
        size: pagination.pageSize,
        // Add filters to API call for server-side filtering
        ...(filters.search && { search: filters.search }),
        ...(filters.batchClassYearSemester && { bcysId: filters.batchClassYearSemester }),
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.status && { statusId: filters.status }),
      };

      console.log("Fetching with params:", params);
      const response = await apiClient.get(endPoints.getAllScores, { params });
      
      if (response.data) {
        const formattedData = response.data.content.map((item, index) => ({
          key: item.id?.toString() || index.toString(),
          id: item.id,
          studentId: { 
            id: item.studentId?.toString() || "N/A",
            student: { name: item.studentName || "N/A" } // Fixed: using studentName from API
          },
          course: item.course || { id: null, name: "N/A", displayName: "N/A" },
          batchClassYearSemester: item.bcys || { 
            batch: "N/A", 
            year: "N/A", 
            semester: "N/A",
            displayName: "N/A",
            id: null
          },
          courseSource: item.courseSource || { id: null, name: "N/A", displayName: "N/A" },
          score: item.score,
          isReleased: item.isReleased,
          rawData: item
        }));
        
        setData(formattedData);
        
        setPagination(prev => ({
          ...prev,
          total: response.data.totalElements,
          pageSize: response.data.size,
          current: response.data.page + 1, // Convert 0-based to 1-based
        }));
      }
    } catch (error) {
      message.error("Failed to load student course scores");
      console.error("Error fetching student course scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change (server-side filtering)
  useEffect(() => {
    if (pagination.current === 1) {
      fetchStudentCourseScores();
    } else {
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  }, [filters]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const applyBatchUpdate = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one row to update");
      return;
    }
    alert("Are you sure you want to apply the batch update?");
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

  const columns = [
    { 
      title: "Student Id", 
      dataIndex: ["studentId", "id"], 
      key: "studentId",
      sorter: (a, b) => {
        const idA = a.studentId.id?.toString() || '';
        const idB = b.studentId.id?.toString() || '';
        return idA.localeCompare(idB);
      },
    },
    { 
      title: "Student Name",
      key: "studentName",
      render: (_, record) => record.studentId.student?.name || "N/A",
    },
    { 
      title: "Course", 
      dataIndex: ["course", "displayName"], 
      key: "course",
      sorter: (a, b) => {
        const nameA = a.course.displayName?.toString() || '';
        const nameB = b.course.displayName?.toString() || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Batch / Year / Semester",
      key: "batchYearSemester",
      render: (_, record) => 
        record.batchClassYearSemester.displayName || 
        `${record.batchClassYearSemester.batch} / ${record.batchClassYearSemester.year} / ${record.batchClassYearSemester.semester}`,
      sorter: (a, b) => {
        const nameA = a.batchClassYearSemester.displayName?.toString() || '';
        const nameB = b.batchClassYearSemester.displayName?.toString() || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Course Source",
      dataIndex: ["courseSource", "displayName"],
      key: "courseSource",
      sorter: (a, b) => {
        const nameA = a.courseSource.displayName?.toString() || '';
        const nameB = b.courseSource.displayName?.toString() || '';
        return nameA.localeCompare(nameB);
      },
    },
    { 
      title: "Score", 
      dataIndex: "score", 
      key: "score",
      render: (score) => score !== null && score !== undefined ? score.toFixed(2) : "N/A",
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
    },
    {
      title: "Released",
      dataIndex: "isReleased",
      key: "isReleased",
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${val ? 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-800' : 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-800'}`}>
          {val ? "Yes" : "No"}
        </span>
      ),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.isReleased === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditScoreClick(record)}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Edit Score
          </button>
          <button
            onClick={() => handleToggleRelease(record)}
            className={`px-2 py-1 text-xs rounded transition-colors ${record.isReleased ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            {record.isReleased ? "Unrelease" : "Release"}
          </button>
        </div>
      ),
    },
  ];

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
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl dark:shadow-gray-900 max-w-full mx-auto">
      {/* Batch Update Section */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <InputNumber
          placeholder="Score"
          min={0}
          max={100}
          step={0.1}
          value={batchValues.score}
          onChange={(value) => setBatchValues({ ...batchValues, score: value })}
          className="w-32 dark:[&_input]:bg-gray-700 dark:[&_input]:text-gray-200 dark:[&_input]:border-gray-600"
          size="middle"
        />
        
        <Select
          placeholder="Course Source"
          value={batchValues.courseSource || undefined}
          onChange={(value) => setBatchValues({ ...batchValues, courseSource: value })}
          className="w-40 dark:[&_.ant-select-selector]:bg-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-600"
          size="middle"
          allowClear
        >
          <Select.Option value="">Select Course Source</Select.Option>
          {filterOptions.courseSources.map((source) => (
            <Select.Option key={source.id} value={source.id}>
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
            className="w-32 dark:[&_.ant-select-selector]:bg-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-600"
            size="middle"
            placeholder="Select Status"
            allowClear
          >
            <Select.Option value="yes">Release</Select.Option>
            <Select.Option value="no">Don't Release</Select.Option>
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
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center mb-6">
        {/* Department Filter */}
        <Select
          value={filters.department || undefined}
          onChange={(value) => handleFilterChange("department", value)}
          className="w-full sm:w-48 dark:[&_.ant-select-selector]:bg-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-600"
          size="middle"
          placeholder="All Departments"
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filterOptions.departments.map((dept) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || undefined}
          onChange={(value) => handleFilterChange("status", value)}
          className="w-full sm:w-48 dark:[&_.ant-select-selector]:bg-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-600"
          size="middle"
          placeholder="All Status"
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filterOptions.studentStatuses.map((status) => (
            <Select.Option key={status.id} value={status.id}>
              {status.name}
            </Select.Option>
          ))}
        </Select>

        {/* Batch/Year/Semester Filter */}
        <Select
          value={filters.batchClassYearSemester || undefined}
          onChange={(value) => handleFilterChange("batchClassYearSemester", value)}
          className="w-full sm:w-48 dark:[&_.ant-select-selector]:bg-gray-700 dark:[&_.ant-select-selector]:text-gray-200 dark:[&_.ant-select-selector]:border-gray-600"
          size="middle"
          placeholder="All Batch/Year/Semester"
          allowClear
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filterOptions.batchClassYearSemesters.map((bcys) => (
            <Select.Option key={bcys.id} value={bcys.id}>
              {bcys.name}
            </Select.Option>
          ))}
        </Select>

        {/* Search Input */}
        <Input.Search
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 Search by ID or Name"
          className="w-full sm:w-64 dark:[&_input]:bg-gray-700 dark:[&_input]:text-gray-200 dark:[&_input]:border-gray-600"
          size="middle"
          allowClear
        />

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm dark:shadow-gray-900 overflow-hidden">
        <Table
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showTotal: (total, range) => 
              `Showing ${range[0]}-${range[1]} of ${total} items (Page ${pagination.current} of ${Math.ceil(pagination.total / pagination.pageSize)})`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
            onShowSizeChange: (current, size) => {
              setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
            },
            position: ['bottomCenter'],
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          className="min-w-full bg-white dark:bg-gray-800"
          rowClassName={(record, index) =>
            index % 2 === 0
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          dataSource={data}
          columns={columns}
          loading={loading}
          size="middle"
        />
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
                className="w-full dark:[&_input]:bg-gray-700 dark:[&_input]:text-gray-200 dark:[&_input]:border-gray-600"
                placeholder="Enter new score"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}