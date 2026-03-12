import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaSpinner,
} from "react-icons/fa";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

type AcademicYear = {
  "Academic Year Code": string;
  "Academic Year GC": string;
  "Academic Year EC": string;
};

const AcademicYearEditor = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState({
    yearCode: "",
    yearGC: "",
    yearEC: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = showAll ? 1000 : 10;

  // Fetch academic years initially - NO TRANSFORMATION
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.academicYears);
        console.log("API Response:", response);

        // Your apiService returns ARRAY DIRECTLY (like impairment example)
        setAcademicYears(response);
      } catch (err: any) {
        console.error("Failed to fetch academic years:", err);
        setError("Failed to load academic years. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const filteredData = academicYears.filter(
    (item) =>
      item["Academic Year Code"]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item["Academic Year GC"]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item["Academic Year EC"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, currentPage, totalPages, showAll]);

  const handleOpenModal = (item: AcademicYear | null = null) => {
    if (item && !window.confirm(`Edit ${item["Academic Year Code"]}?`)) return;

    setEditingItem(item);
    setFormData(
      item
        ? {
            yearCode: item["Academic Year Code"],
            yearGC: item["Academic Year GC"],
            yearEC: item["Academic Year EC"],
          }
        : { yearCode: "", yearGC: "", yearEC: "" }
    );
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ yearCode: "", yearGC: "", yearEC: "" });
    setFormError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.yearCode.trim() ||
      !formData.yearGC.trim() ||
      !formData.yearEC.trim()
    ) {
      setFormError("All fields are required.");
      return false;
    }
    return true;
  };

  const addAcademicYear = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setFormError("");

    try {
      const body = {
        "Academic Year Code": formData.yearCode,
        "Academic Year GC": formData.yearGC,
        "Academic Year EC": formData.yearEC,
      };
      const response = await apiService.post(
        `${endPoints.academicYears}/single`,
        body
      );
      setAcademicYears((prev) => [...prev, response]);
      handleCloseModal();
    } catch (e: any) {
      console.error("Add failed:", e);
      setFormError("Failed to add academic year.");
    } finally {
      setSaving(false);
    }
  };

  const updateAcademicYear = async () => {
    if (!editingItem || !validateForm()) return;
    setSaving(true);
    setFormError("");

    try {
      const body = {
        "Academic Year Code": formData.yearCode,
        "Academic Year GC": formData.yearGC,
        "Academic Year EC": formData.yearEC,
      };
      const response = await apiService.put(
        `${endPoints.academicYears}/${encodeURIComponent(
          editingItem["Academic Year Code"]
        )}`,
        body
      );
      setAcademicYears((prev) =>
        prev.map((year) =>
          year["Academic Year Code"] === editingItem["Academic Year Code"]
            ? response
            : year
        )
      );
      handleCloseModal();
    } catch (e: any) {
      console.error("Update failed:", e);
      setFormError("Failed to update academic year.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAcademicYear = async (yearCode: string) => {
    if (!window.confirm(`Delete ${yearCode}? This cannot be undone.`)) return;

    try {
      await apiService.delete(
        `${endPoints.academicYears}/${encodeURIComponent(yearCode)}`
      );
      setAcademicYears((prev) =>
        prev.filter((year) => year["Academic Year Code"] !== yearCode)
      );
    } catch (e: any) {
      console.error("Delete failed:", e);
      setError("Failed to delete academic year.");
    }
  };

  //====================================================================================================
  const InstructionsReminder = () => (
  <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg">
    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-3">
      <span className="text-3xl">📋</span> Important Instructions for Registrars
    </h3>
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          1
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Purpose:</span>
          <p>This page is for managing the school's academic years. Only authorized personnel (registrars) should have access.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          2
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Academic Year Code Format:</span>
          <p>
            When adding a new academic year, use the format: <code className="bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded-md font-mono font-bold">201718</code>
            <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">
              • This represents 2017-2018 academic year
              • First 4 digits: Start year (2017)
              • Last 2 digits: End year (18)
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          3
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Editing Notes:</span>
          <p>Academic Year Code cannot be changed after creation. To modify a code, delete and recreate the entry.</p>
        </div>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
        <p className="font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>Reminder:</strong> Deleting an academic year cannot be undone and may affect existing student records.
        </p>
      </div>
    </div>
  </div>
);
//=================================================================================================================================



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
        <span className="text-xl">Loading academic years...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-red-600 dark:text-red-400 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          DHMC Academic Year Editor
        </h1>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          Manage academic years ({academicYears.length} total)
        </p>
      </header>

      {/* Instructions Component */}
      <InstructionsReminder />

      <main>
        <div className="p-8 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              Academic Years
            </h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus /> Add New
              </button>
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {showAll ? "Paginate" : "Show All"}
              </button>
              <button
                onClick={() =>
                  setViewMode(viewMode === "table" ? "grid" : "table")
                }
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {viewMode === "table" ? (
                  <FaTh className="text-xl" />
                ) : (
                  <FaList className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search academic years by code, GC or EC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 mb-8 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
          />

          {/* Data Display */}
          {filteredData.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
                No academic years found
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-8 py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all"
              >
                Add First Academic Year
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <th className="p-6 text-left font-bold text-lg">
                      Year Code
                    </th>
                    <th className="p-6 text-left font-bold text-lg">
                      Gregorian Calendar
                    </th>
                    <th className="p-6 text-left font-bold text-lg">
                      Ethiopian Calendar
                    </th>
                    <th className="p-6 text-right font-bold text-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr
                      key={item["Academic Year Code"]}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border-b dark:border-gray-700"
                    >
                      <td className="p-6 font-semibold text-lg">
                        {item["Academic Year Code"]}
                      </td>
                      <td className="p-6">{item["Academic Year GC"]}</td>
                      <td className="p-6">{item["Academic Year EC"]}</td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-all shadow-sm"
                            title="Edit"
                          >
                            <FaEdit className="text-xl" />
                          </button>
                          <button
                            onClick={() =>
                              deleteAcademicYear(item["Academic Year Code"])
                            }
                            className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all shadow-sm"
                            title="Delete"
                          >
                            <FaTrash className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((item) => (
                <div
                  key={item["Academic Year Code"]}
                  className="p-8 rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all hover:-translate-y-2"
                >
                  <h3 className="font-black text-2xl mb-3 text-gray-900 dark:text-white">
                    {item["Academic Year Code"]}
                  </h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        GC:
                      </span>{" "}
                      {item["Academic Year GC"]}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        EC:
                      </span>{" "}
                      {item["Academic Year EC"]}
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 hover:bg-yellow-200 transition-all"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      onClick={() =>
                        deleteAcademicYear(item["Academic Year Code"])
                      }
                      className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-700 hover:bg-red-200 transition-all"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!showAll && totalPages > 1 && (
            <div className="flex justify-between items-center mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-lg"
              >
                Previous
              </button>
              <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-lg"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                <h3 className="text-3xl font-black">
                  {editingItem ? "Edit" : "Add"} Academic Year
                </h3>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl text-red-800 dark:text-red-200">
                    {formError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Academic Year Code
                    </label>
                    <input
                      type="text"
                      name="yearCode"
                      value={formData.yearCode}
                      onChange={handleChange}
                      placeholder="e.g., 202425 (Format: StartYear + EndYear e.g., 2024-2025 → 202425)"
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 text-lg font-semibold"
                      disabled={!!editingItem}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Gregorian Calendar
                    </label>
                    <input
                      type="text"
                      name="yearGC"
                      value={formData.yearGC}
                      onChange={handleChange}
                      placeholder="e.g., 2024-2025"
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Ethiopian Calendar
                    </label>
                    <input
                      type="text"
                      name="yearEC"
                      value={formData.yearEC}
                      onChange={handleChange}
                      placeholder="e.g., 2017"
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 text-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleCloseModal}
                    disabled={saving}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all disabled:opacity-50 shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingItem ? updateAcademicYear : addAcademicYear}
                    disabled={saving}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-lg bg-green-500 hover:bg-green-600 text-white shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin w-6 h-6" />
                        Saving...
                      </>
                    ) : editingItem ? (
                      "Update Year"
                    ) : (
                      "Add Year"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AcademicYearEditor;
