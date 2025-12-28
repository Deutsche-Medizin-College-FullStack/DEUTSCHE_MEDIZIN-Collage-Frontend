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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Filter, RefreshCw } from "lucide-react";
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
};

export default function ViceDeanDepartmentsOverview() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<"none" | "modality" | "level">(
    "none"
  );
  const [filterValue, setFilterValue] = useState("");

  const fetchDepartments = async (urlSuffix: string = "") => {
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        urlSuffix === ""
          ? endPoints.departments
          : `${endPoints.departments}${urlSuffix}`;

      const response = await apiClient.get(endpoint);
      setDepartments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const applyFilter = () => {
    if (filterType === "none") {
      fetchDepartments();
    } else if (filterType === "modality" && filterValue.trim()) {
      fetchDepartments(`/modality/${filterValue.trim().toUpperCase()}`);
    } else if (filterType === "level" && filterValue.trim()) {
      fetchDepartments(`/level/${filterValue.trim().toUpperCase()}`);
    }
  };

  const clearFilter = () => {
    setFilterType("none");
    setFilterValue("");
    fetchDepartments();
  };

  const handleRetry = () => fetchDepartments();

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="p-12 space-y-6">
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
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Vice Dean – Department Overview
              </h1>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
              {error}
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filter (view-only) */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Filter Departments By</Label>
                <Select
                  value={filterType}
                  onValueChange={(v) => {
                    setFilterType(v as any);
                    setFilterValue("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter type" />
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
                    {filterType === "modality" ? "Modality Code" : "Level Code"}
                  </Label>
                  <div className="flex gap-2">
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
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={applyFilter} variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                {filterType !== "none" && (
                  <Button variant="outline" onClick={clearFilter}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              Academic Departments ({departments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building className="h-14 w-14 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No departments found</p>
                <p className="mt-2">
                  {filterType !== "none"
                    ? "Try clearing or changing the filter."
                    : "No departments match your current view."}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.dptID}>
                        <TableCell className="font-medium">
                          {dept.departmentCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {dept.deptName}
                        </TableCell>
                        <TableCell>{dept.totalCrHr ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {dept.programModality?.modality ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {dept.programModality?.programLevel?.name ?? "—"}
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
