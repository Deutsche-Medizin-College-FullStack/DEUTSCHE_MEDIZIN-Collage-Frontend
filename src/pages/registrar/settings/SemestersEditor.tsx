// // import React, { useState, useEffect } from "react";
// // import { FaEdit, FaTrash, FaPlus, FaList, FaTh } from "react-icons/fa";

// // const SemestersEditor = () => {
// //   const initialSemesters = [
// //     { code: "SEM001", name: "Fall 2023" },
// //     { code: "SEM002", name: "Spring 2024" },
// //     { code: "SEM003", name: "Summer 2024" },
// //   ];

// //   const [semesters, setSemesters] = useState(initialSemesters);

// //   return (
// //     <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
// //       <header className="mb-10">
// //         <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
// //           <h1 className="text-4xl font-extrabold bg-blue-500 bg-clip-text text-transparent">
// //             DHFM Semesters Editor
// //           </h1>
// //         </div>
// //       </header>
// //       <main>
// //         <CrudSection
// //           title="Semesters"
// //           data={semesters}
// //           setData={setSemesters}
// //         />
// //       </main>
// //     </div>
// //   );
// // };

// // const CrudSection = ({ title, data, setData }) => {
// //   const [showModal, setShowModal] = useState(false);
// //   const [editingItem, setEditingItem] = useState(null);
// //   const [formData, setFormData] = useState({ code: "", name: "" });
// //   const [error, setError] = useState("");
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [showAll, setShowAll] = useState(false);
// //   const [viewMode, setViewMode] = useState("table");
// //   const itemsPerPage = showAll ? data.length : 10;

// //   const filteredData = data.filter(
// //     (item) =>
// //       item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       item.name.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

// //   const paginatedData = filteredData.slice(
// //     (currentPage - 1) * itemsPerPage,
// //     currentPage * itemsPerPage
// //   );

// //   useEffect(() => {
// //     if (currentPage > totalPages && totalPages > 0) {
// //       setCurrentPage(totalPages);
// //     } else if (totalPages === 0) {
// //       setCurrentPage(1);
// //     }
// //   }, [filteredData.length, currentPage, totalPages, showAll]);

