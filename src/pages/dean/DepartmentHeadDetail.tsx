"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Edit,
  Save,
  X,
  Camera,
  Upload,
  Building,
  Calendar,
  User,
  IdCard,
  Briefcase,
  Home,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface Region {
  regionCode: string;
  region: string;
}

interface Zone {
  zoneCode: string;
  zone: string;
}

interface Woreda {
  woredaCode: string;
  woreda: string;
}

interface DepartmentHead {
  id: number;
  username: string;
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
  department: {
    id: number;
    name: string;
  };
  residenceRegion: { id: string; name: string };
  residenceZone: { id: string; name: string };
  residenceWoreda: { id: string; name: string };
  remark?: string;
  active: boolean;
  hasPhoto: boolean;
  hasDocument: boolean;
}

interface EditFormData {
  firstNameENG: string;
  firstNameAMH: string;
  fatherNameENG: string;
  fatherNameAMH: string;
  grandfatherNameENG: string;
  grandfatherNameAMH: string;
  phoneNumber: string;
  email: string;
  remark?: string;
  residenceRegionCode: string;
  residenceZoneCode: string;
  residenceWoredaCode: string;
}

export default function DepartmentHeadDetail() {
  const { id: headId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [head, setHead] = useState<DepartmentHead | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);

  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (headId) {
      fetchHeadDetail();
      fetchRegions();
    }
  }, [headId]);

  const fetchRegions = async () => {
    try {
      const res = await apiClient.get<Region[]>(endPoints.regions);
      setRegions(res.data || []);
    } catch (err) {
      console.error("Failed to load regions", err);
    }
  };

  const fetchZones = async (regionCode: string) => {
    try {
      const res = await apiClient.get<Zone[]>(`${endPoints.zonesByRegion}/${regionCode}`);
      setZones(res.data || []);
      setWoredas([]);
    } catch (err) {
      console.error("Failed to load zones", err);
      setZones([]);
    }
  };

  const fetchWoredas = async (zoneCode: string) => {
    try {
      const res = await apiClient.get<Woreda[]>(`${endPoints.woredasByZone}/${zoneCode}`);
      setWoredas(res.data || []);
    } catch (err) {
      console.error("Failed to load woredas", err);
      setWoredas([]);
    }
  };

  const fetchHeadDetail = async () => {
    if (!headId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<DepartmentHead>(endPoints.getDepartmentHeadById(headId));
      const data = res.data;
      setHead(data);

      setEditForm({
        firstNameENG: data.firstNameENG,
        firstNameAMH: data.firstNameAMH,
        fatherNameENG: data.fatherNameENG,
        fatherNameAMH: data.fatherNameAMH,
        grandfatherNameENG: data.grandfatherNameENG,
        grandfatherNameAMH: data.grandfatherNameAMH,
        phoneNumber: data.phoneNumber,
        email: data.email,
        remark: data.remark || "",
        residenceRegionCode: data.residenceRegion.id,
        residenceZoneCode: data.residenceZone.id,
        residenceWoredaCode: data.residenceWoreda.id,
      });

      // Load photo - FIXED: This wasn't being called properly
      if (data.hasPhoto) {
        await loadPhoto(headId);
      } else {
        setPhotoPreview(null);
      }

      // Preload location data
      if (data.residenceRegion.id) {
        fetchZones(data.residenceRegion.id);
        if (data.residenceZone.id) {
          fetchWoredas(data.residenceZone.id);
        }
      }
    } catch (err: any) {
      setError("Failed to load profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhoto = async (id: string) => {
    try {
      setPhotoLoading(true);
      console.log("Fetching photo for ID:", id);
      
      const photoRes = await apiClient.get(
        endPoints.getDepartmentHeadPhoto(id),
        {
          responseType: "blob",
          headers: {
            'Accept': 'image/*'
          }
        }
      );
      
      console.log("Photo response received:", photoRes);
      
      if (photoRes.data && photoRes.data instanceof Blob) {
        const url = URL.createObjectURL(photoRes.data);
        setPhotoPreview(url);
        console.log("Photo loaded successfully");
      }
    } catch (err: any) {
      console.error("Photo load failed:", err);
      if (err.response?.status === 404) {
        console.log("Photo not found for this department head");
        toast.warning("Profile photo not available");
      } else {
        toast.error("Failed to load profile photo");
      }
      setPhotoPreview(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRegionChange = (value: string) => {
    setEditForm(prev => ({
      ...prev!,
      residenceRegionCode: value,
      residenceZoneCode: "",
      residenceWoredaCode: "",
    }));
    if (value) fetchZones(value);
  };

  const handleZoneChange = (value: string) => {
    setEditForm(prev => ({
      ...prev!,
      residenceZoneCode: value,
      residenceWoredaCode: "",
    }));
    if (value) fetchWoredas(value);
  };

  const handleWoredaChange = (value: string) => {
    setEditForm(prev => ({ ...prev!, residenceWoredaCode: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev!, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be less than 2MB");
      return;
    }
    
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF or Word document");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document must be less than 5MB");
      return;
    }
    
    setDocumentFile(file);
    toast.success("Document selected: " + file.name);
  };

  const triggerPhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerDocumentUpload = () => {
    if (docInputRef.current) {
      docInputRef.current.click();
    }
  };

  const handleSave = async () => {
    if (!headId || !editForm) return;

    try {
      setSaving(true);
      
      // Create update data object
      const updateData: any = {
        phoneNumber: editForm.phoneNumber,
        email: editForm.email,
      };
      
      // Add location fields only if they're provided
      if (editForm.residenceRegionCode) {
        updateData.residenceRegionCode = editForm.residenceRegionCode;
      }
      if (editForm.residenceZoneCode) {
        updateData.residenceZoneCode = editForm.residenceZoneCode;
      }
      if (editForm.residenceWoredaCode) {
        updateData.residenceWoredaCode = editForm.residenceWoredaCode;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(updateData));

      // Add photo if selected
      if (photoFile) {
        formData.append("photo", photoFile);
      }
      
      // Add document if selected
      if (documentFile) {
        formData.append("documents", documentFile);
      }

      console.log("Saving with form data:", {
        ...updateData,
        hasPhoto: !!photoFile,
        hasDocument: !!documentFile
      });

      await apiClient.patch(endPoints.updateDepartmentHead(headId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setPhotoFile(null);
      setDocumentFile(null);
      
      // Reload data
      await fetchHeadDetail();
      
    } catch (err: any) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const downloadDocument = async () => {
    if (!headId || !head?.hasDocument) {
      toast.error("No document available");
      return;
    }

    try {
      const res = await apiClient.get(endPoints.getDepartmentHeadDocument(headId), {
        responseType: "blob",
      });
      
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `department_head_${headId}_document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Document downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download document");
    }
  };

  const getInitials = () => {
    if (!head) return "NA";
    return `${head.firstNameENG?.[0] || ""}${head.fatherNameENG?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div>
            <p className="text-lg font-medium">Loading profile...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the details</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !head) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-red-600">Profile Not Found</h2>
            <p className="text-gray-600 mt-2">{error || "The department head profile could not be found"}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="px-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Card */}
      <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Department Head Profile</h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {head.department.name} Department
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <Badge 
                  variant={head.active ? "default" : "destructive"} 
                  className="px-3 py-1 text-sm"
                >
                  {head.active ? (
                    <>
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : "Inactive"}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {head.gender}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline" 
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setPhotoFile(null);
                      setDocumentFile(null);
                      // Reset photo preview to original
                      if (head.hasPhoto && !photoFile) {
                        loadPhoto(headId!);
                      } else if (!head.hasPhoto) {
                        setPhotoPreview(null);
                      }
                    }} 
                    variant="outline"
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-0 shadow-lg">
          <CardContent className="pt-8 text-center space-y-6">
            {/* Avatar Section */}
            <div className="relative inline-block group">
              <div className="relative">
                <Avatar className="w-48 h-48 border-8 border-white dark:border-gray-800 shadow-xl">
                  {photoLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : photoPreview ? (
                    <AvatarImage 
                      src={photoPreview} 
                      alt="Profile photo" 
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Button
                      onClick={triggerPhotoUpload}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              {isEditing && photoFile && (
                <p className="text-sm text-green-600 mt-2">{photoFile.name}</p>
              )}
            </div>

            {/* Name Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {head.firstNameENG} {head.fatherNameENG} {head.grandfatherNameENG}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {head.firstNameAMH} {head.fatherNameAMH} {head.grandfatherNameAMH}
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <IdCard className="h-4 w-4" />
                @{head.username}
              </p>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-md">
                  <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{head.department.name}</p>
                  <p className="text-xs text-gray-400">ID: {head.department.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  {isEditing ? (
                    <Input
                      name="email"
                      value={editForm?.email || ""}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{head.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  {isEditing ? (
                    <Input
                      name="phoneNumber"
                      value={editForm?.phoneNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Phone"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{head.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Residence</p>
                  <p className="font-medium">
                    {head.residenceWoreda.name}, {head.residenceZone.name}, {head.residenceRegion.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Hired Date</p>
                  <div className="space-y-1">
                    <p className="font-medium">GC: {formatDate(head.hiredDateGC)}</p>
                    <p className="text-sm text-gray-500">EC: {head.hiredDateEC}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Documents</h3>
                {head.hasDocument && !isEditing && (
                  <Badge variant="outline" className="text-xs">
                    Available
                  </Badge>
                )}
              </div>

              {!isEditing ? (
                head.hasDocument && (
                  <Button 
                    onClick={downloadDocument} 
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Download Document
                  </Button>
                )
              ) : (
                <div className="space-y-3">
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                  <Button 
                    onClick={triggerDocumentUpload}
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {documentFile ? "Change Document" : "Upload Document"}
                  </Button>
                  {documentFile && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Selected: {documentFile.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Size: {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription>
                Complete name details in English and Amharic
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name (English)
                  </label>
                  {isEditing ? (
                    <Input
                      name="firstNameENG"
                      value={editForm?.firstNameENG || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.firstNameENG}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name (አማርኛ)
                  </label>
                  {isEditing ? (
                    <Input
                      name="firstNameAMH"
                      value={editForm?.firstNameAMH || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.firstNameAMH}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father's Name (English)
                  </label>
                  {isEditing ? (
                    <Input
                      name="fatherNameENG"
                      value={editForm?.fatherNameENG || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.fatherNameENG}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Father's Name (አማርኛ)
                  </label>
                  {isEditing ? (
                    <Input
                      name="fatherNameAMH"
                      value={editForm?.fatherNameAMH || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.fatherNameAMH}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grandfather's Name (English)
                  </label>
                  {isEditing ? (
                    <Input
                      name="grandfatherNameENG"
                      value={editForm?.grandfatherNameENG || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.grandfatherNameENG}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grandfather's Name (አማርኛ)
                  </label>
                  {isEditing ? (
                    <Input
                      name="grandfatherNameAMH"
                      value={editForm?.grandfatherNameAMH || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.grandfatherNameAMH}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Residence Information Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Residence Address
              </CardTitle>
              <CardDescription>
                Current residential information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                  {isEditing ? (
                    <Select value={editForm?.residenceRegionCode} onValueChange={handleRegionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r.regionCode} value={r.regionCode}>{r.region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.residenceRegion.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Zone</label>
                  {isEditing ? (
                    <Select
                      value={editForm?.residenceZoneCode}
                      onValueChange={handleZoneChange}
                      disabled={!editForm?.residenceRegionCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(z => (
                          <SelectItem key={z.zoneCode} value={z.zoneCode}>{z.zone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.residenceZone.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Woreda</label>
                  {isEditing ? (
                    <Select
                      value={editForm?.residenceWoredaCode}
                      onValueChange={handleWoredaChange}
                      disabled={!editForm?.residenceZoneCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select woreda" />
                      </SelectTrigger>
                      <SelectContent>
                        {woredas.map(w => (
                          <SelectItem key={w.woredaCode} value={w.woredaCode}>{w.woreda}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-lg">{head.residenceWoreda.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Additional Information
              </CardTitle>
              <CardDescription>
                Additional remarks and notes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                {isEditing ? (
                  <Textarea
                    name="remark"
                    value={editForm?.remark || ""}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Add any remarks or notes..."
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className={head.remark ? "text-lg" : "text-lg text-gray-500 italic"}>
                      {head.remark || "No remarks provided"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
}