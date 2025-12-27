// "use client";

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   ArrowLeft,
//   Plus,
//   Edit3,
//   Save,
//   X,
//   Trash2,
//   AlertCircle,
//   RefreshCw,
//   BookOpen,
// } from "lucide-react";
// import apiClient from "@/components/api/apiClient";
// import endPoints from "@/components/api/endPoints";

// type ProgramModality = {
//   modalityCode: string;
//   modality: string;
//   programLevelCode: string;
// };

// export default function ProgramModalitiesManagement() {
//   const navigate = useNavigate();

//   const [modalities, setModalities] = useState<ProgramModality[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);

//   // Form modes
//   const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
//   const [editCode, setEditCode] = useState<string>("");

//   // Single form
//   const [formData, setFormData] = useState({
//     modalityCode: "",
//     modality: "",
//     programLevelCode: "",
//   });

//   const fetchModalities = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await apiClient.get(endPoints.programModality);
//       setModalities(res.data || []);
//     } catch (err: any) {
//       setError(
//         err.response?.data?.error ||
//           "Failed to load program modalities. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchModalities();
//   }, []);

//   const resetForm = () => {
//     setFormMode(null);
//     setEditCode("");
//     setFormData({ modalityCode: "", modality: "", programLevelCode: "" });
//     setError(null);
//     setSuccess(null);
//   };

//   const handleCreateSingle = () => {
//     resetForm(); // clear everything first
//     setFormMode("create");
//   };

//   const handleEdit = (mod: ProgramModality) => {
//     setFormMode("edit");
//     setEditCode(mod.modalityCode);
//     setFormData({
//       modalityCode: mod.modalityCode,
//       modality: mod.modality,
//       programLevelCode: mod.programLevelCode,
//     });
//     setError(null);
//     setSuccess(null);
//   };

//   const handleDelete = async (code: string) => {
//     if (!confirm(`Delete modality "${code}"? This cannot be undone.`)) return;

