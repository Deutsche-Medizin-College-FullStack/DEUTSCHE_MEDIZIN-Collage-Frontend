"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  ArrowLeft,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

type Region = {
  regionCode: string;
  region: string;
  regionType: string;
};

type Zone = {
  zoneCode: string;
  zone: string;
  regionCode: string;
};

type Woreda = {
  woredaCode: string;
  woreda: string;
  zoneCode: string;
};

type ViceDeanFormData = {
  username: string;
  password: string;
  firstNameAMH: string;
  firstNameENG: string;
  fatherNameAMH: string;
  fatherNameENG: string;
  grandfatherNameAMH: string;
  grandfatherNameENG: string;
  gender: "MALE" | "FEMALE" | "";
  email: string;
  phoneNumber: string;
  residenceWoredaCode: string;
  residenceZoneCode: string;
  residenceRegionCode: string;
  hiredDateGC: string;
  title: string;
  remarks: string;
};

export default function CreateViceDean() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ViceDeanFormData>({
    username: "",
    password: "",
    firstNameAMH: "",
    firstNameENG: "",
    fatherNameAMH: "",
    fatherNameENG: "",
    grandfatherNameAMH: "",
    grandfatherNameENG: "",
    gender: "",
    email: "",
    phoneNumber: "",
    residenceWoredaCode: "",
    residenceZoneCode: "",
    residenceRegionCode: "",
    hiredDateGC: "",
    title: "",
    remarks: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingWoredas, setLoadingWoredas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const res = await apiClient.get(endPoints.allRegion);
      console.log("Regions response:", res.data);
      setRegions(res.data || []);
    } catch (err) {
      console.error("Failed to load regions", err);
      setError("Failed to load regions list");
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchZones = async (regionCode: string) => {
    if (!regionCode) {
      setZones([]);
      setWoredas([]);
      setFormData(prev => ({ ...prev, residenceZoneCode: "", residenceWoredaCode: "" }));
      return;
    }
    
    setLoadingZones(true);
    try {
      const res = await apiClient.get(`${endPoints.zonesByRegion}/${regionCode}`);
      console.log("Zones response:", res.data);
      setZones(res.data || []);
      setWoredas([]);
      setFormData(prev => ({ ...prev, residenceZoneCode: "", residenceWoredaCode: "" }));
    } catch (err) {
      console.error("Failed to load zones", err);
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  };

  const fetchWoredas = async (zoneCode: string) => {
    if (!zoneCode) {
      setWoredas([]);
      setFormData(prev => ({ ...prev, residenceWoredaCode: "" }));
      return;
    }
    
    setLoadingWoredas(true);
    try {
      const res = await apiClient.get(`${endPoints.woredasByZone}/${zoneCode}`);
      console.log("Woredas response:", res.data);
      setWoredas(res.data || []);
      setFormData(prev => ({ ...prev, residenceWoredaCode: "" }));
    } catch (err) {
      console.error("Failed to load woredas", err);
      setWoredas([]);
    } finally {
      setLoadingWoredas(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedDocument(file || null);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long");
      return false;
    }
    if (!formData.firstNameENG.trim() || !formData.firstNameAMH.trim()) {
      setError("First name in both English and Amharic is required");
      return false;
    }
    if (!formData.fatherNameENG.trim() || !formData.fatherNameAMH.trim()) {
      setError("Father's name in both English and Amharic is required");
      return false;
    }
    if (!formData.grandfatherNameENG.trim() || !formData.grandfatherNameAMH.trim()) {
      setError("Grandfather's name in both English and Amharic is required");
      return false;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.hiredDateGC) {
      setError("Hire date is required");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.residenceRegionCode) {
      setError("Region is required");
      return false;
    }
    if (!formData.residenceZoneCode) {
      setError("Zone is required");
      return false;
    }
    if (!formData.residenceWoredaCode) {
      setError("Woreda is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Create JSON payload
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        firstNameAMH: formData.firstNameAMH.trim(),
        firstNameENG: formData.firstNameENG.trim(),
        fatherNameAMH: formData.fatherNameAMH.trim(),
        fatherNameENG: formData.fatherNameENG.trim(),
        grandfatherNameAMH: formData.grandfatherNameAMH.trim(),
        grandfatherNameENG: formData.grandfatherNameENG.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        residenceWoredaCode: formData.residenceWoredaCode,
        residenceZoneCode: formData.residenceZoneCode,
        residenceRegionCode: formData.residenceRegionCode,
        hiredDateGC: formData.hiredDateGC,
        title: formData.title.trim(),
        remarks: formData.remarks.trim() || "",
      };
      
      console.log("Payload to send:", payload);
      
      // Add JSON payload as Blob
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formDataToSend.append("data", jsonBlob, "data.json");
      
      // Add photo if selected
      if (selectedPhoto) {
        formDataToSend.append("photograph", selectedPhoto);
      }
      
      // Add document if selected
      if (selectedDocument) {
        formDataToSend.append("document", selectedDocument);
      }
      
      // Submit the form
      const response = await apiClient.post(
        endPoints.createViceDean,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Create response:", response.data);
      setSuccess(`Vice Dean created successfully! User ID: ${response.data.userId}`);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate("/dean/vice-deans");
      }, 2000);
      
    } catch (err: any) {
      console.error("Failed to create vice dean:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create vice dean. Please check the form and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (regionCode: string) => {
    setFormData(prev => ({ ...prev, residenceRegionCode: regionCode }));
    fetchZones(regionCode);
  };

  const handleZoneChange = (zoneCode: string) => {
    setFormData(prev => ({ ...prev, residenceZoneCode: zoneCode }));
    fetchWoredas(zoneCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dean/vice-deans")}
            className="mb-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vice Deans
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Vice Dean
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below to register a new vice dean
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photo & Login Info */}
            <div className="lg:col-span-1 space-y-8">
              {/* Photo Upload Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <Avatar className="h-48 w-48 border-4 border-gray-200 dark:border-gray-700">
                        {photoPreview ? (
                          <AvatarImage src={photoPreview} alt="Preview" />
                        ) : (
                          <AvatarFallback className="text-4xl bg-gray-100 dark:bg-gray-900 text-gray-400">
                            <User className="h-24 w-24" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full shadow-lg"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload a profile photo (optional)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        JPG, PNG, or GIF • Max 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Information Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Login Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="e.g., vicedean001"
                      className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password"
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Must be at least 4 characters long
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Supporting Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document" className="text-gray-700 dark:text-gray-300">
                        Upload Document (Optional)
                      </Label>
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={documentInputRef}
                        onChange={handleDocumentChange}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    {selectedDocument && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Selected: {selectedDocument.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* English Names */}
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
                      English Names
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstNameENG">First Name *</Label>
                        <Input
                          id="firstNameENG"
                          value={formData.firstNameENG}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstNameENG: e.target.value }))}
                          placeholder="e.g., John"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fatherNameENG">Father's Name *</Label>
                        <Input
                          id="fatherNameENG"
                          value={formData.fatherNameENG}
                          onChange={(e) => setFormData(prev => ({ ...prev, fatherNameENG: e.target.value }))}
                          placeholder="e.g., Michael"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grandfatherNameENG">Grandfather's Name *</Label>
                        <Input
                          id="grandfatherNameENG"
                          value={formData.grandfatherNameENG}
                          onChange={(e) => setFormData(prev => ({ ...prev, grandfatherNameENG: e.target.value }))}
                          placeholder="e.g., Smith"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amharic Names */}
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Amharic Names (ግዕዝ) *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstNameAMH">መጀመሪያ ስም</Label>
                        <Input
                          id="firstNameAMH"
                          value={formData.firstNameAMH}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstNameAMH: e.target.value }))}
                          placeholder="ጆን"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fatherNameAMH">የአባት ስም</Label>
                        <Input
                          id="fatherNameAMH"
                          value={formData.fatherNameAMH}
                          onChange={(e) => setFormData(prev => ({ ...prev, fatherNameAMH: e.target.value }))}
                          placeholder="ማይክ"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grandfatherNameAMH">የአያት ስም</Label>
                        <Input
                          id="grandfatherNameAMH"
                          value={formData.grandfatherNameAMH}
                          onChange={(e) => setFormData(prev => ({ ...prev, grandfatherNameAMH: e.target.value }))}
                          placeholder="ስሚዝ"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Gender and Hire Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: "MALE" | "FEMALE") => 
                          setFormData(prev => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hiredDateGC">Hire Date *</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input
                          id="hiredDateGC"
                          type="date"
                          value={formData.hiredDateGC}
                          onChange={(e) => setFormData(prev => ({ ...prev, hiredDateGC: e.target.value }))}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="vicedean@college.edu.et"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="0911223344"
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Region */}
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select
                        value={formData.residenceRegionCode}
                        onValueChange={handleRegionChange}
                        disabled={loadingRegions}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue 
                            placeholder={loadingRegions ? "Loading regions..." : "Select Region"} 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.regionCode} value={region.regionCode}>
                              {region.region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Zone */}
                    <div className="space-y-2">
                      <Label htmlFor="zone">Zone *</Label>
                      <Select
                        value={formData.residenceZoneCode}
                        onValueChange={handleZoneChange}
                        disabled={loadingZones || !formData.residenceRegionCode}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue 
                            placeholder={
                              !formData.residenceRegionCode 
                                ? "Select region first" 
                                : loadingZones 
                                ? "Loading zones..." 
                                : "Select Zone"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.zoneCode} value={zone.zoneCode}>
                              {zone.zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Woreda */}
                    <div className="space-y-2">
                      <Label htmlFor="woreda">Woreda *</Label>
                      <Select
                        value={formData.residenceWoredaCode}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, residenceWoredaCode: value }))
                        }
                        disabled={loadingWoredas || !formData.residenceZoneCode}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue 
                            placeholder={
                              !formData.residenceZoneCode 
                                ? "Select zone first" 
                                : loadingWoredas 
                                ? "Loading woredas..." 
                                : "Select Woreda"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {woredas.map((woreda) => (
                            <SelectItem key={woreda.woredaCode} value={woreda.woredaCode}>
                              {woreda.woreda}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information Card */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Academic Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Dr., Prof., etc."
                      className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks / Notes (Optional)</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Additional notes about this vice dean..."
                      rows={3}
                      className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="sticky bottom-6 bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All fields marked with * are required
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dean/vice-deans")}
                      disabled={loading}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Vice Dean
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}