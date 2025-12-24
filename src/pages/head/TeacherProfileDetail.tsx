// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
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
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   ArrowLeft,
//   Mail,
//   Phone,
//   Calendar,
//   Briefcase,
//   MapPin,
//   Edit3,
//   Save,
//   X,
//   AlertCircle,
//   BookOpen,
//   Upload,
// } from "lucide-react";
// import apiClient from "@/components/api/apiClient";

// type AssignedCourse = {
//   id: number;
//   courseCode: string;
//   courseTitle: string;
//   totalCrHrs: number;
//   batchClassYearSemesterName: string;
// };

// type TeacherDetail = {
//   userId: number;
//   username: string;
//   firstNameAmharic: string;
//   lastNameAmharic: string;
//   firstNameEnglish: string;
//   lastNameEnglish: string;
//   gender: "MALE" | "FEMALE";
//   dateOfBirthGC: string;
//   phoneNumber: string;
//   email: string;
//   departmentName: string;
//   hireDateGC: string;
//   title: string;
//   yearsOfExperience: number;
//   impairmentCode?: string;
//   impairmentName?: string;
//   maritalStatus: string;
//   woredaCode?: string;
//   woredaName?: string;
//   zoneCode?: string;
//   zoneName?: string;
//   regionCode?: string;
//   regionName?: string;
//   photographBase64?: string;
//   assignedCourses: AssignedCourse[];
// };

// export default function TeacherProfileDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
//   const [originalTeacher, setOriginalTeacher] = useState<TeacherDetail | null>(
//     null
//   );
//   const [editMode, setEditMode] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const photoInputRef = useRef<HTMLInputElement>(null);
//   const documentInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (!id) {
//       setError("No teacher ID provided.");
//       setLoading(false);
//       return;
//     }

//     const fetchTeacher = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await apiClient.get(`/teachers/${id}`);
//         if (res.data) {
//           setTeacher(res.data);
//           setOriginalTeacher(res.data);
//         } else {
//           setError("No data received from server.");
//         }
//       } catch (err: any) {
//         console.error("Failed to fetch teacher:", err);
//         setError(
//           err.response?.status === 404
//             ? "Teacher not found."
//             : err.response?.data?.message || "Failed to load teacher profile."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeacher();
//   }, [id]);

//   const handleSave = async () => {
//     if (!teacher || !originalTeacher) return;

//     setSaving(true);
//     setError(null);
//     setSuccess(null);

//     const formData = new FormData();

//     // Only add fields that changed or are non-empty
//     const payload: any = {};

//     if (
//       teacher.firstNameAmharic !== originalTeacher.firstNameAmharic &&
//       teacher.firstNameAmharic
//     )
//       payload.firstNameAmharic = teacher.firstNameAmharic;
//     if (
//       teacher.lastNameAmharic !== originalTeacher.lastNameAmharic &&
//       teacher.lastNameAmharic
//     )
//       payload.lastNameAmharic = teacher.lastNameAmharic;
//     if (
//       teacher.firstNameEnglish !== originalTeacher.firstNameEnglish &&
//       teacher.firstNameEnglish
//     )
//       payload.firstNameEnglish = teacher.firstNameEnglish;
//     if (
//       teacher.lastNameEnglish !== originalTeacher.lastNameEnglish &&
//       teacher.lastNameEnglish
//     )
//       payload.lastNameEnglish = teacher.lastNameEnglish;
//     if (teacher.gender !== originalTeacher.gender)
//       payload.gender = teacher.gender;
//     if (teacher.dateOfBirthGC !== originalTeacher.dateOfBirthGC)
//       payload.dateOfBirthGC = teacher.dateOfBirthGC;
//     if (
//       teacher.phoneNumber !== originalTeacher.phoneNumber &&
//       teacher.phoneNumber
//     )
//       payload.phoneNumber = teacher.phoneNumber;
//     if (teacher.email !== originalTeacher.email)
//       payload.email = teacher.email || null;
//     if (teacher.title !== originalTeacher.title)
//       payload.title = teacher.title || null;
//     if (teacher.yearsOfExperience !== originalTeacher.yearsOfExperience)
//       payload.yearsOfExperience = teacher.yearsOfExperience;
//     if (teacher.impairmentCode !== originalTeacher.impairmentCode)
//       payload.impairmentCode = teacher.impairmentCode || "";
//     if (teacher.maritalStatus !== originalTeacher.maritalStatus)
//       payload.maritalStatus = teacher.maritalStatus || null;
//     if (teacher.currentAddressRegionCode !== originalTeacher.regionCode)
//       payload.currentAddressRegionCode = teacher.currentAddressRegionCode || "";
//     if (teacher.currentAddressZoneCode !== originalTeacher.zoneCode)
//       payload.currentAddressZoneCode = teacher.currentAddressZoneCode || "";
//     if (teacher.currentAddressWoredaCode !== originalTeacher.woredaCode)
//       payload.currentAddressWoredaCode = teacher.currentAddressWoredaCode || "";

