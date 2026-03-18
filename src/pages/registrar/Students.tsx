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
    batchFilter: [] as string[],
    status: "",
  });

  const [options, setOptions] = useState<{
    departments: FilterOption[];
    batchClassYearSemesters: FilterOption[];
    studentStatuses: FilterOption[];
    batches: FilterOption[];
  }>({
    departments: [],
    batchClassYearSemesters: [],
    studentStatuses: [],
    batches: [],
  });

  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<DataTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmharic, setShowAmharic] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
          batches: res.batches || [],
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

        // Check sessionStorage first
        const cachedData = sessionStorage.getItem("students_list");
        const cachedTime = sessionStorage.getItem("students_list_time");

        // Use cache if it exists and is less than 10 minutes old
        if (
          cachedData &&
          cachedTime &&
          Date.now() - parseInt(cachedTime) < 10 * 60 * 1000
        ) {
          const parsed = JSON.parse(cachedData);
          if (!cancelled) {
            setStudents(parsed);
            setLoading(false);
          }
          return;
        }

        // Otherwise fetch from API
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

        // Store in sessionStorage
        sessionStorage.setItem("students_list", JSON.stringify(mapped));
        sessionStorage.setItem("students_list_time", String(Date.now()));

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
    action: "enable" | "disable",
  ) => {
    const url =
      action === "disable"
        ? endPoints.studentsDeactivation.replace(
            ":id",
            String(record.studentId),
          )
        : endPoints.studentsActivation.replace(":id", String(record.studentId));

    await apiService.post(url, {});
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === record.studentId
          ? { ...s, isDisabled: action === "disable" }
          : s,
      ),
    );
    closeModal();
  };

  /* ===================== Handle Refresh ===================== */
  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Clear the sessionStorage cache
      sessionStorage.removeItem("students_list");
      sessionStorage.removeItem("students_list_time");

      // Fetch fresh data
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

      // Store in sessionStorage with new timestamp
      sessionStorage.setItem("students_list", JSON.stringify(mapped));
      sessionStorage.setItem("students_list_time", String(Date.now()));

      setStudents(mapped);
    } catch (error) {
      console.error("Refresh failed:", error);
      // Optional: Show error toast
    } finally {
      setLoading(false);
    }
  };

  /* ===================== Handle Batch Selection ===================== */
  const handleBatchSelection = (batchName: string) => {
    setFilters((prev) => {
      const newBatch = prev.batch.includes(batchName)
        ? prev.batch.filter((b) => b !== batchName)
        : [...prev.batch, batchName];
      return { ...prev, batch: newBatch };
    });
  };

  /* ===================== Select/Deselect All Batches ===================== */
  const handleSelectAllBatches = () => {
    const allBatchNames = options.batchClassYearSemesters.map((b) => b.name);
    setFilters((prev) => ({
      ...prev,
      batch: prev.batch.length === allBatchNames.length ? [] : allBatchNames,
    }));
  };

  /* ===================== Filtering ===================== */
  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();

    return students.filter((s: DataTypes) => {
      const matchDepartment = filters.department
        ? s.department === filters.department
        : true;

      const matchBatch =
        filters.batch.length > 0 ? filters.batch.includes(s.batch) : true;

      const matchBatchFilter = filters.batchFilter
        ? s.batch?.startsWith(`Batch ${filters.batchFilter}`) ||
          s.batch?.startsWith(filters.batchFilter)
        : true;
      const matchStatus = filters.status ? s.status === filters.status : true;

      const searchable = [s.name, s.amharicName, s.id, s.department]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search) &&
        matchDepartment &&
        matchBatch &&
        matchBatchFilter &&
        matchStatus
      );
    });
  }, [students, filters, searchText]);

  // Add this line right after filteredData:
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  /* ===================== Format Selected Batches Display ===================== */
  const getBatchDisplayText = () => {
    if (filters.batch.length === 0) return "All Current BCYS";
    if (filters.batch.length === 1) return filters.batch[0];
    if (filters.batch.length === options.batchClassYearSemesters.length)
      return "All BCYS Selected";
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
      width: 100,
    },
    {
      title: "Department",
      dataIndex: "department",
      width: 140,
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
                    : `Disabling will prevent ${r.name} from accessing the system. The student will not be able to log in until re-enabled.`}
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
              </div>,
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
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Disabled
              </span>
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

          <select
            className="filter-select"
            onChange={(e) =>
              setFilters((p) => ({ ...p, batchFilter: e.target.value }))
            }
            value={filters.batchFilter}
          >
            <option value="">All Batches</option>
            {options.batches.map((b) => (
              <option key={b.id} value={b.name}>
                Batch {b.name}
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
                    checked={
                      filters.batch.length ===
                      options.batchClassYearSemesters.length
                    }
                    indeterminate={
                      filters.batch.length > 0 &&
                      filters.batch.length <
                        options.batchClassYearSemesters.length
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
                      setFilters((prev) => ({ ...prev, batch: [] }));
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
          {(filters.department ||
            filters.batch.length > 0 ||
            filters.status ||
            searchText) && (
            <button
              onClick={() => {
                setFilters({
                  department: "",
                  batch: [],
                  batchFilter: "",
                  status: "",
                });
                setSearchText("");
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
            >
              Clear
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm flex items-center gap-1"
            title="Refresh students data"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Selected BCYS Chips */}
        {filters.batch.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected BCYS:
            </span>
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
            Showing{" "}
            <span className="font-medium text-gray-900 dark:text-gray-200">
              {paginatedData.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900 dark:text-gray-200">
              {filteredData.length}
            </span>{" "}
            students
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
              dataSource={paginatedData}
              columns={columns}
              rowKey="key"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total}`,
                size: "small",
                className: "px-3 py-2",
                onChange: (page, size) => {
                  setCurrentPage(page);
                  if (size !== pageSize) {
                    setPageSize(size);
                    setCurrentPage(1); // Reset to first page when changing page size
                  }
                },
                onShowSizeChange: (current, size) => {
                  setPageSize(size);
                  setCurrentPage(1); // Reset to first page when changing page size
                },
              }}
              onRow={(r) => ({
                onClick: () => navigate(`/registrar/students/${r.key}`),
              })}
              className="compact-table"
              rowClassName={(r) => {
                if (r.isDisabled) {
                  return "student-row disabled-row";
                }
                return "student-row active-row";
              }}
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
  
  /* Table Styles */
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
  
  /* Student Row Styles */
.student-row {
  position: relative !important;
  border-left: 4px solid transparent !important;
  transition: all 0.2s ease !important;
  color: #111827 !important; /* Dark text for light mode */
}

.dark .student-row {
  color: #f3f4f6 !important; /* Light text for dark mode */
}

/* Ensure cell text inherits the color */
.student-row td {
  color: inherit !important;
}
  
  /* Active row base background */
  .active-row {
    background-color: white !important;
  }
  
  .dark .active-row {
    background-color: #1f2937 !important;
  }
  
  /* Disabled row base background */
  .disabled-row {
    background-color: #fef2f2 !important;
  }
  
  .dark .disabled-row {
    background-color: rgba(127, 29, 29, 0.2) !important;
  }
  
  /* Hover effects */
  .active-row:hover {
    background-color: #f9fafb !important;
    border-left: 4px solid #22c55e !important;
  }
  
  .dark .active-row:hover {
    background-color: #2d3748 !important;
    border-left: 4px solid #22c55e !important;
  }
  
  .disabled-row:hover {
    background-color: #fee2e2 !important;
    border-left: 4px solid #ef4444 !important;
  }
  
  .dark .disabled-row:hover {
    background-color: rgba(127, 29, 29, 0.4) !important;
    border-left: 4px solid #ef4444 !important;
  }
  
  /* Remove Ant Design's default hover */
  .compact-table .ant-table-tbody > tr.ant-table-row:hover > td {
    background: transparent !important;
  }
  
  /* Ensure rows have proper positioning */
  .compact-table .ant-table-tbody > tr {
    position: relative !important;
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
  }
  
  .dark .compact-table .ant-pagination-item-active {
    border-color: #60a5fa;
    background: #60a5fa;
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
  
  /* Page size dropdown */
  .compact-table .ant-select-dropdown {
    background-color: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0.375rem !important;
  }
  
  .dark .compact-table .ant-select-dropdown {
    background-color: #1f2937 !important;
    border-color: #4b5563 !important;
  }
  
  .compact-table .ant-select-item {
    color: #374151 !important;
    font-size: 0.875rem !important;
    padding: 0.375rem 0.75rem !important;
  }
  
  .dark .compact-table .ant-select-item {
    color: #e5e7eb !important;
    background-color: #1f2937 !important;
  }
  
  .compact-table .ant-select-item:hover {
    background-color: #f3f4f6 !important;
  }
  
  .dark .compact-table .ant-select-item:hover {
    background-color: #374151 !important;
  }
  
  .compact-table .ant-select-item-option-selected {
    background-color: #e5e7eb !important;
    font-weight: 500 !important;
  }
  
  .dark .compact-table .ant-select-item-option-selected {
    background-color: #4b5563 !important;
    color: white !important;
  }
  
  /* Quick jumper */
  .compact-table .ant-pagination-options-quick-jumper input {
    height: 28px;
    padding: 0 8px;
    font-size: 0.875rem;
    background-color: white !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
    border-radius: 0.25rem;
  }
  
  .dark .compact-table .ant-pagination-options-quick-jumper input {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
    color: #e5e7eb !important;
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
  }
`}</style>
    </div>
  );
}
