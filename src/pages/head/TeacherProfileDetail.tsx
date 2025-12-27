"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Edit3,
  Save,
  X,
  AlertCircle,
  BookOpen,
  Upload,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
} from "lucide-react";

type AssignedCourse = {
  id: number;
  courseCode: string;
  courseTitle: string;
  totalCrHrs: number;
  batchClassYearSemesterName: string;
  teacherCourseAssigmentId: number;
};

type TeacherDetail = {
  userId: number;
  username: string;
  firstNameAmharic: string;
  lastNameAmharic: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirthGC: string;
  phoneNumber: string;
  email: string | null;
  departmentName: string;
  hireDateGC: string;
  title: string | null;
  yearsOfExperience: number;
  impairmentCode?: string;
  impairmentName?: string;
  maritalStatus: string | null;
  currentAddressRegionCode?: string;
  currentAddressZoneCode?: string;
  currentAddressWoredaCode?: string;
  regionName?: string;
  zoneName?: string;
  woredaName?: string;
  photographBase64?: string;
  assignedCourses: AssignedCourse[];
};

export default function TeacherProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // ── New states for course assignment ────────────────────────────────────────
  const [departmentCourses, setDepartmentCourses] = useState<any[]>([]);

  const [loadingDeptCourses, setLoadingDeptCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  // You may also want to fetch BCYS options — for now we assume user knows/pastes ID
  // (in real app you'd probably fetch batch/class/year/semester combos too)
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [originalTeacher, setOriginalTeacher] = useState<TeacherDetail | null>(
    null
  );
  const [documentFileSelected, setDocumentFileSelected] = useState(false);
  // Address cascading states
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [zones, setZones] = useState<{ value: string; label: string }[]>([]);
  const [woredas, setWoredas] = useState<{ value: string; label: string }[]>(
    []
  );

  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingWoredas, setLoadingWoredas] = useState(false);
  // Add these new states
  const [assignmentMode, setAssignmentMode] = useState(false);

  const [deletingAssignmentId, setDeletingAssignmentId] = useState<
    number | null
  >(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  // Optional but strongly recommended – show the selected filename to the user
  const [selectedDocumentName, setSelectedDocumentName] = useState<
    string | null
  >(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const handleAssignCourse = async () => {
    if (!teacher?.userId || !selectedCourseId || !selectedBcysId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = [
      {
        courseId: Number(selectedCourseId),
        bcysId: Number(selectedBcysId),
      },
    ];

    try {
      await apiClient.post(
        // `/teachers/${teacher.userId}/course-assignments`,
        // payload

        endPoints.teacherCourseAssignments(teacher.userId),
        payload
      );

      setSuccess("Course assigned successfully!");
      await fetchTeacher();

      // Reset selection
      setSelectedCourseId("");
      setSelectedBcysId("");
    } catch (err: any) {
      console.error("Assign failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to assign course (may already exist or invalid IDs)"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleRevokeCourse = async (assignmentId: number) => {
    if (!teacher?.userId) return;

    try {
      setDeletingAssignmentId(assignmentId);
      await apiClient.delete(
        endPoints.teacherCourseAssignmentDeletion(teacher.userId, assignmentId)
        // `/teachers/${teacher.userId}/course-assignments/${assignmentId}`
      );
      setSuccess("Course assignment removed successfully");
      await fetchTeacher();
    } catch (err: any) {
      console.error("Revoke failed:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.status === 404
            ? "Assignment not found"
            : "Failed to remove assignment")
      );
    } finally {
      setDeletingAssignmentId(null);
      setConfirmDeleteId(null);
    }
  };
  const handleRegionChange = async (regionCode: string) => {
    // Update teacher state
    setTeacher((prev) =>
      prev ? { ...prev, currentAddressRegionCode: regionCode || "" } : null
    );

    // Reset dependent fields
    setTeacher((prev) =>
      prev
        ? { ...prev, currentAddressZoneCode: "", currentAddressWoredaCode: "" }
        : null
    );
    setZones([]);
    setWoredas([]);

    if (!regionCode) return;

    setLoadingZones(true);
    try {
      const res = await apiClient.get(
        `${endPoints.zonesByRegion}/${regionCode}`
      );
      const formatted = (res.data || [])
        .map((z: any) => ({
          value: z.code || z.zoneCode || z.id || "",
          label: z.zone || z.zoneName || z.name,
        }))
        .filter((z: any) => z.value && z.label);
      console.log(formatted, res, "runaway");
      setZones(formatted);
    } catch (err) {
      console.error("Failed to load zones", err);
      setError("Failed to load zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const handleZoneChange = async (zoneCode: string) => {
    // Update teacher state
    setTeacher((prev) =>
      prev ? { ...prev, currentAddressZoneCode: zoneCode || "" } : null
    );

    // Reset woreda
    setTeacher((prev) =>
      prev ? { ...prev, currentAddressWoredaCode: "" } : null
    );
    setWoredas([]);

    if (!zoneCode) return;

    setLoadingWoredas(true);
    try {
      const res = await apiClient.get(`${endPoints.woredasByZone}/${zoneCode}`);
      const formatted = (res.data || [])
        .map((w: any) => ({
          value: w.code || w.woredaCode || w.id || "",
          label: w.woreda || w.woredaName || w.name,
        }))
        .filter((w: any) => w.value && w.label);
      console.log(res, formatted, "woredas");
      setWoredas(formatted);
    } catch (err) {
      console.error("Failed to load woredas", err);
      setError("Failed to load woredas");
    } finally {
      setLoadingWoredas(false);
    }
  };
  // Add this state (for better UX)
  // States (should already be there)
  const [classYearBatch, setClassYearBatch] = useState<any[]>([]);
  const [selectedBcysId, setSelectedBcysId] = useState<string>("");
  const [loadingBcys, setLoadingBcys] = useState(false);
  // Fetch — improve it a bit for safety
  useEffect(() => {
    const fetchDropDowns = async () => {
      setLoadingBcys(true);
      try {
        const res = await apiClient.get(endPoints.lookupsDropdown);
        const data = res.data || {};
        const batches = Array.isArray(data.batchClassYearSemesters)
          ? data.batchClassYearSemesters
          : [];

        setClassYearBatch(batches);
        console.log("Loaded BCYS options:", batches.length, "items");
      } catch (err) {
        console.error("Failed to load batch/class/year/semester options:", err);
        setClassYearBatch([]);
      } finally {
        setLoadingBcys(false);
      }
    };

    fetchDropDowns(); // always fetch on mount
    // OR: if (editMode) fetchDropDowns();   // only when editing
  }, []); // or [editMode] if you prefer lazy loading// ← or [editMode] if you want to load only when editing
  const fetchDepartmentCourses = async () => {
    setLoadingDeptCourses(true);
    try {
      const res = await apiClient.get(endPoints.myDepartmentCourses);
      // assuming response is array like your example
      if (Array.isArray(res.data)) {
        setDepartmentCourses(res.data);
        console.log(res, "you found me");
      } else {
        console.log(res, "you found me");
        setDepartmentCourses([]);
        console.warn("Unexpected courses format", res.data);
      }
    } catch (err: any) {
      console.error("Failed to load department courses", err);
      if (err.response?.status === 404) {
        alert(
          "No department profile found. Please set up your department first."
        );
      }
      setDepartmentCourses([]);
    } finally {
      setLoadingDeptCourses(false);
    }
  };
  const fetchTeacher = useCallback(async () => {
    if (!id) {
      setError("No teacher ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/teachers/${id}`);
      setTeacher(res.data);
      console.log(res, "look at ya");
      setOriginalTeacher(structuredClone(res.data));
    } catch (err: any) {
      setError(
        err.response?.status === 404
          ? "Teacher not found."
          : err.response?.data?.message || "Failed to load teacher profile."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const res = await apiClient.get(endPoints.regions);
        const formatted = (res.data || [])
          .map((r: any) => ({
            value: r.code || r.regionCode || r.id || "",
            label: r.name || r.regionName || r.region,
          }))
          .filter((r: any) => r.value && r.label);
        console.log(res, "regions");
        setRegions(formatted);
        console.log(formatted);
      } catch (err) {
        console.error("Failed to load regions", err);
        setError("Failed to load regions list");
      } finally {
        setLoadingRegions(false);
      }
    };

    if (editMode) {
      // only fetch when entering edit mode (optional optimization)
      fetchRegions();
      fetchDepartmentCourses();
    }
  }, [editMode]);
  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);
  // Add this useEffect
  useEffect(() => {
    if (
      assignmentMode &&
      departmentCourses.length === 0 &&
      !loadingDeptCourses
    ) {
      fetchDepartmentCourses();
    }
  }, [assignmentMode]);
  const handleRetry = () => {
    setError(null);
    fetchTeacher();
  };
  let departementId;
  useEffect(() => {
    const token = sessionStorage.getItem("Userdata");
    departementId = JSON.parse(token);
    console.log(JSON.parse(token).departmentId);
  }, []);
  const hasChanges = () => {
    if (!teacher || !originalTeacher) return false;
    return (
      teacher.firstNameAmharic !== originalTeacher.firstNameAmharic ||
      teacher.lastNameAmharic !== originalTeacher.lastNameAmharic ||
      teacher.firstNameEnglish !== originalTeacher.firstNameEnglish ||
      teacher.lastNameEnglish !== originalTeacher.lastNameEnglish ||
      teacher.gender !== originalTeacher.gender ||
      teacher.dateOfBirthGC !== originalTeacher.dateOfBirthGC ||
      teacher.phoneNumber !== originalTeacher.phoneNumber ||
      teacher.email !== originalTeacher.email ||
      teacher.title !== originalTeacher.title ||
      teacher.yearsOfExperience !== originalTeacher.yearsOfExperience ||
      teacher.maritalStatus !== originalTeacher.maritalStatus ||
      teacher.currentAddressRegionCode !==
        originalTeacher.currentAddressRegionCode ||
      teacher.currentAddressZoneCode !==
        originalTeacher.currentAddressZoneCode ||
      teacher.currentAddressWoredaCode !==
        originalTeacher.currentAddressWoredaCode ||
      photoInputRef.current?.files?.length === 1 ||
      documentInputRef.current?.files?.length === 1
    );
  };

  // const handleSave = async () => {
  //   if (!teacher || !originalTeacher || !hasChanges()) {
  //     setEditMode(false);
  //     return;
  //   }

  //   setSaving(true);
  //   setError(null);
  //   setSuccess(null);

  //   const formData = new FormData();
  //   const payload: Record<string, any> = {};

  //   // ... (payload building logic remains unchanged) ...

  //   if (Object.keys(payload).length > 0) {
  //     formData.append(
  //       "data",
  //       // JSON.stringify(payload)
  //       new Blob([JSON.stringify(payload)])
  //     );
  //   }

  //   const newPhoto = photoInputRef.current?.files?.[0];
  //   const newDoc = documentInputRef.current?.files?.[0];

  //   if (newPhoto) formData.append("photograph", newPhoto);
  //   if (newDoc) formData.append("document", newDoc);

  //   try {
  //     const res = await apiClient.put(`/teachers/${id}`, formData, {
  //       //headers: { "Content-Type": "multipart/form-data" },
  //       // headers: { "Content-Type": "application/json" },
  //     });

  //     setTeacher(res.data);
  //     setOriginalTeacher(structuredClone(res.data));
  //     setSuccess("Teacher profile updated successfully!");
  //     setEditMode(false);

  //     if (photoInputRef.current) photoInputRef.current.value = "";
  //     if (documentInputRef.current) documentInputRef.current.value = "";
  //   } catch (err: any) {
  //     console.log(err, "update failed");
  //     setError(
  //       err.response?.data?.message ||
  //         "Failed to update teacher profile. Please try again."
  //     );
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSave = async () => {
    if (!teacher || !originalTeacher || !hasChanges()) {
      setEditMode(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();

      const payload: Partial<TeacherDetail> = {};

      // ── Only include fields that actually changed ───────────────────────────────
      if (teacher.firstNameEnglish !== originalTeacher.firstNameEnglish) {
        payload.firstNameEnglish = teacher.firstNameEnglish.trim() || undefined;
      }
      if (teacher.lastNameEnglish !== originalTeacher.lastNameEnglish) {
        payload.lastNameEnglish = teacher.lastNameEnglish.trim() || undefined;
      }
      if (teacher.firstNameAmharic !== originalTeacher.firstNameAmharic) {
        payload.firstNameAmharic = teacher.firstNameAmharic.trim() || undefined;
      }
      if (teacher.lastNameAmharic !== originalTeacher.lastNameAmharic) {
        payload.lastNameAmharic = teacher.lastNameAmharic.trim() || undefined;
      }

      if (teacher.gender !== originalTeacher.gender) {
        payload.gender = teacher.gender;
      }
      if (teacher.dateOfBirthGC !== originalTeacher.dateOfBirthGC) {
        payload.dateOfBirthGC = teacher.dateOfBirthGC || undefined;
      }
      if (teacher.phoneNumber !== originalTeacher.phoneNumber) {
        payload.phoneNumber = teacher.phoneNumber.trim() || undefined;
      }
      if (teacher.email !== originalTeacher.email) {
        payload.email = teacher.email?.trim() || null;
      }

      if (teacher.title !== originalTeacher.title) {
        payload.title = teacher.title?.trim() || null;
      }
      if (teacher.yearsOfExperience !== originalTeacher.yearsOfExperience) {
        payload.yearsOfExperience = teacher.yearsOfExperience;
      }
      if (teacher.maritalStatus !== originalTeacher.maritalStatus) {
        payload.maritalStatus = teacher.maritalStatus || null;
      }

      // Address – send empty string to clear, undefined to leave unchanged
      if (
        teacher.currentAddressRegionCode !==
        originalTeacher.currentAddressRegionCode
      ) {
        payload.currentAddressRegionCode =
          teacher.currentAddressRegionCode || "";
      }
      if (
        teacher.currentAddressZoneCode !==
        originalTeacher.currentAddressZoneCode
      ) {
        payload.currentAddressZoneCode = teacher.currentAddressZoneCode || "";
      }
      if (
        teacher.currentAddressWoredaCode !==
        originalTeacher.currentAddressWoredaCode
      ) {
        payload.currentAddressWoredaCode =
          teacher.currentAddressWoredaCode || "";
      }

      // ── Append JSON as Blob ──────────────────────────────────────────────────────
      if (Object.keys(payload).length > 0) {
        const jsonBlob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        formData.append("data", jsonBlob, "data.json"); // filename is optional
      } else {
        const jsonBlob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        formData.append("data", jsonBlob, "data.json");
      }

      // ── Files ────────────────────────────────────────────────────────────────────
      const newPhoto = photoInputRef.current?.files?.[0];
      if (newPhoto) {
        formData.append("photograph", newPhoto);
      }

      const newDoc = documentInputRef.current?.files?.[0];
      if (newDoc) {
        formData.append("document", newDoc);
      }

      // ── Send request – NO headers! Let axios add multipart boundary ─────────────
      const res = await apiClient.put(`/teachers/${id}`, formData);

      setTeacher(res.data);
      setOriginalTeacher(structuredClone(res.data));
      setSuccess("Teacher profile updated successfully!");
      setEditMode(false);

      // Reset file inputs
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update teacher profile. Check console / Network tab."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTeacher(structuredClone(originalTeacher));
    setEditMode(false);
    setError(null);
    setSuccess(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  if (loading) return <LoadingSkeleton />;

  if (error && !teacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
          <h2 className="text-3xl font-bold text-foreground">
            Failed to Load Profile
          </h2>
          <p className="text-xl text-muted-foreground max-w-md">{error}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  const fullNameEnglish =
    `${teacher.firstNameEnglish} ${teacher.lastNameEnglish}`.trim();
  const fullNameAmharic =
    `${teacher.firstNameAmharic} ${teacher.lastNameAmharic}`.trim();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2 sm:mb-0 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Teachers
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Teacher Profile
            </h1>
          </div>

          {!editMode ? (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setEditMode(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {success && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10 text-foreground">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={saving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-card rounded-xl shadow border overflow-hidden">
          {/* Hero / Photo Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 px-6 py-10 md:px-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="relative">
                <Avatar className="h-40 w-40 ring-8 ring-background shadow-xl">
                  <AvatarImage
                    src={
                      teacher.photographBase64 &&
                      teacher.photographBase64.length > 200
                        ? `data:image/jpeg;base64,${teacher.photographBase64}`
                        : undefined
                    }
                    alt={fullNameEnglish}
                  />
                  <AvatarFallback className="text-4xl font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {teacher.firstNameEnglish?.[0]}
                    {teacher.lastNameEnglish?.[0]}
                  </AvatarFallback>
                </Avatar>

                {editMode && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setTeacher((prev) =>
                          prev
                            ? {
                                ...prev,
                                photographBase64: reader.result as string,
                              }
                            : null
                        );
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="text-center md:text-left">
                {editMode ? (
                  <div className="space-y-5 w-full max-w-lg">
                    {/* name fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name (English)</Label>
                        <Input
                          value={teacher.firstNameEnglish}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p
                                ? { ...p, firstNameEnglish: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Last Name (English)</Label>
                        <Input
                          value={teacher.lastNameEnglish}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p
                                ? { ...p, lastNameEnglish: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>መጀመሪያ ስም (Amharic)</Label>
                        <Input
                          value={teacher.firstNameAmharic}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p
                                ? { ...p, firstNameAmharic: e.target.value }
                                : null
                            )
                          }
                          className="font-geez"
                        />
                      </div>
                      <div>
                        <Label>የአባት ስም (Amharic)</Label>
                        <Input
                          value={teacher.lastNameAmharic}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p
                                ? { ...p, lastNameAmharic: e.target.value }
                                : null
                            )
                          }
                          className="font-geez"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Academic Title</Label>
                      <Input
                        value={teacher.title || ""}
                        onChange={(e) =>
                          setTeacher((p) =>
                            p ? { ...p, title: e.target.value || null } : null
                          )
                        }
                        placeholder="e.g. Lecturer, Assistant Professor"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-foreground">
                      {fullNameEnglish}
                    </h2>
                    {fullNameAmharic && (
                      <p className="text-2xl font-geez text-blue-700 dark:text-blue-300 mt-2">
                        {fullNameAmharic}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
                      {teacher.title && (
                        <Badge
                          variant="secondary"
                          className="text-lg py-1 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          {teacher.title}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-lg py-1 px-4 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                      >
                        {teacher.departmentName}
                      </Badge>
                    </div>
                  </>
                )}

                <p className="text-muted-foreground mt-4">
                  ID:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {id}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Phone Number</Label>
                      {editMode ? (
                        <Input
                          value={teacher.phoneNumber}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p ? { ...p, phoneNumber: e.target.value } : null
                            )
                          }
                          placeholder="+2519..."
                        />
                      ) : (
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {teacher.phoneNumber || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Email</Label>
                      {editMode ? (
                        <Input
                          type="email"
                          value={teacher.email || ""}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p ? { ...p, email: e.target.value || null } : null
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 font-medium break-all text-foreground">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {teacher.email || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Years of Experience</Label>
                      {editMode ? (
                        <Input
                          type="number"
                          min={0}
                          value={teacher.yearsOfExperience}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p
                                ? {
                                    ...p,
                                    yearsOfExperience:
                                      Number(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                        />
                      ) : (
                        <p className="font-medium text-foreground">
                          {teacher.yearsOfExperience} years
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Marital Status</Label>
                      {editMode ? (
                        <Select
                          value={teacher.maritalStatus || ""}
                          onValueChange={(v) =>
                            setTeacher((p) =>
                              p ? { ...p, maritalStatus: v || null } : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="MARRIED">Married</SelectItem>
                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium capitalize text-foreground">
                          {teacher.maritalStatus?.toLowerCase() || "—"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Gender</Label>
                      {editMode ? (
                        <Select
                          value={teacher.gender}
                          onValueChange={(v) =>
                            setTeacher((p) =>
                              p
                                ? {
                                    ...p,
                                    gender: v as "MALE" | "FEMALE" | "OTHER",
                                  }
                                : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium capitalize text-foreground">
                          {teacher.gender.toLowerCase()}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Date of Birth (GC)</Label>
                      {editMode ? (
                        <Input
                          type="date"
                          value={teacher.dateOfBirthGC}
                          onChange={(e) =>
                            setTeacher((p) =>
                              p ? { ...p, dateOfBirthGC: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {teacher.dateOfBirthGC || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {(editMode ||
                  teacher.regionName ||
                  teacher.zoneName ||
                  teacher.woredaName) && (
                  // <section>
                  //   <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
                  //     <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  //     Current Address
                  //   </h3>

                  //   {editMode ? (
                  //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  //       <div>
                  //         <Label>Region Code</Label>
                  //         <Input
                  //           value={teacher.currentAddressRegionCode || ""}
                  //           onChange={(e) =>
                  //             setTeacher((p) =>
                  //               p
                  //                 ? {
                  //                     ...p,
                  //                     currentAddressRegionCode: e.target.value,
                  //                   }
                  //                 : null
                  //             )
                  //           }
                  //           placeholder="e.g. AA"
                  //         />
                  //       </div>
                  //       <div>
                  //         <Label>Zone Code</Label>
                  //         <Input
                  //           value={teacher.currentAddressZoneCode || ""}
                  //           onChange={(e) =>
                  //             setTeacher((p) =>
                  //               p
                  //                 ? {
                  //                     ...p,
                  //                     currentAddressZoneCode: e.target.value,
                  //                   }
                  //                 : null
                  //             )
                  //           }
                  //           placeholder="e.g. Gulele"
                  //         />
                  //       </div>
                  //       <div>
                  //         <Label>Woreda Code</Label>
                  //         <Input
                  //           value={teacher.currentAddressWoredaCode || ""}
                  //           onChange={(e) =>
                  //             setTeacher((p) =>
                  //               p
                  //                 ? {
                  //                     ...p,
                  //                     currentAddressWoredaCode: e.target.value,
                  //                   }
                  //                 : null
                  //             )
                  //           }
                  //           placeholder="e.g. W01"
                  //         />
                  //       </div>
                  //     </div>
                  //   ) : (
                  //     <div className="space-y-1 text-muted-foreground">
                  //       {teacher.woredaName && (
                  //         <p className="font-medium text-foreground">
                  //           {teacher.woredaName}
                  //         </p>
                  //       )}
                  //       {teacher.zoneName && <p>{teacher.zoneName}</p>}
                  //       {teacher.regionName && <p>{teacher.regionName}</p>}
                  //       {!teacher.woredaName &&
                  //         !teacher.zoneName &&
                  //         !teacher.regionName && (
                  //           <p className="italic">No address set</p>
                  //         )}
                  //     </div>
                  //   )}
                  // </section>
                  <section>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
                      <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      Current Address
                    </h3>

                    {editMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Region */}
                        <div className="space-y-2">
                          <Label>Region</Label>
                          <Select
                            value={teacher?.currentAddressRegionCode || ""}
                            onValueChange={handleRegionChange}
                            disabled={loadingRegions || regions.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingRegions
                                    ? "Loading regions..."
                                    : regions.length === 0
                                    ? "No regions available"
                                    : "Select Region"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Zone */}
                        <div className="space-y-2">
                          <Label>Zone</Label>
                          <Select
                            value={teacher?.currentAddressZoneCode || ""}
                            onValueChange={handleZoneChange}
                            disabled={
                              loadingZones ||
                              zones.length === 0 ||
                              !teacher?.currentAddressRegionCode
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingZones
                                    ? "Loading zones..."
                                    : !teacher?.currentAddressRegionCode
                                    ? "Select Region first"
                                    : zones.length === 0
                                    ? "No zones available"
                                    : "Select Zone"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {zones.map((z) => (
                                <SelectItem key={z.value} value={z.value}>
                                  {z.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Woreda */}
                        <div className="space-y-2">
                          <Label>Woreda</Label>
                          <Select
                            value={teacher?.currentAddressWoredaCode || ""}
                            onValueChange={(woredaCode) =>
                              setTeacher((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      currentAddressWoredaCode:
                                        woredaCode || "",
                                    }
                                  : null
                              )
                            }
                            disabled={
                              loadingWoredas ||
                              woredas.length === 0 ||
                              !teacher?.currentAddressZoneCode
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingWoredas
                                    ? "Loading woredas..."
                                    : !teacher?.currentAddressZoneCode
                                    ? "Select Zone first"
                                    : woredas.length === 0
                                    ? "No woredas available"
                                    : "Select Woreda"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {woredas.map((w) => (
                                <SelectItem key={w.value} value={w.value}>
                                  {w.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-muted-foreground">
                        {teacher.woredaName && (
                          <p className="font-medium text-foreground">
                            {teacher.woredaName}
                          </p>
                        )}
                        {teacher.zoneName && <p>{teacher.zoneName}</p>}
                        {teacher.regionName && <p>{teacher.regionName}</p>}
                        {!teacher.woredaName &&
                          !teacher.zoneName &&
                          !teacher.regionName && (
                            <p className="italic">No address set</p>
                          )}
                      </div>
                    )}
                  </section>
                )}

                {/* {editMode && (
                  <section>
                    <Label>
                      Update Supporting Document (PDF – replaces existing)
                    </Label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      ref={documentInputRef}
                    />
                  </section>
                )} */}
                {editMode && (
                  <section>
                    <Label>
                      Update Supporting Document (PDF – replaces existing)
                    </Label>
                    <div className="mt-2 flex items-center gap-4 flex-wrap">
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={documentInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocumentFileSelected(true);
                            setSelectedDocumentName(file.name);
                          } else {
                            setDocumentFileSelected(false);
                            setSelectedDocumentName(null);
                          }
                        }}
                      />
                      {selectedDocumentName && (
                        <span className="text-sm text-muted-foreground truncate max-w-xs">
                          Selected: {selectedDocumentName}
                        </span>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {/* <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-foreground">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Assigned Courses ({teacher.assignedCourses.length})
                </h3>

                {teacher.assignedCourses.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No courses assigned yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teacher.assignedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="p-4 bg-card border-border"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {course.courseCode}
                            </p>
                            <p className="text-sm mt-1 text-foreground">
                              {course.courseTitle}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {course.batchClassYearSemesterName}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {course.totalCrHrs} Cr.Hrs
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {editMode && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Assign New Course
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Course</Label>
                        {loadingDeptCourses ? (
                          <div className="text-sm text-muted-foreground">
                            Loading courses...
                          </div>
                        ) : departmentCourses.length === 0 ? (
                          <div className="text-sm text-destructive">
                            No courses available in your department
                          </div>
                        ) : (
                          <Select
                            value={selectedCourseId}
                            onValueChange={setSelectedCourseId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {departmentCourses.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.code} – {c.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Batch / Year / Semester</Label>

                        {loadingBcys ? (
                          <div className="h-10 flex items-center text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading options...
                          </div>
                        ) : classYearBatch.length === 0 ? (
                          <div className="h-10 flex items-center text-sm text-muted-foreground italic">
                            No batch/year/semester options available
                          </div>
                        ) : (
                          <Select
                            value={selectedBcysId}
                            onValueChange={setSelectedBcysId}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch / year / semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {classYearBatch.map((item: any) => (
                                <SelectItem
                                  key={item.id}
                                  value={String(item.id)}
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAssignCourse}
                      // disabled={
                      //   !selectedCourseId ||
                      //   !selectedBcysId ||
                      //   loadingDeptCourses ||
                      //   saving
                      // }
                      disabled={
                        !selectedCourseId ||
                        !selectedBcysId ||
                        loadingDeptCourses ||
                        loadingBcys || // ← added
                        saving ||
                        classYearBatch.length === 0
                      }
                      className="w-full sm:w-auto"
                    >
                      Assign Course
                    </Button>
                  </div>
                )}
              </div> */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border shadow-sm p-6 sticky top-6">
                  {/* Header */}
                  <div className=" items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      Course Assignments (
                      {teacher?.assignedCourses?.length || 0})
                    </h3>

                    <Button
                      variant={assignmentMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAssignmentMode(!assignmentMode)}
                    >
                      {assignmentMode ? (
                        <>
                          <X className="h-4 w-4 mr-2" /> Close
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-2" /> Manage Courses
                        </>
                      )}
                    </Button>
                  </div>

                  {/* No courses yet */}
                  {(!teacher?.assignedCourses ||
                    teacher.assignedCourses.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-60" />
                      <p className="font-medium">No courses assigned yet</p>
                      <p className="text-sm mt-1">
                        Click "Manage Courses" to assign
                      </p>
                    </div>
                  )}

                  {/* List of assigned courses */}
                  {teacher?.assignedCourses?.length > 0 && (
                    <div className="space-y-3 mb-8 max-h-[380px] overflow-y-auto pr-2">
                      {teacher.assignedCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-start justify-between p-3.5 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium leading-tight">
                              {course.courseCode} — {course.courseTitle}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {course.batchClassYearSemesterName}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {course.totalCrHrs} Cr.Hrs
                            </Badge>

                            {assignmentMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  setConfirmDeleteId(
                                    course.teacherCourseAssigmentId
                                  )
                                }
                                disabled={
                                  deletingAssignmentId ===
                                  course.teacherCourseAssigmentId
                                }
                              >
                                {deletingAssignmentId ===
                                course.teacherCourseAssigmentId ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign new course form – visible only in assignmentMode */}
                  {assignmentMode && (
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-base font-semibold mb-4">
                        Assign New Course
                      </h4>

                      <div className="space-y-4">
                        {/* Course selector */}
                        <div>
                          <Label>Course</Label>
                          {loadingDeptCourses ? (
                            <div className="h-10 flex items-center text-sm text-muted-foreground">
                              Loading courses...
                            </div>
                          ) : departmentCourses.length === 0 ? (
                            <div className="text-sm text-amber-600 dark:text-amber-400">
                              No courses available in department
                            </div>
                          ) : (
                            <Select
                              value={selectedCourseId}
                              onValueChange={setSelectedCourseId}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select course..." />
                              </SelectTrigger>
                              <SelectContent>
                                {departmentCourses.map((c: any) => {
                                  const isAlreadyAssigned =
                                    teacher.assignedCourses.some(
                                      (ac) => ac.id === c.id // or compare courseId if you have it
                                    );
                                  return (
                                    <SelectItem
                                      key={c.id}
                                      value={String(c.id)}
                                      disabled={isAlreadyAssigned}
                                      className={
                                        isAlreadyAssigned ? "opacity-50" : ""
                                      }
                                    >
                                      {c.code} – {c.title}
                                      {isAlreadyAssigned &&
                                        " (already assigned)"}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* BCYS selector */}
                        <div>
                          <Label>Batch / Class / Year / Semester</Label>
                          {loadingBcys ? (
                            <div className="h-10 flex items-center text-sm text-muted-foreground">
                              Loading...
                            </div>
                          ) : (
                            <Select
                              value={selectedBcysId}
                              onValueChange={setSelectedBcysId}
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select period..." />
                              </SelectTrigger>
                              <SelectContent>
                                {classYearBatch.map((item: any) => (
                                  <SelectItem
                                    key={item.id}
                                    value={String(item.id)}
                                  >
                                    {item.name ||
                                      item.displayName ||
                                      `ID ${item.id}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <Button
                          onClick={handleAssignCourse}
                          disabled={
                            !selectedCourseId ||
                            !selectedBcysId ||
                            loadingDeptCourses ||
                            loadingBcys ||
                            saving
                          }
                          className="w-full"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            "Assign Course"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete confirmation modal */}
                {confirmDeleteId && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full border-destructive/30">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-destructive mb-3">
                          Remove this course assignment?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          This will permanently delete the assignment{" "}
                          <strong>
                            and all related student assessments / records
                          </strong>
                          .
                          <br />
                          This action <strong>cannot be undone</strong>.
                        </p>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingAssignmentId !== null}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRevokeCourse(confirmDeleteId)}
                            disabled={deletingAssignmentId !== null}
                          >
                            {deletingAssignmentId === confirmDeleteId
                              ? "Removing..."
                              : "Remove"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64 bg-muted" />
        <Card className="bg-card border-border">
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row gap-10">
              <Skeleton className="h-40 w-40 rounded-full bg-muted" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-10 w-96 bg-muted" />
                <Skeleton className="h-8 w-64 bg-muted" />
                <Skeleton className="h-6 w-48 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
