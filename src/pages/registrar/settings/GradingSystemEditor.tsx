import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import apiService from "@/components/api/apiService"; // Adjust import path as needed
import endPoints from "@/components/api/endPoints"; // Adjust import path as needed

type Interval = {
  id: number | null;
  description: string;
  min: number;
  max: number;
  givenValue: number;
  gradeLetter: string;
};

type GradingSystem = {
  id: number;
  versionName: string;
  departmentId: number | null;
  remark: string;
  intervals: Interval[];
  active: boolean;
};

const GradingSystemEditor = () => {
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch all grading systems
  const fetchGradingSystems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(endPoints.gradingSystem);
      console.log(response);
      setGradingSystems(response);
    } catch (e: any) {
      console.error("Failed to fetch grading systems:", e);
      setError(
        e.response?.data?.message ||
          "Failed to load grading systems. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradingSystems();
  }, []);

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Grading Systems Editor
          </h1>
          <button
            onClick={fetchGradingSystems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <FaCheckCircle />
            Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading grading systems...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-20">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchGradingSystems}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <main>
          <CrudSection
            title="Grading Systems"
            data={gradingSystems}
            setData={setGradingSystems}
            refetch={fetchGradingSystems}
            saving={saving}
            setSaving={setSaving}
          />
        </main>
      )}
    </div>
  );
};

