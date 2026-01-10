"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  FileText,
  Home,
  IdCard,
  AlertCircle,
} from "lucide-react";

interface StudentDetail {
  id: number;
  userId: number;
  username: string;
  firstNameAMH: string;
  firstNameENG: string;
  fatherNameAMH: string;
  fatherNameENG: string;
  grandfatherNameAMH: string;
  grandfatherNameENG: string;
  motherNameAMH: string;
  motherNameENG: string;
  motherFatherNameAMH: string;
  motherFatherNameENG: string;
  gender: string;
  age: number;
  phoneNumber: string;
  dateOfBirthEC: string;
  dateOfBirthGC: string;
  placeOfBirthWoredaCode: string;
  placeOfBirthWoredaName: string;
  placeOfBirthZoneCode: string;
  placeOfBirthZoneName: string;
  placeOfBirthRegionCode: string;
  placeOfBirthRegionName: string;
  currentAddressWoredaCode: string;
  currentAddressWoredaName: string;
  currentAddressZoneCode: string;
  currentAddressZoneName: string;
  currentAddressRegionCode: string;
  currentAddressRegionName: string;
  email: string;
  maritalStatus: string;
  impairmentCode: string | null;
  impairmentDescription: string | null;
  schoolBackgroundId: number;
  schoolBackgroundName: string;
  studentPhoto: string | null;
  contactPersonFirstNameAMH: string;
  contactPersonFirstNameENG: string;
  contactPersonLastNameAMH: string;
  contactPersonLastNameENG: string;
  contactPersonPhoneNumber: string;
  contactPersonRelation: string;
  dateEnrolledEC: string;
  dateEnrolledGC: string;
  batchClassYearSemesterId: number;
  batchClassYearSemesterName: string;
  studentRecentStatusId: number;
  studentRecentStatusName: string;
  departmentEnrolledId: number;
  departmentEnrolledName: string;
  programModalityCode: string;
  programModalityName: string;
  academicYearCode: string | null;
  academicYearGC: string | null;
  academicYearEC: string | null;
  document: string | null;
  documentStatus: string;
  remark: string;
  isTransfer: boolean;
  exitExamUserID: string | null;
  exitExamScore: number | null;
  isStudentPassExitExam: boolean;
  grade12Result: number;
}

