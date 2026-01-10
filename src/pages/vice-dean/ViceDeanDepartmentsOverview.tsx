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
import apiService from "@/components/api/apiService";
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
  programLevel: {
    code: string;
    name: string;
    active: boolean;
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

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get(endPoints.departments);
      setDepartments(response || []);
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
    } else {
      // Note: The current API doesn't support filtering by modality or level
      // In a real implementation, you would call separate endpoints
      alert("Filtering by modality/level requires additional API endpoints.");
    }
  };

  const clearFilter = () => {
    setFilterType("none");
    setFilterValue("");
    fetchDepartments();
  };

  const handleRetry = () => fetchDepartments();

  const filteredDepartments = departments.filter((dept) => {
    if (filterType === "none") return true;
    if (filterType === "modality" && filterValue) {
      return dept.programModality?.modalityCode?.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (filterType === "level" && filterValue) {
      return dept.programLevel?.code?.toLowerCase().includes(filterValue.toLowerCase());
    }
    return true;
  });

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
          <div className="text-sm text-muted-foreground">
            Total Departments: {departments.length}
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

        {/* Filter (client-side only since API doesn't support filtering) */}
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
                    <SelectItem value="none">None (Show All)</SelectItem>
                    <SelectItem value="modality">Modality</SelectItem>
                    <SelectItem value="level">Program Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType !== "none" && (
                <div className="flex-1 space-y-2">
                  <Label>
                    {filterType === "modality" ? "Modality" : "Level Code"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      placeholder={
                        filterType === "modality" ? "e.g. Regular" : "e.g. BCH"
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={applyFilter} variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filter
                </Button>
                {filterType !== "none" && (
                  <Button variant="outline" onClick={clearFilter}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {filterType !== "none" && (
              <p className="text-sm text-muted-foreground mt-2">
                Note: This is client-side filtering. For server-side filtering,
                additional API endpoints would be required.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              Academic Departments ({filteredDepartments.length})
              {filterType !== "none" && filteredDepartments.length < departments.length && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Filtered from {departments.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDepartments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building className="h-14 w-14 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No departments found</p>
                <p className="mt-2">
                  {filterType !== "none"
                    ? "Try clearing or changing the filter."
                    : "No departments available in the system."}
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
                      <TableHead>Level Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((dept) => (
                      <TableRow 
                        key={dept.dptID} 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => navigate(`/vice-dean/departments/${dept.dptID}`)}
                      >
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            {dept.departmentCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {dept.deptName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={dept.totalCrHr ? "default" : "outline"}>
                            {dept.totalCrHr ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {dept.programModality?.modality ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{dept.programLevel?.name ?? "—"}</span>
                            <span className="text-xs text-muted-foreground">
                              Code: {dept.programLevel?.code ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={dept.programLevel?.active ? "outline" : "destructive"}
                            className={dept.programLevel?.active ? "text-green-600 border-green-600" : ""}
                          >
                            {dept.programLevel?.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-2xl font-bold text-primary">
                  {departments.filter(d => d.programLevel?.active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Regular Modality</p>
                <p className="text-2xl font-bold text-primary">
                  {departments.filter(d => d.programModality?.modality === "Regular").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Bachelor's Degree</p>
                <p className="text-2xl font-bold text-primary">
                  {departments.filter(d => d.programLevel?.name?.includes("Bachelor")).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}