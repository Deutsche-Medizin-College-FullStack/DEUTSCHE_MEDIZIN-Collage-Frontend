"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

type ProgramModality = {
  modalityCode: string;
  modality: string;
  programLevelCode: string;
};

type LookupProgramLevel = {
  id: string;
  name: string;
};

export default function ProgramModalitiesManagement() {
  const navigate = useNavigate();

  const [modalities, setModalities] = useState<ProgramModality[]>([]);
  const [lookupProgramLevels, setLookupProgramLevels] = useState<
    LookupProgramLevel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form modes
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editCode, setEditCode] = useState<string>("");

  // Single form
  const [formData, setFormData] = useState({
    modalityCode: "",
    modality: "",
    programLevelCode: "",
  });

  // Fetch modalities + lookup data (program levels for dropdown)
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch actual modalities
      const modalitiesRes = await apiClient.get(endPoints.programModalities);
      setModalities(modalitiesRes.data || []);

      // Fetch lookup data for program level dropdown
      const lookupRes = await apiClient.get(endPoints.lookupsDropdown);
      const lookupData = lookupRes.data;
      if (lookupData?.programLevels) {
        setLookupProgramLevels(lookupData.programLevels);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to load data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormMode(null);
    setEditCode("");
    setFormData({ modalityCode: "", modality: "", programLevelCode: "" });
    setError(null);
    setSuccess(null);
  };

  const handleCreateSingle = () => {
    resetForm();
    setFormMode("create");
  };

  const handleEdit = (mod: ProgramModality) => {
    setFormMode("edit");
    setEditCode(mod.modalityCode);
    setFormData({
      modalityCode: mod.modalityCode,
      modality: mod.modality,
      programLevelCode: mod.programLevelCode,
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete modality "${code}"? This cannot be undone.`)) return;

    setSaving(true);
    try {
      await apiClient.delete(endPoints.programModalities + "/" + code);
      setSuccess(`"${code}" deleted successfully`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.modalityCode.trim() ||
      !formData.modality.trim() ||
      !formData.programLevelCode.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formMode === "create") {
        await apiClient.post(endPoints.programModalities, {
          modalityCode: formData.modalityCode.trim(),
          modality: formData.modality.trim(),
          programLevelCode: formData.programLevelCode.trim(),
        });
        setSuccess("Modality created successfully");
      } else if (formMode === "edit" && editCode) {
        await apiClient.put(endPoints.programModalities + "/" + editCode, {
          modalityCode: formData.modalityCode.trim(),
          modality: formData.modality.trim(),
          programLevelCode: formData.programLevelCode.trim(),
        });
        setSuccess("Modality updated successfully");
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleRetry = () => fetchData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64 bg-gray-200 dark:bg-gray-700" />
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 space-y-4">
              <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Program Modalities
            </h1>
          </div>

          {formMode === null && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={handleCreateSingle}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Modality
            </Button>
          )}
        </div>

        {/* Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <AlertDescription className="text-green-800 dark:text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap text-red-700 dark:text-red-300">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Single Create / Edit Form */}
        {(formMode === "create" || formMode === "edit") && (
          <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
                {formMode === "create"
                  ? "Create Program Modality"
                  : `Edit ${editCode}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Modality Code *</Label>
                  <Input
                    value={formData.modalityCode}
                    onChange={(e) =>
                      setFormData({ ...formData, modalityCode: e.target.value })
                    }
                    placeholder="e.g. REG-DEG, EXT-DIP"
                    disabled={formMode === "edit"}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Modality Name *</Label>
                  <Input
                    value={formData.modality}
                    onChange={(e) =>
                      setFormData({ ...formData, modality: e.target.value })
                    }
                    placeholder="e.g. Regular, Extension, Summer"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Program Level *</Label>
                  <Select
                    value={formData.programLevelCode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, programLevelCode: value })
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select program level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      {lookupProgramLevels.length === 0 ? (
                        <SelectItem value="no-levels" disabled className="text-gray-500 dark:text-gray-400">
                          No program levels available
                        </SelectItem>
                      ) : (
                        lookupProgramLevels.map((level) => (
                          <SelectItem 
                            key={level.id} 
                            value={level.id}
                            className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {level.id} — {level.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              All Program Modalities ({modalities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modalities.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No modalities found</p>
                <p className="text-sm mt-2">
                  Click "Create New Modality" to add one
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-700">
                    <TableRow>
                      <TableHead className="text-gray-700 dark:text-gray-300">Modality Code</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Modality</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Program Level</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalities.map((mod) => (
                      <TableRow 
                        key={mod.modalityCode}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {mod.modalityCode}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{mod.modality}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            {mod.programLevelCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(mod)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(mod.modalityCode)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}