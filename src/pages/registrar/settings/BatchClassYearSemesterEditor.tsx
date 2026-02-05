// src/pages/admin/BatchClassYearSemesterEditor.tsx
import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaArrowLeft,
} from "react-icons/fa";
import { useToast } from "@/hooks/use-toast"; // Adjust path as needed
import { useNavigate, useParams } from "react-router-dom";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import apiClient from "@/components/api/apiClient";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

interface Department {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  entryYearId: string | null;
  academicYearEC: string | null;
  academicYearGC: string | null;
  classStartGC: string | null;
  classStartEC: string | null;
  classEndGC: string | null;
  classEndEC: string | null;
}

interface BCSY {
  id: number;
  name: string;
  batchId: number;
  classYearId: number;
  semesterId: string;
  departments: Department[];
  // Removed: entryYearId, classStartGC, classStartEC, classEndGC, classEndEC, gradingSystemId
}

interface BCSYForm {
  batchId: string;
  classYearId: string;
  semesterId: string;
  // Removed: entryYearId, classStartGC, classStartEC, classEndGC, classEndEC, gradingSystemId
  // Note: Department handling will be added later
}

// ────────────────────────────────────────────────
//  Main List Page
// ────────────────────────────────────────────────

const BatchClassYearSemesterEditor = () => {
  const [items, setItems] = useState<BCSY[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiService.get<any[]>(
          endPoints.BatchClassYearSemesters
        );

        const transformed = res.map((it: any) => ({
          id: it.bcysId ?? it.id,
          name: it.name || `${it.batchId}-${it.classYearId}-${it.semesterId}`,
          batchId: it.batchId,
          classYearId: it.classYearId,
          semesterId: it.semesterId,
          departments: it.departments || [], // Add departments array
        }));

        setItems(transformed);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load BCSY combinations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Instructions = () => (
    <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-indigo-200 dark:border-indigo-800/50 shadow-lg">
      <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-5 flex items-center gap-3">
        <span className="text-4xl">📅</span> Batch–Class–Year–Semester Management
      </h3>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            1
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">Purpose:</strong>
            <br />
            Create and manage academic combinations that link batches to specific class years, 
            semesters, and departments. Each BCYS defines the academic period for departments.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            2
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Department Management:
            </strong>
            <br />
            • Each BCYS can have <strong>multiple departments</strong>
            <br />
            • Departments can have <strong>different academic years</strong> and dates
            <br />
            • Add/remove departments using the Edit form
            <br />
            • Set department-specific class start/end dates
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            3
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Date Formats:
            </strong>
            <br />
            • <strong>Gregorian (G.C.)</strong>: Use <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">YYYY-MM-DD</code> format
            <br />
            • <strong>Ethiopian (E.C.)</strong>: Use <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">DD-MM-YYYY</code> format
            <br />
            • Academic Year: Select from dropdown (e.g., 2024/2025)
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            4
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Important Notes:
            </strong>
            <br />
            • BCYS name is <strong>auto-generated</strong> from batch, year, and semester
            <br />
            • <strong>At least one department</strong> is required when creating new BCYS
            <br />
            • Changes affect <strong>student records, transcripts, and reports</strong>
            <br />
            • Use the <strong>View/Edit modal</strong> for detailed management
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Critical Information
          </div>
          <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>• Deleting a BCYS may fail if students are enrolled in it</li>
            <li>• Changing dates affects existing academic records</li>
            <li>• Departments marked for removal will be permanently deleted</li>
            <li>• Always verify dates before saving changes</li>
          </ul>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span> Quick Tips
          </div>
          <div className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <span className="font-medium">Click row:</span>
              <span>View BCYS details</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Edit button:</span>
              <span>Modify departments, dates, and academic years</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">New button:</span>
              <span>Create new BCYS combination</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading combinations...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-5 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          BCSY Editor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Batch – Class/Year – Semester combinations
        </p>
      </header>

      <Instructions />

      <CrudSection title="All Combinations" data={items} setData={setItems} />
    </div>
  );
};

// ────────────────────────────────────────────────
//  Crud Section (list + modal)
// ────────────────────────────────────────────────

interface CrudProps {
  title: string;
  data: BCSY[];
  setData: React.Dispatch<React.SetStateAction<BCSY[]>>;
}

const CrudSection = ({ title, data, setData }: CrudProps) => {
  const navigate = useNavigate();
  const { toast } = useToast(); // Add this line

  // Combined modal state
const [modalState, setModalState] = useState<{
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  data: BCSY | null;
  formData: {
    batchId: string;
    classYearId: string;
    semesterId: string;
    departments: Array<{
      departmentId: number;
      departmentName: string;
      entryYearId: string;
      classStartGC: string;
      classStartEC: string;
      classEndGC: string;
      classEndEC: string;
      markedForRemoval?: boolean;
      isNew?: boolean;
    }>;
  };
}>({
  isOpen: false,
  mode: 'view',
  data: null,
  formData: {
    batchId: '',
    classYearId: '',
    semesterId: '',
    departments: [],
  },
});

  const [batches, setBatches] = useState<{ id: number; name?: string }[]>([]);
  const [classYears, setClassYears] = useState<{ id: number; name?: string }[]>(
    []
  );
  const [semesters] = useState<string[]>([
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "S6",
    "S7",
    "S8",
    "Pre",
  ]); // static for now
  const [entryYears] = useState<string[]>([
    "2015/16",
    "2016/17",
    "2017/18",
    "2018/19",
    "2019/20",
    "2020/21",
    "2021/22",
    "2022/23",
    "2023/24",
    "2024/25",
    "2025/26",
  ]);
  const [batch, setBatch] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [lookupData, setLookupData] = useState<any>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);


  const [optionsError, setOptionsError] = useState<string | null>(null);
  const filtered = data.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase())
  );
  const pageSize = showAll ? filtered.length : 12;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await apiService.get(
          endPoints.lookupsDropdown || "/api/filters/options"
        );
        setLookupData(res);
        console.log(res);
      } catch (err: any) {
        setOptionsError("Failed to load dropdown options");
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const getter = async () => {
      try {
        const response = await apiClient(endPoints.batches);
        setBatch(response.data);
        console.log(response);
      } catch (err) {}
    };
    getter();
  }, []);
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
    if (totalPages === 0) setPage(1);
  }, [filtered.length, totalPages]);

  //=================================================
  const openViewModal = (item: BCSY) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      data: item,
      formData: {
        batchId: String(item.batchId),
        classYearId: String(item.classYearId),
        semesterId: item.semesterId,
        departments: item.departments.map(dept => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          entryYearId: dept.entryYearId || '',
          classStartGC: dept.classStartGC || '',
          classStartEC: dept.classStartEC || '',
          classEndGC: dept.classEndGC || '',
          classEndEC: dept.classEndEC || '',
        })),
      },
    });
  };
  
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      data: null,
      formData: {
        batchId: '',
        classYearId: '',
        semesterId: 'FS', // default
        departments: [],
      },
    });
  };
  
  const openEditModal = () => {
    setModalState(prev => ({
      ...prev,
      mode: 'edit'
    }));
  };
  
  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'view',
      data: null,
      formData: {
        batchId: '',
        classYearId: '',
        semesterId: '',
        departments: [],
      },
    });
  };

  // Add these functions after the closeModal function

