import { useEffect, useMemo, useRef, useState } from "react";
import EditableTableApplicant, { type DataTypes } from "@/components/Extra/EditableTableApplicant";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";


export default function RegistrarStudents() {
  const [filters, setFilters] = useState({
    department: "",
    batch: "",
    status: "",
  });
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const objectUrlRefs = useRef<string[]>([]);

useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      setLoading(true);
      const list = await apiService.get(endPoints.students);

      const mapped: DataTypes[] = (list || []).map((s: any) => {
        // Build full names
        const englishName = [s.firstNameENG, s.fatherNameENG, s.grandfatherNameENG]
          .filter(Boolean)
          .join(" ");

        const amharicName = [s.firstNameAMH, s.fatherNameAMH, s.grandfatherNameAMH]
          .filter(Boolean)
          .join(" ");

        // Fix base64 photo
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
          departmentEnrolled: s.departmentEnrolled || "-",
          department: s.departmentEnrolled || "-",
          batchClassYearSemester: s.batchClassYearSemester || "-",
          batch: s.batchClassYearSemester || "-",
          year: s.academicYear || "-",
          photo: photoUrl,
          isDisabled: s.accountStatus === "DISABLED",
        } as DataTypes;

      });

      if (!cancelled) setStudents(mapped);
    } catch (err) {
      console.error("Failed to load students:", err);
      if (!cancelled) setStudents([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, []);

  const filteredData = useMemo(() => {
    const list = students;
    const search = searchText.toLowerCase();
    return list.filter((item: DataTypes) => {
      const matchedStatus = filters.status ? filters.status === item.status : true;
      const matchedBatch = filters.batch ? filters.batch === item.batch : true;
      const matchedDepartment = filters.department
        ? filters.department === item.department
        : true;
      const searchable = [item.name, item.amharicName, item.id, item.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        searchable.includes(search) && matchedStatus && matchedBatch && matchedDepartment
      );
    });
  }, [students, searchText, filters]);

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Blue Header */}
        <div className="w-full bg-blue-500 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 flex flex-col justify-center rounded-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Student Records
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6 mb-8 sm:mb-12">
            {[
              {
                title: "Registration",
                value: "350,897",
                change: "↑ 3.48% Since last month",
                color: "text-green-500",
              },
              {
                title: "NEW Students",
                value: "2,356",
                change: "↓ 3.48% Since last week",
                color: "text-red-500",
              },
              {
                title: "Graduation",
                value: "924",
                change: "↓ 1.10% Since yesterday",
                color: "text-orange-500",
              },
              {
                title: "Education",
                value: "49,65%",
                change: "↑ 12% Since last month",
                color: "text-green-500",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </h2>
                <p className={`text-xs sm:text-sm ${stat.color} mt-1`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 px-4  sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 -mt-12 sm:-mt-16 md:-mt-20">
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center mb-4 sm:mb-6">
              {["department", "status", "batch"].map((filter) => (
                <select
                  key={filter}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter]: e.target.value,
                    }))
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm sm:text-base
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {filter === "department" && (
                    <>
                      <option value="">All Departments</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Nurse">Nurse</option>
                    </>
                  )}
                  {filter === "status" && (
                    <>
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Student">Student</option>
                    </>
                  )}
                  {filter === "batch" && (
                    <>
                      <option value="">All Years</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </>
                  )}
                </select>
              ))}

              <input
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                placeholder="🔍 Search students..."
                className="w-full sm:w-64 md:w-80 lg:w-96 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base
                  rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                  text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl min-h-[200px] flex items-center justify-center">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-sm text-gray-500">No data</div>
              ) : (
                <EditableTableApplicant initialData={filteredData} />
              )}
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
          .EditableTableApplicant tr:hover {
            background-color: rgba(59, 130, 246, 0.1);
            transition: background-color 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
}
