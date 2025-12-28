// const endPoints = {
//   login: "/auth/login",
//   register: "/auth/register",
//   applicantsRegister:
//     "https://deutschemedizin-collage-backend-production.up.railway.app/api/applicants/register",
//   registrarApplicantRegister: "/auth/register/student",
//   departmentHeadDashboard: "/department-heads/dashboard",
//   getViceDeanProfile: "/vice-deans/profile",
//   getDeanProfile: "/deans/profile",
//   studentStatus: "/student-statuses",
//   myDepartmentCourses: "/department-heads/my-courses",
//   studentDashboard: "/student/dashboard",
//   profile: "/students/profile",
//   academicYears: "/academic-years",
//   getGeneralManagerProfile: "/general-managers/profile",
//   getAllStudentsCGPA: "/general-managers/get-all-students-cgpa",
//   getGeneralManagerDashboard: "/general-managers/dashboard",
//   updateGeneralManagerProfile: "/general-managers/update",
//   getDepartmentHeadPhoto: "/department-heads/profile/photo",
//   getActiveDeans: "/deans/active",
//   getActiveViceDeans: "/vice-deans/active",
//   getDeanById: "/deans",
//   getViceDeanById: "/vice-deans",
//   teacherCourseAssignments: (teacherId: number | string) =>
//     `/teachers/${teacherId}/course-assignments`,
//   teacherCourseAssignmentDeletion: (
//     teacherId: number | string,
//     assignmentId: number | string
//   ) => `/teachers/${teacherId}/course-assignments/${assignmentId}`,
//   gradingSystem: "/grading-systems",
//   getDepartmentHeadProfile: "/department-heads/profile",
//   studentCopy: "/student-copy/generate",
//   registerTeacher: "/auth/register/teacher",
//   departmentTeachers: "/department-heads/teachers",
//   studentGradeReports: "/student/grade-reports",
//   semesters: "/semesters",
//   attritionCauses: "/attrition-causes",
//   batchClassSemsterYear: "/bcsy",
//   applicantsList: "/applicants",
//   applicantDetail: "/applicants/:id",
//   applicantUpdateStatus: "/applicants/:id/status",
//   applicantPhoto: "/applicants/:id/photo",
//   applicantDocument: "/applicants/:id/document",
//   enrollmentTypes: "/enrollment-type",
//   courseCategory: "/course-categories",
//   programModality: "/program-modality",
//   students: "/students",
//   studentsDeactivation: "/students/:id/disable",
//   studentsActivation: "/students/:id/enable",
//   resetStudentPassword:
//     "/auth/registrar/students/:studentUserId/reset-password",
//   createDepartmentHead: "/auth/create-department-head",
//   createTeacher: "/auth/create-teacher",
//   departmentHeads: "/department-heads",
//   teachers: "/teachers",
//   departments: "/departments",
//   impairments: "/impairments",
//   specificImpairtment: "/impairments/:id",
//   singleImpairment: "/impairments/single",
//   schoolBackgrounds: "/school-backgrounds",
//   classYears: "/class-years",
//   BatchClassYearSemesters: "/bcsy",
//   batches: "/batches",
//   singleBatch: "/batches/:id",
//   courses: "/courses/single",
//   allCourses: "/courses",
//   courseById: "/courses/:id",
//   regions: "/region",
//   allWoreda: "/woreda",
//   allZones: "/zone",
//   allRegion: "/region",
//   zonesByRegion: "/zone/region",
//   woredasByZone: "/woreda/zone",
//   notifications: "/notifications/me",
//   notificationsLatest: "/notifications/me/latest",
//   markNotificationRead: "/notifications/:id/read",
//   markAllNotificationsRead: "/notifications/me/read-all",
//   programLevels: "/program-levels",
//   programLevelByCode: "/program-levels/:id",
//   programModalities: "/program-modality",
//   generateGradeReport: "/grade-report/generate",
//   programModalityByCode: "/program-modality/:id",
//   studentsSlip: "/students/slip-production",
//   lookupsDropdown: "/filters/options",
//   slipPreview: "student-slips/preview",
//   generateSlips: "/student-slips/generate",
//   addCourse: "/student-course-scores/add",
//   updateScore:
//     "/student-course-scores/score/:studentId/:courseId/:batchClassYearSemesterId",
//   updateReleaseStatus:
//     "/student-course-scores/release/:studentId/:courseId/:batchClassYearSemesterId",
//   getGrade: "/student-course-scores/:scoreId/grade",
//   getAll: "/student-course-scores/all",
//   bulkUpdate: "/student-course-scores/bulk-update",
//   getCurrentUser: "/auth/me",
//   changePassword: "/auth/me/change-password",
//   getTeacherProfile: "/teachers/profile",
//   getTeacherCourses: "/teachers/my-courses",

