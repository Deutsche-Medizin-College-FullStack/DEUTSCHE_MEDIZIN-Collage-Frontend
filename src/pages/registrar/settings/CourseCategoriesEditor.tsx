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

type CourseCategory = {
  catID: number; // ✅ Updated to match actual API response
  catName: string;
};

const CourseCategoriesEditor = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.courseCategory);
        console.log("API Response:", response);

        // ✅ Transform API response to match our type
        const transformedData = response.map((item: any) => ({
          catID: item.catID,
          catName: item.catName,
        }));

        setCategories(transformedData);
      } catch (err: any) {
        console.error("Failed to fetch course categories:", err);
        setError("Failed to load course categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
        <span className="text-xl">Loading...</span>
      </div>
    );
  }

  // Error State
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
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DHMC Course Categories Editor
          </h1>
          <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
            ({categories.length} course categories)
          </p>
        </div>
      </header>
      <main>
        <CrudSection
          title="Course Categories"
          data={categories}
          setData={setCategories}
        />
      </main>
    </div>
  );
};

const CrudSection = ({
  title,
  data,
  setData,
}: {
  title: string;
  data: CourseCategory[];
  setData: React.Dispatch<React.SetStateAction<CourseCategory[]>>;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseCategory | null>(null);
  const [formData, setFormData] = useState({
    catName: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = showAll ? data.length : 10;

  // ✅ SAFE FILTERING: Updated to use catID
  const filteredData = data
    .filter(
      (item) => item && item.catID !== undefined && item.catName !== undefined
    )
    .filter(
      (item) =>
        item.catID
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.catName.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Pagination update
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, currentPage, totalPages, showAll]);

  const handleOpenModal = (item: CourseCategory | null = null) => {
    if (item && !window.confirm(`Edit "${item.catName}"?`)) return;
    setEditingItem(item);
    setFormData({ catName: item ? item.catName : "" });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ catName: "" });
    setFormError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.catName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingItem) {
        // UPDATE - API uses id in URL but our data uses catID
        if (!window.confirm(`Update "${editingItem.catName}"?`)) return;
        await apiService.put(
          `${endPoints.courseCategory}/${editingItem.catID}`,
          {
            catName: formData.catName,
          }
        );
      } else {
        // ADD - using single endpoint
        if (!window.confirm(`Add "${formData.catName}"?`)) return;
        await apiService.post(endPoints.courseCategory + "/single", {
          catName: formData.catName,
        });
      }

      // Refresh data from API after successful operation
      const response = await apiService.get(endPoints.courseCategory);
      const transformedData = response.map((item: any) => ({
        catID: item.catID,
        catName: item.catName,
      }));
      setData(transformedData);
      handleCloseModal();
    } catch (err: any) {
      console.error("Submit error:", err);
      setFormError(
        err.response?.data?.error || "Failed to save course category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catID: number) => {
    const categoryName = data.find((c) => c.catID === catID)?.catName;
    if (!window.confirm(`Delete "${categoryName}"?`)) return;

    try {
      await apiService.delete(`${endPoints.courseCategory}/${catID}`);
      // Refresh data from API after delete
      const response = await apiService.get(endPoints.courseCategory);
      const transformedData = response.map((item: any) => ({
        catID: item.catID,
        catName: item.catName,
      }));
      setData(transformedData);
    } catch (err: any) {
      console.error("Delete error:", err);
      setFormError(
        err.response?.data?.error || "Failed to delete course category."
      );
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title} ({data.length})
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
          >
            <FaPlus /> Add Category
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-md"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-purple-500 hover:bg-purple-600 text-white shadow-md"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}
            {viewMode === "table" ? "Grid View" : "Table View"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search Categories by ID or name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-4 mb-6 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
      />

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Category ID
                </th>
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Category Name
                </th>
                <th className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.catID} // ✅ Updated to use catID
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition-colors duration-200"
                >
                  <td className="p-4 font-mono bg-gray-100 dark:bg-gray-800">
                    {item.catID}
                  </td>
                  <td className="p-4">{item.catName}</td>
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
                        onClick={() => handleDelete(item.catID)} // ✅ Updated to use catID
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
              key={item.catID} // ✅ Updated to use catID
              className="p-6 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
            >
              <div className="font-bold text-lg mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-fit">
                #{item.catID}
              </div>
              <h3 className="font-semibold text-base mb-4">{item.catName}</h3>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item.catID)} // ✅ Updated to use catID
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} Category
            </h3>
            {formError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-xl text-red-800 dark:text-red-200 mb-6">
                {formError}
              </div>
            )}
            {editingItem && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-6">
                <span className="font-bold text-sm text-gray-600 dark:text-gray-300">
                  ID:
                </span>
                <span className="font-mono ml-2 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                  {editingItem.catID}
                </span>
              </div>
            )}
            <input
              type="text"
              name="catName"
              value={formData.catName}
              onChange={handleChange}
              placeholder="Category Name (e.g., Core)"
              className="w-full p-4 mb-6 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
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
                className="flex-1 py-3 px-6 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

export default CourseCategoriesEditor;
