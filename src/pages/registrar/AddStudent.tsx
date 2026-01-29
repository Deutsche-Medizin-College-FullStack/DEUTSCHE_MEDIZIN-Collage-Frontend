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
}) => {
  const [previews, setPreviews] = useState(
    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    className="mr-2"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Age: *
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
                      "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg"
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
            Place of Birth:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Region
              </label>
              <select
                name="placeOfBirthRegionCode"
                value={formData.placeOfBirthRegionCode}
                onChange={handleRegionChange}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose Region</option>
                {dropdowns.regions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Zone
              </label>
              <select
                name="placeOfBirthZoneCode"
                value={formData.placeOfBirthZoneCode}
                onChange={handleZoneChange}
                disabled={!formData.placeOfBirthRegionCode}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Choose Zone</option>
                {dropdowns.birthZones.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Woreda (Town)
              </label>
              <select
                name="placeOfBirthWoredaCode"
                value={formData.placeOfBirthWoredaCode}
                onChange={handleInputChange}
                disabled={!formData.placeOfBirthZoneCode}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Choose Woreda</option>
                {dropdowns.birthWoredas.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* CURRENT ADDRESS (Cascading) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Current Residential Address:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Region
              </label>
              <select
                name="currentAddressRegionCode"
                value={formData.currentAddressRegionCode}
                onChange={handleCurrentRegionChange}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose Region</option>
                {dropdowns.regions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Zone
              </label>
              <select
                name="currentAddressZoneCode"
                value={formData.currentAddressZoneCode}
                onChange={handleCurrentZoneChange}
                disabled={!formData.currentAddressRegionCode}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Choose Zone</option>
                {dropdowns.currentZones.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Woreda (Town)
              </label>
              <select
                name="currentAddressWoredaCode"
                value={formData.currentAddressWoredaCode}
                onChange={handleInputChange}
                disabled={!formData.currentAddressZoneCode}
                className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Choose Woreda</option>
                {dropdowns.currentWoredas.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MARITAL STATUS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Marital Status:
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
                  className="mr-2"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Contact Person in case of Emergency: (Optional)
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["emergencyfirstName", "emergencylastName"].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                    {field.includes("first") ? "First Name" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["emergencyfirstNameAMH", "emergencylastNameAMH"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                      {field.includes("first")
                        ? "First Name (AMH)"
                        : "Last Name (AMH)"}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  Relation
                </label>
                <input
                  type="text"
                  name="contactPersonRelation"
                  value={formData.contactPersonRelation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="contactPersonPhoneNumber"
                  value={formData.contactPersonPhoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* USER CONTACT */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            User Contact Information:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Email address
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
                Phone No.
              </label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 2 – ACCOUNT CREATION (NEW)
   ============================================================== */
const AccountCreationStep = ({ formData, setFormData }) => {
  const [passwordError, setPasswordError] = useState("");

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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
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
   STEP 3 – FAMILY BACKGROUND
   ============================================================== */
const FamilyBackgroundStep = ({ formData, setFormData }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Family Background
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Provide information about your parents.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          3. FAMILY BACKGROUND
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Mother's Full Name (English): *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["motherFirstName", "motherLastName"].map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  {field.includes("First") ? "First Name *" : "Last Name *"}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 mt-4">
            Mother's Full Name (Amharic): *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["motherFirstNameAMH", "motherLastNameAMH"].map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                  {field.includes("First") ? "First Name *" : "Last Name *"}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 4 – EDUCATIONAL INFORMATION
   ============================================================== */
const EducationalInformationStep = ({ formData, setFormData, dropdowns }) => {
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
          4. EDUCATIONAL INFORMATION
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
            Select School Background *
          </label>
          <select
            name="schoolBackgroundId"
            value={formData.schoolBackgroundId}
            onChange={handleInputChange}
            className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose Background</option>
            {dropdowns.schoolBackgrounds.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Is The Student A Transfer:
          </label>

          <div className="flex gap-x-10">
            {[true, false].map((s, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name="hasPassedExitExam"
                  value={s}
                  checked={formData.hasPassedExitExam == s} // fixed: should match the field name
                  onChange={handleInputChange}
                  className="mr-2"
                />
                {index == 0 ? "Passed Exit Exam" : "Failed Exit Exam"}
              </label>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Exit Exam Id{" "}
            </label>
            <div className=" w-[50%] ">
              <input
                type="text"
                name="exitExamId"
                value={formData.exitExamId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Exit Exam Score{" "}
            </label>
            <div className=" w-[50%] ">
              <input
                type="number"
                name="exitExamScore"
                value={formData.exitExamScore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Grade 12 Result{" "}
          </label>
          <div className=" w-[25%] ">
            <input
              type="number"
              name="grade12Result"
              value={formData.grade12Result}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Is The Student A Transfer:
          </label>

          <div className="flex gap-x-10">
            {[true, false].map((s, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name="isTransfer"
                  value={s}
                  checked={formData.isTransfer === s} // fixed: should match the field name
                  onChange={handleInputChange}
                  className="mr-2"
                />
                {index == 0 ? "is transfer" : "not transfer"}
              </label>
            ))}
          </div>
        </div>

        <section className="border-2 border-blue-200 rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 mb-6">
          <div className="border-t-2 border-blue-400 pt-4 flex flex-col items-center">
            <img
              src="/assets/certificate.png"
              alt="Certificate"
              className="w-24 h-24 mb-4"
            />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Upload Your Document
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
        {/* <div className="mb-6">
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
        </div> */}
        {[
          {
            label: "Select Department Your*",
            name: "departmentEnrolledId",
            options: dropdowns.departments,
          },
          {
            label: "Select Students Status",
            name: "studentRecentStatusId",
            options: dropdowns.studentStatus,
          },
          {
            label: "Select Program Modality *",
            name: "programModalityCode",
            options: dropdowns.programModalities,
          },
          {
            label: "Select Batch Class Year And Semester",
            name: "batchClassYearSemesterId",
            options: dropdowns.batchClassSemsterYear,
          },
          // {
          //   label: "Select Class Year *",
          //   name: "classYearId",
          //   options: dropdowns.classYears,
          // },
          // {
          //   label: "Select Semester *",
          //   name: "semesterCode",
          //   options: dropdowns.semesters,
          // },
        ].map((field) => (
          <div key={field.name} className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
              {field.label}
            </label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              className="w-full appearance-none bg-white dark:bg-black border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-800 dark:text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose {field.label.split(" ")[1]}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ==============================================================
   STEP 5 – REVIEW & SUBMIT
   ============================================================== */
const ReviewSubmitStep = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
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
        {/* <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          6. STATEMENT BY THE APPLICANT
        </h3> */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Date of Enrollment:
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Ethiopian Calendar (E.C)
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
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                Gregorian Calendar (G.C) *
              </label>
              {/* <input
                type="date"
                name="dateEnrolledGc"
                value={formData.dateEnrolledGc}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              /> */}
              <input
                type="date"
                name="dateEnrolledGC"
                value={formData.dateEnrolledGC}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Enter a few remark about this regestartion here{" "}
          </label>

          <textarea
            name="remark"
            value={formData.studentDescription}
            onChange={handleInputChange}
            placeholder="Enter remarks about the student..."
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-6">
          Are you sure this information of the students are accurate{" "}
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
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("registrarRegistrationFormData");
    return saved
      ? JSON.parse(saved)
      : {
          firstName: "",
          firstNameAMH: "",
          middleName: "",
          middleNameAMH: "",
          lastName: "",
          lastNameAMH: "",
          sex: "",
          age: "",
          impairmentCode: "",
          studentPhoto: null,
          prevPhoto: null,
          birthDateEC: "",
          birthMonthEC: "",
          birthYearEC: "",
          dateEnrolledDateEC: "",
          dateEnrolledMonthEC: "",
          dateEnrolledYearEC: "",
          dateEnrolledGC: "",
          birthDateGC: "",
          placeOfBirthRegionCode: "",
          placeOfBirthZoneCode: "",
          placeOfBirthWoredaCode: "",
          currentAddressRegionCode: "",
          currentAddressZoneCode: "",
          currentAddressWoredaCode: "",
          email: "",
          phoneNo: "",
          username: "",
          password: "",
          confirmPassword: "",
          motherFirstName: "",
          motherFirstNameAMH: "",
          motherLastName: "",
          motherLastNameAMH: "",
          emergencyfirstName: "",
          emergencylastName: "",
          emergencyfirstNameAMH: "",
          emergencylastNameAMH: "",
          contactPersonRelation: "",
          studentRecentStatusId: "",
          batchClassYearSemesterId: "",
          contactPersonPhoneNumber: "",
          schoolBackgroundId: "",
          document: null,
          departmentEnrolledId: "",
          remark: "",
          isTransfer: "",
          exitExamUserID: "",
          exitExamScore: "",
          hasPassedExitExam: "",
          grade12Result: "",
          programModalityCode: "",
          //  classYearId: "",
          // semesterCode: "",
        };
  });

  useEffect(() => {
    localStorage.setItem(
      "registrarRegistrationFormData",
      JSON.stringify(formData)
    );
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(
      "registrarRegistrationCurrentStep",
      currentStep.toString()
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

  const fetchZonesByRegion = async (regionCode, target) => {
    try {
      const zones = await apiService.get(
        `${endPoints.zonesByRegion}/${regionCode}`
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
        `${endPoints.woredasByZone}/${zoneCode}`
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
    //  const formDataObj = new FormData();

    setIsSubmitting(true);
    setErrorMessage("");

    const form = new FormData();

    const nullIfEmpty = (v) =>
      v === undefined || v === null || String(v).trim() === "" ? null : v;
    const intOrNull = (v) =>
      Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : null;
    const safeUpper = (v) => (v ? String(v).toUpperCase() : null);
    const dateOrNull = (y, m, d) => (y && m && d ? `${y}-${m}-${d}` : null);

    const jsonBody = {
      firstNameAMH: nullIfEmpty(data.firstNameAMH),
      firstNameENG: nullIfEmpty(data.firstName),
      fatherNameAMH: nullIfEmpty(data.middleNameAMH),
      fatherNameENG: nullIfEmpty(data.middleName),
      grandfatherNameAMH: nullIfEmpty(data.lastNameAMH),
      grandfatherNameENG: nullIfEmpty(data.lastName),
      motherNameAMH: nullIfEmpty(data.motherFirstNameAMH),
      motherNameENG: nullIfEmpty(data.motherFirstName),
      motherFatherNameAMH: nullIfEmpty(data.motherLastNameAMH),
      motherFatherNameENG: nullIfEmpty(data.motherLastName),
      gender: data.sex ? (data.sex === "Male" ? "MALE" : "FEMALE") : null,
      age: intOrNull(data.age),
      phoneNumber: nullIfEmpty(data.phoneNo),
      dateOfBirthEC: dateOrNull(
        data.birthYearEC,
        data.birthMonthEC,
        data.birthDateEC
      ),
      dateEnrolledEC: dateOrNull(
        data.dateEnrolledDateEC,
        data.dateEnrolledMonthEC,
        data.dateEnrolledYearEC
      ),
      dateEnrolledGC: nullIfEmpty(data.dateEnrolledGC),
      dateOfBirthGC: data.birthDateGC || null,
      placeOfBirthWoredaCode: nullIfEmpty(data.placeOfBirthWoredaCode),
      placeOfBirthZoneCode: nullIfEmpty(data.placeOfBirthZoneCode),
      placeOfBirthRegionCode: nullIfEmpty(data.placeOfBirthRegionCode),
      currentAddressWoredaCode: nullIfEmpty(data.currentAddressWoredaCode),
      currentAddressZoneCode: nullIfEmpty(data.currentAddressZoneCode),
      currentAddressRegionCode: nullIfEmpty(data.currentAddressRegionCode),
      email: nullIfEmpty(data.email),
      maritalStatus: safeUpper(data.maritalStatus),
      impairmentCode: nullIfEmpty(data.impairmentCode),
      schoolBackgroundId: intOrNull(data.schoolBackgroundId),
      contactPersonFirstNameAMH: nullIfEmpty(data.emergencyfirstNameAMH),
      contactPersonFirstNameENG: nullIfEmpty(data.emergencyfirstName),
      contactPersonLastNameAMH: nullIfEmpty(data.emergencylastNameAMH),
      contactPersonLastNameENG: nullIfEmpty(data.emergencylastName),
      contactPersonPhoneNumber: nullIfEmpty(data.contactPersonPhoneNumber),
      contactPersonRelation: nullIfEmpty(data.contactPersonRelation),
      batchClassYearSemesterId: "13",
      departmentEnrolledId: intOrNull(data.departmentEnrolledId),
      programModalityCode: nullIfEmpty(data.programModalityCode),
      //classYearId: intOrNull(data.classYearId),
      // semesterCode: nullIfEmpty(data.semesterCode),
      username: nullIfEmpty(data.username),
      password: nullIfEmpty(data.password),
      remark: nullIfEmpty(data.remark),
      studentRecentStatusId: nullIfEmpty(data.studentRecentStatusId),
      isTransfer: nullIfEmpty(data.isTransfer),
      exitExamUserID: nullIfEmpty(data.exitExamUserID),
      exitExamScore: nullIfEmpty(data.exitExamScore),
      hasPassedExitExam: nullIfEmpty(data.hasPassedExitExam),
      grade12Result: nullIfEmpty(data.grade12Result),
    };

    const cleaned = Object.fromEntries(
      Object.entries(jsonBody).filter(([_, v]) => v !== null)
    );
    // formDataObj.append(
    //   "data",
    //   new Blob([JSON.stringify(body)], { type: "application/json" })
    // );
    form.append(
      "data",
      new Blob([JSON.stringify(cleaned)], { type: "application/json" })
    );
    // if (formData.studentPhoto && formData.studentPhoto instanceof File) {
    //   formDataObj.append("studentPhoto", formData.studentPhoto);
    // }
    // if (data.studentPhoto) form.append("studentPhoto", data.studentPhoto);
    //       if (formData.document && formData.document instanceof File) {
    //     formDataObj.append("document", formData.document);
    //   }
    //if (data.document) form.append("document", data.document);

    try {
      console.log(form, cleaned);
      const resp = await apiService.post(
        endPoints.registrarApplicantRegister,
        form,
        {
          responseType: "blob",
          headers: {
            requiresAuth: true,
          },
        }
      );
      toast({
        title: "Success",
        description: "Student registered successfully.",
      });
      localStorage.removeItem("registrarRegistrationFormData");
      localStorage.removeItem("registrarRegistrationCurrentStep");
    } catch (err) {
      console.log(err);
      let msg = "An error occurred.";
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) msg = err.message;
      setErrorMessage(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // THIS IS THE ONLY CHANGE: ALWAYS ALLOW NEXT
  const isStepValid = () => true;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInformationStep
            formData={formData}
            setFormData={setFormData}
            dropdowns={dropdowns}
            fetchZonesByRegion={fetchZonesByRegion}
            fetchWoredasByZone={fetchWoredasByZone}
          />
        );
      case 2:
        return (
          <AccountCreationStep formData={formData} setFormData={setFormData} />
        );
      case 3:
        return (
          <FamilyBackgroundStep formData={formData} setFormData={setFormData} />
        );
      case 4:
        return (
          <EducationalInformationStep
            formData={formData}
            setFormData={setFormData}
            dropdowns={dropdowns}
          />
        );
      case 5:
        return (
          <ReviewSubmitStep
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
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
                    JSON.stringify(formData)
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
