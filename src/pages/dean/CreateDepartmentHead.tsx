"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

interface Department {
  dptID: number;
  deptName: string;
  departmentCode: string;
  totalCrHr: number;
  programModality: {
    modalityCode: string;
    modality: string;
  };
  programLevel: {
    code: string;
    name: string;
  };
}

interface FormData {
  username: string;
  password: string;
  passwordConfirm: string;
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
  departmentId: number | "";
  residenceRegionCode: string;
  residenceZoneCode: string;
  residenceWoredaCode: string;
  remark: string;
}

export default function CreateDepartmentHead() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    passwordConfirm: "",
    firstNameENG: "",
    firstNameAMH: "",
    fatherNameENG: "",
    fatherNameAMH: "",
    grandfatherNameENG: "",
    grandfatherNameAMH: "",
    gender: "MALE",
    phoneNumber: "",
    email: "",
    hiredDateGC: "",
    hiredDateEC: "",
    departmentId: "",
    residenceRegionCode: "ADD",
    residenceZoneCode: "AKK",
    residenceWoredaCode: "1000",
    remark: "",
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDepartments, setIsFetchingDepartments] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const { toast } = useToast();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsFetchingDepartments(true);
      const response = await apiClient.get<Department[]>(endPoints.departments);
      setDepartments(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setIsFetchingDepartments(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateUsername = () => {
    if (formData.firstNameENG && formData.fatherNameENG) {
      const firstName = formData.firstNameENG.toLowerCase();
      const fatherName = formData.fatherNameENG.toLowerCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const username = `${firstName}.${fatherName}${randomNum}`.replace(/\s/g, '');
      handleInputChange("username", username);
    }
  };

  // File handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file only",
          variant: "destructive",
        });
        return;
      }
      setDocumentName(file.name);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removeDocument = () => {
    setDocumentName("");
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const validateForm = () => {
    // Required fields
    const requiredFields: (keyof FormData)[] = [
      "firstNameENG", "firstNameAMH", "fatherNameENG", "fatherNameAMH",
      "gender", "phoneNumber", "email", "departmentId", "password", "passwordConfirm"
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast({
          title: "Validation Error",
          description: `${field} is required`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    // Date validation
    if (!formData.hiredDateGC) {
      toast({
        title: "Validation Error",
        description: "Hired date is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Function to get default image as File (silent - no user notification)
  const getDefaultImageFile = async (): Promise<File> => {
    try {
      // Try to fetch the default image
      const response = await fetch("/assets/User_Icon.png");
      if (!response.ok) {
        throw new Error("Failed to fetch default image");
      }
      const blob = await response.blob();
      
      return new File(
        [blob], 
        "user_profile.png", 
        { type: blob.type || "image/png" }
      );
    } catch (error) {
      console.error("Failed to load default image:", error);
      // Create a simple placeholder image silently
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.arc(50, 35, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(30, 60, 40, 30);
      }
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "profile.png", {
              type: "image/png",
            });
            resolve(file);
          } else {
            // Last resort: empty file
            resolve(new File([], "profile.png", { type: "image/png" }));
          }
        }, 'image/png');
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare the data for API
      const jsonPayload = {
        username: formData.username.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        firstNameENG: formData.firstNameENG.trim(),
        firstNameAMH: formData.firstNameAMH.trim(),
        fatherNameENG: formData.fatherNameENG.trim(),
        fatherNameAMH: formData.fatherNameAMH.trim(),
        grandfatherNameENG: formData.grandfatherNameENG?.trim() || "",
        grandfatherNameAMH: formData.grandfatherNameAMH?.trim() || "",
        gender: formData.gender,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        hiredDateGC: formData.hiredDateGC,
        hiredDateEC: formData.hiredDateEC || calculateEthiopianDate(formData.hiredDateGC),
        departmentId: Number(formData.departmentId),
        residenceRegionCode: formData.residenceRegionCode,
        residenceZoneCode: formData.residenceZoneCode,
        residenceWoredaCode: formData.residenceWoredaCode,
        remark: formData.remark?.trim() || "",
      };

      // Always use multipart/form-data
      const multipart = new FormData();
      
      // Append JSON data - note: the API expects "data" field with JSON string
      multipart.append(
        "data",
        new Blob([JSON.stringify(jsonPayload)], { type: "application/json" })
      );

      // Check if user uploaded a photo
      const photoFile = photoInputRef.current?.files?.[0];
      
      if (photoFile) {
        // Use user-uploaded photo
        multipart.append("photo", photoFile);
      } else {
        // Silently use default image - no notification to user
        try {
          const defaultImageFile = await getDefaultImageFile();
          multipart.append("photo", defaultImageFile);
          // No toast notification - silent operation
        } catch (error) {
          console.error("Failed to add default image:", error);
          // Continue silently even if default image fails
        }
      }

      // Append document if available
      const docFile = documentInputRef.current?.files?.[0];
      if (docFile) {
        multipart.append("documents", docFile);
      }

      // Send the FormData with multipart
      const response = await apiClient.post(
        endPoints.registerDepartmentHead,
        multipart,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast({
        title: "Success",
        description: response.data?.message || "Department Head created successfully",
      });

      // Navigate to department heads list
      setTimeout(() => {
        navigate("/dean/department-heads");
      }, 1500);

    } catch (error: any) {
      
      let errorMessage = "Failed to create department head";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Your session may have expired. Please log in again.";
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data)
          : error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      passwordConfirm: "",
      firstNameENG: "",
      firstNameAMH: "",
      fatherNameENG: "",
      fatherNameAMH: "",
      grandfatherNameENG: "",
      grandfatherNameAMH: "",
      gender: "MALE",
      phoneNumber: "",
      email: "",
      hiredDateGC: "",
      hiredDateEC: "",
      departmentId: "",
      residenceRegionCode: "ADD",
      residenceZoneCode: "AKK",
      residenceWoredaCode: "1000",
      remark: "",
    });
    setPhotoPreview(null);
    setDocumentName("");
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  // Calculate Ethiopian date (simplified)
  const calculateEthiopianDate = (gregorianDate: string) => {
    if (!gregorianDate) return "";
    
    try {
      const date = new Date(gregorianDate);
      const year = date.getFullYear();
      const ethiopianYear = year - 8; // Approximate conversion
      return `${ethiopianYear}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

  // Show preview image
  const getImagePreview = () => {
    if (photoPreview) {
      return photoPreview;
    }
    // Show default image preview when no user image is selected
    return "/assets/User_Icon.png";
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-8">
      <div className="w-full max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dean/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Department Head</h1>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Department Head Information
            </CardTitle>
            <CardDescription>
              Create a new department head account with login credentials. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstNameENG">
                      First Name (English) *
                    </Label>
                    <Input
                      id="firstNameENG"
                      value={formData.firstNameENG}
                      onChange={(e) => handleInputChange("firstNameENG", e.target.value)}
                      placeholder="Enter first name in English"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstNameAMH">
                      First Name (Amharic) *
                    </Label>
                    <Input
                      id="firstNameAMH"
                      value={formData.firstNameAMH}
                      onChange={(e) => handleInputChange("firstNameAMH", e.target.value)}
                      placeholder="Enter first name in Amharic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherNameENG">
                      Father Name (English) *
                    </Label>
                    <Input
                      id="fatherNameENG"
                      value={formData.fatherNameENG}
                      onChange={(e) => handleInputChange("fatherNameENG", e.target.value)}
                      placeholder="Enter father's name in English"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fatherNameAMH">
                      Father Name (Amharic) *
                    </Label>
                    <Input
                      id="fatherNameAMH"
                      value={formData.fatherNameAMH}
                      onChange={(e) => handleInputChange("fatherNameAMH", e.target.value)}
                      placeholder="Enter father's name in Amharic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grandfatherNameENG">
                      Grandfather Name (English)
                    </Label>
                    <Input
                      id="grandfatherNameENG"
                      value={formData.grandfatherNameENG}
                      onChange={(e) => handleInputChange("grandfatherNameENG", e.target.value)}
                      placeholder="Enter grandfather's name in English"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grandfatherNameAMH">
                      Grandfather Name (Amharic)
                    </Label>
                    <Input
                      id="grandfatherNameAMH"
                      value={formData.grandfatherNameAMH}
                      onChange={(e) => handleInputChange("grandfatherNameAMH", e.target.value)}
                      placeholder="Enter grandfather's name in Amharic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="0911223344"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="username">Username *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateUsername}
                        className="text-xs"
                      >
                        Generate
                      </Button>
                    </div>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Username will be generated"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={(e) => handleInputChange("passwordConfirm", e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Employment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select 
                      value={formData.departmentId.toString()} 
                      onValueChange={(value) => handleInputChange("departmentId", value)}
                      disabled={isFetchingDepartments}
                    >
                      <SelectTrigger>
                        {isFetchingDepartments ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading departments...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Select department" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.dptID} value={dept.dptID.toString()}>
                            {dept.deptName} ({dept.departmentCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hiredDateGC">Hire Date (Gregorian) *</Label>
                    <Input
                      id="hiredDateGC"
                      type="date"
                      value={formData.hiredDateGC}
                      onChange={(e) => {
                        handleInputChange("hiredDateGC", e.target.value);
                        // Auto-calculate Ethiopian date
                        const ethDate = calculateEthiopianDate(e.target.value);
                        if (ethDate) {
                          handleInputChange("hiredDateEC", ethDate);
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hiredDateEC">Hire Date (Ethiopian)</Label>
                    <Input
                      id="hiredDateEC"
                      value={formData.hiredDateEC}
                      onChange={(e) => handleInputChange("hiredDateEC", e.target.value)}
                      placeholder="Auto-calculated from Gregorian date"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="remark">Remark</Label>
                    <Input
                      id="remark"
                      value={formData.remark}
                      onChange={(e) => handleInputChange("remark", e.target.value)}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Photograph</Label>
                      <span className="text-xs text-gray-500">
                        Optional
                      </span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={getImagePreview()}
                          alt="Profile preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {photoPreview && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={removePhoto}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full"
                        >
                          {photoPreview ? "Change Photo" : "Upload Photo"}
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={photoInputRef}
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500">
                          Upload profile photo (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Supporting Document</Label>
                      <span className="text-xs text-gray-500">Optional, PDF only</span>
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => documentInputRef.current?.click()}
                        className="w-full"
                      >
                        {documentName ? "Change Document" : "Upload Document"}
                      </Button>
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={documentInputRef}
                        onChange={handleDocumentChange}
                        className="hidden"
                      />
                      {documentName && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm truncate">{documentName}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={removeDocument}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isLoading || isFetchingDepartments}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Department Head"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Clear Form
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => navigate("/dean/department-heads")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-2">
            <span className="text-red-500">*</span> Required fields
          </p>
          <p className="mt-1">Note: Username will be auto-generated based on first and father names.</p>
        </div>
      </div>
    </div>
  );
}