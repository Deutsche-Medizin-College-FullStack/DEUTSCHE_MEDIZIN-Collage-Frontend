// "use client";

// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { UserPlus, ArrowLeft, GraduationCap } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function CreateTeacher() {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     qualification: "",
//     specialization: "",
//     experience: "",
//     courses: [] as string[],
//     password: "",
//     confirmPassword: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const qualifications = [
//     "Bachelor's Degree",
//     "Master's Degree",
//     "PhD",
//     "MD",
//     "Postgraduate Diploma",
//     "Professional Certificate",
//   ];

//   const specializations = [
//     "Internal Medicine",
//     "Surgery",
//     "Pediatrics",
//     "Obstetrics & Gynecology",
//     "Pharmacology",
//     "Anatomy",
//     "Physiology",
//     "Pathology",
//     "Microbiology",
//     "Biochemistry",
//     "Public Health",
//     "Nursing",
//     "Radiology",
//     "Laboratory Science",
//   ];

//   const availableCourses = [
//     "BIO101 - General Biology",
//     "CHE201 - Organic Chemistry",
//     "PHY110 - Physics I",
//     "MAT130 - Calculus",
//     "ANA101 - Human Anatomy",
//     "PHY201 - Human Physiology",
//     "PHM301 - Pharmacology",
//     "MIC201 - Microbiology",
//     "BCH201 - Biochemistry",
//     "PAT301 - Pathology",
//     "NUR101 - Fundamentals of Nursing",
//     "RAD201 - Radiographic Techniques",
//   ];

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleCourseToggle = (course: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       courses: prev.courses.includes(course)
//         ? prev.courses.filter((c) => c !== course)
//         : [...prev.courses, course],
//     }));
//   };

//   const validateForm = () => {
//     if (
//       !formData.firstName ||
//       !formData.lastName ||
//       !formData.email ||
//       !formData.phone ||
//       !formData.qualification ||
//       !formData.specialization ||
//       !formData.experience ||
//       !formData.password
//     ) {
//       toast({
//         title: "Validation Error",
//         description: "All required fields must be filled",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast({
//         title: "Password Mismatch",
//         description: "Passwords do not match",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (formData.password.length < 6) {
//       toast({
//         title: "Password Too Short",
//         description: "Password must be at least 6 characters long",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (formData.courses.length === 0) {
//       toast({
//         title: "Course Selection Required",
//         description: "Please select at least one course",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       toast({
//         title: "Success",
//         description: "Teacher created successfully",
//       });

//       // Reset form
//       setFormData({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phone: "",
//         qualification: "",
//         specialization: "",
//         experience: "",
//         courses: [],
//         password: "",
//         confirmPassword: "",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create teacher",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Link to="/head/dashboard">
//           <Button variant="outline" size="sm">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>
//         </Link>
//         <h1 className="text-3xl font-bold">Create Teacher</h1>
//       </div>

//       <Card className="max-w-4xl">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <GraduationCap className="h-5 w-5" />
//             Teacher Information
//           </CardTitle>
//           <CardDescription>
//             Create a new teacher account with login credentials and course
//             assignments
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Personal Information */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Personal Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     value={formData.firstName}
//                     onChange={(e) =>
//                       handleInputChange("firstName", e.target.value)
//                     }
//                     placeholder="Enter first name"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     value={formData.lastName}
//                     onChange={(e) =>
//                       handleInputChange("lastName", e.target.value)
//                     }
//                     placeholder="Enter last name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => handleInputChange("email", e.target.value)}
//                     placeholder="Enter email address"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => handleInputChange("phone", e.target.value)}
//                     placeholder="Enter phone number"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Professional Information */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">
//                 Professional Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="qualification">Highest Qualification</Label>
//                   <Select
//                     value={formData.qualification}
//                     onValueChange={(value) =>
//                       handleInputChange("qualification", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select qualification" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {qualifications.map((qual) => (
//                         <SelectItem key={qual} value={qual}>
//                           {qual}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="specialization">Specialization</Label>
//                   <Select
//                     value={formData.specialization}
//                     onValueChange={(value) =>
//                       handleInputChange("specialization", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select specialization" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {specializations.map((spec) => (
//                         <SelectItem key={spec} value={spec}>
//                           {spec}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="experience">Years of Experience</Label>
//                 <Input
//                   id="experience"
//                   type="number"
//                   min="0"
//                   value={formData.experience}
//                   onChange={(e) =>
//                     handleInputChange("experience", e.target.value)
//                   }
//                   placeholder="Enter years of experience"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Course Assignment */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Course Assignment</h3>
//               <div className="space-y-2">
//                 <Label>Select Courses to Teach</Label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-4">
//                   {availableCourses.map((course) => (
//                     <label
//                       key={course}
//                       className="flex items-center space-x-2 cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={formData.courses.includes(course)}
//                         onChange={() => handleCourseToggle(course)}
//                         className="rounded"
//                       />
//                       <span className="text-sm">{course}</span>
//                     </label>
//                   ))}
//                 </div>
//                 {formData.courses.length > 0 && (
//                   <div className="text-sm text-muted-foreground">
//                     Selected: {formData.courses.length} course(s)
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Login Credentials */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Login Credentials</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) =>
//                       handleInputChange("password", e.target.value)
//                     }
//                     placeholder="Enter password"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     value={formData.confirmPassword}
//                     onChange={(e) =>
//                       handleInputChange("confirmPassword", e.target.value)
//                     }
//                     placeholder="Confirm password"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-4 pt-4">
//               <Button type="submit" disabled={isLoading} className="flex-1">
//                 {isLoading ? "Creating..." : "Create Teacher"}
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() =>
//                   setFormData({
//                     firstName: "",
//                     lastName: "",
//                     email: "",
//                     phone: "",
//                     qualification: "",
//                     specialization: "",
//                     experience: "",
//                     courses: [],
//                     password: "",
//                     confirmPassword: "",
//                   })
//                 }
//               >
//                 Clear Form
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
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
