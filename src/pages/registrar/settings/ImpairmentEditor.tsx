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
import apiClient from "@/components/api/apiClient";
import apiService from "@/components/api/apiService";

type Impairment = {
  code: string;
  impairment: string;
};

const ImpairmentEditor = () => {
  const [impairments, setImpairments] = useState<Impairment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch impairments from backend
  useEffect(() => {
    const fetchImpairments = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(endPoints.impairments);

        // Transform backend response: { disabilityCode, disability } → { code, impairment }
        const transformed = response.map((item: any) => ({
          code: item.disabilityCode,
          impairment: item.disability,
        }));

        setImpairments(transformed);
      } catch (err: any) {
        console.error("Failed to fetch impairments:", err);
        setError("Failed to load impairments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImpairments();
  }, []);

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DHMC Impairment Editor
          </h1>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading impairments...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Main Content - Only show when data is ready */}
      {!loading && !error && (
        <main>
          <CrudSection
            title="Impairments / Disabilities"
            data={impairments}
            setData={setImpairments}
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
}: {
  title: string;
  data: Impairment[];
  setData: React.Dispatch<React.SetStateAction<Impairment[]>>;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Impairment | null>(null);
  const [formData, setFormData] = useState({ code: "", impairment: "" });
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const itemsPerPage = showAll ? data.length : 10;

  const filteredData = data.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.impairment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showAll]);

  const handleOpenModal = (item: Impairment | null = null) => {
    if (item && !window.confirm("Edit this impairment?")) return;

    setEditingItem(item);
    setFormData(item ? { ...item } : { code: "", impairment: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError("");
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.code.trim() || !formData.impairment.trim()) {
      setFormError("Both Code and Impairment name are required.");
      return false;
    }
    const codeExists = data.some((d) => d.code === formData.code);
    if (codeExists && (!editingItem || editingItem.code !== formData.code)) {
      setFormError("This code already exists.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      if (!editingItem && !window.confirm("Add this new impairment?")) return;

      if (editingItem) {
        setData((prev) =>
          prev.map((d) => (d.code === editingItem.code ? formData : d))
        );
      } else {
        const payload = {
          disabilityCode: formData.code.trim(),
          disability: formData.impairment.trim(),
        };
        const response = await apiService.post(
          endPoints.singleImpairment,
          payload
        );

        // Success! Add the new item to UI (use response if backend returns it)
        const newImpairment = {
          code: response.disabilityCode || formData.code,
          impairment: response.disability || formData.impairment,
        };

        // setData((prev) => [...prev, newImpairment]);
        //   const addImpairment = await apiService.post(
        //     endPoints.singleImpairment,
        //     {
        //       formData,
        //     }
        //   );
        setData((prev) => [...prev, newImpairment]);
      }

      handleCloseModal();
    } catch (err) {
      console.log(err);
      handleCloseModal();
    }
  };

  const handleDelete = async (code: string) => {
    try {
      if (!window.confirm("Delete this impairment permanently?")) return;
      setData((prev) => prev.filter((d) => d.code !== code));
      const response = await apiService.delete(
        endPoints.specificImpairtment.replace(":id", `${code}`)
      );
      //
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

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
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition transform hover:scale-105"
          >
            <FaPlus /> Add Impairment
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
        placeholder="Search by code or impairment name..."
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
                <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-gray-100">
                  Code
                </th>
                <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-gray-100">
                  Impairment
                </th>
                <th className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.code}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4 font-mono font-semibold">
                    {item.code}
                  </td>
                  <td className="px-6 py-4">{item.impairment}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-yellow-600 hover:text-yellow-700 mr-4"
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.code)}
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
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map((item) => (
            <div
              key={item.code}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                {item.code}
              </div>
              <div className="mt-2 text-gray-800 dark:text-gray-200">
                {item.impairment}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 p-2 rounded-lg"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.code)}
                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} Impairment
            </h3>

            {formError && (
              <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Code (e.g. BLD)"
              disabled={!!editingItem}
              className="w-full p-4 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700"
            />
            <input
              type="text"
              name="impairment"
              value={formData.impairment}
              onChange={handleChange}
              placeholder="Impairment name (e.g. Blind)"
              className="w-full p-4 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition shadow-lg"
              >
                {editingItem ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpairmentEditor;
