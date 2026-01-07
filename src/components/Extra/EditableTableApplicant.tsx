import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useModal } from "@/hooks/Modal";
import { ImageModal } from "@/hooks/ImageModal";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";

export interface DataTypes {
  key: string;
  studentId: number;
  id: string;
  name: string;
  amharicName: string;
  status: string;
  department: string;
  batch: string;
  photo?: string;
  isDisabled?: boolean;
}

interface Props {
  initialData: DataTypes[];
}

const EditableTableApplicant: React.FC<Props> = ({ initialData }) => {
  const { openModal, closeModal } = useModal() as any;
  const navigate = useNavigate();
  const [showAmharic, setShowAmharic] = useState(false);
  const [data, setData] = useState<DataTypes[]>([]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleStatusChange = async (
    record: DataTypes,
    action: "enable" | "disable"
  ) => {
    const url =
      action === "disable"
        ? endPoints.studentsDeactivation.replace(
            ":id",
            String(record.studentId)
          )
        : endPoints.studentsActivation.replace(
            ":id",
            String(record.studentId)
          );

    await apiService.post(url, {});
    setData((prev) =>
      prev.map((s) =>
        s.studentId === record.studentId
          ? { ...s, isDisabled: action === "disable" }
          : s
      )
    );
    closeModal();
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      render: (text: string) =>
        text ? (
          <img
            src={text}
            onClick={(e) => {
              e.stopPropagation();
              openModal(<ImageModal imageSrc={text} />);
            }}
            className="w-16 h-16 rounded object-cover cursor-pointer"
          />
        ) : (
          <div className="w-16 h-16 rounded bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">
            No Photo
          </div>
        ),
    },
    {
      title: "ID",
      dataIndex: "id",
      render: (_: any, r: DataTypes) => (
        <Link
          to={`/registrar/students/${r.key}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {r.id}
        </Link>
      ),
    },
    {
      title: "Name",
      render: (_: any, r: DataTypes) => (
        <span className="font-medium">
          {showAmharic ? r.amharicName : r.name}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (t: string) => (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
          {t}
        </span>
      ),
    },
    { title: "BCY", dataIndex: "batch" },
    { title: "Department", dataIndex: "department" },
    {
      title: "Account",
      render: (_: any, r: DataTypes) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            r.isDisabled
              ? "bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200"
              : "bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200"
          }`}
        >
          {r.isDisabled ? "Disabled" : "Active"}
        </span>
      ),
    },
    {
      title: "Actions",
      render: (_: any, r: DataTypes) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal(
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Regulate Activity
                </h3>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "disable")}
                    className="px-4 py-2 rounded bg-red-600 text-white"
                  >
                    Disable
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "enable")}
                    className="px-4 py-2 rounded bg-green-600 text-white"
                  >
                    Enable
                  </button>
                </div>
              </div>
            );
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Manage
        </button>
      ),
    },
  ];

  return (
    <Table<DataTypes>
      dataSource={data}
      columns={columns}
      rowKey="key"
      pagination={{ pageSize: 10 }}
      onRow={(r) => ({
        onClick: () => navigate(`/registrar/students/${r.key}`),
      })}
      className="bg-transparent"
      rowClassName={(r) =>
        `
        cursor-pointer
        transition-colors
        ${
          r.isDisabled
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-white dark:bg-gray-900"
        }
        hover:bg-gray-200 dark:hover:bg-gray-700
        text-gray-900 dark:text-gray-100
      `
      }
    />
  );
};

export default EditableTableApplicant;
