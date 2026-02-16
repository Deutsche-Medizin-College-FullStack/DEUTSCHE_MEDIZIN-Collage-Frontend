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
