// import React, { useState } from "react";
// import { FaEdit, FaTrash, FaPlus, FaSpinner, FaSearch } from "react-icons/fa";

// // Fake data (simulating what your backend would return)
// const FAKE_SOURCES = [
//   { sourceID: 1, sourceName: "Ministry of Education (MOE)" },
//   { sourceID: 2, sourceName: "National University Commission (NUC)" },
//   { sourceID: 3, sourceName: "World Health Organization (WHO)" },
//   {
//     sourceID: 4,
//     sourceName: "Joint Admissions and Matriculation Board (JAMB)",
//   },
//   { sourceID: 5, sourceName: "University Senate Curriculum Committee" },
//   { sourceID: 6, sourceName: "Faculty of Health Sciences" },
//   { sourceID: 7, sourceName: "Accreditation Council" },
//   { sourceID: 8, sourceName: "External Examiner Report" },
// ];

// const CourseSourcesEditor = () => {
//   const [sources, setSources] = useState(FAKE_SOURCES);
//   const [saving, setSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Simulate async delay
//   const delay = (ms: number) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

//   // Create new source
//   const createSource = async (sourceName: string) => {
//     await delay(600);
//     const newSource = {
//       sourceID: Math.max(...sources.map((s) => s.sourceID)) + 1,
//       sourceName: sourceName.trim(),
//     };
//     setSources((prev) => [newSource, ...prev]);
//     return newSource;
//   };

//   // Update source
//   const updateSource = async (id: number, sourceName: string) => {
//     await delay(600);
//     setSources((prev) =>
//       prev.map((s) =>
//         s.sourceID === id ? { ...s, sourceName: sourceName.trim() } : s
//       )
//     );
//   };

//   // Delete source
//   const deleteSource = async (id: number) => {
//     await delay(400);
//     setSources((prev) => prev.filter((s) => s.sourceID !== id));
//   };

//   const filteredSources = sources.filter(
//     (source) =>
//       source.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       source.sourceID.toString().includes(searchTerm)
//   );

//   return (
//     <div className="min-h-screen p-8 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       <header className="mb-12">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//           <div>
//             <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
//               Course Sources
//             </h1>
//             <p className="text-xl text-gray-600 dark:text-gray-400">
//               Manage course source references ({sources.length} total)
//             </p>
//           </div>
//           <button
//             onClick={() => document.getElementById("add-modal")?.showModal()}
//             disabled={saving}
//             className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-3"
//           >
//             <FaPlus className="text-xl" />
//             Add Source
//           </button>
//         </div>
//       </header>

//       {/* Search */}
//       <div className="mb-8">
//         <div className="relative max-w-md">
//           <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search sources by name or ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-800 transition-all duration-300"
//           />
//         </div>
//       </div>

//       {/* Sources Table */}
//       <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
//               <tr>
//                 <th className="px-8 py-6 text-left font-bold text-lg">ID</th>
//                 <th className="px-8 py-6 text-left font-bold text-lg">
//                   Source Name
//                 </th>
//                 <th className="px-8 py-6 text-right font-bold text-lg">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSources.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={3}
//                     className="px-8 py-20 text-center text-gray-500 dark:text-gray-400 text-lg"
//                   >
//                     {searchTerm
//                       ? "No sources match your search"
//                       : "No course sources found"}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredSources.map((source) => (
//                   <tr
//                     key={source.sourceID}
//                     className="border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
//                   >
//                     <td className="px-8 py-6 font-mono font-bold text-xl bg-indigo-50 dark:bg-indigo-900/50">
//                       {source.sourceID}
//                     </td>
//                     <td className="px-8 py-6 font-semibold text-lg max-w-md">
//                       {source.sourceName}
//                     </td>
//                     <td className="px-8 py-6 text-right">
//                       <div className="flex justify-end gap-3">
//                         <button
//                           onClick={() =>
//                             document
//                               .getElementById(`edit-modal-${source.sourceID}`)
//                               ?.showModal()
//                           }
//                           className="p-3 rounded-2xl text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
//                           title="Edit"
//                         >
//                           <FaEdit className="text-xl" />
//                         </button>
//                         <button
//                           onClick={async () => {
//                             if (confirm(`Delete "${source.sourceName}"?`)) {
//                               setSaving(true);
//                               await deleteSource(source.sourceID);
//                               setSaving(false);
//                             }
//                           }}
//                           disabled={saving}
//                           className="p-3 rounded-2xl text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
//                           title="Delete"
//                         >
//                           <FaTrash className="text-xl" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Modal */}
//       <dialog id="add-modal" className="backdrop:bg-black/50 backdrop-blur-sm">
//         <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
//           <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-center">
//             Add Course Source
//           </h3>
//           <form
//             onSubmit={async (e) => {
//               e.preventDefault();
//               const formData = new FormData(e.currentTarget);
//               const sourceName = formData.get("sourceName") as string;

