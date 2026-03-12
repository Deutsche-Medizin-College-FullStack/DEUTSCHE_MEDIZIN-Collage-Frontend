import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

type ProgramLevel = {
  code: string;
  name: string;
  remark: string;
  active: boolean;
};

const ProgramLevelsEditor = () => {
  const [programLevels, setProgramLevels] = useState<ProgramLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch program levels on mount
  const fetchProgramLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(endPoints.programLevels);
      console.log("API Response:", response);
      setProgramLevels(response);
    } catch (err: any) {
      console.error("Failed to fetch program levels:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load program levels. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramLevels();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
        <span className="text-xl">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-red-600 dark:text-red-400">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <button
          onClick={fetchProgramLevels}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DHMC Program Levels Editor
          </h1>
          <button
            onClick={fetchProgramLevels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <FaCheckCircle />
            Refresh
          </button>
        </div>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          ({programLevels.length} program levels)
        </p>
      </header>
      <main>
        <CrudSection
          title="Program Levels"
          data={programLevels}
          setData={setProgramLevels}
          refetch={fetchProgramLevels}
        />
      </main>
    </div>
  );
};

const CrudSection = ({
  title,
  data,
  setData,
  refetch,
}: {
  title: string;
  data: ProgramLevel[];
  setData: React.Dispatch<React.SetStateAction<ProgramLevel[]>>;
  refetch: () => Promise<void>;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramLevel | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    remark: "",
    active: true,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = showAll ? data.length : 10;

  const filteredData = data.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.active}`.includes(searchTerm)
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

  const handleOpenModal = async (item: ProgramLevel | null = null) => {
    if (item && !window.confirm(`Edit program level "${item.name}"?`)) return;

    if (item) {
      try {
        // Fetch latest data for editing
        const response = await apiService.get(
          `${endPoints.programLevels}/${item.code}`
        );
        setEditingItem(response);
        setFormData({
          code: response.code,
          name: response.name,
          remark: response.remark || "",
          active: response.active !== undefined ? response.active : true,
        });
      } catch (err: any) {
        setFormError(
          err.response?.data?.error ||
            "Failed to load program level for editing."
        );
        return;
      }
    } else {
      setEditingItem(null);
      setFormData({ code: "", name: "", remark: "", active: true });
    }
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ code: "", name: "", remark: "", active: true });
    setFormError("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as any;
    if (name === "active") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError("Code and Name are required.");
      return false;
    }
    if (formData.code.length > 10) {
      setFormError("Code must be 10 characters or less.");
      return false;
    }
    const existing = data.find(
      (d) =>
        d.code === formData.code &&
        (!editingItem || d.code !== editingItem.code)
    );
    if (existing) {
      setFormError("Code must be unique.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setFormError("");

    try {
      if (editingItem) {
        // Update existing
        if (!window.confirm(`Update program level "${editingItem.name}"?`))
          return;

        const updateData = {
          name: formData.name,
          remark: formData.remark,
          active: formData.active,
        };

        const response = await apiService.put(
          `${endPoints.programLevels}/${editingItem.code}`,
          updateData
        );

        setData((prev) =>
          prev.map((item) => (item.code === editingItem.code ? response : item))
        );
      } else {
        // Create new
        if (!window.confirm(`Add program level "${formData.name}"?`)) return;

        const createData = {
          code: formData.code,
          name: formData.name,
          remark: formData.remark,
        };

        const response = await apiService.post(
          endPoints.programLevels,
          createData
        );

        setData((prev) => [...prev, { ...response, active: true }]);
      }

      handleCloseModal();
      refetch(); // Refresh from server
    } catch (err: any) {
      console.error("Submit error:", err);
      setFormError(
        err.response?.data?.error || "Failed to save program level."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    const programLevelName = data.find((d) => d.code === code)?.name;
    if (
      !window.confirm(
        `Are you sure you want to delete program level "${programLevelName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      await apiService.delete(`${endPoints.programLevels}/${code}`);
      setData((prev) => prev.filter((d) => d.code !== code));
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete program level.");
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title} ({data.length})
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleOpenModal()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-transform duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            <FaPlus /> Add Level
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-green-500 hover:bg-green-600 text-white shadow-md transition-transform duration-200 transform hover:scale-105"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-purple-500 hover:bg-purple-600 text-white shadow-md transition-transform duration-200 transform hover:scale-105"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}
            {viewMode === "table" ? "Grid View" : "Table View"}
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by code, name, remark, or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-4 mb-6 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
      />

      {/* Table or Grid View */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Code
                </th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Remark
                </th>
                <th className="p-4 text-center font-semibold text-gray-900 dark:text-gray-100">
                  Status
                </th>
                <th className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.code}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition-colors duration-200"
                >
                  <td className="p-4 font-mono bg-gray-100 dark:bg-gray-800">
                    {item.code}
                  </td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-sm">{item.remark}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-all"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.code)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map((item) => (
            <div
              key={item.code}
              className={`p-5 rounded-lg shadow-md transition transform hover:scale-105 ${
                item.active
                  ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-600"
                  : "bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
              }`}
            >
              <h3 className="font-bold text-lg font-mono">{item.code}</h3>
              <p className="mb-1 font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {item.remark}
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  item.active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                }`}
              >
                {item.active ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 rounded-full text-yellow-500 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50 transition transform hover:scale-110"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.code)}
                  className="p-2 rounded-full text-red-500 hover:bg-red-600/50 dark:hover:bg-red-800/50 transition transform hover:scale-110"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!showAll && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-5 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-5 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} Program Level
            </h3>
            {formError && (
              <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {formError}
              </div>
            )}
            {saving && (
              <div className="p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <FaSpinner className="animate-spin w-5 h-5" />
                <span>Saving...</span>
              </div>
            )}

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Code (e.g. DEG)"
              disabled={!!editingItem || saving}
              className="w-full mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-mono"
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name (e.g. Bachelor's Degree)"
              disabled={saving}
              className="w-full mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Remark (optional)"
              disabled={saving}
              rows={3}
              className="w-full mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-vertical"
            />
            <label className="flex items-center gap-3 mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                disabled={saving}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Active</span>
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Saving...
                  </>
                ) : editingItem ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramLevelsEditor;
