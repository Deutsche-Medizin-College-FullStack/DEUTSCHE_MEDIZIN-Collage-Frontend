"use client";

import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  LayoutDashboard,
  CreditCard,
  History,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function FinanceLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [listOpen, setListOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    // Update when resizing
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
  function logout() {
    localStorage.removeItem("xy9a7b");
    navigate("/");
  }
  const navigation = [
    { name: "Dashboard", href: "/finance/dashboard", icon: LayoutDashboard },
    { name: "Payments", href: "/finance/payments", icon: CreditCard },
    { name: "History", href: "/finance/history", icon: History },
    { name: "Reports", href: "/finance/reports", icon: BarChart3 },
  ];

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
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <div className="text-white">
              <div className="text-sm font-bold">DHMC COLLEGE</div>
              <div className="text-xs opacity-75">Finance Portal</div>
            </div>
          </div>
        </div>

        <nav className="mt-8">
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
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      {/* <div className="lg:pl-64">
       
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Finance Portal
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">FO</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Finance Officer
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Financial Management
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div> */}
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
            className=""
            onClick={() => setSidebarOpen(true)}
          >
            {!sidebarOpen && <Menu className="h-6 w-6" />}{" "}
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Finance Portal
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                {window.innerWidth < 720 && (
                  <div
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                    onClick={() => setListOpen((prev) => !prev)}
                  >
                    <span className="text-white text-sm font-medium">DN</span>
                  </div>
                )}
                {window.innerWidth > 720 && (
                  <div className="lg:flex items-center gap-x-4 ml-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Finance
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Academic Leadership
                    </div>
                    <Button onClick={logout}>Logout</Button>
                  </div>
                )}
                {listOpen && (
                  <div className="absolute top-12 right-0 lg:hidden w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50">
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Student
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Academic Records
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        console.log("Logout");
                        logout();
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}
          <div className="mx-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