//     setSaving(true);
//     try {
//       await apiClient.delete(`/api/program-modality/${code}`);
//       setSuccess(`"${code}" deleted successfully`);
//       await fetchModalities();
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSave = async () => {
//     if (
//       !formData.modalityCode.trim() ||
//       !formData.modality.trim() ||
//       !formData.programLevelCode.trim()
//     ) {
//       setError("All fields are required");
//       return;
//     }

//     setSaving(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       if (formMode === "create") {
//         await apiClient.post(endPoints.programModality, {
//           modalityCode: formData.modalityCode.trim(),
//           modality: formData.modality.trim(),
//           programLevelCode: formData.programLevelCode.trim(),
//         });
//         setSuccess("Modality created successfully");
//       } else if (formMode === "edit" && editCode) {
//         await apiClient.put(`/api/program-modality/${editCode}`, {
//           modalityCode: formData.modalityCode.trim(),
//           modality: formData.modality.trim(),
//           programLevelCode: formData.programLevelCode.trim(),
//         });
//         setSuccess("Modality updated successfully");
//       }

//       resetForm();
//       await fetchModalities();
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Operation failed");
//       console.error(err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCancel = () => {
//     resetForm();
//   };

//   const handleRetry = () => fetchModalities();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background py-8 px-4">
//         <div className="max-w-6xl mx-auto space-y-6">
//           <Skeleton className="h-10 w-64" />
//           <Card>
//             <CardContent className="p-12 space-y-4">
//               <Skeleton className="h-10 w-full" />
//               <Skeleton className="h-64 w-full" />
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background py-8 px-4">
//       <div className="max-w-6xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
//           <div className="flex items-center gap-4">
//             <Button
//               variant="ghost"
//               onClick={() => navigate(-1)}
//               className="text-primary hover:bg-primary/10"
//             >
//               <ArrowLeft className="h-5 w-5 mr-2" />
//               Back
//             </Button>
//             <h1 className="text-3xl font-bold text-foreground">
//               Program Modalities
//             </h1>
//           </div>

//           {formMode === null && (
//             <Button
//               className="bg-primary hover:bg-primary/90 text-primary-foreground"
//               onClick={handleCreateSingle}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Create New Modality
//             </Button>
//           )}
//         </div>

//         {/* Messages */}
//         {success && (
//           <Alert className="border-green-500/30 bg-green-500/10">
//             <AlertDescription className="text-foreground">
//               {success}
//             </AlertDescription>
//           </Alert>
//         )}

//         {error && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
//               {error}
//               <Button variant="outline" size="sm" onClick={handleRetry}>
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Retry
//               </Button>
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Single Create / Edit Form */}
//         {(formMode === "create" || formMode === "edit") && (
//           <Card className="border-primary/30 shadow-md">
//             <CardHeader className="pb-4">
//               <CardTitle className="flex items-center gap-3 text-primary">
//                 <BookOpen className="h-6 w-6" />
//                 {formMode === "create"
//                   ? "Create Program Modality"
//                   : `Edit ${editCode}`}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <Label>Modality Code *</Label>
//                   <Input
//                     value={formData.modalityCode}
//                     onChange={(e) =>
//                       setFormData({ ...formData, modalityCode: e.target.value })
//                     }
//                     placeholder="e.g. REG-DEG, EXT-DIP"
//                     disabled={formMode === "edit"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Modality Name *</Label>
//                   <Input
//                     value={formData.modality}
//                     onChange={(e) =>
//                       setFormData({ ...formData, modality: e.target.value })
//                     }
//                     placeholder="e.g. Regular, Extension, Summer"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Program Level Code *</Label>
//                   <Input
//                     value={formData.programLevelCode}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         programLevelCode: e.target.value.toUpperCase(),
//                       })
//                     }
//                     placeholder="e.g. DEG, DIP, MSC"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <Button
//                   variant="outline"
//                   onClick={handleCancel}
//                   disabled={saving}
//                 >
//                   <X className="h-4 w-4 mr-2" />
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="bg-primary hover:bg-primary/90"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   {saving ? "Saving..." : "Save"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Main Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl flex items-center gap-3">
//               <BookOpen className="h-6 w-6 text-primary" />
//               All Program Modalities ({modalities.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {modalities.length === 0 ? (
//               <div className="text-center py-12 text-muted-foreground">
//                 <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p className="font-medium">No modalities found</p>
//                 <p className="text-sm mt-2">
//                   Click "Create New Modality" to add one
//                 </p>
//               </div>
//             ) : (
//               <div className="rounded-md border overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Modality Code</TableHead>
//                       <TableHead>Modality</TableHead>
//                       <TableHead>Program Level</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {modalities.map((mod) => (
//                       <TableRow key={mod.modalityCode}>
//                         <TableCell className="font-medium">
//                           {mod.modalityCode}
//                         </TableCell>
//                         <TableCell>{mod.modality}</TableCell>
//                         <TableCell>
//                           <Badge variant="outline">
//                             {mod.programLevelCode}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right space-x-2">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleEdit(mod)}
//                           >
//                             <Edit3 className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                             onClick={() => handleDelete(mod.modalityCode)}
//                             disabled={saving}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
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
      const modalitiesRes = await apiClient.get(endPoints.programModality);
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
      //   await apiClient.delete(`/api/program-modality/${code}`);
      await apiClient.delete(endPoints.programModality + "/" + code);

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
        await apiClient.post(endPoints.programModality, {
          modalityCode: formData.modalityCode.trim(),
          modality: formData.modality.trim(),
          programLevelCode: formData.programLevelCode.trim(),
        });
        setSuccess("Modality created successfully");
      } else if (formMode === "edit" && editCode) {
        // await apiClient.put(`/api/program-modality/${editCode}`, {
        await apiClient.put(endPoints.programModality + "/" + editCode, {
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
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-foreground">
              Program Modalities
            </h1>
          </div>

          {formMode === null && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCreateSingle}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Modality
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

        {/* Single Create / Edit Form */}
        {(formMode === "create" || formMode === "edit") && (
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary">
                <BookOpen className="h-6 w-6" />
                {formMode === "create"
                  ? "Create Program Modality"
                  : `Edit ${editCode}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Modality Code *</Label>
                  <Input
                    value={formData.modalityCode}
                    onChange={(e) =>
                      setFormData({ ...formData, modalityCode: e.target.value })
                    }
                    placeholder="e.g. REG-DEG, EXT-DIP"
                    disabled={formMode === "edit"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modality Name *</Label>
                  <Input
                    value={formData.modality}
                    onChange={(e) =>
                      setFormData({ ...formData, modality: e.target.value })
                    }
                    placeholder="e.g. Regular, Extension, Summer"
                  />
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
                      <SelectValue placeholder="Select program level" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookupProgramLevels.length === 0 ? (
                        <SelectItem value="no-levels" disabled>
                          No program levels available
                        </SelectItem>
                      ) : (
                        lookupProgramLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.id} — {level.name}
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

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              All Program Modalities ({modalities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modalities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No modalities found</p>
                <p className="text-sm mt-2">
                  Click "Create New Modality" to add one
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modality Code</TableHead>
                      <TableHead>Modality</TableHead>
                      <TableHead>Program Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalities.map((mod) => (
                      <TableRow key={mod.modalityCode}>
                        <TableCell className="font-medium">
                          {mod.modalityCode}
                        </TableCell>
                        <TableCell>{mod.modality}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {mod.programLevelCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(mod)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
