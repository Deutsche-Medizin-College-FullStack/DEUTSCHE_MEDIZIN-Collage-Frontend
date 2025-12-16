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

interface TeacherProfileResponse {
  userId: number;
  username: string;
  fullNameEnglish: string;
  fullNameAmharic: string;
  gender: string;
  dateOfBirthGC: string;
  dateOfBirthEC: string;
  phoneNumber: string;
  email: string;
  maritalStatus: string;
  photoBase64: string | null;
  currentAddressRegion: string | null;
  currentAddressZone: string | null;
  currentAddressWoreda: string | null;
  impairment: string | null;
  department: string;
  title: string;
  yearsOfExperience: number;
  hireDateGC: string;
  hireDateEC: string;
}

export default function TeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<TeacherProfileResponse>(
          endPoints.getTeacherProfile
        );
        if (response.data) {
          setProfile(response.data);
        }
      } catch (err: any) {
        console.error("Failed to load teacher profile:", err);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    fullNameEnglish,
    fullNameAmharic,
    photoBase64,
    email,
    phoneNumber,
    gender,
    dateOfBirthGC,
    dateOfBirthEC,
    maritalStatus,
    currentAddressRegion,
    currentAddressZone,
    currentAddressWoreda,
    impairment,
    department,
    title,
    yearsOfExperience,
    hireDateGC,
    hireDateEC,
    username,
  } = profile;

  // Format full address
  const fullAddress = [
    currentAddressWoreda,
    currentAddressZone,
    currentAddressRegion,
  ]
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
          Teacher Account
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
                    src={`data:image/jpeg;base64,${photoBase64}`}
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
                {title}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {department}
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
                <Input value={fullNameEnglish} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>Full Name (አማርኛ)</Label>
                <Input value={fullNameAmharic} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={email} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phoneNumber} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth (Gregorian)</Label>
                <Input 
                  value={formatDate(dateOfBirthGC)} 
                  readOnly 
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth (Ethiopian)</Label>
                <Input value={dateOfBirthEC} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={gender} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Input value={maritalStatus} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Current Address</Label>
              <Input value={fullAddress} readOnly className="bg-gray-50 dark:bg-gray-800" />
            </div>
            {impairment && (
              <div className="space-y-2">
                <Label>Special Needs/Impairment</Label>
                <Input value={impairment} readOnly className="bg-gray-50 dark:bg-gray-800" />
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
              <Input value={department} readOnly className="bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Academic Title
              </Label>
              <Input value={title} readOnly className="bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Years of Experience
              </Label>
              <Input 
                value={`${yearsOfExperience} years`} 
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
                value={formatDate(hireDateGC)} 
                readOnly 
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Hire Date (Ethiopian)
              </Label>
              <Input value={hireDateEC} readOnly className="bg-gray-50 dark:bg-gray-800" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Career Summary</CardTitle>
          <CardDescription>
            Professional achievements and experience overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium">Total Experience</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {yearsOfExperience} years of teaching experience
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                Since {formatDate(hireDateGC)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium">Current Position</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {title} at {department} Department
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Teacher account with full access to teaching resources
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
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