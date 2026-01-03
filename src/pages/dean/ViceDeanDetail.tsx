"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  AlertCircle,
  Upload,
  Mail,
  Phone,
  Calendar,
  MapPin,
  RefreshCw,
  Briefcase,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Download,
  Loader2,
  Camera,
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

type ViceDeanDetail = {
  id: number;
  username: string;
  firstNameAMH: string;
  firstNameENG: string;
  fatherNameAMH: string;
  fatherNameENG: string;
  grandfatherNameAMH: string;
  grandfatherNameENG: string;
  gender: "MALE" | "FEMALE";
  email: string;
  phoneNumber: string;
  residenceRegion: string;
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
  hiredDateGC: string;
  title: string;
  remarks: string;
  hasPhoto: boolean;
  hasDocument: boolean;
  role: "VICE_DEAN";
  active: boolean;
  photo?: string | null; // Added photo field
};

type UpdateRequest = {
  password?: string;
  firstNameAMH?: string;
  firstNameENG?: string;
  fatherNameAMH?: string;
  fatherNameENG?: string;
  grandfatherNameAMH?: string;
  grandfatherNameENG?: string;
  gender?: "MALE" | "FEMALE";
  email?: string;
  phoneNumber?: string;
  residenceWoredaCode?: string;
  residenceZoneCode?: string;
  residenceRegionCode?: string;
  hiredDateGC?: string;
  title?: string;
  remarks?: string;
};

