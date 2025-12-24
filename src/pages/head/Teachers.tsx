"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import { useNavigate } from "react-router-dom";
type Teacher = {
  teacherId: number;
  fullName: string;
  title: string;
  email: string;
  phoneNumber: string;
  yearsOfExperience: number;
  numberOfCourses: number;
  // Optional: if backend sends Amharic names or photo in future
  firstNameAmharic?: string;
  lastNameAmharic?: string;
  photographBase64?: string;
};

export default function HeadTeachers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Fetch real teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(endPoints.departmentTeachers); // Adjust if your endPoints has a specific key
        // Assuming endPoints.departmentTeachers = "/department-heads/teachers"

        if (res.data && Array.isArray(res.data)) {
          setTeachers(res.data);
        } else {
          setTeachers([]);
          setError("No teachers found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch teachers:", err);
        if (err.response?.status === 404) {
          setError("No teachers assigned to your department yet.");
        } else if (err.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response?.data?.error || "Failed to load teachers.");
        }
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Search filter
  const filtered = useMemo(() => {
    if (!query) return teachers;

    const lowerQuery = query.toLowerCase();
    return teachers.filter(
      (t) =>
        t.teacherId.toString().includes(query) ||
        t.fullName.toLowerCase().includes(lowerQuery) ||
        t.email.toLowerCase().includes(lowerQuery) ||
        t.phoneNumber.includes(query) ||
        t.title.toLowerCase().includes(lowerQuery)
    );
  }, [teachers, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Department Teachers</h1>
        <Link to="/head/create-teacher">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create Teacher
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Management</CardTitle>
          <CardDescription>
            View and manage all teachers in your department
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <Input
            placeholder="Search by ID, name, email, phone, or title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md"
            disabled={loading}
          />

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading teachers...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Teachers Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 pr-6">Photo</th>
                    <th className="py-3 pr-6">Teacher ID</th>
                    <th className="py-3 pr-6">Name</th>
                    <th className="py-3 pr-6">Department</th>
                    <th className="py-3 pr-6">Title</th>
                    <th className="py-3 pr-6">Courses</th>
                    <th className="py-3 pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No teachers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((teacher) => (
                      <tr
                        key={teacher.teacherId}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-4 pr-6">
                          <Avatar>
                            <AvatarImage
                              src={teacher.photographBase64 || undefined}
                            />
                            <AvatarFallback className="bg-primary/10">
                              {teacher.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="py-4 pr-6 font-mono text-muted-foreground">
                          {teacher.teacherId}
                        </td>
                        <td className="py-4 pr-6">
                          <div className="font-medium">{teacher.fullName}</div>
                          {/* If Amharic name is added later */}
                          {/* <div className="text-sm text-muted-foreground font-geez">
                            {teacher.firstNameAmharic} {teacher.lastNameAmharic}
                          </div> */}
                        </td>
                        <td className="py-4 pr-6">
                          <Badge variant="secondary">Your Department</Badge>
                        </td>
                        <td className="py-4 pr-6">{teacher.title}</td>
                        <td className="py-4 pr-6 text-center">
                          <Badge variant="outline">
                            {teacher.numberOfCourses}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                // onClick={() => setSelectedTeacher(teacher)}
                                onClick={() =>
                                  navigate(
                                    "/head/teachers/" + teacher.teacherId
                                  )
                                }
                              >
                                View Profile
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">
                                  Teacher Profile
                                </DialogTitle>
                              </DialogHeader>

                              {selectedTeacher && (
                                <div className="space-y-6 py-6">
                                  <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                      <AvatarImage
                                        src={
                                          selectedTeacher.photographBase64 ||
                                          undefined
                                        }
                                      />
                                      <AvatarFallback className="text-2xl">
                                        {selectedTeacher.fullName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-semibold">
                                        {selectedTeacher.fullName}
                                      </h3>
                                      <p className="text-muted-foreground">
                                        ID: {selectedTeacher.teacherId}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3">
                                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm text-muted-foreground">
                                            Academic Title
                                          </p>
                                          <p className="font-medium">
                                            {selectedTeacher.title}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm text-muted-foreground">
                                            Experience
                                          </p>
                                          <p className="font-medium">
                                            {selectedTeacher.yearsOfExperience}{" "}
                                            years
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Courses Assigned
                                        </p>
                                        <p className="font-medium text-lg">
                                          {selectedTeacher.numberOfCourses}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm text-muted-foreground">
                                            Email
                                          </p>
                                          <p className="font-medium">
                                            {selectedTeacher.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm text-muted-foreground">
                                            Phone
                                          </p>
                                          <p className="font-medium">
                                            {selectedTeacher.phoneNumber}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
