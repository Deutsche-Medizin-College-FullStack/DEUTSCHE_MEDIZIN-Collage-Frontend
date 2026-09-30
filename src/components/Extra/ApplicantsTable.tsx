// ApplicantsTable.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageModal } from "@/hooks/ImageModal";
import { useModal } from "@/hooks/Modal";

export interface ApplicantRow {
  key: string;
  name: string;
  amharicName: string;
  year: string | number;
  semester?: string | number;
  department: string;
  gender: string;
  photo: string;
  status: string; // "PENDING" | "REJECTED" | "ACCEPTED"
}

interface ApplicantsTableProps {
  initialData: ApplicantRow[];
  loading?: boolean;
}

type SortKey = "name" | "year" | "department" | "gender" | "status";

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({
  initialData,
  loading = false,
}) => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  const [showAmharic, setShowAmharic] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sorted = useMemo(() => {
    if (!sortKey) return initialData;
    const copy = [...initialData];
    copy.sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [initialData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const deptBadge = (dept: string) => {
    const d = (dept || "").toLowerCase();
    if (d.includes("medic"))
      return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800";
    if (d.includes("nurs"))
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800";
    if (d.includes("pharm"))
      return "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-800";
    return "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600";
  };

  // ---- Status badge ----
  const statusBadge = (status: string) => {
    const s = (status || "").toUpperCase().trim();
    if (s === "ACCEPTED") {
      return {
        classes:
          "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700",
        dot: "bg-emerald-500",
        label: "Accepted",
      };
    }
    if (s === "REJECTED") {
      return {
        classes:
          "bg-red-100 text-red-800 ring-red-300 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700",
        dot: "bg-red-500",
        label: "Rejected",
      };
    }
    return {
      classes:
        "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-700",
      dot: "bg-amber-500",
      label: "Pending",
    };
  };

  const SortIcon = ({
    active,
    dir,
  }: {
    active: boolean;
    dir: "asc" | "desc";
  }) => (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${
        active ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
      } ${active && dir === "desc" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );

  const HeaderCell = ({
    label,
    sortable,
    sortKeyName,
    className = "",
  }: {
    label: string;
    sortable?: boolean;
    sortKeyName?: SortKey;
    className?: string;
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}
    >
      {sortable && sortKeyName ? (
        <button
          onClick={() => toggleSort(sortKeyName)}
          className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {label}
          <SortIcon active={sortKey === sortKeyName} dir={sortDir} />
        </button>
      ) : (
        label
      )}
    </th>
  );

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {sorted.length} applicant{sorted.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAmharic((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              showAmharic
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            አማርኛ {showAmharic ? "on" : "off"}
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <HeaderCell label="Applicant" sortable sortKeyName="name" />
                <HeaderCell label="Year / Sem" sortable sortKeyName="year" />
                <HeaderCell label="Gender" sortable sortKeyName="gender" />
                <HeaderCell
                  label="Department"
                  sortable
                  sortKeyName="department"
                />
                <HeaderCell label="Status" sortable sortKeyName="status" />
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </td>
                    <td />
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No applicants found
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const s = statusBadge(row.status);
                  return (
                    <tr
                      key={row.key}
                      onClick={() =>
                        navigate(`/registrar/applications/${row.key}`)
                      }
                      className="group cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      {/* Applicant */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {row.photo ? (
                            <img
                              src={row.photo}
                              alt={row.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(<ImageModal imageSrc={row.photo} />);
                              }}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-semibold shadow-sm">
                              {row.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {row.name || "—"}
                            </p>
                            {showAmharic &&
                              row.amharicName &&
                              row.amharicName !== "-" && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {row.amharicName}
                                </p>
                              )}
                          </div>
                        </div>
                      </td>

                      {/* Year / Semester */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {row.year || "—"}
                          {row.semester ? (
                            <span className="text-gray-400 dark:text-gray-500">
                              {" "}
                              / {row.semester}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-xs font-medium ${
                            row.gender?.toUpperCase() === "MALE"
                              ? "text-blue-600 dark:text-blue-400"
                              : row.gender?.toUpperCase() === "FEMALE"
                                ? "text-pink-600 dark:text-pink-400"
                                : "text-gray-500"
                          }`}
                        >
                          {row.gender || "—"}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${deptBadge(
                            row.department,
                          )}`}
                        >
                          {row.department || "—"}
                        </span>
                      </td>

                      {/* Status — always visible */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${s.classes}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                          />
                          {s.label}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="px-4 py-3 text-right">
                        <svg
                          className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-md text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-md text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsTable;
