import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Stethoscope, HeartPulse, Users, GraduationCap, Globe } from "lucide-react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

interface ProgramLevel {
  code: string;
  name: string;
  remark?: string;
  active: boolean;
}

interface ProgramModality {
  modalityCode: string;
  modality: string;
  programLevelCode: string;
}

interface Department {
  dptID: number;
  deptName: string;
  totalCrHr: number | null;
  departmentCode: string;
  // Remove icon and color from the interface as they're not in API response
  programLevelCode?: string;
  modalityCode?: string;
  programModality?: {
    modalityCode: string;
    modality: string;
    programLevel: {
      code: string;
      name: string;
      active: boolean;
    };
  };
  programLevel?: {
    code: string;
    name: string;
    active: boolean;
  };
}

// ---------------------------------------------------------------------
// Icons & Colors - Keep these as utility functions
const getDepartmentIcon = (deptName: string): React.ReactNode => {
  const name = deptName.toLowerCase();
  if (name.includes("nursing") || name.includes("health")) return <HeartPulse className="w-10 h-10" />;
  if (name.includes("medicine")) return <Stethoscope className="w-10 h-10" />;
  if (name.includes("computer") || name.includes("it")) return <BookOpen className="w-10 h-10" />;
  if (name.includes("business") || name.includes("management")) return <Users className="w-10 h-10" />;
  return <GraduationCap className="w-10 h-10" />;
};

const getDepartmentColor = (deptName: string): string => {
  const name = deptName.toLowerCase();
  if (name.includes("nursing") || name.includes("health")) return "from-green-500 to-emerald-600";
  if (name.includes("medicine")) return "from-red-500 to-pink-600";
  if (name.includes("computer") || name.includes("it")) return "from-indigo-500 to-purple-600";
  if (name.includes("business") || name.includes("management")) return "from-orange-500 to-red-600";
  return "from-blue-500 to-blue-700";
};
// ---------------------------------------------------------------------

