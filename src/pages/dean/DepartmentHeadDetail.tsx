"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building,
  FileText,
  Shield,
  Award,
  AlertCircle,
  Edit,
  CheckCircle,
  XCircle,
  Home,
  IdCard,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface DepartmentHeadDetailModel {
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
    modality: string;
    level: string;
  };
  residenceRegion: { id: string; name: string };
  residenceZone: { id: string; name: string };
  residenceWoreda: { id: string; name: string };
  remark: string;
  isActive: boolean;
  hasPhoto: boolean;
  hasDocument: boolean;
  photoBase64?: string;
  documentBase64?: string;
}

interface Department {
  id: number;
  name: string;
  modality: string;
  level: string;
}

interface Region {
  regionCode: string;
  region: string;
  countryCode: string;
}

interface Zone {
  zoneCode: string;
  zone: string;
  regionCode: string;
  regionType: string;
}

interface Woreda {
  woredaCode: string;
  woreda: string;
  zoneCode: string;
}

export default function DepartmentHeadDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const headId = params.id as string;
  
  const [head, setHead] = useState<DepartmentHeadDetailModel | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
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
    residenceRegionId: "",
    residenceZoneId: "",
    residenceWoredaId: "",
    remark: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDepartmentHeadDetail();
  }, [headId]);

  const fetchDepartmentHeadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<DepartmentHeadDetailModel>(
        `${endPoints.departmentHeads}/${headId}`
      );
      const data = response.data;
      setHead(data);
      
      // Initialize edit form with current data
      setEditForm({
        firstNameENG: data.firstNameENG || "",
        firstNameAMH: data.firstNameAMH || "",
        fatherNameENG: data.fatherNameENG || "",
        fatherNameAMH: data.fatherNameAMH || "",
        grandfatherNameENG: data.grandfatherNameENG || "",
        grandfatherNameAMH: data.grandfatherNameAMH || "",
        gender: data.gender || "MALE",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        hiredDateGC: data.hiredDateGC || "",
        hiredDateEC: data.hiredDateEC || "",
        departmentId: data.department?.id?.toString() || "",
        residenceRegionId: data.residenceRegion?.id || "",
        residenceZoneId: data.residenceZone?.id || "",
        residenceWoredaId: data.residenceWoreda?.id || "",
        remark: data.remark || "",
        isActive: data.isActive ?? true,
      });

      // Load dropdown data
      await fetchDropdownData(data);
    } catch (err: any) {
      console.error("Failed to load department head details:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load department head details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async (headData: DepartmentHeadDetailModel) => {
    try {
      // Fetch departments and regions
      const [deptResponse, regionResponse] = await Promise.allSettled([
        apiClient.get<Department[]>(endPoints.departments),
        apiClient.get<Region[]>(endPoints.regions),
      ]);

      // Handle departments response with validation
      if (deptResponse.status === 'fulfilled') {
        const deptData = deptResponse.value.data || [];
        // Filter out invalid departments and ensure id exists
        const validDepartments = deptData.filter(dept => 
          dept && 
          typeof dept.id === 'number' && 
          dept.name && 
          dept.modality && 
          dept.level
        );
        setDepartments(validDepartments);
      } else {
        console.error("Failed to load departments:", deptResponse.reason);
        setDepartments([]);
      }

      // Handle regions response with validation
      if (regionResponse.status === 'fulfilled') {
        const regionData = regionResponse.value.data || [];
        // Filter out invalid regions
        const validRegions = regionData.filter(region => 
          region && 
          region.regionCode && 
          region.region
        );
        setRegions(validRegions);
      } else {
        console.error("Failed to load regions:", regionResponse.reason);
        setRegions([]);
      }

      // Load zones for current region if it exists
      if (headData.residenceRegion?.id) {
        try {
          const zonesResponse = await apiClient.get<Zone[]>(
            `${endPoints.zonesByRegion}/${headData.residenceRegion.id}`
          );
          const zonesData = zonesResponse.data || [];
          const validZones = zonesData.filter(zone => 
            zone && 
            zone.zoneCode && 
            zone.zone
          );
          setZones(validZones);
        } catch (err) {
          console.error("Failed to load zones:", err);
          setZones([]);
        }

        // Load woredas for current zone if it exists
        if (headData.residenceZone?.id) {
          try {
            const woredasResponse = await apiClient.get<Woreda[]>(
              `${endPoints.woredasByZone}/${headData.residenceZone.id}`
            );
            const woredasData = woredasResponse.data || [];
            const validWoredas = woredasData.filter(woreda => 
              woreda && 
              woreda.woredaCode && 
              woreda.woreda
            );
            setWoredas(validWoredas);
          } catch (err) {
            console.error("Failed to load woredas:", err);
            setWoredas([]);
          }
        }
      }
    } catch (err) {
      console.error("Error in fetchDropdownData:", err);
      setDepartments([]);
      setRegions([]);
      setZones([]);
      setWoredas([]);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
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
        gender: head.gender || "MALE",
        phoneNumber: head.phoneNumber || "",
        email: head.email || "",
        hiredDateGC: head.hiredDateGC || "",
        hiredDateEC: head.hiredDateEC || "",
        departmentId: head.department?.id?.toString() || "",
        residenceRegionId: head.residenceRegion?.id || "",
        residenceZoneId: head.residenceZone?.id || "",
        residenceWoredaId: head.residenceWoreda?.id || "",
        remark: head.remark || "",
        isActive: head.isActive ?? true,
      });
    }
    setIsEditing(false);
  };

  const handleRegionChange = async (regionId: string) => {
    setEditForm(prev => ({
      ...prev,
      residenceRegionId: regionId,
      residenceZoneId: "",
      residenceWoredaId: "",
    }));
    
    try {
      const response = await apiClient.get<Zone[]>(
        `${endPoints.zonesByRegion}/${regionId}`
      );
      const zonesData = response.data || [];
      const validZones = zonesData.filter(zone => 
        zone && 
        zone.zoneCode && 
        zone.zone
      );
      setZones(validZones);
      setWoredas([]);
    } catch (err) {
      console.error("Failed to load zones:", err);
      toast.error("Failed to load zones");
      setZones([]);
    }
  };

  const handleZoneChange = async (zoneId: string) => {
    setEditForm(prev => ({
      ...prev,
      residenceZoneId: zoneId,
      residenceWoredaId: "",
    }));
    
    try {
      const response = await apiClient.get<Woreda[]>(
        `${endPoints.woredasByZone}/${zoneId}`
      );
      const woredasData = response.data || [];
      const validWoredas = woredasData.filter(woreda => 
        woreda && 
        woreda.woredaCode && 
        woreda.woreda
      );
      setWoredas(validWoredas);
    } catch (err) {
      console.error("Failed to load woredas:", err);
      toast.error("Failed to load woredas");
      setWoredas([]);
    }
  };

  const handleSave = async () => {
    if (!head) return;

    try {
      setSaving(true);
      
      const updatePayload = {
        firstNameENG: editForm.firstNameENG.trim(),
        firstNameAMH: editForm.firstNameAMH.trim(),
        fatherNameENG: editForm.fatherNameENG.trim(),
        fatherNameAMH: editForm.fatherNameAMH.trim(),
        grandfatherNameENG: editForm.grandfatherNameENG.trim(),
        grandfatherNameAMH: editForm.grandfatherNameAMH.trim(),
        gender: editForm.gender,
        phoneNumber: editForm.phoneNumber.trim(),
        email: editForm.email.trim(),
        hiredDateGC: editForm.hiredDateGC,
        hiredDateEC: editForm.hiredDateEC.trim(),
        departmentId: editForm.departmentId ? parseInt(editForm.departmentId) : 0,
        residenceRegionId: editForm.residenceRegionId,
        residenceZoneId: editForm.residenceZoneId,
        residenceWoredaId: editForm.residenceWoredaId,
        remark: editForm.remark.trim(),
        isActive: editForm.isActive,
      };

      await apiClient.put(
        `${endPoints.departmentHeads}/${headId}`,
        updatePayload
      );

      await fetchDepartmentHeadDetail();
      setIsEditing(false);
      toast.success("Department head updated successfully!");
    } catch (err: any) {
      console.error("Failed to update department head:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to update department head";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  const getInitials = (firstName: string, fatherName: string) => {
    return `${firstName?.[0] || ''}${fatherName?.[0] || ''}`.toUpperCase();
  };

  const downloadDocument = () => {
    if (!head?.documentBase64) return;

    try {
      const link = document.createElement("a");
      link.href = head.documentBase64;
      link.download = `department-head-${head.username}-document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.error("Failed to download document");
    }
  };

  // Safe department mapping function - FIXED: Don't use empty string value
  const renderDepartmentOptions = () => {
    const safeDepartments = departments || [];
    
    if (safeDepartments.length === 0) {
      return (
        <SelectItem value="no-departments" disabled>
          No departments available
        </SelectItem>
      );
    }

    return safeDepartments
      .filter(dept => dept && typeof dept.id === 'number' && dept.id > 0 && dept.name)
      .map(dept => (
        <SelectItem 
          key={dept.id} 
          value={dept.id.toString()}
        >
          {dept.name}
        </SelectItem>
      ));
  };

  // Safe region mapping function - FIXED: Don't use empty string value
  const renderRegionOptions = () => {
    const safeRegions = regions || [];
    
    if (safeRegions.length === 0) {
      return (
        <SelectItem value="no-regions" disabled>
          No regions available
        </SelectItem>
      );
    }

    return safeRegions
      .filter(region => region && region.regionCode && region.regionCode.trim() !== "" && region.region)
      .map(region => (
        <SelectItem 
          key={region.regionCode} 
          value={region.regionCode}
        >
          {region.region}
        </SelectItem>
      ));
  };

  // Safe zone mapping function - FIXED: Don't use empty string value
  const renderZoneOptions = () => {
    const safeZones = zones || [];
    
    if (safeZones.length === 0) {
      return (
        <SelectItem value="no-zones" disabled>
          No zones available
        </SelectItem>
      );
    }

    return safeZones
      .filter(zone => zone && zone.zoneCode && zone.zoneCode.trim() !== "" && zone.zone)
      .map(zone => (
        <SelectItem 
          key={zone.zoneCode} 
          value={zone.zoneCode}
        >
          {zone.zone}
        </SelectItem>
      ));
  };

  // Safe woreda mapping function - FIXED: Don't use empty string value
  const renderWoredaOptions = () => {
    const safeWoredas = woredas || [];
    
    if (safeWoredas.length === 0) {
      return (
        <SelectItem value="no-woredas" disabled>
          No woredas available
        </SelectItem>
      );
    }

    return safeWoredas
      .filter(woreda => woreda && woreda.woredaCode && woreda.woredaCode.trim() !== "" && woreda.woreda)
      .map(woreda => (
        <SelectItem 
          key={woreda.woredaCode} 
          value={woreda.woredaCode}
        >
          {woreda.woreda}
        </SelectItem>
      ));
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
          <Button variant="default" onClick={fetchDepartmentHeadDetail}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(head.isActive)}`}>
            {head.isActive ? "Active" : "Inactive"}
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
              onClick={handleEditClick}
              className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto">
              <Avatar className="w-28 h-28 border-4 border-blue-100 dark:border-blue-900 mx-auto">
                {head.photoBase64 ? (
                  <AvatarImage
                    src={`data:image/jpeg;base64,${head.photoBase64}`}
                    alt={fullNameEnglish}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-xl bg-blue-600 text-white font-semibold">
                    {getInitials(head.firstNameENG, head.fatherNameENG)}
                  </AvatarFallback>
                )}
              </Avatar>
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
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
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
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
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

            <Separator />

            <div className="space-y-2">
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={editForm.isActive ? "true" : "false"}
                  onValueChange={(value) => 
                    setEditForm(prev => ({ ...prev, isActive: value === "true" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className={`px-3 py-1.5 rounded-md ${getStatusColor(head.isActive)} w-fit`}>
                  {head.isActive ? "Active" : "Inactive"}
                </div>
              )}
            </div>

            {head.hasDocument && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={downloadDocument}
                  className="w-full"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            )}
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
                      value={editForm.firstNameENG}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstNameENG: e.target.value }))}
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
                      value={editForm.firstNameAMH}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstNameAMH: e.target.value }))}
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
                      value={editForm.fatherNameENG}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherNameENG: e.target.value }))}
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
                      value={editForm.fatherNameAMH}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherNameAMH: e.target.value }))}
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
                      value={editForm.grandfatherNameENG}
                      onChange={(e) => setEditForm(prev => ({ ...prev, grandfatherNameENG: e.target.value }))}
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
                      value={editForm.grandfatherNameAMH}
                      onChange={(e) => setEditForm(prev => ({ ...prev, grandfatherNameAMH: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.grandfatherNameAMH || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.gender}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.gender}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Appointment Date (GC)</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editForm.hiredDateGC)}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hiredDateGC: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {formatDate(head.hiredDateGC)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Appointment Date (EC)</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.hiredDateEC}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hiredDateEC: e.target.value }))}
                      placeholder="YYYY-MM-DD"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.hiredDateEC}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label>Remarks</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.remark}
                    onChange={(e) => setEditForm(prev => ({ ...prev, remark: e.target.value }))}
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

          {/* Department & Residence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Department
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.departmentId}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, departmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderDepartmentOptions()}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                        {head.department?.name || "Not assigned"}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {head.department?.level || "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {head.department?.modality || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Residence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.residenceRegionId}
                      onValueChange={handleRegionChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderRegionOptions()}
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
                      value={editForm.residenceZoneId}
                      onValueChange={handleZoneChange}
                      disabled={!editForm.residenceRegionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderZoneOptions()}
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
                      value={editForm.residenceWoredaId}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, residenceWoredaId: value }))}
                      disabled={!editForm.residenceZoneId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select woreda" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderWoredaOptions()}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      {head.residenceWoreda?.name || "Not specified"}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="pt-4 border-t">
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

// Helper components
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block ${className || ''}`}>
    {children}
  </label>
);