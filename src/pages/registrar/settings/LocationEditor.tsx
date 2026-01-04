// import React, { useState, useEffect } from "react";
// import { FaEdit, FaTrash, FaPlus, FaList, FaTh } from "react-icons/fa";
// import { Loader2 } from "lucide-react";
// import apiService from "@/components/api/apiService";
// import endPoints from "@/components/api/endPoints";
// const RegistrarAdminPage = () => {
//   const [backendRegions, setBackendRegions] = useState([]);
//   const [backendWoredas, setBackendWoredas] = useState([]);
//   const [backendZones, setBackendZones] = useState([]);
//   const [regions, setRegions] = useState([]);
//   const [woredas, setWoredas] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [loading, setLoading] = useState(true); // <-- spinner state

//   useEffect(() => {
//     const getter = async () => {
//       try {
//         const zoneData = await apiService.get(endPoints.allZones);
//         const regionsData = await apiService.get(endPoints.allRegion);
//         const woredaData = await apiService.get(endPoints.allWoreda);
//         setBackendWoredas(woredaData);
//         setBackendRegions(regionsData);
//         setBackendZones(zoneData);
//         const transformedRegions = regionsData.map((region) => ({
//           code: region.regionCode,
//           name: region.region,
//           countryCode: region.regionType, // or region.countryCode if backend provides it differently
//         }));
//         const transformedWoredas = woredaData.map((woreda) => ({
//           code: woreda.woredaCode,
//           name: woreda.woreda,
//           zoneCode: woreda.zoneCode,
//         }));
//         const transformedZones = zoneData.map((zone) => ({
//           code: zone.zoneCode,
//           name: zone.zone,
//           regionCode: zone.regionCode,
//         }));
//         setZones(transformedZones);
//         setWoredas(transformedWoredas);
//         setRegions(transformedRegions); // Update regions state
//         console.log("Fetched regions:", regionsData);
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setLoading(false); // stop spinner
//       }
//     };
//     getter();
//   }, []);
//   // Fake initial data
//   const initialCountries = [
//     { code: "ET", name: "Ethiopia" },
//     { code: "KE", name: "Kenya" },
//   ];
//   const initialRegions = backendRegions.map((region) => ({
//     code: region.regionCode,
//     name: region.region,
//     countryCode: region.regionType, // or region.countryCode if backend provides it differently
//   }));
//   const initialRegionss = [
//     { code: "AM", name: "Amhara", countryCode: "ET" },
//     { code: "OR", name: "Oromia", countryCode: "ET" },
//     { code: "NA", name: "Nairobi Region", countryCode: "KE" },
//   ];

//   const initialZones = [
//     { code: "NG", name: "North Gondar", regionCode: "AM" },
//     { code: "SG", name: "South Gondar", regionCode: "AM" },
//     { code: "BO", name: "Bole", regionCode: "OR" },
//   ];

//   const initialWoredas = Array.from({ length: 150 }, (_, i) => ({
//     code: `WD${i + 1}`,
//     name: `Woreda ${i + 1}`,
//     zoneCode: ["NG", "SG", "BO"][i % 3],
//   }));

//   const [countries, setCountries] = useState(initialCountries);
//   // const [regions, setRegions] = useState(initialRegions);
//   // const [zones, setZones] = useState(initialZones);
//   // const [woredas, setWoredas] = useState(initialWoredas);
//   const [selectedSection, setSelectedSection] = useState("countries");

//   const sections = [
//     {
//       id: "countries",
//       title: "Countries",
//       data: countries,
//       setData: setCountries,
//     },
//     {
//       id: "regions",
//       title: "Regions",
//       data: regions,
//       setData: setRegions,
//       parentList: countries,
//       parentIdKey: "code",
//       parentLabelKey: "name",
//       parentForeignKey: "countryCode",
//       getParentName: (code) =>
//         countries.find((c) => c.code === code)?.name || "Unknown",
//     },
//     {
//       id: "zones",
//       title: "Zones",
//       data: zones,
//       setData: setZones,
//       parentList: regions,
//       parentIdKey: "code",
//       parentLabelKey: "name",
//       parentForeignKey: "regionCode",
//       getParentName: (code) =>
//         regions.find((r) => r.code === code)?.name || "Unknown",
//     },
//     {
//       id: "woredas",
//       title: "Woredas",
//       data: woredas,
//       setData: setWoredas,
//       parentList: zones,
//       parentIdKey: "code",
//       parentLabelKey: "name",
//       parentForeignKey: "zoneCode",
//       getParentName: (code) =>
//         zones.find((z) => z.code === code)?.name || "Unknown",
//     },
//   ];

