import { useEffect, useMemo, useState } from "react";
import { Table, Checkbox } from "antd";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  SearchX,
  X,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useModal } from "@/hooks/Modal";
import { ImageModal } from "@/hooks/ImageModal";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import { useToast } from "@/hooks/use-toast";

import { clearCacheForUrl } from "@/components/api/cacheService";


/** Effectively "show everything" — must exceed any realistic student count. */
const ALL_PAGE_SIZE = 999999;

const PAGE_SIZE_CHOICES = [10, 20, 50, 100] as const;

export type FilterColumnKey =
  | "status"
  | "batch"
  | "originalBatch"
  | "department"
  | "accountStatus";

export interface DropdownState {
  columnKey: FilterColumnKey;
  title: string;
  rect: DOMRect;
}

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
  originalBatch: string;
  accountStatus: string;
  studentRecentStatusId?: number;
  departmentEnrolledId?: number;
  batchId?: number;
  batchClassYearSemesterId?: number;
  photo?: string;
  isDisabled?: boolean;
}

interface ExcelDropdownPortalProps {
  columnKey: FilterColumnKey;
  title: string;
  rect: DOMRect;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onApply: (newValues: string[]) => void;
  onClear: () => void;
  sortDirection: "asc" | "desc" | null;
  onSort: (direction: "asc" | "desc" | null) => void;
  onClose: () => void;
  getItemCount: (val: string) => number;
}

function ExcelHeaderTrigger({
  title,
  columnKey,
  isFiltered,
  selectedCount,
  sortDirection,
  onOpen,
}: {
  title: string;
  columnKey: FilterColumnKey;
  isFiltered: boolean;
  selectedCount: number;
  sortDirection: "asc" | "desc" | null;
  onOpen: (rect: DOMRect) => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onOpen(rect);
      }}
      className={`group flex items-center justify-between gap-2 cursor-pointer py-1.5 px-2 rounded-lg transition-all duration-200 select-none border ${
        isFiltered
          ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-2xs"
          : sortDirection
            ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 shadow-2xs"
            : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700/80"
      }`}
      title={`Click to filter and sort by ${title}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`font-semibold text-xs tracking-wide uppercase transition-colors truncate ${
            isFiltered
              ? "text-blue-700 dark:text-blue-300 font-bold"
              : sortDirection
                ? "text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
        >
          {title}
        </span>
        {sortDirection && (
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
              sortDirection === "asc"
                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
            }`}
          >
            {sortDirection === "asc" ? (
              <>
                <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                ASC
              </>
            ) : (
              <>
                <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" />
                DESC
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isFiltered ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-600 text-white dark:bg-blue-500 shadow-2xs">
            <Filter className="w-2.5 h-2.5 fill-current" />
            {selectedCount}
          </span>
        ) : (
          <span className="w-5 h-5 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/50 transition-colors">
            <SlidersHorizontal className="w-3 h-3" />
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isFiltered
              ? "text-blue-600 dark:text-blue-400 opacity-90"
              : "text-gray-400 dark:text-gray-500 opacity-60 group-hover:opacity-100"
          }`}
        />
      </div>
    </div>
  );
}

