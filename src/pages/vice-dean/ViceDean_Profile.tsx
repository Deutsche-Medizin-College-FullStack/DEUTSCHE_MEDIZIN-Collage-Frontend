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
  UserCircle,
  AlertCircle,
  Shield,
  Save,
  Edit,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

interface ViceDeanProfileResponse {
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
  role: string;
  residenceRegion: string;
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
  remarks?: string;
}

interface UpdateViceDeanRequest {
  firstNameENG?: string;
  fatherNameENG?: string;
  grandfatherNameENG?: string;
  firstNameAMH?: string;
  fatherNameAMH?: string;
  grandfatherNameAMH?: string;
  email?: string;
  phoneNumber?: string;
  title?: string;
  gender?: string;
}

export default function ViceDeanProfileEditable() {
  const [profile, setProfile] = useState<ViceDeanProfileResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state - all name fields are editable
  const [formData, setFormData] = useState<UpdateViceDeanRequest>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ViceDeanProfileResponse>(
        endPoints.getViceDeanProfile
      );
      setProfile(response.data);
      // Initialize form data with all fields
      setFormData({
        firstNameENG: response.data.firstNameENG,
        fatherNameENG: response.data.fatherNameENG,
        grandfatherNameENG: response.data.grandfatherNameENG,
        firstNameAMH: response.data.firstNameAMH,
        fatherNameAMH: response.data.fatherNameAMH,
        grandfatherNameAMH: response.data.grandfatherNameAMH,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        title: response.data.title,
        gender: response.data.gender,
      });
      
      // Handle photo data - check if it's base64 with or without data URL prefix
      if (response.data.photo) {
        let photoUrl = response.data.photo;
        // Check if it's already a data URL
        if (!photoUrl.startsWith('data:')) {
          // Add data URL prefix for base64 image
          photoUrl = `data:image/jpeg;base64,${response.data.photo}`;
        }
        setPhotoPreview(photoUrl);
      }
    } catch (err: any) {
      console.error("Failed to load vice-dean profile:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load profile. Please try again later."
      );
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
      const jsonData: UpdateViceDeanRequest = {
        firstNameENG: formData.firstNameENG,
        fatherNameENG: formData.fatherNameENG,
        grandfatherNameENG: formData.grandfatherNameENG,
        firstNameAMH: formData.firstNameAMH,
        fatherNameAMH: formData.fatherNameAMH,
        grandfatherNameAMH: formData.grandfatherNameAMH,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        title: formData.title,
        gender: formData.gender,
      };

      // Create JSON string with proper encoding for Unicode characters
      const jsonString = JSON.stringify(jsonData);

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

      await apiClient.patch(endPoints.updateViceDeanProfile, formDataToSend, {
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
      
      // Check for specific error types
      if (err.response?.status === 403) {
        setError("Access Denied: You do not have permission to update the vice-dean profile.");
      } else if (err.response?.status === 400) {
        // Handle validation errors
        const errorMessage = err.response?.data?.error || "Invalid data. Please check your inputs.";
        setError(errorMessage);
        
        // Log the request data for debugging
        console.error("Request data that caused error:", {
          firstNameENG: formData.firstNameENG,
          firstNameAMH: formData.firstNameAMH,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        });
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
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
        fatherNameENG: profile.fatherNameENG,
        grandfatherNameENG: profile.grandfatherNameENG,
        firstNameAMH: profile.firstNameAMH,
        fatherNameAMH: profile.fatherNameAMH,
        grandfatherNameAMH: profile.grandfatherNameAMH,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        title: profile.title,
        gender: profile.gender,
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">
          {error}
        </p>
        <Button onClick={fetchProfile}>Try Again</Button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullNameEnglish = `${profile.title ? profile.title + " " : ""}${formData.firstNameENG || profile.firstNameENG} ${formData.fatherNameENG || profile.fatherNameENG} ${formData.grandfatherNameENG || profile.grandfatherNameENG}`;
  const fullNameAmharic = `${formData.firstNameAMH || profile.firstNameAMH} ${formData.fatherNameAMH || profile.fatherNameAMH} ${formData.grandfatherNameAMH || profile.grandfatherNameAMH}`;
  
  const fullAddress = [profile.residenceWoreda, profile.residenceZone, profile.residenceRegion]
    .filter(Boolean)
    .join(", ") || "Address not specified";

  const initials = fullNameEnglish
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUploadClick = (type: 'photo') => {
    if (!editing) {
      setEditing(true);
    }
    
    // Trigger file input click
    setTimeout(() => {
      if (type === 'photo') {
        document.getElementById('photo-upload')?.click();
      }
    }, 100);
  };

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
                Vice-Dean Account
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {formData.title || profile.title || "Vice-Dean"}
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
                Vice-Dean
              </Badge>
              <Badge variant="outline" className="text-sm">
                {formData.title || profile.title || "Vice-Dean"}
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
          </CardContent>
        </Card>

        {/* Editable Information - All name fields are editable */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    First Name (English)
                  </Label>
                  <Input
                    name="firstNameENG"
                    value={formData.firstNameENG || ""}
                    onChange={handleInputChange}
                    readOnly={!editing}
                    className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    First Name (አማርኛ)
                  </Label>
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
                  <Label className="flex items-center">
                    Father's Name (English)
                  </Label>
                  <Input
                    name="fatherNameENG"
                    value={formData.fatherNameENG || ""}
                    onChange={handleInputChange}
                    readOnly={!editing}
                    className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Father's Name (አማርኛ)
                  </Label>
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
                  <Label className="flex items-center">
                    Grandfather's Name (English)
                  </Label>
                  <Input
                    name="grandfatherNameENG"
                    value={formData.grandfatherNameENG || ""}
                    onChange={handleInputChange}
                    readOnly={!editing}
                    className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Grandfather's Name (አማርኛ)
                  </Label>
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
                  <Label className="flex items-center">
                    Email Address
                  </Label>
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
                  <Label className="flex items-center">
                    Phone Number
                  </Label>
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
                  <Label className="flex items-center">
                    Gender
                  </Label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    disabled={!editing}
                    className={`w-full px-3 py-2 border rounded-md ${!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Academic Title
                  </Label>
                  <Input
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    readOnly={!editing}
                    className={!editing ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
                  />
                </div>
              </div>

              <Separator />

              {/* Read-only fields section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Read-only Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Username</Label>
                    <Input
                      value={profile.username}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600">Hire Date</Label>
                    <Input
                      value={formatDate(profile.hiredDateGC)}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-600">Address</Label>
                  <Input
                    value={fullAddress}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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