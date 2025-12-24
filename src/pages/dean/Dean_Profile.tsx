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
  photo: string | null; // Base64 string from API
  documents: string | null; // Base64 string from API
  role: string;
  residenceRegion: string;
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
}

export default function Dean_Profile() {
  const [profile, setProfile] = useState<DeanProfileResponse | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string>("dean_document.pdf");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Dean profile
        const response = await apiClient.get<DeanProfileResponse>(
          endPoints.getDeanProfile
        );

        const data = response.data;

        // The API returns photo and documents as base64 strings (not byte arrays)
        if (data.photo) {
          // Check if it's already base64 or needs conversion
          if (typeof data.photo === 'string' && data.photo.startsWith('data:')) {
            setPhotoBase64(data.photo);
          } else if (typeof data.photo === 'string') {
            // If it's a base64 string without data URL prefix
            setPhotoBase64(`data:image/jpeg;base64,${data.photo}`);
          }
        }

        // Handle documents
        if (data.documents) {
          // Check if it's already base64 or needs conversion
          if (typeof data.documents === 'string' && data.documents.startsWith('data:')) {
            setDocumentBase64(data.documents);
          } else if (typeof data.documents === 'string') {
            // If it's a base64 string without data URL prefix
            setDocumentBase64(`data:application/pdf;base64,${data.documents}`);
          }
        }

        setProfile(data);
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

    fetchProfile();
  }, []);

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

  if (error || !profile) {
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

  const {
    firstNameENG,
    firstNameAMH,
    fatherNameENG,
    fatherNameAMH,
    grandfatherNameENG,
    grandfatherNameAMH,
    email,
    phoneNumber,
    gender,
    hiredDateGC,
    title,
    residenceRegion,
    residenceZone,
    residenceWoreda,
    residenceRegionCode,
    residenceZoneCode,
    residenceWoredaCode,
    username,
  } = profile;

  const fullNameEnglish = `${
    title ? title + " " : ""
  }${firstNameENG} ${fatherNameENG} ${grandfatherNameENG}`;
  const fullNameAmharic = `${firstNameAMH} ${fatherNameAMH} ${grandfatherNameAMH}`;

  const fullAddress =
    [residenceWoreda, residenceZone, residenceRegion]
      .filter(Boolean)
      .join(", ") || "Address not specified";

  const addressCodes = [
    residenceWoredaCode,
    residenceZoneCode,
    residenceRegionCode,
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Badge variant="outline" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          Dean Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-32 h-32 border-4 border-blue-100 dark:border-blue-900">
                {photoBase64 ? (
                  <AvatarImage
                    src={photoBase64}
                    alt={fullNameEnglish}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl bg-blue-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
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
                {title || "Dean"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <UserCircle className="h-4 w-4 text-gray-500" />
              <span>Username: {username}</span>
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

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name (English)</Label>
                <Input
                  value={fullNameEnglish}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name (አማርኛ)</Label>
                <Input
                  value={fullNameAmharic}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={email}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={phoneNumber}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input
                  value={gender}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Title</Label>
                <Input
                  value={title || "Not specified"}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
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
                value={title || "Not specified"}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
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
                value={formatDate(hiredDateGC)}
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
                value={username}
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
                {title || "Dean"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium">Appointment Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Appointed since {formatDate(hiredDateGC)}
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
    </div>
  );
}