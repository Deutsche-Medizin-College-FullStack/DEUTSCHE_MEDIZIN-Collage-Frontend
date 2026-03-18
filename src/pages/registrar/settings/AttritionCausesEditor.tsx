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

type AttritionCause = {
  id: number;
  "Attrition Cause": string;
};

const AttritionCausesEditor = () => {
  const [causes, setCauses] = useState<AttritionCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AttritionCause | null>(null);
  const [formData, setFormData] = useState({
    causeName: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = showAll ? 1000 : 10;

  // Fetch data - NO .data, direct response like your impairment example
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.attritionCauses);
        console.log("API Response:", response);
        setCauses(response); // Direct array from apiService
      } catch (err: any) {
        console.error("Failed to fetch causes:", err);
        setError("Failed to load attrition causes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCauses();
  }, []);

  const filteredData = causes.filter(
    (item) =>
      item.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item["Attrition Cause"].toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleOpenModal = (item: AttritionCause | null = null) => {
    if (item && !window.confirm(`Edit "${item["Attrition Cause"]}"?`)) return;
    setEditingItem(item);
    setFormData({ causeName: item ? item["Attrition Cause"] : "" });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ causeName: "" });
    setFormError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.causeName.trim()) {
      setFormError("Cause name is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingItem) {
        // UPDATE
        if (!window.confirm(`Update "${editingItem["Attrition Cause"]}"?`))
          return;
        const body = { "Attrition Cause": formData.causeName };
        const response = await apiService.put(
          `${endPoints.attritionCauses}/${editingItem.id}`,
          body
        );
        setCauses((prev) =>
          prev.map((cause) => (cause.id === editingItem.id ? response : cause))
        );
      } else {
        // ADD
        if (!window.confirm(`Add "${formData.causeName}"?`)) return;
        const body = { "Attrition Cause": formData.causeName };
        const response = await apiService.post(
          `${endPoints.attritionCauses}/single`,
          body
        );
        setCauses((prev) => [...prev, response]);
      }
      handleCloseModal();
    } catch (err: any) {
      console.error("Submit error:", err);
      setFormError("Failed to save cause.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete cause #${id}?`)) return;

    try {
      await apiService.delete(`${endPoints.attritionCauses}/${id}`);
      setCauses((prev) => prev.filter((cause) => cause.id !== id));
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Failed to delete cause.");
    }
  };

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
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          DHMC Attrition Causes Editor
        </h1>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          ({causes.length} causes)
        </p>
      </header>

      {/* Main Content */}
      <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            Attrition Causes
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
            >
              <FaPlus /> Add Cause
            </button>
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-green-500 hover:bg-green-600 text-white shadow-md transition-all"
            >
              {showAll ? "Paginate" : "Show All"}
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "grid" : "table")
              }
              className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-purple-500 hover:bg-purple-600 text-white shadow-md transition-all"
            >
              {viewMode === "table" ? <FaTh /> : <FaList />}
              {viewMode === "table" ? "Grid" : "Table"}
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search causes by ID or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
        />

        {/* Table/Grid */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-4 text-left font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Cause Name</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b"
                  >
                    <td className="p-4 font-mono bg-gray-100 dark:bg-gray-800">
                      {item.id}
                    </td>
                    <td className="p-4">{item["Attrition Cause"]}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-all"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                <div className="font-bold text-xl mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-fit">
                  #{item.id}
                </div>
                <h3 className="font-semibold text-lg mb-4">
                  {item["Attrition Cause"]}
                </h3>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
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
          <div className="flex justify-between items-center mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 rounded-xl font-semibold disabled:opacity-50 bg-white dark:bg-gray-700 hover:bg-gray-100 transition-all"
            >
              Previous
            </button>
            <span className="font-bold text-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 rounded-xl font-semibold disabled:opacity-50 bg-white dark:bg-gray-700 hover:bg-gray-100 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                {editingItem ? "Edit" : "Add"} Cause
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-xl text-red-800 dark:text-red-200">
                  {formError}
                </div>
              )}
              {editingItem && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="font-bold text-sm text-gray-600 dark:text-gray-300">
                    ID:
                  </span>
                  <span className="font-mono ml-2 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                    {editingItem.id}
                  </span>
                </div>
              )}
              <input
                type="text"
                name="causeName"
                value={formData.causeName}
                onChange={handleChange}
                placeholder="Enter cause name..."
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
              />
              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
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
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  );
};

export default AttritionCausesEditor;