//     if (Object.keys(payload).length > 0) {
//       formData.append(
//         "data",
//         new Blob([JSON.stringify(payload)], { type: "application/json" })
//       );
//     }

//     const newPhoto = photoInputRef.current?.files?.[0];
//     const newDoc = documentInputRef.current?.files?.[0];

//     if (newPhoto) formData.append("photograph", newPhoto);
//     if (newDoc) formData.append("document", newDoc);

//     try {
//       const res = await apiClient.patch(`/teachers/${id}`, formData);
//       setTeacher(res.data);
//       setOriginalTeacher(res.data);
//       setSuccess("Teacher updated successfully!");
//       setEditMode(false);
//     } catch (err: any) {
//       console.error("Update failed:", err);
//       setError(err.response?.data?.message || "Failed to update teacher.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCancel = () => {
//     setTeacher(originalTeacher);
//     setEditMode(false);
//     setError(null);
//     setSuccess(null);
//     if (photoInputRef.current) photoInputRef.current.value = "";
//     if (documentInputRef.current) documentInputRef.current.value = "";
//   };

//   if (loading) return <LoadingSkeleton />;
//   if (error || !teacher) return <ErrorState error={error} />;

//   const fullNameEnglish = `${teacher.firstNameEnglish} ${teacher.lastNameEnglish}`;
//   const fullNameAmharic = `${teacher.firstNameAmharic} ${teacher.lastNameAmharic}`;

//   return (
//     <div className="min-h-screen bg-background py-8 px-4">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-8">
//           <div>
//             <Button
//               variant="ghost"
//               onClick={() => navigate(-1)}
//               className="mb-4"
//             >
//               <ArrowLeft className="h-5 w-5 mr-2" />
//               Back to Teachers
//             </Button>
//             <h1 className="text-4xl font-bold">Teacher Profile</h1>
//             <p className="text-muted-foreground mt-2">
//               Complete details and assigned courses
//             </p>
//           </div>

//           {!editMode ? (
//             <Button onClick={() => setEditMode(true)}>
//               <Edit3 className="h-4 w-4 mr-2" />
//               Edit Profile
//             </Button>
//           ) : (
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={handleCancel}
//                 disabled={saving}
//               >
//                 <X className="h-4 w-4 mr-2" />
//                 Cancel
//               </Button>
//               <Button onClick={handleSave} disabled={saving}>
//                 <Save className="h-4 w-4 mr-2" />
//                 {saving ? "Saving..." : "Save Changes"}
//               </Button>
//             </div>
//           )}
//         </div>

//         {success && (
//           <Alert className="mb-6 border-green-600">
//             <AlertDescription className="text-green-800">
//               {success}
//             </AlertDescription>
//           </Alert>
//         )}

//         {error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         {/* Rest of your beautiful profile layout with editable fields */}
//         {/* I'll keep it clean — you can replace inputs when editMode is true */}
//         <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
//           <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-12">
//             <div className="flex flex-col md:flex-row items-center gap-10">
//               <div className="relative">
//                 <Avatar className="h-40 w-40 ring-8 ring-background shadow-2xl">
//                   <AvatarImage
//                     src={teacher.photographBase64 || undefined}
//                     alt={fullNameEnglish}
//                   />
//                   <AvatarFallback className="text-4xl font-bold bg-primary/20">
//                     {teacher.firstNameEnglish[0]}
//                     {teacher.lastNameEnglish[0]}
//                   </AvatarFallback>
//                 </Avatar>
//                 {editMode && (
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     className="absolute bottom-0 right-0 rounded-full"
//                     onClick={() => photoInputRef.current?.click()}
//                   >
//                     <Upload className="h-4 w-4" />
//                   </Button>
//                 )}
//                 <input
//                   type="file"
//                   accept="image/*"
//                   ref={photoInputRef}
//                   className="hidden"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) {
//                       const reader = new FileReader();
//                       reader.onloadend = () => {
//                         setTeacher((prev) =>
//                           prev
//                             ? {
//                                 ...prev,
//                                 photographBase64: reader.result as string,
//                               }
//                             : null
//                         );
//                       };
//                       reader.readAsDataURL(file);
//                     }
//                   }}
//                 />
//               </div>