export default function ViceDeanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [viceDean, setViceDean] = useState<ViceDeanDetail | null>(null);
  const [originalViceDean, setOriginalViceDean] = useState<ViceDeanDetail | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Changed from photoBase64 to photoPreview
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string>("vice_dean_document.pdf");
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  
  // Address cascading states
  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingWoredas, setLoadingWoredas] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Handle photo data from API response
  const processPhotoData = (photoData: string | null | undefined) => {
    if (!photoData) {
      setPhotoPreview(null);
      return null;
    }

    // Check if it's already a data URL
    if (photoData.startsWith('data:')) {
      setPhotoPreview(photoData);
      return photoData;
    }

    // Handle base64 string without data URL prefix
    if (photoData.length > 100) { // Likely a base64 string
      // Check if it looks like base64 (contains alphanumeric, +, /, =)
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      if (base64Regex.test(photoData.replace(/\n/g, ''))) {
        const photoUrl = `data:image/jpeg;base64,${photoData}`;
        setPhotoPreview(photoUrl);
        return photoUrl;
      }
    }

    // If it's a URL or other format
    setPhotoPreview(photoData);
    return photoData;
  };

  // Fetch photo if hasPhoto is true
  const fetchPhoto = useCallback(async () => {
    if (!id) {
      setPhotoPreview(null);
      return;
    }

    setLoadingPhoto(true);
    try {
      const response = await apiClient.get(`${endPoints.getViceDeanPhoto}/${id}`, {
        responseType: 'arraybuffer'
      });
      
      // Convert array buffer to base64
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const photoUrl = `data:image/jpeg;base64,${base64}`;
      setPhotoPreview(photoUrl);
    } catch (err: any) {
      console.error("Failed to load photo:", err);
      setPhotoPreview(null);
    } finally {
      setLoadingPhoto(false);
    }
  }, [id]);

  // Fetch document if hasDocument is true
  const fetchDocument = useCallback(async () => {
    if (!id || !viceDean?.hasDocument) {
      setDocumentBase64(null);
      return;
    }

    setLoadingDocument(true);
    try {
      const response = await apiClient.get(`${endPoints.getViceDeanDocument}/${id}`, {
        responseType: 'arraybuffer'
      });
      
      // Check content type from response headers
      const contentType = response.headers['content-type'] || 'application/pdf';
      const isPDF = contentType.includes('pdf');
      const isImage = contentType.includes('image');
      
      // Convert array buffer to base64
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      if (isPDF) {
        setDocumentBase64(`data:application/pdf;base64,${base64}`);
        setDocumentFileName(`vice_dean_${id}_document.pdf`);
      } else if (isImage) {
        setDocumentBase64(`data:${contentType};base64,${base64}`);
        setDocumentFileName(`vice_dean_${id}_document.jpg`);
      } else {
        setDocumentBase64(`data:application/octet-stream;base64,${base64}`);
        setDocumentFileName(`vice_dean_${id}_document`);
      }
    } catch (err: any) {
      console.error("Failed to load document:", err);
      setDocumentBase64(null);
    } finally {
      setLoadingDocument(false);
    }
  }, [id, viceDean?.hasDocument]);

  // Fetch vice dean details
  const fetchViceDean = useCallback(async () => {
    if (!id) {
      setError("No vice dean ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`${endPoints.getViceDeanById}/${id}`);
      
      // Process photo data if it exists in the response
      const processedData = {
        ...res.data,
        hasPhoto: res.data.hasPhoto || !!res.data.photo,
        photo: processPhotoData(res.data.photo)
      };
      
      setViceDean(processedData);
      setOriginalViceDean(structuredClone(processedData));
      console.log("Vice Dean data:", processedData);
      
      // If photo data wasn't in the response but hasPhoto is true, fetch separately
      if (!processedData.photo && processedData.hasPhoto) {
        await fetchPhoto();
      }
      
      // Fetch document if needed
      if (processedData.hasDocument) {
        await fetchDocument();
      }
    } catch (err: any) {
      console.error("Failed to fetch vice dean:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.removeItem("xy9a7b");
          navigate("/");
        }, 2000);
      } else if (err.response?.status === 404) {
        setError("Vice dean not found.");
      } else {
        setError(
          err.response?.data?.error || "Failed to load vice dean profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchPhoto, fetchDocument]);

  // Fetch regions
  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const res = await apiClient.get(endPoints.regions);
      console.log("Regions response:", res.data);
      setRegions(res.data || []);
    } catch (err) {
      console.error("Failed to load regions", err);
    } finally {
      setLoadingRegions(false);
    }
  };

  // Fetch zones by region
  const fetchZones = async (regionCode: string) => {
    if (!regionCode) {
      setZones([]);
      setWoredas([]);
      return;
    }
    
    setLoadingZones(true);
    try {
      const res = await apiClient.get(`${endPoints.zonesByRegion}/${regionCode}`);
      console.log("Zones response:", res.data);
      setZones(res.data || []);
    } catch (err) {
      console.error("Failed to load zones", err);
    } finally {
      setLoadingZones(false);
    }
  };

  // Fetch woredas by zone
  const fetchWoredas = async (zoneCode: string) => {
    if (!zoneCode) {
      setWoredas([]);
      return;
    }
    
    setLoadingWoredas(true);
    try {
      const res = await apiClient.get(`${endPoints.woredasByZone}/${zoneCode}`);
      console.log("Woredas response:", res.data);
      setWoredas(res.data || []);
    } catch (err) {
      console.error("Failed to load woredas", err);
    } finally {
      setLoadingWoredas(false);
    }
  };

  useEffect(() => {
    fetchViceDean();
  }, [fetchViceDean]);

  useEffect(() => {
    if (editMode && viceDean) {
      fetchRegions();
      
      // Load zones if region exists
      if (viceDean.residenceRegionCode) {
        fetchZones(viceDean.residenceRegionCode);
      }
      
      // Load woredas if zone exists
      if (viceDean.residenceZoneCode) {
        fetchWoredas(viceDean.residenceZoneCode);
      }
    }
  }, [editMode, viceDean]);

  const handleRetry = () => {
    setError(null);
    fetchViceDean();
  };

  const getFullName = (data: ViceDeanDetail) => {
    return `${data.title ? data.title + " " : ""}${data.firstNameENG} ${data.fatherNameENG} ${data.grandfatherNameENG}`;
  };

  const getFullNameAmharic = (data: ViceDeanDetail) => {
    return `${data.firstNameAMH} ${data.fatherNameAMH} ${data.grandfatherNameAMH}`;
  };

  const hasChanges = () => {
    if (!viceDean || !originalViceDean) return false;
    
    const changed = 
      viceDean.firstNameAMH !== originalViceDean.firstNameAMH ||
      viceDean.firstNameENG !== originalViceDean.firstNameENG ||
      viceDean.fatherNameAMH !== originalViceDean.fatherNameAMH ||
      viceDean.fatherNameENG !== originalViceDean.fatherNameENG ||
      viceDean.grandfatherNameAMH !== originalViceDean.grandfatherNameAMH ||
      viceDean.grandfatherNameENG !== originalViceDean.grandfatherNameENG ||
      viceDean.gender !== originalViceDean.gender ||
      viceDean.email !== originalViceDean.email ||
      viceDean.phoneNumber !== originalViceDean.phoneNumber ||
      viceDean.residenceRegionCode !== originalViceDean.residenceRegionCode ||
      viceDean.residenceZoneCode !== originalViceDean.residenceZoneCode ||
      viceDean.residenceWoredaCode !== originalViceDean.residenceWoredaCode ||
      viceDean.hiredDateGC !== originalViceDean.hiredDateGC ||
      viceDean.title !== originalViceDean.title ||
      viceDean.remarks !== originalViceDean.remarks ||
      newPassword.trim() !== "" ||
      selectedPhoto !== null ||
      selectedDocument !== null;
    
    return changed;
  };

  const handleSave = async () => {
    if (!viceDean || !originalViceDean || !id) {
      setEditMode(false);
      return;
    }

    if (!hasChanges()) {
      setEditMode(false);
      setSuccess("No changes detected.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      const payload: UpdateRequest = {};

      // Build payload with only changed fields
      if (viceDean.firstNameAMH !== originalViceDean.firstNameAMH) {
        payload.firstNameAMH = viceDean.firstNameAMH;
      }
      if (viceDean.firstNameENG !== originalViceDean.firstNameENG) {
        payload.firstNameENG = viceDean.firstNameENG;
      }
      if (viceDean.fatherNameAMH !== originalViceDean.fatherNameAMH) {
        payload.fatherNameAMH = viceDean.fatherNameAMH;
      }
      if (viceDean.fatherNameENG !== originalViceDean.fatherNameENG) {
        payload.fatherNameENG = viceDean.fatherNameENG;
      }
      if (viceDean.grandfatherNameAMH !== originalViceDean.grandfatherNameAMH) {
        payload.grandfatherNameAMH = viceDean.grandfatherNameAMH;
      }
      if (viceDean.grandfatherNameENG !== originalViceDean.grandfatherNameENG) {
        payload.grandfatherNameENG = viceDean.grandfatherNameENG;
      }
      if (viceDean.gender !== originalViceDean.gender) {
        payload.gender = viceDean.gender;
      }
      if (viceDean.email !== originalViceDean.email) {
        payload.email = viceDean.email;
      }
      if (viceDean.phoneNumber !== originalViceDean.phoneNumber) {
        payload.phoneNumber = viceDean.phoneNumber;
      }
      if (viceDean.residenceRegionCode !== originalViceDean.residenceRegionCode) {
        payload.residenceRegionCode = viceDean.residenceRegionCode;
      }
      if (viceDean.residenceZoneCode !== originalViceDean.residenceZoneCode) {
        payload.residenceZoneCode = viceDean.residenceZoneCode;
      }
      if (viceDean.residenceWoredaCode !== originalViceDean.residenceWoredaCode) {
        payload.residenceWoredaCode = viceDean.residenceWoredaCode;
      }
      if (viceDean.hiredDateGC !== originalViceDean.hiredDateGC) {
        payload.hiredDateGC = viceDean.hiredDateGC;
      }
      if (viceDean.title !== originalViceDean.title) {
        payload.title = viceDean.title;
      }
      if (viceDean.remarks !== originalViceDean.remarks) {
        payload.remarks = viceDean.remarks;
      }
      if (newPassword.trim() !== "") {
        payload.password = newPassword;
      }

      // Add JSON payload to form data
      if (Object.keys(payload).length > 0) {
        const jsonBlob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        formData.append("data", jsonBlob, "data.json");
      }

      // Add files if selected
      if (selectedPhoto) {
        formData.append("photograph", selectedPhoto);
      }

      if (selectedDocument) {
        formData.append("document", selectedDocument);
      }

      // Send update request using endpoint + /id
      const res = await apiClient.put(
        `${endPoints.updateViceDean}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      setSuccess("Vice dean updated successfully!");
      await fetchViceDean();
      setEditMode(false);
      setNewPassword("");
      setSelectedPhoto(null);
      setSelectedDocument(null);

      // Reset file inputs
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update vice dean profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalViceDean) {
      setViceDean(structuredClone(originalViceDean));
      // Reset photo preview to original
      setPhotoPreview(originalViceDean.photo || null);
    }
    setEditMode(false);
    setError(null);
    setSuccess(null);
    setNewPassword("");
    setSelectedPhoto(null);
    setSelectedDocument(null);
    
    // Reset cascading selects
    setZones([]);
    setWoredas([]);
    
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handleRegionChange = async (regionCode: string) => {
    if (!viceDean) return;
    
    const updated = { 
      ...viceDean, 
      residenceRegionCode: regionCode, 
      residenceZoneCode: "", 
      residenceWoredaCode: "" 
    };
    setViceDean(updated);
    setZones([]);
    setWoredas([]);
    
    if (regionCode) {
      await fetchZones(regionCode);
    }
  };

  const handleZoneChange = async (zoneCode: string) => {
    if (!viceDean) return;
    
    const updated = { 
      ...viceDean, 
      residenceZoneCode: zoneCode, 
      residenceWoredaCode: "" 
    };
    setViceDean(updated);
    setWoredas([]);
    
    if (zoneCode) {
      await fetchWoredas(zoneCode);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      setSelectedPhoto(file);
      // Create preview for the new photo
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Document file size must be less than 10MB");
        return;
      }
      
      setSelectedDocument(file);
      setDocumentFileName(file.name);
    }
  };

  const handleDownloadDocument = () => {
    if (!documentBase64) return;
    
    try {
      const link = document.createElement("a");
      link.href = documentBase64;
      link.download = documentFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download document:", error);
      setError("Failed to download document. Please try again.");
    }
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

  const getInitials = (data: ViceDeanDetail) => {
    const firstName = data.firstNameENG || "";
    const fatherName = data.fatherNameENG || "";
    const firstLetter = firstName.charAt(0) || "";
    const secondLetter = fatherName.charAt(0) || "";
    return (firstLetter + secondLetter).toUpperCase();
  };

  if (loading) return <LoadingSkeleton />;

  if (error && !viceDean) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Failed to Load Profile
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="outline" onClick={() => navigate("/dean/vice-deans")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!viceDean) return null;

  const initials = getInitials(viceDean);
  const currentPhoto = photoPreview || viceDean.photo;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dean/vice-deans")}
              className="mb-2 sm:mb-0 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vice Deans
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Vice Dean Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              ID: <span className="font-mono font-medium text-gray-900 dark:text-white">{viceDean.id}</span>
              <span className="mx-2">•</span>
              Username: <span className="font-medium text-gray-900 dark:text-white">{viceDean.username}</span>
              <span className="mx-2">•</span>
              Status: <Badge variant={viceDean.active ? "default" : "secondary"} className="ml-2">
                {viceDean.active ? "Active" : "Inactive"}
              </Badge>
            </p>
          </div>

          {!editMode ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setEditMode(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {success && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          accept="image/*"
          ref={photoInputRef}
          className="hidden"
          onChange={handlePhotoChange}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          ref={documentInputRef}
          className="hidden"
          onChange={handleDocumentChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photo & Basic Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Photo Card */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <Avatar className="h-48 w-48 border-4 border-gray-200 dark:border-gray-700">
                      {loadingPhoto ? (
                        <div className="h-full w-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : currentPhoto ? (
                        <AvatarImage
                          src={currentPhoto}
                          alt={getFullName(viceDean)}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-4xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {editMode && (
                      <div className="absolute bottom-0 right-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full shadow-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                          onClick={() => photoInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                    {getFullName(viceDean)}
                  </h2>
                  <p className="text-lg font-geez text-gray-600 dark:text-gray-400 text-center mt-2">
                    {getFullNameAmharic(viceDean)}
                  </p>
                  
                  <Badge variant="secondary" className="mt-4 text-lg py-1 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {viceDean.title}
                  </Badge>
                </div>
                
                <Separator className="my-6" />
                
                {/* Status & Document */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Photo</span>
                    <div className="flex items-center gap-2">
                      {loadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : viceDean.hasPhoto || currentPhoto ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Document</span>
                    <div className="flex items-center gap-2">
                      {loadingDocument ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : viceDean.hasDocument ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {viceDean.hasDocument && documentBase64 && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 dark:border-gray-600"
                        onClick={handleDownloadDocument}
                        disabled={loadingDocument}
                      >
                        {loadingDocument ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Document
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Preview Section (Edit Mode) */}
            {(selectedPhoto || selectedDocument) && editMode && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Selected Files
                  </h3>
                  <div className="space-y-3">
                    {selectedPhoto && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Profile Photo</p>
                            <p className="text-sm text-gray-600">{selectedPhoto.name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPhoto(null);
                            // Reset to original photo
                            setPhotoPreview(viceDean.photo || null);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    {selectedDocument && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Supporting Document</p>
                            <p className="text-sm text-gray-600">{selectedDocument.name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Change Card (Edit Mode) */}
            {editMode && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Change Password (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Leave empty to keep current password"
                          className="pr-10 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Must be at least 4 characters long
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Upload Card (Edit Mode) */}
            {editMode && !selectedDocument && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Document
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document" className="text-gray-700 dark:text-gray-300">Upload Document (Optional)</Label>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 dark:border-gray-600"
                        onClick={() => documentInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Supports PDF, Word, and image files (max 10MB)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Names */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-600 dark:text-gray-400">English Names</h4>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">First Name</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.firstNameENG}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, firstNameENG: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{viceDean.firstNameENG}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Father's Name</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.fatherNameENG}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, fatherNameENG: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{viceDean.fatherNameENG}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Grandfather's Name</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.grandfatherNameENG}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, grandfatherNameENG: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{viceDean.grandfatherNameENG}</p>
                      )}
                    </div>
                  </div>

                  {/* Amharic Names */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-600 dark:text-gray-400">Amharic Names (ግዕዝ)</h4>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">መጀመሪያ ስም</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.firstNameAMH}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, firstNameAMH: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white font-geez">{viceDean.firstNameAMH}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">የአባት ስም</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.fatherNameAMH}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, fatherNameAMH: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white font-geez">{viceDean.fatherNameAMH}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">የአያት ስም</Label>
                      {editMode ? (
                        <Input
                          value={viceDean.grandfatherNameAMH}
                          onChange={(e) => setViceDean(prev => prev ? { ...prev, grandfatherNameAMH: e.target.value } : null)}
                          className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-geez"
                        />
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white font-geez">{viceDean.grandfatherNameAMH}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Gender</Label>
                    {editMode ? (
                      <Select
                        value={viceDean.gender}
                        onValueChange={(value: "MALE" | "FEMALE") => 
                          setViceDean(prev => prev ? { ...prev, gender: value } : null)
                        }
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{viceDean.gender.toLowerCase()}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Hire Date</Label>
                    {editMode ? (
                      <Input
                        type="date"
                        value={viceDean.hiredDateGC}
                        onChange={(e) => setViceDean(prev => prev ? { ...prev, hiredDateGC: e.target.value } : null)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        {formatDate(viceDean.hiredDateGC)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                    {editMode ? (
                      <Input
                        type="email"
                        value={viceDean.email}
                        onChange={(e) => setViceDean(prev => prev ? { ...prev, email: e.target.value } : null)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Mail className="h-4 w-4 text-blue-600" />
                        {viceDean.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                    {editMode ? (
                      <Input
                        value={viceDean.phoneNumber}
                        onChange={(e) => setViceDean(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Phone className="h-4 w-4 text-blue-600" />
                        {viceDean.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address Information
                </h3>
                
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Region</Label>
                      <Select
                        value={viceDean.residenceRegionCode}
                        onValueChange={handleRegionChange}
                        disabled={loadingRegions}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={loadingRegions ? "Loading..." : "Select Region"} />
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

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Zone</Label>
                      <Select
                        value={viceDean.residenceZoneCode}
                        onValueChange={handleZoneChange}
                        disabled={loadingZones || !viceDean.residenceRegionCode}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={
                            !viceDean.residenceRegionCode 
                              ? "Select region first" 
                              : loadingZones 
                              ? "Loading..." 
                              : "Select Zone"
                          } />
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

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Woreda</Label>
                      <Select
                        value={viceDean.residenceWoredaCode}
                        onValueChange={(value) => 
                          setViceDean(prev => prev ? { ...prev, residenceWoredaCode: value } : null)
                        }
                        disabled={loadingWoredas || !viceDean.residenceZoneCode}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={
                            !viceDean.residenceZoneCode 
                              ? "Select zone first" 
                              : loadingWoredas 
                              ? "Loading..." 
                              : "Select Woreda"
                          } />
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-gray-900 dark:text-white">
                        {viceDean.residenceWoreda || "—"}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-6">
                      {viceDean.residenceZone || "—"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 ml-6">
                      {viceDean.residenceRegion || "—"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Professional Information
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Academic Title</Label>
                    {editMode ? (
                      <Input
                        value={viceDean.title}
                        onChange={(e) => setViceDean(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="e.g., Dr., Prof., etc."
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{viceDean.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Remarks / Notes</Label>
                    {editMode ? (
                      <Textarea
                        value={viceDean.remarks || ""}
                        onChange={(e) => setViceDean(prev => prev ? { ...prev, remarks: e.target.value } : null)}
                        placeholder="Additional notes about this vice dean..."
                        rows={3}
                        className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                        {viceDean.remarks || "No remarks"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64 bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-48 w-48 rounded-full mb-6 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-8 w-48 mb-2 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-6 w-32 mb-4 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-48 mb-6 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}