//   return (
//     <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       {/* Top Navigation Bar */}
//       <header className="mb-10">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//           <h1 className="text-4xl font-extrabold dark:bg-white bg-blue-500 bg-clip-text text-transparent animate-gradient">
//             DHFM Location Editor
//           </h1>
//         </div>
//         <nav className="flex justify-center gap-4 flex-wrap">
//           {sections.map((section) => (
//             <button
//               key={section.id}
//               onClick={() => setSelectedSection(section.id)}
//               className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
//                 selectedSection === section.id
//                   ? "bg-blue-500 dark:bg-blue-700 text-white shadow-lg"
//                   : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
//               }`}
//             >
//               {section.title}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {/* Main Content */}
//       <main>
//         {sections.map(
//           (section) =>
//             selectedSection === section.id && (
//               <CrudSection
//                 anotherInfo={loading}
//                 key={section.id}
//                 title={section.title}
//                 {...section}
//               />
//             )
//         )}
//       </main>
//     </div>
//   );
// };

// const CrudSection = ({
//   title,
//   anotherInfo,
//   data,
//   setData,
//   parentList,
//   parentIdKey,
//   parentLabelKey,
//   parentForeignKey,
//   getParentName,
// }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [formData, setFormData] = useState({
//     code: "",
//     name: "",
//     [parentForeignKey]: "",
//   });
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showAll, setShowAll] = useState(false);
//   const [viewMode, setViewMode] = useState("table");
//   const itemsPerPage = showAll ? data.length : 10;

