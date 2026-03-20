import React, { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, User } from "lucide-react";
import LightRays from "@/designs/LightRays";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";
import { Combobox } from "@headlessui/react";
import useApi from "@/hooks/useApi";
import endPoints from "@/components/api/endPoints";
import DarkVeil from "@/designs/DarkVeil";
import apiService from "@/components/api/apiService";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Validation utility to check if a field is empty
const isFieldEmpty = (value) => {
  return value === undefined || value === null || String(value).trim() === "";
};

// Required fields configuration based on backend requirements
const REQUIRED_FIELDS = {
  // Step 1: Personal Information
  firstName: "First Name (English)",
  middleName: "Father Name (English)",
  lastName: "Grandfather Name (English)",
  firstNameAMH: "First Name (Amharic)",
  middleNameAMH: "Father Name (Amharic)",
  lastNameAMH: "Grandfather Name (Amharic)",
  sex: "Gender",
  phoneNo: "Phone Number",
  birthDateGC: "Date of Birth (GC)",
  placeOfBirthRegionCode: "Birth Region",
  placeOfBirthZoneCode: "Birth Zone",
  placeOfBirthWoredaCode: "Birth Woreda",
  currentAddressRegionCode: "Current Region",
  currentAddressZoneCode: "Current Zone",
  currentAddressWoredaCode: "Current Woreda",
  maritalStatus: "Marital Status",

  // Step 2: Account Creation
  username: "Username",
  password: "Password",
  confirmPassword: "Confirm Password",

  // Step 4: Educational Information
  schoolBackgroundId: "School Background",
  departmentEnrolledId: "Department",
  programModalityCode: "Program Modality",
  studentRecentStatusId: "Student Status",
  batchId: "Batch", // NEW: Add batch to required fields
  batchClassYearSemesterId: "Batch/Class/Semester",

  // Step 5: Emergency Contact (all required except relation)
  emergencyFullName: "Emergency Contact Full Name",
  emergencyFullNameAMH: "Emergency Contact Full Name (Amharic)",
  contactPersonPhoneNumber: "Emergency Contact Phone",

  // Step 5: Enrollment Date
  dateEnrolledGC: "Enrollment Date (GC)",
};

// Get required fields for current step
const getRequiredFieldsForStep = (step) => {
  switch (step) {
    case 1:
      return [
        "firstName",
        "middleName",
        "lastName",
        "firstNameAMH",
        "middleNameAMH",
        "lastNameAMH",
        "sex",
        "phoneNo",
        "birthDateGC",
        "placeOfBirthRegionCode",
        "placeOfBirthZoneCode",
        "placeOfBirthWoredaCode",
        "currentAddressRegionCode",
        "currentAddressZoneCode",
        "currentAddressWoredaCode",
        "maritalStatus",
      ];
    case 2:
      return ["username", "password", "confirmPassword"];
    case 3:
      return [
        "schoolBackgroundId",
        "departmentEnrolledId",
        "programModalityCode",
        "studentRecentStatusId",
        "batchId",
        "batchClassYearSemesterId",
      ];
    case 4:
      return [
        "emergencyFullName",
        "emergencyFullNameAMH",
        "contactPersonPhoneNumber",
        "dateEnrolledGC",
      ];
    default:
      return [];
  }
};

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <svg
      className="w-4 h-4 text-gray-500 dark:text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </components.DropdownIndicator>
);

/* ==============================================================
   STEP 1 – PERSONAL INFORMATION
   ============================================================== */