const addDepartment = () => {
  if (!lookupData?.departments?.length) return;
  
  const firstDept = lookupData.departments[0];
  setModalState(prev => ({
    ...prev,
    formData: {
      ...prev.formData,
      departments: [
        ...prev.formData.departments,
        {
          departmentId: firstDept.id,
          departmentName: firstDept.name,
          entryYearId: '',
          classStartGC: '',
          classStartEC: '',
          classEndGC: '',
          classEndEC: '',
          isNew: true
        }
      ]
    }
  }));
};

const removeDepartment = (index: number) => {
  setModalState(prev => {
    const updatedDepartments = [...prev.formData.departments];
    const department = updatedDepartments[index];
    
    if (department.isNew) {
      // Remove completely if it's new
      updatedDepartments.splice(index, 1);
    } else {
      // Mark for removal if it exists in the database
      updatedDepartments[index] = { ...department, markedForRemoval: true };
    }
    
    return {
      ...prev,
      formData: {
        ...prev.formData,
        departments: updatedDepartments
      }
    };
  });
};

const updateDepartmentField = (index: number, field: string, value: string) => {
  setModalState(prev => {
    const updatedDepartments = [...prev.formData.departments];
    updatedDepartments[index] = {
      ...updatedDepartments[index],
      [field]: value
    };
    
    return {
      ...prev,
      formData: {
        ...prev.formData,
        departments: updatedDepartments
      }
    };
  });
};
  //=================================================

  const handleSubmit = async () => {
    
  };

  const handleDelete = async (id: number, bcsyName?: string) => {
    if (
      !window.confirm(
        `Delete this BCYS combination?${bcsyName ? `\n\n"${bcsyName}"` : ''}\n\nThis action may be restricted if students/results exist.`
      )
    )
      return;
  
    try {
      const res = await apiService.delete(`${endPoints.BatchClassYearSemesters}/${id}`);
      
      // Show success toast
      toast({
        title: "Success",
        description: res.message || `BCYS deleted successfully`,
      });
      
      // Remove from local state
      setData(data.filter((d) => d.id !== id));
      
      return true; // Return success
    } catch (err: any) {
      // Show error toast
      toast({
        title: "Error",
        description: err?.response?.data?.error || err?.response?.data?.message || "Delete failed",
        variant: "destructive"
      });
      return false; // Return failure
    }
  };

  const handleSave = async () => {
    try {
      let payload: any = {
        batchId: Number(modalState.formData.batchId),
        classYearId: Number(modalState.formData.classYearId),
        semesterId: modalState.formData.semesterId,
      };
  
      // Build departmentUpdates array
      const departmentUpdates = modalState.formData.departments
        .filter(dept => !dept.markedForRemoval) // Skip removed ones
        .map(dept => {
          const update: any = { departmentId: dept.departmentId };
          
          if (dept.entryYearId) update.entryYearId = dept.entryYearId;
          if (dept.classStartGC) update.classStartGC = dept.classStartGC;
          if (dept.classStartEC) update.classStartEC = dept.classStartEC;
          if (dept.classEndGC) update.classEndGC = dept.classEndGC;
          if (dept.classEndEC) update.classEndEC = dept.classEndEC;
          
          return update;
        });
  
      // Add removals
      modalState.formData.departments
        .filter(dept => dept.markedForRemoval && !dept.isNew)
        .forEach(dept => {
          departmentUpdates.push({
            departmentId: dept.departmentId,
            remove: true
          });
        });
  
      if (departmentUpdates.length > 0) {
        payload.departmentUpdates = departmentUpdates;
      }
  
      let res;
      if (modalState.mode === 'create') {
        res = await apiService.post(endPoints.BatchClassYearSemesters, payload);
        
        // Add new BCYS to list
        const newBCYS: BCSY = {
          id: res.bcysId,
          name: res.name,
          batchId: res.batchId,
          classYearId: res.classYearId,
          semesterId: res.semesterId,
          departments: res.departments || []
        };
        setData(prev => [...prev, newBCYS]);
        
        toast({
          title: "Success",
          description: "BCYS created successfully",
        });
      } else if (modalState.data) {
        res = await apiService.put(
          `${endPoints.BatchClassYearSemesters}/${modalState.data.id}`,
          payload
        );
        
        // Update in list
        const updatedBCYS: BCSY = {
          id: res.bcysId || modalState.data.id,
          name: res.name,
          batchId: res.batchId,
          classYearId: res.classYearId,
          semesterId: res.semesterId,
          departments: res.departments || []
        };
        setData(prev => prev.map(item => 
          item.id === modalState.data!.id ? updatedBCYS : item
        ));
        
        toast({
          title: "Success",
          description: "BCYS updated successfully",
        });
      }
  
      closeModal();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Save failed",
        variant: "destructive"
      });
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      
      if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}${days > 0 ? `, ${days} day${days > 1 ? 's' : ''}` : ''}`;
      }
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } catch {
      return "Invalid dates";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition"
          >
            <FaPlus size={14} /> New
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>
          <button
            onClick={() => setView(view === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition"
          >
            {view === "table" ? <FaTh /> : <FaList />}{" "}
            {view === "table" ? "Grid" : "Table"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {view === "table" ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">BCYS ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Class Dates</th>
                <th className="p-4 font-semibold">Academic Year</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
<tbody>
  {currentItems.flatMap((item, index) => {
    const departments = item.departments || [];
    const rowCount = Math.max(1, departments.length);
    
    return departments.length > 0 
      ? departments.map((dept, deptIndex) => (
          <tr
            key={`${item.id}-${dept.departmentId}`}
            className="group border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition"
            onClick={() => openViewModal(item)}
          >
            {deptIndex === 0 && (
              <>
                <td 
                  rowSpan={rowCount} 
                  className="p-4 font-medium border-r border-gray-200 dark:border-gray-700"
                >
                  #{item.id}
                </td>
                <td 
                  rowSpan={rowCount} 
                  className="p-4 font-medium border-r border-gray-200 dark:border-gray-700"
                >
                  {item.name}
                </td>
              </>
            )}
            <td className="p-4 border-r border-gray-200 dark:border-gray-700">
              <div className="font-medium">{dept.departmentName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {dept.departmentCode}
              </div>
            </td>
            <td className="p-4 border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-1 text-sm">
                {dept.classStartGC && dept.classEndGC && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">GC:</span>
                    <span className="font-mono">
                      {dept.classStartGC} → {dept.classEndGC}
                    </span>
                  </div>
                )}
                {dept.classStartEC && dept.classEndEC && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">EC:</span>
                    <span className="font-mono">
                      {dept.classStartEC} → {dept.classEndEC}
                    </span>
                  </div>
                )}
                {(!dept.classStartGC || !dept.classEndGC) && 
                 (!dept.classStartEC || !dept.classEndEC) && (
                  <span className="text-gray-400 dark:text-gray-500 italic">No dates set</span>
                )}
              </div>
            </td>
            <td className="p-4 border-r border-gray-200 dark:border-gray-700">
              {dept.entryYearId || dept.academicYearGC || dept.academicYearEC ? (
                <div className="space-y-1">
                  {dept.entryYearId && (
                    <div className="font-medium">{dept.entryYearId}</div>
                  )}
                  {dept.academicYearGC && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      GC: {dept.academicYearGC}
                    </div>
                  )}
                  {dept.academicYearEC && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      EC: {dept.academicYearEC}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>
              )}
            </td>
            {deptIndex === 0 && (
              <td 
                rowSpan={rowCount} 
                className="p-4"
              >
                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewModal(item);
                    }}
                    className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-full"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))
      : [
          <tr
            key={item.id}
            className="group border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition"
            onClick={() => openViewModal(item)}
          >
            <td className="p-4 font-medium border-r border-gray-200 dark:border-gray-700">
              #{item.id}
            </td>
            <td className="p-4 font-medium border-r border-gray-200 dark:border-gray-700">
              {item.name}
            </td>
            <td className="p-4 text-gray-400 dark:text-gray-500 italic border-r border-gray-200 dark:border-gray-700">
              No departments
            </td>
            <td className="p-4 text-gray-400 dark:text-gray-500 italic border-r border-gray-200 dark:border-gray-700">
              —
            </td>
            <td className="p-4 text-gray-400 dark:text-gray-500 italic border-r border-gray-200 dark:border-gray-700">
              —
            </td>
            <td className="p-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewModal(item);
                  }}
                  className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-full"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ];
  })}
</tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition cursor-pointer"
              onClick={() => navigate(`/bcsy/${item.id}`)}
            >
              <div className="font-bold text-indigo-600">#{item.id}</div>
              <div className="font-semibold mt-1 text-lg">{item.name}</div>
              <div className="text-sm mt-2 opacity-80">
                Batch {item.batchId} • Year {item.classYearId} •{" "}
                {item.semesterId}
              </div>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-lg shadow-md">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewModal(item);
                  }}
                  className="p-2 hover:bg-yellow-100 rounded-full text-yellow-600"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 hover:bg-red-100 rounded-full text-red-600"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showAll && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

{/*==================================================================*/}
{/* Combined View/Edit/Create Modal */}
{modalState.isOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 md:p-8">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-indigo-600">
            {modalState.mode === 'create' ? 'Create New BCYS' : 
             modalState.mode === 'edit' ? 'Edit BCYS' : 'BCYS Details'}
          </h3>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* View Mode */}
        {modalState.mode === 'view' && modalState.data && (
          <div className="space-y-6">
            {/* Basic BCYS Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">BCYS ID</div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">#{modalState.data.id}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</div>
                <div className="text-xl font-semibold">{modalState.data.name}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Batch • Year • Semester</div>
                <div className="text-xl">
                  B{modalState.data.batchId} • Y{modalState.data.classYearId} • {modalState.data.semesterId}
                </div>
              </div>
            </div>

            {/* Departments Section */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">
                  Departments ({modalState.data.departments.length})
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Each department can have its own academic year and class dates
                </p>
              </div>

              {modalState.data.departments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  No departments assigned to this BCYS
                </div>
              ) : (
                <div className="space-y-4">
                  {modalState.data.departments.map((dept) => (
                    <div
                      key={dept.departmentId}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
                    >
                      {/* Department Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-lg">{dept.departmentName}</div>
                              <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {dept.departmentCode}
                              </span>
                            </div>
                          </div>
                          
                          {/* Academic Year - PROMINENT DISPLAY */}
                          {(dept.entryYearId || dept.academicYearGC || dept.academicYearEC) && (
                            <div className="text-right">
                              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg">
                                <span className="text-lg font-bold">📅</span>
                                <div>
                                  {dept.entryYearId && (
                                    <div className="font-bold text-base">{dept.entryYearId}</div>
                                  )}
                                  {(dept.academicYearGC || dept.academicYearEC) && (
                                    <div className="text-xs mt-0.5">
                                      {dept.academicYearGC && <div>GC: {dept.academicYearGC}</div>}
                                      {dept.academicYearEC && <div>EC: {dept.academicYearEC}</div>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dates Section - Simplified Display */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Class Dates */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              Class Dates
                            </h5>
                            
                            {/* Gregorian Dates */}
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500 dark:text-gray-400">Gregorian Calendar</div>
                              {dept.classStartGC && dept.classEndGC ? (
                                <div className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">From:</span>
                                    <span className="font-mono">{dept.classStartGC} G.C.</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-600 dark:text-gray-400">To:</span>
                                    <span className="font-mono">{dept.classEndGC} G.C.</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                                  No Gregorian dates set
                                </div>
                              )}
                            </div>

                            {/* Ethiopian Dates */}
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500 dark:text-gray-400">Ethiopian Calendar</div>
                              {dept.classStartEC && dept.classEndEC ? (
                                <div className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">From:</span>
                                    <span className="font-mono">{dept.classStartEC} E.C.</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-600 dark:text-gray-400">To:</span>
                                    <span className="font-mono">{dept.classEndEC} E.C.</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                                  No Ethiopian dates set
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Summary & Status */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Status
                            </h5>
                            
                            {/* Date Status Indicators */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${dept.classStartGC && dept.classEndGC ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <span className="text-sm">Gregorian Dates: {dept.classStartGC && dept.classEndGC ? '✓ Set' : '✗ Not Set'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${dept.classStartEC && dept.classEndEC ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <span className="text-sm">Ethiopian Dates: {dept.classStartEC && dept.classEndEC ? '✓ Set' : '✗ Not Set'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${dept.entryYearId ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <span className="text-sm">Academic Year: {dept.entryYearId ? '✓ Set' : '✗ Not Set'}</span>
                              </div>
                            </div>

                            {/* Missing Dates Warning */}
                            {(!dept.classStartGC || !dept.classEndGC || !dept.classStartEC || !dept.classEndEC) && (
                              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                                <span className="font-medium">⚠</span> Some dates are missing. Consider adding them in Edit mode.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                <FaEdit /> Edit BCYS
              </button>
              <button
  onClick={async () => {
    if (modalState.data) {
      const success = await handleDelete(modalState.data.id, modalState.data.name);
      if (success) {
        closeModal(); // Close the modal only on success
      }
    }
  }}
  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
>
  <FaTrash /> Delete BCYS
</button>
            </div>
          </div>
        )}

        {/* Edit/Create Mode */}
        {(modalState.mode === 'edit' || modalState.mode === 'create') && (
          <div className="space-y-6">
            {loadingOptions ? (
              <div className="text-center py-8">Loading options...</div>
            ) : (
              <>
                {/* BCYS Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Batch Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Batch *</label>
                    <select
                      value={modalState.formData.batchId}
                      onChange={(e) => setModalState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, batchId: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Batch</option>
                      {lookupData?.batches?.map((batch: any) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class Year Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Class Year *</label>
                    <select
                      value={modalState.formData.classYearId}
                      onChange={(e) => setModalState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, classYearId: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Class Year</option>
                      {lookupData?.classYears?.map((year: any) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Semester *</label>
                    <select
                      value={modalState.formData.semesterId}
                      onChange={(e) => setModalState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, semesterId: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Semester</option>
                      {lookupData?.semesters?.map((sem: any) => (
                        <option key={sem.id} value={sem.id}>
                          {sem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Departments Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">Departments</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage departments, academic years, and class dates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addDepartment();
                        // Scroll to the newly added department after a brief delay
                        setTimeout(() => {
                          const departmentsContainer = document.querySelector('.departments-container');
                          if (departmentsContainer) {
                            departmentsContainer.scrollTop = departmentsContainer.scrollHeight;
                          }
                        }, 100);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                    >
                      <span>+</span>
                      <span>Add Department to BCYS</span>
                    </button>
                  </div>

                  {modalState.formData.departments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="text-lg mb-2">No departments added yet</div>
                      <p className="text-sm">Click "Add Department to BCYS" to associate departments with this BCYS</p>
                    </div>
                  ) : (
                    <div className="departments-container space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {modalState.formData.departments.map((dept, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 transition-all duration-200 ${
                            dept.markedForRemoval 
                              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          ref={(el) => {
                            // Auto-scroll to newly added department
                            if (el && dept.isNew && !dept._hasScrolled) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              // Mark as scrolled
                              updateDepartmentField(index, '_hasScrolled', 'true');
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${dept.markedForRemoval ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className="font-medium">
                                  Department {index + 1}
                                  {dept.isNew && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">New</span>}
                                  {dept.markedForRemoval && <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">Marked for Removal</span>}
                                </span>
                              </div>
                              
                              {/* Department Dropdown - Always enabled for new departments */}
                              <select
                                value={dept.departmentId}
                                onChange={(e) => {
                                  const selectedDept = lookupData?.departments?.find(
                                    (d: any) => d.id === Number(e.target.value)
                                  );
                                  updateDepartmentField(index, 'departmentId', e.target.value);
                                  updateDepartmentField(index, 'departmentName', selectedDept?.name || '');
                                }}
                                className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  dept.markedForRemoval ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={dept.markedForRemoval || !dept.isNew}
                              >
                                <option value="">Select Department *</option>
                                {lookupData?.departments?.map((department: any) => (
                                  <option 
                                    key={department.id} 
                                    value={department.id}
                                    disabled={modalState.formData.departments.some(
                                      (d, i) => i !== index && d.departmentId === department.id && !d.markedForRemoval
                                    )}
                                  >
                                    {department.name} 
                                    {department.programModalityId && ` (${department.programModalityId})`}
                                    {modalState.formData.departments.some(
                                      (d, i) => i !== index && d.departmentId === department.id && !d.markedForRemoval
                                    ) && ' - Already added'}
                                  </option>
                                ))}
                              </select>
                              
                              {dept.departmentName && !dept.markedForRemoval && (
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  Selected: <span className="font-medium">{dept.departmentName}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="ml-4 flex flex-col gap-2">
                              {!dept.markedForRemoval ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(dept.isNew 
                                      ? 'Remove this new department?' 
                                      : 'Mark this department for removal?')) {
                                      removeDepartment(index);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 transition"
                                >
                                  {dept.isNew ? 'Remove' : 'Mark for Removal'}
                                </button>
                              ) : (
                                <div className="text-center">
                                  <div className="text-xs text-red-600 dark:text-red-400 mb-1">Will be removed</div>
                                  <button
                                    type="button"
                                    onClick={() => updateDepartmentField(index, 'markedForRemoval', 'false')}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                  >
                                    Undo
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {!dept.markedForRemoval && (
                            <div className="space-y-4">
                              {/* Entry Year */}
                              <div>
                                <label className="block text-sm font-medium mb-1">Academic/Entry Year *</label>
                                <select
                                  value={dept.entryYearId}
                                  onChange={(e) => updateDepartmentField(index, 'entryYearId', e.target.value)}
                                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  required
                                >
                                  <option value="">Select Entry Year</option>
                                  {lookupData?.academicYears?.map((year: any) => (
                                    <option key={year.id} value={year.id}>
                                      {year.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Dates Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Class Start (G.C.)</label>
                                  <input
                                    type="date"
                                    value={dept.classStartGC}
                                    onChange={(e) => updateDepartmentField(index, 'classStartGC', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Class Start (E.C.)</label>
                                  <input
                                    type="text"
                                    value={dept.classStartEC}
                                    onChange={(e) => updateDepartmentField(index, 'classStartEC', e.target.value)}
                                    placeholder="DD-MM-YYYY"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Class End (G.C.)</label>
                                  <input
                                    type="date"
                                    value={dept.classEndGC}
                                    onChange={(e) => updateDepartmentField(index, 'classEndGC', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Class End (E.C.)</label>
                                  <input
                                    type="text"
                                    value={dept.classEndEC}
                                    onChange={(e) => updateDepartmentField(index, 'classEndEC', e.target.value)}
                                    placeholder="DD-MM-YYYY"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>

                              {/* Date Format Help */}
                              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span>💡</span>
                                  <span>Format: G.C. = YYYY-MM-DD, E.C. = DD-MM-YYYY</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Departments Summary */}
                  {modalState.formData.departments.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Active: {modalState.formData.departments.filter(d => !d.markedForRemoval).length}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>To Remove: {modalState.formData.departments.filter(d => d.markedForRemoval).length}</span>
                          </div>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Total: {modalState.formData.departments.length} departments
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      if (modalState.mode === 'edit') {
                        setModalState(prev => ({ ...prev, mode: 'view' }));
                      } else {
                        closeModal();
                      }
                    }}
                    className="px-5 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                    disabled={loadingOptions}
                  >
                    {modalState.mode === 'create' ? 'Create BCYS' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}
{/*==================================================================*/}
      
    </div>
  );
};

// ────────────────────────────────────────────────
//  Detail / View Page
// ────────────────────────────────────────────────

const SingleBCSYPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<BCSY | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<BCSYForm>({
    batchId: "",
    classYearId: "",
    semesterId: "",
    entryYearId: "",
    classStartGC: "",
    classStartEC: "",
    classEndGC: "",
    classEndEC: "",
    gradingSystemId: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchOne = async () => {
      try {
        const res = await apiService.get<any>(
          `${endPoints.BatchClassYearSemesters}/${id}`
        );
        const data: BCSY = {
          id: res.bcysId ?? res.id,
          name: res.name,
          batchId: res.batchId,
          classYearId: res.classYearId,
          semesterId: res.semesterId,
          entryYearId: res.entryYearId,
          classStartGC: res.classStartGC,
          classStartEC: res.classStartEC,
          classEndGC: res.classEndGC,
          classEndEC: res.classEndEC,
          gradingSystemId: res.gradingSystemId,
        };
        setItem(data);

        setForm({
          batchId: String(res.batchId),
          classYearId: String(res.classYearId),
          semesterId: res.semesterId,
          entryYearId: res.entryYearId,
          classStartGC: res.classStartGC ?? "",
          classStartEC: res.classStartEC ?? "",
          classEndGC: res.classEndGC ?? "",
          classEndEC: res.classEndEC ?? "",
          gradingSystemId: res.gradingSystemId
            ? String(res.gradingSystemId)
            : "",
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load record");
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [id]);

  const handleUpdate = async () => {
    if (!item) return;

    try {
      const payload: any = {
        batchId: Number(form.batchId),
        classYearId: Number(form.classYearId),
        semesterId: form.semesterId.trim(),
        entryYearId: form.entryYearId.trim(),
      };

      if (form.classStartGC) payload.classStartGC = form.classStartGC;
      if (form.classStartEC) payload.classStartEC = form.classStartEC;
      if (form.classEndGC) payload.classEndGC = form.classEndGC;
      if (form.classEndEC) payload.classEndEC = form.classEndEC;
      if (form.gradingSystemId.trim())
        payload.gradingSystemId = Number(form.gradingSystemId);

      const res = await apiService.put(
        `${endPoints.BatchClassYearSemesters}/${item.id}`,
        payload
      );

      setItem({
        ...item,
        name: res.name ?? item.name,
        batchId: res.batchId ?? item.batchId,
        classYearId: res.classYearId ?? item.classYearId,
        semesterId: res.semesterId ?? item.semesterId,
        entryYearId: res.entryYearId ?? item.entryYearId,
        classStartGC: res.classStartGC ?? item.classStartGC,
        classStartEC: res.classStartEC ?? item.classStartEC,
        classEndGC: res.classEndGC ?? item.classEndGC,
        classEndEC: res.classEndEC ?? item.classEndEC,
        gradingSystemId: res.gradingSystemId ?? item.gradingSystemId,
      });

      setShowEdit(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this BCSY combination?\n\nThis action may be restricted if students/results exist."
      )
    )
      return;
  
    try {
      const res = await apiService.delete(`${endPoints.BatchClassYearSemesters}/${id}`);
      
      // Show success toast with the response message
      toast({
        title: "Success",
        description: res.message || `BCYS deleted successfully`,
      });
      
      // Remove from local state
      setData(data.filter((d) => d.id !== id));
      
    } catch (err: any) {
      // Show error toast
      toast({
        title: "Error",
        description: err?.response?.data?.error || err?.response?.data?.message || "Delete failed",
        variant: "destructive"
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  if (error || !item)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error || "Record not found"}
      </div>
    );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {item.name}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              Information
            </h2>
            <div className="space-y-5 text-[15px]">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  ID
                </span>
                <span className="font-mono font-bold">#{item.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Name
                </span>
                <span className="font-semibold">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Batch
                </span>
                <span>{item.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Class/Year
                </span>
                <span>{item.classYearId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Semester
                </span>
                <span className="font-semibold">{item.semesterId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Entry Year
                </span>
                <span>{item.entryYearId}</span>
              </div>
              <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Grading System
                </span>
                <span>{item.gradingSystemId ?? "—"}</span>
              </div>
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Period (Gregorian)
                </div>
                <div className="text-right">
                  {item.classStartGC || "—"} → {item.classEndGC || "—"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Period (Ethiopian)
                </div>
                <div className="text-right">
                  {item.classStartEC || "—"} → {item.classEndEC || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/40">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowEdit(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition"
              >
                <FaEdit /> Edit Combination
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition"
              >
                <FaTrash /> Delete Combination
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal on detail page */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-indigo-600">
                Edit Combination
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* same form fields as create modal – copy-paste them here */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Batch ID *
                  </label>
                  <input
                    type="number"
                    value={form.batchId}
                    onChange={(e) =>
                      setForm({ ...form, batchId: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {/* ... repeat for all other fields ... */}
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-7 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { BatchClassYearSemesterEditor, SingleBCSYPage };
export default BatchClassYearSemesterEditor;