// //   const handleOpenModal = (item = null) => {
// //     if (item && !window.confirm(`Are you sure you want to edit this semester?`))
// //       return;
// //     setEditingItem(item);
// //     setFormData(item ? { ...item } : { code: "", name: "" });
// //     setError("");
// //     setShowModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowModal(false);
// //     setError("");
// //   };

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const validateForm = () => {
// //     if (!formData.code.trim() || !formData.name.trim()) {
// //       setError("All fields are required.");
// //       return false;
// //     }
// //     const existing = data.find((d) => d.code === formData.code);
// //     if (existing && (!editingItem || editingItem.code !== formData.code)) {
// //       setError("Code must be unique.");
// //       return false;
// //     }
// //     return true;
// //   };

// //   const handleSubmit = () => {
// //     if (!validateForm()) return;
// //     if (
// //       !editingItem &&
// //       !window.confirm(`Are you sure you want to add this semester?`)
// //     )
// //       return;

// //     if (editingItem) {
// //       setData(
// //         data.map((d) => (d.code === editingItem.code ? { ...formData } : d))
// //       );
// //     } else {
// //       setData([...data, { ...formData }]);
// //     }
// //     handleCloseModal();
// //   };

// //   const handleDelete = (code) => {
// //     if (
// //       !window.confirm(
// //         `Are you sure you want to delete this semester? This action cannot be undone.`
// //       )
// //     )
// //       return;
// //     setData(data.filter((d) => d.code !== code));
// //   };

// //   return (
// //     <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 animate-fade-in">
// //       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
// //         <h2 className="text-2xl font-bold bg-blue-500 dark:bg-white bg-clip-text text-transparent">
// //           {title}
// //         </h2>
// //         <div className="flex gap-3 flex-wrap">
// //           <button
// //             onClick={() => handleOpenModal()}
// //             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white shadow-md"
// //           >
// //             <FaPlus /> Add Semester
// //           </button>
// //           <button
// //             onClick={() => setShowAll(!showAll)}
// //             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
// //           >
// //             {showAll ? "Paginate" : "Show All"}
// //           </button>
// //           <button
// //             onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
// //             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-purple-500 dark:bg-purple-700 hover:bg-purple-600 dark:hover:bg-purple-800 text-white shadow-md"
// //           >
// //             {viewMode === "table" ? <FaTh /> : <FaList />}{" "}
// //             {viewMode === "table" ? "Grid View" : "Table View"}
// //           </button>
// //         </div>
// //       </div>
// //       <input
// //         type="text"
// //         placeholder="Search Semesters by code or name"
// //         value={searchTerm}
// //         onChange={(e) => setSearchTerm(e.target.value)}
// //         className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
// //       />
// //       {viewMode === "table" ? (
// //         <div className="overflow-x-auto rounded-lg">
// //           <table className="w-full border-collapse">
// //             <thead>
// //               <tr>
// //                 <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
// //                   Code
// //                 </th>
// //                 <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
// //                   Name
// //                 </th>
// //                 <th className="p-4 text-right font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {paginatedData.map((item) => (
// //                 <tr
// //                   key={item.code}
// //                   className="group transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 animate-slide-up"
// //                 >
// //                   <td className="p-4">{item.code}</td>
// //                   <td className="p-4">{item.name}</td>
// //                   <td className="p-4 text-right">
// //                     <div className="flex justify-end gap-3 ">
// //                       <button
// //                         onClick={() => handleOpenModal(item)}
// //                         className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50"
// //                       >
// //                         <FaEdit className="text-lg" />
// //                       </button>
// //                       <button
// //                         onClick={() => handleDelete(item.code)}
// //                         className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-600/50 dark:hover:bg-red-800/50"
// //                       >
// //                         <FaTrash className="text-lg" />
// //                       </button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
// //           {paginatedData.map((item) => (
// //             <div
// //               key={item.code}
// //               className="p-5 rounded-lg shadow-md group transition-all duration-200 transform hover:scale-105 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 animate-slide-up"
// //             >
// //               <h3 className="font-bold text-lg">{item.code}</h3>
// //               <p>{item.name}</p>
// //               <div className="flex justify-end gap-3 mt-3 ">
// //                 <button
// //                   onClick={() => handleOpenModal(item)}
// //                   className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50"
// //                 >
// //                   <FaEdit className="text-lg" />
// //                 </button>
// //                 <button
// //                   onClick={() => handleDelete(item.code)}
// //                   className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-600/50 dark:hover:bg-red-800/50"
// //                 >
// //                   <FaTrash className="text-lg" />
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //       {!showAll && totalPages > 1 && (
// //         <div className="flex justify-between items-center mt-6">
// //           <button
// //             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
// //             disabled={currentPage === 1}
// //             className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
// //           >
// //             Previous
// //           </button>
// //           <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
// //             Page {currentPage} of {totalPages}
// //           </span>
// //           <button
// //             onClick={() =>
// //               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
// //             }
// //             disabled={currentPage === totalPages}
// //             className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}
// //       {showModal && (
// //         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
// //           <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-95 animate-modal-in bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
// //             <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
// //               {editingItem ? "Edit" : "Add"} Semester
// //             </h3>
// //             {error && (
// //               <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg animate-pulse">
// //                 {error}
// //               </p>
// //             )}
// //             <input
// //               type="text"
// //               name="code"
// //               value={formData.code}
// //               onChange={handleChange}
// //               placeholder="Code (e.g., SEM001)"
// //               className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
// //               disabled={!!editingItem}
// //             />
// //             <input
// //               type="text"
// //               name="name"
// //               value={formData.name}
// //               onChange={handleChange}
// //               placeholder="Name (e.g., Fall 2023)"
// //               className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
// //             />
// //             <div className="flex justify-end gap-3">
// //               <button
// //                 onClick={handleCloseModal}
// //                 className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-md"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleSubmit}
// //                 className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
// //               >
// //                 {editingItem ? "Update" : "Add"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default SemestersEditor;
// import React, { useState, useEffect } from "react";
// import { FaEdit, FaTrash, FaPlus, FaList, FaTh } from "react-icons/fa";
// import endPoints from "@/components/api/endPoints";
// import apiService from "@/components/api/apiService";

// const SemestersEditor = () => {
//   const [semesters, setSemesters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSemesters = async () => {
//       try {
//         setLoading(true);
//         const response = await apiService.get(endPoints.semesters); // GET /api/semesters
//         // Transform backend response: { id, semesterName, code } → { id, code, name }
//         const transformed = response.map((item) => ({
//           id: item.id,
//           code: item.code,
//           name: item.semesterName,
//         }));
//         setSemesters(transformed);
//       } catch (err) {
//         console.error("Failed to fetch semesters:", err);
//         setError("Failed to load semesters. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSemesters();
//   }, []);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   if (error)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         {error}
//       </div>
//     );

//   return (
//     <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       <header className="mb-10">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//           <h1 className="text-4xl font-extrabold bg-blue-500 bg-clip-text text-transparent">
//             DHFM Semesters Editor
//           </h1>
//         </div>
//       </header>
//       <main>
//         <CrudSection
//           title="Semesters"
//           data={semesters}
//           setData={setSemesters}
//         />
//       </main>
//     </div>
//   );
// };

// const CrudSection = ({ title, data, setData }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [formData, setFormData] = useState({ code: "", name: "" });
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showAll, setShowAll] = useState(false);
//   const [viewMode, setViewMode] = useState("table");
//   const itemsPerPage = showAll ? data.length : 10;