//               if (!sourceName?.trim()) {
//                 alert("Source name is required");
//                 return;
//               }

//               setSaving(true);
//               try {
//                 await createSource(sourceName.trim());
//                 (e.target as HTMLFormElement).reset();
//                 (
//                   document.getElementById("add-modal") as HTMLDialogElement
//                 ).close();
//               } catch (err) {
//                 alert("Failed to create source");
//               } finally {
//                 setSaving(false);
//               }
//             }}
//           >
//             <div className="space-y-6">
//               <input
//                 name="sourceName"
//                 type="text"
//                 placeholder="e.g., WHO Guidelines"
//                 className="w-full p-5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg bg-gray-50 dark:bg-gray-700 transition-all"
//                 required
//                 maxLength={100}
//               />
//               <div className="flex gap-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     (
//                       document.getElementById("add-modal") as HTMLDialogElement
//                     )?.close()
//                   }
//                   className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-all text-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   {saving ? <FaSpinner className="animate-spin" /> : null}
//                   {saving ? "Creating..." : "Create Source"}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </dialog>

//       {/* Edit Modals */}
//       {sources.map((source) => (
//         <dialog
//           key={source.sourceID}
//           id={`edit-modal-${source.sourceID}`}
//           className="backdrop:bg-black/50 backdrop-blur-sm"
//         >
//           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
//             <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-center">
//               Edit Course Source
//             </h3>
//             <p className="text-center text-gray-600 dark:text-gray-400 mb-8 font-mono bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
//               ID:{" "}
//               <span className="font-bold text-indigo-600">
//                 {source.sourceID}
//               </span>
//             </p>
//             <form
//               onSubmit={async (e) => {
//                 e.preventDefault();
//                 const formData = new FormData(e.currentTarget);
//                 const sourceName = formData.get("sourceName") as string;

//                 if (!sourceName?.trim()) {
//                   alert("Source name is required");
//                   return;
//                 }

//                 setSaving(true);
//                 try {
//                   await updateSource(source.sourceID, sourceName.trim());
//                   (
//                     document.getElementById(
//                       `edit-modal-${source.sourceID}`
//                     ) as HTMLDialogElement
//                   ).close();
//                 } catch (err) {
//                   alert("Failed to update source");
//                 } finally {
//                   setSaving(false);
//                 }
//               }}
//             >
//               <div className="space-y-6">
//                 <input
//                   name="sourceName"
//                   type="text"
//                   defaultValue={source.sourceName}
//                   placeholder="Enter source name"
//                   className="w-full p-5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg bg-gray-50 dark:bg-gray-700 transition-all"
//                   required
//                   maxLength={100}
//                 />
//                 <div className="flex gap-4 pt-4">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       (
//                         document.getElementById(
//                           `edit-modal-${source.sourceID}`
//                         ) as HTMLDialogElement
//                       )?.close()
//                     }
//                     className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-all text-lg"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {saving ? <FaSpinner className="animate-spin" /> : null}
//                     {saving ? "Updating..." : "Update Source"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </dialog>
//       ))}
//     </div>
//   );
// };

// export default CourseSourcesEditor;
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaSearch } from "react-icons/fa";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
// ─── Assume these are already defined in your project ──────────────────────────
// import apiClient from "@/lib/apiClient";           // your axios/fetch wrapper
// Example shape (adjust to your actual implementation):

// const apiClient = {
//   get:    (url: string) => ...,
//   post:   (url: string, data: any) => ...,
//   patch:  (url: string, data: any) => ...,
//   delete: (url: string) => ...,
// };

interface CourseSource {
  sourceID: number;
  sourceName: string;
}

