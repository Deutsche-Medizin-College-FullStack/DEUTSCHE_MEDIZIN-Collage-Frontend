import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Stethoscope,
  HeartPulse,
  Pill,
  Building,
} from "lucide-react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import { Skeleton } from "@/components/ui/skeleton";

interface Department {
  dptID: number;
  deptName: string;
  totalCrHr: number | null;
  departmentCode: string;
  programModality: {
    modalityCode: string;
    modality: string;
    programLevel: {
      code: string;
      name: string;
      active: boolean;
    };
  };
  programLevel: {
    code: string;
    name: string;
    active: boolean;
  };
}

const getDepartmentIcon = (departmentCode: string) => {
  const icons: Record<string, React.ReactNode> = {
    MRT: <Calculator className="w-10 h-10" />,
    MED: <Stethoscope className="w-10 h-10" />,
    NUR: <HeartPulse className="w-10 h-10" />,
    CS: <BookOpen className="w-10 h-10" />,
    PHARM: <Pill className="w-10 h-10" />,
    BIO: <FlaskConical className="w-10 h-10" />,
    default: <Building className="w-10 h-10" />,
  };
  return icons[departmentCode] || icons.default;
};

const getDepartmentColor = (departmentCode: string) => {
  const colors: Record<string, string> = {
    MRT: "from-blue-500 to-blue-800",
    MED: "from-red-500 to-pink-600",
    NUR: "from-green-500 to-emerald-600",
    CS: "from-indigo-500 to-purple-600",
    PHARM: "from-purple-500 to-purple-800",
    BIO: "from-teal-500 to-cyan-600",
    default: "from-gray-500 to-gray-800",
  };
  return colors[departmentCode] || colors.default;
};

export default function DeanDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(endPoints.departments);
      setDepartments(response);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="space-y-12 px-8 py-8">
        <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-10 shadow-xl">
          <Skeleton className="h-10 w-64 bg-white/20" />
          <Skeleton className="h-6 w-96 mt-2 bg-white/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-62 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12 px-8 py-8">
        <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-red-600 to-red-700 p-10 shadow-xl">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Department Management
          </h1>
          <p className="text-white mt-2 text-lg drop-shadow-md">
            Error loading departments
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-8 py-8">
      {/* Hero Section */}
      <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-10 shadow-xl">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          Department Management
        </h1>
        <p className="text-white mt-2 text-lg drop-shadow-md">
          Manage all academic departments and their courses
        </p>
        <div className="mt-4 text-white/80">
          <p>Total Departments: {departments.length}</p>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Building className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            No Departments Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            There are no departments available in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {departments.map((dept) => (
            <div
              key={dept.dptID}
              onClick={() => navigate(`/dean/departments/${dept.dptID}`)}
              className={`cursor-pointer h-62 rounded-3xl p-6 shadow-xl bg-gradient-to-r ${getDepartmentColor(
                dept.departmentCode
              )} text-white flex flex-col justify-between transform hover:-translate-y-2 hover:shadow-2xl transition`}
            >
              <div className="flex items-center gap-4">
                {getDepartmentIcon(dept.departmentCode)}
                <div>
                  <h2 className="text-2xl font-extrabold">{dept.deptName}</h2>
                  <p className="text-white/80 text-sm">
                    {dept.programModality?.modality || "Regular"} •{" "}
                    {dept.programLevel?.name || "Bachelor's Degree"}
                  </p>
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <p className="text-lg">
                  <span className="font-semibold">ID:</span> {dept.dptID}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Code:</span>{" "}
                  {dept.departmentCode}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Total Credits:</span>{" "}
                  {dept.totalCrHr !== null ? dept.totalCrHr : "N/A"}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Modality:</span>{" "}
                  {dept.programModality?.modality || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
