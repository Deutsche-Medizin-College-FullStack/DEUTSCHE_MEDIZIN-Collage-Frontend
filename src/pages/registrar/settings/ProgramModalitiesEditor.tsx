import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaSpinner,
} from "react-icons/fa";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

type ProgramModality = {
  modalityCode: string;
  modality: string;
  programLevelCode: string;
};

const AVAILABLE_PROGRAM_LEVELS = [
  { code: "DEG", name: "Degree" },
  { code: "DIP", name: "Diploma" },
  { code: "MSC", name: "Masters" },
];

const ProgramModalitiesEditor = () => {
  const [modalities, setModalities] = useState<ProgramModality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch modalities on mount
  useEffect(() => {
    const fetchModalities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.programModalities);
        console.log("API Response:", response);
        setModalities(response);
      } catch (err: any) {
        console.error("Failed to fetch program modalities:", err);
        setError("Failed to load program modalities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchModalities();
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
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DHFM Program Modalities Editor
        </h1>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          ({modalities.length} program modalities)
        </p>
      </header>
      <main>
        <CrudSection
          title="Program Modalities"
          data={modalities}
          setData={setModalities}
          programLevels={AVAILABLE_PROGRAM_LEVELS}
        />
      </main>
    </div>
  );
};

const CrudSection = ({
  title,
  data,
  setData,
  programLevels,
}: {
  title: string;
  data: ProgramModality[];
  setData: React.Dispatch<React.SetStateAction<ProgramModality[]>>;
  programLevels: { code: string; name: string }[];
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramModality | null>(null);
  const [formData, setFormData] = useState({
    modalityCode: "",
    modality: "",
    programLevelCode: "",
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
      item.modalityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.programLevelCode.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleOpenModal = (item: ProgramModality | null = null) => {
    if (item && !window.confirm(`Edit modality "${item.modality}"?`)) return;
    setEditingItem(item);
    setFormData(
      item
        ? {
            modalityCode: item.modalityCode,
            modality: item.modality,
            programLevelCode: item.programLevelCode,
          }
        : { modalityCode: "", modality: "", programLevelCode: "" }
    );
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ modalityCode: "", modality: "", programLevelCode: "" });
    setFormError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.modalityCode.trim() ||
      !formData.modality.trim() ||
      !formData.programLevelCode.trim()
    ) {
      setFormError(
        "Modality Code, Modality name, and Program Level are all required."
      );
      return false;
    }
    const existing = data.find(
      (d) =>
        d.modalityCode === formData.modalityCode &&
        (!editingItem || d.modalityCode !== editingItem.modalityCode)
    );
    if (existing) {
      setFormError("Modality Code must be unique.");
      return false;
    }
    if (
      !programLevels.some(
        (pl) =>
          pl.code.toLowerCase() === formData.programLevelCode.toLowerCase()
      )
    ) {
      setFormError("Selected Program level is invalid or inactive.");
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
        // ✅ FIXED: UPDATE - Use endPoints consistently
        if (!window.confirm(`Update modality "${editingItem.modality}"?`))
          return;
        await apiService.put(
          `${endPoints.programModality}/${editingItem.modalityCode}`,
          formData
        );
      } else {
        // ✅ FIXED: POST - Use endPoints.programModality
        if (!window.confirm(`Add modality "${formData.modality}"?`)) return;
        console.log("POST Payload:", formData); // ✅ Debug log
        await apiService.post(endPoints.programModality, formData);
      }

      // ✅ FIXED: Refresh with endPoints
      const response = await apiService.get(endPoints.programModality);
      setData(response);
      handleCloseModal();
    } catch (err: any) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data); // ✅ Debug log
      setFormError(
        err.response?.data?.error || "Failed to save program modality."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (modalityCode: string) => {
    const modalityName = data.find(
      (d) => d.modalityCode === modalityCode
    )?.modality;
    if (
      !window.confirm(
        `Are you sure you want to delete modality "${modalityName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      await apiService.delete(`${endPoints.programModality}/${modalityCode}`);
      const response = await apiService.get(endPoints.programModality);
      setData(response);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete program modality.");
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
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-transform duration-200 transform hover:scale-105"
          >
            <FaPlus /> Add Modality
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
        placeholder="Search modalities by code, name, or level"
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
                  Modality Code
                </th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Modality Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Program Level
                </th>
                <th className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.modalityCode}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition-colors duration-200"
                >
                  <td className="p-4 font-mono bg-gray-100 dark:bg-gray-800">
                    {item.modalityCode}
                  </td>
                  <td className="p-4">{item.modality}</td>
                  <td className="p-4">{item.programLevelCode}</td>
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
                        onClick={() => handleDelete(item.modalityCode)}
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
              key={item.modalityCode}
              className="p-5 rounded-lg shadow-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition transform hover:scale-105"
            >
              <h3 className="font-bold text-lg">{item.modalityCode}</h3>
              <p className="mb-1">{item.modality}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Level: {item.programLevelCode}
              </p>
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 rounded-full text-yellow-500 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50 transition transform hover:scale-110"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.modalityCode)}
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
              {editingItem ? "Edit" : "Add"} Program Modality
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
              name="modalityCode"
              value={formData.modalityCode}
              onChange={handleChange}
              placeholder="Modality Code (e.g. REG-DEG)"
              disabled={!!editingItem || saving}
              className="w-full mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <input
              type="text"
              name="modality"
              value={formData.modality}
              onChange={handleChange}
              placeholder="Modality Name (e.g. Regular)"
              disabled={saving}
              className="w-full mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <select
              name="programLevelCode"
              value={formData.programLevelCode}
              onChange={handleChange}
              disabled={saving}
              className="w-full mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select Program Level</option>
              {programLevels.map((pl) => (
                <option key={pl.code} value={pl.code}>
                  {pl.name} ({pl.code})
                </option>
              ))}
            </select>

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

export default ProgramModalitiesEditor;
