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
  
  // Create Department States
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    deptName: "",
    totalCrHr: "",
    departmentCode: "",
    modalityCode: "",
    programLevelCode: "",
  });
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  
  // Filter Options
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  
  // Edit Department States
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);
  const [editDepartmentData, setEditDepartmentData] = useState({
    deptName: "",
    totalCrHr: "",
    departmentCode: "",
    modalityCode: "",
    programLevelCode: "",
  });

  const navigate = useNavigate();

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsLoadingFilters(true);
        const response = await apiService.get("/filters/options");
        setFilterOptions(response);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    fetchFilterOptions();
  }, []);

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

    navigate(`/registrar/departments/${dept.dptID}`, {
      state: {
        programLevelCode: selectedLevel,
        modalityCode: selectedModality,
        departmentData: serializableDept
      },
    });
  };

  // Create Department Handler
  const handleCreateDepartment = async () => {
    if (!newDepartment.deptName || !newDepartment.departmentCode || !newDepartment.totalCrHr) {
      alert("Please fill in all required fields");
      return;
    }

    if (!newDepartment.programLevelCode || !newDepartment.modalityCode) {
      alert("Please select both Program Level and Modality");
      return;
    }

    try {
      setIsCreatingDepartment(true);
      const response = await apiService.post("/departments/single", {
        deptName: newDepartment.deptName,
        totalCrHr: parseInt(newDepartment.totalCrHr),
        departmentCode: newDepartment.departmentCode,
        modalityCode: newDepartment.modalityCode,
        programLevelCode: newDepartment.programLevelCode,
      });

      alert("Department created successfully!");
      setIsCreateDepartmentOpen(false);
      setNewDepartment({
        deptName: "",
        totalCrHr: "",
        departmentCode: "",
        modalityCode: "",
        programLevelCode: "",
      });
      
      // Refresh departments list
      if (selectedModality && selectedLevel) {
        const response = await apiService.get(endPoints.departments);
        const filteredDepartments = response.filter((dept: any) => {
          const matchesModality = dept.programModality?.modalityCode === selectedModality;
          const matchesLevel = dept.programModality?.programLevel?.code === selectedLevel || 
                              dept.programLevel?.code === selectedLevel;
          return matchesModality && matchesLevel;
        });
        setDepartments(filteredDepartments);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create department");
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  // Edit Department Handlers
  const handleEditDepartment = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDepartment(dept);
    setEditDepartmentData({
      deptName: dept.deptName,
      totalCrHr: dept.totalCrHr?.toString() || "",
      departmentCode: dept.departmentCode,
      modalityCode: dept.programModality?.modalityCode || dept.modalityCode || "",
      programLevelCode: dept.programModality?.programLevel?.code || dept.programLevelCode || "",
    });
    setIsEditDepartmentOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;
    
    if (!editDepartmentData.deptName || !editDepartmentData.departmentCode || !editDepartmentData.totalCrHr) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsUpdatingDepartment(true);
      
      const updateData: any = {};
      if (editDepartmentData.deptName !== editingDepartment.deptName) {
        updateData.deptName = editDepartmentData.deptName;
      }
      if (editDepartmentData.totalCrHr !== editingDepartment.totalCrHr?.toString()) {
        updateData.totalCrHr = parseInt(editDepartmentData.totalCrHr);
      }
      if (editDepartmentData.departmentCode !== editingDepartment.departmentCode) {
        updateData.departmentCode = editDepartmentData.departmentCode;
      }
      if (editDepartmentData.modalityCode !== (editingDepartment.programModality?.modalityCode || editingDepartment.modalityCode)) {
        updateData.modalityCode = editDepartmentData.modalityCode;
      }
      if (editDepartmentData.programLevelCode !== (editingDepartment.programModality?.programLevel?.code || editingDepartment.programLevelCode)) {
        updateData.programLevelCode = editDepartmentData.programLevelCode;
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes to update");
        setIsEditDepartmentOpen(false);
        setEditingDepartment(null);
        return;
      }

      const response = await apiService.put(
        endPoints.updateDepartment(editingDepartment.dptID),
        updateData
      );

      alert("Department updated successfully!");
      setIsEditDepartmentOpen(false);
      setEditingDepartment(null);
      
      if (selectedModality && selectedLevel) {
        const response = await apiService.get(endPoints.departments);
        const filteredDepartments = response.filter((dept: any) => {
          const matchesModality = dept.programModality?.modalityCode === selectedModality;
          const matchesLevel = dept.programModality?.programLevel?.code === selectedLevel || 
                              dept.programLevel?.code === selectedLevel;
          return matchesModality && matchesLevel;
        });
        setDepartments(filteredDepartments);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update department");
    } finally {
      setIsUpdatingDepartment(false);
    }
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {programModalities.find((m) => m.modalityCode === selectedModality)?.modality} Departments
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {departments.length} department{departments.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <button
                onClick={() => setIsCreateDepartmentOpen(!isCreateDepartmentOpen)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Department
              </button>
            </div>
          </div>

          {/* Create Department Form */}
          {isCreateDepartmentOpen && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Create New Department
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Electrical Engineering"
                    value={newDepartment.deptName}
                    onChange={(e) => setNewDepartment({ ...newDepartment, deptName: e.target.value })}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., EE"
                    value={newDepartment.departmentCode}
                    onChange={(e) => setNewDepartment({ ...newDepartment, departmentCode: e.target.value.toUpperCase() })}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Total Credit Hours *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 138"
                    value={newDepartment.totalCrHr}
                    onChange={(e) => setNewDepartment({ ...newDepartment, totalCrHr: e.target.value })}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                
                {/* Program Level Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Program Level *
                  </label>
                  <select
                    value={newDepartment.programLevelCode}
                    onChange={(e) => setNewDepartment({ ...newDepartment, programLevelCode: e.target.value })}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="">Select Program Level</option>
                    {filterOptions?.programLevels?.map((level: any) => (
                      <option key={level.id} value={level.id}>
                        {level.name} ({level.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modality Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Modality *
                  </label>
                  <select
                    value={newDepartment.modalityCode}
                    onChange={(e) => setNewDepartment({ ...newDepartment, modalityCode: e.target.value })}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="">Select Modality</option>
                    {filterOptions?.programModalities
                      ?.filter((mod: any) => !newDepartment.programLevelCode || mod.programLevelId === newDepartment.programLevelCode)
                      .map((mod: any) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name} ({mod.id}) {mod.programLevelId ? `- Level: ${mod.programLevelId}` : ''}
                        </option>
                      ))}
                  </select>
                  {newDepartment.programLevelCode && filterOptions?.programModalities?.filter(
                    (mod: any) => mod.programLevelId === newDepartment.programLevelCode
                  ).length === 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      No modalities available for this program level
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateDepartment}
                  disabled={isCreatingDepartment}
                  className={`${
                    isCreatingDepartment ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  } text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2`}
                >
                  {isCreatingDepartment ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Department
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsCreateDepartmentOpen(false);
                    setNewDepartment({
                      deptName: "",
                      totalCrHr: "",
                      departmentCode: "",
                      modalityCode: "",
                      programLevelCode: "",
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Department Modal */}
          {isEditDepartmentOpen && editingDepartment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Department: {editingDepartment.deptName}
                    </h3>
                    <button
                      onClick={() => {
                        setIsEditDepartmentOpen(false);
                        setEditingDepartment(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        value={editDepartmentData.deptName}
                        onChange={(e) => setEditDepartmentData({ ...editDepartmentData, deptName: e.target.value })}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Department Code *
                      </label>
                      <input
                        type="text"
                        value={editDepartmentData.departmentCode}
                        onChange={(e) => setEditDepartmentData({ ...editDepartmentData, departmentCode: e.target.value.toUpperCase() })}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Total Credit Hours *
                      </label>
                      <input
                        type="number"
                        value={editDepartmentData.totalCrHr}
                        onChange={(e) => setEditDepartmentData({ ...editDepartmentData, totalCrHr: e.target.value })}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Program Level Dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Program Level *
                      </label>
                      <select
                        value={editDepartmentData.programLevelCode}
                        onChange={(e) => setEditDepartmentData({ ...editDepartmentData, programLevelCode: e.target.value })}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Program Level</option>
                        {filterOptions?.programLevels?.map((level: any) => (
                          <option key={level.id} value={level.id}>
                            {level.name} ({level.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Modality Dropdown */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Modality *
                      </label>
                      <select
                        value={editDepartmentData.modalityCode}
                        onChange={(e) => setEditDepartmentData({ ...editDepartmentData, modalityCode: e.target.value })}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Modality</option>
                        {filterOptions?.programModalities
                          ?.filter((mod: any) => !editDepartmentData.programLevelCode || mod.programLevelId === editDepartmentData.programLevelCode)
                          .map((mod: any) => (
                            <option key={mod.id} value={mod.id}>
                              {mod.name} ({mod.id}) {mod.programLevelId ? `- Level: ${mod.programLevelId}` : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleUpdateDepartment}
                      disabled={isUpdatingDepartment}
                      className={`flex-1 ${
                        isUpdatingDepartment ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                      } text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                    >
                      {isUpdatingDepartment ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Department
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditDepartmentOpen(false);
                        setEditingDepartment(null);
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoadingDepartments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : departments.length === 0 && !isCreateDepartmentOpen ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No departments found for this modality.
              </p>
              <button
                onClick={() => setIsCreateDepartmentOpen(true)}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Department
              </button>
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

                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={(e) => handleEditDepartment(dept, e)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 transform hover:scale-110"
                      title="Edit Department"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
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