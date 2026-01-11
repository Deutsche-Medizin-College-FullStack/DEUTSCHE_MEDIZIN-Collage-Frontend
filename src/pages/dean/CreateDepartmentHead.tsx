"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Loader2 } from "lucide-react";
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
  const { toast } = useToast();

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
      console.error("Failed to fetch departments:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare the data for API
      const requestData = {
        ...formData,
        // Ensure departmentId is a number
        departmentId: Number(formData.departmentId),
        // Set default Ethiopian date if not provided
        hiredDateEC: formData.hiredDateEC || "2015-12-24", // Default Ethiopian date
      };

      // Create FormData for file upload capability
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(requestData));

      // Make API call
      const response = await apiClient.post(
        endPoints.registerDepartmentHead,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast({
        title: "Success",
        description: response.data.message || "Department Head created successfully",
      });

      // Navigate to department heads list
      setTimeout(() => {
        navigate("/dean/department-heads");
      }, 1500);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create department head",
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