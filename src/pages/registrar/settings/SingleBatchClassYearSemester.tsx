// src/pages/admin/SingleBatchClassYearSemester.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaGraduationCap,
  FaBook,
  FaHashtag,
} from "react-icons/fa";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

interface BCSY {
  id: number;
  name: string;
  batchId: number;
  classYearId: number;
  semesterId: string;
  entryYearId: string;
  classStartGC?: string;
  classStartEC?: string;
  classEndGC?: string;
  classEndEC?: string;
  gradingSystemId?: number;
}

const SingleBatchClassYearSemester = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<BCSY | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For inline editing (optional – can be modal instead)
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<BCSY>>({});

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError("Invalid ID");
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        const res = await apiService.get<any>(
          `${endPoints.BatchClassYearSemesters}/${id}`
        );

        const data: BCSY = {
          id: res.bcysId ?? res.id,
          name:
            res.name || `${res.batchId}-${res.classYearId}-${res.semesterId}`,
          batchId: res.batchId,
          classYearId: res.classYearId,
          semesterId: res.semesterId,
          entryYearId: res.entryYearId,
          classStartGC: res.classStartGC,
          classStartEC: res.classStartEC,
          classEndGC: res.classEndGC,
          classEndEC: res.classEndEC,
          gradingSystemId: res.gradingSystemId,
        };

        setRecord(data);
        setForm(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Could not load record");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!record || !window.confirm("Delete this BCSY record permanently?"))
      return;

    try {
      await apiService.delete(
        `${endPoints.BatchClassYearSemesters}/${record.id}`
      );
      navigate("/bcsy"); // or "/admin/bcsy" — adjust to your route
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!record) return;

    try {
      const payload: any = {
        batchId: Number(form.batchId),
        classYearId: Number(form.classYearId),
        semesterId: form.semesterId?.trim(),
        entryYearId: form.entryYearId?.trim(),
      };

      if (form.classStartGC) payload.classStartGC = form.classStartGC;
      if (form.classStartEC) payload.classStartEC = form.classStartEC;
      if (form.classEndGC) payload.classEndGC = form.classEndGC;
      if (form.classEndEC) payload.classEndEC = form.classEndEC;
      if (form.gradingSystemId)
        payload.gradingSystemId = Number(form.gradingSystemId);

      const res = await apiService.put(
        `${endPoints.BatchClassYearSemesters}/${record.id}`,
        payload
      );

      // Update local state
      setRecord((prev) => ({
        ...prev!,
        ...res,
        name: res.name || prev!.name,
      }));

      setIsEditing(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 dark:text-gray-300">
        Loading record...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-xl gap-4">
        <div>{error || "Record not found"}</div>
        <button
          onClick={() => navigate("/bcsy")}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-5 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaArrowLeft className="text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {record.name}
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow transition"
            >
              <FaEdit /> {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-7">
          {/* Left – Core Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
              <FaHashtag /> Record Details
            </h2>

            <dl className="space-y-4 text-[15px]">
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  ID
                </dt>
                <dd className="font-mono font-bold">#{record.id}</dd>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  Batch
                </dt>
                <dd className="font-semibold">Batch {record.batchId}</dd>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  Class / Year
                </dt>
                <dd>Year {record.classYearId}</dd>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  Semester
                </dt>
                <dd className="font-semibold">{record.semesterId}</dd>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  Entry Year
                </dt>
                <dd>{record.entryYearId || "—"}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  Grading System
                </dt>
                <dd>
                  {record.gradingSystemId
                    ? `ID ${record.gradingSystemId}`
                    : "Not assigned"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Right – Dates & Actions Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-7 border border-indigo-100 dark:border-indigo-900/30">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
              <FaCalendarAlt /> Academic Period
            </h2>

            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Gregorian Calendar
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span>Start:</span>
                    <span className="font-medium">
                      {record.classStartGC || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>End:</span>
                    <span className="font-medium">
                      {record.classEndGC || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Ethiopian Calendar (EC)
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span>Start:</span>
                    <span className="font-medium">
                      {record.classStartEC || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>End:</span>
                    <span className="font-medium">
                      {record.classEndEC || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 pt-6 border-t dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow transition"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional: show related data in future (students, courses, results summary, etc.) */}
        {/* <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Related Students / Results</h3>
          <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
        </div> */}
      </div>
    </div>
  );
};

export default SingleBatchClassYearSemester;
