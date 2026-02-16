// src/pages/registrar/settings/ProgressionOfClassYears.jsx
import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaList,
  FaTh,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrashAlt,
  FaPlusCircle,
  FaMinusCircle,
} from "react-icons/fa";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import { useToast } from "@/hooks/use-toast";

const ProgressionOfClassYears = () => {
  const [progressions, setProgressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [lookupData, setLookupData] = useState({
    departments: [],
    classYears: [],
    semesters: []
  });
  const { toast } = useToast();

  //=======================================================================================
  // Instructions Component - With Shrink/Expand Toggle
  const InstructionsReminder = () => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg overflow-hidden transition-all duration-300">
        {/* Header - Always visible */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">
              Class Year Progression Guide
            </h3>
            {!isExpanded && (
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                (Click to expand)
              </span>
            )}
          </div>
          <button className="p-2 rounded-full hover:bg-blue-200/50 dark:hover:bg-gray-600 transition-colors">
            <svg 
              className={`w-5 h-5 text-blue-700 dark:text-blue-300 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 pt-2 border-t border-blue-200 dark:border-blue-800 animate-slide-down">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              {/* Department-Specific Progression */}
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  1
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">Department-Specific Progressions:</span>
                  <p className="mt-1">
                    Each department can have its own unique class year progression pattern. 
                    Example: Medicine might have <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">PC1 → PC2 → C1 → C2 → Intern</span>, 
                    while Nursing follows <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Year 1 → Year 2 → Year 3 → Year 4</span>.
                  </p>
                </div>
              </div>

              {/* Global Department */}
              <div className="flex items-start gap-3">
                <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  2
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">🌍 Global Department (Default Pattern):</span>
                  <p className="mt-1">
                    The <strong className="text-green-600 dark:text-green-400">"Global/General"</strong> department serves as the default progression. 
                    Most departments that follow the standard progression will use this global configuration.
                  </p>
                </div>
              </div>

              {/* When to Create Custom */}
              <div className="flex items-start gap-3">
                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  3
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">When to Create Custom Progressions:</span>
                  <p className="mt-1">
                    Create department-specific progression <strong className="text-purple-600 dark:text-purple-400">only when different from global</strong>.
                  </p>
                </div>
              </div>

              {/* How System Applies */}
              <div className="flex items-start gap-3">
                <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  4
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">How Progressions Are Applied:</span>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong className="text-orange-600 dark:text-orange-400">Students in specific departments</strong> → use department's custom progression</li>
                    <li><strong className="text-orange-600 dark:text-orange-400">Students in other departments</strong> → automatically use Global/General progression</li>
                  </ul>
                </div>
              </div>

              {/* Bulk Editing */}
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  5
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">✏️ Bulk Editing Mode:</span>
                  <p className="mt-1">
                    Click <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-full text-sm"><FaEdit className="text-xs" /> Edit Table</span> to enable Excel-like editing:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Edit multiple records at once</li>
                    <li>Department, Class Year, Semester become dropdowns</li>
                    <li>Use checkboxes for bulk deletion</li>
                    <li>Click <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-sm"><FaSave className="text-xs" /> Save Changes</span> to apply all edits</li>
                  </ul>
                </div>
              </div>

              {/* Quick Rules */}
              <div className="flex items-start gap-3">
                <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full p-2 mt-1 font-bold w-8 h-8 flex items-center justify-center">
                  6
                </span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">⚠️ Quick Rules:</span>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Sequence numbers must be <strong>unique within same department</strong></li>
                    <li><strong>Lower numbers = earlier stages</strong> (1 → 2 → 3)</li>
                    <li><strong>Cannot delete</strong> if students are currently in that class year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  //=======================================================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [progressionsRes, lookupRes] = await Promise.all([
        apiService.get(endPoints.progressionSequences, {
          sortBySequence: true
        }),
        apiService.get(endPoints.lookupsDropdown)
      ]);

      const transformed = progressionsRes.map(item => ({
        ...item,
        departmentName: item.departmentName || "Global/General",
        departmentId: item.departmentId || "global"
      }));

      setProgressions(transformed);
      setLookupData({
        departments: lookupRes.departments || [],
        classYears: lookupRes.classYears || [],
        semesters: lookupRes.semesters || []
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err?.response?.data?.error || "Failed to load data. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Failed to load data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      const initialEditData = {};
      progressions.forEach(item => {
        initialEditData[item.id] = {
          departmentId: item.departmentId,
          classYearId: item.classYearId,
          semesterId: item.semesterId,
          sequenceNumber: item.sequenceNumber,
          description: item.description || ''
        };
      });
      setEditedData(initialEditData);
    }
    setIsEditing(!isEditing);
    setSelectedRows(new Set());
  };

  const handleCellChange = (id, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === progressions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(progressions.map(p => p.id)));
    }
  };

  const handleSaveBulk = async () => {
    try {
      const updates = Object.entries(editedData)
        .filter(([id, data]) => {
          const original = progressions.find(p => p.id === parseInt(id));
          return JSON.stringify({
            departmentId: original.departmentId,
            classYearId: original.classYearId,
            semesterId: original.semesterId,
            sequenceNumber: original.sequenceNumber,
            description: original.description || ''
          }) !== JSON.stringify(data);
        })
        .map(([id, data]) => ({
          id: parseInt(id),
          departmentId: data.departmentId === "global" ? null : parseInt(data.departmentId),
          classYearId: parseInt(data.classYearId),
          semesterId: data.semesterId,
          sequenceNumber: parseInt(data.sequenceNumber),
          description: data.description || ''
        }));

      if (updates.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to save."
        });
        setIsEditing(false);
        return;
      }

      await apiService.put(endPoints.progressionSequences + '/bulk', updates);
      
      toast({
        title: "Success",
        description: `Successfully updated ${updates.length} progression(s).`
      });
      
      await fetchData();
      setIsEditing(false);
      setEditedData({});
    } catch (err) {
      console.error("Failed to save updates:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Failed to save updates"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one row to delete."
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.size} progression(s)?`)) {
      return;
    }

    try {
      const idsToDelete = Array.from(selectedRows);
      await apiService.delete(endPoints.progressionSequences + '/bulk', {
        data: idsToDelete
      });
      
      toast({
        title: "Success",
        description: `Successfully deleted ${selectedRows.size} progression(s).`
      });
      
      await fetchData();
      setSelectedRows(new Set());
    } catch (err) {
      console.error("Failed to delete:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Failed to delete progressions"
      });
    }
  };

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-blue-500 bg-clip-text text-transparent">
            DHFM Class Year Progression Editor
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-lg"
          >
            <FaPlusCircle /> Add New Progressions
          </button>
        </div>
      </header>
      
      <InstructionsReminder />
      
      <main>
        <CrudSection
          title="Class Year Progressions"
          data={progressions}
          loading={loading}
          error={error}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          editedData={editedData}
          onCellChange={handleCellChange}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onSaveBulk={handleSaveBulk}
          onBulkDelete={handleBulkDelete}
          lookupData={lookupData}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          onRefresh={fetchData}
        />
      </main>
    </div>
  );
};