const PersonalInformationStep = ({
  formData,
  setFormData,
  dropdowns,
  fetchZonesByRegion,
  fetchWoredasByZone,

  shouldShowError, // new
  getInputClassName, // new
  handleFieldBlur, // new
}) => {
  const [previews, setPreviews] = useState(
    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg",
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      placeOfBirthRegionCode: value,
      placeOfBirthZoneCode: "",
      placeOfBirthWoredaCode: "",
    }));
    if (value) await fetchZonesByRegion(value, "birth");
  };
  const handleZoneChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      placeOfBirthZoneCode: value,
      placeOfBirthWoredaCode: "",
    }));
    if (value) await fetchWoredasByZone(value, "birth");
  };
  const handleCurrentRegionChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      currentAddressRegionCode: value,
      currentAddressZoneCode: "",
      currentAddressWoredaCode: "",
    }));
    if (value) await fetchZonesByRegion(value, "current");
  };
  const handleCurrentZoneChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      currentAddressZoneCode: value,
      currentAddressWoredaCode: "",
    }));
    if (value) await fetchWoredasByZone(value, "current");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews(url);
      setFormData((prev) => ({
        ...prev,
        studentPhoto: file,
        prevPhoto: url,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Fill the student's basic personal details and contact information.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          1. PERSONAL DATA
        </h3>

        {/* FULL NAME (EN & AM) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Full Name (English): *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["firstName", "middleName", "lastName"].map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 dark:text-white mb-1">
                  {field === "firstName"
                    ? "First Name *"
                    : field === "middleName"
                      ? "Middle Name *"
                      : "Last Name *"}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur(field)}
                  className={getInputClassName(
                    field,
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                  )}
                />
                {shouldShowError(field) && (
                  <p className="mt-1 text-xs text-red-500">
                    This field is required
                  </p>
                )}
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 mt-4">
            Full Name (Amharic): *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["firstNameAMH", "middleNameAMH", "lastNameAMH"].map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 dark:text-white mb-1">
                  {field === "firstNameAMH"
                    ? "First Name *"
                    : field === "middleNameAMH"
                      ? "Middle Name *"
                      : "Last Name *"}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur(field)}
                  className={getInputClassName(
                    field,
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                  )}
                />
                {shouldShowError(field) && (
                  <p className="mt-1 text-xs text-red-500">
                    This field is required
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEX & AGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Sex: *
            </label>
            <div className="flex gap-4">
              {["Male", "Female"].map((g) => (
                <label key={g} className="flex items-center">
                  <input
                    type="radio"
                    name="sex"
                    value={g}
                    checked={formData.sex === g}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("sex")}
                    className="mr-2"
                  />
                  {g}
                </label>
              ))}
            </div>
            {shouldShowError("sex") && (
              <p className="mt-1 text-xs text-red-500">
                Please select a gender
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Age: (Optional)
            </label>
            <input
              type="number"
              name="age"
              min="16"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* USER CONTACT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Student's Contact Information:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Email address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Phone No. *
              </label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("phoneNo")}
                className={getInputClassName(
                  "phoneNo",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                )}
              />
              {shouldShowError("phoneNo") && (
                <p className="mt-1 text-xs text-red-500">
                  Phone number is required
                </p>
              )}
            </div>
          </div>
        </div>

        {/* IMPAIRMENT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Information about Impairment (if any): (Optional)
          </label>
          <select
            name="impairmentCode"
            value={formData.impairmentCode}
            onChange={handleInputChange}
            className="w-full bg-white dark:bg-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Impairment</option>
            {dropdowns.impairments.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* PHOTO UPLOAD */}
        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Student Photo (Optional)
        </label>
        <section className="border-2 border-blue-200 rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="border-t-2 border-blue-400 dark:border-gray-600 pt-4 flex flex-col items-center">
            <img
              src={previews}
              alt="Student Photo"
              className="w-24 h-24 rounded-full mb-4 border-2 border-blue-300 dark:border-gray-500 object-cover"
            />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 text-center">
              Upload your student photo
            </h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4 text-center">
              Upload a clear portrait image (JPG or PNG)
            </p>

            <input
              id="upload-studentphoto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="upload-studentphoto"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow cursor-pointer hover:from-blue-700 hover:to-blue-800 transition"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Upload Student Photo</span>
            </label>

            {formData.studentPhoto && (
              <div className="mt-4 relative inline-block">
                <img
                  src={URL.createObjectURL(formData.studentPhoto)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviews(
                      "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg",
                    );
                    setFormData((prev) => ({
                      ...prev,
                      studentPhoto: null,
                      prevPhoto: null,
                    }));
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* PLACE OF BIRTH (Cascading) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Place of Birth: *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Region *
              </label>
              <select
                name="placeOfBirthRegionCode"
                value={formData.placeOfBirthRegionCode}
                onChange={handleRegionChange}
                onBlur={() => handleFieldBlur("placeOfBirthRegionCode")}
                className={getInputClassName(
                  "placeOfBirthRegionCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2",
                )}
              >
                <option value="">Choose Region</option>
                {dropdowns.regions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("placeOfBirthRegionCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a region
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Zone *
              </label>
              <select
                name="placeOfBirthZoneCode"
                value={formData.placeOfBirthZoneCode}
                onChange={handleZoneChange}
                onBlur={() => handleFieldBlur("placeOfBirthZoneCode")}
                disabled={!formData.placeOfBirthRegionCode}
                className={getInputClassName(
                  "placeOfBirthZoneCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                )}
              >
                <option value="">Choose Zone</option>
                {dropdowns.birthZones.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("placeOfBirthZoneCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a zone
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Woreda (Town) *
              </label>
              <select
                name="placeOfBirthWoredaCode"
                value={formData.placeOfBirthWoredaCode}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("placeOfBirthWoredaCode")}
                disabled={!formData.placeOfBirthZoneCode}
                className={getInputClassName(
                  "placeOfBirthWoredaCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                )}
              >
                <option value="">Choose Woreda</option>
                {dropdowns.birthWoredas.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("placeOfBirthWoredaCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a woreda
                </p>
              )}
            </div>
          </div>
        </div>

        {/* DATE OF BIRTH */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Date of Birth:
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Ethiopian Calendar (E.C)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="birthDateEC"
                  placeholder="Date"
                  value={formData.birthDateEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="birthMonthEC"
                  placeholder="Month"
                  value={formData.birthMonthEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="birthYearEC"
                  placeholder="Year"
                  value={formData.birthYearEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Gregorian Calendar (G.C) *
              </label>
              <input
                type="date"
                name="birthDateGC"
                value={formData.birthDateGC}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("birthDateGC")}
                className={getInputClassName(
                  "birthDateGC",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                )}
              />
              {shouldShowError("birthDateGC") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a date
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CURRENT ADDRESS (Cascading) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Current Residential Address: *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Region *
              </label>
              <select
                name="currentAddressRegionCode"
                value={formData.currentAddressRegionCode}
                onChange={handleCurrentRegionChange}
                onBlur={() => handleFieldBlur("currentAddressRegionCode")}
                className={getInputClassName(
                  "currentAddressRegionCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2",
                )}
              >
                <option value="">Choose Region</option>
                {dropdowns.regions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("currentAddressRegionCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a region
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Zone *
              </label>
              <select
                name="currentAddressZoneCode"
                value={formData.currentAddressZoneCode}
                onChange={handleCurrentZoneChange}
                onBlur={() => handleFieldBlur("currentAddressZoneCode")}
                disabled={!formData.currentAddressRegionCode}
                className={getInputClassName(
                  "currentAddressZoneCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                )}
              >
                <option value="">Choose Zone</option>
                {dropdowns.currentZones.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("currentAddressZoneCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a zone
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Woreda (Town) *
              </label>
              <select
                name="currentAddressWoredaCode"
                value={formData.currentAddressWoredaCode}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("currentAddressWoredaCode")}
                disabled={!formData.currentAddressZoneCode}
                className={getInputClassName(
                  "currentAddressWoredaCode",
                  "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                )}
              >
                <option value="">Choose Woreda</option>
                {dropdowns.currentWoredas.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {shouldShowError("currentAddressWoredaCode") && (
                <p className="mt-1 text-xs text-red-500">
                  Please select a woreda
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MARITAL STATUS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Marital Status: *
          </label>
          <div className="flex flex-wrap gap-4">
            {["Single", "Married", "Divorced", "Separated"].map((s) => (
              <label key={s} className="flex items-center">
                <input
                  type="radio"
                  name="maritalStatus"
                  value={s}
                  checked={formData.maritalStatus === s}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("maritalStatus")}
                  className="mr-2"
                />
                {s}
              </label>
            ))}
          </div>
          {shouldShowError("maritalStatus") && (
            <p className="mt-1 text-xs text-red-500">
              Please select a marital status
            </p>
          )}
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Contact Person in case of Emergency: (required)
          </label>
          <div className="space-y-4">
            {/* Full Name (English) */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Full Name (English) *
              </label>
              <input
                type="text"
                name="emergencyFullName"
                value={formData.emergencyFullName || ""}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("emergencyFullName")}
                placeholder="Enter full name of emergency contact"
                className={getInputClassName(
                  "emergencyFullName",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                )}
              />
              {shouldShowError("emergencyFullName") && (
                <p className="mt-1 text-xs text-red-500">
                  Full name is required
                </p>
              )}
            </div>

            {/* Full Name (Amharic) */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Full Name (Amharic) *
              </label>
              <input
                type="text"
                name="emergencyFullNameAMH"
                value={formData.emergencyFullNameAMH || ""}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("emergencyFullNameAMH")}
                placeholder="የአስቸኳይ ጊዜ አድራሻ ሙሉ ስም"
                className={getInputClassName(
                  "emergencyFullNameAMH",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-left placeholder:text-left",
                )}
                dir="ltr"
              />

              {shouldShowError("emergencyFullNameAMH") && (
                <p className="mt-1 text-xs text-red-500">
                  Full name (Amharic) is required
                </p>
              )}
            </div>

            {/* Relation and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relation (Optional) */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  Relation (Optional)
                </label>
                <input
                  type="text"
                  name="contactPersonRelation"
                  value={formData.contactPersonRelation}
                  onChange={handleInputChange}
                  placeholder="e.g., Parent, Spouse, Sibling"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone Number (Required) */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPersonPhoneNumber"
                  value={formData.contactPersonPhoneNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("contactPersonPhoneNumber")}
                  placeholder="Enter phone number"
                  className={getInputClassName(
                    "contactPersonPhoneNumber",
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                  )}
                />
                {shouldShowError("contactPersonPhoneNumber") && (
                  <p className="mt-1 text-xs text-red-500">
                    Phone number is required
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 2 – ACCOUNT CREATION (with password visibility toggle)
   ============================================================== */
const AccountCreationStep = ({
  formData,
  setFormData,
  shouldShowError,
  getInputClassName,
  handleFieldBlur,
}) => {
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match");
      } else if (formData.password.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Create Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose a username and a strong password for the student portal.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              onBlur={() => handleFieldBlur("username")}
              placeholder="Enter username"
              className={getInputClassName(
                "username",
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
              )}
            />
            {shouldShowError("username") && (
              <p className="mt-1 text-xs text-red-500">Username is required</p>
            )}
          </div>

          {/* Password with toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                onBlur={() => handleFieldBlur("password")}
                placeholder="Enter password"
                className={getInputClassName(
                  "password",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {shouldShowError("password") && (
              <p className="mt-1 text-xs text-red-500">Password is required</p>
            )}
          </div>

          {/* Confirm Password with toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                onBlur={() => handleFieldBlur("confirmPassword")}
                placeholder="Confirm password"
                className={getInputClassName(
                  "confirmPassword",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10",
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Show both password match error and required error */}
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
            {shouldShowError("confirmPassword") && !passwordError && (
              <p className="mt-1 text-xs text-red-500">
                Please confirm your password
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <ul className="list-disc pl-5 space-y-1">
            <li>Username must be unique (will be checked on submit).</li>
            <li>Password must be at least 6 characters.</li>
            <li>
              Use a mix of letters, numbers, and symbols for a strong password.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 3 – EDUCATIONAL INFORMATION
   ============================================================== */
const EducationalInformationStep = ({
  formData,
  setFormData,
  dropdowns,
  shouldShowError,
  getInputClassName,
  handleFieldBlur,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const getInstructions = (id) => {
    const map = {
      "1": {
        title: "High School Graduate Certificate Requirements",
        content: [
          "• 8th Grade Certificate",
          "• Grade 9-12 Transcript",
          "• 12th Grade National Exam Certificate",
          "• Combine multiple PDFs into one file",
        ],
      },
    };
    return map[id] || null;
  };
  const currentInstructions = getInstructions(formData.schoolBackgroundId);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, document: file }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Educational Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Provide details about your educational background.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          3. EDUCATIONAL INFORMATION
        </h3>

        {/* School Background - Required */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
            Select School Background *
          </label>
          <select
            name="schoolBackgroundId"
            value={formData.schoolBackgroundId}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("schoolBackgroundId")}
            className={getInputClassName(
              "schoolBackgroundId",
              "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2",
            )}
          >
            <option value="">Choose Background</option>
            {dropdowns.schoolBackgrounds.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {shouldShowError("schoolBackgroundId") && (
            <p className="mt-1 text-xs text-red-500">
              Please select a school background
            </p>
          )}
        </div>

        {/* Grade 12 Result - Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Grade 12 Result (Optional)
          </label>
          <div className="w-[25%]">
            <input
              type="number"
              name="grade12Result"
              value={formData.grade12Result}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              max="4.0"
            />
          </div>
        </div>

        {/* Is Transfer - Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Is the Student a Transfer? (Optional)
          </label>
          <div className="flex gap-x-10">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isTransfer"
                value="true"
                checked={formData.isTransfer === true}
                onChange={handleInputChange}
                className="mr-2 accent-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isTransfer"
                value="false"
                checked={formData.isTransfer === false}
                onChange={handleInputChange}
                className="mr-2 accent-blue-600"
              />
              No
            </label>
          </div>
        </div>

        {/* Document Upload - Optional */}
        <section className="border-2 border-blue-200 rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 mb-6">
          <div className="border-t-2 border-blue-400 pt-4 flex flex-col items-center">
            <img
              src="/assets/certificate.png"
              alt="Certificate"
              className="w-24 h-24 mb-4"
            />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Upload Your Document (Optional)
            </h3>

            {currentInstructions ? (
              <div className="text-sm font-medium text-gray-600 mb-4 text-center">
                <span>Upload below:</span>{" "}
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Read Instructions
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Select school background first.
              </p>
            )}

            {currentInstructions && showInstructions && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg w-full">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    {currentInstructions.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {currentInstructions.content.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <input
              id="upload-certificate"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="upload-certificate"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow cursor-pointer hover:from-blue-700 hover:to-blue-800 transition"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Upload Document</span>
            </label>

            {formData.document && (
              <div className="mt-3 relative inline-block">
                {formData.document.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(formData.document)}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-32 h-32 bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-md flex flex-col items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-600 dark:text-red-400 mb-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      PDF
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, document: null }))
                  }
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Required Dropdowns */}
        {[
          {
            label: "Select Department *",
            name: "departmentEnrolledId",
            options: dropdowns.departments,
            placeholder: "Select Department", // NEW: Custom placeholder
          },
          {
            label: "Select Student's Status *",
            name: "studentRecentStatusId",
            options: dropdowns.studentStatus,
            placeholder: "Select the Student Status",
          },
          {
            label: "Select Program Modality *",
            name: "programModalityCode",
            options: dropdowns.programModalities,
            placeholder: "Select Program Modality",
          },
          // NEW: Add Batch dropdown here
          {
            label: "Select Batch at the Time of Registration *",
            name: "batchId",
            options: dropdowns.batches,
            placeholder: "Select Batch",
          },
          {
            label: "Select student's Recent Batch Class Year And Semester *",
            name: "batchClassYearSemesterId",
            options: dropdowns.batchClassSemsterYear,
            placeholder: "Select Batch-ClassYear-Semester",
          },
        ].map((field) => (
          <div key={field.name} className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
              {field.label}
            </label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur(field.name)}
              className={getInputClassName(
                field.name,
                "w-full appearance-none bg-white dark:bg-black border rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2",
              )}
            >
              <option value="">{field.placeholder}</option>{" "}
              {/* Use custom placeholder */}
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {shouldShowError(field.name) && (
              <p className="mt-1 text-xs text-red-500">
                Please select{" "}
                {field.label
                  .replace("Select ", "")
                  .replace(" *", "")
                  .toLowerCase()}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 4 – REVIEW & SUBMIT
   ============================================================== */
const ReviewSubmitStep = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  shouldShowError,
  getInputClassName,
  handleFieldBlur,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Review & Submit
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Verify your information and submit the registration.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg text-center font-semibold text-gray-800 dark:text-white mb-4">
          Application Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">
              Name: {formData.firstName} {formData.middleName}{" "}
              {formData.lastName}
            </span>
          </div>
          <div>
            <span className="font-medium">User Name:</span> {formData.username}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {formData.phoneNo}
          </div>
          <div>
            <span className="font-medium">Password:</span> {formData.password}
          </div>

          <div>
            <span className="font-medium">Email:</span> {formData.email}
          </div>
          <div className="col-span-2">
            {formData.prevPhoto && (
              <img
                src={formData.prevPhoto}
                alt="Student"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            )}
          </div>
        </div>
      </section>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Date of Enrollment:
          </label>
          <div className="space-y-4">
            {/* Ethiopian Calendar - Optional */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Ethiopian Calendar (E.C) - Optional
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="dateEnrolledDateEC"
                  placeholder="Date"
                  value={formData.dateEnrolledDateEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="dateEnrolledMonthEC"
                  placeholder="Month"
                  value={formData.dateEnrolledMonthEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="dateEnrolledYearEC"
                  placeholder="Year"
                  value={formData.dateEnrolledYearEC}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Gregorian Calendar - Required */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Gregorian Calendar (G.C) *
              </label>
              <input
                type="date"
                name="dateEnrolledGC"
                value={formData.dateEnrolledGC}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("dateEnrolledGC")}
                className={getInputClassName(
                  "dateEnrolledGC",
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
                )}
              />
              {shouldShowError("dateEnrolledGC") && (
                <p className="mt-1 text-xs text-red-500">
                  Enrollment date is required
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Remarks - Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Enter a few remarks about this registration (Optional)
          </label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleInputChange}
            placeholder="Enter remarks about the student..."
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-6">
          Are you sure the information of the student is accurate?
        </p>

        <form onSubmit={handleSubmit} className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit Registration Form"
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

/* ==============================================================
   PROGRESS INDICATOR
   ============================================================== */
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    "Personal Information",
    "Account Creation",
    "Family Background",
    "Educational Information",
    "Review & Submit",
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 dark:text-gray-300"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-2 text-sm hidden md:inline ${
                i + 1 <= currentStep
                  ? "text-blue-600 font-medium"
                  : "text-gray-500 dark:text-gray-100"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-2 ${
                  i + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 dark:text-gray-300">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

/* ==============================================================
   MAIN COMPONENT – AddStudent
   ============================================================== */
const AddStudent = () => {
  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const [touchedFields, setTouchedFields] = useState({}); // Track which fields have been touched

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("registrarRegistrationFormData");
    return saved
      ? JSON.parse(saved)
      : {
          // Personal Info (English)
          firstName: "", // maps to firstNameENG
          middleName: "", // maps to fatherNameENG
          lastName: "", // maps to grandfatherNameENG

          // Personal Info (Amharic)
          firstNameAMH: "", // maps to firstNameAMH
          middleNameAMH: "", // maps to fatherNameAMH
          lastNameAMH: "", // maps to grandfatherNameAMH

          sex: "",
          age: "", // Remove asterisk from UI (optional)
          impairmentCode: "",
          studentPhoto: null,
          prevPhoto: null,

          // Dates
          birthDateEC: "",
          birthMonthEC: "",
          birthYearEC: "",
          dateEnrolledDateEC: "",
          dateEnrolledMonthEC: "",
          dateEnrolledYearEC: "",
          dateEnrolledGC: "",
          birthDateGC: "",

          // Place of Birth (ALL required - add asterisks)
          placeOfBirthRegionCode: "",
          placeOfBirthZoneCode: "",
          placeOfBirthWoredaCode: "",

          // Current Address (ALL required - add asterisks)
          currentAddressRegionCode: "",
          currentAddressZoneCode: "",
          currentAddressWoredaCode: "",

          // Contact
          email: "", // Optional - remove any asterisk
          phoneNo: "", // Required - ensure asterisk

          // Account
          username: "",
          password: "",
          confirmPassword: "",

          // Emergency Contact (ALL required except relation)
          emergencyFullName: "",
          emergencyFullNameAMH: "",
          contactPersonRelation: "", // Optional
          contactPersonPhoneNumber: "", // Required - add asterisk

          // Academic Required
          studentRecentStatusId: "", // Required - add asterisk
          batchClassYearSemesterId: "", // Required - REMOVE HARDCODED "13"
          batchId: "", // NEW: Batch ID
          schoolBackgroundId: "", // Required
          departmentEnrolledId: "", // Required
          programModalityCode: "", // Required

          // Academic Optional
          isTransfer: "",
          exitExamUserID: "",
          exitExamScore: "",
          hasPassedExitExam: "",
          grade12Result: "",
          remark: "",
          document: null,
        };
  });

  useEffect(() => {
    localStorage.setItem(
      "registrarRegistrationFormData",
      JSON.stringify(formData),
    );
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(
      "registrarRegistrationCurrentStep",
      currentStep.toString(),
    );
  }, [currentStep]);

  useEffect(() => {
    const saved = localStorage.getItem("registrarRegistrationCurrentStep");
    if (saved) setCurrentStep(parseInt(saved, 10));
  }, []);

  const [dropdowns, setDropdowns] = useState({
    departments: [],
    impairments: [],
    studentStatus: [],
    // semesters: [],
    schoolBackgrounds: [],
    programModalities: [],
    // classYears: [],
    regions: [],
    birthZones: [],
    birthWoredas: [],
    currentZones: [],
    currentWoredas: [],
    batchClassSemsterYear: [],
    batches: [], // NEW: Add batches array
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [
          departments,
          impairments,
          studentStatus,
          // semesters,
          schoolBackgrounds,
          programModalities,
          regions,
          batchClassSemsterYear,
          lookupsData, // NEW: Add this to get batches

          // classYears,
        ] = await Promise.all([
          apiService.get(endPoints.departments),
          apiService.get(endPoints.impairments),

          apiService.get(endPoints.studentStatus),
          // apiService.get(endPoints.semesters),
          apiService.get(endPoints.schoolBackgrounds),
          apiService.get(endPoints.programModalities),
          apiService.get(endPoints.regions),
          apiService.get(endPoints.batchClassSemsterYear),
          apiService.get(endPoints.lookupsDropdown), // NEW: Fetch lookups data

          // apiService.get(endPoints.classYears),
        ]);

        setDropdowns({
          departments: (departments || []).map((d) => ({
            value: d.dptID,
            label: d.deptName,
          })),
          batchClassSemsterYear: (batchClassSemsterYear || []).map((i) => ({
            value: i.bcsyId,
            label: i.name,
          })),
          batches: (lookupsData?.batches || []).map((batch) => ({
            // NEW: Map batches
            value: batch.id,
            label: batch.name,
          })),
          impairments: (impairments || [])
            .map((i) => ({
              value: i?.impairmentCode ?? i?.disabilityCode,
              label: i?.impairment ?? i?.disability,
            }))
            .filter((o) => o.value && o.label),
          studentStatus: (studentStatus || []).map((s) => ({
            value: s.id,
            label: s.statusName,
          })),
          // semesters: (semesters || []).map((s) => ({
          //   value: s.academicPeriodCode,
          //   label: s.academicPeriod,
          // })),
          schoolBackgrounds: (schoolBackgrounds || []).map((b) => ({
            value: b.id,
            label: b.background,
          })),
          programModalities: (programModalities || []).map((m) => ({
            value: m.modalityCode,
            label: m.modality,
          })),
          // classYears: (classYears || []).map((y) => ({
          //   value: y.id,
          //   label: y.classYear,
          // })),
          regions: (regions || []).map((r) => ({
            value: r.regionCode,
            label: r.region,
          })),
          birthZones: [],
          birthWoredas: [],
          currentZones: [],
          currentWoredas: [],
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Check if current step has all required fields filled
  const isStepValid = () => {
    const requiredFields = getRequiredFieldsForStep(currentStep);

    for (const field of requiredFields) {
      // Special handling for confirmPassword - check if it matches password
      if (field === "confirmPassword") {
        if (
          formData.password !== formData.confirmPassword ||
          isFieldEmpty(formData.confirmPassword)
        ) {
          return false;
        }
        continue;
      }

      if (isFieldEmpty(formData[field])) {
        return false;
      }
    }

    // Additional validation for Step 2: password length
    if (currentStep === 2) {
      if (formData.password && formData.password.length < 6) {
        return false;
      }
    }

    return true;
  };

  // Handle field blur to mark as touched
  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Check if a field should show error (required, touched, and empty)
  const shouldShowError = (fieldName) => {
    const requiredFields = getRequiredFieldsForStep(currentStep);
    return (
      requiredFields.includes(fieldName) &&
      touchedFields[fieldName] &&
      isFieldEmpty(formData[fieldName])
    );
  };

  // Get input className based on validation state
  const getInputClassName = (fieldName, baseClasses = "") => {
    const isError = shouldShowError(fieldName);
    return `${baseClasses} ${isError ? "border-red-500 focus:ring-red-500 dark:border-red-500" : "border-gray-300 focus:ring-blue-500"}`;
  };

  const fetchZonesByRegion = async (regionCode, target) => {
    try {
      const zones = await apiService.get(
        `${endPoints.zonesByRegion}/${regionCode}`,
      );
      setDropdowns((prev) => ({
        ...prev,
        ...(target === "birth"
          ? {
              birthZones: (zones || []).map((z) => ({
                value: z.zoneCode,
                label: z.zone,
              })),
              birthWoredas: [],
            }
          : {
              currentZones: (zones || []).map((z) => ({
                value: z.zoneCode,
                label: z.zone,
              })),
              currentWoredas: [],
            }),
      }));
    } catch {
      setDropdowns((prev) => ({
        ...prev,
        ...(target === "birth"
          ? { birthZones: [], birthWoredas: [] }
          : { currentZones: [], currentWoredas: [] }),
      }));
    }
  };

  const fetchWoredasByZone = async (zoneCode, target) => {
    try {
      const woredas = await apiService.get(
        `${endPoints.woredasByZone}/${zoneCode}`,
      );
      setDropdowns((prev) => ({
        ...prev,
        ...(target === "birth"
          ? {
              birthWoredas: (woredas || []).map((w) => ({
                value: w.woredaCode,
                label: w.woreda,
              })),
            }
          : {
              currentWoredas: (woredas || []).map((w) => ({
                value: w.woredaCode,
                label: w.woreda,
              })),
            }),
      }));
    } catch {
      setDropdowns((prev) => ({
        ...prev,
        ...(target === "birth" ? { birthWoredas: [] } : { currentWoredas: [] }),
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");

    const form = new FormData();

    const nullIfEmpty = (v) =>
      v === undefined || v === null || String(v).trim() === "" ? null : v;

    const intOrNull = (v) =>
      Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : null;

    const floatOrNull = (v) =>
      !isNaN(parseFloat(v)) && isFinite(v) ? parseFloat(v) : null;

    const boolOrNull = (v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      return null;
    };

    const dateOrNull = (y, m, d) => {
      if (y && m && d) {
        // Format as YYYY-MM-DD
        const year = String(y).padStart(4, "0");
        const month = String(m).padStart(2, "0");
        const day = String(d).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return null;
    };

    // Map marital status from frontend display to backend enum
    const mapMaritalStatus = (status) => {
      const statusMap = {
        Single: "SINGLE",
        Married: "MARRIED",
        Divorced: "DIVORCED",
        Separated: "WIDOWED", // Map "Separated" to "WIDOWED" as per backend
      };
      return statusMap[status] || null;
    };

    // Determine document status based on whether document is uploaded
    const documentStatus = data.document ? "COMPLETE" : "INCOMPLETE";

    const jsonBody = {
      // User Credentials
      username: nullIfEmpty(data.username),
      password: nullIfEmpty(data.password),

      // Personal Information - English
      firstNameENG: nullIfEmpty(data.firstName),
      fatherNameENG: nullIfEmpty(data.middleName),
      grandfatherNameENG: nullIfEmpty(data.lastName),

      // Personal Information - Amharic
      firstNameAMH: nullIfEmpty(data.firstNameAMH),
      fatherNameAMH: nullIfEmpty(data.middleNameAMH),
      grandfatherNameAMH: nullIfEmpty(data.lastNameAMH),

      // Demographic
      gender:
        data.sex === "Male" ? "MALE" : data.sex === "Female" ? "FEMALE" : null,
      age: intOrNull(data.age),
      phoneNumber: nullIfEmpty(data.phoneNo),

      // Date of Birth
      dateOfBirthEC: dateOrNull(
        data.birthYearEC,
        data.birthMonthEC,
        data.birthDateEC,
      ),
      dateOfBirthGC: nullIfEmpty(data.birthDateGC),

      // Place of Birth
      placeOfBirthWoredaCode: nullIfEmpty(data.placeOfBirthWoredaCode),
      placeOfBirthZoneCode: nullIfEmpty(data.placeOfBirthZoneCode),
      placeOfBirthRegionCode: nullIfEmpty(data.placeOfBirthRegionCode),

      // Current Address
      currentAddressWoredaCode: nullIfEmpty(data.currentAddressWoredaCode),
      currentAddressZoneCode: nullIfEmpty(data.currentAddressZoneCode),
      currentAddressRegionCode: nullIfEmpty(data.currentAddressRegionCode),

      // Contact
      email: nullIfEmpty(data.email),

      // Marital & Background
      maritalStatus: mapMaritalStatus(data.maritalStatus),
      impairmentCode: nullIfEmpty(data.impairmentCode),
      schoolBackgroundId: intOrNull(data.schoolBackgroundId),

      // Emergency Contact
      contactPersonFullNameENG: data.emergencyFullName,
      contactPersonFullNameAMH: data.emergencyFullNameAMH,
      contactPersonPhoneNumber: nullIfEmpty(data.contactPersonPhoneNumber),
      contactPersonRelation: nullIfEmpty(data.contactPersonRelation),

      // Academic Dates
      dateEnrolledEC: dateOrNull(
        data.dateEnrolledYearEC,
        data.dateEnrolledMonthEC,
        data.dateEnrolledDateEC,
      ),
      dateEnrolledGC: nullIfEmpty(data.dateEnrolledGC),

      // Academic Required
      batchId: intOrNull(data.batchId), // NEW: Add batchId
      batchClassYearSemesterId: intOrNull(data.batchClassYearSemesterId),
      studentRecentStatusId: intOrNull(data.studentRecentStatusId),
      departmentEnrolledId: intOrNull(data.departmentEnrolledId),
      programModalityCode: nullIfEmpty(data.programModalityCode),

      // Academic Optional
      isTransfer: boolOrNull(data.isTransfer),
      exitExamUserID: nullIfEmpty(data.exitExamUserID),
      exitExamScore: floatOrNull(data.exitExamScore),
      isStudentPassExitExam: boolOrNull(data.hasPassedExitExam),
      grade12Result: floatOrNull(data.grade12Result),
      remark: nullIfEmpty(data.remark),

      // Document Status
      documentStatus: documentStatus,
    };

    // Remove null values
    const cleaned = Object.fromEntries(
      Object.entries(jsonBody).filter(
        ([_, v]) => v !== null && v !== undefined,
      ),
    );

    // Add the JSON data to form
    form.append(
      "data",
      new Blob([JSON.stringify(cleaned)], { type: "application/json" }),
    );

    // Add files if they exist
    if (data.studentPhoto && data.studentPhoto instanceof File) {
      // Check file size (2MB limit)
      if (data.studentPhoto.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Student photo must be less than 2MB",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      form.append("studentPhoto", data.studentPhoto);
    }

    if (data.document && data.document instanceof File) {
      // Check file size (10MB limit)
      if (data.document.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Document must be less than 10MB",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      form.append("document", data.document);
    }

    try {
      console.log("Submitting form data:", cleaned);

      const resp = await apiService.post(
        endPoints.registrarApplicantRegister,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            requiresAuth: true,
          },
        },
      );

      // Handle successful response
      if (resp) {
        // Show success message with student details
        toast({
          title: "✅ Success!",
          description: (
            <div className="mt-2">
              <p className="font-semibold">
                {resp.message + " with ID: " + resp.username ||
                  "Student registered successfully."}
              </p>
            </div>
          ),
          variant: "default",
          duration: 5000,
        });

        // Clear ALL localStorage items
        localStorage.removeItem("registrarRegistrationFormData");
        localStorage.removeItem("registrarRegistrationCurrentStep");

        // Reset form state for fresh start
        setFormData({
          // Personal Info (English)
          firstName: "",
          middleName: "",
          lastName: "",
          // Personal Info (Amharic)
          firstNameAMH: "",
          middleNameAMH: "",
          lastNameAMH: "",
          // Mother's Info (English)
          sex: "",
          age: "",
          impairmentCode: "",
          studentPhoto: null,
          prevPhoto: null,
          // Dates
          birthDateEC: "",
          birthMonthEC: "",
          birthYearEC: "",
          dateEnrolledDateEC: "",
          dateEnrolledMonthEC: "",
          dateEnrolledYearEC: "",
          dateEnrolledGC: "",
          birthDateGC: "",
          // Place of Birth
          placeOfBirthRegionCode: "",
          placeOfBirthZoneCode: "",
          placeOfBirthWoredaCode: "",
          // Current Address
          currentAddressRegionCode: "",
          currentAddressZoneCode: "",
          currentAddressWoredaCode: "",
          // Contact
          email: "",
          phoneNo: "",
          // Account
          username: "",
          password: "",
          confirmPassword: "",
          // Emergency Contact
          emergencyFullName: "",
          emergencyFullNameAMH: "",
          contactPersonRelation: "",
          contactPersonPhoneNumber: "",
          // Academic Required
          studentRecentStatusId: "",
          batchClassYearSemesterId: "",
          batchId: "", // NEW: Reset batchId
          schoolBackgroundId: "",
          departmentEnrolledId: "",
          programModalityCode: "",
          // Academic Optional
          isTransfer: "",
          exitExamUserID: "",
          exitExamScore: "",
          hasPassedExitExam: "",
          grade12Result: "",
          remark: "",
          document: null,
        });

        // Reset touched fields
        setTouchedFields({});

        // Redirect to step 1 after a short delay to show the success message
        setTimeout(() => {
          setCurrentStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different error responses
      let errorMessage = "An error occurred during registration.";

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        // Handle different status codes
        switch (status) {
          case 400:
            errorMessage =
              errorData.error ||
              "Bad request. Please check all required fields.";
            break;
          case 409:
            if (errorData.error?.includes("phone")) {
              errorMessage =
                "Phone number already exists. Please use a different phone number.";
            } else if (errorData.error?.includes("exit exam")) {
              errorMessage =
                "Exit exam ID already exists. Please check and try again.";
            } else {
              errorMessage = errorData.error || "Duplicate entry found.";
            }
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              errorData.error || `Error ${status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setErrorMessage(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // THIS IS THE ONLY CHANGE: ALWAYS ALLOW NEXT
  // const isStepValid = () => true;

  const renderStep = () => {
    const commonProps = {
      formData,
      setFormData,
      shouldShowError,
      getInputClassName,
      handleFieldBlur,
    };

    switch (currentStep) {
      case 1:
        return (
          <PersonalInformationStep
            {...commonProps}
            dropdowns={dropdowns}
            fetchZonesByRegion={fetchZonesByRegion}
            fetchWoredasByZone={fetchWoredasByZone}
          />
        );
      case 2:
        return <AccountCreationStep {...commonProps} />;
      case 3:
        return (
          <EducationalInformationStep {...commonProps} dropdowns={dropdowns} />
        );
      case 4:
        return (
          <ReviewSubmitStep
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            shouldShowError={shouldShowError}
            getInputClassName={getInputClassName}
            handleFieldBlur={handleFieldBlur}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 px-6 md:px-16 lg:px-16 ">
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Add New Student
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
            LIFE HISTORY FORM, UNDERGRADUATE PROGRAM
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Register a student who is applying on-site.
          </p>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {renderStep()}

        {currentStep <= totalSteps && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              Previous
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  localStorage.setItem(
                    "registrarRegistrationFormData",
                    JSON.stringify(formData),
                  );
                  toast({
                    title: "Saved",
                    description: "Progress saved locally.",
                  });
                }}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition"
              >
                Save Progress
              </button>

              {currentStep < totalSteps && (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 rounded-lg font-medium transition bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;
