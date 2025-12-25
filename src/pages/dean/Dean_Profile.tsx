"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Award,
  Building,
  CalendarDays,
  UserCircle,
  AlertCircle,
  Shield,
  GraduationCap,
  FileText,
  Loader2,
  Save,
  Edit,
  X,
  Camera,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

interface DeanProfileResponse {
  id: number;
  username: string;
  firstNameENG: string;
  firstNameAMH: string;
  fatherNameENG: string;
  fatherNameAMH: string;
  grandfatherNameENG: string;
  grandfatherNameAMH: string;
  gender: string;
  email: string;
  phoneNumber: string;
  hiredDateGC: string;
  title: string;
  photo: string | null;
  documents: string | null;
  role: string;
  residenceRegion: string;
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
  remarks?: string;
}

interface UpdateDeanRequest {
  firstNameENG?: string;
  firstNameAMH?: string;
  fatherNameENG?: string;
  fatherNameAMH?: string;
  grandfatherNameENG?: string;
  grandfatherNameAMH?: string;
  phoneNumber?: string;
  email?: string;
  title?: string;
  remarks?: string;
  residenceRegionCode?: string;
  residenceZoneCode?: string;
  residenceWoredaCode?: string;
}

export default function Dean_Profile() {
  const [profile, setProfile] = useState<DeanProfileResponse | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string>("dean_document.pdf");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UpdateDeanRequest>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch Dean profile
      const response = await apiClient.get<DeanProfileResponse>(
        endPoints.getDeanProfile
      );

      const data = response.data;

      // Handle photo data - check if it's base64 with or without data URL prefix
      if (data.photo) {
        let photoUrl = data.photo;
        // Check if it's already a data URL
        if (!photoUrl.startsWith('data:')) {
          // Add data URL prefix for base64 image
          photoUrl = `data:image/jpeg;base64,${data.photo}`;
        }
        setPhotoPreview(photoUrl);
      }

      // Handle documents
      if (data.documents) {
        if (typeof data.documents === 'string' && data.documents.startsWith('data:')) {
          setDocumentBase64(data.documents);
        } else if (typeof data.documents === 'string') {
          setDocumentBase64(`data:application/pdf;base64,${data.documents}`);
        }
      }

      setProfile(data);
      
      // Initialize form data
      setFormData({
        firstNameENG: data.firstNameENG,
        firstNameAMH: data.firstNameAMH,
        fatherNameENG: data.fatherNameENG,
        fatherNameAMH: data.fatherNameAMH,
        grandfatherNameENG: data.grandfatherNameENG,
        grandfatherNameAMH: data.grandfatherNameAMH,
        phoneNumber: data.phoneNumber,
        email: data.email,
        title: data.title,
        remarks: data.remarks || "",
        residenceRegionCode: data.residenceRegionCode,
        residenceZoneCode: data.residenceZoneCode,
        residenceWoredaCode: data.residenceWoredaCode,
      });

    } catch (err: any) {
      console.error("Failed to load dean profile:", err);
      
      // Handle 403 error specifically
      if (err.response?.status === 403) {
        if (err.response?.data?.error?.includes("Not a Dean")) {
          setError("Access Denied: You do not have Dean privileges.");
        } else {
          setError("Access forbidden: You do not have permission to access this resource.");
        }
      } else {
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to load profile. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare the request data
      const jsonData: UpdateDeanRequest = {
        firstNameENG: formData.firstNameENG,
        firstNameAMH: formData.firstNameAMH,
        fatherNameENG: formData.fatherNameENG,
        fatherNameAMH: formData.fatherNameAMH,
        grandfatherNameENG: formData.grandfatherNameENG,
        grandfatherNameAMH: formData.grandfatherNameAMH,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        title: formData.title,
        remarks: formData.remarks,
        residenceRegionCode: formData.residenceRegionCode,
        residenceZoneCode: formData.residenceZoneCode,
        residenceWoredaCode: formData.residenceWoredaCode,
      };

      // Create JSON string with proper encoding for Unicode characters
      const jsonString = JSON.stringify(jsonData);

      console.log("Sending JSON data:", jsonString);
      console.log("JSON data object:", jsonData);

      // ALWAYS use FormData - even when there's no photo
      const formDataToSend = new FormData();
      
      // Use Blob to ensure proper encoding
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      formDataToSend.append("data", jsonBlob);
      
      // Add photo if provided
      if (photoFile) {
        formDataToSend.append("photograph", photoFile);
        console.log("Sending with photo file");
      } else {
        console.log("Sending without photo file");
      }

      await apiClient.patch(endPoints.updateDeanProfile, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
      // Refresh profile data
      await fetchProfile();
      // Reset files
      setPhotoFile(null);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      // Handle specific API errors
      if (err.response?.status === 400 && err.response?.data?.error?.includes("Phone number already in use")) {
        setError("Phone number is already in use. Please use a different phone number.");
      } else if (err.response?.status === 403) {
        setError("Access Denied: You do not have permission to update the Dean profile.");
      } else {
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to update profile. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstNameENG: profile.firstNameENG,
        firstNameAMH: profile.firstNameAMH,
        fatherNameENG: profile.fatherNameENG,
        fatherNameAMH: profile.fatherNameAMH,
        grandfatherNameENG: profile.grandfatherNameENG,
        grandfatherNameAMH: profile.grandfatherNameAMH,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        title: profile.title,
        remarks: profile.remarks || "",
        residenceRegionCode: profile.residenceRegionCode,
        residenceZoneCode: profile.residenceZoneCode,
        residenceWoredaCode: profile.residenceWoredaCode,
      });
      // Reset photo preview to original photo
      if (profile.photo) {
        let photoUrl = profile.photo;
        if (!photoUrl.startsWith('data:')) {
          photoUrl = `data:image/jpeg;base64,${profile.photo}`;
        }
        setPhotoPreview(photoUrl);
      }
    }
    setPhotoFile(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const downloadDocument = () => {
    if (!documentBase64) return;

    try {
      const link = document.createElement("a");
      link.href = documentBase64;
      link.download = documentFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleUploadClick = () => {
    if (!editing) {
      setEditing(true);
    }
    
    // Trigger file input click
    setTimeout(() => {
      document.getElementById('photo-upload')?.click();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading dean profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600 text-center px-4">
          {error || "Unable to load profile"}
        </p>
        <div className="flex space-x-4 mt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          <Button
            variant="default"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullNameEnglish = `${
    profile.title ? profile.title + " " : ""
  }${formData.firstNameENG || profile.firstNameENG} ${formData.fatherNameENG || profile.fatherNameENG} ${formData.grandfatherNameENG || profile.grandfatherNameENG}`;
  
  const fullNameAmharic = `${formData.firstNameAMH || profile.firstNameAMH} ${formData.fatherNameAMH || profile.fatherNameAMH} ${formData.grandfatherNameAMH || profile.grandfatherNameAMH}`;

  const fullAddress = [profile.residenceWoreda, profile.residenceZone, profile.residenceRegion]
    .filter(Boolean)
    .join(", ") || "Address not specified";

  const addressCodes = [
    profile.residenceWoredaCode,
    profile.residenceZoneCode,
    profile.residenceRegionCode,
  ]
    .filter(Boolean)
    .join(" / ");

  const initials = fullNameEnglish
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasDocument = !!documentBase64;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Dean Account
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {profile.title || "Dean"}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={handleUploadClick} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-32 h-32 border-4 border-blue-100 dark:border-blue-900">
                {photoPreview ? (
                  <AvatarImage
                    src={photoPreview}
                    alt={fullNameEnglish}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl bg-blue-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              {editing && (
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md">
                      <Camera className="h-4 w-4" />
                    </div>
                  </label>
                </div>
              )}
            </div>
            <CardTitle className="mt-4">{fullNameEnglish}</CardTitle>
            <CardDescription className="text-base">
              {fullNameAmharic}
            </CardDescription>
            <div className="mt-4 space-y-2">
              <Badge variant="secondary" className="text-sm">
                Dean
              </Badge>
              <Badge variant="outline" className="text-sm">
                {profile.title || "Dean"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{formData.email || profile.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{formData.phoneNumber || profile.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <UserCircle className="h-4 w-4 text-gray-500" />
              <span>Username: {profile.username}</span>
            </div>
            {hasDocument && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={downloadDocument}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Supporting Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information - Editable */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name (English)</Label>
                <Input
                  name="firstNameENG"
                  value={formData.firstNameENG || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
              <div className="space-y-2">
                <Label>First Name (አማርኛ)</Label>
                <Input
                  name="firstNameAMH"
                  value={formData.firstNameAMH || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Father's Name (English)</Label>
                <Input
                  name="fatherNameENG"
                  value={formData.fatherNameENG || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
              <div className="space-y-2">
                <Label>Father's Name (አማርኛ)</Label>
                <Input
                  name="fatherNameAMH"
                  value={formData.fatherNameAMH || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grandfather's Name (English)</Label>
                <Input
                  name="grandfatherNameENG"
                  value={formData.grandfatherNameENG || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
              <div className="space-y-2">
                <Label>Grandfather's Name (አማርኛ)</Label>
                <Input
                  name="grandfatherNameAMH"
                  value={formData.grandfatherNameAMH || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input
                  value={profile.gender}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Title</Label>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  readOnly={!editing}
                  className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                />
              </div>
            </div>

            {editing && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remarks (Optional)</Label>
                    <Textarea
                      name="remarks"
                      value={formData.remarks || ""}
                      onChange={handleInputChange}
                      placeholder="Additional notes or remarks"
                      rows={2}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address Codes</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Region Code</Label>
                        <Input
                          name="residenceRegionCode"
                          value={formData.residenceRegionCode || ""}
                          onChange={handleInputChange}
                          placeholder="Region code"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Zone Code</Label>
                        <Input
                          name="residenceZoneCode"
                          value={formData.residenceZoneCode || ""}
                          onChange={handleInputChange}
                          placeholder="Zone code"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Woreda Code</Label>
                        <Input
                          name="residenceWoredaCode"
                          value={formData.residenceWoredaCode || ""}
                          onChange={handleInputChange}
                          placeholder="Woreda code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!editing && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Residence</Label>
                    <Input
                      value={fullAddress}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  {addressCodes && (
                    <div className="space-y-2">
                      <Label>Address Codes</Label>
                      <Input
                        value={addressCodes}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800 text-sm"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-2 h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Role
              </Label>
              <Input
                value={profile.role || "Dean"}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Academic Title
              </Label>
              <Input
                value={formData.title || profile.title || "Not specified"}
                readOnly={!editing}
                onChange={handleInputChange}
                name="title"
                className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                Institution Level
              </Label>
              <Input
                value="University"
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Employee ID
              </Label>
              <Input
                value={`DEAN-${profile.id.toString().padStart(3, '0')}`}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Appointment Date (Gregorian)
              </Label>
              <Input
                value={formatDate(profile.hiredDateGC)}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <UserCircle className="h-4 w-4 mr-2" />
                Username
              </Label>
              <Input
                value={profile.username}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Career Summary</CardTitle>
          <CardDescription>
            Professional role and status overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium">Current Role</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dean of the University
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-blue-600 dark:text-blue-400"
              >
                {formData.title || profile.title || "Dean"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium">Appointment Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Appointed since {formatDate(profile.hiredDateGC)}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-green-600 dark:text-green-400"
              >
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dean account with highest administrative privileges
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-purple-600 dark:text-purple-400"
              >
                Verified
              </Badge>
            </div>
            {hasDocument && (
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3" />
                  <div>
                    <p className="font-medium">Supporting Documents</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Supporting document available for download
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadDocument}
                  className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Section */}
      {photoFile && editing && (
        <Card>
          <CardHeader>
            <CardTitle>Selected File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Profile Photo</p>
                    <p className="text-sm text-gray-600">{photoFile.name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhotoFile(null);
                    // Reset to original photo
                    if (profile.photo) {
                      let photoUrl = profile.photo;
                      if (!photoUrl.startsWith('data:')) {
                        photoUrl = `data:image/jpeg;base64,${profile.photo}`;
                      }
                      setPhotoPreview(photoUrl);
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}