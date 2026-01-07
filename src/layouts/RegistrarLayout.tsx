"use client";

import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  LogOut,
  Layers,
  Menu,
  Settings,
  UserPlus,
  ChevronDown,
  Key,
  User,
  FileCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/components/api/apiClient";
import endPoints from "@/components/api/endPoints";

export default function RegistrarLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });

  // User state
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [loadingPendingCount, setLoadingPendingCount] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/registrar/dashboard", icon: LayoutDashboard },
    { name: "Add New Student", href: "/registrar/add-student", icon: UserPlus },
    { name: "Students", href: "/registrar/students", icon: Users },
    { name: "Departments", href: "/registrar/departments", icon: Layers },
    {
      name: "Scores",
      href: "/registrar/scores",
      icon: ClipboardList,
    },
    {
      name: "Registration Slips",
      href: "/registrar/registration-slips",
      icon: FileText,
    },
    { name: "Transcript", href: "/registrar/transcripts", icon: FileText },
    { name: "Customize Tables", href: "/registrar/tables", icon: Calendar },
    {
      name: "Assessments",
      href: "/registrar/assessments",
      icon: FileCheck,
      badgeCount: pendingCoursesCount,
    },
  ];

  function logout() {
    localStorage.removeItem("xy9a7b");
    navigate("/");
  }

  const getUserInitials = () => {
    if (!userData?.fullName) return "RG";
    const names = userData.fullName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userData.fullName[0].toUpperCase();
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      alert("Password must be at least 4 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      await apiClient.post(endPoints.changePassword, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      alert("Password changed successfully!");
      setChangePasswordOpen(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fetch pending courses count
  const fetchPendingCoursesCount = async () => {
    try {
      setLoadingPendingCount(true);
      const response = await apiClient.get(
        endPoints.getRegistrarHeadApprovedScores
      );

      let pendingCount = 0;
      if (response.data && Array.isArray(response.data)) {
        pendingCount = response.data.filter((course) => {
          return course.assessments?.some(
            (assessment) =>
              assessment.registrarApproval === "PENDING" &&
              assessment.headApproval === "ACCEPTED"
          );
        }).length;
      }

      setPendingCoursesCount(pendingCount);
    } catch (error) {
      console.error("Error fetching pending courses count:", error);
      setPendingCoursesCount(0);
    } finally {
      setLoadingPendingCount(false);
    }
  };

  // Fetch current user
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endPoints.getCurrentUser);
        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    fetchPendingCoursesCount();
  }, []);

  // Refresh pending count when navigating to assessments page
  useEffect(() => {
    if (location.pathname === "/registrar/assessments") {
      fetchPendingCoursesCount();
    }
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [extra, setExtra] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed flex flex-col inset-y-0 left-0 z-50 w-64
              bg-white dark:bg-gray-800 shadow-xl
              transform transition-transform duration-300 ease-in-out
              border-r border-gray-200 dark:border-gray-700
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 shadow-md">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/companylogo.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="text-white">
              <div className="text-sm font-bold">DHFM COLLEGE</div>
              <div className="text-xs opacity-75">Registrar Portal</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-blue-500 transition"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
            >
              <g>
                <path d="M32.6,22.6a1.9,1.9,0,0,0,0,2.8l5.9,6a2.1,2.1,0,0,0,2.7.2,1.9,1.9,0,0,0,.2-3L38.8,26H44a2,2,0,0,0,0-4H38.8l2.6-2.6a1.9,1.9,0,0,0-.2-3,2.1,2.1,0,0,0-2.7.2Z" />
                <path d="M15.4,25.4a1.9,1.9,0,0,0,0-2.8l-5.9-6a2.1,2.1,0,0,0-2.7-.2,1.9,1.9,0,0,0-.2,3L9.2,22H4a2,2,0,0,0,0,4H9.2L6.6,28.6a1.9,1.9,0,0,0,.2,3,2.1,2.1,0,0,0,2.7-.2Z" />
                <path d="M26,6V42a2,2,0,0,0,4,0V6a2,2,0,0,0-4,0Z" />
                <path d="M22,42V6a2,2,0,0,0-4,0V42a2,2,0,0,0,4,0Z" />
              </g>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 mb-12 flex-1 pb-6 overflow-y-auto sidebar-scroll">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname.includes(item.href);
              const hasBadge =
                item.badgeCount !== undefined && item.badgeCount > 0;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() =>
                    window.innerWidth <= 1024 && setSidebarOpen(false)
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}

                  {hasBadge && (
                    <span className="absolute right-3 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {item.badgeCount}
                    </span>
                  )}

                  {item.name === "Assessments" &&
                    loadingPendingCount &&
                    !hasBadge && (
                      <span className="absolute right-3 flex items-center justify-center h-5 w-5">
                        <div className="h-2 w-2 animate-ping rounded-full bg-blue-500"></div>
                      </span>
                    )}
                </Link>
              );
            })}

            {/* Extra collapsible section */}
            <div className="mt-2 space-y-1">
              <button
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  extra ||
                  location.pathname.includes("/registrar/applications") ||
                  location.pathname.includes("/registrar/rejected-applications")
                    ? "bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  setExtra(!extra);
                }}
              >
                <FileText className="mr-3 h-5 w-5" />
                <div className="flex justify-between w-full">
                  <span>Applications</span>
                  <svg
                    className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                      extra ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {extra && (
                <div className="pl-6 space-y-1">
                  <Link
                    to="/registrar/applications"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes("/registrar/applications")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    New Applicants
                  </Link>
                  <Link
                    to="/registrar/rejected-applications"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/rejected-applications"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Rejected Applicants
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-2 space-y-1">
              <button
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  setupOpen || location.pathname.includes("/registrar/settings")
                    ? "bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  setSetupOpen(!setupOpen);
                }}
              >
                <Settings className="mr-3 h-5 w-5" />
                <div className="flex justify-between w-full">
                  <span>Set Up</span>
                  <svg
                    className={`mr-3 ml-2 h-5 w-5 transition-transform duration-200 ${
                      setupOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {setupOpen && (
                <div className="pl-6 space-y-1">
                  <Link
                    to="/registrar/settings/location"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes("/registrar/settings/location")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Locations
                  </Link>
                  <Link
                    to="/registrar/settings/academic-years"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/academic-years"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Academic Years
                  </Link>
                  <Link
                    to="/registrar/settings/impairments"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/impairments"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Impairments
                  </Link>

                  <div className="space-y-1">
                    <button
                      className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        programOpen ||
                        location.pathname.includes(
                          "/registrar/settings/program"
                        )
                          ? "bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setProgramOpen(!programOpen);
                      }}
                    >
                      <div className="flex justify-between w-full">
                        <span>Program</span>
                        <svg
                          className={`mr-3 ml-2 h-5 w-5 transition-transform duration-200 ${
                            programOpen ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                    {programOpen && (
                      <div className="pl-6 space-y-1">
                        <Link
                          to="/registrar/settings/program-level"
                          className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            location.pathname.includes(
                              "/registrar/settings/program-level"
                            )
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                          }`}
                          onClick={() =>
                            window.innerWidth <= 1024 && setSidebarOpen(false)
                          }
                        >
                          Program Level
                        </Link>
                        <Link
                          to="/registrar/settings/program-modality"
                          className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            location.pathname.includes(
                              "/registrar/settings/program-modality"
                            )
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                          }`}
                          onClick={() =>
                            window.innerWidth <= 1024 && setSidebarOpen(false)
                          }
                        >
                          Program Modality
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        courseOpen ||
                        location.pathname.includes("/registrar/settings/course")
                          ? "bg-gray-100 dark:text-gray-300 dark:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setCourseOpen(!courseOpen);
                      }}
                    >
                      <div className="flex justify-between w-full">
                        <span>Courses</span>
                        <svg
                          className={`mr-3 ml-2 h-5 w-5 transition-transform duration-200 ${
                            courseOpen ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                    {courseOpen && (
                      <div className="pl-6 space-y-1">
                        <Link
                          to="/registrar/settings/course-category"
                          className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            location.pathname.includes(
                              "/registrar/settings/course-category"
                            )
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                          }`}
                          onClick={() =>
                            window.innerWidth <= 1024 && setSidebarOpen(false)
                          }
                        >
                          Course Category
                        </Link>
                        <Link
                          to="/registrar/settings/course-source"
                          className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            location.pathname.includes(
                              "/registrar/settings/course-source"
                            )
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                          }`}
                          onClick={() =>
                            window.innerWidth <= 1024 && setSidebarOpen(false)
                          }
                        >
                          Course Source
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/registrar/settings/batches"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes("/registrar/settings/batches")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Batches
                  </Link>
                  <Link
                    to="/registrar/settings/enrollment"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/enrollment"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Enrolment Type
                  </Link>
                  <Link
                    to="/registrar/settings/school-background"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/school-background"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    School Background
                  </Link>
                  <Link
                    to="/registrar/settings/class-years"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/class-years"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Class Years
                  </Link>
                  <Link
                    to="/registrar/settings/semesters"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/semesters"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Semesters
                  </Link>
                  <Link
                    to="/registrar/settings/grading-systems"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes("/registrar/settings/grading")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Grading System
                  </Link>
                  <Link
                    to="/registrar/settings/attritions"
                    className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.includes(
                        "/registrar/settings/attritions"
                      )
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                    onClick={() =>
                      window.innerWidth <= 1024 && setSidebarOpen(false)
                    }
                  >
                    Attrition Cause
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer Sign Out */}
        <div className="bg-white dark:bg-gray-800 absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`inset-0 w-full transition-all duration-300 ${
          sidebarOpen && window.innerWidth >= 1024 ? "ml-64" : "ml-0"
        }`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            {!sidebarOpen && <Menu className="h-6 w-6" />}
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Page Title */}
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registrar Portal
              </h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    {userData?.photoBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${userData.photoBase64}`}
                        alt={userData.fullName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    <div className="text-left max-w-[120px]">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userData?.fullName || "Loading..."}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                        {userData?.role?.toLowerCase() || "registrar"}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {userData?.photoBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${userData.photoBase64}`}
                            alt={userData.fullName}
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {userData?.fullName || "Registrar"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {userData?.role?.toLowerCase() || "registrar"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setChangePasswordOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Key className="h-4 w-4 mr-3" />
                        Change Password
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors mt-1"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 z-[60]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Enter your current password and new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="oldPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Current Password
              </Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="newPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangePasswordOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
