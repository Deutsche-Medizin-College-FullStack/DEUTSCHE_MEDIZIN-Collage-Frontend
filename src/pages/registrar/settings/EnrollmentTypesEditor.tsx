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

type EnrollmentType = {
  enrollmentTypeCode: string;
  enrollmentTypeName: string;
};

const EnrollmentTypesEditor = () => {
  const [enrollmentTypes, setEnrollmentTypes] = useState<EnrollmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EnrollmentType | null>(null);
  const [formData, setFormData] = useState({
    enrollmentTypeCode: "",
    enrollmentTypeName: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = showAll ? 1000 : 10;

  // Fetch data on mount
  useEffect(() => {
    const fetchEnrollmentTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(
          endPoints.enrollmentTypes || "/enrollment-type"
        );
        console.log("API Response:", response);
        setEnrollmentTypes(response); // Direct array from apiService
      } catch (err: any) {
        console.error("Failed to fetch enrollment types:", err);
        setError("Failed to load enrollment types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollmentTypes();
  }, []);

  // Filtering data based on search term
  const filteredData = enrollmentTypes.filter(
    (item) =>
      item.enrollmentTypeCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.enrollmentTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination update on data change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, currentPage, totalPages, showAll]);

  // Open modal for add or edit
  const handleOpenModal = (item: EnrollmentType | null = null) => {
    if (item && !window.confirm(`Edit "${item.enrollmentTypeName}"?`)) return;
    setEditingItem(item);
    setFormData({
      enrollmentTypeCode: item ? item.enrollmentTypeCode : "",
      enrollmentTypeName: item ? item.enrollmentTypeName : "",
    });
    setFormError("");
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ enrollmentTypeCode: "", enrollmentTypeName: "" });
    setFormError("");
  };

  // Form input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real submit handler with API calls
  const handleSubmit = async () => {
    if (
      !formData.enrollmentTypeCode.trim() ||
      !formData.enrollmentTypeName.trim()
    ) {
      setFormError("Both code and name are required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingItem) {
        // UPDATE
        if (!window.confirm(`Update "${editingItem.enrollmentTypeName}"?`))
          return;
        const body = {
          enrollmentTypeCode: formData.enrollmentTypeCode,
          enrollmentTypeName: formData.enrollmentTypeName,
        };
        const response = await apiService.put(
          `/enrollment-type/${formData.enrollmentTypeCode}`,
          body
        );
        setEnrollmentTypes((prev) =>
          prev.map((et) =>
            et.enrollmentTypeCode === editingItem.enrollmentTypeCode
              ? response
              : et
          )
        );
      } else {
        // ADD
        if (!window.confirm(`Add "${formData.enrollmentTypeName}"?`)) return;
        const body = {
          enrollmentTypeCode: formData.enrollmentTypeCode,
          enrollmentTypeName: formData.enrollmentTypeName,
        };
        const response = await apiService.post("/enrollment-type", body);
        setEnrollmentTypes((prev) => [...prev, response]);
      }
      handleCloseModal();
    } catch (err: any) {
      console.error("Submit error:", err);
      setFormError(
        err.response?.data?.error || "Failed to save enrollment type."
      );
    } finally {
      setSaving(false);
    }
  };

  // Real delete handler with API call
  const handleDelete = async (code: string) => {
    if (!window.confirm(`Delete enrollment type "${code}"?`)) return;

    try {
      await apiService.delete(`/enrollment-type/${code}`);
      setEnrollmentTypes((prev) =>
        prev.filter((et) => et.enrollmentTypeCode !== code)
      );
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(
        err.response?.data?.error || "Failed to delete enrollment type."
      );
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
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          DHFM Enrollment Types Editor
        </h1>
        <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
          ({enrollmentTypes.length} enrollment types)
        </p>
      </header>

      <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            Enrollment Types
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all"
            >
              <FaPlus /> Add Type
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

        <input
          type="text"
          placeholder="Search enrollment types by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
        />

        {viewMode === "table" ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-4 text-left font-semibold">Code</th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.enrollmentTypeCode}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b"
                  >
                    <td className="p-4 font-mono bg-gray-100 dark:bg-gray-800">
                      {item.enrollmentTypeCode}
                    </td>
                    <td className="p-4">{item.enrollmentTypeName}</td>
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
                          onClick={() => handleDelete(item.enrollmentTypeCode)}
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
                key={item.enrollmentTypeCode}
                className="p-6 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                <div className="font-bold text-xl mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-fit">
                  {item.enrollmentTypeCode}
                </div>
                <h3 className="font-semibold text-lg mb-4">
                  {item.enrollmentTypeName}
                </h3>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.enrollmentTypeCode)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                {editingItem ? "Edit" : "Add"} Enrollment Type
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
                    Code:
                  </span>
                  <span className="font-mono ml-2 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                    {editingItem.enrollmentTypeCode}
                  </span>
                </div>
              )}
              <input
                type="text"
                name="enrollmentTypeCode"
                value={formData.enrollmentTypeCode}
                onChange={handleChange}
                placeholder="Enter code (e.g. REG)..."
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
              />
              <input
                type="text"
                name="enrollmentTypeName"
                value={formData.enrollmentTypeName}
                onChange={handleChange}
                placeholder="Enter enrollment type name..."
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

export default EnrollmentTypesEditor;
