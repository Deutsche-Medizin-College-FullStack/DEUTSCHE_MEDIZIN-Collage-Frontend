"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// Interfaces
interface TeacherListItem {
  teacherId: number;
  fullNameAmharic: string;
  fullNameEnglish: string;
  departmentName: string;
  title: string;
  email: string;
  phoneNumber: string;
  assignedCoursesCount: number;
  photographBase64: string | null;
}

interface TeacherDetail {
  userId: number;
  username: string;
  firstNameAmharic: string;
  lastNameAmharic: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  gender: string;
  dateOfBirthGC: string;
  dateOfBirthEC: string;
  phoneNumber: string;
  email: string;
  departmentName: string;
  hireDateGC: string;
  hireDateEC: string;
  title: string;
  yearsOfExperience: number;
  impairmentCode: string | null;
  impairmentName: string | null;
  maritalStatus: string;
  woredaCode: string;
  woredaName: string;
  zoneCode: string;
  zoneName: string;
  regionCode: string;
  regionName: string;
  photographBase64: string | null;
  assignedCourses: {
    id: number;
    courseCode: string;
    courseTitle: string;
    totalCrHrs: number;
    batchClassYearSemesterId: number;
    batchClassYearSemesterName: string;
  }[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(
    null
  );
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const response = await apiClient.get<TeacherListItem[]>(
        endPoints.teachers
      );
      setTeachers(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load teachers");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch single teacher details
  const fetchTeacherDetails = async (teacher: TeacherListItem) => {
    setLoadingDetail(true);
    setSelectedTeacher(null);
    setModalPhoto(teacher.photographBase64);
    setModalOpen(true);

    try {
      const response = await apiClient.get<TeacherDetail>(
        `${endPoints.teachers}/${teacher.teacherId}`
      );
      setSelectedTeacher(response.data);
      setModalPhoto(response.data.photographBase64 || teacher.photographBase64);
    } catch (err: any) {
      console.error("Error fetching teacher details:", err);
      setError(err.response?.data?.message || "Failed to load teacher details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Search filter
  const filteredTeachers = teachers.filter((teacher) => {
    const search = searchQuery.toLowerCase();
    return (
      teacher.fullNameEnglish.toLowerCase().includes(search) ||
      teacher.fullNameAmharic.toLowerCase().includes(search) ||
      teacher.email.toLowerCase().includes(search) ||
      teacher.phoneNumber.includes(search) ||
      teacher.departmentName.toLowerCase().includes(search) ||
      teacher.title.toLowerCase().includes(search)
    );
  });

  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Loading teachers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <p className="text-xl font-medium text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
        <Button
          onClick={fetchTeachers}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-gray-100">
          Teachers List
        </h1>
        <div className="w-full sm:w-80">
          <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
            Search Teachers
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, email, phone, department, title..."
            className="mt-1 border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500"
          />
        </div>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No teachers found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const fullNameENG = teacher.fullNameEnglish;
            const initials = fullNameENG
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card
                key={teacher.teacherId}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                onClick={() => fetchTeacherDetails(teacher)}
              >
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-blue-100 dark:border-blue-900">
                    {teacher.photographBase64 ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${teacher.photographBase64}`}
                        alt={fullNameENG}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="mt-4 text-xl text-blue-600 dark:text-gray-100">
                    {teacher.title} {fullNameENG}
                  </CardTitle>
                  <CardDescription className="text-base mt-1 text-gray-600 dark:text-gray-400">
                    {teacher.fullNameAmharic}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {teacher.departmentName}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{teacher.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>{teacher.assignedCoursesCount} course(s)</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal for teacher details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-600 dark:text-gray-100">
              Teacher Profile Details
            </DialogTitle>
            <DialogDescription>
              Full information and assigned courses
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Loading teacher details...
              </p>
            </div>
          ) : selectedTeacher ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-40 h-40 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                  {modalPhoto ? (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${modalPhoto}`}
                      alt={`${selectedTeacher.firstNameEnglish} ${selectedTeacher.lastNameEnglish}`}
                      onError={(e) => {
                        console.error(
                          "Teacher photo failed to load:",
                          modalPhoto.substring(0, 50)
                        );
                        e.currentTarget.src = "";
                      }}
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-blue-600 text-white">
                      {selectedTeacher.firstNameEnglish[0]}
                      {selectedTeacher.lastNameEnglish[0]}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-100">
                    {selectedTeacher.title} {selectedTeacher.firstNameEnglish}{" "}
                    {selectedTeacher.lastNameEnglish}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTeacher.firstNameAmharic}{" "}
                    {selectedTeacher.lastNameAmharic}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedTeacher.departmentName} • {selectedTeacher.gender}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="mt-1">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Number</Label>
                    <p className="mt-1">{selectedTeacher.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Hire Date (GC/EC)</Label>
                    <p className="mt-1">
                      {selectedTeacher.hireDateGC} /{" "}
                      {selectedTeacher.hireDateEC}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Years of Experience</Label>
                    <p className="mt-1">
                      {selectedTeacher.yearsOfExperience} years
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Date of Birth (GC/EC)</Label>
                    <p className="mt-1">
                      {selectedTeacher.dateOfBirthGC} /{" "}
                      {selectedTeacher.dateOfBirthEC}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Marital Status</Label>
                    <p className="mt-1">{selectedTeacher.maritalStatus}</p>
                  </div>
                  {selectedTeacher.impairmentName && (
                    <div>
                      <Label className="font-medium">Impairment</Label>
                      <p className="mt-1">{selectedTeacher.impairmentName}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Current Address</Label>
                    <p className="mt-1">
                      {selectedTeacher.woredaName}, {selectedTeacher.zoneName},{" "}
                      {selectedTeacher.regionName}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-gray-100">
                  Assigned Courses ({selectedTeacher.assignedCourses.length})
                </h3>
                {selectedTeacher.assignedCourses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No courses assigned yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeacher.assignedCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="bg-gray-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                      >
                        <CardContent className="p-4">
                          <div className="font-medium">
                            {course.courseCode} - {course.courseTitle}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Credit Hours: {course.totalCrHrs}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {course.batchClassYearSemesterName}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
