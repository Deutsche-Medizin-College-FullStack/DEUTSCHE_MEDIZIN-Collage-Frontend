"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  User,
  Shield,
  AlertCircle,
  Edit3,
  Save,
  X,
  Camera,
  IdCard,
  Upload,
} from "lucide-react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

interface GeneralManagerProfileResponse {
  id: number;
  firstNameEnglish: string;
  lastNameEnglish: string;
  firstNameAmharic: string;
  lastNameAmharic: string;
  email: string;
  phoneNumber: string | null;
  photograph: string | null;
  nationalIdImage: string | null;
}

export default function GeneralManagerProfile() {
  const [profile, setProfile] = useState<GeneralManagerProfileResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstNameEnglish: "",
    lastNameEnglish: "",
    firstNameAmharic: "",
    lastNameAmharic: "",
    phoneNumber: "",
    photograph: null as string | null,
    nationalIdImage: null as string | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<GeneralManagerProfileResponse>(
        endPoints.getGeneralManagerProfile
      );
      setProfile(response.data);

      setFormData({
        firstNameEnglish: response.data.firstNameEnglish || "",
        lastNameEnglish: response.data.lastNameEnglish || "",
        firstNameAmharic: response.data.firstNameAmharic || "",
        lastNameAmharic: response.data.lastNameAmharic || "",
        phoneNumber: response.data.phoneNumber || "",
        photograph: null,
        nationalIdImage: null,
      });

      setPhotoPreview(
        response.data.photograph
          ? `data:image/jpeg;base64,${response.data.photograph}`
          : null
      );
      setNationalIdPreview(
        response.data.nationalIdImage
          ? `data:image/jpeg;base64,${response.data.nationalIdImage}`
          : null
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Clean = base64.split(",")[1];
      setFormData((prev) => ({ ...prev, photograph: base64Clean }));
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Clean = base64.split(",")[1];
      setFormData((prev) => ({ ...prev, nationalIdImage: base64Clean }));
      setNationalIdPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: any = {};

    if (formData.firstNameEnglish !== profile?.firstNameEnglish)
      payload.firstNameEnglish = formData.firstNameEnglish;
    if (formData.lastNameEnglish !== profile?.lastNameEnglish)
      payload.lastNameEnglish = formData.lastNameEnglish;
    if (formData.firstNameAmharic !== profile?.firstNameAmharic)
      payload.firstNameAmharic = formData.firstNameAmharic;
    if (formData.lastNameAmharic !== profile?.lastNameAmharic)
      payload.lastNameAmharic = formData.lastNameAmharic;
    if (formData.phoneNumber !== profile?.phoneNumber)
      payload.phoneNumber = formData.phoneNumber;
    if (formData.photograph !== null) payload.photograph = formData.photograph;
    if (formData.nationalIdImage !== null)
      payload.nationalIdImage = formData.nationalIdImage;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      setSaving(false);
      return;
    }

    try {
      const response = await apiClient.patch<GeneralManagerProfileResponse>(
        endPoints.updateGeneralManagerProfile,
        payload
      );
      setProfile(response.data);

      setPhotoPreview(
        response.data.photograph
          ? `data:image/jpeg;base64,${response.data.photograph}`
          : null
      );
      setNationalIdPreview(
        response.data.nationalIdImage
          ? `data:image/jpeg;base64,${response.data.nationalIdImage}`
          : null
      );

      setIsEditing(false);
      toast.success("Profile updated", {
        description: "Your changes have been saved successfully.",
        duration: 4000,
      });
    } catch (err: any) {
      let errorMessage = "Failed to update profile";

      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.join(" • ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error("Update failed", {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
    if (profile) {
      setFormData({
        firstNameEnglish: profile.firstNameEnglish || "",
        lastNameEnglish: profile.lastNameEnglish || "",
        firstNameAmharic: profile.firstNameAmharic || "",
        lastNameAmharic: profile.lastNameAmharic || "",
        phoneNumber: profile.phoneNumber || "",
        photograph: null,
        nationalIdImage: null,
      });
      setPhotoPreview(
        profile.photograph
          ? `data:image/jpeg;base64,${profile.photograph}`
          : null
      );
      setNationalIdPreview(
        profile.nationalIdImage
          ? `data:image/jpeg;base64,${profile.nationalIdImage}`
          : null
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const fullNameEnglish =
    `${formData.firstNameEnglish} ${formData.lastNameEnglish}`.trim();
  const fullNameAmharic =
    `${formData.firstNameAmharic} ${formData.lastNameAmharic}`.trim();
  const initials = fullNameEnglish
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">General Manager Profile</h1>
        <Badge variant="outline" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          General Manager
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images & Quick Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center space-y-8">
            {/* Profile Photo */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center justify-center gap-2">
                <User className="h-5 w-5" /> Profile Photo
              </Label>
              <div className="relative mx-auto w-40 h-40">
                <Avatar className="w-full h-full border-4 border-blue-100 dark:border-blue-900 shadow-md">
                  {photoPreview ? (
                    <AvatarImage
                      src={photoPreview}
                      alt="Profile"
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-blue-600 text-white">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition">
                    <Camera className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {!photoPreview && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No profile photo set
                </p>
              )}
            </div>

            {/* National ID */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center justify-center gap-2">
                <IdCard className="h-5 w-5" /> National ID Document
              </Label>
              <div className="relative mx-auto w-64 h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 shadow">
                {nationalIdPreview ? (
                  <img
                    src={nationalIdPreview}
                    alt="National ID"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <IdCard className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm">No ID uploaded</span>
                  </div>
                )}

                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {!nationalIdPreview && isEditing && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <label className="cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" /> Upload National ID
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdChange}
                      className="hidden"
                    />
                  </label>
                </Button>
              )}
            </div>

            {/* Name & Role */}
            <div className="pt-4">
              <CardTitle className="text-2xl">
                {isEditing
                  ? fullNameEnglish
                  : `${profile.firstNameEnglish} ${profile.lastNameEnglish}`}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {isEditing ? fullNameAmharic || "—" : fullNameAmharic || "—"}
              </CardDescription>
              <Badge variant="secondary" className="mt-3 text-base px-4 py-1">
                General Manager
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-6 border-t">
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>
                {isEditing
                  ? formData.phoneNumber
                  : profile.phoneNumber || "Not provided"}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ID: {profile.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Editable Fields */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your name, phone, and images
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium">First Name (English)</Label>
                <Input
                  value={formData.firstNameEnglish}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstNameEnglish: e.target.value,
                    }))
                  }
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted/40" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Last Name (English)</Label>
                <Input
                  value={formData.lastNameEnglish}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastNameEnglish: e.target.value,
                    }))
                  }
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted/40" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium">የስም መጀመሪያ (አማርኛ)</Label>
                <Input
                  value={formData.firstNameAmharic}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstNameAmharic: e.target.value,
                    }))
                  }
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted/40" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">የአያት ስም (አማርኛ)</Label>
                <Input
                  value={formData.lastNameAmharic}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastNameAmharic: e.target.value,
                    }))
                  }
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted/40" : ""}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium">Email Address</Label>
                <Input value={profile.email} readOnly className="bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Phone Number</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="+2519xxxxxxxx"
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted/40" : ""}
                />
              </div>
            </div>

            {isEditing && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                <p>
                  • Click the camera icon on Profile Photo to change your avatar
                </p>
                <p>
                  • Click the upload icon on National ID to replace your
                  document
                </p>
                <p className="mt-2 text-xs italic">
                  Supported formats: JPEG, PNG. Max size recommended: 2MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