//   const filteredData = data.filter(
//     (item) =>
//       item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(totalPages);
//     } else if (totalPages === 0) {
//       setCurrentPage(1);
//     }
//   }, [filteredData.length, currentPage, totalPages, showAll]);

//   const handleOpenModal = (item = null) => {
//     setEditingItem(item);
//     setFormData(
//       item ? { code: item.code, name: item.name } : { code: "", name: "" }
//     );
//     setError("");
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingItem(null);
//     setFormData({ code: "", name: "" });
//     setError("");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.code.trim() || !formData.name.trim()) {
//       setError("All fields are required.");
//       return false;
//     }
//     const existing = data.find((d) => d.code === formData.code);
//     if (existing && (!editingItem || editingItem.code !== formData.code)) {
//       setError("Code must be unique.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
//     try {
//       if (editingItem) {
//         // Update - PUT /api/semesters/{id}
//         const updatedSemester = {
//           code: formData.code,
//           semesterName: formData.name,
//         };
//         const response = await apiService.put(
//           `${endPoints.semesters}/${editingItem.id}`,
//           updatedSemester
//         );
//         const transformed = {
//           id: response.id,
//           code: response.code,
//           name: response.semesterName,
//         };
//         setData(data.map((d) => (d.id === editingItem.id ? transformed : d)));
//       } else {
//         // Create - POST /api/semesters
//         const newSemester = {
//           code: formData.code,
//           semesterName: formData.name,
//         };
//         const response = await apiService.post(
//           endPoints.semesters,
//           newSemester
//         );
//         const transformed = {
//           id: response.id,
//           code: response.code,
//           name: response.semesterName,
//         };
//         setData([...data, transformed]);
//       }
//     } catch (err) {
//       console.error("Failed to save semester:", err);
//       setError(
//         err?.response?.data?.error ||
//           "Failed to save semester. Please try again."
//       );
//       return;
//     }
//     handleCloseModal();
//   };

//   const handleDelete = async (id) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this semester? This action cannot be undone."
//       )
//     )
//       return;
//     try {
//       await apiService.delete(`${endPoints.semesters}/${id}`);
//       setData(data.filter((d) => d.id !== id));
//     } catch (err) {
//       console.error("Failed to delete semester:", err);
//       alert(
//         err?.response?.data?.error ||
//           "Failed to delete semester. Please try again."
//       );
//     }
//   };

//   // ... (same JSX for UI/modal as previous static version, just update all references to support 'id', 'code', 'name')
//   // Example shown for Table view row:
//   // <tr key={item.id}>

//   // (Omitting unchanged UI for brevity)
// };

// export default SemestersEditor;
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

interface Semester {
  id: string;
  code: string;
  name: string;
}

