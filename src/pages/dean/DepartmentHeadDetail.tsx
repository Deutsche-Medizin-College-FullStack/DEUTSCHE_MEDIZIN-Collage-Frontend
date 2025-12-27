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
  User,
  Building,
  Calendar,
  Home,
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
      
      // FIX: Use the correct payload structure from working code
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
      
      // FIX: Use the correct field name 'data' as in working code
      formData.append('data', jsonBlob);

      // FIX: Use 'photograph' instead of 'photo' as in working code
      if (photoFile) {
        formData.append('photograph', photoFile);
      }

      // FIX: Use 'document' instead of 'documents' as in working code
      if (documentFile) {
        formData.append('document', documentFile);
      }

      // FIX: Use the same endpoint as working code
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading department head details...</p>
        </div>
      </div>
    );
  }

  if (error || !head) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-600 text-center px-4">
          {error || "Department head not found"}
        </p>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="default" onClick={fetchHeadDetail}>
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
      {/* Header with Department Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Department Head" : "Department Head Details"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {isEditing 
                  ? `Update information for ${head.firstNameENG || ""} ${head.fatherNameENG || ""}`
                  : `Viewing profile for ${head.firstNameENG || ""} ${head.fatherNameENG || ""}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Department Info */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Department:
                </span>{" "}
                {head.department?.name || "Not assigned"}
              </div>
              <Badge variant="outline" className="text-xs">
                ID: {head.department?.id || "N/A"}
              </Badge>
            </div>
            
            {/* Status and Edit Buttons */}
            <div className="flex items-center gap-2">
              <Badge className={head.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {head.active ? "Active" : "Inactive"}
              </Badge>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-gray-300 dark:border-gray-600"
                    disabled={saving}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="min-w-24"
                    size="sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto">
              <Avatar className="w-28 h-28 border-4 border-blue-100 dark:border-blue-900 mx-auto">
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
                  <AvatarFallback className="text-xl bg-blue-600 text-white font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isEditing && (
                <div className="mt-3">
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
                    size="sm"
                    className="w-full"
                  >
                    {photoFile ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {photoFile && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Selected: {photoFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
            <CardTitle className="mt-4 text-lg font-bold">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.firstNameENG}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstNameENG: e.target.value }))}
                    className="text-center"
                    placeholder="First Name (English)"
                  />
                  <Input
                    value={editForm.fatherNameENG}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fatherNameENG: e.target.value }))}
                    className="text-center"
                    placeholder="Father Name (English)"
                  />
                </div>
              ) : (
                <div>
                  <div>{head.firstNameENG} {head.fatherNameENG}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {head.firstNameAMH} {head.fatherNameAMH}
                  </div>
                </div>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              @{head.username}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                {isEditing ? (
                  <Input
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="flex-1"
                  />
                ) : (
                  <span className="text-sm">{head.email || "No email"}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="flex-1"
                  />
                ) : (
                  <span className="text-sm">{head.phoneNumber || "No phone"}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm">
                  Appointed: {formatDate(head.hiredDateGC)}
                </span>
              </div>
            </div>

            {/* Document Upload/Download Section */}
            <div className="space-y-3">
              {isEditing && (
                <div>
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
                    size="sm"
                    className="w-full"
                  >
                    {documentFile ? "Change Document" : "Upload Document"}
                  </Button>
                  {documentFile && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Selected: {documentFile.name}
                    </p>
                  )}
                </div>
              )}
              
              {!isEditing && head.hasDocument && (
                <Button
                  variant="outline"
                  onClick={downloadDocument}
                  className="w-full"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name (English)</Label>
                  {isEditing ? (
                    <Input
                      name="firstNameENG"
                      value={editForm.firstNameENG}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.firstNameENG}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>First Name (አማርኛ)</Label>
                  {isEditing ? (
                    <Input
                      name="firstNameAMH"
                      value={editForm.firstNameAMH}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.firstNameAMH}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Father's Name (English)</Label>
                  {isEditing ? (
                    <Input
                      name="fatherNameENG"
                      value={editForm.fatherNameENG}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.fatherNameENG}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Father's Name (አማርኛ)</Label>
                  {isEditing ? (
                    <Input
                      name="fatherNameAMH"
                      value={editForm.fatherNameAMH}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.fatherNameAMH}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Grandfather's Name (English)</Label>
                  {isEditing ? (
                    <Input
                      name="grandfatherNameENG"
                      value={editForm.grandfatherNameENG}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.grandfatherNameENG || "Not specified"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Grandfather's Name (አማርኛ)</Label>
                  {isEditing ? (
                    <Input
                      name="grandfatherNameAMH"
                      value={editForm.grandfatherNameAMH}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.grandfatherNameAMH || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label>Remarks</Label>
                {isEditing ? (
                  <Textarea
                    name="remark"
                    value={editForm.remark}
                    onChange={handleInputChange}
                    placeholder="Add remarks..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                    {head.remark || "No remarks"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Residence Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Residence Address
              </CardTitle>
              <CardDescription>
                Current residential address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.residenceRegionCode}
                      onValueChange={handleRegionChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r.regionCode} value={r.regionCode}>
                            {r.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.residenceRegion?.name || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Zone</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.residenceZoneCode}
                      onValueChange={handleZoneChange}
                      disabled={!editForm.residenceRegionCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(z => (
                          <SelectItem key={z.zoneCode} value={z.zoneCode}>
                            {z.zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.residenceZone?.name || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Woreda</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.residenceWoredaCode}
                      onValueChange={handleWoredaChange}
                      disabled={!editForm.residenceZoneCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select woreda" />
                      </SelectTrigger>
                      <SelectContent>
                        {woredas.map(w => (
                          <SelectItem key={w.woredaCode} value={w.woredaCode}>
                            {w.woreda}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.residenceWoreda?.name || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[head.residenceWoreda?.name, head.residenceZone?.name, head.residenceRegion?.name]
                        .filter(Boolean)
                        .join(", ") || "Address not specified"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end pt-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-gray-300 dark:border-gray-600"
        >
          Back to List
        </Button>
      </div>
    </div>
  );
}

// Helper component
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block ${className || ''}`}>
    {children}
  </label>
);