// Add Multiple Progressions Modal
const AddMultipleProgressionsModal = ({ isOpen, onClose, lookupData, onRefresh }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [entries, setEntries] = useState([
    { classYearId: "", semesterId: "", sequenceNumber: "", description: "" }
  ]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleAddEntry = () => {
    setEntries([...entries, { classYearId: "", semesterId: "", sequenceNumber: "", description: "" }]);
  };

  const handleRemoveEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    if (!selectedDepartment) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a department"
      });
      return;
    }

    const validEntries = entries.filter(
      entry => entry.classYearId && entry.semesterId && entry.sequenceNumber
    );

    if (validEntries.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in at least one complete entry"
      });
      return;
    }

    const payload = validEntries.map(entry => ({
      departmentId: selectedDepartment === "global" ? null : parseInt(selectedDepartment),
      classYearId: parseInt(entry.classYearId),
      semesterId: entry.semesterId,
      sequenceNumber: parseInt(entry.sequenceNumber),
      description: entry.description || ""
    }));

    try {
      setSaving(true);
      const response = await apiService.post(endPoints.progressionSequences, payload);
      
      if (response.totalFailed > 0) {
        toast({
          variant: "destructive",
          title: `Partially Failed (${response.totalFailed}/${response.totalRequested})`,
          description: "Some entries failed to create. Check console for details."
        });
        console.error("Failed entries:", response.results);
      } else {
        toast({
          title: "Success",
          description: `Successfully created ${validEntries.length} progression(s).`
        });
      }
      
      onRefresh();
      onClose();
      setSelectedDepartment("");
      setEntries([{ classYearId: "", semesterId: "", sequenceNumber: "", description: "" }]);
    } catch (err) {
      console.error("Failed to create progressions:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Failed to create progressions"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedDepartment("");
    setEntries([{ classYearId: "", semesterId: "", sequenceNumber: "", description: "" }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl bg-white dark:bg-gray-800">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Add Multiple Progressions
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full md:w-96 p-3 border rounded-xl bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="global">🌍 Global/General</option>
              {lookupData.departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                      Class Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={entry.classYearId}
                      onChange={(e) => handleEntryChange(index, 'classYearId', e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {lookupData.classYears.map(cy => (
                        <option key={cy.id} value={cy.id}>
                          {cy.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={entry.semesterId}
                      onChange={(e) => handleEntryChange(index, 'semesterId', e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {lookupData.semesters.map(sem => (
                        <option key={sem.id} value={sem.id}>
                          {sem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                      Sequence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={entry.sequenceNumber}
                      onChange={(e) => handleEntryChange(index, 'sequenceNumber', e.target.value)}
                      min="1"
                      placeholder="1, 2, 3..."
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                      Description
                    </label>
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                      placeholder="Optional"
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {entries.length > 1 && (
                  <button
                    onClick={() => handleRemoveEntry(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove this entry"
                  >
                    <FaMinusCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddEntry}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <FaPlusCircle /> Add Another Entry
          </button>

          {entries.filter(e => e.classYearId && e.semesterId && e.sequenceNumber).length > 0 && (
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                Ready to create: <strong>{entries.filter(e => e.classYearId && e.semesterId && e.sequenceNumber).length}</strong> progression(s)
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave /> Create Progressions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CrudSection = ({
  title,
  data,
  loading,
  error,
  isEditing,
  onEditToggle,
  editedData,
  onCellChange,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onSaveBulk,
  onBulkDelete,
  lookupData,
  showAddModal,
  setShowAddModal,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ key: "sequenceNumber", direction: "asc" });
  const itemsPerPage = showAll ? data.length : 10;

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'departmentName' || sortConfig.key === 'classYearName' || sortConfig.key === 'semesterName') {
          aVal = aVal || '';
          bVal = bVal || '';
        }
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    if (isEditing) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortConfig.direction === "asc" ? 
      <FaSortUp className="inline ml-1 text-blue-500" /> : 
      <FaSortDown className="inline ml-1 text-blue-500" />;
  };

  const filteredData = sortedData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.departmentName?.toLowerCase() || '').includes(searchLower) ||
      (item.classYearName?.toLowerCase() || '').includes(searchLower) ||
      (item.semesterName?.toLowerCase() || '').includes(searchLower) ||
      item.sequenceNumber?.toString().includes(searchTerm) ||
      (item.description?.toLowerCase() || '').includes(searchLower)
    );
  });

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

  return (
    <>
      <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-blue-500 dark:bg-white bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex gap-3 flex-wrap">
            {isEditing ? (
              <>
                <button
                  onClick={onSaveBulk}
                  className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-md"
                >
                  <FaSave /> Save Changes
                </button>
                <button
                  onClick={onEditToggle}
                  className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-gray-500 hover:bg-gray-600 text-white shadow-md"
                >
                  <FaTimes /> Cancel
                </button>
                {selectedRows.size > 0 && (
                  <button
                    onClick={onBulkDelete}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow-md"
                  >
                    <FaTrashAlt /> Delete Selected ({selectedRows.size})
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onEditToggle}
                  className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                >
                  <FaEdit /> Edit Table
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
              </>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by Department, Class Year, Semester, Sequence Number, or Description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        />

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading progressions...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No progressions found.</p>
          </div>
        )}

        {!loading && viewMode === "table" && data.length > 0 && (
          <div className="overflow-x-auto rounded-lg mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {isEditing && (
                    <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginatedData.length}
                        onChange={onSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => requestSort("departmentName")}>
                    Department {getSortIcon("departmentName")}
                  </th>
                  <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => requestSort("classYearName")}>
                    Class Year {getSortIcon("classYearName")}
                  </th>
                  <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => requestSort("semesterName")}>
                    Semester {getSortIcon("semesterName")}
                  </th>
                  <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => requestSort("sequenceNumber")}>
                    Sequence {getSortIcon("sequenceNumber")}
                  </th>
                  <th className="p-4 text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const isSelected = selectedRows.has(item.id);
                  const editValues = editedData[item.id] || {};

                  return (
                    <tr
                      key={item.id}
                      className={`group transition-all duration-200 border-b border-gray-200 dark:border-gray-700 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-blue-50 dark:hover:bg-blue-900/50'
                      }`}
                    >
                      {isEditing && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectRow(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="p-4 font-medium">
                        {isEditing ? (
                          <select
                            value={editValues.departmentId || item.departmentId}
                            onChange={(e) => onCellChange(item.id, 'departmentId', e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="global">Global/General</option>
                            {lookupData.departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.departmentName
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <select
                            value={editValues.classYearId || item.classYearId}
                            onChange={(e) => onCellChange(item.id, 'classYearId', e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Class Year</option>
                            {lookupData.classYears.map(cy => (
                              <option key={cy.id} value={cy.id}>
                                {cy.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.classYearName
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <select
                            value={editValues.semesterId || item.semesterId}
                            onChange={(e) => onCellChange(item.id, 'semesterId', e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Semester</option>
                            {lookupData.semesters.map(sem => (
                              <option key={sem.id} value={sem.id}>
                                {sem.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.semesterName
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.sequenceNumber !== undefined ? editValues.sequenceNumber : item.sequenceNumber}
                            onChange={(e) => onCellChange(item.id, 'sequenceNumber', parseInt(e.target.value))}
                            min="1"
                            className="w-20 p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-center"
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                            {item.sequenceNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.description !== undefined ? editValues.description : item.description || ''}
                            onChange={(e) => onCellChange(item.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.description || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !isEditing && viewMode === "grid" && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg shadow-md group transition-all duration-200 transform hover:scale-105 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 border-2 border-transparent hover:border-blue-300 animate-slide-up relative"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-lg">
                    {item.sequenceNumber}
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-3 text-blue-600 dark:text-blue-400">
                  {item.departmentName}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.classYearName} • {item.semesterName}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !showAll && totalPages > 1 && (
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
      </div>

      <AddMultipleProgressionsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        lookupData={lookupData}
        onRefresh={onRefresh}
      />
    </>
  );
};

// Add this CSS to your global styles or component
const styles = `
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ProgressionOfClassYears;