//               <div className="text-center md:text-left">
//                 {editMode ? (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <Input
//                         value={teacher.firstNameEnglish}
//                         onChange={(e) =>
//                           setTeacher((prev) =>
//                             prev
//                               ? { ...prev, firstNameEnglish: e.target.value }
//                               : null
//                           )
//                         }
//                         placeholder="First Name (English)"
//                       />
//                       <Input
//                         value={teacher.lastNameEnglish}
//                         onChange={(e) =>
//                           setTeacher((prev) =>
//                             prev
//                               ? { ...prev, lastNameEnglish: e.target.value }
//                               : null
//                           )
//                         }
//                         placeholder="Last Name (English)"
//                       />
//                       <Input
//                         value={teacher.firstNameAmharic}
//                         onChange={(e) =>
//                           setTeacher((prev) =>
//                             prev
//                               ? { ...prev, firstNameAmharic: e.target.value }
//                               : null
//                           )
//                         }
//                         placeholder="መጀመሪያ ስም"
//                         className="font-geez"
//                       />
//                       <Input
//                         value={teacher.lastNameAmharic}
//                         onChange={(e) =>
//                           setTeacher((prev) =>
//                             prev
//                               ? { ...prev, lastNameAmharic: e.target.value }
//                               : null
//                           )
//                         }
//                         placeholder="ያባሪ ስም"
//                         className="font-geez"
//                       />
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     <h2 className="text-4xl font-bold">{fullNameEnglish}</h2>
//                     <p className="text-2xl font-geez text-primary mt-2">
//                       {fullNameAmharic}
//                     </p>
//                   </>
//                 )}

