import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Edit,
  Shield,
  User,
  Users,
  AlertCircle,
  Home,
  Camera,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AcademicProgression } from "../../components/Extra/AcademicProgression"; // Adjust path as needed

export default function StudentProfile() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  const { toast } = useToast();
  const [showAcademicProgression, setShowAcademicProgression] = useState(false);
  // Add sample data for demo (replace with actual API call later)
  const [academicProgressionData, setAcademicProgressionData] = useState(null);
  const [loadingProgression, setLoadingProgression] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState(false);
  // Add these new state variables for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState<any>({});
  const [originalData, setOriginalData] = useState<any>({});

  // Dropdown data
  const [departments, setDepartments] = useState<any[]>([]);
  const [schoolBackgrounds, setSchoolBackgrounds] = useState<any[]>([]);
  const [impairments, setImpairments] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // Password form
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // File upload
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const userRole = location.pathname.includes("registrar")
    ? "registrar"
    : "general-manager";
  const isEditable = userRole === "registrar";

  useEffect(() => {
    fetchStudentData();
    fetchDropdownData();
  }, [id]);

  //==========================
  // Function to fetch academic progression data
  const fetchAcademicProgression = async () => {
    if (!id) return;

    // Use the userId from studentData (not the route param id)
    // The studentData.userId is the actual user account ID needed for the endpoint
    const userId = studentData?.userId;

    if (!userId) {
      toast({
        title: "Error",
        description: "Student user ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingProgression(true);

      // Make the API call using the userId from studentData
      const response = await apiService.get(
        `/registrar/students/${userId}/academic-progress`,
      );

      // Transform the response to match component props
      const transformedData = {
        ...response,
        // Map takenCourses to include isReleased property
        takenCourses:
          response.takenCourses?.map((course: any) => ({
            ...course,
            isReleased: course.released, // Map 'released' from API to 'isReleased' for component
          })) || [],
        // Ensure remainingCourses is always an array
        remainingCourses: response.remainingCourses || [],
      };

      // Set the transformed data
      setAcademicProgressionData(transformedData);
    } catch (err: any) {
      console.error("Error fetching academic progression:", err);

      // Extract error message from response
      let errorMessage = "Failed to load academic progression data";

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        switch (status) {
          case 404:
            errorMessage =
              errorData?.error || `Student not found with user ID: ${userId}`;
            break;
          case 400:
            errorMessage = errorData?.error || "Invalid student user ID";
            break;
          case 401:
            errorMessage = "You are not authenticated. Please login again.";
            break;
          case 403:
            errorMessage =
              "You don't have permission to view academic progression data.";
            break;
          case 500:
            errorMessage =
              errorData?.error ||
              "An unexpected error occurred. Please try again later.";
            break;
          default:
            errorMessage =
              errorData?.error || errorData?.message || "Failed to load data";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }

      toast({
        title: "Error Loading Academic Progress",
        description: errorMessage,
        variant: "destructive",
      });

      setAcademicProgressionData(null);
    } finally {
      setLoadingProgression(false);
    }
  };

  // Handle button click
  const handleViewProgression = async () => {
    if (!showAcademicProgression && !academicProgressionData) {
      await fetchAcademicProgression();
    }
    setShowAcademicProgression(!showAcademicProgression);
  };
  //==========================

  const fetchStudentData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.get(`${endPoints.students}/${id}`);
      setStudentData(response || {});
      setOriginalData(response || {});
    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError("Failed to load student data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch all dropdown data
      const [
        depts,
        backgrounds,
        impairmentsResp,
        batchResp,
        statusResp,
        regionsResp,
        zonesResp,
        woredasResp,
      ] = await Promise.all([
        apiService.get(endPoints.departments).catch(() => []),
        apiService.get(endPoints.schoolBackgrounds).catch(() => []),
        apiService.get(endPoints.impairments).catch(() => []),
        apiService.get(endPoints.BatchClassYearSemesters).catch(() => []),
        apiService.get(endPoints.studentStatus).catch(() => []),
        apiService.get(endPoints.allRegion).catch(() => []),
        apiService.get(endPoints.allZones).catch(() => []),
        apiService.get(endPoints.allWoreda).catch(() => []),
      ]);

      setDepartments(Array.isArray(depts) ? depts : []);
      setSchoolBackgrounds(Array.isArray(backgrounds) ? backgrounds : []);
      setImpairments(Array.isArray(impairmentsResp) ? impairmentsResp : []);
      setBatches(Array.isArray(batchResp) ? batchResp : []);
      setStatuses(Array.isArray(statusResp) ? statusResp : []);
      setRegions(Array.isArray(regionsResp) ? regionsResp : []);
      setZones(Array.isArray(zonesResp) ? zonesResp : []);
      setWoredas(Array.isArray(woredasResp) ? woredasResp : []);
    } catch (err: any) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setStudentData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    // Convert empty string to null for optional fields
    const finalValue = value === "" || value === "_none" ? null : value;
    setStudentData((prev: any) => ({
      ...prev,
      [name]: finalValue,
      // Reset dependent fields when parent changes
      ...(name === "placeOfBirthRegionCode" && {
        placeOfBirthZoneCode: null,
        placeOfBirthWoredaCode: null,
      }),
      ...(name === "placeOfBirthZoneCode" && {
        placeOfBirthWoredaCode: null,
      }),
      ...(name === "currentAddressRegionCode" && {
        currentAddressZoneCode: null,
        currentAddressWoredaCode: null,
      }),
      ...(name === "currentAddressZoneCode" && {
        currentAddressWoredaCode: null,
      }),
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseFloat(value);
    setStudentData((prev: any) => ({ ...prev, [name]: numValue }));
  };

  const handleIntInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const intValue = value === "" ? "" : parseInt(value, 10);
    setStudentData((prev: any) => ({ ...prev, [name]: intValue }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      setSelectedPhotoFile(file);

      // Create FormData
      const formData = new FormData();
      const emptyData = {};
      formData.append(
        "data",
        new Blob([JSON.stringify(emptyData)], {
          type: "application/json",
        }),
      );
      formData.append("studentPhoto", file);

      // Show uploading toast
      toast({
        title: "Uploading photo...",
        description: "Please wait while we upload your image.",
      });

      // Use apiService.put with FormData
      const response = await apiService.put(
        `${endPoints.students}/${id}`,
        formData,
      );

      console.log("Photo upload successful:", response);

      // Success toast
      toast({
        title: "Photo Updated Successfully!",
        description: "Student profile picture has been updated.",
        variant: "default",
      });

      // Update student data with new photo from response
      if (response.student?.studentPhoto) {
        setStudentData((prev: any) => ({
          ...prev,
          studentPhoto: response.student.studentPhoto,
        }));
      } else if (response.photo) {
        setStudentData((prev: any) => ({
          ...prev,
          studentPhoto: response.photo,
        }));
      }
    } catch (err: any) {
      console.error("Error uploading photo:", err);

      let errorMessage = "Failed to upload photo";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Photo Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  // Helper function to filter zones by region
  const getFilteredZones = (regionCode: string) => {
    if (!regionCode || !zones.length) return [];
    return zones.filter((zone) => {
      // Handle different zone object structures
      const zoneRegionCode =
        zone.region?.regionCode || zone.regionCode || zone.region;
      return zoneRegionCode == regionCode;
    });
  };

  // Helper function to filter woredas by zone
  const getFilteredWoredas = (zoneCode: string) => {
    if (!zoneCode || !woredas.length) return [];
    return woredas.filter((woreda) => {
      // Handle different woreda object structures
      const woredaZoneCode =
        woreda.zone?.zoneCode || woreda.zoneCode || woreda.zone;
      return woredaZoneCode == zoneCode;
    });
  };

  const handleSave = async () => {
    try {
      // Create FormData
      const formData = new FormData();

      // Prepare payload according to API documentation
      const payload = {
        // Personal Info
        firstNameENG: studentData.firstNameENG || "",
        firstNameAMH: studentData.firstNameAMH || "",
        fatherNameENG: studentData.fatherNameENG || "",
        fatherNameAMH: studentData.fatherNameAMH || "",
        grandfatherNameENG: studentData.grandfatherNameENG || "",
        grandfatherNameAMH: studentData.grandfatherNameAMH || "",
        
        // Mother's fields removed
        
        gender: studentData.gender || "MALE",
        age: studentData.age ? parseInt(studentData.age) : null,
        phoneNumber: studentData.phoneNumber || "",
        email: studentData.email || "",
        dateOfBirthGC: studentData.dateOfBirthGC || null,
        dateOfBirthEC: studentData.dateOfBirthEC || null,
        maritalStatus: studentData.maritalStatus || "SINGLE",
        
        // New Grade 12 fields
        grade12Result: studentData.grade12Result ? parseFloat(studentData.grade12Result) : null,
        yearOfExamG12: studentData.yearOfExamG12 || null,
        nationalExamIdG12: studentData.nationalExamIdG12 || null,

        // Place of Birth
        placeOfBirthWoredaCode: studentData.placeOfBirthWoredaCode || null,
        placeOfBirthZoneCode: studentData.placeOfBirthZoneCode || null,
        placeOfBirthRegionCode: studentData.placeOfBirthRegionCode || null,

        // Current Address
        currentAddressWoredaCode: studentData.currentAddressWoredaCode || null,
        currentAddressZoneCode: studentData.currentAddressZoneCode || null,
        currentAddressRegionCode: studentData.currentAddressRegionCode || null,

        // Academic Info
        impairmentCode: studentData.impairmentCode || null,
        schoolBackgroundId: studentData.schoolBackgroundId
          ? parseInt(studentData.schoolBackgroundId)
          : null,
        departmentEnrolledId: studentData.departmentEnrolledId
          ? parseInt(studentData.departmentEnrolledId)
          : null,
        programModalityCode: studentData.programModalityCode || "RG",
        batchClassYearSemesterId: studentData.batchClassYearSemesterId
          ? parseInt(studentData.batchClassYearSemesterId)
          : null,
        studentRecentStatusId: studentData.studentRecentStatusId
          ? parseInt(studentData.studentRecentStatusId)
          : null,

        // Enrollment Dates
        dateEnrolledGC: studentData.dateEnrolledGC || null,
        dateEnrolledEC: studentData.dateEnrolledEC || null,
        
        // New Date fields
        dateClassEndGC: studentData.dateClassEndGC || null,
        dateGraduated: studentData.dateGraduated || null,
        entryYearGC: studentData.entryYearGC || null,
        entryYearEC: studentData.entryYearEC || null,

        // Emergency Contact
        contactPersonFirstNameENG: studentData.contactPersonFirstNameENG || "",
        contactPersonFirstNameAMH: studentData.contactPersonFirstNameAMH || "",
        contactPersonLastNameENG: studentData.contactPersonLastNameENG || "",
        contactPersonLastNameAMH: studentData.contactPersonLastNameAMH || "",
        contactPersonPhoneNumber: studentData.contactPersonPhoneNumber || "",
        contactPersonRelation: studentData.contactPersonRelation || "",

        // Remarks
        remark: studentData.remark || "",

        // Transfer status
        isTransfer: studentData.isTransfer || false,
      };

      console.log("Saving payload:", JSON.stringify(payload, null, 2));

      // Add data as JSON blob
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        }),
      );

      // If there's a selected photo file, add it
      if (selectedPhotoFile) {
        formData.append("studentPhoto", selectedPhotoFile);
        console.log("Adding photo file:", selectedPhotoFile.name);
      }

      // Show loading toast
      toast({
        title: "Updating profile...",
        description: "Please wait while we save the changes.",
      });

      // Use apiService.put with FormData
      const response = await apiService.put(
        `${endPoints.students}/${id}`,
        formData,
        {
          headers: {
            // Don't set Content-Type - browser will set it with boundary for FormData
          },
        },
      );

      console.log("Update successful:", response);

      // Success toast with student name
      toast({
        title: "Profile Updated Successfully!",
        description: `${response.student?.firstNameENG || "Student"}'s information has been updated.`,
        variant: "default",
      });

      setEditMode(false);
      setSelectedPhotoFile(null);

      // Update local state with new data
      if (response.student) {
        setStudentData(response.student);
        setOriginalData(response.student);
      } else {
        // Refresh data from server
        fetchStudentData();
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);

      // Error handling with appropriate toast messages
      let errorMessage = "Failed to update profile";
      let errorTitle = "Update Failed";

      if (err.response) {
        // The request was made and the server responded with a status code
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);

        // Extract error message from response based on your error format
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        }

        // Customize title based on status code
        switch (err.response.status) {
          case 400:
            errorTitle = "Validation Error";
            break;
          case 404:
            errorTitle = "Not Found";
            break;
          case 409:
            errorTitle = "Duplicate Entry";
            break;
          case 500:
            errorTitle = "Server Error";
            break;
          default:
            errorTitle = `Error ${err.response.status}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        errorMessage = "No response from server. Please check your connection.";
        errorTitle = "Connection Error";
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || "Unknown error occurred";
        errorTitle = "Request Error";
      }

      // Show error toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setStudentData(originalData);
    setSelectedPhotoFile(null);
    setEditMode(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.newPassword.trim()) {
      setPasswordError("New password cannot be empty");
      toast({
        title: "Invalid Password",
        description: "New password cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Resetting password...",
        description: "Please wait while we update the password.",
      });

      await apiService.post(
        endPoints.resetStudentPassword.replace(
          ":studentUserId",
          studentData.userId || id,
        ),
        {
          newPassword: formData.newPassword,
        },
      );

      toast({
        title: "Password Reset Successful",
        description: "Student password has been updated successfully.",
        variant: "default",
      });

      setPasswordForm(false);
      setFormData({ newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err: any) {
      console.error("Error resetting password:", err);

      let errorMessage = "Failed to reset password";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setPasswordError(errorMessage);

      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (err) {
      return date;
    }
  };

  const formatDateForInput = (date: string) => {
    if (!date) return "";
    try {
      // Handle both date formats (YYYY-MM-DD and DD-MM-YYYY)
      if (date.includes("-")) {
        const parts = date.split("-");
        if (parts[0].length === 4) {
          // Already in YYYY-MM-DD format
          return date;
        } else if (parts[2].length === 4) {
          // Convert DD-MM-YYYY to YYYY-MM-DD
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
            2,
            "0",
          )}`;
        }
      }
      // If it's a Date object or ISO string
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
      return date;
    } catch (err) {
      console.error("Error formatting date:", date, err);
      return date;
    }
  };

  // Helper function to safely get non-empty string value
  const getSafeSelectValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "_none"; // Use a special value for "none/empty"
    }
    return String(value);
  };

  // Get display name for dropdowns
  const getDisplayName = (
    list: any[],
    value: any,
    valueKey: string,
    displayKey: string,
  ) => {
    if (!Array.isArray(list) || !value) return "";
    const item = list.find(
      (item) =>
        item &&
        (item[valueKey] == value ||
          item.id == value ||
          item.code == value ||
          String(item[valueKey]) === String(value)),
    );
    return item?.[displayKey] || "";
  };

  // Filter items to ensure they have valid values for Select.Item
  const getValidSelectItems = (arr: any[], valueKey: string): any[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (item) => item != null && item[valueKey] != null && item[valueKey] !== "",
    );
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  if (error || !studentData || Object.keys(studentData).length === 0)
    return (
      <div className="text-center p-10 text-red-600">
        {error || "Student not found"}
      </div>
    );

  const fullNameEng = `${studentData.firstNameENG || ""} ${
    studentData.fatherNameENG || ""
  } ${studentData.grandfatherNameENG || ""}`.trim();
  const fullNameAmh = `${studentData.firstNameAMH || ""} ${
    studentData.fatherNameAMH || ""
  } ${studentData.grandfatherNameAMH || ""}`.trim();

  // Get filtered zones and woredas for both place of birth and current address
  const filteredPlaceOfBirthZones = getFilteredZones(
    studentData.placeOfBirthRegionCode,
  );
  const filteredPlaceOfBirthWoredas = getFilteredWoredas(
    studentData.placeOfBirthZoneCode,
  );
  const filteredCurrentAddressZones = getFilteredZones(
    studentData.currentAddressRegionCode,
  );
  const filteredCurrentAddressWoredas = getFilteredWoredas(
    studentData.currentAddressZoneCode,
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Student Profile</h1>
          <p className="text-gray-600">ID: {studentData.username}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          {isEditable &&
            (editMode ? (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save
                </Button>
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Basic Info */}
        <Card>
          <CardHeader className="text-center">
            <div className="relative">
              <Avatar className="w-32 h-32 mx-auto border-4 border-blue-100">
                {studentData.studentPhoto ? (
                  <AvatarImage
                    src={`data:image/jpeg;base64,${studentData.studentPhoto}`}
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {studentData.firstNameENG?.[0] || ""}
                    {studentData.fatherNameENG?.[0] || ""}
                  </AvatarFallback>
                )}
              </Avatar>
              {editMode && (
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 rounded-full"
                  onClick={triggerPhotoUpload}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            <CardTitle className="mt-4">{fullNameEng || "Unknown"}</CardTitle>
            <CardDescription className="text-lg">
              {fullNameAmh || "Unknown"}
            </CardDescription>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <Badge
                variant={
                  studentData.documentStatus === "COMPLETE"
                    ? "default"
                    : "secondary"
                }
              >
                {studentData.documentStatus || "PENDING"}
              </Badge>
              <Badge>
                {getDisplayName(
                  [
                    { modalityCode: "RG", modality: "Regular" },
                    { modalityCode: "EV", modality: "Evening" },
                    { modalityCode: "WE", modality: "Weekend" },
                    { modalityCode: "DL", modality: "Distance Learning" },
                  ],
                  studentData.programModalityCode,
                  "modalityCode",
                  "modality",
                )}
              </Badge>
              {studentData.isTransfer && (
                <Badge variant="outline">Transfer</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Username</Label>
              {editMode ? (
                <Input
                  name="username"
                  value={studentData.username || ""}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                />
              ) : (
                <div className="font-medium">
                  {studentData.username || "N/A"}
                </div>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {editMode ? (
                <Input
                  type="email"
                  name="email"
                  value={studentData.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              ) : (
                <div className="font-medium">{studentData.email || "N/A"}</div>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {editMode ? (
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={studentData.phoneNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="font-medium">
                  {studentData.phoneNumber || "N/A"}
                </div>
              )}
            </div>
            <div>
              <Label>Batch</Label>
              {editMode ? (
                <Select
                  value={getSafeSelectValue(
                    studentData.batchClassYearSemesterId,
                  )}
                  onValueChange={(v) =>
                    handleSelectChange(
                      "batchClassYearSemesterId",
                      v === "_none" ? null : v ? parseInt(v) : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Select batch</SelectItem>
                    {getValidSelectItems(batches, "bcysId").map((b) => (
                      <SelectItem key={b.bcysId} value={String(b.bcysId)}>
                        {b.batchClassYearSemesterName ||
                          b.name ||
                          `Batch ${b.bcysId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="font-medium">
                  {studentData.batchClassYearSemesterName || "Not Assigned"}
                </div>
              )}
            </div>
            <div>
              <Label>Status</Label>
              {editMode ? (
                <Select
                  value={getSafeSelectValue(studentData.studentRecentStatusId)}
                  onValueChange={(v) =>
                    handleSelectChange(
                      "studentRecentStatusId",
                      v === "_none" ? null : v ? parseInt(v) : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Select status</SelectItem>
                    {getValidSelectItems(statuses, "id").map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.studentRecentStatusName ||
                          s.statusName ||
                          `Status ${s.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="font-medium">
                  {studentData.studentRecentStatusName || "Unknown"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {[
                {
                  label: "First Name (ENG)",
                  amh: "firstNameAMH",
                  eng: "firstNameENG",
                },
                {
                  label: "Father's Name (ENG)",
                  amh: "fatherNameAMH",
                  eng: "fatherNameENG",
                },
                {
                  label: "Grandfather's Name (ENG)",
                  amh: "grandfatherNameAMH",
                  eng: "grandfatherNameENG",
                },
                // Mother's fields removed
              ].map((field) => (
                <div key={field.eng} className="space-y-2">
                  <Label>{field.label}</Label>
                  {editMode ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        name={field.eng}
                        value={studentData[field.eng] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label.split(" (")[0]}`}
                      />
                      <Input
                        name={field.amh}
                        value={studentData[field.amh] || ""}
                        onChange={handleInputChange}
                        className="text-right"
                        dir="rtl"
                        placeholder={`የ${field.label.split(" (")[0]} ስም`}
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <div>{studentData[field.eng] || "N/A"}</div>
                      <div className="text-right text-gray-600" dir="rtl">
                        {studentData[field.amh] || "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div>
                <Label>Gender</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.gender)}
                    onValueChange={(v) =>
                      handleSelectChange("gender", v === "_none" ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="font-medium">
                    {studentData.gender === "MALE" ? "Male" : "Female"}
                  </div>
                )}
              </div>

              <div>
                <Label>Marital Status</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.maritalStatus)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "maritalStatus",
                        v === "_none" ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="font-medium">
                    {studentData.maritalStatus || "Unknown"}
                  </div>
                )}
              </div>

              <div>
                <Label>Date of Birth (GC)</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateOfBirthGC"
                    value={formatDateForInput(studentData.dateOfBirthGC)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateOfBirthGC) || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Date of Birth (EC)</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateOfBirthEC"
                    value={formatDateForInput(studentData.dateOfBirthEC)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateOfBirthEC) || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Age</Label>
                {editMode ? (
                  <Input
                    type="number"
                    name="age"
                    value={studentData.age || ""}
                    onChange={handleIntInputChange}
                    placeholder="Enter age"
                  />
                ) : (
                  <div>{studentData.age || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Impairment</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.impairmentCode)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "impairmentCode",
                        v === "_none" ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impairment">
                        {studentData.impairmentCode
                          ? getDisplayName(
                              impairments,
                              studentData.impairmentCode,
                              "disabilityCode",
                              "disability",
                            )
                          : "Select impairment"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {getValidSelectItems(impairments, "disabilityCode").map(
                        (i) => (
                          <SelectItem
                            key={i.disabilityCode}
                            value={String(i.disabilityCode)}
                          >
                            {i.disability || `Impairment ${i.disabilityCode}`}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      impairments,
                      studentData.impairmentCode,
                      "disabilityCode",
                      "disability",
                    ) || "None"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Place of Birth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2" /> Place of Birth
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Region</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(
                      studentData.placeOfBirthRegionCode,
                    )}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "placeOfBirthRegionCode",
                        v === "_none" ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region">
                        {studentData.placeOfBirthRegionCode
                          ? getDisplayName(
                              regions,
                              studentData.placeOfBirthRegionCode,
                              "regionCode",
                              "region",
                            )
                          : "Select region"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select region</SelectItem>
                      {getValidSelectItems(regions, "regionCode").map((r) => (
                        <SelectItem
                          key={r.regionCode}
                          value={String(r.regionCode)}
                        >
                          {r.region || `Region ${r.regionCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      regions,
                      studentData.placeOfBirthRegionCode,
                      "regionCode",
                      "region",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Zone</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.placeOfBirthZoneCode)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "placeOfBirthZoneCode",
                        v === "_none" ? null : v,
                      )
                    }
                    disabled={!studentData.placeOfBirthRegionCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone">
                        {studentData.placeOfBirthZoneCode
                          ? getDisplayName(
                              zones,
                              studentData.placeOfBirthZoneCode,
                              "zoneCode",
                              "zone",
                            )
                          : "Select zone"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select zone</SelectItem>
                      {filteredPlaceOfBirthZones.map((z) => (
                        <SelectItem key={z.zoneCode} value={String(z.zoneCode)}>
                          {z.zone || `Zone ${z.zoneCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      zones,
                      studentData.placeOfBirthZoneCode,
                      "zoneCode",
                      "zone",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Woreda</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(
                      studentData.placeOfBirthWoredaCode,
                    )}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "placeOfBirthWoredaCode",
                        v === "_none" ? null : v,
                      )
                    }
                    disabled={!studentData.placeOfBirthZoneCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select woreda">
                        {studentData.placeOfBirthWoredaCode
                          ? getDisplayName(
                              woredas,
                              studentData.placeOfBirthWoredaCode,
                              "woredaCode",
                              "woreda",
                            )
                          : "Select woreda"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select woreda</SelectItem>
                      {filteredPlaceOfBirthWoredas.map((w) => (
                        <SelectItem
                          key={w.woredaCode}
                          value={String(w.woredaCode)}
                        >
                          {w.woreda || `Woreda ${w.woredaCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      woredas,
                      studentData.placeOfBirthWoredaCode,
                      "woredaCode",
                      "woreda",
                    ) || "N/A"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2" /> Current Address
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Region</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(
                      studentData.currentAddressRegionCode,
                    )}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "currentAddressRegionCode",
                        v === "_none" ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region">
                        {studentData.currentAddressRegionCode
                          ? getDisplayName(
                              regions,
                              studentData.currentAddressRegionCode,
                              "regionCode",
                              "region",
                            )
                          : "Select region"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select region</SelectItem>
                      {getValidSelectItems(regions, "regionCode").map((r) => (
                        <SelectItem
                          key={r.regionCode}
                          value={String(r.regionCode)}
                        >
                          {r.region || `Region ${r.regionCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      regions,
                      studentData.currentAddressRegionCode,
                      "regionCode",
                      "region",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Zone</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(
                      studentData.currentAddressZoneCode,
                    )}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "currentAddressZoneCode",
                        v === "_none" ? null : v,
                      )
                    }
                    disabled={!studentData.currentAddressRegionCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone">
                        {studentData.currentAddressZoneCode
                          ? getDisplayName(
                              zones,
                              studentData.currentAddressZoneCode,
                              "zoneCode",
                              "zone",
                            )
                          : "Select zone"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select zone</SelectItem>
                      {filteredCurrentAddressZones.map((z) => (
                        <SelectItem key={z.zoneCode} value={String(z.zoneCode)}>
                          {z.zone || `Zone ${z.zoneCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      zones,
                      studentData.currentAddressZoneCode,
                      "zoneCode",
                      "zone",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Woreda</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(
                      studentData.currentAddressWoredaCode,
                    )}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "currentAddressWoredaCode",
                        v === "_none" ? null : v,
                      )
                    }
                    disabled={!studentData.currentAddressZoneCode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select woreda">
                        {studentData.currentAddressWoredaCode
                          ? getDisplayName(
                              woredas,
                              studentData.currentAddressWoredaCode,
                              "woredaCode",
                              "woreda",
                            )
                          : "Select woreda"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select woreda</SelectItem>
                      {filteredCurrentAddressWoredas.map((w) => (
                        <SelectItem
                          key={w.woredaCode}
                          value={String(w.woredaCode)}
                        >
                          {w.woreda || `Woreda ${w.woredaCode}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      woredas,
                      studentData.currentAddressWoredaCode,
                      "woredaCode",
                      "woreda",
                    ) || "N/A"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Grade 12 Result</Label>
                {editMode ? (
                  <Input
                    type="number"
                    step="0.01"
                    name="grade12Result"
                    value={studentData.grade12Result || ""}
                    onChange={handleNumberInputChange}
                    placeholder="Enter grade 12 result"
                  />
                ) : (
                  <div className="font-medium">
                    {studentData.grade12Result || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Year of Exam (G12)</Label>
                {editMode ? (
                  <Input
                    type="number"
                    name="yearOfExamG12"
                    value={studentData.yearOfExamG12 || ""}
                    onChange={handleIntInputChange}
                    placeholder="e.g., 2015"
                  />
                ) : (
                  <div>{studentData.yearOfExamG12 || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>National Exam ID (G12)</Label>
                {editMode ? (
                  <Input
                    type="text"
                    name="nationalExamIdG12"
                    value={studentData.nationalExamIdG12 || ""}
                    onChange={handleInputChange}
                    placeholder="Enter national exam ID"
                  />
                ) : (
                  <div>{studentData.nationalExamIdG12 || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Date Class End (GC)</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateClassEndGC"
                    value={formatDateForInput(studentData.dateClassEndGC)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateClassEndGC) || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Date Graduated</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateGraduated"
                    value={formatDateForInput(studentData.dateGraduated)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateGraduated) || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Entry Year (GC)</Label>
                {editMode ? (
                  <Input
                    type="number"
                    name="entryYearGC"
                    value={studentData.entryYearGC || ""}
                    onChange={handleIntInputChange}
                    placeholder="e.g., 2016"
                  />
                ) : (
                  <div>{studentData.entryYearGC || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Entry Year (EC)</Label>
                {editMode ? (
                  <Input
                    type="number"
                    name="entryYearEC"
                    value={studentData.entryYearEC || ""}
                    onChange={handleIntInputChange}
                    placeholder="e.g., 2008"
                  />
                ) : (
                  <div>{studentData.entryYearEC || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Department</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.departmentEnrolledId)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "departmentEnrolledId",
                        v === "_none" ? null : v ? parseInt(v, 10) : null,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department">
                        {studentData.departmentEnrolledId
                          ? getDisplayName(
                              departments,
                              studentData.departmentEnrolledId,
                              "dptID",
                              "deptName",
                            )
                          : "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Select department</SelectItem>
                      {getValidSelectItems(departments, "dptID").map((d) => (
                        <SelectItem key={d.dptID} value={String(d.dptID)}>
                          {d.deptName || `Department ${d.dptID}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      departments,
                      studentData.departmentEnrolledId,
                      "dptID",
                      "deptName",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>School Background</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.schoolBackgroundId)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "schoolBackgroundId",
                        v === "_none" ? null : v ? parseInt(v) : null,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school background">
                        {studentData.schoolBackgroundId
                          ? getDisplayName(
                              schoolBackgrounds,
                              studentData.schoolBackgroundId,
                              "id",
                              "background",
                            )
                          : "Select school background"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">
                        Select school background
                      </SelectItem>
                      {getValidSelectItems(schoolBackgrounds, "id").map(
                        (sb) => (
                          <SelectItem key={sb.id} value={String(sb.id)}>
                            {sb.background || `Background ${sb.id}`}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      schoolBackgrounds,
                      studentData.schoolBackgroundId,
                      "id",
                      "background",
                    ) || "N/A"}
                  </div>
                )}
              </div>

              <div>
                <Label>Program Modality</Label>
                {editMode ? (
                  <Select
                    value={getSafeSelectValue(studentData.programModalityCode)}
                    onValueChange={(v) =>
                      handleSelectChange(
                        "programModalityCode",
                        v === "_none" ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select modality">
                        {studentData.programModalityCode
                          ? getDisplayName(
                              [
                                { modalityCode: "RG", modality: "Regular" },
                                { modalityCode: "EV", modality: "Evening" },
                                { modalityCode: "WE", modality: "Weekend" },
                                {
                                  modalityCode: "DL",
                                  modality: "Distance Learning",
                                },
                              ],
                              studentData.programModalityCode,
                              "modalityCode",
                              "modality",
                            )
                          : "Select modality"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RG">Regular</SelectItem>
                      <SelectItem value="EV">Evening</SelectItem>
                      <SelectItem value="WE">Weekend</SelectItem>
                      <SelectItem value="DL">Distance Learning</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getDisplayName(
                      [
                        { modalityCode: "RG", modality: "Regular" },
                        { modalityCode: "EV", modality: "Evening" },
                        { modalityCode: "WE", modality: "Weekend" },
                        { modalityCode: "DL", modality: "Distance Learning" },
                      ],
                      studentData.programModalityCode,
                      "modalityCode",
                      "modality",
                    ) || "Unknown"}
                  </div>
                )}
              </div>

              <div>
                <Label>Date Enrolled (GC)</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateEnrolledGC"
                    value={formatDateForInput(studentData.dateEnrolledGC)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateEnrolledGC) || "N/A"}</div>
                )}
              </div>

              <div>
                <Label>Date Enrolled (EC)</Label>
                {editMode ? (
                  <Input
                    type="date"
                    name="dateEnrolledEC"
                    value={formatDateForInput(studentData.dateEnrolledEC)}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div>{formatDate(studentData.dateEnrolledEC) || "N/A"}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="isTransfer">Transfer Student</Label>
                {editMode ? (
                  <input
                    type="checkbox"
                    id="isTransfer"
                    checked={studentData.isTransfer || false}
                    onChange={(e) =>
                      handleSelectChange("isTransfer", e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                ) : (
                  <div>{studentData.isTransfer ? "Yes" : "No"}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {[
                {
                  label: "First Name",
                  eng: "contactPersonFirstNameENG",
                  amh: "contactPersonFirstNameAMH",
                },
                {
                  label: "Last Name",
                  eng: "contactPersonLastNameENG",
                  amh: "contactPersonLastNameAMH",
                },
              ].map((f) => (
                <div key={f.eng}>
                  <Label>{f.label}</Label>
                  {editMode ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        name={f.eng}
                        value={studentData[f.eng] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                      <Input
                        name={f.amh}
                        value={studentData[f.amh] || ""}
                        onChange={handleInputChange}
                        className="text-right"
                        placeholder={`የ${f.label} ስም`}
                      />
                    </div>
                  ) : (
                    <div>
                      <div>{studentData[f.eng] || "N/A"}</div>
                      <div className="text-right text-gray-600">
                        {studentData[f.amh] || "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div>
                <Label>Phone</Label>
                {editMode ? (
                  <Input
                    name="contactPersonPhoneNumber"
                    value={studentData.contactPersonPhoneNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div>{studentData.contactPersonPhoneNumber || "N/A"}</div>
                )}
              </div>
              <div>
                <Label>Relation</Label>
                {editMode ? (
                  <Input
                    name="contactPersonRelation"
                    value={studentData.contactPersonRelation || ""}
                    onChange={handleInputChange}
                    placeholder="Enter relation"
                  />
                ) : (
                  <div>{studentData.contactPersonRelation || "N/A"}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2" /> Remarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  name="remark"
                  value={studentData.remark || ""}
                  onChange={handleInputChange}
                  placeholder="Enter any remarks about the student"
                  rows={4}
                />
              ) : (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  {studentData.remark || "No remarks"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          {isEditable && (
            <>
              <Button
                onClick={() => setPasswordForm(!passwordForm)}
                className="w-full"
              >
                {passwordForm ? "Cancel" : "Change Student Password"}
              </Button>
              {passwordForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Shield className="inline mr-2" /> Change Student's
                        Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-4"
                      >
                        {/* New Password Field with Eye Button */}
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Confirm Password Field with Eye Button */}
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {passwordError && (
                          <div className="text-red-600 text-sm">
                            {passwordError}
                          </div>
                        )}

                        <Button type="submit" className="w-full">
                          Update Password
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Academic Progression Section */}
          <div className="mt-6">
            <Button
              onClick={handleViewProgression}
              variant="outline"
              className={`w-full flex items-center justify-center gap-2 py-6 border-2 transition-all relative ${
                loadingProgression
                  ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 cursor-wait"
                  : "border-dashed hover:border-solid"
              }`}
              disabled={loadingProgression}
            >
              {loadingProgression ? (
                // Loading state with pulsing effect
                <>
                  <div className="relative">
                    <div className="animate-ping absolute inset-0 h-5 w-5 rounded-full bg-blue-400 opacity-75"></div>
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent relative"></div>
                  </div>
                  <span className="font-medium animate-pulse">
                    Fetching academic data...
                  </span>
                </>
              ) : (
                // Normal state
                <>
                  <GraduationCap
                    className={`h-5 w-5 transition-transform ${showAcademicProgression ? "rotate-180" : ""}`}
                  />
                  <span className="font-medium">
                    {showAcademicProgression ? "Hide" : "View"} Academic
                    Progression
                  </span>
                  {academicProgressionData && (
                    <Badge variant="secondary" className="ml-2">
                      {academicProgressionData.totalTakenCourses || 0} Completed
                    </Badge>
                  )}
                </>
              )}
            </Button>

            <AnimatePresence>
              {showAcademicProgression && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <AcademicProgression
                    {...academicProgressionData}
                    isLoading={loadingProgression}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}