const CourseSourcesEditor = () => {
  const [sources, setSources] = useState<CourseSource[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all sources on mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(endPoints.courseSources);
        console.log(response, "response");
        setSources(response); // assuming axios-like → response.data
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load course sources");
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  // Create
  const createSource = async (sourceName: string): Promise<CourseSource> => {
    const trimmed = sourceName.trim();
    if (!trimmed) throw new Error("Source name is required");

    setSaving(true);
    try {
      const response = await apiService.post(endPoints.courseSources, {
        sourceName: trimmed,
      });

      // const newSource = response.data;
      const newSource = response;

      setSources((prev) => [newSource, ...prev]);
      return newSource;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create source";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Update (PATCH)
  const updateSource = async (
    id: number,
    sourceName: string
  ): Promise<void> => {
    const trimmed = sourceName.trim();
    if (!trimmed) throw new Error("Source name is required");

    setSaving(true);
    try {
      const response = await apiService.patch(
        `${endPoints.courseSources}/${id}`,
        {
          sourceName: trimmed,
        }
      );
      // const updated = response.data;
      const updated = response;

      setSources((prev) => prev.map((s) => (s.sourceID === id ? updated : s)));
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update source";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const deleteSource = async (id: number): Promise<void> => {
    setSaving(true);
    try {
      await apiService.delete(`${endPoints.courseSources}/${id}`);
      setSources((prev) => prev.filter((s) => s.sourceID !== id));
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to delete course source";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredSources = (sources ?? []).filter(
    (s) =>
      s.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sourceID.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Course Sources
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Manage reference sources ({sources.length} total)
            </p>
          </div>

          <button
            onClick={() => document.getElementById("add-modal")?.showModal()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus />
            Add New Source
          </button>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100/80 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-8 max-w-lg">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-5xl text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-8 py-5 text-left font-semibold text-base">
                    ID
                  </th>
                  <th className="px-8 py-5 text-left font-semibold text-base">
                    Source Name
                  </th>
                  <th className="px-8 py-5 text-right font-semibold text-base">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-16 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchTerm
                        ? "No matching sources found"
                        : "No course sources yet"}
                    </td>
                  </tr>
                ) : (
                  filteredSources.map((source) => (
                    <tr
                      key={source.sourceID}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <td className="px-8 py-5 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        {source.sourceID}
                      </td>
                      <td className="px-8 py-5 font-medium max-w-xl truncate">
                        {source.sourceName}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() =>
                              document
                                .getElementById(`edit-modal-${source.sourceID}`)
                                ?.showModal()
                            }
                            className="p-2.5 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                            title="Edit source"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                !confirm(
                                  `Delete "${source.sourceName}"? This cannot be undone.`
                                )
                              )
                                return;
                              try {
                                await deleteSource(source.sourceID);
                              } catch {}
                            }}
                            disabled={saving}
                            className="p-2.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-50"
                            title="Delete source"
                          >
                            <FaTrash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <dialog id="add-modal" className="backdrop:bg-black/60 backdrop-blur-sm">
        <AddEditModalContent
          title="Add New Course Source"
          initialValue=""
          onSubmit={createSource}
          onClose={() => document.getElementById("add-modal")?.close()}
          saving={saving}
        />
      </dialog>

      {/* Edit Modals – one per source */}
      {sources.map((source) => (
        <dialog
          key={source.sourceID}
          id={`edit-modal-${source.sourceID}`}
          className="backdrop:bg-black/60 backdrop-blur-sm"
        >
          <AddEditModalContent
            title="Edit Course Source"
            initialValue={source.sourceName}
            idInfo={`ID: ${source.sourceID}`}
            onSubmit={(name) => updateSource(source.sourceID, name)}
            onClose={() =>
              document.getElementById(`edit-modal-${source.sourceID}`)?.close()
            }
            saving={saving}
          />
        </dialog>
      ))}
    </div>
  );
};

// Reusable modal form component
interface ModalProps {
  title: string;
  initialValue: string;
  idInfo?: string;
  onSubmit: (name: string) => Promise<any>;
  onClose: () => void;
  saving: boolean;
}

const AddEditModalContent = ({
  title,
  initialValue,
  idInfo,
  onSubmit,
  onClose,
  saving,
}: ModalProps) => {
  const [name, setName] = useState(initialValue);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await onSubmit(name);
      onClose();
      setName("");
    } catch (err: any) {
      setFormError(err.message || "Operation failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent text-center mb-6">
        {title}
      </h3>

      {idInfo && (
        <p className="text-center text-sm font-mono text-gray-600 dark:text-gray-400 mb-6">
          {idInfo}
        </p>
      )}

      {formError && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200 text-center">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., National Universities Commission (NUC)"
          className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          maxLength={100}
          required
        />

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <FaSpinner className="animate-spin" />}
            {saving ? "Saving..." : title.includes("Add") ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseSourcesEditor;