const SemestersEditor = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.semesters);

        // Map backend shape to internal shape
        const transformed = response.map((item: any) => ({
          id: item.academicPeriodCode,
          code: item.academicPeriodCode,
          name: item.academicPeriod,
        }));

        setSemesters(transformed);
      } catch (err: any) {
        console.error("Failed to fetch semesters:", err);
        setError("Failed to load semesters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  const InstructionsReminder = () => (
  <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg">
    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-3">
      <span className="text-3xl">📅</span> Semester Management Instructions for Registrars
    </h3>
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          1
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Purpose:</span>
          <p>Manage academic semesters to organize the school year into terms/periods.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          2
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Semester Code (MOE Standard):</span>
          <p>
            • <strong>Recommended codes:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">S1</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">S2</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">T1</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">T2</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">T3</code>
            <br />
            • Follow Ministry of Education (MOE) guidelines where applicable
            <br />
            • Each code must be unique across all semesters
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          3
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Semester Name (Flexible):</span>
          <p>
            • Use descriptive names like: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">First Semester</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">1st Semester</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">Semester I</code>
            <br />
            • Can match your school's academic calendar
            <br />
            • Names are for display purposes only
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          4
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Special Semester "NO":</span>
          <p>
            • <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">NO</code> is reserved for students who are no longer enrolled
            <br />
            • <strong>Do NOT delete</strong> the "NO" semester
            <br />
            • Moving a student to "NO" semester means they are inactive or Completed or Withdrawn or left the institution
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1">
          5
        </span>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Deletion Rules:</span>
          <p>
            • <strong>Cannot delete</strong> a semester if any students are assigned to it
            <br />
            • Before deletion: Move all students to another semester first
            <br />
            • Deletion removes all <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">Batch-ClassYear-Semester</code> combinations containing this semester
          </p>
        </div>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
        <p className="font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>Critical:</strong> Deleting a semester affects all academic records. Ensure no active students are assigned before deletion.
        </p>
      </div>
    </div>
  </div>
);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading semesters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          DHFM Semesters Editor
        </h1>
      </header>

      {/* Add Instructions Here */}
      <InstructionsReminder />

      <main>
        <CrudSection
          title="Semesters"
          data={semesters}
          setData={setSemesters}
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
  data: Semester[];
  setData: React.Dispatch<React.SetStateAction<Semester[]>>;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [formError, setFormError] = useState("");

  const handleOpenModal = (item: Semester | null = null) => {
    setEditingItem(item);
    setFormData(
      item ? { code: item.code, name: item.name } : { code: "", name: "" }
    );
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ code: "", name: "" });
    setFormError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError("Code and name are required.");
      return false;
    }
    const existing = data.find((d) => d.code === formData.code);
    if (existing && (!editingItem || editingItem.id !== existing.id)) {
      setFormError("Semester code must be unique.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingItem) {
        // UPDATE
        const payload = {
          code: formData.code,
          semesterName: formData.name, // backend expects "semesterName"
        };
        await apiService.put(
          `${endPoints.semesters}/${editingItem.id}`,
          payload
        );
        setData(
          data.map((d) => (d.id === editingItem.id ? { ...d, ...formData } : d))
        );
      } else {
        // CREATE
        const payload = {
          code: formData.code,
          semesterName: formData.name,
        };
        const res = await apiService.post(endPoints.semesters, payload);
        const newItem = {
          id: res.academicPeriodCode || res.id,
          code: res.academicPeriodCode || res.code,
          name: res.academicPeriod || res.semesterName,
        };
        setData([...data, newItem]);
      }
      handleCloseModal();
    } catch (err: any) {
      console.error("Save failed:", err);
      setFormError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save semester."
      );
    }
  };

const handleDelete = async (id: string) => {
  // Prevent deletion of "NO" semester
  const semester = data.find(s => s.id === id);
  if (semester?.code === "NO") {
    alert("The 'NO' semester cannot be deleted. This is reserved for inactive students.");
    return;
  }

  const semesterName = semester?.name || "this semester";
  
  const confirmationMessage = `WARNING:
  
Deleting semester "${semesterName}" will:
1. Remove ALL Batch-ClassYear-Semester combinations containing this semester
2. Delete ALL academic records linked to this semester
3. Affect ALL students currently assigned to this semester

Requirements for deletion:
• NO students can be assigned to this semester
• All students must be moved to another semester first

Are you absolutely sure you want to delete "${semesterName}"?`;

  if (!window.confirm(confirmationMessage)) return;

  try {
    await apiService.delete(`${endPoints.semesters}/${id}`);
    setData(data.filter((d) => d.id !== id));
  } catch (err: any) {
    const errorMessage = err?.response?.data?.error || "Failed to delete semester.";
    
    // Check if error is due to existing students
    if (errorMessage.toLowerCase().includes("student") || 
        errorMessage.toLowerCase().includes("assigned") ||
        errorMessage.toLowerCase().includes("dependency")) {
      alert(`Cannot delete semester: ${errorMessage}\n\nPlease move all students to another semester first.`);
    } else {
      alert(errorMessage);
    }
  }
};

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <FaPlus size={16} /> Add Semester
        </button>
      </div>

      {/* Simple table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-4 font-medium">{item.code}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">
              {editingItem ? "Edit Semester" : "Add Semester"}
            </h3>

            {formError && (
              <p className="text-red-500 mb-6 bg-red-50 dark:bg-red-900/30 p-3 rounded">
                {formError}
              </p>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. S1"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  disabled={!!editingItem} // optional
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. First Semester"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
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

export default SemestersEditor;
