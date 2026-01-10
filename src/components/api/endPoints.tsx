const endPoints = {
  /* =======================     Auth & Account  ======================== */
  login: "/auth/login",
  register: "/auth/register",
  registrarApplicantRegister: "/auth/register/student",
  registerTeacher: "/auth/register/teacher",
  createTeacher: "/auth/create-teacher",
  createDepartmentHead: "/auth/create-department-head",
  getCurrentUser: "/auth/me",
  changePassword: "/auth/me/change-password",
  resetStudentPassword:
    "/auth/registrar/students/:studentUserId/reset-password",
  applicantAccept: "/applicants/:id/accept",
  applicantsRegister:
    "https://deutschemedizin-collage-backend-production.up.railway.app/api/applicants/register",

  /* =======================     Profiles  ======================== */
  profile: "/students/profile",
  getTeacherProfile: "/teachers/profile",
  getViceDeanProfile: "/vice-deans/profile",
  updateViceDeanProfile: "/vice-deans/update",
  getDeanProfile: "/deans/profile",
  updateDeanProfile: "/deans/update",
  getDepartmentHeadProfile: "/department-heads/profile",
  departmentHeads: "/department-heads",

  getDepartmentHeadById: (id: string | number) => `/department-heads/${id}`,
  updateDepartmentHead: (id: string | number) => `/department-heads/${id}`,
  getDepartmentHeadPhoto: (id: string | number) =>
    `/department-heads/get-photo/${id}`,
  getDepartmentHeadDocument: (id: string | number) =>
    `/department-heads/get-document/${id}`,

  /* =======================     Dashboards  ======================== */
  departmentHeadDashboard: "/department-heads/dashboard",
  studentDashboard: "/student/dashboard",
  teacherDashboard: "/teachers/dashboard",
  deanDashboard: "/deans/dashboard",
  getGeneralManagerDashboard: "/general-managers/dashboard",
  getRegistrarDashboard: "/registrar/dashboard",
  viceDeanDashboard: "/vice-deans/dashboard",

  /* =======================     Teachers & Courses  ======================== */
  teachers: "/teachers",
  departments: "/departments",
  getDepartmentById: (id: string | number) => `/departments/${id}`,
  departmentTeachers: "/department-heads/teachers",
  myDepartmentCourses: "/department-heads/my-courses",
  academicYears: "/academic-years",
  semesters: "/semesters",

  teacherCourseAssignments: (teacherId: string | number) =>
    `/teachers/${teacherId}/course-assignments`,

  teacherCourseAssignmentDeletion: (
    teacherId: string | number,
    assignmentId: string | number
  ) => `/teachers/${teacherId}/course-assignments/${assignmentId}`,

  getTeacherCourses: "/teachers/my-courses",
  getCourseStudents: "/teachers/courses/:teacherCourseAssignmentId/students",

  /* =======================     Students  ======================== */
  students: "/students",
  allStudents: "/all-students",
  studentById: "/students",
  studentStatus: "/student-statuses",
  studentGradeReports: "/student/grade-reports",
  departmentStudents: "/department-heads/my-students",
  studentsActivation: "/students/:id/enable",
  studentsDeactivation: "/students/:id/disable",
  studentsSlip: "/students/slip-production",
  getAllStudentsCGPA_VD: "/vice-deans/get-all-students-cgpa",

  /* =======================     Assessments & Grading  ======================== */
  gradingSystem: "/grading-systems",
  createAssessment: "/assessments",
  recordStudentScore: "/student-assessments",
  updateStudentScore: "/student-assessments/:assessmentId/:studentId",

  getCourseScores:
    "/student-assessments/courses/:teacherCourseAssignmentId/scores",

  approveAssessments:
    "/assessments/assignment/:teacherCourseAssignmentId/approve",

  getDepartmentHeadAssessments: "/department-heads/assessments/scores",

  approveRejectAllAssessments:
    "/department-heads/assignments/:teacherCourseAssignmentId/approve-all",

  bulkCreateAssessments: "/assessments/bulk",
  bulkUpdateAssessments: "/assessments/bulk",
  bulkDeleteAssessments: "/assessments/bulk",
  bulkUpdateStudentScores: "/student-assessments/bulk",

  /* =======================     Course Scores  ======================== */
  addCourse: "/student-course-scores/add",
  updateScore:
    "/student-course-scores/score/:studentId/:courseId/:batchClassYearSemesterId",
  updateReleaseStatus:
    "/student-course-scores/release/:studentId/:courseId/:batchClassYearSemesterId",
  getGrade: "/student-course-scores/:scoreId/grade",
  getAllScores: "/student-course-scores/all",
  bulkUpdateScores: "/student-course-scores/bulk-update",

  /* =======================     Applicants  ======================== */
  applicantsList: "/applicants",
  applicantDetail: "/applicants/:id",
  applicantUpdateStatus: "/applicants/:id/status",
  applicantPhoto: "/applicants/:id/photo",
  applicantDocument: "/applicants/:id/document",

  /* =======================     Programs & Courses  ======================== */
  courses: "/courses/single",
  allCourses: "/courses",
  courseById: "/courses/:id",
  courseCategory: "/course-categories",
  programLevels: "/program-levels",
  programLevelByCode: "/program-levels/:id",
  programModalities: "/program-modality",
  programModalityByCode: "/program-modality/:id",
  generateGradeReport: "/grade-report/generate",

  /* =======================     Batches & Classes  ======================== */
  batches: "/batches",
  singleBatch: "/batches/:id",
  classYears: "/class-years",
  BatchClassYearSemesters: "/bcsy",
  batchClassSemsterYear: "/bcsy",
  courseSources: "/course-sources",

  /* =======================     Locations  ======================== */
  regions: "/region",
  allRegion: "/region",
  allZones: "/zone",
  allWoreda: "/woreda",
  zonesByRegion: "/zone/region",
  woredasByZone: "/woreda/zone",

  /* =======================     Notifications  ======================== */
  notifications: "/notifications/me",
  notificationsLatest: "/notifications/me/latest",
  markNotificationRead: "/notifications/:id/read",
  markAllNotificationsRead: "/notifications/me/read-all",

  /* =======================     Misc  ======================== */
  impairments: "/impairments",
  specificImpairtment: "/impairments/:id",
  singleImpairment: "/impairments/single",
  schoolBackgrounds: "/school-backgrounds",
  enrollmentTypes: "/enrollment-type",
  attritionCauses: "/attrition-causes",
  lookupsDropdown: "/filters/options",
  slipPreview: "student-slips/preview",
  generateSlips: "/student-slips/generate",
  studentCopy: "/student-copy/generate",

  /* =======================     General Manager  ======================== */
  getGeneralManagerProfile: "/general-managers/profile",
  getAllStudentsCGPA: "/general-managers/get-all-students-cgpa",
  updateGeneralManagerProfile: "/general-managers/update",


  /* =======================     Deans  ======================== */
  getActiveDeans: "/deans/active",
  getActiveViceDeans: "/vice-deans/active",
  getDeanById: "/deans",
  fields: "/students/fields",
  getAllStudentsCGPA_DN:"/deans/get-all-students-cgpa",
  /* =======================     Registrar  ======================== */
  getRegistrarHeadApprovedScores: "/registrar/head-approved-scores",
  registrarFinalApproveAll:
    "/registrar/assignments/:teacherCourseAssignmentId/final-approve-all",

  /* =======================     Vice Deans  ======================== */
  createViceDean: "/auth/register/vice-dean",
  getViceDeanById: "/vice-deans",
  updateViceDean: "/vice-deans",
  getViceDeanPhoto: "/vice-deans/get-photo",
  getViceDeanDocument: "/vice-deans/get-document",
};

export default endPoints;
