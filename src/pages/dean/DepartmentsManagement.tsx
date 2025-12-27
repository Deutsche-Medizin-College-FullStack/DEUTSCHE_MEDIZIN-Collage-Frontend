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
  Building,
  Filter,
} from "lucide-react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

type Department = {
  dptID: number;
  deptName: string;
  totalCrHr: number | null;
  departmentCode: string;
  programModality: {
    modalityCode: string;
    modality: string;
    programLevel: {
      code: string;
      name: string;
      active: boolean;
    } | null;
  };
  programLevel: null;
};

type LookupProgramLevel = {
  id: string;
  name: string;
};

type LookupProgramModality = {
  id: string;
  name: string;
  programLevelId: string;
};

export default function DepartmentsManagement() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [lookupProgramLevels, setLookupProgramLevels] = useState<
    LookupProgramLevel[]
  >([]);
  const [lookupProgramModalities, setLookupProgramModalities] = useState<
    LookupProgramModality[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    deptName: "",
    totalCrHr: "",
    departmentCode: "",
    modalityCode: "",
    programLevelCode: "",
  });

  const [filterType, setFilterType] = useState<"none" | "modality" | "level">(
    "none"
  );
  const [filterValue, setFilterValue] = useState("");

  // Fetch departments + lookups
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch departments
      const deptsRes = await apiClient.get(endPoints.departments);
      setDepartments(deptsRes.data || []);

      // Fetch lookups
      const lookupRes = await apiClient.get(endPoints.lookupsDropdown);
      const data = lookupRes.data;

      if (data?.programLevels) {
        setLookupProgramLevels(data.programLevels);
      }
      if (data?.programModalities) {
        setLookupProgramModalities(data.programModalities);
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
    setEditId(null);
    setFormData({
      deptName: "",
      totalCrHr: "",
      departmentCode: "",
      modalityCode: "",
      programLevelCode: "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setFormMode("create");
  };

  const handleEdit = (dept: Department) => {
    setFormMode("edit");
    setEditId(dept.dptID);
    setFormData({
      deptName: dept.deptName,
      totalCrHr: dept.totalCrHr?.toString() || "",
      departmentCode: dept.departmentCode,
      modalityCode: dept.programModality?.modalityCode || "",
      programLevelCode: dept.programModality?.programLevel?.code || "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete department ID ${id}? This cannot be undone.`)) return;

    setSaving(true);
    try {
      await apiClient.delete(`${endPoints.departments}/${id}`);
      setSuccess("Department deleted successfully");
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.deptName.trim() ||
      !formData.departmentCode.trim() ||
      !formData.modalityCode.trim() ||
      !formData.programLevelCode.trim()
    ) {
      setError("Required fields are missing");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        deptName: formData.deptName.trim(),
        totalCrHr: formData.totalCrHr.trim()
          ? Number(formData.totalCrHr.trim())
          : null,
        departmentCode: formData.departmentCode.trim(),
        modalityCode: formData.modalityCode.trim(),
        programLevelCode: formData.programLevelCode.trim(),
      };

      if (formMode === "create") {
        await apiClient.post(`${endPoints.departments}/single`, payload);
        setSuccess("Department created successfully");
      } else if (formMode === "edit" && editId) {
        await apiClient.put(`${endPoints.departments}/${editId}`, {
          deptName: payload.deptName,
          totalCrHr: payload.totalCrHr,
          modalityCode: payload.modalityCode,
          programLevelCode: payload.programLevelCode,
        });
        setSuccess("Department updated successfully");
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

  const handleFilter = () => {
    if (filterType === "none") {
      fetchData();
    } else if (filterType === "modality" && filterValue.trim()) {
      fetchData(
        `${endPoints.departments}/modality/${filterValue.trim().toUpperCase()}`
      );
    } else if (filterType === "level" && filterValue.trim()) {
      fetchData(
        `${endPoints.departments}/level/${filterValue.trim().toUpperCase()}`
      );
    }
  };

  const handleCancel = () => resetForm();

  const handleRetry = () => fetchData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="p-12 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
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
            <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          </div>

          {formMode === null && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
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

        {/* Filter */}
        {formMode === null && (
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Filter By</Label>
                  <Select
                    value={filterType}
                    onValueChange={(v) => {
                      setFilterType(v as any);
                      setFilterValue("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="modality">Modality Code</SelectItem>
                      <SelectItem value="level">Program Level Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterType !== "none" && (
                  <div className="flex-1 space-y-2">
                    <Label>
                      {filterType === "modality"
                        ? "Modality Code"
                        : "Level Code"}
                    </Label>
                    <Input
                      value={filterValue}
                      onChange={(e) =>
                        setFilterValue(e.target.value.toUpperCase())
                      }
                      placeholder={
                        filterType === "modality" ? "e.g. REG" : "e.g. DEG"
                      }
                    />
                  </div>
                )}

                <Button onClick={handleFilter} variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {formMode && (
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary">
                <Building className="h-6 w-6" />
                {formMode === "create"
                  ? "Add New Department"
                  : `Edit Department #${editId}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Department Name *</Label>
                  <Input
                    value={formData.deptName}
                    onChange={(e) =>
                      setFormData({ ...formData, deptName: e.target.value })
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Credit Hours</Label>
                  <Input
                    type="number"
                    value={formData.totalCrHr}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCrHr: e.target.value })
                    }
                    placeholder="e.g. 140 (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Department Code *</Label>
                  <Input
                    value={formData.departmentCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. CS"
                    disabled={formMode === "edit"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Modality *</Label>
                  <Select
                    value={formData.modalityCode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, modalityCode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookupProgramModalities.length === 0 ? (
                        <SelectItem disabled>
                          No modalities available
                        </SelectItem>
                      ) : (
                        lookupProgramModalities.map((mod) => (
                          <SelectItem key={mod.id} value={mod.id}>
                            {mod.id} — {mod.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program Level *</Label>
                  <Select
                    value={formData.programLevelCode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, programLevelCode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookupProgramLevels.length === 0 ? (
                        <SelectItem disabled>No levels available</SelectItem>
                      ) : (
                        lookupProgramLevels.map((lvl) => (
                          <SelectItem key={lvl.id} value={lvl.id}>
                            {lvl.id} — {lvl.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
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

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              All Departments ({departments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No departments found</p>
                <p className="text-sm mt-2">
                  {error
                    ? "Error loading list."
                    : "Add one using the button above."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Cr.Hr</TableHead>
                      <TableHead>Modality</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.dptID}>
                        <TableCell className="font-medium">
                          {dept.departmentCode}
                        </TableCell>
                        <TableCell>{dept.deptName}</TableCell>
                        <TableCell>{dept.totalCrHr ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {dept.programModality?.modality ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {dept.programModality?.programLevel?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dept)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(dept.dptID)}
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
