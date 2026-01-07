import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "sonner"; // Using sonner for toasts, or use your preferred toast library

export default function SignInPage() {
  const { t } = useTranslation(["auth", "common"]);
  const navigate = useNavigate();

  // State to capture user input
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter both username and password", {
        position: "bottom-right"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const formData = {
      username: email,
      password,
    };

    try {
      const responses = await apiService.post(endPoints.login, formData, {
        headers: { requiresAuth: false },
      });
      
      setResponse(responses.message);
      localStorage.setItem("xy9a7b", responses.jwt);
      
      // Show success toast at bottom
      toast.success("Login successful! Redirecting...", {
        position: "bottom-right"
      });
      
      // Navigate based on role from backend
      switch (responses.role) {
        case "REGISTRAR":
          navigate("/registrar");
          break;
        case "STUDENT":
          navigate("/student");
          break;
        case "GENERAL_MANAGER":
          navigate("/general-manager");
          break;
        case "TEACHER":
          navigate("/teacher");
          break;
        case "DEPARTMENT_HEAD":
          navigate("/head");
          break;
        case "VICE_DEAN":
          navigate("/vice-dean");
          break;
        case "DEAN":
          navigate("/dean");
          break;
        default:
          toast.warning("Role not recognized. Please contact administrator.", {
            position: "bottom-right"
          });
          console.log("Role not handled:", responses.role);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.error || "Failed to login. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right"
      });
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common:back")} to {t("navigation:home")}
        </Link>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 dark:border dark:border-gray-700">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/companylogo.jpg"
                  alt="College Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardTitle className="text-2xl dark:text-white">
                {t("welcomeBack")}
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {t("signInToAccount")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email/Username input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">
                  Username
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter Your Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Password input with eye icon */}
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login button with circular loading */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-11"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  t("signIn")
                )}
              </Button>

              {/* Forgot password link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>
              
              {/* Register link */}
              <div className="text-center pt-4 border-t dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("newStudent")}{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t("registerHere")}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}