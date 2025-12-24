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
  Save,
  Edit,
  X,
  Upload,
  Camera,
  Loader2,
  FileUp,
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
  password?: string;
  firstNameAMH?: string;
  firstNameENG?: string;
  fatherNameAMH?: string;
  fatherNameENG?: string;
  grandfatherNameAMH?: string;
  grandfatherNameENG?: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  residenceWoredaCode?: string;
  residenceZoneCode?: string;
  residenceRegionCode?: string;
  hiredDateGC?: string;
  title?: string;
  remarks?: string;
}

export default function ViceDeanProfileEditable() {
  const [profile, setProfile] = useState<ViceDeanProfileResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<UpdateViceDeanRequest>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Password fields
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

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
      // Initialize form data with profile data
      setFormData({
        firstNameAMH: response.data.firstNameAMH,
        firstNameENG: response.data.firstNameENG,
        fatherNameAMH: response.data.fatherNameAMH,
        fatherNameENG: response.data.fatherNameENG,
        grandfatherNameAMH: response.data.grandfatherNameAMH,
        grandfatherNameENG: response.data.grandfatherNameENG,
        gender: response.data.gender,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        residenceWoredaCode: response.data.residenceWoredaCode,
        residenceZoneCode: response.data.residenceZoneCode,
        residenceRegionCode: response.data.residenceRegionCode,
        hiredDateGC: response.data.hiredDateGC,
        title: response.data.title,
        remarks: response.data.remarks || "",
      });
      
      if (response.data.photo) {
        setPhotoPreview(response.data.photo);
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Document file size must be less than 10MB");
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate password if provided
      if (passwordData.newPassword || passwordData.confirmPassword) {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
          throw new Error("Both password fields are required");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (passwordData.newPassword.length < 4) {
          throw new Error("Password must be at least 4 characters long");
        }
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add JSON data
      const jsonData: UpdateViceDeanRequest = { ...formData };
      
      // Add password if provided
      if (passwordData.newPassword && passwordData.confirmPassword) {
        jsonData.password = passwordData.newPassword;
      }
      
      formDataToSend.append("data", JSON.stringify(jsonData));
      
      // Add photo if provided
      if (photoFile) {
        formDataToSend.append("photograph", photoFile);
      }
      
      // Add document if provided
      if (documentFile) {
        formDataToSend.append("document", documentFile);
      }

      // Get the endpoint with actual ID
      const endpoint = endPoints.updateViceDean.replace(":id", profile?.id?.toString() || "");

      await apiClient.put(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
      // Refresh profile data
      await fetchProfile();
      // Reset password fields
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setShowPasswordFields(false);
      // Reset files
      setPhotoFile(null);
      setDocumentFile(null);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstNameAMH: profile.firstNameAMH,
        firstNameENG: profile.firstNameENG,
        fatherNameAMH: profile.fatherNameAMH,
        fatherNameENG: profile.fatherNameENG,
        grandfatherNameAMH: profile.grandfatherNameAMH,
        grandfatherNameENG: profile.grandfatherNameENG,
        gender: profile.gender,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        residenceWoredaCode: profile.residenceWoredaCode,
        residenceZoneCode: profile.residenceZoneCode,
        residenceRegionCode: profile.residenceRegionCode,
        hiredDateGC: profile.hiredDateGC,
        title: profile.title,
        remarks: profile.remarks || "",
      });
      setPhotoPreview(profile.photo);
    }
    setPhotoFile(null);
    setDocumentFile(null);
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setShowPasswordFields(false);
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

  const fullNameEnglish = `${profile.title ? profile.title + " " : ""}${profile.firstNameENG} ${profile.fatherNameENG} ${profile.grandfatherNameENG}`;
  const fullNameAmharic = `${profile.firstNameAMH} ${profile.fatherNameAMH} ${profile.grandfatherNameAMH}`;
  
  const fullAddress = [profile.residenceWoreda, profile.residenceZone, profile.residenceRegion]
    .filter(Boolean)
    .join(", ") || "Address not specified";

  const initials = fullNameEnglish
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Function to handle file uploads
  const handleUploadClick = (type: 'photo' | 'document') => {
    if (!editing) {
      setEditing(true);
    }
    
    // Trigger file input click
    setTimeout(() => {
      if (type === 'photo') {
        document.getElementById('photo-upload')?.click();
      } else {
        document.getElementById('document-upload')?.click();
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
                {profile.title || "Vice-Dean"}
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
                <Button onClick={() => handleUploadClick('photo')} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <Button onClick={() => handleUploadClick('document')} variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Document
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

      {/* Hidden file inputs */}
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="hidden"
      />
      <input
        id="document-upload"
        type="file"
        onChange={handleDocumentChange}
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
                {profile.title || "Vice-Dean"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{profile.phoneNumber}</span>
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

        {/* Personal Information */}
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
            )}

            <Separator />
            
            {editing && (
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label>Hire Date</Label>
                  <Input
                    name="hiredDateGC"
                    type="date"
                    value={formData.hiredDateGC || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      {editing && (
        <>
          {/* Password Change Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Change Password</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  {showPasswordFields ? "Hide" : "Change Password"}
                </Button>
              </CardTitle>
              <CardDescription>
                Optional: Update your password
              </CardDescription>
            </CardHeader>
            {showPasswordFields && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Password must be at least 4 characters long
                </p>
              </CardContent>
            )}
          </Card>

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Supporting Document</CardTitle>
              <CardDescription>
                Optional: Upload a supporting document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Supporting Document</Label>
                  <div className="flex items-center gap-4">
                    <label htmlFor="document-upload">
                      <Button variant="outline" type="button">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </label>
                    {documentFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Selected: {documentFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDocumentFile(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload any supporting document related to your profile updates (max 10MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Read-only Professional Information (when not editing) */}
      {!editing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Role
                </Label>
                <Input
                  value="Vice-Dean"
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
                  value={profile.title || "Not specified"}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Hire Date
                </Label>
                <Input
                  value={formatDate(profile.hiredDateGC)}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview Section */}
      {(photoFile || documentFile) && editing && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {photoFile && (
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
                      setPhotoPreview(profile.photo);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              )}
              {documentFile && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Supporting Document</p>
                      <p className="text-sm text-gray-600">{documentFile.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDocumentFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}