//                 <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
//                   {editMode ? (
//                     <Input
//                       value={teacher.title}
//                       onChange={(e) =>
//                         setTeacher((prev) =>
//                           prev ? { ...prev, title: e.target.value } : null
//                         )
//                       }
//                       placeholder="Academic Title"
//                       className="max-w-xs"
//                     />
//                   ) : (
//                     <>
//                       <Badge variant="secondary" className="text-lg py-1 px-4">
//                         {teacher.title}
//                       </Badge>
//                       <Badge variant="outline" className="text-lg py-1 px-4">
//                         {teacher.departmentName}
//                       </Badge>
//                     </>
//                   )}
//                 </div>
//                 <p className="text-muted-foreground mt-4">
//                   ID:{" "}
//                   <span className="font-mono font-bold">{teacher.userId}</span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Editable Details */}
//           <div className="p-8">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               <div className="lg:col-span-2 space-y-8">
//                 {/* Professional Info */}
//                 <div>
//                   <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
//                     <Briefcase className="h-6 w-6 text-primary" />
//                     Professional Information
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <Label>Phone Number</Label>
//                       {editMode ? (
//                         <Input
//                           value={teacher.phoneNumber}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev
//                                 ? { ...prev, phoneNumber: e.target.value }
//                                 : null
//                             )
//                           }
//                         />
//                       ) : (
//                         <p className="font-medium">{teacher.phoneNumber}</p>
//                       )}
//                     </div>
//                     <div>
//                       <Label>Email</Label>
//                       {editMode ? (
//                         <Input
//                           type="email"
//                           value={teacher.email}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev ? { ...prev, email: e.target.value } : null
//                             )
//                           }
//                         />
//                       ) : (
//                         <p className="font-medium break-all">{teacher.email}</p>
//                       )}
//                     </div>
//                     <div>
//                       <Label>Years of Experience</Label>
//                       {editMode ? (
//                         <Input
//                           type="number"
//                           value={teacher.yearsOfExperience}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev
//                                 ? {
//                                     ...prev,
//                                     yearsOfExperience:
//                                       Number(e.target.value) || 0,
//                                   }
//                                 : null
//                             )
//                           }
//                         />
//                       ) : (
//                         <p className="font-medium">
//                           {teacher.yearsOfExperience} years
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <Label>Marital Status</Label>
//                       {editMode ? (
//                         <Select
//                           value={teacher.maritalStatus}
//                           onValueChange={(v) =>
//                             setTeacher((prev) =>
//                               prev ? { ...prev, maritalStatus: v } : null
//                             )
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="SINGLE">Single</SelectItem>
//                             <SelectItem value="MARRIED">Married</SelectItem>
//                             <SelectItem value="DIVORCED">Divorced</SelectItem>
//                             <SelectItem value="WIDOWED">Widowed</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       ) : (
//                         <p className="font-medium capitalize">
//                           {teacher.maritalStatus.toLowerCase()}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Address */}
//                 {(teacher.regionName ||
//                   teacher.zoneName ||
//                   teacher.woredaName ||
//                   editMode) && (
//                   <div>
//                     <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
//                       <MapPin className="h-6 w-6 text-primary" />
//                       Current Address
//                     </h3>
//                     {editMode ? (
//                       <div className="grid grid-cols-3 gap-4">
//                         <Input
//                           placeholder="Region Code"
//                           value={teacher.currentAddressRegionCode || ""}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev
//                                 ? {
//                                     ...prev,
//                                     currentAddressRegionCode: e.target.value,
//                                   }
//                                 : null
//                             )
//                           }
//                         />
//                         <Input
//                           placeholder="Zone Code"
//                           value={teacher.currentAddressZoneCode || ""}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev
//                                 ? {
//                                     ...prev,
//                                     currentAddressZoneCode: e.target.value,
//                                   }
//                                 : null
//                             )
//                           }
//                         />
//                         <Input
//                           placeholder="Woreda Code"
//                           value={teacher.currentAddressWoredaCode || ""}
//                           onChange={(e) =>
//                             setTeacher((prev) =>
//                               prev
//                                 ? {
//                                     ...prev,
//                                     currentAddressWoredaCode: e.target.value,
//                                   }
//                                 : null
//                             )
//                           }
//                         />
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         {teacher.woredaName && (
//                           <p className="font-medium">{teacher.woredaName}</p>
//                         )}
//                         {teacher.zoneName && (
//                           <p className="text-muted-foreground">
//                             {teacher.zoneName}
//                           </p>
//                         )}
//                         {teacher.regionName && (
//                           <p className="text-muted-foreground">
//                             {teacher.regionName}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Supporting Document */}
//                 {editMode && (
//                   <div>
//                     <Label>Update Supporting Document (PDF)</Label>
//                     <Input
//                       type="file"
//                       accept="application/pdf"
//                       ref={documentInputRef}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Assigned Courses - Read Only */}
//               <div>
//                 <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
//                   <BookOpen className="h-6 w-6 text-primary" />
//                   Assigned Courses ({teacher.assignedCourses.length})
//                 </h3>
//                 <div className="space-y-4">
//                   {teacher.assignedCourses.length === 0 ? (
//                     <p className="text-muted-foreground italic">
//                       No courses assigned yet.
//                     </p>
//                   ) : (
//                     teacher.assignedCourses.map((course) => (
//                       <Card key={course.id} className="p-4">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="font-semibold">{course.courseCode}</p>
//                             <p className="text-sm mt-1">{course.courseTitle}</p>
//                             <p className="text-xs text-muted-foreground mt-2">
//                               {course.batchClassYearSemesterName}
//                             </p>
//                           </div>
//                           <Badge variant="secondary">
//                             {course.totalCrHrs} Cr.Hrs
//                           </Badge>
//                         </div>
//                       </Card>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Helper Components
// function LoadingSkeleton() {
//   return (
//     <div className="min-h-screen bg-background py-8 px-4">
//       <div className="max-w-5xl mx-auto space-y-8">
//         <Skeleton className="h-12 w-64" />
//         <Card>
//           <CardContent className="p-12">
//             <div className="flex gap-10">
//               <Skeleton className="h-40 w-40 rounded-full" />
//               <div className="space-y-4 flex-1">
//                 <Skeleton className="h-10 w-96" />
//                 <Skeleton className="h-8 w-64" />
//                 <Skeleton className="h-6 w-48" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// function ErrorState({ error }: { error: string | null }) {
//   const navigate = useNavigate();
//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center">
//       <div className="text-center space-y-6">
//         <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
//         <h2 className="text-3xl font-bold">Profile Not Found</h2>
//         <p className="text-xl text-muted-foreground max-w-md">
//           {error || "Unable to load teacher profile."}
//         </p>
//         <Button onClick={() => navigate(-1)} size="lg">
//           <ArrowLeft className="h-5 w-5 mr-2" />
//           Go Back
//         </Button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import apiClient from "@/components/api/apiClient";

type AssignedCourse = {
  id: number;
  courseCode: string;
  courseTitle: string;
  totalCrHrs: number;
  batchClassYearSemesterName: string;
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

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [originalTeacher, setOriginalTeacher] = useState<TeacherDetail | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      setError("No teacher ID provided.");
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/teachers/${id}`);
        setTeacher(res.data);
        setOriginalTeacher(structuredClone(res.data)); // deep copy
      } catch (err: any) {
        setError(
          err.response?.status === 404
            ? "Teacher not found."
            : err.response?.data?.message || "Failed to load teacher profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

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

  const handleSave = async () => {
    if (!teacher || !originalTeacher || !hasChanges()) {
      setEditMode(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    const payload: Record<string, any> = {};

    // Only include changed fields (backend ignores empty/missing ones)
    if (teacher.firstNameAmharic !== originalTeacher.firstNameAmharic) {
      payload.firstNameAmharic = teacher.firstNameAmharic.trim() || "";
    }
    if (teacher.lastNameAmharic !== originalTeacher.lastNameAmharic) {
      payload.lastNameAmharic = teacher.lastNameAmharic.trim() || "";
    }
    if (teacher.firstNameEnglish !== originalTeacher.firstNameEnglish) {
      payload.firstNameEnglish = teacher.firstNameEnglish.trim() || "";
    }
    if (teacher.lastNameEnglish !== originalTeacher.lastNameEnglish) {
      payload.lastNameEnglish = teacher.lastNameEnglish.trim() || "";
    }
    if (teacher.gender !== originalTeacher.gender) {
      payload.gender = teacher.gender;
    }
    if (teacher.dateOfBirthGC !== originalTeacher.dateOfBirthGC) {
      payload.dateOfBirthGC = teacher.dateOfBirthGC || null;
    }
    if (teacher.phoneNumber !== originalTeacher.phoneNumber) {
      payload.phoneNumber = teacher.phoneNumber.trim() || null;
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

    // Address fields – send empty string to clear
    if (
      teacher.currentAddressRegionCode !==
      originalTeacher.currentAddressRegionCode
    ) {
      payload.currentAddressRegionCode =
        teacher.currentAddressRegionCode?.trim() || "";
    }
    if (
      teacher.currentAddressZoneCode !== originalTeacher.currentAddressZoneCode
    ) {
      payload.currentAddressZoneCode =
        teacher.currentAddressZoneCode?.trim() || "";
    }
    if (
      teacher.currentAddressWoredaCode !==
      originalTeacher.currentAddressWoredaCode
    ) {
      payload.currentAddressWoredaCode =
        teacher.currentAddressWoredaCode?.trim() || "";
    }

    if (Object.keys(payload).length > 0) {
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    }

    const newPhoto = photoInputRef.current?.files?.[0];
    const newDoc = documentInputRef.current?.files?.[0];

    if (newPhoto) formData.append("photograph", newPhoto);
    if (newDoc) formData.append("document", newDoc);

    try {
      const res = await apiClient.patch(`/teachers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTeacher(res.data);
      setOriginalTeacher(structuredClone(res.data));
      setSuccess("Teacher profile updated successfully!");
      setEditMode(false);

      // Clear file inputs
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update teacher profile."
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
  if (error || !teacher) return <ErrorState error={error} />;

  const fullNameEnglish =
    `${teacher.firstNameEnglish} ${teacher.lastNameEnglish}`.trim();
  const fullNameAmharic =
    `${teacher.firstNameAmharic} ${teacher.lastNameAmharic}`.trim();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Teachers
            </Button>
            <h1 className="text-4xl font-bold">Teacher Profile</h1>
          </div>

          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
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
              <Button onClick={handleSave} disabled={saving || !hasChanges()}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {success && (
          <Alert className="mb-6 border-green-600 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
          {/* Hero / Photo Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <Avatar className="h-40 w-40 ring-8 ring-background shadow-2xl">
                  <AvatarImage
                    src={teacher.photographBase64}
                    alt={fullNameEnglish}
                  />
                  <AvatarFallback className="text-4xl font-bold bg-primary/20">
                    {teacher.firstNameEnglish?.[0]}
                    {teacher.lastNameEnglish?.[0]}
                  </AvatarFallback>
                </Avatar>

                {editMode && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
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
                  <div className="space-y-5">
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
                    <h2 className="text-4xl font-bold">{fullNameEnglish}</h2>
                    {fullNameAmharic && (
                      <p className="text-2xl font-geez text-primary mt-2">
                        {fullNameAmharic}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
                      {teacher.title && (
                        <Badge
                          variant="secondary"
                          className="text-lg py-1 px-4"
                        >
                          {teacher.title}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-lg py-1 px-4">
                        {teacher.departmentName}
                      </Badge>
                    </div>
                  </>
                )}

                <p className="text-muted-foreground mt-4">
                  ID:{" "}
                  <span className="font-mono font-bold">{teacher.userId}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left – Details */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-primary" />
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
                        <div className="flex items-center gap-2 font-medium">
                          <Phone className="h-4 w-4 text-muted-foreground" />
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
                        <div className="flex items-center gap-2 font-medium break-all">
                          <Mail className="h-4 w-4 text-muted-foreground" />
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
                        <p className="font-medium">
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
                        <p className="font-medium capitalize">
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
                        <p className="font-medium capitalize">
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
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {teacher.dateOfBirthGC || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Address */}
                {(editMode ||
                  teacher.regionName ||
                  teacher.zoneName ||
                  teacher.woredaName) && (
                  <section>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-primary" />
                      Current Address
                    </h3>

                    {editMode ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Region Code</Label>
                          <Input
                            value={teacher.currentAddressRegionCode || ""}
                            onChange={(e) =>
                              setTeacher((p) =>
                                p
                                  ? {
                                      ...p,
                                      currentAddressRegionCode: e.target.value,
                                    }
                                  : null
                              )
                            }
                            placeholder="e.g. AA"
                          />
                        </div>
                        <div>
                          <Label>Zone Code</Label>
                          <Input
                            value={teacher.currentAddressZoneCode || ""}
                            onChange={(e) =>
                              setTeacher((p) =>
                                p
                                  ? {
                                      ...p,
                                      currentAddressZoneCode: e.target.value,
                                    }
                                  : null
                              )
                            }
                            placeholder="e.g. Gulele"
                          />
                        </div>
                        <div>
                          <Label>Woreda Code</Label>
                          <Input
                            value={teacher.currentAddressWoredaCode || ""}
                            onChange={(e) =>
                              setTeacher((p) =>
                                p
                                  ? {
                                      ...p,
                                      currentAddressWoredaCode: e.target.value,
                                    }
                                  : null
                              )
                            }
                            placeholder="e.g. W01"
                          />
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

                {editMode && (
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
                )}
              </div>

              {/* Right – Assigned Courses (read-only) */}
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Assigned Courses ({teacher.assignedCourses.length})
                </h3>

                {teacher.assignedCourses.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No courses assigned yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teacher.assignedCourses.map((course) => (
                      <Card key={course.id} className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-semibold">{course.courseCode}</p>
                            <p className="text-sm mt-1">{course.courseTitle}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {course.batchClassYearSemesterName}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {course.totalCrHrs} Cr.Hrs
                          </Badge>
                        </div>
                      </Card>
                    ))}
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

/* ──────────────────────────────────────────────
   Helper Components (unchanged)
───────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-12">
            <div className="flex gap-10">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-10 w-96" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string | null }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
        <h2 className="text-3xl font-bold">Profile Not Found</h2>
        <p className="text-xl text-muted-foreground max-w-md">
          {error || "Unable to load teacher profile."}
        </p>
        <Button onClick={() => navigate(-1)} size="lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
