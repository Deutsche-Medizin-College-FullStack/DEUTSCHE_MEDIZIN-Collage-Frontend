import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaList, FaTh } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

const RegistrarAdminPage = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [woredas, setWoredas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState("regions");

  // Static countries (you can later add a /api/country endpoint if needed)
  const countries = [
    { code: "ET", name: "Ethiopia" },
    { code: "KE", name: "Kenya" },
  ];

  const fetchAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [regionsRes, zonesRes, woredasRes] = await Promise.all([
        apiService.get(endPoints.allRegion),
        apiService.get(endPoints.allZones),
        apiService.get(endPoints.allWoreda),
      ]);

      setRegions(
        regionsRes.map((r: any) => ({
          code: r.regionCode,
          name: r.region,
          countryCode: r.countryCode || "ET",
        }))
      );

      setZones(
        zonesRes.map((z: any) => ({
          code: z.zoneCode,
          name: z.zone,
          regionCode: z.regionCode,
        }))
      );

      setWoredas(
        woredasRes.map((w: any) => ({
          code: w.woredaCode,
          name: w.woreda,
          zoneCode: w.zoneCode,
        }))
      );
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setErrorMessage(
        "Failed to load administrative divisions. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const sections = [
    {
      id: "countries",
      title: "Countries",
      data: countries,
      readOnly: true,
    },
    {
      id: "regions",
      title: "Regions",
      data: regions,
      setData: setRegions,
      parentList: countries,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "countryCode",
      getParentName: (code: string) =>
        countries.find((c) => c.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/region/bulk",
        deleteAll: "/api/region",
      },
      transformToBackend: (item: any) => ({
        regionCode: item.code,
        region: item.name,
        countryCode: item.countryCode,
      }),
    },
    {
      id: "zones",
      title: "Zones",
      data: zones,
      setData: setZones,
      parentList: regions,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "regionCode",
      getParentName: (code: string) =>
        regions.find((r) => r.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/zone/bulk",
        deleteAll: "/api/zone",
      },
      transformToBackend: (item: any) => ({
        zoneCode: item.code,
        zone: item.name,
        regionCode: item.regionCode,
        regionType: "Standard", // adjust or make configurable if needed
      }),
    },
    {
      id: "woredas",
      title: "Woredas",
      data: woredas,
      setData: setWoredas,
      parentList: zones,
      parentIdKey: "code",
      parentLabelKey: "name",
      parentForeignKey: "zoneCode",
      getParentName: (code: string) =>
        zones.find((z) => z.code === code)?.name || "Unknown",
      endpoint: {
        bulkAdd: "/woreda/bulk",
        deleteAll: "/api/woreda", // assuming this endpoint exists — add if missing
      },
      transformToBackend: (item: any) => ({
        woredaCode: item.code,
        woreda: item.name,
        zoneCode: item.zoneCode,
      }),
    },
  ];

  const currentSection =
    sections.find((s) => s.id === selectedSection) || sections[1];

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent animate-gradient">
          DHMC Location Editor
        </h1>

        <nav className="flex justify-center gap-4 flex-wrap mt-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedSection === section.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : errorMessage ? (
          <div className="text-center text-red-600 dark:text-red-400 text-xl font-medium">
            {errorMessage}
          </div>
        ) : (
          <CrudSection
            title={currentSection.title}
            data={currentSection.data}
            setData={currentSection.setData}
            parentList={currentSection.parentList}
            parentIdKey={currentSection.parentIdKey}
            parentLabelKey={currentSection.parentLabelKey}
            parentForeignKey={currentSection.parentForeignKey}
            getParentName={currentSection.getParentName}
            endpoint={currentSection.endpoint}
            transformToBackend={currentSection.transformToBackend}
            readOnly={currentSection.readOnly}
            onRefresh={fetchAllData}
          />
        )}
      </main>
    </div>
  );
};

interface CrudSectionProps {
  title: string;
  data: any[];
  setData?: React.Dispatch<React.SetStateAction<any[]>>;
  parentList?: any[];
  parentIdKey?: string;
  parentLabelKey?: string;
  parentForeignKey?: string;
  getParentName?: (code: string) => string;
  endpoint?: { bulkAdd: string; deleteAll: string };
  transformToBackend?: (item: any) => any;
  readOnly?: boolean;
  onRefresh: () => Promise<void>;
}