//   createAssessment: "/assessments",
//   recordStudentScore: "/student-assessments",
//   updateStudentScore: "/student-assessments/:assessmentId/:studentId",
//   getCourseScores:
//     "/student-assessments/courses/:teacherCourseAssignmentId/scores",
//   getTeacherDashboard: "/teachers/dashboard",

//   bulkCreateAssessments: "/assessments/bulk",
//   bulkUpdateAssessments: "/assessments/bulk",
//   bulkDeleteAssessments: "/assessments/bulk",

//   bulkUpdateStudentScores: "/student-assessments/bulk",
//   getCourseStudents: "/teachers/courses/:teacherCourseAssignmentId/students",

//   approveAssessments:
//     "/assessments/assignment/:teacherCourseAssignmentId/approve",

//   getDepartmentHeadAssessments: "/department-heads/assessments/scores",
//   approveRejectAllAssessments:
//     "/department-heads/assignments/:teacherCourseAssignmentId/approve-all",

//   updateViceDeanProfile: "/vice-deans/update",
//   updateDeanProfile: "/deans/update",
//   departmentStudents: "/department-heads/my-students",
//   studentById: "/students",
//   deanDashboard: "/deans/dashboard",
// };

// export default endPoints;
const endPoints = {
  // Auth & Registration
  login: "/auth/login",
  register: "/auth/register",
  applicantsRegister:
    "https://deutschemedizin-collage-backend-production.up.railway.app/api/applicants/register", // ← kept from main
  registrarApplicantRegister: "/auth/register/student",
  resetStudentPassword:
    "/auth/registrar/students/:studentUserId/reset-password",
  createDepartmentHead: "/auth/create-department-head",
  createTeacher: "/auth/create-teacher",
  getCurrentUser: "/auth/me",
  changePassword: "/auth/me/change-password",

  // Profiles
  getDepartmentHeadProfile: "/department-heads/profile",
  profile: "/students/profile",
  departments: "/departments",
  getDepartmentHeadById: (id: string | number) => `/department-heads/${id}`,
  getDepartmentHeadPhoto: (id: string | number) =>
    `/department-heads/get-photo/${id}`,
  getDepartmentHeadDocument: (id: string | number) =>
    `/department-heads/get-document/${id}`,
  updateDepartmentHead: (id: string | number) => `/department-heads/${id}`,
  getViceDeanProfile: "/vice-deans/profile",
  updateViceDeanProfile: "/vice-deans/update",
  getDeanProfile: "/deans/profile",
  updateDeanProfile: "/deans/update",
  getTeacherProfile: "/teachers/profile",
  registerTeacher: "/auth/register/teacher",

  // Dashboards
  departmentHeadDashboard: "/department-heads/dashboard",
  studentDashboard: "/student/dashboard",
  profile: "/students/profile",
  academicYears: "/academic-years",
  teacherCourseAssignments: (teacherId: number | string) =>
    `/teachers/${teacherId}/course-assignments`, // ← function from main
  teacherCourseAssignmentDeletion: (
    teacherId: number | string,
    assignmentId: number | string
  ) => `/teachers/${teacherId}/course-assignments/${assignmentId}`,
  getTeacherCourses: "/teachers/my-courses",
  ) => `/teachers/${teacherId}/course-assignments/${assignmentId}`, // ← from main
  gradingSystem: "/grading-systems",
  getDepartmentHeadProfile: "/department-heads/profile",
  studentCopy: "/student-copy/generate",
  registerTeacher: "/auth/register/teacher",
  departmentTeachers: "/department-heads/teachers",
  getCourseStudents: "/teachers/courses/:teacherCourseAssignmentId/students",
  teachers: "/teachers",

  // Assessments & Grading
  gradingSystem: "/grading-systems",
  addCourse: "/student-course-scores/add",
  updateScore:
    "/student-course-scores/score/:studentId/:courseId/:batchClassYearSemesterId",
  updateReleaseStatus:
    "/student-course-scores/release/:studentId/:courseId/:batchClassYearSemesterId",
  getGrade: "/student-course-scores/:scoreId/grade",
  getAll: "/student-course-scores/all",
  bulkUpdate: "/student-course-scores/bulk-update",
  getCurrentUser: "/auth/me",
  changePassword: "/auth/me/change-password",
  getTeacherProfile: "/teachers/profile",
  getTeacherCourses: "/teachers/my-courses",
  // Your new additions go here (from your branch)
  getGeneralManagerProfile: "/general-managers/profile",
  getAllStudentsCGPA: "/general-managers/get-all-students-cgpa",
  getGeneralManagerDashboard: "/general-managers/dashboard",
  updateGeneralManagerProfile: "/general-managers/update",
  getDepartmentHeadPhoto: "/department-heads/profile/photo",
  getActiveDeans: "/deans/active",
  getActiveViceDeans: "/vice-deans/active",
  getDeanById: "/deans",
  getViceDeanById: "/vice-deans",
  // ... add any other endpoints you added on your branch
};
export default endPoints;