//   const filteredData = data.filter(
//     (item) =>
//       item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
//     if (
//       item &&
//       !window.confirm(
//         `Are you sure you want to edit this ${title
//           .slice(0, -1)
//           .toLowerCase()}?`
//       )
//     )
//       return;
//     setEditingItem(item);
//     setFormData(
//       item
//         ? { ...item }
//         : {
//             code: "",
//             name: "",
//             [parentForeignKey]: parentList?.[0]?.[parentIdKey] || "",
//           }
//     );
//     setError("");
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setError("");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.code.trim() || !formData.name.trim()) {
//       setError("Code and Name are required.");
//       return false;
//     }
//     const existing = data.find((d) => d.code === formData.code);
//     if (existing && (!editingItem || editingItem.code !== formData.code)) {
//       setError("Code must be unique.");
//       return false;
//     }
//     if (parentForeignKey && !formData[parentForeignKey]) {
//       setError("Parent selection is required.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = () => {
//     if (!validateForm()) return;
//     if (
//       !editingItem &&
//       !window.confirm(
//         `Are you sure you want to add this ${title.slice(0, -1).toLowerCase()}?`
//       )
//     )
//       return;

//     if (editingItem) {
//       setData(
//         data.map((d) => (d.code === editingItem.code ? { ...formData } : d))
//       );
//     } else {
//       setData([...data, { ...formData }]);
//     }
//     handleCloseModal();
//   };

//   const handleDelete = (code) => {
//     if (
//       !window.confirm(
//         `Are you sure you want to delete this ${title
//           .slice(0, -1)
//           .toLowerCase()}? This action cannot be undone.`
//       )
//     )
//       return;
//     setData(data.filter((d) => d.code !== code));
//   };

//   return (
//     <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 animate-fade-in">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <h2 className="text-2xl font-bold bg-blue-500 dark:bg-white bg-clip-text text-transparent">
//           {title}
//         </h2>

//         <div className="flex gap-3 flex-wrap">
//           <button
//             onClick={() => handleOpenModal()}
//             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 dark:hover:bg-blue-800 text-white shadow-md"
//           >
//             <FaPlus /> Add {title.slice(0, -1)}
//           </button>
//           <button
//             onClick={() => setShowAll(!showAll)}
//             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
//           >
//             {showAll ? "Paginate" : "Show All"}
//           </button>
//           <button
//             onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
//             className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-purple-500 dark:bg-purple-700 hover:bg-purple-600 dark:hover:bg-purple-800 text-white shadow-md"
//           >
//             {viewMode === "table" ? <FaTh /> : <FaList />}{" "}
//             {viewMode === "table" ? "Grid View" : "Table View"}
//           </button>
//         </div>
//       </div>
//       <input
//         type="text"
//         placeholder={`Search ${title} by code or name`}
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
//       />
//       {viewMode === "table" ? (
//         <div className="overflow-x-auto rounded-lg">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
//                   Code
//                 </th>
//                 <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
//                   Name
//                 </th>
//                 {getParentName && (
//                   <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
//                     Parent
//                   </th>
//                 )}
//                 <th className="p-4 text-right font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             {!anotherInfo && (
//               <tbody>
//                 {paginatedData.map((item) => (
//                   <tr
//                     key={item.code}
//                     className="group transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 animate-slide-up"
//                   >
//                     <td className="p-4">{item.code}</td>
//                     <td className="p-4">{item.name}</td>
//                     {getParentName && (
//                       <td className="p-4">
//                         {getParentName(item[parentForeignKey])}
//                       </td>
//                     )}
//                     <td className="p-4 text-right">
//                       <div className="flex justify-end gap-3 ">
//                         <button
//                           onClick={() => handleOpenModal(item)}
//                           className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50"
//                         >
//                           <FaEdit className="text-lg" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(item.code)}
//                           className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-600/50 dark:hover:bg-red-800/50"
//                         >
//                           <FaTrash className="text-lg" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             )}
//             {anotherInfo && (
//               <tbody>
//                 <tr>
//                   <td colSpan="4" className="p-4">
//                     <div className="flex items-center justify-center h-20 ">
//                       <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
//                     </div>
//                   </td>
//                 </tr>
//               </tbody>
//             )}
//           </table>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {paginatedData.map((item) => (
//             <div
//               key={item.code}
//               className="p-5 rounded-lg shadow-md group transition-all duration-200 transform hover:scale-105 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 animate-slide-up"
//             >
//               <h3 className="font-bold text-lg">
//                 {item.code} - {item.name}
//               </h3>
//               {getParentName && (
//                 <p className="text-sm opacity-80">
//                   Parent: {getParentName(item[parentForeignKey])}
//                 </p>
//               )}
//               <div className="flex justify-end gap-3 mt-3 ">
//                 <button
//                   onClick={() => handleOpenModal(item)}
//                   className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-600/50 dark:hover:bg-yellow-800/50"
//                 >
//                   <FaEdit className="text-lg" />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(item.code)}
//                   className="p-2 rounded-full transform hover:scale-110 transition-all duration-200 text-red-500 dark:text-red-400 hover:bg-red-600/50 dark:hover:bg-red-800/50"
//                 >
//                   <FaTrash className="text-lg" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       {!showAll && totalPages > 1 && (
//         <div className="flex justify-between items-center mt-6">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className="px-5 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//           <div className="p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-95 animate-modal-in bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
//             <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
//               {editingItem ? "Edit" : "Add"} {title.slice(0, -1)}
//             </h3>
//             {error && (
//               <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg animate-pulse">
//                 {error}
//               </p>
//             )}
//             <input
//               type="text"
//               name="code"
//               value={formData.code}
//               onChange={handleChange}
//               placeholder="Code"
//               className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
//               disabled={!!editingItem}
//             />
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Name"
//               className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
//             />
//             {parentList && (
//               <select
//                 name={parentForeignKey}
//                 value={formData[parentForeignKey]}
//                 onChange={handleChange}
//                 className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
//               >
//                 {parentList.map((parent) => (
//                   <option key={parent[parentIdKey]} value={parent[parentIdKey]}>
//                     {parent[parentLabelKey]}
//                   </option>
//                 ))}
//               </select>
//             )}
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={handleCloseModal}
//                 className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="px-6 py-2 rounded-lg font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 text-white shadow-md"
//               >
//                 {editingItem ? "Update" : "Add"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RegistrarAdminPage;
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaList, FaTh } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

