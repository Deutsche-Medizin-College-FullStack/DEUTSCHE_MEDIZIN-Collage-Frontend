"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Clock,
  CalendarDays,
  Users,
  Hash,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";

interface Course {
  id: number;
  code: string;
  title: string;
  totalCrHrs: number;
  classYearName: string;
  semesterName: string;
}

export default function Courses() {
  const { t } = useTranslation(["departmentHead", "common"]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await apiService.get<Course[]>(
          endPoints.myDepartmentCourses
        );
        setCourses(response);
        setFilteredCourses(response);
      } catch (error) {
        console.error("Error loading department courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = courses.filter(
      (course) =>
        course.code.toLowerCase().includes(lowerSearch) ||
        course.title.toLowerCase().includes(lowerSearch) ||
        course.classYearName.toLowerCase().includes(lowerSearch) ||
        course.semesterName.toLowerCase().includes(lowerSearch)
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  // Group courses by classYearName for better organization
  const groupedCourses = filteredCourses.reduce((groups, course) => {
    const year = course.classYearName || "Uncategorized";
    if (!groups[year]) groups[year] = [];
    groups[year].push(course);
    return groups;
  }, {} as Record<string, Course[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("common:loading") || "Loading..."}</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <div className="text-lg text-muted-foreground">
          No courses found in your department
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8" />
          My Department Courses
        </h1>
        <p className="text-blue-100">
          All {courses.length} courses offered by your department
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by code, title, year, or semester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CardDescription>
            {filteredCourses.length} course
            {filteredCourses.length !== 1 ? "s" : ""} shown
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grouped Course Cards */}
      <div className="space-y-8">
        {Object.entries(groupedCourses)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort years logically if needed
          .map(([year, yearCourses]) => (
            <div key={year} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {year} ({yearCourses.length} course
                {yearCourses.length !== 1 ? "s" : ""})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {yearCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {course.code}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-base font-medium">
                            {course.title}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {course.totalCrHrs} CrHrs
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          {course.semesterName}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>

      {filteredCourses.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No courses match your search criteria
          </CardContent>
        </Card>
      )}
    </div>
  );
}
