"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle,
  Search,
} from "lucide-react";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";
import { useNavigate } from "react-router-dom";

type ViceDean = {
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
  residenceZone: string;
  residenceWoreda: string;
  hiredDateGC: string;
  title: string;
  remarks: string;
  hasDocument: boolean;
  photo: string | null;
  role: "VICE_DEAN";
};

export default function ViceDeansList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [viceDeans, setViceDeans] = useState<ViceDean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vice deans on mount
  useEffect(() => {
    fetchViceDeans();
  }, []);

  const fetchViceDeans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/vice-deans/active");
      console.log("API Response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setViceDeans(res.data);
      } else {
        setViceDeans([]);
        setError("No vice deans found.");
      }
    } catch (err: any) {
      console.error("Failed to fetch vice deans:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.removeItem("xy9a7b");
          navigate("/");
        }, 2000);
      } else if (err.response?.status === 404) {
        setError("No active vice deans found.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.error || "Failed to load vice deans.");
      }
      setViceDeans([]);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filtered = useMemo(() => {
    if (!query) return viceDeans;

    const lowerQuery = query.toLowerCase();
    return viceDeans.filter(
      (v) =>
        v.id.toString().includes(query) ||
        v.username.toLowerCase().includes(lowerQuery) ||
        v.firstNameENG.toLowerCase().includes(lowerQuery) ||
        v.fatherNameENG.toLowerCase().includes(lowerQuery) ||
        v.email.toLowerCase().includes(lowerQuery) ||
        v.phoneNumber.includes(query) ||
        v.title.toLowerCase().includes(lowerQuery)
    );
  }, [viceDeans, query]);

  const getFullName = (viceDean: ViceDean) => {
    return `${viceDean.firstNameENG} ${viceDean.fatherNameENG} ${viceDean.grandfatherNameENG}`;
  };

  const getFullNameAmharic = (viceDean: ViceDean) => {
    return `${viceDean.firstNameAMH} ${viceDean.fatherNameAMH} ${viceDean.grandfatherNameAMH}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNavigateToDetail = (id: number) => {
    console.log("Navigating to vice dean:", id);
    navigate(`/dean/vice-deans/${id}`);
  };

  const handleNavigateToCreate = () => {
    navigate("/dean/create-vice-dean");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vice Deans
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage vice deans in your faculty
          </p>
        </div>
        <Button 
          onClick={handleNavigateToCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Create Vice Dean
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Vice Dean Management
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                View and manage all vice deans in your faculty
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filtered.length} found
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchViceDeans}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ID, name, email, phone, or title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
              disabled={loading}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span className="text-gray-600 dark:text-gray-400">
                  Loading vice deans...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-4 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    Failed to load vice deans
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {error}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dean/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                  <Button onClick={fetchViceDeans}>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <UserPlus className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No vice deans found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {query ? "Try a different search term" : "Get started by creating your first vice dean"}
              </p>
              <Button 
                onClick={handleNavigateToCreate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Vice Dean
              </Button>
            </div>
          )}

          {/* Vice Deans Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((viceDean) => (
                <Card
                  key={viceDean.id}
                  className="overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-blue-100 dark:border-blue-900">
                        <AvatarImage
                          src={viceDean.photo || undefined}
                          alt={getFullName(viceDean)}
                        />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {viceDean.firstNameENG[0]}
                          {viceDean.fatherNameENG[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                              {getFullName(viceDean)}
                            </h3>
                            <p className="text-sm font-geez text-gray-600 dark:text-gray-400 truncate">
                              {getFullNameAmharic(viceDean)}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {viceDean.title}
                          </Badge>
                        </div>

                        <div className="space-y-3 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {viceDean.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {viceDean.phoneNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {viceDean.residenceRegion}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Hired: {formatDate(viceDean.hiredDateGC)}
                            </span>
                          </div>
                        </div>

                        {viceDean.remarks && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                              {viceDean.remarks}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-300 dark:border-gray-600"
                            onClick={() => handleNavigateToDetail(viceDean.id)}
                          >
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleNavigateToDetail(viceDean.id)}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}