const CrudSection = ({
  title,
  data,
  setData,
  parentList,
  parentIdKey = "code",
  parentLabelKey = "name",
  parentForeignKey,
  getParentName,
  endpoint,
  transformToBackend,
  readOnly = false,
  onRefresh,
}: CrudSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ code: "", name: "" });
  const [modalError, setModalError] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const itemsPerPage = showAll ? data.length : 10;
  const filteredData = data.filter(
    (item) =>
      (item.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    if (totalPages === 0) setCurrentPage(1);
  }, [filteredData.length, totalPages]);

  const handleOpenModal = (item: any = null) => {
    if (readOnly) return;
    if (
      item &&
      !window.confirm(`Edit this ${title.slice(0, -1).toLowerCase()}?`)
    )
      return;

    setEditingItem(item);
    setFormData(
      item
        ? { ...item }
        : {
            code: "",
            name: "",
            ...(parentForeignKey && parentList?.length
              ? { [parentForeignKey]: parentList[0][parentIdKey] || "" }
              : {}),
          }
    );
    setModalError("");
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.code?.trim() || !formData.name?.trim()) {
      setModalError("Code and Name are required.");
      return false;
    }
    const duplicate = data.find(
      (d) =>
        d.code === formData.code &&
        (!editingItem || d.code !== editingItem.code)
    );
    if (duplicate) {
      setModalError("This code already exists.");
      return false;
    }
    if (parentForeignKey && !formData[parentForeignKey]) {
      setModalError("Please select a parent.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (
      !setData ||
      !endpoint?.bulkAdd ||
      !transformToBackend ||
      !validateForm()
    )
      return;

    setOperationLoading(true);
    setModalError("");

    try {
      const itemToSend = transformToBackend(formData);
      const payload = [itemToSend];

      // Because there is no PUT → delete all + add new (for simplicity)
      if (editingItem) {
        await apiService.delete(endpoint.deleteAll);
        await apiService.post(endpoint.bulkAdd, payload);
      } else {
        await apiService.post(endpoint.bulkAdd, payload);
      }

      await onRefresh();
      setShowModal(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Failed to save item. Please try again.";
      setModalError(msg);
      console.error(err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!endpoint?.deleteAll || readOnly) return;
    if (
      !window.confirm(
        `Delete ALL ${title.toLowerCase()}? This cannot be undone.`
      )
    )
      return;

    setOperationLoading(true);
    try {
      await apiService.delete(endpoint.deleteAll);
      await onRefresh();
    } catch (err: any) {
      setModalError("Failed to delete all items.");
      console.error(err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleIndividualDelete = () => {
    alert(
      "Individual delete is not supported by the current API.\n" +
        "Use 'Delete All' or ask the backend team to add DELETE /{code} endpoints."
    );
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          {title}
        </h2>

        <div className="flex flex-wrap gap-3">
          {!readOnly && (
            <>
              <button
                onClick={() => handleOpenModal()}
                disabled={operationLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              >
                <FaPlus /> Add {title.slice(0, -1)}
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={operationLoading || data.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              >
                <FaTrash /> Delete All
              </button>
            </>
          )}

          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-transform hover:scale-105"
          >
            {showAll ? "Paginate" : "Show All"}
          </button>

          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition-transform hover:scale-105"
          >
            {viewMode === "table" ? <FaTh /> : <FaList />}{" "}
            {viewMode === "table" ? "Grid" : "Table"}
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder={`Search ${title} by code or name...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-4 text-left font-semibold">Code</th>
                <th className="p-4 text-left font-semibold">Name</th>
                {getParentName && (
                  <th className="p-4 text-left font-semibold">Parent</th>
                )}
                {!readOnly && (
                  <th className="p-4 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.code}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="p-4">{item.code}</td>
                  <td className="p-4">{item.name}</td>
                  {getParentName && (
                    <td className="p-4">
                      {getParentName(item[parentForeignKey || ""])}
                    </td>
                  )}
                  {!readOnly && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition"
                          title="Edit"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={handleIndividualDelete}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                          title="Delete (not supported individually)"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedData.map((item) => (
            <div
              key={item.code}
              className="p-5 rounded-xl bg-gray-100 dark:bg-gray-700 shadow hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="font-bold text-lg mb-1">
                {item.code} – {item.name}
              </div>
              {getParentName && (
                <div className="text-sm opacity-80 mb-3">
                  Parent: {getParentName(item[parentForeignKey || ""])}
                </div>
              )}
              {!readOnly && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={handleIndividualDelete}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!showAll && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              {editingItem ? "Edit" : "Add"} {title.slice(0, -1)}
            </h3>

            {modalError && (
              <div className="mb-5 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg">
                {modalError}
              </div>
            )}

            <input
              type="text"
              name="code"
              value={formData.code || ""}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Code"
              disabled={!!editingItem}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />

            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Name"
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {parentForeignKey && parentList && (
              <select
                name={parentForeignKey}
                value={formData[parentForeignKey] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [parentForeignKey]: e.target.value,
                  })
                }
                className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select parent...</option>
                {parentList.map((p) => (
                  <option key={p[parentIdKey]} value={p[parentIdKey]}>
                    {p[parentLabelKey]}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={operationLoading}
                className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={operationLoading}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {operationLoading && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {editingItem ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarAdminPage;
