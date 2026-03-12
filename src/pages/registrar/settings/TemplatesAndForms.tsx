import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaSpinner,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaRegFile,
  FaCalendarAlt,
  FaTimes,
  FaCheck,
  FaUpload,
} from "react-icons/fa";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import apiClient from "@/components/api/apiClient";
import { useToast } from "@/hooks/use-toast";

type FormTemplate = {
  id: number;
  name: string;
  description: string;
  forRoles: string[];
  createdAt: string;
  updatedAt: string;
};

// All available roles in the system
const ALL_ROLES = [
  "STUDENT",
  "TEACHER",
  "DEPARTMENT_HEAD",
  "REGISTRAR",
  "FINANCIAL_STAFF",
  "VICE_DEAN",
  "DEAN",
  "GENERAL_MANAGER"
];

const TemplatesAndForms = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data on mount
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(endPoints.formTemplates || "/registrar/form-templates");
      setTemplates(response);
    } catch (err: any) {
      console.error("Failed to fetch templates:", err);
      setError("Failed to load templates. Please try again later.");
      
      // For demo purposes, use mock data if API fails
      const mockData: FormTemplate[] = [
        {
          id: 1,
          name: "withdrawal-request",
          description: "Official student withdrawal application form",
          forRoles: ["STUDENT"],
          createdAt: "2025-02-07T16:45:23.123",
          updatedAt: "2025-02-07T17:12:45.789"
        },
        {
          id: 2,
          name: "grade-change-request",
          description: "Request to change a student's grade",
          forRoles: ["TEACHER", "DEPARTMENT_HEAD"],
          createdAt: "2025-01-15T09:30:00.000",
          updatedAt: "2025-01-15T09:30:00.000"
        },
        {
          id: 3,
          name: "leave-of-absence",
          description: "Application for temporary leave of absence",
          forRoles: ["STUDENT", "TEACHER"],
          createdAt: "2025-02-09T10:15:00.000",
          updatedAt: "2025-02-09T10:15:00.000"
        },
        {
          id: 4,
          name: "transcript-request",
          description: "Request for official academic transcript",
          forRoles: ["STUDENT", "REGISTRAR"],
          createdAt: "2024-12-10T08:20:00.000",
          updatedAt: "2024-12-10T08:20:00.000"
        },
        {
          id: 5,
          name: "course-syllabus-template",
          description: "Standard template for course syllabus",
          forRoles: ["TEACHER", "DEPARTMENT_HEAD"],
          createdAt: "2025-02-01T14:30:00.000",
          updatedAt: "2025-02-05T11:20:00.000"
        }
      ];
      setTemplates(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Instructions Component
  const InstructionsReminder = () => (
    <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg">
      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-3">
        <span className="text-3xl">📋</span> Templates & Forms Management Instructions
      </h3>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="flex items-start gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mt-1">
            1
          </span>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Purpose:</span>
            <p>View, download, edit, delete, and create new form templates.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mt-1">
            2
          </span>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Add New Template:</span>
            <p>Click the "Add Template" button to create a new form. Name and PDF file are required.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mt-1">
            3
          </span>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">File Upload:</span>
            <p>Only PDF files are allowed. Maximum file size is 5MB.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mt-1">
            4
          </span>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Role Selection:</span>
            <p>Select which user roles can access each template. Multiple roles can be selected.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    if (diffInSeconds < 60) return 'just now';
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
        <span className="text-xl">Loading templates...</span>
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
      <InstructionsReminder />

      <header className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DHMC Templates & Forms
          </h1>
          <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
            ({templates.length} templates available)
          </p>
        </div>
      </header>
      
      <main>
        <CrudSection
          title="Form Templates"
          data={templates}
          setData={setTemplates}
          getRelativeTime={getRelativeTime}
          onRefresh={fetchTemplates}
        />
      </main>
    </div>
  );
};

// Helper function to get file icon based on template name
const getFileIcon = (templateName: string) => {
  const name = templateName.toLowerCase();
  if (name.includes('pdf') || name.includes('form')) return <FaFilePdf className="text-red-500" />;
  if (name.includes('doc') || name.includes('word')) return <FaFileWord className="text-blue-500" />;
  if (name.includes('xls') || name.includes('excel')) return <FaFileExcel className="text-green-500" />;
  return <FaRegFile className="text-gray-500" />;
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Reusable Template Modal Component
const TemplateModal = ({
  isOpen,
  onClose,
  template,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  template?: FormTemplate | null;
  onSave: (formData: { name: string; description: string; forRoles: string[]; file: File | null }) => Promise<void>;
  saving: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    forRoles: [] as string[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Reset form when modal opens/closes or template changes
  useEffect(() => {
    if (isOpen) {
      if (template) {
        // Edit mode
        setFormData({
          name: template.name,
          description: template.description || "",
          forRoles: [...template.forRoles],
        });
      } else {
        // Add mode
        setFormData({
          name: "",
          description: "",
          forRoles: [],
        });
      }
      setSelectedFile(null);
    }
  }, [isOpen, template]);

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const isSelected = prev.forRoles.includes(role);
      return {
        ...prev,
        forRoles: isSelected 
          ? prev.forRoles.filter(r => r !== role)
          : [...prev.forRoles, role]
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Only PDF files are allowed.",
      });
      e.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "File size exceeds 5MB limit.",
      });
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Template name is required.",
      });
      return;
    }

    // For add mode, file is required
    if (!template && !selectedFile) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "PDF file is required for new templates.",
      });
      return;
    }

    if (formData.forRoles.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one role must be selected.",
      });
      return;
    }

    await onSave({
      name: formData.name,
      description: formData.description,
      forRoles: formData.forRoles,
      file: selectedFile,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
            {template ? "Edit Template" : "Add New Template"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template ID Display (only for edit mode) */}
          {template && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Template ID:</span>
              <span className="ml-2 font-mono text-lg font-bold">#{template.id}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
              placeholder="Enter template name"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
              placeholder="Enter template description"
            />
          </div>

          {/* Roles Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allowed Roles * (Select at least one)
            </label>
            <div className="grid grid-cols-2 gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
              {ALL_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.forRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{role.replace('_', ' ')}</span>
                  {formData.forRoles.includes(role) && (
                    <FaCheck className="w-3 h-3 text-green-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {template ? "Upload New PDF (Optional)" : "PDF File *"}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedFile ? selectedFile.name : (template ? 'Click to select a new PDF file (optional)' : 'Click to select a PDF file')}
                </span>
                {selectedFile && (
                  <span className="text-xs text-gray-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Only PDF files allowed. Maximum size: 5MB
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin w-5 h-5" />
                  Saving...
                </>
              ) : (
                template ? "Save Changes" : "Create Template"
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
  setData,
  getRelativeTime,
  onRefresh,
}: {
  title: string;
  data: FormTemplate[];
  setData: React.Dispatch<React.SetStateAction<FormTemplate[]>>;
  getRelativeTime: (date: string) => string;
  onRefresh: () => Promise<void>;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const itemsPerPage = showAll ? data.length : 10;

  // Get unique roles from all templates
  const allRoles = Array.from(
    new Set(data.flatMap(template => template.forRoles))
  ).sort();

  // Filter by search term and role
  const filteredData = data
    .filter(
      (item) =>
        item.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      selectedRole ? item.forRoles.includes(selectedRole) : true
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showAll, selectedRole]);

  // Pagination update
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, currentPage, totalPages, showAll]);

  const handleDownload = async (template: FormTemplate) => {
    try {
      setDownloadingId(template.id);
      
      // Use apiClient for download
      const response = await apiClient.get(`/auth/form-templates/${template.id}/download`, {
        responseType: 'blob',
      });

      // Get filename from Content-Disposition header or use template name
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${template.name}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Downloading ${template.name}...`,
      });

    } catch (err: any) {
      console.error("Download failed:", err);
      
      // Handle error response
      if (err.response) {
        if (err.response.status === 403) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: err.response.data?.error || "You don't have permission to download this form.",
          });
        } else if (err.response.status === 404) {
          toast({
            variant: "destructive",
            title: "Not Found",
            description: err.response.data?.error || "Form template not found.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Download Failed",
            description: err.response.data?.error || "Failed to download the form.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: err.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEdit = (template: FormTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const template = data.find(t => t.id === id);
    if (!template) return;
    
    if (!window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      
      // Use apiService for delete
      await apiService.delete(`/registrar/form-templates/${id}`);
      
      // Refresh data
      await onRefresh();
      
      toast({
        title: "Success",
        description: "Form template deleted successfully.",
      });

    } catch (err: any) {
      console.error("Delete failed:", err);
      
      // Handle error response
      if (err.response) {
        if (err.response.status === 403) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: err.response.data?.error || "You don't have permission to delete this form.",
          });
        } else if (err.response.status === 404) {
          toast({
            variant: "destructive",
            title: "Not Found",
            description: err.response.data?.error || "Form template not found.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Delete Failed",
            description: err.response.data?.error || "Failed to delete the form.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: err.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (formData: { name: string; description: string; forRoles: string[]; file: File | null }) => {
    try {
      setSaving(true);

      const data = new FormData();
      
      // Add file if present (required for new, optional for edit)
      if (formData.file) {
        data.append('file', formData.file);
      }
      
      // Add JSON parts with explicit Content-Type
      data.append('name', new Blob([JSON.stringify(formData.name)], { type: 'application/json' }));
      data.append('description', new Blob([JSON.stringify(formData.description)], { type: 'application/json' }));
      data.append('forRoles', new Blob([JSON.stringify(formData.forRoles)], { type: 'application/json' }));

      if (editingTemplate) {
        // UPDATE
        const response = await apiClient.put(
          `/registrar/form-templates/${editingTemplate.id}`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        toast({
          title: "Success",
          description: response.data?.message || "Template updated successfully.",
        });
      } else {
        // CREATE NEW
        const response = await apiClient.post(
          `/registrar/form-templates`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        toast({
          title: "Success",
          description: response.data?.message || "Template created successfully.",
        });
      }

      // Refresh data
      await onRefresh();
      setShowModal(false);

    } catch (err: any) {
      console.error("Save failed:", err);
      
      // Handle error response
      if (err.response) {
        if (err.response.status === 400) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: err.response.data?.error || "Invalid data provided.",
          });
        } else if (err.response.status === 403) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: err.response.data?.error || "You don't have permission to perform this action.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: err.response.data?.error || "Failed to save the template.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: err.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title} ({filteredData.length})
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-transform duration-200 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
          >
            <FaPlus /> Add Template
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search templates by ID, name, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
        />
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full sm:w-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
        >
          <option value="">All Roles</option>
          {allRoles.map((role) => (
            <option key={role} value={role}>
              {role.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Description</th>
                <th className="p-4 text-left font-semibold">For Roles</th>
                <th className="p-4 text-left font-semibold">Created</th>
                <th className="p-4 text-left font-semibold">Updated</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                  }`}
                >
                  <td className="p-4">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm">
                      #{item.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.name)}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={item.description}>
                      {item.description}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.forRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800"
                        >
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm" title={formatDate(item.createdAt)}>
                      <FaCalendarAlt className="text-gray-400 text-xs" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {getRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm" title={formatDate(item.updatedAt)}>
                      <FaCalendarAlt className="text-gray-400 text-xs" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {getRelativeTime(item.updatedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all group relative"
                        title="Edit template"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Edit template
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group relative disabled:opacity-50"
                        title="Download this template or form"
                      >
                        {downloadingId === item.id ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaDownload className="w-4 h-4" />
                        )}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Download this template or form
                        </span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group relative disabled:opacity-50"
                        title="Delete template"
                      >
                        {deletingId === item.id ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Delete template
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-lg transition-all hover:border-blue-200 dark:hover:border-blue-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {getFileIcon(item.name)}
                  <span className="font-bold text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                    #{item.id}
                  </span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {item.description}
              </p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Available for:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.forRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800"
                      >
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                  <div className="flex items-center gap-1" title={formatDate(item.createdAt)}>
                    <FaCalendarAlt className="text-xs" />
                    <span>Created: {getRelativeTime(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1" title={formatDate(item.updatedAt)}>
                    <FaCalendarAlt className="text-xs" />
                    <span>Updated: {getRelativeTime(item.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2.5 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all group relative"
                  title="Edit template"
                >
                  <FaEdit className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Edit template
                  </span>
                </button>

                <button
                  onClick={() => handleDownload(item)}
                  disabled={downloadingId === item.id}
                  className="p-2.5 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group relative disabled:opacity-50"
                  title="Download this template or form"
                >
                  {downloadingId === item.id ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaDownload className="w-4 h-4" />
                  )}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Download this template or form
                  </span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group relative disabled:opacity-50"
                  title="Delete template"
                >
                  {deletingId === item.id ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaTrash className="w-4 h-4" />
                  )}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Delete template
                  </span>
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

      {/* Reusable Modal for Add/Edit */}
      <TemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={editingTemplate}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
};

export default TemplatesAndForms;