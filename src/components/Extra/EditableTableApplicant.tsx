// EditableTableApplicant.tsx
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/hooks/Modal";
import { ImageModal } from "@/hooks/ImageModal";
import apiService from "@/components/api/apiService";
import endPoints from "@/components/api/endPoints";
import { Link } from "react-router-dom";

export interface DataTypes {
  key: string;
  studentId: number;   
  id: string;          
  name: string;
  amharicName: string;
  year: number;
  status: string;
  department: string;
  photo?: string;
  batch: string;
  isDisabled?: boolean;
}


interface EditableTableProps {
  initialData: DataTypes[];
}

const EditableTableApplicant: React.FC<EditableTableProps> = ({
  initialData,
}) => {
  const { openModal, closeModal } = useModal() as any;
  const [showAmharic, setShowAmharic] = useState(false);
  const [data, setData] = useState<DataTypes[]>(() =>
    (initialData || []).map((d) => ({ ...d, isDisabled: d.isDisabled ?? false }))
  );

  // keep in sync if parent provides new data
  useEffect(() => {
    setData((initialData || []).map((d) => ({ ...d, isDisabled: d.isDisabled ?? false })));
  }, [initialData]);

  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
  });

  // handle deactivate / activate
  const handleStatusChange = async (record: DataTypes, action: "disable" | "enable") => {
    try {
      const url =
        action === "disable"
          ? endPoints.studentsDeactivation.replace(":id", String(record.studentId))
          : endPoints.studentsActivation.replace(":id", String(record.studentId));

      // Server expects POST for these actions (Allow: POST)
      await apiService.post(url, {});
      console.log(`User ${record.id} ${action}d successfully`);
      // reflect change locally without page refresh and keep the row visible
      setData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? { ...item, isDisabled: action === "disable" }
            : item
        )
      );
      closeModal();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "photo",
      width: "16%",
      render: (text: string) =>
        text ? (
          <img
            src={text}
            onClick={(e) => {
              openModal(<ImageModal imageSrc={text} />);
              e.stopPropagation();
            }}
            alt="student"
            className="w-25 h-20 hover:cursor-pointer object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-300 text-sm">
            No Photo
          </div>
        ),
    },
    { 
      title: "ID", 
      dataIndex: "id", 
      width: "12%",
      render: (text: string, record: DataTypes) => (
        <Link 
          to={`/registrar/students/${record.key}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </Link>
      )
    },
    {
      title: (
        <div className="flex items-center gap-2">
          Name
          {/* toggle amharic/english */}
          <svg
            onClick={() => setShowAmharic((prev) => !prev)}
            width="22px"
            height="22px"
            className="hover:cursor-pointer"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 20h9M3 4h18M4 20l7-16"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      dataIndex: "name",
      width: "10%",
      render: (_: any, record: DataTypes) => (
        <Link 
          to={`/registrar/students/${record.key}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {showAmharic ? record.amharicName : record.name}
        </Link>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "1%",
      render: (text: string) => (
        <span
          className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${
              text === "Active"
                ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                : ""
            }
            ${
              text === "Graduated"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
                : ""
            }
            ${
              text === "Suspended"
                ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
                : ""
            }
            ${
              text === "Inactive"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                : ""
            }
          `}
        >
          {text}
        </span>
      ),
    },
    { 
      title: "Batch", 
      dataIndex: "batch", 
      width: "12%",
      render: (text: string, record: DataTypes) => (
        <Link 
          to={`/registrar/students/${record.key}`}
          className="text-gray-700 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </Link>
      )
    },
    { 
      title: "Department", 
      dataIndex: "department", 
      width: "11%",
      render: (text: string, record: DataTypes) => (
        <Link 
          to={`/registrar/students/${record.key}`}
          className="text-gray-700 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </Link>
      )
    },
    {
      title: "Account Status",
      dataIndex: "accountStatus",
      width: "10%",
      render: (_: any, record: DataTypes) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            record.isDisabled
              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800"
              : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
          }`}
        >
          {record.isDisabled ? "Suspended" : "Active"}
        </span>
      ),
    },
    {
      title: "Regulate Activity",
      dataIndex: "action",
      width: "7%",
      render: (_: any, record: DataTypes) => (
        <span
          onClick={(e) => {
            e.stopPropagation();

            openModal(
              <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-96">
                <h2 className="text-xl font-bold mb-4">Regulate Student Activity</h2>
                <p className="mb-4">
                  Choose an action. This is independent of the student's academic status.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await handleStatusChange(record, "disable");
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={async () => {
                      await handleStatusChange(record, "enable");
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                  >
                    Activate
                  </button>
                </div>
              </div>
            );
          }}
        >
          <span className="inline-flex items-center gap-2">
            {/* User state icon: check for active, x for suspended */}
            {record.isDisabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-600"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <line x1="15" y1="9" x2="21" y2="3" />
                <line x1="21" y1="9" x2="15" y2="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <path d="M16 11l2 2 4-4" />
              </svg>
            )}

            {/* Three dots (kebab) icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table<DataTypes>
        dataSource={data}
        columns={columns}
        rowKey={(record, index) => `${record.key}-${index}`}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
          },
          onShowSizeChange: (current, size) => {
            setPagination({ ...pagination, current, pageSize: size });
          },
        }}
        bordered={false}
        className="min-w-full bg-gray-100 dark:bg-gray-800"
        rowClassName={(record) =>
          `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            record.isDisabled ? "bg-red-50 dark:bg-red-900/40" : ""
          }`
        }
        onRow={(record) => {
          return {
            onClick: () => navigate(`/registrar/students/${record.key}`),
            style: record.isDisabled
              ? { backgroundColor: "#fde2e2" }
              : undefined,
          };
        }}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                className="
                  bg-white dark:bg-gray-900 
                  text-gray-900 dark:text-gray-100
                  px-4 py-2 text-left
                "
              />
            ),
          },
          body: {
            row: (props) => (
              <tr
                {...props}
                className={`
                  ${props.className || ""}
                  bg-white dark:bg-gray-900 
                  text-gray-900 dark:text-gray-100
                  hover:bg-blue-200 dark:hover:bg-gray-600 
                  transition-colors
                  cursor-pointer
                `}
                style={props.style}
              />
            ),
          },
        }}
      />
    </div>
  );
};

export default EditableTableApplicant;