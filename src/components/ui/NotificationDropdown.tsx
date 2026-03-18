import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  User,
  GraduationCap,
  DollarSign,
  BookOpen,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService, {
  type Notification,
} from "../api/notificationService";

interface NotificationDropdownProps {
  className?: string;
  userRole?: string; // Add this
}

export default function NotificationDropdown({
  className = "",
  userRole = "",
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get icon for sender role
  const getSenderIcon = (senderRole: string) => {
    switch (senderRole.toUpperCase()) {
      case "REGISTRAR":
        return <User className="w-3 h-3" />;
      case "DEAN":
      case "VICE_DEAN":
        return <GraduationCap className="w-3 h-3" />;
      case "FINANCE":
        return <DollarSign className="w-3 h-3" />;
      case "TEACHER":
        return <BookOpen className="w-3 h-3" />;
      case "ADMIN":
      case "SYSTEM":
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  // Get notification route based on user role
  const getNotificationRoute = () => {
    const role = userRole?.toLowerCase() || "";
    switch (role) {
      case "student":
        return "/student/notifications";
      case "teacher":
        return "/teacher/notifications";
      case "registrar":
        return "/registrar/notifications";
      case "dean":
        return "/dean/notifications";
      case "vice_dean":
      case "vicedean":
        return "/vice-dean/notifications";
      case "department_head":
      case "head":
        return "/head/notifications";
      default:
        // Fallback to URL detection
        const path = window.location.pathname;
        if (path.includes("/teacher/")) return "/teacher/notifications";
        if (path.includes("/registrar/")) return "/registrar/notifications";
        if (path.includes("/dean/")) return "/dean/notifications";
        if (path.includes("/vice-dean/")) return "/vice-dean/notifications";
        if (path.includes("/head/")) return "/head/notifications";
        return "/student/notifications";
    }
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch latest notifications
  const fetchLatestNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await notificationService.getAllNotifications();
      const latestNotifications =
        await notificationService.getLatestNotifications();

      const sortedNotifications =
        notificationService.sortNotificationsByPriority(latestNotifications);
      setNotifications(sortedNotifications.slice(0, 3));
      setUnreadCount(notificationService.getUnreadCount(allNotifications));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  // useEffect(() => {
  //   fetchLatestNotifications();
  // }, []);

  // Handle notification click
  const handleNotificationClick = async (notificationId: number) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Handle view more click - Fixed to redirect to appropriate layout
  const handleViewMore = () => {
    setShowDropdown(false);
    const route = getNotificationRoute();
    navigate(route);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchLatestNotifications();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Loading...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    } ${index !== notifications.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.isRead
                              ? "font-medium text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notificationService.formatTimeAgo(
                              notification.createdAt,
                            )}
                          </p>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                            {getSenderIcon(notification.senderRole)}
                            {notification.senderRole}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification.id);
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleViewMore}
                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-150"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