const CrudSection = ({
  title,
  data,
  setData,
  refetch,
  saving,
  setSaving,
}: {
  title: string;
  data: GradingSystem[];
  setData: React.Dispatch<React.SetStateAction<GradingSystem[]>>;
  refetch: () => Promise<void>;
  saving: boolean;
  setSaving: (val: boolean) => void;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GradingSystem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [manyGradingSystem, setManyGradingSystem] = useState<string>("all");
  const [manyDepartments, setManyDepartments] = useState<string>("all");
  const emptyInterval: Interval = {
    id: null,
    description: "",
    min: 0,
    max: 0,
    givenValue: 0,
    gradeLetter: "",
  };

  const [formData, setFormData] = useState<GradingSystem>({
    id: 0,
    versionName: "",
    departmentId: null,
    remark: "",
    intervals: [emptyInterval],
    active: false,
  });

  const [formError, setFormError] = useState("");
  const [department, setDeparment] = useState([]);
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = showAll ? data.length : 5;
  // Inside CrudSection component, after existing states
  const [isActive, setIsActive] = useState<boolean>(false); // New state for active toggle
  const filteredData = data.filter(
    (item) =>
      item.versionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.remark ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.departmentId !== null &&
        `${item.departmentId}`.includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const fetchDepartments = async () => {
    try {
      const response = await apiService.get(endPoints.departments);
      setDeparment(response);
    } catch (e: any) {
      console.error("Failed to fetch grading systems:", e);
      setError(
        e.response?.data?.message ||
          "Failed to load grading systems. Please try again."
      );
    }
  };
  const fetchGradingSystems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(endPoints.gradingSystem);
      console.log(response);
      setGradingSystems(response);
    } catch (e: any) {
      console.error("Failed to fetch grading systems:", e);
      setError(
        e.response?.data?.message ||
          "Failed to load grading systems. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showAll]);

  useEffect(() => {
    fetchGradingSystems();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showAll]);

  const handleOpenModal = async (item: GradingSystem | null = null) => {
    if (item && !window.confirm("Edit this grading system?")) return;

    if (item) {
      try {
        // Fetch latest data for editing
        const response = await apiService.get(
          `${endPoints.gradingSystem}/${item.id}`
        );
        setEditingItem(response);
        setFormData(JSON.parse(JSON.stringify(response)));
        setIsActive(response.active);
      } catch (e) {
        alert("Failed to load grading system for editing.");
        return;
      }
    } else {
      setEditingItem(null);
      setFormData({
        id: 0,
        versionName: "",
        departmentId: null,
        remark: "",
        intervals: [JSON.parse(JSON.stringify(emptyInterval))],
        active: false,
      });

      setIsActive(false);
    }

    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError("");
    setEditingItem(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        departmentId: value === "" ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIntervalChange = (
    index: number,
    field: keyof Interval,
    value: string
  ) => {
    setFormData((prev) => {
      const copy = { ...prev };
      const intervals = [...copy.intervals];
      const interval = { ...intervals[index] };

      if (field === "min" || field === "max" || field === "givenValue") {
        (interval as any)[field] = Number(value) || 0;
      } else {
        (interval as any)[field] = value;
      }

      intervals[index] = interval;
      copy.intervals = intervals;
      return copy;
    });
  };

  const addIntervalRow = () => {
    setFormData((prev) => ({
      ...prev,
      intervals: [...prev.intervals, { ...emptyInterval, id: null }],
    }));
  };

  const removeIntervalRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      intervals: prev.intervals.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.versionName.trim()) {
      setFormError("Version name is required.");
      return false;
    }
    if (!formData.intervals.length) {
      setFormError("At least one interval is required.");
      return false;
    }

    for (const interval of formData.intervals) {
      if (!interval.description.trim() || !interval.gradeLetter.trim()) {
        setFormError("Each interval must have a description and grade letter.");
        return false;
      }
      if (interval.min > interval.max) {
        setFormError("Interval min cannot be greater than max.");
        return false;
      }
    }

    // Check overlapping intervals
    const sorted = [...formData.intervals].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].min <= sorted[i - 1].max) {
        setFormError(
          "Intervals must not overlap. Please adjust min/max values."
        );
        return false;
      }
    }

    // Check if intervals cover full range (0-100)
    const totalCoverage = sorted.reduce(
      (sum, int) => sum + (int.max - int.min),
      0
    );
    if (Math.abs(totalCoverage - 99) > 0.0) {
      setFormError("Intervals should cover the full range (0-100).");
      return false;
    }

    return true;
  };

  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   setSaving(true);
  //   try {
  //     let updatedData: GradingSystem[] = [...data];

  //     if (editingItem) {
  //       // Update existing
  //       if (!window.confirm("Update this grading system?")) return;

  //       const response = await apiService.put(
  //         `${endPoints.gradingSystem}/${editingItem.id}`,
  //         formData
  //       );

  //       updatedData = data.map((d) => (d.id === editingItem.id ? response : d));
  //       setData(updatedData);
  //     } else {
  //       // Create new
  //       if (!window.confirm("Add this new grading system?")) return;

  //       const response = await apiService.post(
  //         endPoints.gradingSystem,
  //         formData
  //       );

  //       updatedData = [...data, response];
  //       setData(updatedData);
  //     }

  //     handleCloseModal();
  //     refetch(); // Refresh from server
  //   } catch (e: any) {
  //     console.error("Save error:", e);
  //     setFormError(
  //       e.response?.data?.message ||
  //         `Failed to ${editingItem ? "update" : "create"} grading system.`
  //     );
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      let updatedData: GradingSystem[] = [...data];

      if (editingItem) {
        // Update main data
        if (!window.confirm("Update this grading system?")) return;

        const response = await apiService.put(
          `${endPoints.gradingSystem}/${editingItem.id}`,
          formData
        );

        // Update active status separately
        if (isActive !== editingItem.active) {
          await apiService.put(
            `${endPoints.gradingSystem}/${editingItem.id}/active-status`,
            { isActive }
          );
        }

        updatedData = data.map((d) =>
          d.id === editingItem.id ? { ...response, active: isActive } : d
        );
        setData(updatedData);
      } else {
        // Create new (new ones are inactive by default unless you change logic)
        if (!window.confirm("Add this new grading system?")) return;

        const response = await apiService.post(
          endPoints.gradingSystem,
          formData
        );

        // If user wants it active immediately, toggle it after creation
        if (isActive) {
          await apiService.post(
            `${endPoints.gradingSystem}/${response.id}/active-status`,
            { isActive: true }
          );
        }

        updatedData = [...data, { ...response, active: isActive }];
        setData(updatedData);
      }

      handleCloseModal();
      refetch(); // Refresh full list from server
    } catch (e: any) {
      console.error("Save error:", e);
      setFormError(
        e.response?.data?.message ||
          `Failed to ${editingItem ? "update" : "create"} grading system.`
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this grading system permanently?")) return;

    try {
      await apiService.delete(`${endPoints.gradingSystem}/${id}`);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete grading system.");
    }
  };

  // Rest of the JSX remains exactly the same as your original component
  // (Header Controls, Search, Table/Grid Views, Pagination, Modal)
  return (
    <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title} ({data.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleOpenModal()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition transform hover:scale-105 disabled:opacity-50"
          >
            <FaPlus /> Add Grading System
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg transition"
          >
            {showAll ? "Show Pages" : "Show All"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}{" "}
            {viewMode === "table" ? "Grid" : "Table"}
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by version, remark, or department..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-4 mb-6 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      />

      {/* Table View */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Version</th>
                <th className="px-6 py-4 text-left font-bold">Department</th>
                <th className="px-6 py-4 text-left font-bold">Remark</th>
                <th className="px-6 py-4 text-left font-bold">Intervals</th>
                <th className="px-6 py-4 text-left font-bold">Active</th>

                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4 font-semibold">
                    {item.versionName}
                  </td>
                  <td className="px-6 py-4">{item.departmentId ?? "Global"}</td>
                  <td className="px-6 py-4">{item.remark}</td>
                  <td className="px-6 py-4">
                    <ul className="text-sm space-y-1">
                      {item.intervals.map((int) => (
                        <li key={int.id ?? `${int.description}-${int.min}`}>
                          <span className="font-mono">{int.gradeLetter}</span> -{" "}
                          {int.description} ({int.min}–{int.max})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4">
                    {item.active ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        YES
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-yellow-600 hover:text-yellow-700 mr-4"
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaTrash className="inline text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View - same as original */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {item.versionName}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Dept: {item.departmentId ?? "Global"}
              </div>
              <div className="mt-2 text-gray-800 dark:text-gray-200 text-sm">
                {item.remark}
              </div>
              <div className="mt-3 text-xs">
                {item.intervals.map((int) => (
                  <div key={int.id ?? `${int.description}-${int.min}`}>
                    <span className="font-mono font-semibold">
                      {int.gradeLetter}
                    </span>{" "}
                    {int.description}: {int.min}–{int.max}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 p-2 rounded-lg"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - same as original */}
      {!showAll && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Previous
          </button>
          <span className="font-semibold text-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal - same structure, just updated submit button */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} Grading System
            </h3>

            {formError && (
              <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
                {formError}
              </div>
            )}

            {/* Form fields - exactly the same as original */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                name="versionName"
                value={formData.versionName}
                onChange={handleChange}
                placeholder="Version Name (e.g. 2025 Revised)"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <select
                value={manyDepartments}
                onChange={(e) => setManyDepartments(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-800 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-500 outline-none"
              >
                <option value="">Select Department</option>

                {department.map((d) => (
                  <option key={d.deptName} value={d.dptID}>
                    {d.deptName}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Remark"
              className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />
            {editingItem && ( // Only show in edit mode
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Status: {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Toggle to activate or deactivate this grading system.
                </p>
              </div>
            )}

            <h4 className="font-semibold mb-2">Intervals</h4>
            {/* <div className="space-y-3 mb-4">
              {formData.intervals.map((interval, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={interval.description}
                    onChange={(e) =>
                      handleIntervalChange(idx, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                  <input
                    type="number"
                    value={interval.min}
                    onChange={(e) =>
                      handleIntervalChange(idx, "min", e.target.value)
                    }
                    placeholder="minimum score"
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                  <input
                    type="number"
                    value={interval.max}
                    onChange={(e) =>
                      handleIntervalChange(idx, "max", e.target.value)
                    }
                    placeholder="Max"
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={interval.givenValue}
                    onChange={(e) =>
                      handleIntervalChange(idx, "givenValue", e.target.value)
                    }
                    placeholder="Given"
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs"
                  />
                  <input
                    type="text"
                    value={interval.gradeLetter}
                    onChange={(e) =>
                      handleIntervalChange(idx, "gradeLetter", e.target.value)
                    }
                    placeholder="Letter"
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeIntervalRow(idx)}
                    className="px-3 py-2 text-xs rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div> */}
            <div className="space-y-4 mb-6">
              {formData.intervals.map((interval, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Description */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={interval.description}
                      onChange={(e) =>
                        handleIntervalChange(idx, "description", e.target.value)
                      }
                      placeholder="e.g. Excellent / Very Good / Outstanding"
                      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Min */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Min Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={interval.min}
                      onChange={(e) =>
                        handleIntervalChange(idx, "min", e.target.value)
                      }
                      placeholder="Minimum score (e.g. 80)"
                      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Max */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Max Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={interval.max}
                      onChange={(e) =>
                        handleIntervalChange(idx, "max", e.target.value)
                      }
                      placeholder="Maximum score (e.g. 100)"
                      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Given Value (average/mark) */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Given Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={interval.givenValue}
                      onChange={(e) =>
                        handleIntervalChange(idx, "givenValue", e.target.value)
                      }
                      placeholder="Average/mark for this range (e.g. 90)"
                      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Grade Letter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Grade Letter
                    </label>
                    <input
                      type="text"
                      value={interval.gradeLetter}
                      onChange={(e) =>
                        handleIntervalChange(idx, "gradeLetter", e.target.value)
                      }
                      placeholder="e.g. A+ / A / B+"
                      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeIntervalRow(idx)}
                      className="px-4 py-2.5 text-sm rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIntervalRow}
              className="mb-6 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
            >
              + Add Interval
            </button>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingItem ? "Update" : "Add"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingSystemEditor;
