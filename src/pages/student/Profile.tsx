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
  GraduationCap,
  User,
  Camera,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

interface ProfileResponse {
  userId: number;
  username: string;
  fullNameEnglish: string;
  fullNameAmharic: string;
  gender: string;
  age: number;
  phoneNumber: string;
  email: string;
  dateOfBirthGC: string; // YYYY-MM-DD
  dateOfBirthEC: string;
  maritalStatus: string;
  photoBase64: string | null;
  placeOfBirthRegion: string;
  placeOfBirthZone: string;
  placeOfBirthWoreda: string;
  currentAddressRegion: string;
  currentAddressZone: string;
  currentAddressWoreda: string;
  impairment: string | null;
  schoolBackground: string;
  contactPersonFullNameENG: string;
  contactPersonPhoneNumber: string;
  contactPersonRelation: string;
  dateEnrolledGC: string;
  academicYear: string;
  batchClassYearSemester: string;
  studentRecentStatus: string;
  departmentEnrolled: string;
  programModality: string;
  documentStatus: string;
  grade12Result: number;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.get<ProfileResponse>(endPoints.profile); // assuming you have endPoints.profile = "/api/profile"
        setProfile(data);
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError(
          err.message || "Failed to load profile. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
    age,
    dateOfBirthGC,
    maritalStatus,
    currentAddressRegion,
    currentAddressZone,
    currentAddressWoreda,
    departmentEnrolled,
    batchClassYearSemester,
    studentRecentStatus,
    programModality,
    dateEnrolledGC,
    academicYear,
    contactPersonFullNameENG,
    contactPersonRelation,
    contactPersonPhoneNumber,
    grade12Result,
    documentStatus,
  } = profile;

  // Format full address
  const fullAddress = [
    currentAddressWoreda,
    currentAddressZone,
    currentAddressRegion,
  ]
    .filter(Boolean)
    .join(", ");

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
        {documentStatus !== "COMPLETE" && (
          <Badge variant="destructive">Documents Incomplete</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-32 h-32">
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
              {/* You can make this functional later for photo upload */}
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full"
                disabled
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="mt-4">{fullNameEnglish}</CardTitle>
            <CardDescription className="text-base">
              {fullNameAmharic}
            </CardDescription>
            <div className="mt-4 space-y-2">
              <Badge variant="secondary">{departmentEnrolled}</Badge>
              <Badge
                variant={
                  studentRecentStatus === "ACTIVE" ? "default" : "secondary"
                }
              >
                {studentRecentStatus}
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
              <span>{fullAddress || "Address not provided"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Enrolled: {dateEnrolledGC}</span>
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
                <Input value={fullNameEnglish} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Full Name (አማርኛ)</Label>
                <Input value={fullNameAmharic} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={email} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phoneNumber} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth (GC)</Label>
                <Input value={dateOfBirthGC} type="date" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={gender} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={age} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Input value={maritalStatus} readOnly />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Current Address</Label>
              <Input value={fullAddress} readOnly />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input value={academicYear} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Current Level</Label>
              <Input value={batchClassYearSemester} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Program Modality</Label>
              <Input value={programModality} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Enrollment Date</Label>
              <Input value={dateEnrolledGC} type="date" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={departmentEnrolled} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Grade 12 Result (GPA)</Label>
              <Input value={grade12Result.toFixed(2)} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={contactPersonFullNameENG} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input value={contactPersonRelation} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={contactPersonPhoneNumber} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
