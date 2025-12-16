"use client";

import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  ClipboardList,
  LayoutDashboard,
  User,
  BookOpen,
  CreditCard,
  LogOut,
  Menu,
  Settings,
  Key,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { studentApi } from "@/lib/api";
import type { Student } from "@/mocks/mockStudent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import apiClient from "../components/api/apiClient";
import endPoints from "../components/api/endPoints";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });
  const [isWide, setIsWide] = useState(() => {
    return window.innerWidth >= 1024;
  });
  const [listOpen, setListOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { t } = useTranslation(["navigation", "common", "auth"]);

  // Fetch user data
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
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth >= 1024;
      setIsWide(wide);
      if (wide) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function logout() {
    localStorage.removeItem("xy9a7b");
    navigate("/");
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
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

  const navigation = [
    { name: t("dashboard"), href: "/student/dashboard", icon: LayoutDashboard },
    { name: t("profile"), href: "/student/profile", icon: User },
    { name: t("grades"), href: "/student/grades", icon: ClipboardList },
    { name: t("settings"), href: "/student/settings", icon: Settings },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.fullName) return "U";
    const names = userData.fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userData.fullName[0].toUpperCase();
  };

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
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 shadow-md">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/companylogo.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="text-white">
              <div className="text-sm font-bold">DHFM COLLEGE</div>
              <div className="text-xs opacity-75">
                {userData?.role === "TEACHER" ? "Teacher Portal" : "Student Portal"}
              </div>
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

        {/* User Profile Section in Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {userData?.photoBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${userData.photoBase64}`}
                  alt={userData.fullName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {getUserInitials()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userData?.fullName || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userData?.role?.toLowerCase() || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userData?.username || ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 space-y-2">
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-300"
              >
                <Key className="mr-3 h-5 w-5" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and new password below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setChangePasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {t("auth:logout")}
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
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Sidebar button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            {!sidebarOpen && <Menu className="h-6 w-6" />}
          </Button>

          {/* Page title */}
          <div className="flex flex-1 items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {userData?.role === "TEACHER" ? "Teacher Portal" : "Student Portal"}
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-x-4 lg:gap-x-6 relative">
            <ThemeToggle />

            {/* Avatar for mobile */}
            {window.innerWidth < 720 && (
              <div
                className="relative cursor-pointer"
                onClick={() => setListOpen((prev) => !prev)}
              >
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
              </div>
            )}

            {/* Large screen info + logout inline */}
            {window.innerWidth > 720 && (
              <div className="lg:flex items-center gap-x-4 ml-2">
                <div className="text-right mr-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.fullName || "Loading..."}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {userData?.role?.toLowerCase() || "User"}
                  </div>
                </div>
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-2">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and new password below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
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
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
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
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setChangePasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? "Changing..." : "Change Password"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={logout} variant="destructive">
                  Logout
                </Button>
              </div>
            )}

            {/* Dropdown for small screens */}
            {listOpen && window.innerWidth < 720 && (
              <div className="absolute top-12 right-0 lg:hidden w-56 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50 border border-gray-200 dark:border-gray-700">
                {/* User info in dropdown */}
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
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
                      {userData?.fullName || "Loading..."}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userData?.role?.toLowerCase() || "User"}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-2"
                  onClick={() => {
                    setChangePasswordOpen(true);
                    setListOpen(false);
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    logout();
                    setListOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Change Password Dialog for mobile */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and new password below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="oldPassword">Current Password</Label>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setChangePasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}