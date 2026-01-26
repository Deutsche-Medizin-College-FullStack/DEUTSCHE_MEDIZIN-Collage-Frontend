// src/pages/admin/BatchClassYearSemesterEditor.tsx
import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTh,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import endPoints from "@/components/api/endPoints";
import apiService from "@/components/api/apiService";
import apiClient from "@/components/api/apiClient";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

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

interface BCSYForm {
  batchId: string;
  classYearId: string;
  semesterId: string;
  entryYearId: string;
  classStartGC: string;
  classStartEC: string;
  classEndGC: string;
  classEndEC: string;
  gradingSystemId: string;
}

// ────────────────────────────────────────────────
//  Main List Page
// ────────────────────────────────────────────────

const BatchClassYearSemesterEditor = () => {
  const [items, setItems] = useState<BCSY[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiService.get<any[]>(
          endPoints.BatchClassYearSemesters
        );

        const transformed = res.map((it: any) => ({
          id: it.bcysId ?? it.id,
          name: it.name || `${it.batchId}-${it.classYearId}-${it.semesterId}`,
          batchId: it.batchId,
          classYearId: it.classYearId,
          semesterId: it.semesterId,
          entryYearId: it.entryYearId,
          classStartGC: it.classStartGC,
          classStartEC: it.classStartEC,
          classEndGC: it.classEndGC,
          classEndEC: it.classEndEC,
          gradingSystemId: it.gradingSystemId,
        }));

        setItems(transformed);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load BCSY combinations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const Instructions = () => (
    <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-indigo-200 dark:border-indigo-800/50 shadow-lg">
      <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-5 flex items-center gap-3">
        <span className="text-4xl">📅</span> Batch–Class–Year–Semester
        Management
      </h3>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            1
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">Purpose:</strong>
            <br />
            Link a batch to a specific class/year and semester period.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            2
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">
              Important notes:
            </strong>
            <br />• System auto-generates{" "}
            <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              name
            </code>
            <br />• Use <code>YYYY/YY</code> format for entry year (e.g.
            2024/25)
            <br />• Provide **both** GC (Gregorian) and EC (Ethiopian) dates
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full w-7 h-7 flex items-center justify-center mt-1 shrink-0">
            3
          </span>
          <div>
            <strong className="text-gray-900 dark:text-white">Grading:</strong>
            <br />
            Grading systems must exist first — enter existing ID only.
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            ⚠️ Changing dates or grading system affects transcripts, GPA,
            reports.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading combinations...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-5 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          BCSY Editor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Batch – Class/Year – Semester combinations
        </p>
      </header>

      <Instructions />

      <CrudSection title="All Combinations" data={items} setData={setItems} />
    </div>
  );
};

// ────────────────────────────────────────────────
//  Crud Section (list + modal)
// ────────────────────────────────────────────────

interface CrudProps {
  title: string;
  data: BCSY[];
  setData: React.Dispatch<React.SetStateAction<BCSY[]>>;
}

const CrudSection = ({ title, data, setData }: CrudProps) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BCSY | null>(null);
  const [form, setForm] = useState<BCSYForm>({
    batchId: "",
    classYearId: "",
    semesterId: "S1",
    entryYearId: "",
    classStartGC: "",
    classStartEC: "",
    classEndGC: "",
    classEndEC: "",
    gradingSystemId: "",
  });
  const [formError, setFormError] = useState("");
  const [batches, setBatches] = useState<{ id: number; name?: string }[]>([]);
  const [classYears, setClassYears] = useState<{ id: number; name?: string }[]>(
    []
  );
  const [semesters] = useState<string[]>([
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "S6",
    "S7",
    "S8",
    "Pre",
  ]); // static for now
  const [entryYears] = useState<string[]>([
    "2015/16",
    "2016/17",
    "2017/18",
    "2018/19",
    "2019/20",
    "2020/21",
    "2021/22",
    "2022/23",
    "2023/24",
    "2024/25",
    "2025/26",
  ]);
  const [batch, setBatch] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [lookupData, setLookupData] = useState<any>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  // Add near the top of CrudSection or SingleBCSYPage
  const [gradingSystems, setGradingSystems] = useState<any[]>([]);
  const [loadingGrading, setLoadingGrading] = useState(true);

  // Example endpoint — adjust to your real one
  useEffect(() => {
    const fetchGradingSystems = async () => {
      try {
        setLoadingGrading(true);
        const res = await apiService.get(
          endPoints.gradingSystem || "/api/grading-systems" // ← change this
        );
        setGradingSystems(res); // assuming array like your JSON
      } catch (err: any) {
        console.error("Failed to load grading systems", err);
        // Optionally show toast / error message
      } finally {
        setLoadingGrading(false);
      }
    };

    fetchGradingSystems();
  }, []);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const filtered = data.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase())
  );
  const pageSize = showAll ? filtered.length : 12;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await apiService.get(
          endPoints.lookupsDropdown || "/api/filters/options"
        );
        setLookupData(res);
        console.log(res);
      } catch (err: any) {
        setOptionsError("Failed to load dropdown options");
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const getter = async () => {
      try {
        const response = await apiClient(endPoints.batches);
        setBatch(response.data);
        console.log(response);
      } catch (err) {}
    };
    getter();
  }, []);
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
    if (totalPages === 0) setPage(1);
  }, [filtered.length, totalPages]);

  const openModal = (item?: BCSY) => {
    if (item && !window.confirm("Edit this record?")) return;

    setEditing(item ?? null);
    setForm(
      item
        ? {
            batchId: String(item.batchId),
            classYearId: String(item.classYearId),
            semesterId: item.semesterId,
            entryYearId: item.entryYearId,
            classStartGC: item.classStartGC ?? "",
            classStartEC: item.classStartEC ?? "",
            classEndGC: item.classEndGC ?? "",
            classEndEC: item.classEndEC ?? "",
            gradingSystemId: item.gradingSystemId
              ? String(item.gradingSystemId)
              : "",
          }
        : {
            batchId: "",
            classYearId: "",
            semesterId: "S1",
            entryYearId: "",
            classStartGC: "",
            classStartEC: "",
            classEndGC: "",
            classEndEC: "",
            gradingSystemId: "",
          }
    );
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (
      !form.batchId.trim() ||
      !form.classYearId.trim() ||
      !form.semesterId.trim() ||
      !form.entryYearId.trim()
    ) {
      setFormError("Batch, Class/Year, Semester and Entry Year are required.");
      return;
    }

    if (!editing && !window.confirm("Create new combination?")) return;

    try {
      const payload: any = {
        batchId: Number(form.batchId),
        classYearId: Number(form.classYearId),
        semesterId: form.semesterId.trim(),
        entryYearId: form.entryYearId.trim(),
      };

      if (form.classStartGC) payload.classStartGC = form.classStartGC;
      if (form.classStartEC) payload.classStartEC = form.classStartEC;
      if (form.classEndGC) payload.classEndGC = form.classEndGC;
      if (form.classEndEC) payload.classEndEC = form.classEndEC;
      if (form.gradingSystemId.trim())
        payload.gradingSystemId = Number(form.gradingSystemId);

      let res;
      let newItem: BCSY;

      if (editing) {
        res = await apiService.put(
          `${endPoints.BatchClassYearSemesters}/${editing.id}`,
          payload
        );
        newItem = {
          id: res.bcysId ?? editing.id,
          name:
            res.name ?? `${res.batchId}-${res.classYearId}-${res.semesterId}`,
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
        setData(data.map((d) => (d.id === editing.id ? newItem : d)));
      } else {
        res = await apiService.post(endPoints.BatchClassYearSemesters, payload);
        newItem = {
          id: res.bcysId,
          name: res.name,
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
        setData([...data, newItem]);
      }

      closeModal();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Save failed"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this BCSY combination?\n\nThis action may be restricted if students/results exist."
      )
    )
      return;

    try {
      await apiService.delete(`${endPoints.BatchClassYearSemesters}/${id}`);
      setData(data.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition"
          >
            <FaPlus size={14} /> New
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>
          <button
            onClick={() => setView(view === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition"
          >
            {view === "table" ? <FaTh /> : <FaList />}{" "}
            {view === "table" ? "Grid" : "Table"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {view === "table" ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Batch / Year / Sem</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.id}
                  className="group border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition"
                  onClick={() =>
                    navigate(`/registrar/settings/bcsy/${item.id}`)
                  }
                >
                  <td className="p-4 font-medium">#{item.id}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">
                    B{item.batchId} • Y{item.classYearId} • {item.semesterId}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(item);
                        }}
                        className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-full"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition cursor-pointer"
              onClick={() => navigate(`/bcsy/${item.id}`)}
            >
              <div className="font-bold text-indigo-600">#{item.id}</div>
              <div className="font-semibold mt-1 text-lg">{item.name}</div>
              <div className="text-sm mt-2 opacity-80">
                Batch {item.batchId} • Year {item.classYearId} •{" "}
                {item.semesterId}
              </div>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-lg shadow-md">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(item);
                  }}
                  className="p-2 hover:bg-yellow-100 rounded-full text-yellow-600"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 hover:bg-red-100 rounded-full text-red-600"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showAll && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-indigo-600">
                {editing ? "Edit Combination" : "Create New Combination"}
              </h3>

              {optionsError && (
                <div className="mb-5 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">
                  {optionsError}
                </div>
              )}

              {loadingOptions ? (
                <div className="text-center py-8">
                  Loading dropdown options...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Batch */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Batch *
                    </label>
                    <select
                      value={form.batchId}
                      onChange={(e) =>
                        setForm({ ...form, batchId: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">— Select Batch —</option>
                      {lookupData?.batches?.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name || `Batch ${b.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class/Year */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Class/Year *
                    </label>
                    <select
                      value={form.classYearId}
                      onChange={(e) =>
                        setForm({ ...form, classYearId: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">— Select Year —</option>
                      {lookupData?.classYears?.map((y: any) => (
                        <option key={y.id} value={y.id}>
                          {y.name || `Year ${y.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Semester *
                    </label>
                    <select
                      value={form.semesterId}
                      onChange={(e) =>
                        setForm({ ...form, semesterId: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">— Select Semester —</option>
                      {lookupData?.semesters?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Entry Year / Academic Year */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Entry Year *
                    </label>
                    <select
                      value={form.entryYearId}
                      onChange={(e) =>
                        setForm({ ...form, entryYearId: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">— Select Entry Year —</option>
                      {lookupData?.academicYears?.map((ay: any) => (
                        <option key={ay.id} value={ay.id}>
                          {ay.name} ({ay.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ─── rest of the fields (dates + gradingSystemId) stay the same ─── */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">
                      Grading System
                    </label>
                    {loadingGrading ? (
                      <div className="text-sm text-gray-500">
                        Loading grading systems...
                      </div>
                    ) : gradingSystems.length === 0 ? (
                      <div className="text-sm text-amber-600">
                        No grading systems available
                      </div>
                    ) : (
                      <select
                        name="gradingSystemId"
                        value={form.gradingSystemId}
                        onChange={(e) =>
                          setForm({ ...form, gradingSystemId: e.target.value })
                        }
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">— Not assigned / None —</option>
                        {gradingSystems.map((gs: any) => (
                          <option key={gs.id} value={gs.id}>
                            {gs.versionName}
                            {gs.remark && ` (${gs.remark})`}
                            {gs.departmentId && ` • Dept ${gs.departmentId}`}
                            {!gs.active && " (inactive)"}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Changing this affects GPA calculation and transcripts
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Start (GC)
                    </label>
                    <input
                      type="date"
                      name="classStartGC"
                      value={form.classStartGC}
                      onChange={(e) =>
                        setForm({ ...form, classStartGC: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Start (EC)
                    </label>
                    <input
                      type="text"
                      name="classStartEC"
                      value={form.classStartEC}
                      onChange={(e) =>
                        setForm({ ...form, classStartEC: e.target.value })
                      }
                      placeholder="07-06-2017"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      End (GC)
                    </label>
                    <input
                      type="date"
                      name="classEndGC"
                      value={form.classEndGC}
                      onChange={(e) =>
                        setForm({ ...form, classEndGC: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      End (EC)
                    </label>
                    <input
                      type="text"
                      name="classEndEC"
                      value={form.classEndEC}
                      onChange={(e) =>
                        setForm({ ...form, classEndEC: e.target.value })
                      }
                      placeholder="22-11-2017"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  {/* ... your existing date inputs + gradingSystemId input ... */}
                </div>
              )}

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={closeModal}
                  className="px-7 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition"
                  disabled={loadingOptions}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loadingOptions}
                  className="px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
//  Detail / View Page
// ────────────────────────────────────────────────

const SingleBCSYPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<BCSY | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<BCSYForm>({
    batchId: "",
    classYearId: "",
    semesterId: "",
    entryYearId: "",
    classStartGC: "",
    classStartEC: "",
    classEndGC: "",
    classEndEC: "",
    gradingSystemId: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchOne = async () => {
      try {
        const res = await apiService.get<any>(
          `${endPoints.BatchClassYearSemesters}/${id}`
        );
        const data: BCSY = {
          id: res.bcysId ?? res.id,
          name: res.name,
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
        setItem(data);

        setForm({
          batchId: String(res.batchId),
          classYearId: String(res.classYearId),
          semesterId: res.semesterId,
          entryYearId: res.entryYearId,
          classStartGC: res.classStartGC ?? "",
          classStartEC: res.classStartEC ?? "",
          classEndGC: res.classEndGC ?? "",
          classEndEC: res.classEndEC ?? "",
          gradingSystemId: res.gradingSystemId
            ? String(res.gradingSystemId)
            : "",
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load record");
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [id]);

  const handleUpdate = async () => {
    if (!item) return;

    try {
      const payload: any = {
        batchId: Number(form.batchId),
        classYearId: Number(form.classYearId),
        semesterId: form.semesterId.trim(),
        entryYearId: form.entryYearId.trim(),
      };

      if (form.classStartGC) payload.classStartGC = form.classStartGC;
      if (form.classStartEC) payload.classStartEC = form.classStartEC;
      if (form.classEndGC) payload.classEndGC = form.classEndGC;
      if (form.classEndEC) payload.classEndEC = form.classEndEC;
      if (form.gradingSystemId.trim())
        payload.gradingSystemId = Number(form.gradingSystemId);

      const res = await apiService.put(
        `${endPoints.BatchClassYearSemesters}/${item.id}`,
        payload
      );

      setItem({
        ...item,
        name: res.name ?? item.name,
        batchId: res.batchId ?? item.batchId,
        classYearId: res.classYearId ?? item.classYearId,
        semesterId: res.semesterId ?? item.semesterId,
        entryYearId: res.entryYearId ?? item.entryYearId,
        classStartGC: res.classStartGC ?? item.classStartGC,
        classStartEC: res.classStartEC ?? item.classStartEC,
        classEndGC: res.classEndGC ?? item.classEndGC,
        classEndEC: res.classEndEC ?? item.classEndEC,
        gradingSystemId: res.gradingSystemId ?? item.gradingSystemId,
      });

      setShowEdit(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!item || !window.confirm("Delete this combination?")) return;

    try {
      await apiService.delete(
        `${endPoints.BatchClassYearSemesters}/${item.id}`
      );
      navigate("/bcsy");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  if (error || !item)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error || "Record not found"}
      </div>
    );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {item.name}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              Information
            </h2>
            <div className="space-y-5 text-[15px]">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  ID
                </span>
                <span className="font-mono font-bold">#{item.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Name
                </span>
                <span className="font-semibold">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Batch
                </span>
                <span>{item.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Class/Year
                </span>
                <span>{item.classYearId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Semester
                </span>
                <span className="font-semibold">{item.semesterId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Entry Year
                </span>
                <span>{item.entryYearId}</span>
              </div>
              <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Grading System
                </span>
                <span>{item.gradingSystemId ?? "—"}</span>
              </div>
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Period (Gregorian)
                </div>
                <div className="text-right">
                  {item.classStartGC || "—"} → {item.classEndGC || "—"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Period (Ethiopian)
                </div>
                <div className="text-right">
                  {item.classStartEC || "—"} → {item.classEndEC || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/40">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowEdit(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition"
              >
                <FaEdit /> Edit Combination
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition"
              >
                <FaTrash /> Delete Combination
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal on detail page */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-indigo-600">
                Edit Combination
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* same form fields as create modal – copy-paste them here */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Batch ID *
                  </label>
                  <input
                    type="number"
                    value={form.batchId}
                    onChange={(e) =>
                      setForm({ ...form, batchId: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {/* ... repeat for all other fields ... */}
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-7 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { BatchClassYearSemesterEditor, SingleBCSYPage };
export default BatchClassYearSemesterEditor;
