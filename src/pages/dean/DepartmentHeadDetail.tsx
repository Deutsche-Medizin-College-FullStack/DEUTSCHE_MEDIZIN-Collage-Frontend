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
import { Separator } from "@/components/ui/separator";
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
  User,
  Building,
  Calendar,
  Home,
  Eye,
  Download,
  Upload,
  Camera,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

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

export default function DepartmentHeadDetail() {
  const { id: headId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [documentViewerVisible, setDocumentViewerVisible] = useState(false);

  const [head, setHead] = useState<DepartmentHead | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);

  const [editForm, setEditForm] = useState({
    firstNameENG: "",
    firstNameAMH: "",
    fatherNameENG: "",
    fatherNameAMH: "",
    grandfatherNameENG: "",
    grandfatherNameAMH: "",
    phoneNumber: "",
    email: "",
    remark: "",
    residenceRegionCode: "",
    residenceZoneCode: "",
    residenceWoredaCode: "",
  });
  
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

      // Initialize edit form
      setEditForm({
        firstNameENG: data.firstNameENG || "",
        firstNameAMH: data.firstNameAMH || "",
        fatherNameENG: data.fatherNameENG || "",
        fatherNameAMH: data.fatherNameAMH || "",
        grandfatherNameENG: data.grandfatherNameENG || "",
        grandfatherNameAMH: data.grandfatherNameAMH || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        remark: data.remark || "",
        residenceRegionCode: data.residenceRegion?.id || "",
        residenceZoneCode: data.residenceZone?.id || "",
        residenceWoredaCode: data.residenceWoreda?.id || "",
      });

      // Load photo
      if (data.hasPhoto) {
        await loadPhoto(headId);
      } else {
        setPhotoPreview(null);
      }

      // Load document if exists
      if (data.hasDocument) {
        await loadDocument(headId);
      } else {
        setDocumentBlob(null);
      }

      // Preload location data
      if (data.residenceRegion?.id) {
        fetchZones(data.residenceRegion.id);
        if (data.residenceZone?.id) {
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
      const photoRes = await apiClient.get(
        endPoints.getDepartmentHeadPhoto(id),
        {
          responseType: "blob",
          headers: {
            'Accept': 'image/*'
          }
        }
      );
      
      if (photoRes.data && photoRes.data instanceof Blob) {
        const url = URL.createObjectURL(photoRes.data);
        setPhotoPreview(url);
      }
    } catch (err: any) {
      console.error("Photo load failed:", err);
      if (err.response?.status === 404) {
        console.log("Photo not found");
      }
      setPhotoPreview(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  const loadDocument = async (id: string) => {
    try {
      setDocumentLoading(true);
      const documentRes = await apiClient.get(
        endPoints.getDepartmentHeadDocument(id),
        {
          responseType: "blob",
        }
      );
      
      if (documentRes.data && documentRes.data instanceof Blob) {
        setDocumentBlob(documentRes.data);
      }
    } catch (err: any) {
      console.error("Document load failed:", err);
      if (err.response?.status === 404) {
        console.log("Document not found");
        setDocumentBlob(null);
      }
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleRegionChange = (value: string) => {
    setEditForm(prev => ({
      ...prev,
      residenceRegionCode: value,
      residenceZoneCode: "",
      residenceWoredaCode: "",
    }));
    if (value) fetchZones(value);
  };

  const handleZoneChange = (value: string) => {
    setEditForm(prev => ({
      ...prev,
      residenceZoneCode: value,
      residenceWoredaCode: "",
    }));
    if (value) fetchWoredas(value);
  };

  const handleWoredaChange = (value: string) => {
    setEditForm(prev => ({ ...prev, residenceWoredaCode: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerDocumentUpload = () => {
    docInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!headId || !head) return;

    try {
      setSaving(true);
      
      const updatePayload = {
        firstNameENG: editForm.firstNameENG.trim(),
        firstNameAMH: editForm.firstNameAMH.trim(),
        fatherNameENG: editForm.fatherNameENG.trim(),
        fatherNameAMH: editForm.fatherNameAMH.trim(),
        grandfatherNameENG: editForm.grandfatherNameENG.trim(),
        grandfatherNameAMH: editForm.grandfatherNameAMH.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        email: editForm.email.trim(),
        residenceRegionCode: editForm.residenceRegionCode,
        residenceZoneCode: editForm.residenceZoneCode,
        residenceWoredaCode: editForm.residenceWoredaCode,
        remarks: editForm.remark.trim(),
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(updatePayload)], { type: 'application/json' });
      
      formData.append('data', jsonBlob);

      if (photoFile) {
        formData.append('photograph', photoFile);
      }

      if (documentFile) {
        formData.append('document', documentFile);
      }

      await apiClient.patch(
        `${endPoints.departmentHeads}/${headId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success("Department head updated successfully!");
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

  const handleCancelEdit = () => {
    if (head) {
      setEditForm({
        firstNameENG: head.firstNameENG || "",
        firstNameAMH: head.firstNameAMH || "",
        fatherNameENG: head.fatherNameENG || "",
        fatherNameAMH: head.fatherNameAMH || "",
        grandfatherNameENG: head.grandfatherNameENG || "",
        grandfatherNameAMH: head.grandfatherNameAMH || "",
        phoneNumber: head.phoneNumber || "",
        email: head.email || "",
        remark: head.remark || "",
        residenceRegionCode: head.residenceRegion?.id || "",
        residenceZoneCode: head.residenceZone?.id || "",
        residenceWoredaCode: head.residenceWoreda?.id || "",
      });
    }
    setPhotoFile(null);
    setDocumentFile(null);
    setIsEditing(false);
    
    // Reset photo preview
    if (head?.hasPhoto && !photoFile) {
      loadPhoto(headId!);
    } else if (!head?.hasPhoto) {
      setPhotoPreview(null);
    }
  };

  const downloadDocument = () => {
    if (!headId || !head?.hasDocument || !documentBlob) {
      toast.error("No document available");
      return;
    }

    try {
      const url = URL.createObjectURL(documentBlob);
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

  const viewDocument = () => {
    if (!headId || !head?.hasDocument || !documentBlob) {
      toast.error("No document available to view");
      return;
    }
    setDocumentViewerVisible(true);
  };

  const getInitials = () => {
    if (!head) return "NA";
    return `${head.firstNameENG?.[0] || ""}${head.fatherNameENG?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading department head details...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error || !head) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
              {error || "The department head profile could not be found or loaded."}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="px-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button variant="default" onClick={fetchHeadDetail} className="px-6">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const fullNameEnglish = `${head.firstNameENG || ""} ${head.fatherNameENG || ""} ${head.grandfatherNameENG || ""}`.trim();
  const fullNameAmharic = `${head.firstNameAMH || ""} ${head.fatherNameAMH || ""} ${head.grandfatherNameAMH || ""}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-blue-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Department Head Profile
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing 
                  ? `Editing profile for ${head.firstNameENG} ${head.fatherNameENG}`
                  : `Viewing profile details for ${head.firstNameENG} ${head.fatherNameENG}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {head.department?.name || "Not assigned"}
              </span>
              <Badge variant="outline" className="ml-2 text-xs">
                ID: {head.department?.id || "N/A"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${head.active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"} px-3 py-1`}>
                {head.active ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Inactive
                  </span>
                )}
              </Badge>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                    {photoLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : photoPreview ? (
                      <AvatarImage
                        src={photoPreview}
                        alt={fullNameEnglish}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {isEditing && (
                    <div className="mt-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        onClick={triggerPhotoUpload}
                        variant="outline"
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {photoFile ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {photoFile && (
                        <p className="text-xs text-gray-500 mt-2 truncate">
                          Selected: {photoFile.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {head.firstNameENG} {head.fatherNameENG}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {head.firstNameAMH} {head.fatherNameAMH}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    @{head.username}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    {isEditing ? (
                      <Input
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{head.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    {isEditing ? (
                      <Input
                        name="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{head.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(head.hiredDateGC)}
                    </p>
                    <p className="text-xs text-gray-500">EC: {head.hiredDateEC}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Section */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                Supporting documents and files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
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
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
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
              ) : (
                <div className="space-y-4">
                  {head.hasDocument ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-gray-700 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Supporting Document</p>
                              <p className="text-sm text-gray-500">Available for download</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            PDF
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={viewDocument}
                          variant="outline"
                          className="flex-1"
                          disabled={documentLoading}
                        >
                          {documentLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          View Document
                        </Button>
                        <Button
                          onClick={downloadDocument}
                          variant="default"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={documentLoading}
                        >
                          {documentLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">No document uploaded</p>
                      <p className="text-xs text-gray-500 mt-1">Upload a document when editing</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-gray-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Complete personal details and identification information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "First Name (English)", name: "firstNameENG", value: head.firstNameENG },
                  { label: "First Name (አማርኛ)", name: "firstNameAMH", value: head.firstNameAMH },
                  { label: "Father's Name (English)", name: "fatherNameENG", value: head.fatherNameENG },
                  { label: "Father's Name (አማርኛ)", name: "fatherNameAMH", value: head.fatherNameAMH },
                  { label: "Grandfather's Name (English)", name: "grandfatherNameENG", value: head.grandfatherNameENG || "Not specified" },
                  { label: "Grandfather's Name (አማርኛ)", name: "grandfatherNameAMH", value: head.grandfatherNameAMH || "Not specified" },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <Input
                        name={field.name}
                        value={editForm[field.name as keyof typeof editForm] || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-white">{field.value}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remarks
                </label>
                {isEditing ? (
                  <Textarea
                    name="remark"
                    value={editForm.remark}
                    onChange={handleInputChange}
                    placeholder="Add any remarks or notes..."
                    rows={4}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className={head.remark ? "text-gray-900 dark:text-white" : "text-gray-500 italic"}>
                      {head.remark || "No remarks provided"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Residence Information */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-gray-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                Residence Address
              </CardTitle>
              <CardDescription>
                Current residential location details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Region",
                    value: head.residenceRegion?.name || "Not specified",
                    editingValue: editForm.residenceRegionCode,
                    onChange: handleRegionChange,
                    options: regions.map(r => ({ value: r.regionCode, label: r.region })),
                    disabled: false
                  },
                  {
                    label: "Zone",
                    value: head.residenceZone?.name || "Not specified",
                    editingValue: editForm.residenceZoneCode,
                    onChange: handleZoneChange,
                    options: zones.map(z => ({ value: z.zoneCode, label: z.zone })),
                    disabled: !editForm.residenceRegionCode
                  },
                  {
                    label: "Woreda",
                    value: head.residenceWoreda?.name || "Not specified",
                    editingValue: editForm.residenceWoredaCode,
                    onChange: handleWoredaChange,
                    options: woredas.map(w => ({ value: w.woredaCode, label: w.woreda })),
                    disabled: !editForm.residenceZoneCode
                  },
                ].map((field) => (
                  <div key={field.label} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <Select
                        value={field.editingValue}
                        onValueChange={field.onChange}
                        disabled={field.disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-white">{field.value}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Address</p>
                      <p className="text-gray-900 dark:text-white">
                        {[head.residenceWoreda?.name, head.residenceZone?.name, head.residenceRegion?.name]
                          .filter(Boolean)
                          .join(", ") || "Address not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {documentViewerVisible && documentBlob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document Viewer
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDocumentViewerVisible(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={URL.createObjectURL(documentBlob)}
                className="w-full h-full border-0 rounded-lg"
                title="Document Viewer"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDocumentViewerVisible(false)}
              >
                Close
              </Button>
              <Button
                onClick={downloadDocument}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}