const RegistrarAdminPage = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState("regions");

  // Static countries (you can later add a /api/country endpoint if needed)
  const countries = [
    { code: "ET", name: "Ethiopia" },
    { code: "KE", name: "Kenya" },
  ];

  const fetchAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [regionsRes, zonesRes, woredasRes] = await Promise.all([
        apiService.get(endPoints.allRegion),
        apiService.get(endPoints.allZones),
        apiService.get(endPoints.allWoreda),
      ]);

      setRegions(
        regionsRes.map((r: any) => ({
          code: r.regionCode,
          name: r.region,
          countryCode: r.countryCode || "ET",
        }))
      );

      setZones(
        zonesRes.map((z: any) => ({
          code: z.zoneCode,
          name: z.zone,
          regionCode: z.regionCode,
        }))
      );

      setWoredas(
        woredasRes.map((w: any) => ({
          code: w.woredaCode,
          name: w.woreda,
          zoneCode: w.zoneCode,
        }))
      );
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setErrorMessage(
        "Failed to load administrative divisions. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const sections = [
    {
      id: "countries",
      title: "Countries",
      data: countries,
      readOnly: true,
    },
    {
      id: "regions",
      title: "Regions",
      data: regions,
      setData: setRegions,
      parentList: countries,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "countryCode",
      getParentName: (code: string) =>
        countries.find((c) => c.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/region/bulk",
        deleteAll: "/api/region",
      },
      transformToBackend: (item: any) => ({
        regionCode: item.code,
        region: item.name,
        countryCode: item.countryCode,
      }),
    },
    {
      id: "zones",
      title: "Zones",
      data: zones,
      setData: setZones,
      parentList: regions,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "regionCode",
      getParentName: (code: string) =>
        regions.find((r) => r.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/zone/bulk",
        deleteAll: "/api/zone",
      },
      transformToBackend: (item: any) => ({
        zoneCode: item.code,
        zone: item.name,
        regionCode: item.regionCode,
        regionType: "Standard", // adjust or make configurable if needed
      }),
    },
    {
      id: "woredas",
      title: "Woredas",
      data: woredas,
      setData: setWoredas,
      parentList: zones,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "zoneCode",
      getParentName: (code: string) =>
        zones.find((z) => z.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/woreda/bulk",
        deleteAll: "/api/woreda", // assuming this endpoint exists — add if missing
      },
      transformToBackend: (item: any) => ({
        woredaCode: item.code,
        woreda: item.name,
        zoneCode: item.zoneCode,
      }),
    },
  ];

  const currentSection =
    sections.find((s) => s.id === selectedSection) || sections[1];

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent animate-gradient">
          DHFM Location Editor
        </h1>

        <nav className="flex justify-center gap-4 flex-wrap mt-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedSection === section.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : errorMessage ? (
          <div className="text-center text-red-600 dark:text-red-400 text-xl font-medium">
            {errorMessage}
          </div>
        ) : (
          <CrudSection
            title={currentSection.title}
            data={currentSection.data}
            setData={currentSection.setData}
            parentList={currentSection.parentList}
            parentIdKey={currentSection.parentIdKey}
            parentLabelKey={currentSection.parentLabelKey}
            parentForeignKey={currentSection.parentForeignKey}
            getParentName={currentSection.getParentName}
            endpoint={currentSection.endpoint}
            transformToBackend={currentSection.transformToBackend}
            readOnly={currentSection.readOnly}
            onRefresh={fetchAllData}
          />
        )}
      </main>
    </div>
  );
};

interface CrudSectionProps {
  title: string;
  data: any[];
  setData?: React.Dispatch<React.SetStateAction<any[]>>;
  parentList?: any[];
  parentIdKey?: string;
  parentLabelKey?: string;
  parentForeignKey?: string;
  getParentName?: (code: string) => string;
  endpoint?: { bulkAdd: string; deleteAll: string };
  transformToBackend?: (item: any) => any;
  readOnly?: boolean;
  onRefresh: () => Promise<void>;
}

