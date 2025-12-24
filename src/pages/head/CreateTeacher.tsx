"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, GraduationCap, X } from "lucide-react";
import { Link } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

export default function CreateTeacher() {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  // Address cascading
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [zones, setZones] = useState<{ value: string; label: string }[]>([]);
  const [woredas, setWoredas] = useState<{ value: string; label: string }[]>(
    []
  );
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingWoredas, setLoadingWoredas] = useState(false);

  // Impairments
  const [impairments, setImpairments] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingImpairments, setLoadingImpairments] = useState(true);

  // Courses - fetched from myDepartmentCourses (multi-select)
  const [courses, setCourses] = useState<
    {
      id: number;
      code: string;
      title: string;
      totalCrHrs: number;
      classYearName: string;
      semesterName: string;
    }[]
  >([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Fetch Impairments
  useEffect(() => {
    const fetchImpairments = async () => {
      setLoadingImpairments(true);
      try {
        const res = await apiClient.get(endPoints.impairments);
        const formatted = (res.data || [])
          .map((i: any) => ({
            value: i.disabilityCode || i.impairmentCode || i.code || i.id || "",
            label: i.disability || i.impairment || i.name || i.label || "",
          }))
          .filter(
            (opt): opt is { value: string; label: string } =>
              opt.value && opt.label
          );
        setImpairments(formatted);
      } catch (err) {
        console.error("Failed to load impairments:", err);
        setImpairments([]);
      } finally {
        setLoadingImpairments(false);
      }
    };
    fetchImpairments();
  }, []);

  // Fetch Regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await apiClient.get(endPoints.regions);
        const formatted = (res.data || [])
          .map((r: any) => ({
            value: r.code || r.id || r.regionCode || "",
            label: r.name || r.region || "",
          }))
          .filter((r) => r.value && r.label);
        setRegions(formatted);
      } catch (err) {
        alert("Failed to load regions");
      }
    };
    fetchRegions();
  }, []);

  // Fetch actual courses from myDepartmentCourses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await apiClient.get(endPoints.myDepartmentCourses);
        if (res.data && Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch courses:", err);
        if (err.response?.status === 404) {
          alert(
            "No department profile found. Please set up your department first."
          );
        } else if (err.response?.status === 500) {
          alert("Server error while loading courses.");
        } else {
          alert("Failed to load courses.");
        }
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Address cascading
  const handleRegionChange = async (regionCode: string) => {
    setZones([]);
    setWoredas([]);
    if (!regionCode) return;
    setLoadingZones(true);
    try {
      const res = await apiClient.get(
        `${endPoints.zonesByRegion}/${regionCode}`
      );
      const formatted = (res.data || []).map((z: any) => ({
        value: z.code || z.id || z.zoneCode || "",
        label: z.name || z.zone || "",
      }));
      setZones(formatted);
    } catch (err) {
      alert("Failed to load zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const handleZoneChange = async (zoneCode: string) => {
    setWoredas([]);
    if (!zoneCode) return;
    setLoadingWoredas(true);
    try {
      const res = await apiClient.get(`${endPoints.woredasByZone}/${zoneCode}`);
      const formatted = (res.data || []).map((w: any) => ({
        value: w.code || w.id || w.woredaCode || "",
        label: w.name || w.woreda || "",
      }));
      setWoredas(formatted);
    } catch (err) {
      alert("Failed to load woredas");
    } finally {
      setLoadingWoredas(false);
    }
  };

  // File handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file only");
        return;
      }
      setDocumentName(file.name);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removeDocument = () => {
    setDocumentName("");
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    const jsonPayload = {
      username: formData.get("username")?.toString().trim() || "",
      password: formData.get("password")?.toString().trim() || "",
      firstNameAmharic:
        formData.get("firstNameAmharic")?.toString().trim() || "",
      lastNameAmharic: formData.get("lastNameAmharic")?.toString().trim() || "",
      firstNameEnglish:
        formData.get("firstNameEnglish")?.toString().trim() || "",
      lastNameEnglish: formData.get("lastNameEnglish")?.toString().trim() || "",
      gender: formData.get("gender") || "MALE",
      dateOfBirthGC: formData.get("dateOfBirthGC")?.toString() || "",
      dateOfBirthEC: formData.get("dateOfBirthEC")?.toString() || "",
      phoneNumber: formData.get("phoneNumber")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      departmentId: formData.get("departmentId")
        ? Number(formData.get("departmentId"))
        : null,
      hireDateGC: formData.get("hireDateGC")?.toString() || "",
      hireDateEC: formData.get("hireDateEC")?.toString() || "",
      title: formData.get("title")?.toString().trim() || "",
      yearsOfExperience: formData.get("yearsOfExperience")
        ? Number(formData.get("yearsOfExperience"))
        : 0,
      impairmentCode: formData.get("impairmentCode")?.toString().trim() || "",
      maritalStatus: formData.get("maritalStatus") || "SINGLE",
      currentAddressRegionCode:
        formData.get("currentAddressRegionCode")?.toString().trim() || "",
      currentAddressZoneCode:
        formData.get("currentAddressZoneCode")?.toString().trim() || "",
      currentAddressWoredaCode:
        formData.get("currentAddressWoredaCode")?.toString().trim() || "",
      courseAssignments: selectedCourseIds.map((courseId) => ({
        courseId,
        bcysId: 4,
      })),
    };

    const required = [
      jsonPayload.username,
      jsonPayload.password,
      jsonPayload.firstNameAmharic,
      jsonPayload.lastNameAmharic,
      jsonPayload.firstNameEnglish,
      jsonPayload.lastNameEnglish,
      jsonPayload.gender,
      jsonPayload.dateOfBirthGC,
      jsonPayload.phoneNumber,
      jsonPayload.email,
      jsonPayload.departmentId,
      jsonPayload.hireDateGC,
      jsonPayload.title,
    ];

    if (required.some((f) => !f)) {
      console.log(required);
      alert("Please fill all required fields (*).");
      setIsLoading(false);
      return;
    }

    const multipart = new FormData();
    multipart.append(
      "data",
      new Blob([JSON.stringify(jsonPayload)], { type: "application/json" })
    );

    const photoFile = photoInputRef.current?.files?.[0];
    const docFile = documentInputRef.current?.files?.[0];
    if (photoFile) multipart.append("photograph", photoFile);
    if (docFile) multipart.append("document", docFile);

    try {
      const res = await apiClient.post(endPoints.registerTeacher, multipart);
      alert(`Teacher registered successfully`);
      setTimeout(() => {
        e.currentTarget.reset();
        setPhotoPreview(null);
        setDocumentName("");
        setZones([]);
        setWoredas([]);
        setSelectedCourseIds([]);
      }, 0);
    } catch (error: any) {
      let errorMessage = "Registration failed";

      // Axios error with response from backend
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert("Error: " + errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/head/teachers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teachers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Register New Teacher</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <GraduationCap className="h-8 w-8" />
            Teacher Registration
          </CardTitle>
          <CardDescription>Complete all required fields</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    First Name (Amharic) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="firstNameAmharic"
                    required
                    placeholder="አበበ"
                    className="font-geez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Last Name (Amharic) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="lastNameAmharic"
                    required
                    placeholder="በቀለ"
                    className="font-geez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    First Name (English) <span className="text-red-500">*</span>
                  </Label>
                  <Input name="firstNameEnglish" required placeholder="Abebe" />
                </div>
                <div className="space-y-2">
                  <Label>
                    Last Name (English) <span className="text-red-500">*</span>
                  </Label>
                  <Input name="lastNameEnglish" required placeholder="Bekele" />
                </div>
                <div className="space-y-2">
                  <Label>
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Date of Birth (GC) <span className="text-red-500">*</span>
                  </Label>
                  <Input name="dateOfBirthGC" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth (EC)</Label>
                  <Input name="dateOfBirthEC" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select name="maritalStatus">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Impairment (if any) (Optional)</Label>
                  <Select name="impairmentCode">
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingImpairments ? "Loading..." : "None"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {impairments.map((imp) => (
                        <SelectItem key={imp.value} value={imp.value}>
                          {imp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input name="phoneNumber" required placeholder="+251..." />
                </div>
                <div className="space-y-2">
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="teacher@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input name="username" required placeholder="teacher123" />
                </div>
                <div className="space-y-2">
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input name="password" type="password" required />
                </div>
              </div>
            </section>

            {/* Employment Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Employment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    Department ID <span className="text-red-500">*</span>
                  </Label>
                  <Input name="departmentId" type="number" value={JSON.parse(sessionStorage.getItem("Userdata") || "{}").departmentId || ""} readOnly required />
                </div>
                <div className="space-y-2">
                  <Label>
                    Hire Date (GC) <span className="text-red-500">*</span>
                  </Label>
                  <Input name="hireDateGC" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Hire Date (EC)</Label>
                  <Input name="hireDateEC" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input name="title" required placeholder="Lecturer" />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input name="yearsOfExperience" type="number" min="0" />
                </div>
              </div>
            </section>

            {/* Current Address */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Current Address (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    name="currentAddressRegionCode"
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          regions.length === 0 ? "Loading..." : "Select Region"
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
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select
                    name="currentAddressZoneCode"
                    disabled={zones.length === 0 || loadingZones}
                    onValueChange={handleZoneChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingZones
                            ? "Loading..."
                            : zones.length === 0
                            ? "Select Region first"
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
                <div className="space-y-2">
                  <Label>Woreda</Label>
                  <Select
                    name="currentAddressWoredaCode"
                    disabled={woredas.length === 0 || loadingWoredas}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingWoredas
                            ? "Loading..."
                            : woredas.length === 0
                            ? "Select Zone first"
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
            </section>

            {/* Attachments */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Attachments (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Photograph</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    onChange={handlePhotoChange}
                  />
                  {photoPreview && (
                    <div className="relative mt-4">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-0 right-0"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Supporting Document (PDF)</Label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    ref={documentInputRef}
                    onChange={handleDocumentChange}
                  />
                  {documentName && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">{documentName}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={removeDocument}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Assign Courses - Multi-Select Dropdown */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Assign Courses{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Optional)
                </span>
              </h2>

              {loadingCourses ? (
                <p className="text-gray-500">Loading courses...</p>
              ) : courses.length === 0 ? (
                <p className="text-amber-600">
                  No courses available for your department.
                </p>
              ) : (
                <Select
                  onValueChange={(value) => {
                    if (value && !selectedCourseIds.includes(Number(value))) {
                      setSelectedCourseIds([
                        ...selectedCourseIds,
                        Number(value),
                      ]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full min-h-12">
                    <SelectValue placeholder="Select courses to assign">
                      <div className="flex flex-wrap gap-2 items-center">
                        {selectedCourseIds.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select courses...
                          </span>
                        ) : (
                          <>
                            <span className="font-medium">
                              {selectedCourseIds.length} course(s) selected
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {selectedCourseIds.map((id) => {
                                const course = courses.find((c) => c.id === id);
                                if (!course) return null;
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                  >
                                    {course.code}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCourseIds(
                                          selectedCourseIds.filter(
                                            (cid) => cid !== id
                                          )
                                        );
                                      }}
                                      className="ml-1 rounded-full hover:bg-primary/20"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {courses.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={String(course.id)}
                        disabled={selectedCourseIds.includes(course.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {course.code} - {course.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {course.classYearName} • {course.semesterName} •{" "}
                            {course.totalCrHrs} Cr.Hrs
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedCourseIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCourseIds.map((id) => {
                    const course = courses.find((c) => c.id === id);
                    if (!course) return null;
                    return (
                      <div
                        key={id}
                        className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm"
                      >
                        <span>
                          <strong>{course.code}</strong> - {course.title}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCourseIds(
                              selectedCourseIds.filter((cid) => cid !== id)
                            )
                          }
                          className="rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            {/* Assign Courses - Simple Searchable Multi-Select Dropdown */}
            {/* Assign Courses - Searchable Multi-Select Dropdown (FIXED) */}

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-8">
              <Button type="reset" variant="outline" size="lg">
                Clear Form
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="px-10"
              >
                {isLoading ? "Registering..." : "Register Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
