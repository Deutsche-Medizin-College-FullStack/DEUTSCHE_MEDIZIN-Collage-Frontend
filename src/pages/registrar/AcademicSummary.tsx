import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/components/api/apiClient"; // Used if fallback needed
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

import GradeReport from "./components/AcademicSummary/GradeReport";
import ErrorCard from "./components/AcademicSummary/ErrorCard";
import type { AcademicSummaryResult } from "./components/AcademicSummary/types";
import { generateGradeReportPDF } from "./components/AcademicSummary/PDFGenerator";
import { generateGradeReportExcel } from "./components/AcademicSummary/ExcelGenerator";

interface DepartmentLookup {
  id: number;
  name: string;
  programLevelId: string;
  programModalityId: string;
}

interface BcysLookup {
  id: number;
  name: string;
}

const AcademicSummary = () => {
  const [departments, setDepartments] = useState<DepartmentLookup[]>([]);
  const [bcysList, setBcysList] = useState<BcysLookup[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    "",
  );
  const [selectedBcysIds, setSelectedBcysIds] = useState<number[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AcademicSummaryResult[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoadingLookups(true);
        const response = await apiService.get(endPoints.lookupsDropdown);
        if (response) {
          setDepartments(response.departments || []);
          setBcysList(response.batchClassYearSemesters || []);
        }
      } catch (error) {
        console.error("Failed to load dropdown options", error);
        setErrorMsg("Failed to load form options. Please try again.");
      } finally {
        setLoadingLookups(false);
      }
    };
    fetchLookups();
  }, []);

  const handleDownloadPDF = () => {
    const currentResult = results[activeTab];
    if (currentResult && currentResult.success && currentResult.summary) {
      generateGradeReportPDF({ summary: currentResult.summary });
    } else {
      // Optionally show an error toast or notification
      console.error("No valid summary to download");
      setErrorMsg("Cannot download PDF: No valid summary data available.");
    }
  };

  const handleDownloadExcel = async () => {
    const currentResult = results[activeTab];
    if (currentResult && currentResult.success && currentResult.summary) {
      await generateGradeReportExcel({ summary: currentResult.summary });
    } else {
      console.error("No valid summary to download");
      setErrorMsg("Cannot download Excel: No valid summary data available.");
    }
  };

  const handleToggleBcys = (id: number) => {
    setSelectedBcysIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleGenerate = async () => {
    if (selectedDepartmentId === "" || selectedBcysIds.length === 0) return;

    const requestPayload = selectedBcysIds.map((bcysId) => ({
      departmentId: Number(selectedDepartmentId),
      bcysId,
    }));

    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setResults([]);

      const response = await apiService.post(
        endPoints.academicSummaryBulk,
        requestPayload,
      );

      if (response && response.results) {
        setResults(response.results);
        setActiveTab(0);
      } else {
        setErrorMsg("Unexpected response format from server.");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      setErrorMsg(
        error?.response?.data?.error ||
          "Failed to generate academic summaries.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Bulk Academic Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and print academic summary reports for multiple classes.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Filter Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        {loadingLookups ? (
          <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin h-6 w-6 mr-2" />
            Loading options...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Department <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setSelectedBcysIds([]); // Reset BCYS when department changes
                  }}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.programLevelId} -{" "}
                      {dept.programModalityId})
                    </option>
                  ))}
                </select>
              </div>

              {/* BCYS Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Batch-ClassYear-Semester (BCYS){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  {selectedDepartmentId && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {selectedBcysIds.length} / {bcysList.length} selected
                    </span>
                  )}
                </div>

                {!selectedDepartmentId ? (
                  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-dashed rounded-md p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Please select a department first to enable BCYS selection.
                  </div>
                ) : (
                  <>
                    {/* Select/Deselect All Buttons */}
                    {bcysList.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBcysIds(bcysList.map((b) => b.id))
                          }
                          className="text-xs px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBcysIds([])}
                          className="text-xs px-3 py-1 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          Deselect All
                        </button>
                      </div>
                    )}

                    {/* BCYS Checkbox List */}
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-y-auto bg-white dark:bg-gray-700 p-2">
                      {bcysList.map((bcys) => (
                        <label
                          key={bcys.id}
                          className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600"
                            checked={selectedBcysIds.includes(bcys.id)}
                            onChange={() => handleToggleBcys(bcys.id)}
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {bcys.name}
                          </span>
                        </label>
                      ))}
                      {bcysList.length === 0 && (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No BCYS available.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Generate Button Area with selected count summary */}
            <div className="mt-6 flex justify-between items-center">
              {selectedDepartmentId && selectedBcysIds.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{selectedBcysIds.length}</span>{" "}
                  class(es) selected for generation
                </div>
              )}
              <div
                className={
                  !selectedDepartmentId || selectedBcysIds.length === 0
                    ? "w-full flex justify-end"
                    : ""
                }
              >
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    selectedDepartmentId === "" ||
                    selectedBcysIds.length === 0
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    `Generate Summary ${selectedBcysIds.length > 0 ? `(${selectedBcysIds.length})` : ""}`
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Generated Reports
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadPDF}
                disabled={
                  !results[activeTab] ||
                  !results[activeTab].success ||
                  !results[activeTab].summary
                }
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownloadExcel}
                disabled={
                  !results[activeTab] ||
                  !results[activeTab].success ||
                  !results[activeTab].summary
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6 pb-px custom-scrollbar">
            {results.map((result, idx) => {
              const tabName =
                result.success && result.summary
                  ? result.summary.header.departmentBcysDisplay
                  : `Req: D${result.request.departmentId}/B${result.request.bcysId} (Failed)`;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === idx
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tabName}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="mt-4">
            {results[activeTab] &&
              (results[activeTab].success && results[activeTab].summary ? (
                <GradeReport summary={results[activeTab].summary!} />
              ) : (
                <ErrorCard
                  message={results[activeTab].error || "Unknown error occurred"}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSummary;
