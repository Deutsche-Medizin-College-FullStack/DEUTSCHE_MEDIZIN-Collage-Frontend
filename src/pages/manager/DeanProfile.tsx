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
import { Mail, Phone, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

// Interfaces (unchanged)
interface DeanListItem {
  id: number;
  username: string;
  firstNameAMH: string;
  firstNameENG: string;
  fatherNameAMH: string;
  fatherNameENG: string;
  grandfatherNameAMH: string;
  grandfatherNameENG: string;
  gender: string;
  email: string;
  phoneNumber: string;
  residenceRegion: string;
  hiredDateGC: string;
  title: string;
  remarks: string;
  hasDocument: boolean;
  photo: string | null;
  role: string;
}

interface DeanDetail extends DeanListItem {
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
  hasPhoto: boolean;
  active: boolean;
}

export default function DeansPage() {
  const [deans, setDeans] = useState<DeanListItem[]>([]);
  const [selectedDean, setSelectedDean] = useState<DeanDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);

  // Fetch all active deans
  const fetchDeans = async () => {
    try {
      setLoadingList(true);
      setError(null); // Clear any previous errors
      const response = await apiClient.get<DeanListItem[]>(
        endPoints.getActiveDeans
      );
      setDeans(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load deans");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDeans();
  }, []);

  // Fetch single dean details
  const fetchDeanDetails = async (dean: DeanListItem) => {
    setLoadingDetail(true);
    setSelectedDean(null);
    setModalPhoto(dean.photo);
    setModalOpen(true);

    try {
      const response = await apiClient.get<DeanDetail>(
        `${endPoints.getDeanById}/${dean.id}`
      );
      setSelectedDean(response.data);
      setModalPhoto(response.data.photo || dean.photo);
    } catch (err: any) {
      console.error("Error fetching dean details:", err);
      setError(err.response?.data?.error || "Failed to load dean details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Search filter
  const filteredDeans = deans.filter((dean) => {
    const fullNameENG =
      `${dean.firstNameENG} ${dean.fatherNameENG} ${dean.grandfatherNameENG}`.toLowerCase();
    const fullNameAMH =
      `${dean.firstNameAMH} ${dean.fatherNameAMH} ${dean.grandfatherNameAMH}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return (
      fullNameENG.includes(search) ||
      fullNameAMH.includes(search) ||
      dean.email.toLowerCase().includes(search) ||
      dean.phoneNumber.includes(search)
    );
  });

  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Loading deans...
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
          onClick={fetchDeans}
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
          Active Deans
        </h1>
        <div className="w-full sm:w-72">
          <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
            Search deans
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, email or phone..."
            className="mt-1 border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500"
          />
        </div>
      </div>

      {filteredDeans.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No deans found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeans.map((dean) => {
            const fullNameENG = `${dean.firstNameENG} ${dean.fatherNameENG}`;
            const initials = `${dean.firstNameENG[0] || ""}${
              dean.fatherNameENG[0] || ""
            }`.toUpperCase();

            return (
              <Card
                key={dean.id}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                onClick={() => fetchDeanDetails(dean)}
              >
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-blue-100 dark:border-blue-900">
                    {dean.photo ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${dean.photo}`}
                        alt={fullNameENG}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="mt-4 text-xl text-blue-600 dark:text-gray-100">
                    {dean.title} {fullNameENG}
                  </CardTitle>
                  <CardDescription className="text-base mt-1 text-gray-600 dark:text-gray-400">
                    {dean.firstNameAMH} {dean.fatherNameAMH}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {dean.role}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{dean.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{dean.phoneNumber}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-600 dark:text-gray-100">
              Dean Profile Details
            </DialogTitle>
            <DialogDescription>
              Full information for the selected dean
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Loading dean details...
              </p>
            </div>
          ) : selectedDean ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-40 h-40 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                  {modalPhoto ? (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${modalPhoto}`}
                      alt={`${selectedDean.firstNameENG} ${selectedDean.fatherNameENG}`}
                      onError={(e) => {
                        console.error(
                          "Photo failed to load:",
                          modalPhoto.substring(0, 50)
                        );
                        e.currentTarget.src = ""; // fallback to initials
                      }}
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-blue-600 text-white">
                      {selectedDean.firstNameENG[0]}
                      {selectedDean.fatherNameENG[0]}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-100">
                    {selectedDean.title} {selectedDean.firstNameENG}{" "}
                    {selectedDean.fatherNameENG}{" "}
                    {selectedDean.grandfatherNameENG}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {selectedDean.firstNameAMH} {selectedDean.fatherNameAMH}{" "}
                    {selectedDean.grandfatherNameAMH}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedDean.role} • {selectedDean.gender}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="mt-1">{selectedDean.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Number</Label>
                    <p className="mt-1">{selectedDean.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Hired Date (GC)</Label>
                    <p className="mt-1">{selectedDean.hiredDateGC}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Current Residence</Label>
                    <p className="mt-1">
                      {selectedDean.residenceWoreda},{" "}
                      {selectedDean.residenceZone},{" "}
                      {selectedDean.residenceRegion}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Remarks</Label>
                    <p className="mt-1">
                      {selectedDean.remarks || "No remarks"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
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
