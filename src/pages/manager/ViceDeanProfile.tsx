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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
interface ViceDeanListItem {
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
interface ViceDeanDetail extends ViceDeanListItem {
  residenceRegionCode: string;
  residenceZone: string;
  residenceZoneCode: string;
  residenceWoreda: string;
  residenceWoredaCode: string;
  hasPhoto: boolean;
  active: boolean;
}
export default function ViceDeanProfile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viceDeans, setViceDeans] = useState<ViceDeanListItem[]>([]);
  const [selectedViceDean, setSelectedViceDean] =
    useState<ViceDeanDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);
  // Fake data for one dean
  // const deanData = {
  //   firstName: "Michael",
  //   lastName: "Tesfaye",
  //   email: "michael.tesfaye@example.com",
  //   phone: "+251911223344",
  //   address: "Addis Ababa, Ethiopia",
  //   photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/...",
  //   qualification: "PhD in Educational Leadership",
  //   departmentOverseen: "Faculty of Science",
  //   yearsOfService: "10 years",
  //   officeLocation: "Main Campus, Building A, Room 101",
  // };
  const fetchViceDeans = async () => {
    try {
      setLoadingList(true);
      setError(null); // Clear previous errors
      const response = await apiClient.get<ViceDeanListItem[]>(
        endPoints.getActiveViceDeans
      );
      setViceDeans(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load vice-deans");
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    fetchViceDeans();
  }, []);

  // Fetch single vice-dean details
  const fetchViceDeanDetails = async (viceDean: ViceDeanListItem) => {
    setLoadingDetail(true);
    setSelectedViceDean(null);
    setModalPhoto(viceDean.photo);
    setModalOpen(true);

    try {
      const response = await apiClient.get<ViceDeanDetail>(
        `${endPoints.getViceDeanById}/${viceDean.id}`
      );
      setSelectedViceDean(response.data);
      setModalPhoto(response.data.photo || viceDean.photo);
    } catch (err: any) {
      console.error("Error fetching vice-dean details:", err);
      setError(err.response?.data?.error || "Failed to load vice-dean details");
    } finally {
      setLoadingDetail(false);
    }
  };
  const filteredViceDeans = viceDeans.filter((vd) => {
    const fullNameENG =
      `${vd.firstNameENG} ${vd.fatherNameENG} ${vd.grandfatherNameENG}`.toLowerCase();
    const fullNameAMH =
      `${vd.firstNameAMH} ${vd.fatherNameAMH} ${vd.grandfatherNameAMH}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return (
      fullNameENG.includes(search) ||
      fullNameAMH.includes(search) ||
      vd.email.toLowerCase().includes(search) ||
      vd.phoneNumber.includes(search)
    );
  });
  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Loading vice-deans...
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
          onClick={fetchViceDeans}
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
          Vice Dean Profile Active Vice-Deans
        </h1>
        <div className="w-full sm:w-72">
          <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">
            Search vice-deans
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
      {filteredViceDeans.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No vice-deans found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredViceDeans.map((vd) => {
            const fullNameENG = `${vd.firstNameENG} ${vd.fatherNameENG}`;
            const initials = `${vd.firstNameENG[0] || ""}${
              vd.fatherNameENG[0] || ""
            }`.toUpperCase();

            return (
              <Card
                key={vd.id}
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700"
                onClick={() => fetchViceDeanDetails(vd)}
              >
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-blue-100 dark:border-blue-900">
                    {vd.photo ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${vd.photo}`}
                        alt={fullNameENG}
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="mt-4 text-xl text-blue-600 dark:text-gray-100">
                    {vd.title} {fullNameENG}
                  </CardTitle>
                  <CardDescription className="text-base mt-1 text-gray-600 dark:text-gray-400">
                    {vd.firstNameAMH} {vd.fatherNameAMH}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {vd.role}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{vd.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{vd.phoneNumber}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-600 dark:text-gray-100">
              Vice-Dean Profile Details
            </DialogTitle>
            <DialogDescription>
              Full information for the selected vice-dean
            </DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Loading vice-dean details...
              </p>
            </div>
          ) : selectedViceDean ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-40 h-40 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                  {modalPhoto ? (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${modalPhoto}`}
                      alt={`${selectedViceDean.firstNameENG} ${selectedViceDean.fatherNameENG}`}
                      onError={(e) => {
                        console.error(
                          "Vice-Dean photo failed to load:",
                          modalPhoto.substring(0, 50)
                        );
                        e.currentTarget.src = ""; // fallback to initials
                      }}
                    />
                  ) : (
                    <AvatarFallback className="text-4xl bg-blue-600 text-white">
                      {selectedViceDean.firstNameENG[0]}
                      {selectedViceDean.fatherNameENG[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-100">
                    {selectedViceDean.title} {selectedViceDean.firstNameENG}{" "}
                    {selectedViceDean.fatherNameENG}{" "}
                    {selectedViceDean.grandfatherNameENG}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {selectedViceDean.firstNameAMH}{" "}
                    {selectedViceDean.fatherNameAMH}{" "}
                    {selectedViceDean.grandfatherNameAMH}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedViceDean.role} • {selectedViceDean.gender}
                  </Badge>
                </div>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="mt-1">{selectedViceDean.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Number</Label>
                    <p className="mt-1">{selectedViceDean.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Hired Date (GC)</Label>
                    <p className="mt-1">{selectedViceDean.hiredDateGC}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Current Residence</Label>
                    <p className="mt-1">
                      {selectedViceDean.residenceWoreda},{" "}
                      {selectedViceDean.residenceZone},{" "}
                      {selectedViceDean.residenceRegion}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Remarks</Label>
                    <p className="mt-1">
                      {selectedViceDean.remarks || "No remarks"}
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

// <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// <Card className="lg:col-span-1 bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700">
//   <CardHeader className="text-center">
//     <div className="relative mx-auto">
//       <Avatar className="w-32 h-32">
//         <AvatarImage src={deanData.photo} />
//         <AvatarFallback className="text-2xl bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-300">
//           {deanData.firstName[0]}
//           {deanData.lastName[0]}
//         </AvatarFallback>
//       </Avatar>
//     </div>
//     <CardTitle className="mt-4 text-blue-600 dark:text-gray-100">
//       {deanData.firstName} {deanData.lastName}
//     </CardTitle>
//     <CardDescription className="text-gray-600 dark:text-gray-400">
//       Vice Dean of {deanData.departmentOverseen}
//     </CardDescription>
//     <Badge
//       variant="secondary"
//       className="mt-2 bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-300"
//     >
//       {deanData.qualification}
//     </Badge>
//   </CardHeader>
//   <CardContent className="space-y-4">
//     <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//       <Mail className="h-4 w-4 text-blue-600 dark:text-gray-300" />
//       <span>{deanData.email}</span>
//     </div>
//     <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//       <Phone className="h-4 w-4 text-blue-600 dark:text-gray-300" />
//       <span>{deanData.phone}</span>
//     </div>
//     <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//       <MapPin className="h-4 w-4 text-blue-600 dark:text-gray-300" />
//       <span>{deanData.address}</span>
//     </div>
//   </CardContent>
// </Card>

// <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700">
//   <CardHeader>
//     <CardTitle className="text-blue-600 dark:text-gray-100">
//       Vice Dean Information
//     </CardTitle>
//     <CardDescription className="text-gray-600 dark:text-gray-400">
//       Details about the vice dean and their role
//     </CardDescription>
//   </CardHeader>
//   <CardContent className="space-y-6">
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div className="space-y-2">
//         <Label
//           htmlFor="firstName"
//           className="text-gray-700 dark:text-gray-300"
//         >
//           First Name
//         </Label>
//         <Input
//           id="firstName"
//           value={deanData.firstName}
//           readOnly
//           className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label
//           htmlFor="lastName"
//           className="text-gray-700 dark:text-gray-300"
//         >
//           Last Name
//         </Label>
//         <Input
//           id="lastName"
//           value={deanData.lastName}
//           readOnly
//           className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div className="space-y-2">
//         <Label
//           htmlFor="email"
//           className="text-gray-700 dark:text-gray-300"
//         >
//           Email
//         </Label>
//         <Input
//           id="email"
//           value={deanData.email}
//           readOnly
//           className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label
//           htmlFor="phone"
//           className="text-gray-700 dark:text-gray-300"
//         >
//           Phone Number
//         </Label>
//         <Input
//           id="phone"
//           value={deanData.phone}
//           readOnly
//           className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
//         />
//       </div>
//     </div>

//     <Separator className="bg-blue-200 dark:bg-gray-700" />

//     <div className="space-y-2">
//       <Label
//         htmlFor="address"
//         className="text-gray-700 dark:text-gray-300"
//       >
//         Address
//       </Label>
//       <Input
//         id="address"
//         value={deanData.address}
//         readOnly
//         className="border-blue-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-gray-500 text-gray-900 dark:text-gray-100"
//       />
//     </div>
//   </CardContent>
// </Card>
// </div>
// </div>
