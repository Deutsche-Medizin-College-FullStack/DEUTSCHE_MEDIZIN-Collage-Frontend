import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import PageLoader from "./components/ui/PageLoader";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy load all components for code splitting
const LandingPage = React.lazy(() => import("./pages/public/LandingPage"));
const LearnMore = React.lazy(() => import("./pages/public/LearnMore"));
const LoginPage = React.lazy(() => import("./pages/public/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/public/RegisterPage"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/public/ForgotPasswordPage")
);
const MultiStepRegistrationForm = React.lazy(
  () => import("./registeration/MultiStepRegistrationForm")
);
const NotFound = React.lazy(() => import("./pages/NotFound/NotFound"));
const SigningUp = React.lazy(() => import("./registeration/SigningUp"));

// Student Pages
const StudentLayout = React.lazy(() => import("./layouts/StudentLayout"));
const StudentDashboard = React.lazy(() => import("./pages/student/Dashboard"));
const StudentProfile = React.lazy(() => import("./pages/student/Profile"));
const StudentGrades = React.lazy(() => import("./pages/student/Grades"));
const StudentSetting = React.lazy(() => import("./pages/student/Setting"));
const StudentNotifications = React.lazy(() => import("./pages/student/Notifications"));

// Teacher Pages
const TeacherLayout = React.lazy(() => import("./layouts/TeacherLayout"));
const TeacherDashboard = React.lazy(() => import("./pages/teacher/Dashboard"));
const TeacherCourses = React.lazy(() => import("./pages/teacher/Courses"));
const TeacherNotifications = React.lazy(() => import("./pages/teacher/Notifications"));
const TeacherStudents = React.lazy(
  () => import("./pages/teacher/TeacherStudents")
);
const AssessmentPage = React.lazy(
  () => import("./pages/teacher/AssessmentPage")
);
const TeacherProfile = React.lazy(
  () => import("./pages/teacher/TeacherProfile")
);

// Department Head Pages
const HeadLayout = React.lazy(() => import("./layouts/HeadLayout"));
const HeadDashboard = React.lazy(() => import("./pages/head/Dashboard"));
const HeadStudents = React.lazy(() => import("./pages/head/Students"));
const HeadStudentDetail = React.lazy(  () => import("./pages/head/StudentDetail"));
const HeadNotifications = React.lazy(() => import("./pages/head/Notifications"));
const HeadTeachers = React.lazy(() => import("./pages/head/Teachers"));
const HeadCourses = React.lazy(() => import("./pages/head/Courses"));
const HeadReports = React.lazy(() => import("./pages/head/Reports"));
const DepartmentHeadProfile = React.lazy(
  () => import("./pages/head/DepartmentHeadProfile")
);
const HeadGrades = React.lazy(() => import("./pages/head/Grades"));
const CreateTeacher = React.lazy(() => import("./pages/head/CreateTeacher"));
const HeadAssessments = React.lazy(() => import("./pages/head/Assessments"));
const HeadAssessmentDetail = React.lazy(
  () => import("./pages/head/AssessmentDetail")
);
const TeacherProfileDetail = React.lazy(
  () => import("./pages/head/TeacherProfileDetail")
);

// Registrar Pages
const StudentCourseScoreTab = React.lazy(
  () => import("./pages/registrar/Courses")
);
const RegistrarNotifications = React.lazy(() => import("./pages/registrar/Notifications"));
const RegistrarLayout = React.lazy(() => import("./layouts/RegistrarLayout"));
const SchoolBackgroundsEditor = React.lazy(
  () => import("./pages/registrar/settings/SchoolBackgroundsEditor")
);
const RegistrarDashboard = React.lazy(
  () => import("./pages/registrar/Dashboard")
);
const RegistrarApplications = React.lazy(
  () => import("./pages/registrar/Applications")
);
const RegistrarDepartments = React.lazy(
  () => import("./pages/registrar/Departments")
);
const RegistrarStudents = React.lazy(
  () => import("./pages/registrar/Students")
);
const AddStudent = React.lazy(() => import("./pages/registrar/AddStudent"));
const StudentCourseScoreTable = React.lazy(
  () => import("./pages/registrar/StudentCourseScoreTable")
);
const RegistrarCourses = React.lazy(() => import("./pages/registrar/Courses"));
//trouble
const RegistrarAssessments = React.lazy(
  () => import("./pages/registrar/Assessments")
);
const SingleBatchPage = React.lazy(
  () => import("./pages/registrar/settings/SingleBatchPage ")
);
const GradingSystemEditor = React.lazy(
  () => import("./pages/registrar/settings/GradingSystemEditor")
);
const DepartmentDetail = React.lazy(
  () => import("./pages/registrar/DepartmentDetail")
);
const EnrollmentTypesEditor = React.lazy(
  () => import("./pages/registrar/settings/EnrollmentTypesEditor")
);
const StudentDetail = React.lazy(
  () => import("./pages/registrar/StudentDetail")
);
const RegistrarAssessment = React.lazy(
  () => import("./pages/registrar/registrarAssessment")
);
const RegistrarAssessmentDetail = React.lazy(
  () => import("./pages/registrar/registrarAssessmentDetail")
);
const ApplicantDetail = React.lazy(
  () => import("./pages/registrar/ApplicantDetail")
);
const CustomStudentTable = React.lazy(
  () => import("./pages/registrar/CustomizableStudentTable")
);
const RejectedApplications = React.lazy(
  () => import("./pages/registrar/RejectedApplications")
);
const LocationEditor = React.lazy(
  () => import("./pages/registrar/settings/LocationEditor")
);
const AcademicYearEditor = React.lazy(
  () => import("./pages/registrar/settings/AcademicYearEditor")
);
const ImpairmentEditor = React.lazy(
  () => import("./pages/registrar/settings/ImpairmentEditor")
);
const CourseCategoriesEditor = React.lazy(
  () => import("./pages/registrar/settings/CourseCategoriesEditor")
);

// Finance Pages
const FinanceLayout = React.lazy(() => import("./layouts/FinanceLayout"));
const FinanceDashboard = React.lazy(() => import("./pages/finance/Dashboard"));
const FinancePayments = React.lazy(() => import("./pages/finance/Payments"));
const FinanceHistory = React.lazy(() => import("./pages/finance/History"));
const FinanceReports = React.lazy(() => import("./pages/finance/Reports"));

// Dean Pages
const DeanLayout = React.lazy(() => import("./layouts/DeanLayout"));
const DeanDashboard = React.lazy(() => import("./pages/dean/Dashboard"));
const DeanStudents = React.lazy(() => import("./pages/dean/Students"));
const DeanGrades = React.lazy(() => import("./pages/dean/Grades"));
const DeanNotifications = React.lazy(() => import("./pages/dean/Notifications"));
const DepartmentHeadsList = React.lazy(
  () => import("./pages/dean/DepartmentHeadsList")
);
const DepartmentHeadDetail = React.lazy(
  () => import("./pages/dean/DepartmentHeadDetail")
);
const DeanReports = React.lazy(() => import("./pages/dean/Reports"));
const CreateDepartmentHead = React.lazy(
  () => import("./pages/dean/CreateDepartmentHead")
);
const DeanDepartments = React.lazy(() => import("./pages/dean/DeanDeparment"));
const DeanDepartmentDetail = React.lazy(
  () => import("./pages/dean/DeanDepartmentsDetails")
);
const ProgramLevelsManagement = React.lazy(
  () => import("./pages/dean/ProgramLevelsManagement")
);
const ProgramModalitiesManagement = React.lazy(
  () => import("./pages/dean/ProgramModalitiesManagement")
);
const Dean_Profile = React.lazy(() => import("./pages/dean/Dean_Profile"));
const ViceDeansList = React.lazy(() => import("./pages/dean/ViceDeansList"));
const ViceDeanDetail = React.lazy(() => import("./pages/dean/ViceDeanDetail"));
const CreateViceDean = React.lazy(() => import("./pages/dean/CreateViceDean"));

// Vice-Dean Pages
const ViceDeanLayout = React.lazy(() => import("./layouts/ViceDeanLayout"));
const ViceDeanDashboard = React.lazy(  () => import("./pages/vice-dean/Dashboard"));
const ViceDeanNotifications = React.lazy(() => import("./pages/vice-dean/Notifications"));
const ViceDeanStudents = React.lazy(() => import("./pages/vice-dean/Students"));
const ViceDean_Profile = React.lazy(
  () => import("./pages/vice-dean/ViceDean_Profile")
);
const ViceDeanGrades = React.lazy(() => import("./pages/vice-dean/Grades"));
const ViceDeanReports = React.lazy(() => import("./pages/vice-dean/Reports"));
const ViceCreateDepartmentHead = React.lazy(
  () => import("./pages/vice-dean/CreateDepartmentHead")
);
const ViceDeanDepartments = React.lazy(
  () => import("./pages/vice-dean/ViceDepartments")
);
const ViceDepartmentDetail = React.lazy(
  () => import("./pages/vice-dean/ViceDepartmentDetail")
);

// Manager Pages
const ManagerLayout = React.lazy(() => import("./layouts/ManagerLayout"));
const ManagerReports = React.lazy(() => import("./pages/manager/Reports"));

// const ManagerDashboard = React.lazy(
//   () => import("./pages/manager/GeneralManagerDashboard")
// );
const GeneralManagerProfile = React.lazy(
  () => import("./pages/manager/GeneralManagerProfile")
);
const StudentsCGPAPage = React.lazy(
  () => import("./pages/manager/StudentsCGPAPage")
);
const DepartmentHeadsPage = React.lazy(
  () => import("./pages/manager/DepartmentHeadsPage")
);
const GeneralManagerDashboard = React.lazy(
  () => import("./pages/manager/GeneralManagerDashboard")
);
const TeachersPage = React.lazy(() => import("./pages/manager/TeachersPage"));
const TenColumnEditableTablePage = React.lazy(
  () => import("./TenColumnEditableTablePage")
);
const BatchesEditor = React.lazy(
  () => import("./pages/registrar/settings/BatchesEditor")
);

const CourseSourcesEditor = React.lazy(
  () => import("./pages/registrar/settings/CourseSourcesEditor")
);
const ProgramModalitiesEditor = React.lazy(
  () => import("./pages/registrar/settings/ProgramModalitiesEditor")
);
const ProgramLevelsEditor = React.lazy(
  () => import("./pages/registrar/settings/ProgramLevelsEditor ")
);
const AttritionCausesEditor = React.lazy(
  () => import("./pages/registrar/settings/AttritionCausesEditor")
);
const Transcript_Generate = React.lazy(
  () => import("./pages/registrar/Transcript_Generate")
);
const SemestersEditor = React.lazy(
  () => import("./pages/registrar/settings/SemestersEditor")
);
const ClassYearsEditor = React.lazy(
  () => import("./pages/registrar/settings/ClassYearsEditor")
);
const ManagerStudents = React.lazy(
  () => import("./pages/manager/ManagerStudents")
);
const ManagerTeachers = React.lazy(
  () => import("./pages/manager/ManagerTeachers")
);
const DeanProfile = React.lazy(() => import("./pages/manager/DeanProfile"));
const ViceDeanProfile = React.lazy(
  () => import("./pages/manager/ViceDeanProfile")
);
const RegistrarProfile = React.lazy(
  () => import("./pages/manager/RegistrarProfile")
);
const RegistrationSlip = React.lazy(
  () => import("./pages/registrar/RegistrationSlips")
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="college-ui-theme">
      <div className="min-h-screen bg-background">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/login" element={<SigningUp />} />
            {/* <Route path="/some" element={<TenColumnEditableTablePage />} /> */}
            <Route path="/register" element={<MultiStepRegistrationForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Testing/Development Routes - Consider removing in production */}
            <Route path="/some" element={<TenColumnEditableTablePage />} />
            <Route path="/location-test" element={<LocationEditor />} />

            {/* Protected Routes */}
            {/* Student Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="grades" element={<StudentGrades />} />
                <Route path="settings" element={<StudentSetting />} />
                <Route path="notifications" element={<StudentNotifications />} />
              </Route>
            </Route>

            {/* Teacher Routes */}

            <Route element={<ProtectedRoute />}>
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="notifications" element={<TeacherNotifications />} />
                <Route
                  path="students/:assignmentId"
                  element={<TeacherStudents />}
                />
                <Route
                  path="assessments/:assignmentId"
                  element={<AssessmentPage />}
                />
                <Route path="profile" element={<TeacherProfile />} />
              </Route>
            </Route>

            {/* Department Head Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/head" element={<HeadLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HeadDashboard />} />
                <Route path="students" element={<HeadStudents />} />
                <Route path="notifications" element={<HeadNotifications />} />
                <Route path="students/:id" element={<HeadStudentDetail />} />
                <Route path="teachers" element={<HeadTeachers />} />
                <Route path="create-teacher" element={<CreateTeacher />} />
                <Route path="teachers/:id" element={<TeacherProfileDetail />} />
                <Route path="grades" element={<HeadGrades />} />
                <Route path="courses" element={<HeadCourses />} />
                <Route path="reports" element={<HeadReports />} />
                <Route path="assessments" element={<HeadAssessments />} />
                <Route
                  path="assessments/:assignmentId"
                  element={<HeadAssessmentDetail />}
                />
                <Route path="profile" element={<DepartmentHeadProfile />} />
              </Route>
            </Route>

            {/* Registrar Routes */}

            <Route element={<ProtectedRoute />}>
              <Route path="/registrar" element={<RegistrarLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="departments" element={<RegistrarDepartments />} />
                <Route path="notifications" element={<RegistrarNotifications />} />
                <Route path="departments/:id" element={<DepartmentDetail />} />
                <Route path="applications/:id" element={<ApplicantDetail />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="dashboard" element={<RegistrarDashboard />} />
                <Route
                  path="applications"
                  element={<RegistrarApplications />}
                />
                <Route path="assessments" element={<RegistrarAssessment />} />
                <Route
                  path="assessments/:assignmentId"
                  element={<RegistrarAssessmentDetail />}
                />
                <Route path="transcripts" element={<Transcript_Generate />} />
                <Route path="settings/location" element={<LocationEditor />} />
                <Route
                  path="settings/academic-years"
                  element={<AcademicYearEditor />}
                />
                <Route
                  path="settings/batches/:id"
                  element={<SingleBatchPage />}
                />
                <Route path="settings/batches" element={<BatchesEditor />} />
                <Route
                  path="settings/semesters"
                  element={<SemestersEditor />}
                />
                <Route
                  path="settings/school-background"
                  element={<SchoolBackgroundsEditor />}
                />
                <Route
                  path="settings/enrollment"
                  element={<EnrollmentTypesEditor />}
                />
                <Route
                  path="settings/grading-systems"
                  element={<GradingSystemEditor />}
                />
                <Route
                  path="settings/class-years"
                  element={<ClassYearsEditor />}
                />
                <Route
                  path="settings/impairments"
                  element={<ImpairmentEditor />}
                />
                <Route
                  path="settings/program-modality"
                  element={<ProgramModalitiesEditor />}
                />
                <Route
                  path="settings/program-level"
                  element={<ProgramLevelsEditor />}
                />
                <Route
                  path="settings/course-category"
                  element={<CourseCategoriesEditor />}
                />
                <Route
                  path="settings/course-source"
                  element={<CourseSourcesEditor />}
                />
                <Route
                  path="settings/attritions"
                  element={<AttritionCausesEditor />}
                />
                <Route
                  path="rejected-applications"
                  element={<RejectedApplications />}
                />
                <Route
                  path="rejected-applications/:id"
                  element={<ApplicantDetail />}
                />
                <Route path="students" element={<RegistrarStudents />} />
                <Route
                  path="registration-slips"
                  element={<RegistrationSlip />}
                />
                <Route path="add-student" element={<AddStudent />} />
                <Route path="courses" element={<RegistrarCourses />} />
                {/*another trouble*/}
                <Route path="assessments" element={<RegistrarAssessments />} />
                <Route path="scores" element={<StudentCourseScoreTable />} />
                <Route path="tables" element={<CustomStudentTable />} />
                <Route path="notifications" element={<RegistrarNotifications />} />
              </Route>
            </Route>

            {/* Finance Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/finance" element={<FinanceLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FinanceDashboard />} />
                <Route path="payments" element={<FinancePayments />} />
                <Route path="history" element={<FinanceHistory />} />
                <Route path="reports" element={<FinanceReports />} />
              </Route>
            </Route>

            {/* Dean Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dean" element={<DeanLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DeanDashboard />} />
                <Route
                  path="program-level"
                  element={<ProgramLevelsManagement />}
                />
                <Route path="notifications" element={<DeanNotifications />} />
                <Route
                  path="create-department-head"
                  element={<CreateDepartmentHead />}
                />
                <Route
                  path="program-modality"
                  element={<ProgramModalitiesManagement />}
                />
                <Route path="profile" element={<Dean_Profile />} />
                <Route path="students" element={<DeanStudents />} />
                <Route
                  path="department-heads"
                  element={<DepartmentHeadsList />}
                />
                <Route
                  path="department-heads/:id"
                  element={<DepartmentHeadDetail />}
                />
                <Route path="grades" element={<DeanGrades />} />
                <Route path="department" element={<DeanDepartments />} />
                <Route path="reports" element={<DeanReports />} />
                <Route
                  path="departments/:id"
                  element={<DeanDepartmentDetail />}
                />

                <Route path="vice-deans" element={<ViceDeansList />} />
                <Route path="vice-deans/:id" element={<ViceDeanDetail />} />
                <Route path="create-vice-dean" element={<CreateViceDean />} />
              </Route>
            </Route>

            {/* Vice Dean Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/vice-dean" element={<ViceDeanLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ViceDeanDashboard />} />
                <Route path="notifications" element={<ViceDeanNotifications />} />
                <Route
                  path="create-department-head"
                  element={<ViceCreateDepartmentHead />}
                />
                <Route path="students" element={<ViceDeanStudents />} />
                <Route path="grades" element={<ViceDeanGrades />} />
                <Route path="reports" element={<ViceDeanReports />} />
                <Route path="department" element={<ViceDeanDepartments />} />
                <Route path="profile" element={<ViceDean_Profile />} />
                <Route
                  path="departments/:id"
                  element={<ViceDepartmentDetail />}
                />
              </Route>
            </Route>

            {/* Manager Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/general-manager" element={<ManagerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<GeneralManagerDashboard />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="profile" element={<GeneralManagerProfile />} />
                <Route path="students" element={<StudentsCGPAPage />} />
                <Route
                  path="departments/:id"
                  element={<DeanDepartmentDetail />}
                />
                <Route
                  path="department-heads"
                  element={<DepartmentHeadsPage />}
                />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="dean" element={<DeanProfile />} />
                <Route path="vice-dean" element={<ViceDeanProfile />} />
                <Route path="registrar" element={<RegistrarProfile />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
      </div>
    </ThemeProvider>
  );
}

export default App;
