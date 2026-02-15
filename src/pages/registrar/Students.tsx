import { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useModal } from "@/hooks/Modal";
import { ImageModal } from "@/hooks/ImageModal";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import { Checkbox } from "antd";

interface FilterOption {
  id: string | number;
  name: string;
}

export interface DataTypes {
  key: string;
  studentId: number;
  id: string;
  name: string;
  amharicName: string;
  status: string;
  department: string;
  batch: string;
  photo?: string;
  isDisabled?: boolean;
}

export default function RegistrarStudents() {
  const [filters, setFilters] = useState({
    department: "",
    batch: [] as string[], // Changed to array for multiple selection
    status: "",
  });

  const [options, setOptions] = useState<{
    departments: FilterOption[];
    batchClassYearSemesters: FilterOption[];
    studentStatuses: FilterOption[];
  }>({
    departments: [],
    batchClassYearSemesters: [],
    studentStatuses: [],
  });

  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<DataTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmharic, setShowAmharic] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  
  const { openModal, closeModal } = useModal() as any;
  const navigate = useNavigate();

  /* ===================== Load filter options ===================== */
  useEffect(() => {
    async function loadFilters() {
      try {
        const res = await apiService.get(endPoints.lookupsDropdown);
        setOptions({
          departments: res.departments || [],
          batchClassYearSemesters: res.batchClassYearSemesters || [],
          studentStatuses: res.studentStatuses || [],
        });
      } catch (e) {
        console.error("Failed to load filters", e);
      }
    }
    loadFilters();
  }, []);

  /* ===================== Load students ===================== */
  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        setLoading(true);
        const list = await apiService.get(endPoints.students);

        const mapped: DataTypes[] = (list || []).map((s: any) => {
          const englishName = [
            s.firstNameENG,
            s.fatherNameENG,
            s.grandfatherNameENG,
          ]
            .filter(Boolean)
            .join(" ");

          const amharicName = [
            s.firstNameAMH,
            s.fatherNameAMH,
            s.grandfatherNameAMH,
          ]
            .filter(Boolean)
            .join(" ");

          const photoUrl = s.studentPhoto
            ? `data:image/jpeg;base64,${s.studentPhoto}`
            : undefined;

          return {
            key: String(s.id),
            studentId: s.id,
            id: s.username,
            name: englishName || "No Name",
            amharicName: amharicName || "ስም የለም",
            status: s.studentRecentStatus || "Unknown",
            department: s.departmentEnrolled || "-",
            batch: s.batchClassYearSemester || "-",
            photo: photoUrl,
            isDisabled: s.accountStatus === "DISABLED",
          };
        });

        if (!cancelled) setStudents(mapped);
      } catch (e) {
        console.error(e);
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ===================== Handle Status Change ===================== */
  const handleStatusChange = async (
    record: DataTypes,
    action: "enable" | "disable"
  ) => {
    const url =
      action === "disable"
        ? endPoints.studentsDeactivation.replace(
            ":id",
            String(record.studentId)
          )
        : endPoints.studentsActivation.replace(
            ":id",
            String(record.studentId)
          );

    await apiService.post(url, {});
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === record.studentId
          ? { ...s, isDisabled: action === "disable" }
          : s
      )
    );
    closeModal();
  };

  /* ===================== Handle Batch Selection ===================== */
  const handleBatchSelection = (batchName: string) => {
    setFilters((prev) => {
      const newBatch = prev.batch.includes(batchName)
        ? prev.batch.filter(b => b !== batchName)
        : [...prev.batch, batchName];
      return { ...prev, batch: newBatch };
    });
  };

  /* ===================== Select/Deselect All Batches ===================== */
  const handleSelectAllBatches = () => {
    const allBatchNames = options.batchClassYearSemesters.map(b => b.name);
    setFilters((prev) => ({
      ...prev,
      batch: prev.batch.length === allBatchNames.length ? [] : allBatchNames
    }));
  };

  /* ===================== Filtering ===================== */
  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();

    return students.filter((s: DataTypes) => {
      const matchDepartment = filters.department
        ? s.department === filters.department
        : true;

      const matchBatch = filters.batch.length > 0
        ? filters.batch.includes(s.batch)
        : true;

      const matchStatus = filters.status
        ? s.status === filters.status
        : true;

      const searchable = [s.name, s.amharicName, s.id, s.department]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search) &&
        matchDepartment &&
        matchBatch &&
        matchStatus
      );
    });
  }, [students, filters, searchText]);

  /* ===================== Format Selected Batches Display ===================== */
  const getBatchDisplayText = () => {
    if (filters.batch.length === 0) return "All Current BCYS";
    if (filters.batch.length === 1) return filters.batch[0];
    if (filters.batch.length === options.batchClassYearSemesters.length) return "All BCYS Selected";
    return `${filters.batch.length} Selected`;
  };

  /* ===================== Table Columns ===================== */
  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      width: 80,
      render: (text: string) =>
        text ? (
          <img
            src={text}
            onClick={(e) => {
              e.stopPropagation();
              openModal(<ImageModal imageSrc={text} />);
            }}
            className="w-12 h-12 rounded object-cover cursor-pointer"
            alt="Student"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">
            No Photo
          </div>
        ),
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 100,
      render: (_: any, r: DataTypes) => (
        <Link
          to={`/registrar/students/${r.key}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {r.id}
        </Link>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <span>Name</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAmharic(!showAmharic);
            }}
            className="text-xs px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {showAmharic ? "EN" : "AM"}
          </button>
        </div>
      ),
      width: 160,
      render: (_: any, r: DataTypes) => (
        <span className="font-medium text-sm">
          {showAmharic ? r.amharicName : r.name}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (t: string) => (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {t}
        </span>
      ),
    },
    { 
      title: "Current BCYS", 
      dataIndex: "batch", 
      width: 100 
    },
    { 
      title: "Department", 
      dataIndex: "department", 
      width: 140 
    },
    {
      title: "Account",
      width: 100,
      render: (_: any, r: DataTypes) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            r.isDisabled
              ? "bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200"
              : "bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200"
          }`}
        >
          {r.isDisabled ? "Disabled" : "Active"}
        </span>
      ),
    },
    {
      title: "",
      width: 60,
      render: (_: any, r: DataTypes) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal(
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl max-w-md">
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">
                  Manage Student Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {r.isDisabled 
                    ? `Enabling will allow ${r.name} to access the system again. The student will be able to log in and use all features.`
                    : `Disabling will prevent ${r.name} from accessing the system. The student will not be able to log in until re-enabled.`
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Student ID: <span className="font-medium">{r.id}</span>
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "disable")}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={r.isDisabled}
                  >
                    Disable
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "enable")}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!r.isDisabled}
                  >
                    Enable
                  </button>
                </div>
              </div>
            );
          }}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-xl"
          title="Manage student account"
        >
          •••
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Students Management
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Disabled</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Department */}
          <select
            className="filter-select"
            onChange={(e) =>
              setFilters((p) => ({ ...p, department: e.target.value }))
            }
            value={filters.department}
          >
            <option value="">All Departments</option>
            {options.departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Student Status */}
          <select
            className="filter-select"
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
            value={filters.status}
          >
            <option value="">All Status</option>
            {options.studentStatuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          {/* Multi-select BCYS Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBatchDropdown(!showBatchDropdown)}
              className="filter-select flex items-center justify-between min-w-[160px] text-left"
            >
              <span>{getBatchDisplayText()}</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  showBatchDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {showBatchDropdown && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-64 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <Checkbox
                    onChange={handleSelectAllBatches}
                    checked={filters.batch.length === options.batchClassYearSemesters.length}
                    indeterminate={
                      filters.batch.length > 0 && 
                      filters.batch.length < options.batchClassYearSemesters.length
                    }
                  >
                    <span className="font-medium text-sm">Select All</span>
                  </Checkbox>
                </div>
                
                <div className="p-2 max-h-80 overflow-y-auto">
                  {options.batchClassYearSemesters.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => handleBatchSelection(batch.name)}
                    >
                      <Checkbox
                        checked={filters.batch.includes(batch.name)}
                        onChange={() => handleBatchSelection(batch.name)}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-2"
                      />
                      <span className="text-sm">{batch.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, batch: [] }));
                      setShowBatchDropdown(false);
                    }}
                    className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-1"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-grow md:max-w-sm">
            <input
              placeholder="🔍 Search students"
              className="filter-input w-full"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </div>

          {/* Clear Filters */}
          {(filters.department || filters.batch.length > 0 || filters.status || searchText) && (
            <button
              onClick={() => {
                setFilters({ department: "", batch: [], status: "" });
                setSearchText("");
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selected BCYS Chips */}
        {filters.batch.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Selected BCYS:</span>
            {filters.batch.map((batch) => (
              <span
                key={batch}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
              >
                {batch}
                <button
                  onClick={() => handleBatchSelection(batch)}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Info Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing <span className="font-medium text-gray-900 dark:text-gray-200">{filteredData.length}</span> of <span className="font-medium text-gray-900 dark:text-gray-200">{students.length}</span> students
          </div>
          {loading && (
            <div className="text-blue-600 dark:text-blue-400 text-sm">
              Loading...
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-2 text-sm">Loading students...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-base font-medium mb-1">No students found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table<DataTypes>
              dataSource={filteredData}
              columns={columns}
              rowKey="key"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                size: "small",
                className: "px-3 py-2"
              }}
              onRow={(r) => ({
                onClick: () => navigate(`/registrar/students/${r.key}`),
              })}
              className="compact-table"
              rowClassName={(r) =>
                `
                cursor-pointer
                ${r.isDisabled
                  ? "bg-red-50 dark:bg-red-900/10"
                  : "bg-white dark:bg-gray-800"
                }
                hover:!bg-gray-50 dark:hover:!bg-gray-750
                text-gray-900 dark:text-gray-100
                `
              }
              scroll={{ x: 800 }}
            />
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {showBatchDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowBatchDropdown(false)}
        />
      )}

      {/* Styles */}
      <style>{`
        .filter-select {
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          min-width: 140px;
          height: 36px;
          cursor: pointer;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
        }
        
        .dark .filter-select {
          background: #1f2937;
          border-color: #4b5563;
          color: #e5e7eb;
        }
        
        .dark .filter-select:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.1);
        }
        
        .filter-input {
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          height: 36px;
        }
        
        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
        }
        
        .dark .filter-input {
          background: #1f2937;
          border-color: #4b5563;
          color: #e5e7eb;
        }
        
        .dark .filter-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.1);
        }
        
        /* Custom Checkbox Styling */
        .ant-checkbox-wrapper {
          display: flex;
          align-items: center;
        }
        
        .ant-checkbox-inner {
          border-radius: 0.25rem;
          border-color: #d1d5db;
        }
        
        .dark .ant-checkbox-inner {
          background-color: #374151;
          border-color: #6b7280;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .dark .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #60a5fa;
          border-color: #60a5fa;
        }
        
        /* Compact Table Styles */
        .compact-table .ant-table {
          background: transparent;
          font-size: 0.875rem;
        }
        
        .compact-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #374151 !important;
          font-weight: 600 !important;
          padding: 0.5rem 0.75rem !important;
          white-space: nowrap;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-table-thead > tr > th {
          background: #111827 !important;
          border-bottom: 1px solid #374151 !important;
          color: #e5e7eb !important;
        }
        
        .compact-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb !important;
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151 !important;
        }
        
        /* Remove all scale transforms and transitions */
        .compact-table .ant-table-tbody > tr,
        .compact-table .ant-table-tbody > tr > td,
        .compact-table .ant-table-tbody > tr:hover > td {
          transform: none !important;
          transition: none !important;
          scale: 1 !important;
        }
        
        /* Fix white flash on hover */
        .compact-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background: inherit !important;
        }

        /* Fix white flash specifically for disabled rows */
        .compact-table .ant-table-tbody > tr.bg-red-50:hover > td,
        .compact-table .ant-table-tbody > tr.bg-red-900\\/10:hover > td {
          background: inherit !important;
        }
        
        /* Simple hover background without scale */
        .compact-table .ant-table-tbody > tr:hover {
          background: #f9fafb !important;
        }
        
        .dark .compact-table .ant-table-tbody > tr:hover {
          background: #1f2937 !important;
        }
        
        /* Disabled rows hover */
        .compact-table .ant-table-tbody > tr.bg-red-50:hover,
        .compact-table .ant-table-tbody > tr.bg-red-50\\/10:hover {
          background: #fef2f2 !important;
        }
        
        .dark .compact-table .ant-table-tbody > tr.bg-red-900\\/10:hover {
          background: rgba(127, 29, 29, 0.2) !important;
        }
        
        /* Compact Pagination */
        .compact-table .ant-pagination {
          margin: 0 !important;
          padding: 0.75rem !important;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-pagination {
          background: #111827;
          border-top: 1px solid #374151;
          color: #e5e7eb !important;
        }
        
        /* Add spacing between pagination items */
        .compact-table .ant-pagination-item {
          margin-right: 6px !important;
          margin-bottom: 4px !important;
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          background: white;
          min-width: 28px;
          height: 28px;
          line-height: 26px;
          font-size: 0.875rem;
        }
        
        .compact-table .ant-pagination-item:last-child {
          margin-right: 0 !important;
        }
        
        .compact-table .ant-pagination-prev,
        .compact-table .ant-pagination-next {
          margin-right: 6px !important;
        }
        
        .compact-table .ant-pagination-jump-prev,
        .compact-table .ant-pagination-jump-next {
          margin-right: 6px !important;
        }
        
        /* Ensure pagination items have enough space */
        .compact-table .ant-pagination {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .compact-table .ant-pagination > * {
          flex-shrink: 0;
        }
        
        .dark .compact-table .ant-pagination-item {
          background: #1f2937;
          border-color: #4b5563;
        }
        
        .compact-table .ant-pagination-item a {
          color: #4b5563;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-pagination-item a {
          color: #e5e7eb !important;
        }
        
        .compact-table .ant-pagination-item-active {
          border-color: #3b82f6;
          background: #3b82f6;
        }
        
        .compact-table .ant-pagination-item-active a {
          color: white !important;
          font-weight: 500;
        }
        
        .dark .compact-table .ant-pagination-item-active {
          border-color: #60a5fa;
          background: #60a5fa;
        }
        
        /* Prev/next buttons */
        .compact-table .ant-pagination-prev,
        .compact-table .ant-pagination-next {
          min-width: 28px;
          height: 28px;
        }
        
        .compact-table .ant-pagination-prev .ant-pagination-item-link,
        .compact-table .ant-pagination-next .ant-pagination-item-link {
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #4b5563;
          height: 28px;
          line-height: 26px;
        }
        
        .dark .compact-table .ant-pagination-prev .ant-pagination-item-link,
        .dark .compact-table .ant-pagination-next .ant-pagination-item-link {
          background: #1f2937;
          border-color: #4b5563;
          color: #e5e7eb !important;
        }
        
        /* Page size selector */
        .compact-table .ant-select-selector {
          border-radius: 0.25rem !important;
          border: 1px solid #d1d5db !important;
          background: white !important;
          height: 28px !important;
          min-height: 28px !important;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-select-selector {
          background: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .compact-table .ant-select-selection-item {
          line-height: 26px !important;
          color: #4b5563 !important;
          font-size: 0.875rem;
        }
        
        .dark .compact-table .ant-select-selection-item {
          color: #e5e7eb !important;
        }
        
        /* Quick jumper */
        .compact-table .ant-pagination-options-quick-jumper {
          font-size: 0.875rem;
          height: 28px;
        }
        
        .compact-table .ant-pagination-options-quick-jumper input {
          height: 28px;
          padding: 0 8px;
          font-size: 0.875rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .filter-select {
            min-width: 120px;
            flex: 1;
            font-size: 0.8125rem;
          }
          
          .filter-input {
            font-size: 0.8125rem;
          }
          
          .compact-table .ant-table-thead > tr > th,
          .compact-table .ant-table-tbody > tr > td {
            padding: 0.375rem 0.5rem !important;
            font-size: 0.8125rem;
          }
          
          .compact-table .ant-pagination {
            padding: 0.5rem !important;
            font-size: 0.8125rem;
          }
          
          /* Multi-select dropdown responsive */
          .relative > .filter-select {
            width: 100%;
          }
          
          .absolute {
            width: 100%;
          }
        }
        
        /* Subtle dark mode hover */
        .dark .bg-gray-750 {
          background-color: #2d3748;
        }
      `}</style>
    </div>
  );
}