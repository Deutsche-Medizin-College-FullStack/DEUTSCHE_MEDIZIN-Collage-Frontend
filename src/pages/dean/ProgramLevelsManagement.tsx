"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

type ProgramLevel = {
  code: string;
  name: string;
  remark?: string;
  active: boolean;
};

export default function ProgramLevelsManagement() {
  const navigate = useNavigate();

  const [programLevels, setProgramLevels] = useState<ProgramLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for create / edit
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    remark: "",
    active: true,
  });

  const fetchProgramLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(endPoints.programLevels);
      setProgramLevels(res.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to load program levels. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramLevels();
  }, []);

  const handleCreateNew = () => {
    setFormMode("create");
    setCurrentCode("");
    setFormData({ code: "", name: "", remark: "", active: true });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (level: ProgramLevel) => {
    setFormMode("edit");
    setCurrentCode(level.code);
    setFormData({
      code: level.code,
      name: level.name,
      remark: level.remark || "",
      active: level.active,
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete program level "${code}"?`))
      return;

    setSaving(true);
    try {
      await apiClient.delete(endPoints.programLevels + "/" + code);
      setSuccess(`Program level "${code}" deleted successfully`);
      await fetchProgramLevels();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete program level");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      setError("Code and Name are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formMode === "create") {
        const res = await apiClient.post(endPoints.programLevels, {
          code: formData.code.trim(),
          name: formData.name.trim(),
          remark: formData.remark.trim() || undefined,
        });
        setSuccess("Program level created successfully");
      } else if (formMode === "edit" && currentCode) {
        const payload: any = {
          name: formData.name.trim(),
          remark: formData.remark.trim() || undefined,
          active: formData.active,
        };
        await apiClient.put(
          endPoints.programLevels + "/" + currentCode,
          payload
        );

        setSuccess("Program level updated successfully");
      }

      setFormMode(null);
      await fetchProgramLevels();
    } catch (err: any) {
      console.log(
        formData.code.trim(),
        formData.name.trim(),
        formData.remark.trim() || undefined
      );
      console.log(err, "can't create a program level");
      setError(
        err.response?.data?.error || "Operation failed. Please check input."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormMode(null);
    setError(null);
    setSuccess(null);
  };

  const handleRetry = () => {
    fetchProgramLevels();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64 bg-gray-200 dark:bg-gray-700" />
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-64 w-full bg-gray-200 dark:bg-gray-700" />
              </div>
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
              Program Levels
            </h1>
          </div>

          {formMode === null && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Level
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

        {/* Form - Create / Edit */}
        {formMode && (
          <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
                {formMode === "create"
                  ? "Create New Program Level"
                  : `Edit ${currentCode}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g. DEG, DIP, MAS"
                    disabled={formMode === "edit"}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Bachelor's Degree"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark" className="text-gray-700 dark:text-gray-300">Remark / Description</Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="Optional description or notes..."
                  rows={3}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
                <Label htmlFor="active" className="text-gray-700 dark:text-gray-300">Active / Visible</Label>
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

        {/* List / Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              All Program Levels ({programLevels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programLevels.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No program levels found</p>
                <p className="text-sm mt-2">
                  Click "Create New Level" to add one
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-700">
                    <TableRow>
                      <TableHead className="text-gray-700 dark:text-gray-300">Code</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Remark</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programLevels.map((level) => (
                      <TableRow 
                        key={level.code}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {level.code}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{level.name}</TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400">
                          {level.remark || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              level.active 
                                ? "bg-green-600 hover:bg-green-600 text-white dark:bg-green-700 dark:hover:bg-green-600"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }
                          >
                            {level.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(level)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(level.code)}
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