export default function StudentDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<StudentDetail>(
        `${endPoints.studentById}/${studentId}` 
      );
      setStudent(response.data);
    } catch (err: any) {
      console.error("Failed to load student details:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load student details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    }
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

  const getInitials = (firstName: string, fatherName: string, grandfatherName: string) => {
    return `${firstName?.[0] || ''}${fatherName?.[0] || ''}${grandfatherName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600 text-center px-4">
          {error}
        </p>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="default" onClick={fetchStudentDetails}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Student not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const fullNameEnglish = `${student.firstNameENG || ''} ${student.fatherNameENG || ''} ${student.grandfatherNameENG || ''}`.trim();
  const fullNameAmharic = `${student.firstNameAMH || ''} ${student.fatherNameAMH || ''} ${student.grandfatherNameAMH || ''}`.trim();
  const motherFullName = `${student.motherNameENG || ''} ${student.motherFatherNameENG || ''}`.trim();
  const placeOfBirth = `${student.placeOfBirthWoredaName || ''}, ${student.placeOfBirthZoneName || ''}, ${student.placeOfBirthRegionName || ''}`.trim();
  const currentAddress = `${student.currentAddressWoredaName || ''}, ${student.currentAddressZoneName || ''}, ${student.currentAddressRegionName || ''}`.trim();

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <Button
      variant={activeTab === id ? "default" : "ghost"}
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-2"
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Student Details</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive profile for {student.firstNameENG || 'the student'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(student.studentRecentStatusName)}`}>
            {student.studentRecentStatusName || 'Unknown'}
          </Badge>
          <Badge variant="outline">
            {student.programModalityName || 'N/A'}
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <TabButton 
          id="personal" 
          label="Personal" 
          icon={<User className="h-4 w-4" />} 
        />
        <TabButton 
          id="academic" 
          label="Academic" 
          icon={<GraduationCap className="h-4 w-4" />} 
        />
        <TabButton 
          id="contact" 
          label="Contact" 
          icon={<Users className="h-4 w-4" />} 
        />
        <TabButton 
          id="documents" 
          label="Documents" 
          icon={<FileText className="h-4 w-4" />} 
        />
      </div>

      {/* Personal Information Tab */}
      {activeTab === "personal" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto">
                  <Avatar className="w-32 h-32 border-4 border-blue-100 dark:border-blue-900 mx-auto">
                    {student.studentPhoto ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${student.studentPhoto}`}
                        alt={fullNameEnglish}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-blue-600 text-white font-semibold">
                        {getInitials(student.firstNameENG, student.fatherNameENG, student.grandfatherNameENG)}
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
                    {student.departmentEnrolledName || 'No Department'}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {student.gender || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <IdCard className="h-4 w-4 text-gray-500" />
                  <span>ID: {student.id}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Username: {student.username || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{student.phoneNumber || 'No phone'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{student.email || "No email provided"}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Age: {student.age || 'N/A'} years</span>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Complete personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name (English)</Label>
                    <Input value={student.firstNameENG || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name (አማርኛ)</Label>
                    <Input value={student.firstNameAMH || 'N/A'} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Father's Name (English)</Label>
                    <Input value={student.fatherNameENG || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Name (አማርኛ)</Label>
                    <Input value={student.fatherNameAMH || 'N/A'} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grandfather's Name (English)</Label>
                    <Input value={student.grandfatherNameENG || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Grandfather's Name (አማርኛ)</Label>
                    <Input value={student.grandfatherNameAMH || 'N/A'} readOnly />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mother's Name (English)</Label>
                    <Input value={motherFullName || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Father Name (English)</Label>
                    <Input value={student.motherFatherNameENG || 'N/A'} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={student.gender || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Input value={student.maritalStatus || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth (GC)</Label>
                    <Input value={formatDate(student.dateOfBirthGC)} readOnly />
                  </div>
                </div>

                {student.impairmentDescription && (
                  <div className="space-y-2">
                    <Label>Special Needs / Impairment</Label>
                    <Input value={student.impairmentDescription} readOnly />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Place of Birth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium">{placeOfBirth || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Region Code</p>
                    <p className="font-mono">{student.placeOfBirthRegionCode || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Zone Code</p>
                    <p className="font-mono">{student.placeOfBirthZoneCode || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Woreda Code</p>
                    <p className="font-mono">{student.placeOfBirthWoredaCode || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Current Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium">{currentAddress || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Region Code</p>
                    <p className="font-mono">{student.currentAddressRegionCode || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Zone Code</p>
                    <p className="font-mono">{student.currentAddressZoneCode || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Woreda Code</p>
                    <p className="font-mono">{student.currentAddressWoredaCode || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Academic Information Tab */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Current academic status and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={student.departmentEnrolledName || 'N/A'} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Program Modality</Label>
                  <Input value={student.programModalityName || 'N/A'} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Current Batch/Class</Label>
                  <Input value={student.batchClassYearSemesterName || 'N/A'} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>School Background</Label>
                  <Input value={student.schoolBackgroundName || 'N/A'} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Enrolled (GC)</Label>
                  <Input value={formatDate(student.dateEnrolledGC)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Date Enrolled (EC)</Label>
                  <Input value={student.dateEnrolledEC || 'N/A'} readOnly />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Academic Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Grade 12 Result</Label>
                    <Input value={student.grade12Result?.toFixed(2) || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Exit Exam Score</Label>
                    <Input 
                      value={student.exitExamScore ? student.exitExamScore.toFixed(2) : "N/A"} 
                      readOnly 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exit Exam Status</Label>
                    <Input 
                      value={student.isStudentPassExitExam ? "Passed" : "Not Taken/Failed"} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>

              {student.isTransfer && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="font-medium">Transfer Student</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This student transferred from another institution
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Information Tab */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Student Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={student.phoneNumber || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={student.email || "Not provided"} readOnly />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Emergency Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={`${student.contactPersonFirstNameENG || ''} ${student.contactPersonLastNameENG || ''}`.trim() || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input value={student.contactPersonRelation || 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={student.contactPersonPhoneNumber || 'N/A'} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Name (አማርኛ)</Label>
                  <Input value={`${student.contactPersonFirstNameAMH || ''} ${student.contactPersonLastNameAMH || ''}`.trim() || 'N/A'} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Status</CardTitle>
              <CardDescription>Document verification and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Document Status</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall document completion status</p>
                  </div>
                  <Badge className={`${getDocumentStatusColor(student.documentStatus)}`}>
                    {student.documentStatus || 'Unknown'}
                  </Badge>
                </div>

                {student.remark && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Label>Remarks</Label>
                    <p className="mt-1">{student.remark}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Available Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Student Photo</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.studentPhoto ? "Uploaded" : "Not uploaded"}
                            </p>
                          </div>
                        </div>
                        {student.studentPhoto && (
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Supporting Documents</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.document ? "Uploaded" : "Not uploaded"}
                            </p>
                          </div>
                        </div>
                        {student.document && (
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to List
        </Button>
      </div>
    </div>
  );
}

// Helper components
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);

const Input = ({ value, readOnly, className }: { value: string; readOnly?: boolean; className?: string }) => (
  <div className={`px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 ${className || ''}`}>
    {value}
  </div>
);