import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

const ClassYearsEditor = () => {
  const [classYears, setClassYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassYears = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(endPoints.classYears); // GET /api/class-years

        // Transform backend response: { id, classYear } → { id, name }
        const transformed = response.map((item) => ({
          id: item.id,
          name: item.classYear,
        }));

        setClassYears(transformed);
      } catch (err) {
        console.error("Failed to fetch class years:", err);
        setError("Failed to load class years. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchClassYears();
  }, []);

  //=======================================================================================
  // Instructions Component
  const InstructionsReminder = () => (
  <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg">
    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-3">
      <span className="text-3xl">🎓</span> Class Year Management Instructions for Registrars
    </h3>
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          1
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Purpose:</span>
          <p>Manage class years (academic levels) to organize students by their study year.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          2
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Naming Convention:</span>
          <p>
            • <strong>Numbered years:</strong> Use <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">1</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">2</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">3</code>, etc.
            <br />
            • <strong>Special programs:</strong> Use names like <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">PC1</code> (Pre-Clinical 1), <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">C1</code> (Clinical 1)
            
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          3
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Usage:</span>
          <p>
            • Class years combine with batches and semesters to create <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">Batch-ClassYear-Semester</code> combinations
            <br />
            • Each student is assigned to a specific class year within their batch
            <br />
            • Class years determine course progression and prerequisites
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          4
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Deletion Rules:</span>
          <p>
            • <strong>Cannot delete</strong> a class year if any students are assigned to it
            <br />
            • Before deletion: Move all students to another class year first
            <br />
            • Deletion removes all <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">Batch-ClassYear-Semester</code> combinations containing this class year
          </p>
        </div>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
        <p className="font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>Critical:</strong> Deleting a class year will affect all academic structures linked to it. Ensure no active students are assigned before deletion.
        </p>
      </div>
    </div>
  </div>
);
  //=======================================================================================

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-blue-500 bg-clip-text text-transparent">
            DHMC Class Years Editor
          </h1>
        </div>
      </header>
      <InstructionsReminder />
      <main>
        <CrudSection
          title="Class Years"
          data={classYears}
          setData={setClassYears}
        />
      </main>
    </div>
  );
};

