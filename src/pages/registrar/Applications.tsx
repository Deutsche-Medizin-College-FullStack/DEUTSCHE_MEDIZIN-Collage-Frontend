import { useEffect, useMemo, useRef, useState } from "react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import { clearCacheForUrl } from "@/components/api/cacheService";
import ApplicantsTable, {
  type ApplicantRow,
} from "@/components/Extra/ApplicantsTable";
import { RefreshCw } from "lucide-react";

const CACHE_KEY = "registrar_applicants_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CachedShape = { timestamp: number; data: any[] };

function readCache(): any[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedShape = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: any[]) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data }),
    );
  } catch {
    // quota / serialization — skip
  }
}

export default function RegistrarApplications() {
  const [searchText, setSearchText] = useState("");
  const [filteredDepartment, setFilteredDepartment] = useState("");
  const [rows, setRows] = useState<ApplicantRow[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const objectUrlRefs = useRef<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = async () => {
    setLoading(true);
    await clearCacheForUrl(endPoints.applicantsList);
    sessionStorage.removeItem(CACHE_KEY);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // 1. Try cache first
        let applicants = readCache();

        // 2. Cache miss → fetch and cache
        if (!applicants) {
          applicants = await apiService.get(endPoints.applicantsList);
          if (applicants) writeCache(applicants);
        }

        // 3. Map API shape → table row shape
        const mapped: ApplicantRow[] = (applicants || []).map((a: any) => {
          const englishName = [
            a.firstNameENG,
            a.fatherNameENG,
            a.grandfatherNameENG,
          ]
            .filter(Boolean)
            .join(" ");

          const amharicName = [
            a.firstNameAMH,
            a.fatherNameAMH,
            a.grandfatherNameAMH,
          ]
            .filter(Boolean)
            .join(" ");

          return {
            key: String(a.id),
            name: englishName || "-",
            amharicName: amharicName || "-",
            year: a.classYearName || "-",
            semester: a.semesterName || "-",
            department: a.departmentEnrolledName || "-",
            gender: a.gender || "",
            photo: "",
            status: a.applicationStatus || "PENDING",
          };
        });

        // 4. Dynamic department filter options
        const depts = Array.from(
          new Set(
            mapped.map((m) => m.department).filter((d) => d && d !== "-"),
          ),
        ).sort();

        // 5. Fetch photos in parallel (blob URLs can't be cached)
        const withPhotos = await Promise.all(
          mapped.map(async (s) => {
            try {
              const blob = await apiService.get(
                endPoints.applicantPhoto.replace(":id", s.key),
                {},
                {
                  responseType: "blob",
                  headers: { requiresAuth: true },
                },
              );
              if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                objectUrlRefs.current.push(url);
                return { ...s, photo: url };
              }
              return s;
            } catch {
              return s;
            }
          }),
        );

        if (!cancelled) {
          setRows(withPhotos);
          setDepartmentOptions(depts);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setDepartmentOptions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      objectUrlRefs.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlRefs.current = [];
    };
  }, [refreshKey]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    return rows.filter((item) => {
      const matchedDepartment = filteredDepartment
        ? String(item.department) === filteredDepartment
        : true;

      const searchable = [item.name, item.amharicName, item.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(search) && matchedDepartment;
    });
  }, [rows, searchText, filteredDepartment]);

  return (
    <div className="min-h-screen space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-900">
        {/* Blue Header */}
        <div className="w-full bg-blue-500 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 h-40 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              New Applicants
            </h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh applicants"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {loading ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 -mt-12 sm:-mt-16 md:-mt-20">
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 p-4">
              <input
                type="text"
                placeholder="🔍 Search students..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-64 md:w-72 lg:w-80 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base
                rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
              <select
                value={filteredDepartment}
                onChange={(e) => setFilteredDepartment(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm sm:text-base
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Departments</option>
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <ApplicantsTable initialData={filteredData} loading={loading} />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-in-out forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
