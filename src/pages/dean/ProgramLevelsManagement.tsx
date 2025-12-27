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
      await apiClient.delete(`/api/program-levels/${code}`);
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
        // await apiClient.put(`/api/program-levels/${currentCode}`, payload);
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
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="p-12">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Program Levels
            </h1>
          </div>

          {formMode === null && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Level
            </Button>
          )}
        </div>

        {/* Messages */}
        {success && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <AlertDescription className="text-foreground">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
              {error}
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Form - Create / Edit */}
        {formMode && (
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary">
                <BookOpen className="h-6 w-6" />
                {formMode === "create"
                  ? "Create New Program Level"
                  : `Edit ${currentCode}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g. DEG, DIP, MAS"
                    disabled={formMode === "edit"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Bachelor's Degree"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remark / Description</Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="Optional description or notes..."
                  rows={3}
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
                <Label htmlFor="active">Active / Visible</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* List / Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              All Program Levels ({programLevels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programLevels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No program levels found</p>
                <p className="text-sm mt-2">
                  Click "Create New Level" to add one
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programLevels.map((level) => (
                      <TableRow key={level.code}>
                        <TableCell className="font-medium">
                          {level.code}
                        </TableCell>
                        <TableCell>{level.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {level.remark || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={level.active ? "default" : "secondary"}
                            className={
                              level.active
                                ? "bg-green-600 hover:bg-green-600"
                                : ""
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
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