const CrudSection = ({ title, data, setData }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = showAll ? data.length : 10;

  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleRowClick = (item) => {
    navigate(`/class-years/${item.id}`);
  };

  const handleOpenModal = (item = null) => {
    if (
      item &&
      !window.confirm(`Are you sure you want to edit this class year?`)
    )
      return;
    setEditingItem(item);
    setFormData(item ? { name: item.name } : { name: "" });
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "" });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setError("Name is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (
      !editingItem &&
      !window.confirm(`Are you sure you want to add this class year?`)
    )
      return;

    try {
      if (editingItem) {
        // Update - PUT /api/class-years/{id}
        const updatedClassYear = { classYear: formData.name };
        const response = await apiService.put(
          `${endPoints.classYears}/${editingItem.id}`,
          updatedClassYear
        );
        const transformed = {
          id: response.id,
          name: response.classYear,
        };
        setData(data.map((d) => (d.id === editingItem.id ? transformed : d)));
      } else {
        // Create - POST /api/class-years
        const newClassYear = { classYear: formData.name };
        const response = await apiService.post(
          endPoints.classYears,
          newClassYear
        );
        const transformed = {
          id: response.id,
          name: response.classYear,
        };
        setData([...data, transformed]);
      }
    } catch (err) {
      // Handle exact error responses: 400, 409
      console.error("Failed to save class year:", err);
      const errorMessage =
        err?.response?.data?.error ||
        "Failed to save class year. Please try again.";
      setError(errorMessage);
      return;
    }

    handleCloseModal();
  };

  const handleDelete = async (id) => {
  const className = data.find(c => c.id === id)?.name || "this class year";
  
  const confirmationMessage = `WARNING:
  
Deleting class year "${className}" will:
1. Remove ALL Batch-ClassYear-Semester combinations containing this class year
2. Delete ALL academic records linked to this class year
3. Affect ALL students currently assigned to this class year

Requirements for deletion:
• NO students can be assigned to this class year
• All students must be moved to another class year first

Are you absolutely sure you want to delete "${className}"?`;

  if (!window.confirm(confirmationMessage)) return;

  try {
    await apiService.delete(`${endPoints.classYears}/${id}`);
    setData(data.filter((d) => d.id !== id));
  } catch (err) {
    const errorMessage = err?.response?.data?.error || "Failed to delete class year.";
    
    // Check if error is due to existing students
    if (errorMessage.toLowerCase().includes("student") || 
        errorMessage.toLowerCase().includes("assigned") ||
        errorMessage.toLowerCase().includes("dependency")) {
      alert(`Cannot delete class year: ${errorMessage}\n\nPlease move all students to another class year first.`);
    } else {
      alert(errorMessage);
    }
  }
};

  return (
    <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-blue-500 dark:bg-white bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white shadow-md"
          >
            <FaPlus /> Add Class Year
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-purple-500 dark:bg-purple-700 hover:bg-purple-600 dark:hover:bg-purple-800 text-white shadow-md"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}
            {viewMode === "table" ? "Grid View" : "Table View"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search Class Years by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
      />

      {/* Table View - Updated with ID and clickable rows */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-lg mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  ID
                </th>
                <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  Name
                </th>
                <th className="p-4 text-right font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="group cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 border-b border-gray-200 dark:border-gray-700"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="p-4 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    #{item.id}
                  </td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(item);
                        }}
                        className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                        title="Edit"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                        title="Delete"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View - Updated with ID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {paginatedData.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-lg shadow-md group transition-all duration-200 transform hover:scale-105 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 border-2 border-transparent hover:border-blue-300 animate-slide-up relative"
              onClick={() => handleRowClick(item)}
            >
              <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
                #{item.id}
              </h3>
              <p className="mt-1">{item.name}</p>
              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(item);
                  }}
                  className="p-1.5 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 hover:bg-yellow-100"
                >
                  <FaEdit className="text-lg" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-1.5 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 hover:bg-red-100"
                >
                  <FaTrash className="text-lg" />
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
            className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal - Simplified to single name field */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-95 animate-modal-in bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} Class Year
            </h3>
            {error && (
              <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg animate-pulse">
                {error}
              </p>
            )}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Class Year Name (e.g., Grade 10)"
              className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
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

// Single Class Year Detail Page
const SingleClassYearPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classYear, setClassYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    const fetchSingleClassYear = async () => {
      try {
        const response = await apiService.get(`${endPoints.classYears}/${id}`);
        const transformed = {
          id: response.id,
          name: response.classYear,
        };
        setClassYear(transformed);
        setFormData({ name: transformed.name });
      } catch (err) {
        console.error("Failed to fetch class year:", err);
        setError(err?.response?.data?.error || "Class year not found");
      } finally {
        setLoading(false);
      }
    };
    fetchSingleClassYear();
  }, [id]);

  const handleBack = () => navigate(-1);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Name is required.");
      return;
    }
    try {
      const updatedClassYear = { classYear: formData.name };
      const response = await apiService.put(
        `${endPoints.classYears}/${id}`,
        updatedClassYear
      );
      setClassYear({
        id: response.id,
        name: response.classYear,
      });
      handleCloseModal();
    } catch (err) {
      console.error("Failed to update class year:", err);
      const errorMessage =
        err?.response?.data?.error || "Failed to update class year.";
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this class year?")) {
      try {
        await apiService.delete(`${endPoints.classYears}/${id}`);
        navigate(-1);
      } catch (err) {
        console.error("Failed to delete class year:", err);
        const errorMessage =
          err?.response?.data?.error || "Failed to delete class year.";
        alert(errorMessage);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error || !classYear)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Class year not found"}
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white shadow-md"
          >
            <FaArrowLeft /> Back to List
          </button>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
            {classYear.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              Class Year Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  ID
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono font-bold text-lg">
                  #{classYear.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Name
                </label>
                <p className="text-xl font-semibold">{classYear.name}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-100 dark:border-blue-900/50">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleOpenModal}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-xl hover:shadow-2xl"
              >
                <FaEdit className="text-xl" />
                Edit Class Year
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow-xl hover:shadow-2xl"
              >
                <FaTrash className="text-xl" />
                Delete Class Year
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              Edit {classYear.name}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-50 dark:bg-gray-700 text-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleCloseModal}
                className="px-8 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ClassYearsEditor, SingleClassYearPage };
export default ClassYearsEditor;
