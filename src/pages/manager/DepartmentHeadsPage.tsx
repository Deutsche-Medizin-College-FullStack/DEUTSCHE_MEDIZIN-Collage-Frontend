"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// Interfaces
interface DeptHeadListItem {
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
}

interface DeptHeadDetail extends DeptHeadListItem {
  // Assuming detail response has same structure as list (no extra fields mentioned)
  // If there are more fields, add them here
}

export default function DepartmentHeadsPage() {
  const [heads, setHeads] = useState<DeptHeadListItem[]>([]);
  const [selectedHead, setSelectedHead] = useState<DeptHeadDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);

  // Fetch all department heads
  const fetchDepartmentHeads = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const response = await apiClient.get<DeptHeadListItem[]>(
        endPoints.departmentHeads
      );
      setHeads(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load department heads");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDepartmentHeads();
  }, []);

  // Fetch single department head details + photo
  const fetchHeadDetails = async (head: DeptHeadListItem) => {
    setLoadingDetail(true);
    setSelectedHead(null);
    setModalOpen(true);

    // Immediately show placeholder photo if available from list
    setModalPhoto(head.hasPhoto ? null : null); // We'll fetch photo separately

    try {
      const detailResponse = await apiClient.get<DeptHeadDetail>(
        `${endPoints.departmentHeads}/${head.id}`
      );
      setSelectedHead(detailResponse.data);

      // Fetch photo separately if hasPhoto is true
      if (head.hasPhoto) {
        try {
          const photoResponse = await apiClient.get(
            `${endPoints.getDepartmentHeadPhoto}/${head.id}`,
            { responseType: "arraybuffer" } // Important for binary data
          );

          // Convert arraybuffer to base64
          const base64 = btoa(
            new Uint8Array(photoResponse.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          setModalPhoto(`data:image/jpeg;base64,${base64}`);
        } catch (photoErr) {
          console.error("Failed to load photo:", photoErr);
          // Continue without photo
        }
      }
    } catch (err: any) {
      console.error("Error fetching department head details:", err);
      setError(
        err.response?.data?.error || "Failed to load department head details"
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  // Search filter
  const filteredHeads = heads.filter((head) => {
    const fullNameENG =
      `${head.firstNameENG} ${head.fatherNameENG} ${head.grandfatherNameENG}`.toLowerCase();
    const fullNameAMH =
      `${head.firstNameAMH} ${head.fatherNameAMH} ${head.grandfatherNameAMH}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return (
      fullNameENG.includes(search) ||
      fullNameAMH.includes(search) ||
      head.email.toLowerCase().includes(search) ||
      head.phoneNumber.includes(search) ||
      head.department.name.toLowerCase().includes(search)
    );
  });

  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Loading department heads...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <p className="text-xl font-medium text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
        <Button
          onClick={fetchDepartmentHeads}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-gray-100">
          Department Heads
        </h1>
        <div className="w-full sm:w-80">
          <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
            Search Department Heads
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, email, phone, department..."
            className="mt-1 border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500"
          />
        </div>
      </div>

      {filteredHeads.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No department heads found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHeads.map((head) => {
            const fullNameENG = `${head.firstNameENG} ${head.fatherNameENG}`;
            const initials = `${head.firstNameENG[0] || ""}${
              head.fatherNameENG[0] || ""
            }`.toUpperCase();

            return (
              <Card
                key={head.id}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                onClick={() => fetchHeadDetails(head)}
              >
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-blue-100 dark:border-blue-900">
                    {modalPhoto && head.id === selectedHead?.id ? (
                      <AvatarImage src={modalPhoto} alt={fullNameENG} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="mt-4 text-xl text-blue-600 dark:text-gray-100">
                    {fullNameENG}
                  </CardTitle>
                  <CardDescription className="text-base mt-1 text-gray-600 dark:text-gray-400">
                    {head.firstNameAMH} {head.fatherNameAMH}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {head.department.name}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{head.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{head.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>{head.department.name}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal for department head details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-600 dark:text-gray-100">
              Department Head Details
            </DialogTitle>
            <DialogDescription>
              Full information for the selected department head
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Loading department head details...
              </p>
            </div>
          ) : selectedHead ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-40 h-40 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                  {modalPhoto ? (
                    <AvatarImage
                      src={modalPhoto}
                      alt={`${selectedHead.firstNameENG} ${selectedHead.fatherNameENG}`}
                      onError={(e) => {
                        console.error(
                          "Head photo failed to load:",
                          modalPhoto.substring(0, 50)
                        );
                        e.currentTarget.src = "";
                      }}
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-blue-600 text-white">
                      {selectedHead.firstNameENG[0]}
                      {selectedHead.fatherNameENG[0]}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-100">
                    {selectedHead.firstNameENG} {selectedHead.fatherNameENG}{" "}
                    {selectedHead.grandfatherNameENG}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {selectedHead.firstNameAMH} {selectedHead.fatherNameAMH}{" "}
                    {selectedHead.grandfatherNameAMH}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Head of {selectedHead.department.name}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="mt-1">{selectedHead.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Number</Label>
                    <p className="mt-1">{selectedHead.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Hired Date (GC/EC)</Label>
                    <p className="mt-1">
                      {selectedHead.hiredDateGC} / {selectedHead.hiredDateEC}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Department</Label>
                    <p className="mt-1">
                      {selectedHead.department.name} (
                      {selectedHead.department.modality},{" "}
                      {selectedHead.department.level})
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Current Residence</Label>
                    <p className="mt-1">
                      {selectedHead.residenceWoreda.name},{" "}
                      {selectedHead.residenceZone.name},{" "}
                      {selectedHead.residenceRegion.name}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Remark</Label>
                    <p className="mt-1">
                      {selectedHead.remark || "No remarks"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
