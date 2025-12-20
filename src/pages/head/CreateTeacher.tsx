"use client";

import { useState, useEffect, useRef, use } from "react";
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
import { ArrowLeft, GraduationCap, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

export default function CreateTeacher() {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");

  // Cascading address states
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [zones, setZones] = useState<{ value: string; label: string }[]>([]);
  const [woredas, setWoredas] = useState<{ value: string; label: string }[]>(
    []
  );
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedImpairment, setSelectedImpairment] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<{ value: string; label: string }[]>(
    []
  );
  const [loadingWoredas, setLoadingWoredas] = useState(false);
  const [loadingImpairments, setLoadingImpairments] = useState(true);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [impairments, setImpairments] = useState<
    { value: string; label: string }[]
  >([]);
  // Load regions on mount
  // useEffect(() => {
  //   const fetchImpairment = async () => {
  //     try {
  //       const impairmentReps = await apiClient.get(endPoints.impairments);
  //       console.log(impairmentReps);
  //       setImpairments(
  //         (impairmentReps.data || [])
  //           .map((i: any) => ({
  //             value: i.disabilityCode || i.code || i.id,
  //             label: i.disability || i.name || i.label,
  //           }))
  //           .filter((opt) => opt.value && opt.label)
  //       );
  //     } catch (err) {
  //       console.log("erroro on something");
  //     } finally {
  //       setLoadingImpairments(false);
  //     }
  //   };
  //   fetchImpairment();
  // }, []);
  useEffect(() => {
    const fetchImpairment = async () => {
      setLoadingImpairments(true); // important: reset on retry
      try {
        const impairmentReps = await apiClient.get(endPoints.impairments);
        console.log("Impairments response:", impairmentReps);

        const formatted = (impairmentReps.data || [])
          .map((i: any) => ({
            value: i.disabilityCode || i.impairmentCode || i.code || i.id,
            label: i.disability || i.impairment || i.name || i.label,
          }))
          .filter(
            (opt): opt is { value: string; label: string } =>
              opt.value != null &&
              opt.value !== "" &&
              opt.label != null &&
              opt.label !== ""
          );

        setImpairments(formatted);
      } catch (err) {
        console.error("Failed to load impairments:", err);
        setImpairments([]); // ensure it's an array
      } finally {
        setLoadingImpairments(false); // ALWAYS run this
      }
    };

    fetchImpairment();
  }, []);
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const courses = await apiClient.get(endPoints.departments);
        console.log(courses);
        const formatted = (courses.data || [])
          .map((i: any) => ({
            value: i.departmentCode || i.dptID || i.id,
            label: i.deptName || i.name || i.label,
          }))
          .filter(
            (opt): opt is { value: string; label: string } =>
              opt.value != null &&
              opt.value !== "" &&
              opt.label != null &&
              opt.label !== ""
          );
        console.log(courses);
        setCourses(formatted);
      } catch (err) {
        console.log("error on fetching courses" + err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await apiClient.get(endPoints.regions); // adjust if endpoint is different
        const formatted = (response.data || []).map((r: any) => ({
          value: r.code || r.id || r.regionCode,
          label: r.name || r.region,
        }));
        console.log(response);
        setRegions(formatted);
      } catch (err) {
        alert("Failed to load regions");
      }
    };
    fetchRegions();
  }, []);

  // Fetch zones when region changes

  const handleRegionChange = async (regionCode: string) => {
    setZones([]);
    setWoredas([]);
    if (!regionCode) return;

    setLoadingZones(true);
    try {
      const response = await apiClient.get(
        // endPoints.zonesByRegion?.replace(":regionCode", regionCode) ||
        //   `/api/zones?region=${regionCode}`
        `${endPoints.zonesByRegion}/${regionCode}`
      );
      console.log(response);
      const formatted = (response.data || []).map((z: any) => ({
        value: z.code || z.id || z.zoneCode,
        label: z.name || z.zone,
      }));
      setZones(formatted);
    } catch (err) {
      alert("Failed to load zones");
    } finally {
      setLoadingZones(false);
    }
  };

  // Fetch woredas when zone changes
  const handleZoneChange = async (zoneCode: string) => {
    setWoredas([]);
    if (!zoneCode) return;

    setLoadingWoredas(true);
    try {
      const response = await apiClient.get(
        // endPoints.woredasByZone?.replace(":zoneCode", zoneCode) ||
        //   `/api/woredas?zone=${zoneCode}`
        `${endPoints.woredasByZone}/${zoneCode}`
      );
      console.log(response);
      const formatted = (response.data || []).map((w: any) => ({
        value: w.code || w.id || w.woredaCode,
        label: w.name || w.woreda,
      }));

      setWoredas(formatted);
    } catch (err) {
      alert("Failed to load woredas");
    } finally {
      setLoadingWoredas(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const selectedCourses = formData.getAll("courses") as string[];

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
      courseAssignments:
        selectedCourses.length > 0
          ? selectedCourses.map((id) => ({ courseId: Number(id), bcysId: 4 }))
          : [],
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
      const response = await apiClient.post(
        endPoints.registerTeacher,
        multipart
      );
      alert(
        `Teacher registered successfully!\nUser ID: ${response.data.userId}`
      );
      e.currentTarget.reset();
      setPhotoPreview(null);
      setDocumentName("");
      setZones([]);
      setWoredas([]);
    } catch (error: any) {
      alert(
        "Error: " + (error.response?.data?.message || "Registration failed")
      );
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
                {/* ... (same as before: names, gender, DOB GC/EC, marital, impairment) */}
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
                {/* <div className="space-y-2">
                  <Label>Impairment Code (if any)</Label>
                  <Input name="impairmentCode" placeholder="e.g., VISUAL" />
                </div> */}
                <div className="space-y-2 md:col-span-2">
                  {/* <Label>
                    Information about Impairment (if any) (Optional)
                  </Label> */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Information about Impairment (if any): (Optional)
                    </label>
                    <select
                      onChange={(e) => setSelectedImpairment(e.target.value)}
                      value={selectedImpairment}
                      name="impairmentCode"
                      // value={formData.impairmentCode}
                      //  onChange={handleInputChange}
                      className="w-full bg-white dark:bg-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Impairment</option>
                      {impairments.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Marital Status:
              </label>
              <div className="flex flex-wrap gap-4">
                {["Single", "Married", "Divorced", "Separated"].map(
                  (status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="maritalStatus"
                        value={status}
                        checked={maritalStatus === status}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="mr-2"
                      />
                      {status}
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Current Address - Cascading */}
            {/* Current Address - Cascading */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">
                Current Address (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    name="currentAddressRegionCode"
                    onValueChange={(value) => {
                      handleRegionChange(value);
                      // Clear dependent fields
                      const form = document.querySelector(
                        "form"
                      ) as HTMLFormElement;
                      if (form) {
                        form.elements
                          .namedItem("currentAddressZoneCode")
                          ?.setAttribute("value", "");
                        form.elements
                          .namedItem("currentAddressWoredaCode")
                          ?.setAttribute("value", "");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          regions.length === 0
                            ? "Loading regions..."
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

                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select
                    name="currentAddressZoneCode"
                    disabled={zones.length === 0 || loadingZones}
                    onValueChange={(value) => handleZoneChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingZones
                            ? "Loading zones..."
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
                            ? "Loading woredas..."
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
            {/* Rest of the form remains the same: Contact, Employment, Credentials, Courses, Attachments */}
            {/* ... (copy from previous version) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Assign Courses
              </label>
              <div className="relative">
                <select
                  name="departmentEnrolledId"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="appearance-none w-full bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Choose Course</option>
                  {courses.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
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

      <style jsx global>{`
        .font-geez {
          font-family: "Nyala", "Abyssinica SIL", sans-serif;
        }
      `}</style>
    </div>
  );
}
