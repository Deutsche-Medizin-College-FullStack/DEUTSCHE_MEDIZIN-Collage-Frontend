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
  GraduationCap,
  User,
  Briefcase,
  Award,
  Building,
  CalendarDays,
  UserCircle,
  AlertCircle,
  Shield,
} from "lucide-react";

import { useEffect, useState } from "react";
import apiClient from "../../components/api/apiClient";
import endPoints from "../../components/api/endPoints";

interface DepartmentHeadProfileResponse {
  id: number;
  username: string;
  firstNameENG: string;
  firstNameAMH: string;
  fatherNameENG: string;
  fatherNameAMH: string;
  grandfatherNameENG: string;
  grandfatherNameAMH: string;
  gender: string;
  phoneNumber: string;
  email: string;
  hiredDateGC: string;
  hiredDateEC: string;
  department: {
    id: number;
    name: string;
    modality: string;
    level: string;
  };
  residenceRegion: { id: string; name: string } | null;
  residenceZone: { id: string; name: string } | null;
  residenceWoreda: { id: string; name: string } | null;
  remark: string | null;
  isActive: boolean;
  hasPhoto: boolean;
  hasDocument: boolean;
}

export default function DepartmentHeadProfile() {
  const [profile, setProfile] = useState<DepartmentHeadProfileResponse | null>(
    null
  );
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileResponse =
          await apiClient.get<DepartmentHeadProfileResponse>(
            endPoints.getDepartmentHeadProfile // adjust if endpoint constant is different
          );
        setProfile(profileResponse.data);

        // Fetch photo if available
        if (profileResponse.data.hasPhoto) {
          try {
            const photoResponse = await apiClient.get(
              endPoints.getDepartmentHeadPhoto,
              {
                responseType: "blob",
              }
            );
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoBase64(reader.result as string);
            };
            reader.readAsDataURL(photoResponse.data);
          } catch (photoErr) {
            console.warn("Failed to load photo");
          }
        }
      } catch (err: any) {
        console.error("Failed to load department head profile:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load profile. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600">
          {error || "Unable to load profile"}
        </p>
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
    hiredDateEC,
    department,
    residenceRegion,
    residenceZone,
    residenceWoreda,
    remark,
    isActive,
    username,
  } = profile;

  const fullNameEnglish = `${firstNameENG} ${fatherNameENG} ${grandfatherNameENG}`;
  const fullNameAmharic = `${firstNameAMH} ${fatherNameAMH} ${grandfatherNameAMH}`;

  // Format full address
  const fullAddress =
    [residenceWoreda?.name, residenceZone?.name, residenceRegion?.name]
      .filter(Boolean)
      .join(", ") || "Address not specified";

  // Get initials for fallback avatar
  const initials = fullNameEnglish
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Badge variant="outline" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          Department Head Account
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
                Department Head
              </Badge>
              <Badge variant="outline" className="text-sm">
                {department.name}
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
                <Label>Status</Label>
                <Input
                  value={isActive ? "Active" : "Inactive"}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Current Residence</Label>
              <Input
                value={fullAddress}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            {remark && (
              <div className="space-y-2">
                <Label>Remark</Label>
                <Input
                  value={remark}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Department
              </Label>
              <Input
                value={department.name}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Modality
              </Label>
              <Input
                value={department.modality}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Program Level
              </Label>
              <Input
                value={department.level}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Hire Date (Gregorian)
              </Label>
              <Input
                value={formatDate(hiredDateGC)}
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Hire Date (Ethiopian)
              </Label>
              <Input
                value={hiredDateEC}
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
                    Head of {department.name} Department
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-blue-600 dark:text-blue-400"
              >
                {department.modality} - {department.level}
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
                    Department head account with administrative privileges
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
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" disabled>
          Edit Profile (Coming Soon)
        </Button>
        <Button variant="outline" disabled>
          Upload Photo (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
