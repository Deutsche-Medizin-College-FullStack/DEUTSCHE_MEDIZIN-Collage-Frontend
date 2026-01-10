import { useState } from "react";
import { Lock, BookOpen, Trash2, HelpCircle, Briefcase } from "lucide-react";
import { Button } from "antd";
import { Alert } from "@/components/ui/alert";

export default function StudentSetting() {
  const [activeTab, setActiveTab] = useState("password");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPassWordReset, setIsPassWordReset] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSwitchDeptModalOpen, setIsSwitchDeptModalOpen] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Mathematics",
  ];

  const handlePasswordChange = (e) => {
    setIsPassWordReset(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    if (password.new.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    setPasswordError("");
    // TODO: Send password change to backend
    alert("Password changed successfully!");
    setPassword({ current: "", new: "", confirm: "" });
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSwitchDepartment = () => {
    if (!selectedDepartment) {
      alert("Please select a department.");
      return;
    }
    // TODO: Send department switch request to backend
    alert(`Department switched to ${selectedDepartment}.`);
    setIsSwitchDeptModalOpen(false);
    setSelectedDepartment("");
  };

  const handleWithdraw = () => {
    // TODO: Send withdraw request to backend
    alert("Program withdrawal request submitted.");
    setIsWithdrawModalOpen(false);
  };

  const handleDelete = () => {
    // TODO: Send delete account request to backend
    alert("Account deletion request submitted.");
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Account Settings
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {["password", "enrollment", "account", "support"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab === "support" ? "Support & FAQ" : tab}
            </button>
          ))}
        </div>

        {/* Password Tab */}
        {activeTab === "password" && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Request Password Change
            </h2>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Submit a request to the registrar to change your password.
                You'll be notified once the request is processed.
              </p>
              <div className="relative group">
                <button
                  onClick={() => setIsPassWordReset(true)}
                  className="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transform transition-all duration-300 group-hover:scale-105"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Request Password Change
                  <span className="absolute inset-0 rounded-lg bg-blue-500 dark:bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          </section>
        )}

        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Enrollment
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Manage your program enrollment status.
            </p>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
            >
              <BookOpen className="w-4 h-4 inline-block mr-2" />
              Request Withdraw from Program
            </button>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          </section>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Permanently delete your account. This action cannot be undone.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 inline-block mr-2" />
              Delete Account
            </button>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          </section>
        )}

        {/* Support & FAQ Tab */}
        {activeTab === "support" && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Support & FAQ
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Contact Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  For assistance, reach out to our support team:
                </p>
                <ul className="mt-2 text-gray-600 dark:text-gray-300">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:support@university.edu"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      support@university.edu
                    </a>
                  </li>
                  <li>Phone: +251-912-345-678</li>
                  <li>Office Hours: Mon-Fri, 9:00 AM - 5:00 PM</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      How do I change my department?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Go to the Department tab, select a new department, and
                      confirm the switch.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      What happens if I withdraw from my program?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Withdrawing may affect your academic progress and
                      financial obligations. Contact support for details.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      How do I delete my account?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Use the Account tab to initiate account deletion. This
                      action is permanent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          </section>
        )}

        {/* Switch Department Confirmation Modal */}
        {isPassWordReset && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Confirm Password Change Request
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to change your password
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsPassWordReset(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Confirm Password Request
                </button>
              </div>
            </div>
          </div>
        )}
        {isSwitchDeptModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Confirm Department Switch
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to switch to {selectedDepartment}? This
                may affect your academic plan.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsSwitchDeptModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwitchDepartment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Confirm Switch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Confirmation Modal */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Confirm Program Withdrawal Request
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to withdraw from the program? This action
                may have academic and financial implications.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Confirm Account Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete your account? This action is
                permanent and cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