function ExcelFilterDropdownPortal({
  columnKey,
  title,
  rect,
  options,
  selectedValues,
  onApply,
  onClear,
  sortDirection,
  onSort,
  onClose,
  getItemCount,
}: ExcelDropdownPortalProps) {
  const [pending, setPending] = useState<string[]>(selectedValues);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, searchTerm]);

  const isAllVisibleSelected =
    visibleOptions.length > 0 &&
    visibleOptions.every((o) => pending.includes(o.value));
  const isAnyVisibleSelected = visibleOptions.some((o) =>
    pending.includes(o.value),
  );
  const isIndeterminate = isAnyVisibleSelected && !isAllVisibleSelected;

  const toggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleVals = new Set(visibleOptions.map((o) => o.value));
      setPending((prev) => prev.filter((v) => !visibleVals.has(v)));
    } else {
      const next = new Set(pending);
      visibleOptions.forEach((o) => next.add(o.value));
      setPending(Array.from(next));
    }
  };

  const toggleValue = (val: string) => {
    setPending((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const popoverWidth = 288;
  const left = Math.max(
    12,
    Math.min(rect.left, window.innerWidth - popoverWidth - 16),
  );
  const availableBelow = window.innerHeight - rect.bottom - 16;
  const top =
    availableBelow < 320 && rect.top > 350
      ? Math.max(16, rect.top - 440)
      : Math.min(rect.bottom + 6, window.innerHeight - 440);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px]"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className="excel-filter-dropdown fixed z-50 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 flex flex-col text-sm animate-in fade-in zoom-in-95 duration-100"
        style={{ top, left, maxHeight: 450 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 min-w-0">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {title} Filter & Sort
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sort section */}
        <div className="space-y-1 mb-2.5 pb-2.5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Order
          </div>
          <button
            type="button"
            onClick={() => onSort("asc")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              sortDirection === "asc"
                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500/30"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Sort Ascending (A to Z)</span>
            </div>
            {sortDirection === "asc" && <span className="text-xs">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => onSort("desc")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              sortDirection === "desc"
                ? "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold ring-1 ring-purple-500/30"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowUpAZ className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Sort Descending (Z to A)</span>
            </div>
            {sortDirection === "desc" && <span className="text-xs">✓</span>}
          </button>
          {sortDirection && (
            <button
              type="button"
              onClick={() => onSort(null)}
              className="w-full flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Sort
            </button>
          )}
        </div>

        {/* Filter Values Header */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Filter Options
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {pending.length} / {options.length} selected
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-gray-50 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Select All */}
        <div
          onClick={toggleSelectAll}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer select-none text-xs border-b border-gray-100 dark:border-gray-700 mb-1"
        >
          <Checkbox
            checked={isAllVisibleSelected}
            indeterminate={isIndeterminate}
            onChange={toggleSelectAll}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            (Select All{searchTerm ? " Matching" : ""})
          </span>
        </div>

        {/* Option Checkboxes List */}
        <div className="overflow-y-auto max-h-44 pr-1 space-y-0.5 custom-scrollbar">
          {visibleOptions.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
              No matching options
            </div>
          ) : (
            visibleOptions.map((opt) => {
              const isChecked = pending.includes(opt.value);
              const count = getItemCount(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer select-none text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isChecked
                      ? "bg-blue-50/70 dark:bg-blue-900/25 text-blue-900 dark:text-blue-100 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 mr-2">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleValue(opt.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="truncate" title={opt.label}>
                      {opt.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono shrink-0">
                    ({count})
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2.5 mt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onApply(pending)}
            className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={onClear}
            className="py-1.5 px-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default function RegistrarStudents() {
  const [filters, setFilters] = useState<{
    department: string[];
    batch: string[]; // Current BCYS
    originalBatch: string[]; // Original Batch
    status: string[];
    accountStatus: string[];
  }>({
    department: [],
    batch: [],
    originalBatch: [],
    status: [],
    accountStatus: [],
  });

  const [sortConfig, setSortConfig] = useState<{
    key: FilterColumnKey | null;
    direction: "asc" | "desc" | null;
  }>({
    key: null,
    direction: null,
  });

  const [activeDropdown, setActiveDropdown] = useState<DropdownState | null>(null);

  const [options, setOptions] = useState<{
    departments: FilterOption[];
    batchClassYearSemesters: FilterOption[];
    studentStatuses: FilterOption[];
    batches: FilterOption[];
    accountStatuses: FilterOption[];
  }>({
    departments: [],
    batchClassYearSemesters: [],
    studentStatuses: [],
    batches: [],
    accountStatuses: [],
  });

  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<DataTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmharic, setShowAmharic] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkEditValues, setBulkEditValues] = useState({
    status: "",
    department: "",
    accountStatus: "",
  });
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { openModal, closeModal } = useModal() as any;
  const navigate = useNavigate();
  const { toast } = useToast();

  const defaultAccountStatuses: FilterOption[] = [
    { id: "ENABLED", name: "ENABLED" },
    { id: "DISABLED", name: "DISABLED" },
  ];

  const resolveAccountStatuses = (source: any): FilterOption[] => {
    const candidates = [
      source?.accountStatuses,
      source?.accountStatus,
      source?.userStatuses,
    ];
    const resolved = candidates.find((candidate) => Array.isArray(candidate));
    return resolved && resolved.length > 0 ? resolved : defaultAccountStatuses;
  };

  const normalizeAccountStatus = (value: string) => {
    const normalized = value.toUpperCase();
    if (normalized === "ACTIVE") return "ENABLED";
    return normalized;
  };

  const normalizeLoadedAccountStatus = (value: any) => {
    const normalized = String(value || "").toUpperCase();
    if (normalized === "ACTIVE") return "ENABLED";
    if (normalized === "ENABLED" || normalized === "DISABLED") {
      return normalized;
    }
    return "ENABLED";
  };

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
          accountStatuses: [
            { id: "ENABLED", name: "ENABLED" },
            { id: "DISABLED", name: "DISABLED" },
          ],
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
          Date.now() - parseInt(cachedTime) < 7 * 24 * 60 * 60 * 1000
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
            originalBatch: s.batchName || "-",
            accountStatus: normalizeLoadedAccountStatus(s.accountStatus),
            studentRecentStatusId: s.studentRecentStatusId,
            departmentEnrolledId: s.departmentEnrolledId,
            batchId: s.batchId,
            batchClassYearSemesterId: s.batchClassYearSemesterId,
            photo: photoUrl,
            isDisabled:
              normalizeLoadedAccountStatus(s.accountStatus) === "DISABLED",
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
          originalBatch: s.batchName || "-",
          accountStatus: normalizeLoadedAccountStatus(s.accountStatus),
          studentRecentStatusId: s.studentRecentStatusId,
          departmentEnrolledId: s.departmentEnrolledId,
          batchId: s.batchId,
          batchClassYearSemesterId: s.batchClassYearSemesterId,
          photo: photoUrl,
          isDisabled:
            normalizeLoadedAccountStatus(s.accountStatus) === "DISABLED",
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

  const resetBulkEditPanel = () => {
    setSelectedRowKeys([]);
    setBulkEditValues({ status: "", department: "", accountStatus: "" });
  };

  const handleApplyBulkChanges = async () => {
    if (selectedRowKeys.length === 0) return;

    const shouldUpdateStatus = Boolean(bulkEditValues.status);
    const shouldUpdateDepartment = Boolean(bulkEditValues.department);
    const shouldUpdateAccountStatus = Boolean(bulkEditValues.accountStatus);

    if (
      !shouldUpdateStatus &&
      !shouldUpdateDepartment &&
      !shouldUpdateAccountStatus
    ) {
      toast({
        title: "No changes selected",
        description: "Select at least one field before applying changes.",
        variant: "destructive",
      });
      return;
    }

    const selectedStudents = students.filter((student) =>
      selectedRowKeys.includes(student.key),
    );

    const payload = selectedStudents.map((student) => {
      const item: Record<string, string | number> = {
        studentId: student.studentId,
      };

      if (shouldUpdateStatus) {
        item.studentRecentStatusId = Number(bulkEditValues.status);
      }

      if (shouldUpdateDepartment) {
        item.departmentEnrolledId = Number(bulkEditValues.department);
      }

      if (shouldUpdateAccountStatus) {
        item.accountStatus = normalizeAccountStatus(
          bulkEditValues.accountStatus,
        );
      }

      return item;
    });

    try {
      setIsBulkUpdating(true);
      const response = await apiService.put(
        endPoints.studentsBulkAcademicFields,
        payload,
      );

      toast({
        title: "Bulk update successful",
        description:
          response?.message ||
          `${payload.length} student record(s) updated successfully.`,
      });

      await handleRefresh();
      await clearCacheForUrl(endPoints.studentUserNames);
      await clearCacheForUrl(endPoints.studentsSlip);
      resetBulkEditPanel();
    } catch (error: any) {
      toast({
        title: "Bulk update failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to apply bulk changes.",
        variant: "destructive",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  /* ===================== Dropdown Close Listeners ===================== */
  useEffect(() => {
    if (!activeDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.(".excel-filter-dropdown")) return;
      setActiveDropdown(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeDropdown]);

  /* ===================== Counts for Options ===================== */
  const countsMap = useMemo(() => {
    const map: Record<FilterColumnKey, Record<string, number>> = {
      department: {},
      batch: {},
      originalBatch: {},
      status: {},
      accountStatus: { ENABLED: 0, DISABLED: 0 },
    };

    students.forEach((s) => {
      if (s.department) {
        map.department[s.department] = (map.department[s.department] || 0) + 1;
      }
      if (s.batch) {
        map.batch[s.batch] = (map.batch[s.batch] || 0) + 1;
      }
      if (s.originalBatch) {
        map.originalBatch[s.originalBatch] =
          (map.originalBatch[s.originalBatch] || 0) + 1;
      }
      if (s.status) {
        map.status[s.status] = (map.status[s.status] || 0) + 1;
      }
      if (s.isDisabled) {
        map.accountStatus.DISABLED = (map.accountStatus.DISABLED || 0) + 1;
      } else {
        map.accountStatus.ENABLED = (map.accountStatus.ENABLED || 0) + 1;
      }
    });

    return map;
  }, [students]);

  /* ===================== Column Options ===================== */
  const columnOptions = useMemo<
    Record<FilterColumnKey, { value: string; label: string }[]>
  >(() => {
    const deptOpts = options.departments.map((d) => ({
      value: d.name,
      label: d.name,
    }));
    const batchOpts = options.batchClassYearSemesters.map((b) => ({
      value: b.name,
      label: b.name,
    }));
    const origBatchOpts = options.batches.map((b) => ({
      value: b.name,
      label: `Batch ${b.name}`,
    }));
    const statusOpts = options.studentStatuses.map((s) => ({
      value: s.name,
      label: s.name.replaceAll("_", " "),
    }));
    const accountOpts = [
      { value: "ENABLED", label: "Active" },
      { value: "DISABLED", label: "Disabled" },
    ];

    const addDistinct = (
      base: { value: string; label: string }[],
      getter: (s: DataTypes) => { value: string; label: string } | null,
    ) => {
      const existing = new Set(base.map((o) => o.value));
      students.forEach((s) => {
        const item = getter(s);
        if (item && item.value && !existing.has(item.value)) {
          existing.add(item.value);
          base.push(item);
        }
      });
      return base;
    };

    return {
      department: addDistinct(deptOpts, (s) =>
        s.department && s.department !== "-"
          ? { value: s.department, label: s.department }
          : null,
      ),
      batch: addDistinct(batchOpts, (s) =>
        s.batch && s.batch !== "-" ? { value: s.batch, label: s.batch } : null,
      ),
      originalBatch: addDistinct(origBatchOpts, (s) =>
        s.originalBatch && s.originalBatch !== "-"
          ? { value: s.originalBatch, label: `Batch ${s.originalBatch}` }
          : null,
      ),
      status: addDistinct(statusOpts, (s) =>
        s.status && s.status !== "Unknown"
          ? { value: s.status, label: s.status.replaceAll("_", " ") }
          : null,
      ),
      accountStatus: accountOpts,
    };
  }, [options, students]);

  /* ===================== Filtering & Sorting ===================== */
  const filteredAndSortedData = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    const filtered = students.filter((s: DataTypes) => {
      const matchDepartment =
        filters.department.length > 0
          ? filters.department.includes(s.department)
          : true;

      const matchBatch =
        filters.batch.length > 0 ? filters.batch.includes(s.batch) : true;

      const matchOriginalBatch =
        filters.originalBatch.length > 0
          ? filters.originalBatch.includes(s.originalBatch)
          : true;

      const matchStatus =
        filters.status.length > 0 ? filters.status.includes(s.status) : true;

      const matchAccountStatus =
        filters.accountStatus.length > 0
          ? (filters.accountStatus.includes("ENABLED") && !s.isDisabled) ||
            (filters.accountStatus.includes("DISABLED") && s.isDisabled)
          : true;

      const searchable = [s.name, s.amharicName, s.id, s.department]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search) &&
        matchDepartment &&
        matchBatch &&
        matchOriginalBatch &&
        matchStatus &&
        matchAccountStatus
      );
    });

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let aVal = "";
        let bVal = "";

        if (sortConfig.key === "accountStatus") {
          aVal = a.isDisabled ? "Disabled" : "Active";
          bVal = b.isDisabled ? "Disabled" : "Active";
        } else if (sortConfig.key === "status") {
          aVal = a.status || "";
          bVal = b.status || "";
        } else if (sortConfig.key === "batch") {
          aVal = a.batch || "";
          bVal = b.batch || "";
        } else if (sortConfig.key === "originalBatch") {
          aVal = a.originalBatch || "";
          bVal = b.originalBatch || "";
        } else if (sortConfig.key === "department") {
          aVal = a.department || "";
          bVal = b.department || "";
        }

        const cmp = aVal.localeCompare(bVal, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  }, [students, filters, searchText, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchText, sortConfig]);

  /* ===================== Format Selected Batches Display ===================== */
  const getBatchDisplayText = () => {
    if (filters.batch.length === 0) return "All Current BCYS";
    if (filters.batch.length === 1) return filters.batch[0];
    if (
      options.batchClassYearSemesters.length > 0 &&
      filters.batch.length === options.batchClassYearSemesters.length
    )
      return "All BCYS Selected";
    return `${filters.batch.length} Selected`;
  };

  /* ===================== Table Columns ===================== */
  const columns = [
    {
      title: (
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase px-2 py-1 inline-block">
          Photo
        </span>
      ),
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
      title: (
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase px-2 py-1 inline-block">
          ID
        </span>
      ),
      dataIndex: "id",
      width: 200,
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
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
            Name
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAmharic(!showAmharic);
            }}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition border border-blue-200/80 dark:border-blue-700/80"
            title="Toggle between English and Amharic names"
          >
            {showAmharic ? "EN" : "AM"}
          </button>
        </div>
      ),
      width: 200,
      render: (_: any, r: DataTypes) => (
        <span className="font-medium text-sm">
          {showAmharic ? r.amharicName : r.name}
        </span>
      ),
    },
    {
      title: (
        <ExcelHeaderTrigger
          title="Status"
          columnKey="status"
          isFiltered={
            filters.status.length > 0 &&
            filters.status.length < (columnOptions.status?.length || 0)
          }
          selectedCount={filters.status.length}
          sortDirection={
            sortConfig.key === "status" ? sortConfig.direction : null
          }
          onOpen={(rect) =>
            setActiveDropdown({ columnKey: "status", title: "Status", rect })
          }
        />
      ),
      dataIndex: "status",
      width: 140,
      render: (t: string) => (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {t}
        </span>
      ),
    },
    {
      title: (
        <ExcelHeaderTrigger
          title="Current BCYS"
          columnKey="batch"
          isFiltered={
            filters.batch.length > 0 &&
            filters.batch.length < (columnOptions.batch?.length || 0)
          }
          selectedCount={filters.batch.length}
          sortDirection={
            sortConfig.key === "batch" ? sortConfig.direction : null
          }
          onOpen={(rect) =>
            setActiveDropdown({
              columnKey: "batch",
              title: "Current BCYS",
              rect,
            })
          }
        />
      ),
      dataIndex: "batch",
      width: 160,
    },
    {
      title: (
        <ExcelHeaderTrigger
          title="Batch"
          columnKey="originalBatch"
          isFiltered={
            filters.originalBatch.length > 0 &&
            filters.originalBatch.length <
              (columnOptions.originalBatch?.length || 0)
          }
          selectedCount={filters.originalBatch.length}
          sortDirection={
            sortConfig.key === "originalBatch" ? sortConfig.direction : null
          }
          onOpen={(rect) =>
            setActiveDropdown({
              columnKey: "originalBatch",
              title: "Original Batch",
              rect,
            })
          }
        />
      ),
      dataIndex: "originalBatch",
      width: 60,
    },
    {
      title: (
        <ExcelHeaderTrigger
          title="Department"
          columnKey="department"
          isFiltered={
            filters.department.length > 0 &&
            filters.department.length < (columnOptions.department?.length || 0)
          }
          selectedCount={filters.department.length}
          sortDirection={
            sortConfig.key === "department" ? sortConfig.direction : null
          }
          onOpen={(rect) =>
            setActiveDropdown({
              columnKey: "department",
              title: "Department",
              rect,
            })
          }
        />
      ),
      dataIndex: "department",
      width: 170,
    },
    {
      title: (
        <ExcelHeaderTrigger
          title="Account"
          columnKey="accountStatus"
          isFiltered={
            filters.accountStatus.length > 0 &&
            filters.accountStatus.length <
              (columnOptions.accountStatus?.length || 0)
          }
          selectedCount={filters.accountStatus.length}
          sortDirection={
            sortConfig.key === "accountStatus" ? sortConfig.direction : null
          }
          onOpen={(rect) =>
            setActiveDropdown({
              columnKey: "accountStatus",
              title: "Account Status",
              rect,
            })
          }
        />
      ),
      width: 140,
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

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: (string | number)[]) => {
      setSelectedRowKeys(newSelectedRowKeys.map((k) => String(k)));
    },
  };

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
          {/* Department */}
          <select
            className="filter-select"
            onChange={(e) => {
              const val = e.target.value;
              setFilters((p) => ({ ...p, department: val ? [val] : [] }));
            }}
            value={
              filters.department.length === 1
                ? filters.department[0]
                : filters.department.length > 1
                  ? "__multiple__"
                  : ""
            }
          >
            <option value="">All Departments</option>
            {filters.department.length > 1 && (
              <option value="__multiple__" disabled>
                {filters.department.length} Departments Selected
              </option>
            )}
            {options.departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Original Batch Filter */}
          <select
            className="filter-select"
            onChange={(e) => {
              const val = e.target.value;
              setFilters((p) => ({ ...p, originalBatch: val ? [val] : [] }));
            }}
            value={
              filters.originalBatch.length === 1
                ? filters.originalBatch[0]
                : filters.originalBatch.length > 1
                  ? "__multiple__"
                  : ""
            }
          >
            <option value="">All Batches</option>
            {filters.originalBatch.length > 1 && (
              <option value="__multiple__" disabled>
                {filters.originalBatch.length} Batches Selected
              </option>
            )}
            {options.batches.map((b) => (
              <option key={b.id} value={b.name}>
                Batch {b.name}
              </option>
            ))}
          </select>

          {/* Student Status */}
          <select
            className="filter-select"
            onChange={(e) => {
              const val = e.target.value;
              setFilters((p) => ({ ...p, status: val ? [val] : [] }));
            }}
            value={
              filters.status.length === 1
                ? filters.status[0]
                : filters.status.length > 1
                  ? "__multiple__"
                  : ""
            }
          >
            <option value="">All Status</option>
            {filters.status.length > 1 && (
              <option value="__multiple__" disabled>
                {filters.status.length} Statuses Selected
              </option>
            )}
            {options.studentStatuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            onChange={(e) => {
              const val = e.target.value;
              setFilters((p) => ({ ...p, accountStatus: val ? [val] : [] }));
            }}
            value={
              filters.accountStatus.length === 1
                ? filters.accountStatus[0]
                : filters.accountStatus.length > 1
                  ? "__multiple__"
                  : ""
            }
          >
            <option value="">All Account Status</option>
            {filters.accountStatus.length > 1 && (
              <option value="__multiple__" disabled>
                {filters.accountStatus.length} Selected
              </option>
            )}
            {options.accountStatuses.map((a) => (
              <option key={a.id} value={String(a.name).toUpperCase()}>
                {a.name.replaceAll("_", " ")}
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
          {(filters.department.length > 0 ||
            filters.batch.length > 0 ||
            filters.originalBatch.length > 0 ||
            filters.status.length > 0 ||
            filters.accountStatus.length > 0 ||
            searchText ||
            sortConfig.key) && (
            <button
              onClick={() => {
                setFilters({
                  department: [],
                  batch: [],
                  originalBatch: [],
                  status: [],
                  accountStatus: [],
                });
                setSearchText("");
                setSortConfig({ key: null, direction: null });
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              title="Reset all filters and sorting"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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

        {/* Bulk Edit Panel */}
        {selectedRowKeys.length > 0 && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Bulk Edit for {selectedRowKeys.length} Selected Student
                {selectedRowKeys.length > 1 ? "s" : ""}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <select
                className="filter-select"
                value={bulkEditValues.status}
                onChange={(e) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">Status (No Change)</option>
                {options.studentStatuses.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={bulkEditValues.department}
                onChange={(e) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
              >
                <option value="">Department (No Change)</option>
                {options.departments.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={bulkEditValues.accountStatus}
                onChange={(e) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    accountStatus: e.target.value,
                  }))
                }
              >
                <option value="">Account Status (No Change)</option>
                {options.accountStatuses.map((a) => (
                  <option key={a.id} value={String(a.name).toUpperCase()}>
                    {a.name.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <button
                onClick={handleApplyBulkChanges}
                disabled={isBulkUpdating}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isBulkUpdating ? "Applying..." : "Apply Changes"}
              </button>
              <button
                onClick={resetBulkEditPanel}
                disabled={isBulkUpdating}
                className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
  <div>
    Showing{" "}
    <span className="font-medium text-gray-900 dark:text-gray-200">
      {paginatedData.length}
    </span>{" "}
    of{" "}
    <span className="font-medium text-gray-900 dark:text-gray-200">
      {filteredAndSortedData.length}
    </span>{" "}
    students
    {(filters.department.length > 0 ||
      filters.batch.length > 0 ||
      filters.originalBatch.length > 0 ||
      filters.status.length > 0 ||
      filters.accountStatus.length > 0 ||
      sortConfig.key) && (
      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
        Filtered / Sorted
      </span>
    )}
  </div>

  <div className="flex items-center gap-3">
    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      Show
      <select
        value={pageSize >= ALL_PAGE_SIZE ? "All" : String(pageSize)}
        onChange={(e) => {
          const v = e.target.value;
          setPageSize(v === "All" ? ALL_PAGE_SIZE : Number(v));
          setCurrentPage(1);
        }}
        className="filter-select"
        style={{ minWidth: 78, height: 30, padding: "0 0.5rem" }}
      >
        {PAGE_SIZE_CHOICES.map((s) => (
          <option key={s} value={String(s)}>
            {s}
          </option>
        ))}
        <option value="All">All</option>
      </select>
      per page
    </label>

    {loading && (
      <div className="text-blue-600 dark:text-blue-400 text-sm">
        Loading...
      </div>
    )}
  </div>
</div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-2 text-sm">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table<DataTypes>
              dataSource={paginatedData}
              columns={columns}
              rowSelection={rowSelection}
              rowKey="key"
              locale={{
                emptyText: (
                  <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mb-4 shadow-2xs">
                      <SearchX className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                      No Students Found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
                      We couldn't find any student records matching your current filter criteria or search query.
                    </p>
                    {(filters.department.length > 0 ||
                      filters.batch.length > 0 ||
                      filters.originalBatch.length > 0 ||
                      filters.status.length > 0 ||
                      filters.accountStatus.length > 0 ||
                      searchText ||
                      sortConfig.key) && (
                      <button
                        onClick={() => {
                          setFilters({
                            department: [],
                            batch: [],
                            originalBatch: [],
                            status: [],
                            accountStatus: [],
                          });
                          setSearchText("");
                          setSortConfig({ key: null, direction: null });
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset All Filters & Sort
                      </button>
                    )}
                  </div>
                ),
              }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredAndSortedData.length,
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
                // onShowSizeChange: (current, size) => {
                //   setPageSize(size);
                //   setCurrentPage(1); // Reset to first page when changing page size
                // },
              }}
              onRow={(r) => ({
                onClick: (event) => {
                  const target = event.target as HTMLElement;
                  const clickedCheckbox =
                    target.closest(".ant-table-selection-column") ||
                    target.closest(".ant-checkbox-wrapper");

                  if (clickedCheckbox) return;
                  navigate(`/registrar/students/${r.key}`);
                },
              })}
              className="compact-table"
              rowClassName={(r) => {
                const selectedClass = selectedRowKeys.includes(r.key)
                  ? "selected-row"
                  : "";

                if (r.isDisabled) {
                  return `student-row disabled-row ${selectedClass}`.trim();
                }
                return `student-row active-row ${selectedClass}`.trim();
              }}
              scroll={{ x: 1050 }}
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

      {/* Excel Filter Dropdown Portal */}
      {activeDropdown && (
        <ExcelFilterDropdownPortal
          columnKey={activeDropdown.columnKey}
          title={activeDropdown.title}
          rect={activeDropdown.rect}
          options={columnOptions[activeDropdown.columnKey] || []}
          selectedValues={filters[activeDropdown.columnKey] || []}
          onApply={(newValues) => {
            setFilters((prev) => ({
              ...prev,
              [activeDropdown.columnKey]:
                newValues.length ===
                (columnOptions[activeDropdown.columnKey]?.length || 0)
                  ? []
                  : newValues,
            }));
            setActiveDropdown(null);
          }}
          onClear={() => {
            setFilters((prev) => ({
              ...prev,
              [activeDropdown.columnKey]: [],
            }));
            setActiveDropdown(null);
          }}
          sortDirection={
            sortConfig.key === activeDropdown.columnKey
              ? sortConfig.direction
              : null
          }
          onSort={(direction) => {
            setSortConfig(
              direction
                ? { key: activeDropdown.columnKey, direction }
                : { key: null, direction: null },
            );
          }}
          onClose={() => setActiveDropdown(null)}
          getItemCount={(val) =>
            countsMap[activeDropdown.columnKey]?.[val] || 0
          }
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
    background: #f8fafc !important;
    border-bottom: 2px solid #e2e8f0 !important;
    color: #334155 !important;
    font-weight: 700 !important;
    padding: 0.5rem 0.625rem !important;
    white-space: nowrap;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
  }
  
  .dark .compact-table .ant-table-thead > tr > th {
    background: #0f172a !important;
    border-bottom: 2px solid #334155 !important;
    color: #e2e8f0 !important;
  }
  
  .compact-table .ant-table-tbody > tr > td {
    border-bottom: 1px solid #e5e7eb !important;
    padding: 0.5rem 0.75rem !important;
    font-size: 0.875rem;
  }
  
  .dark .compact-table .ant-table-tbody > tr > td {
    border-bottom: 1px solid #374151 !important;
  }

  /* Empty State / Placeholder Styles for Dark Mode */
  .compact-table .ant-table-placeholder {
    background: transparent !important;
  }
  .compact-table .ant-table-placeholder > td {
    background: #ffffff !important;
    border-bottom: 1px solid #e2e8f0 !important;
    padding: 0 !important;
  }
  .dark .compact-table .ant-table-placeholder > td {
    background: #111827 !important;
    border-bottom: 1px solid #374151 !important;
    padding: 0 !important;
  }
  .compact-table .ant-table-tbody > tr.ant-table-placeholder:hover > td {
    background: #ffffff !important;
  }
  .dark .compact-table .ant-table-tbody > tr.ant-table-placeholder:hover > td {
    background: #111827 !important;
  }
  .dark .compact-table .ant-empty {
    color: #9ca3af !important;
  }

  /* Selected rows */
  .compact-table .ant-table-tbody > tr.selected-row > td,
  .compact-table .ant-table-tbody > tr.ant-table-row-selected > td {
    background-color: #dbeafe !important;
  }

  .compact-table .ant-table-tbody > tr.selected-row:hover > td,
  .compact-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
    background-color: #bfdbfe !important;
  }

  .dark .compact-table .ant-table-tbody > tr.selected-row > td,
  .dark .compact-table .ant-table-tbody > tr.ant-table-row-selected > td {
    background-color: rgba(30, 64, 175, 0.3) !important;
    color: #eff6ff !important;
  }

  .dark .compact-table .ant-table-tbody > tr.selected-row:hover > td,
  .dark .compact-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
    background-color: rgba(30, 64, 175, 0.42) !important;
    color: #eff6ff !important;
  }

  /* Student Row Base Styles */
  .student-row {
    transition: background-color 0.15s ease !important;
    color: #111827 !important;
  }

  .dark .student-row {
    color: #f3f4f6 !important;
  }

  .student-row td {
    color: inherit !important;
  }

  /* Default Active Row Background */
  .compact-table .ant-table-tbody > tr.active-row > td {
    background-color: #ffffff !important;
  }

  .dark .compact-table .ant-table-tbody > tr.active-row > td {
    background-color: #1f2937 !important;
  }

  /* Disabled Student Row Background */
  .compact-table .ant-table-tbody > tr.disabled-row > td {
    background-color: #fff5f5 !important;
  }

  .dark .compact-table .ant-table-tbody > tr.disabled-row > td {
    background-color: rgba(127, 29, 29, 0.16) !important;
  }

  /* Clean, Simple Row Hover */
  .compact-table .ant-table-tbody > tr.active-row:hover > td,
  .compact-table .ant-table-tbody > tr.ant-table-row:hover > td {
    background-color: #f8fafc !important;
  }

  .dark .compact-table .ant-table-tbody > tr.active-row:hover > td,
  .dark .compact-table .ant-table-tbody > tr.ant-table-row:hover > td {
    background-color: #283548 !important;
  }

  /* Disabled Row Hover */
  .compact-table .ant-table-tbody > tr.disabled-row:hover > td {
    background-color: #fee2e2 !important;
  }

  .dark .compact-table .ant-table-tbody > tr.disabled-row:hover > td {
    background-color: rgba(127, 29, 29, 0.28) !important;
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