export default function RegistrarDepartments() {
  const [programLevels, setProgramLevels] = useState<ProgramLevel[]>([]);
  const [programModalities, setProgramModalities] = useState<ProgramModality[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedModality, setSelectedModality] = useState<string | null>(null);

  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isLoadingModalities, setIsLoadingModalities] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const navigate = useNavigate();

  // 1. Fetch Program Levels
  useEffect(() => {
    const fetchProgramLevels = async () => {
      try {
        setIsLoadingLevels(true);
        const response = await apiService.get("/program-levels");
        const activeLevels = response.filter((lvl: ProgramLevel) => lvl.active);
        setProgramLevels(activeLevels);
      } catch (err) {
        console.error("Error fetching program levels:", err);
        setProgramLevels([]);
      } finally {
        setIsLoadingLevels(false);
      }
    };
    fetchProgramLevels();
  }, []);

  // 2. When a level is selected → fetch its modalities
  useEffect(() => {
    if (!selectedLevel) {
      setProgramModalities([]);
      setSelectedModality(null);
      return;
    }

    const fetchModalities = async () => {
      try {
        setIsLoadingModalities(true);
        const response = await apiService.get("/program-modality");
        const filtered = response.filter(
          (m: ProgramModality) => m.programLevelCode === selectedLevel
        );
        setProgramModalities(filtered);
      } catch (err) {
        console.error("Error fetching modalities:", err);
        setProgramModalities([]);
      } finally {
        setIsLoadingModalities(false);
      }
    };
    fetchModalities();
  }, [selectedLevel]);

  // 3. When a modality is selected → fetch departments and filter by selected level and modality
  useEffect(() => {
    if (!selectedModality || !selectedLevel) {
      setDepartments([]);
      return;
    }

    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await apiService.get(endPoints.departments);
        
        // Filter departments based on selected level and modality
        const filteredDepartments = response.filter((dept: any) => {
          // Check if department matches the selected level and modality
          const matchesModality = dept.programModality?.modalityCode === selectedModality;
          const matchesLevel = dept.programModality?.programLevel?.code === selectedLevel || 
                              dept.programLevel?.code === selectedLevel;
          
          return matchesModality && matchesLevel;
        });

        setDepartments(filteredDepartments);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [selectedModality, selectedLevel]);

  // -----------------------------------------------------------------
  // Handlers
  const handleLevelSelect = (code: string) => {
    setSelectedLevel(code);
    setSelectedModality(null);
  };

  const handleModalitySelect = (modalityCode: string) => {
    setSelectedModality(modalityCode);
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setSelectedModality(null);
  };

  const handleBackToModalities = () => {
    setSelectedModality(null);
  };

  const handleDepartmentClick = (dept: Department) => {
    // Create a serializable object to pass in navigation state
    const serializableDept = {
      dptID: dept.dptID,
      deptName: dept.deptName,
      totalCrHr: dept.totalCrHr,
      departmentCode: dept.departmentCode,
      programLevelCode: selectedLevel,
      modalityCode: selectedModality,
      programModality: dept.programModality,
      programLevel: dept.programLevel
    };

    // Navigate to department detail page with department ID (dptID)
    navigate(`/registrar/departments/${dept.dptID}`, {
      state: {
        programLevelCode: selectedLevel,
        modalityCode: selectedModality,
        departmentData: serializableDept
      },
    });
  };

  // -----------------------------------------------------------------
  if (isLoadingLevels) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 px-8 py-8">
      {/* Hero */}
      <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-10 shadow-xl">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          Department Management
        </h1>
        <p className="text-white mt-2 text-lg drop-shadow-md">
          Manage all academic departments and their courses
        </p>
      </div>

      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-4">
        {selectedLevel && (
          <button
            onClick={handleBackToLevels}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Program Levels
          </button>
        )}
        {selectedModality && (
          <button
            onClick={handleBackToModalities}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Modalities
          </button>
        )}
      </div>

      {/* 1. Program Levels */}
      {!selectedLevel && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Select Program Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programLevels.map((level) => (
              <div
                key={level.code}
                onClick={() => handleLevelSelect(level.code)}
                className="cursor-pointer rounded-2xl p-8 shadow-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white flex flex-col justify-between transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <GraduationCap className="w-12 h-12" />
                  <h3 className="text-2xl font-bold">{level.name}</h3>
                </div>
                {level.remark && <p className="text-purple-100">{level.remark}</p>}
                <div className="mt-6 flex justify-end">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. Program Modalities (for selected level) */}
      {selectedLevel && !selectedModality && (
        <>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {programLevels.find((l) => l.code === selectedLevel)?.name} – Select Modality
            </h2>
          </div>

          {isLoadingModalities ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : programModalities.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No modalities defined for this program level yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programModalities.map((mod) => (
                <div
                  key={mod.modalityCode}
                  onClick={() => handleModalitySelect(mod.modalityCode)}
                  className="cursor-pointer rounded-2xl p-8 shadow-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white flex flex-col items-center justify-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <Globe className="w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold">{mod.modality}</h3>
                  <span className="mt-2 text-sm opacity-90">
                    {mod.modalityCode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 3. Departments (for selected modality) */}
      {selectedModality && (
        <>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {programModalities.find((m) => m.modalityCode === selectedModality)?.modality} Departments
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {departments.length} department{departments.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {isLoadingDepartments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No departments found for this modality.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((dept) => (
                <div
                  key={dept.dptID}
                  onClick={() => handleDepartmentClick(dept)}
                  className={`cursor-pointer rounded-2xl p-8 shadow-lg bg-gradient-to-r ${getDepartmentColor(dept.deptName)} text-white flex flex-col justify-between transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="flex items-center gap-4">
                    {getDepartmentIcon(dept.deptName)}
                    <h3 className="text-2xl font-bold">{dept.deptName}</h3>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono">{dept.dptID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code:</span>
                      <span className="font-mono">{dept.departmentCode}</span>
                    </div>
                    {dept.totalCrHr && (
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span>{dept.totalCrHr}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}