const CrudSection = ({
  title,
  data,
  setData,
  parentList,
  parentIdKey = "code",
  parentLabelKey = "name",
  parentForeignKey,
  getParentName,
  endpoint,
  transformToBackend,
  readOnly = false,
  onRefresh,
}: CrudSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ code: "", name: "" });
  const [modalError, setModalError] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const itemsPerPage = showAll ? data.length : 10;
  const filteredData = data.filter(
    (item) =>
      (item.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    if (totalPages === 0) setCurrentPage(1);
  }, [filteredData.length, totalPages]);

  const handleOpenModal = (item: any = null) => {
    if (readOnly) return;
    if (
      item &&
      !window.confirm(`Edit this ${title.slice(0, -1).toLowerCase()}?`)
    )
      return;

    setEditingItem(item);
    setFormData(
      item
        ? { ...item }
        : {
            code: "",
            name: "",
            ...(parentForeignKey && parentList?.length
              ? { [parentForeignKey]: parentList[0][parentIdKey] || "" }
              : {}),
          }
    );
    setModalError("");
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.code?.trim() || !formData.name?.trim()) {
      setModalError("Code and Name are required.");
      return false;
    }
    const duplicate = data.find(
      (d) =>
        d.code === formData.code &&
        (!editingItem || d.code !== editingItem.code)
    );
    if (duplicate) {
      setModalError("This code already exists.");
      return false;
    }
    if (parentForeignKey && !formData[parentForeignKey]) {
      setModalError("Please select a parent.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (
      !setData ||
      !endpoint?.bulkAdd ||
      !transformToBackend ||
      !validateForm()
    )
      return;

    setOperationLoading(true);
    setModalError("");

    try {
      const itemToSend = transformToBackend(formData);
      const payload = [itemToSend];

      // Because there is no PUT → delete all + add new (for simplicity)
      if (editingItem) {
        await apiService.delete(endpoint.deleteAll);
        await apiService.post(endpoint.bulkAdd, payload);
      } else {
        await apiService.post(endpoint.bulkAdd, payload);
      }

      await onRefresh();
      setShowModal(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Failed to save item. Please try again.";
      setModalError(msg);
      console.error(err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!endpoint?.deleteAll || readOnly) return;
    if (
      !window.confirm(
        `Delete ALL ${title.toLowerCase()}? This cannot be undone.`
      )
    )
      return;

    setOperationLoading(true);
    try {
      await apiService.delete(endpoint.deleteAll);
      await onRefresh();
    } catch (err: any) {
      setModalError("Failed to delete all items.");
      console.error(err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleIndividualDelete = () => {
    alert(
      "Individual delete is not supported by the current API.\n" +
        "Use 'Delete All' or ask the backend team to add DELETE /{code} endpoints."
    );
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          {title}
        </h2>

        <div className="flex flex-wrap gap-3">
          {!readOnly && (
            <>
              <button
                onClick={() => handleOpenModal()}
                disabled={operationLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              >
                <FaPlus /> Add {title.slice(0, -1)}
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={operationLoading || data.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              >
                <FaTrash /> Delete All
              </button>
            </>
          )}

          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-transform hover:scale-105"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>

          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition-transform hover:scale-105"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}{" "}
            {viewMode === "table" ? "Grid" : "Table"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder={`Search ${title} by code or name...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-4 text-left font-semibold">Code</th>
                <th className="p-4 text-left font-semibold">Name</th>
                {getParentName && (
                  <th className="p-4 text-left font-semibold">Parent</th>
                )}
                {!readOnly && (
                  <th className="p-4 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.code}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="p-4">{item.code}</td>
                  <td className="p-4">{item.name}</td>
                  {getParentName && (
                    <td className="p-4">
                      {getParentName(item[parentForeignKey || ""])}
                    </td>
                  )}
                  {!readOnly && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition"
                          title="Edit"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={handleIndividualDelete}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                          title="Delete (not supported individually)"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedData.map((item) => (
            <div
              key={item.code}
              className="p-5 rounded-xl bg-gray-100 dark:bg-gray-700 shadow hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="font-bold text-lg mb-1">
                {item.code} – {item.name}
              </div>
              {getParentName && (
                <div className="text-sm opacity-80 mb-3">
                  Parent: {getParentName(item[parentForeignKey || ""])}
                </div>
              )}
              {!readOnly && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={handleIndividualDelete}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!showAll && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} {title.slice(0, -1)}
            </h3>

            {modalError && (
              <div className="mb-5 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">
                {modalError}
              </div>
            )}

            <input
              type="text"
              name="code"
              value={formData.code || ""}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Code"
              disabled={!!editingItem}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />

            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Name"
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {parentForeignKey && parentList && (
              <select
                name={parentForeignKey}
                value={formData[parentForeignKey] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [parentForeignKey]: e.target.value,
                  })
                }
                className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select parent...</option>
                {parentList.map((p) => (
                  <option key={p[parentIdKey]} value={p[parentIdKey]}>
                    {p[parentLabelKey]}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={operationLoading}
                className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={operationLoading}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {operationLoading && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {editingItem ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarAdminPage;
