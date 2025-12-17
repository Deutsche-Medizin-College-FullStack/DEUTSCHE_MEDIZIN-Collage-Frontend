import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Dummy courses
const courses = [
  {
    id: 1,
    code: "CS101",
    name: "Computer Science 101",
    semester: "Fall 2025",
    students: 5,
  },
  {
    id: 2,
    code: "MATH201",
    name: "Mathematics 201",
    semester: "Fall 2025",
    students: 8,
  },
  {
    id: 3,
    code: "PHYS150",
    name: "Physics 150",
    semester: "Fall 2025",
    students: 6,
  },
  {
    id: 4,
    code: "ENG301",
    name: "Engineering 301",
    semester: "Fall 2025",
    students: 7,
  },
];

const TeacherAssessments = () => {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  // Sync with system theme preference on mount
  // useEffect(() => {
  //   const prefersDark = window.matchMedia(
  //     "(prefers-color-scheme: dark)"
  //   ).matches;
  //   setTheme(prefersDark ? "dark" : "light");
  // }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Handle course click
  const handleCourseClick = (courseCode) => {
    if (courseCode === "CS101") {
      navigate(`/teacher/assessments/1`);
    } else {
      console.log(`Navigating to assessments for ${courseCode} (placeholder)`);
      // Future: Add routes for other courses
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            My Courses
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Course Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Course Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            View and manage your courses
          </p>
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseClick(course.code)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {course.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {course.code}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {course.semester} • {course.students} students
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            Semester: {course.semester}
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              ></path>
                            </svg>
                            {course.students} students
                          </div>
                        </div>
                        <button
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleCourseClick(course.code);
                          }}
                        >
                          View Assessments
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssessments;
