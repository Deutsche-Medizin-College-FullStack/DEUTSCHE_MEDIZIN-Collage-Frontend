import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function DeanProfile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fake data for one dean
  const deanData = {
    firstName: "Michael",
    lastName: "Tesfaye",
    email: "michael.tesfaye@example.com",
    phone: "+251911223344",
    address: "Addis Ababa, Ethiopia",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/...",
    qualification: "PhD in Educational Leadership",
    departmentOverseen: "Faculty of Science",
    yearsOfService: "10 years",
    officeLocation: "Main Campus, Building A, Room 101",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-gray-100">
          Dean Profile
        </h1>
        <div className="flex space-x-2">
          <Link
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="mr-2">&larr;</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="space-y-2">
            <Label
              htmlFor="search"
              className="text-gray-700 dark:text-gray-300"
            >
              Search
            </Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deans..."
              className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dean Basic Info */}
        <Card className="lg:col-span-1 bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-32 h-32">
                <AvatarImage src={deanData.photo} />
                <AvatarFallback className="text-2xl bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-300">
                  {deanData.firstName[0]}
                  {deanData.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-4 text-blue-600 dark:text-gray-100">
              {deanData.firstName} {deanData.lastName}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Dean of {deanData.departmentOverseen}
            </CardDescription>
            <Badge
              variant="secondary"
              className="mt-2 bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-300"
            >
              {deanData.qualification}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 text-blue-600 dark:text-gray-300" />
              <span>{deanData.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 text-blue-600 dark:text-gray-300" />
              <span>{deanData.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-gray-300" />
              <span>{deanData.address}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-gray-300" />
              <span>Years of Service: {deanData.yearsOfService}</span>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-gray-100">
              Dean Information
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Details about the dean and their role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-gray-700 dark:text-gray-300"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={deanData.firstName}
                  readOnly
                  className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={deanData.lastName}
                  readOnly
                  className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  value={deanData.email}
                  readOnly
                  className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={deanData.phone}
                  readOnly
                  className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <Separator className="bg-blue-200 dark:bg-gray-700" />

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-gray-700 dark:text-gray-300"
              >
                Address
              </Label>
              <Input
                id="address"
                value={deanData.address}
                readOnly
                className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
