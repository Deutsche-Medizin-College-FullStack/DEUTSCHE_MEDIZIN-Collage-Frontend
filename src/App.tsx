import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import PageLoader from "./components/ui/PageLoader";

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

// Teacher Pages
const TeacherLayout = React.lazy(() => import("./layouts/TeacherLayout"));
const TeacherDashboard = React.lazy(() => import("./pages/teacher/Dashboard"));
const TeacherProfile = React.lazy(() => import("./pages/teacher/TeacherProfile.tsx"));
const TeacherCourses = React.lazy(() => import("./pages/teacher/Courses"));
const TeacherStudents = React.lazy(() => import("./pages/teacher/Students"));
const TeacherAssessments = React.lazy(
  () => import("./pages/teacher/Assessments")
);
const AssessmentPage = React.lazy(
  () => import("./pages/teacher/AssessmentPage")
);

// Department Head Pages
const HeadLayout = React.lazy(() => import("./layouts/HeadLayout"));
const HeadDashboard = React.lazy(() => import("./pages/head/Dashboard"));
const HeadStudents = React.lazy(() => import("./pages/head/Students"));
const HeadTeachers = React.lazy(() => import("./pages/head/Teachers"));
const HeadCourses = React.lazy(() => import("./pages/head/Courses"));
const HeadReports = React.lazy(() => import("./pages/head/Reports"));
const HeadGrades = React.lazy(() => import("./pages/head/Grades"));
const CreateTeacher = React.lazy(() => import("./pages/head/CreateTeacher"));

// Registrar Pages
const RegistrarLayout = React.lazy(() => import("./layouts/RegistrarLayout"));
const SchoolBackgroundsEditor = React.lazy(
  () => import("./pages/registrar/settings/SchoolBackgroundsEditor.tsx")
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
const RegistrarCourses = React.lazy(() => import("./pages/registrar/Courses"));
const RegistrarAssessments = React.lazy(
  () => import("./pages/registrar/Assessments")
);
const SingleBatchPage = React.lazy(
  () => import("./pages/registrar/settings/SingleBatchPage .tsx")
);
const GradingSystemEditor = React.lazy(
  () => import("./pages/registrar/settings/GradingSystemEditor.tsx")
);
const DepartmentDetail = React.lazy(
  () => import("./pages/registrar/DepartmentDetail.tsx")
);
const EnrollmentTypesEditor = React.lazy(
  () => import("./pages/registrar/settings/EnrollmentTypesEditor.tsx")
);
const StudentDetail = React.lazy(
  () => import("./pages/registrar/StudentDetail")
);
const ApplicantDetail = React.lazy(
  () => import("./pages/registrar/ApplicantDetail")
);
const CustomStudentTable = React.lazy(
  () => import("./pages/registrar/CustomStudentTable")
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
const DeanReports = React.lazy(() => import("./pages/dean/Reports"));
const CreateDepartmentHead = React.lazy(
  () => import("./pages/dean/CreateDepartmentHead")
);
const DeanDepartments = React.lazy(() => import("./pages/dean/DeanDeparment"));
const DeanDepartmentDetail = React.lazy(
  () => import("./pages/dean/DeanDepartmentsDetails")
);

// Vice-Dean Pages
const ViceDeanLayout = React.lazy(() => import("./layouts/ViceDeanLayout"));
const ViceDeanDashboard = React.lazy(
  () => import("./pages/vice-dean/Dashboard")
);
const ViceDeanStudents = React.lazy(() => import("./pages/vice-dean/Students"));
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
const ManagerDashboard = React.lazy(() => import("./pages/manager/Dashboard"));
const ManagerReports = React.lazy(() => import("./pages/manager/Reports"));
const StudentCourseScoreTable = React.lazy(
  () => import("./pages/registrar/StudentCourseScoreTable")
);
const TenColumnEditableTablePage = React.lazy(
  () => import("./TenColumnEditableTablePage")
);
const BatchesEditor = React.lazy(
  () => import("./pages/registrar/settings/BatchesEditor")
);
const CoursesEditor = React.lazy(
  () => import("./pages/registrar/settings/CoursesEditor.tsx")
);
const CourseSourcesEditor = React.lazy(
  () => import("./pages/registrar/settings/CourseSourcesEditor.tsx")
);
const ProgramModalitiesEditor = React.lazy(
  () => import("./pages/registrar/settings/ProgramModalitiesEditor")
);
const ProgramLevelsEditor = React.lazy(
  () => import("./pages/registrar/settings/ProgramLevelsEditor .tsx")
);
const AttritionCausesEditor = React.lazy(
  () => import("./pages/registrar/settings/AttritionCausesEditor")
);
const Transcript_Generate = React.lazy(
  () => import("./pages/registrar/Transcript_Generate.tsx")
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
const NotificationsPage = React.lazy(
  () => import("./pages/registrar/NotificationsPage")
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
            {/* <Route path="/login" element={<LoginPage />} /> */}
            <Route path="/login" element={<SigningUp />} />
            {/* <Route path="/some" element={<TenColumnEditableTablePage />} /> */}
            <Route path="/some" element={<LocationEditor />} />
            <Route path="/register" element={<MultiStepRegistrationForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="settings" element={<StudentSetting />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="students/:courseId" element={<TeacherStudents />} />
              <Route path="assessments" element={<TeacherAssessments />} />
              <Route
                path="assessments/:courseId"
                element={<AssessmentPage />}
              />
            </Route>

            {/* Department Head Routes */}
            <Route path="/head" element={<HeadLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HeadDashboard />} />
              <Route path="students" element={<HeadStudents />} />
              <Route path="teachers" element={<HeadTeachers />} />
              <Route path="create-teacher" element={<CreateTeacher />} />
              <Route path="grades" element={<HeadGrades />} />
              <Route path="courses" element={<HeadCourses />} />
              <Route path="reports" element={<HeadReports />} />
            </Route>

            {/* Registrar Routes */}
            <Route path="/registrar" element={<RegistrarLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="departments" element={<RegistrarDepartments />} />
              <Route path="departments/:id" element={<DepartmentDetail />} />
              <Route path="applications/:id" element={<ApplicantDetail />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="dashboard" element={<RegistrarDashboard />} />
              <Route path="applications" element={<RegistrarApplications />} />
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
              <Route path="settings/semesters" element={<SemestersEditor />} />
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
              <Route path="settings/courses" element={<CoursesEditor />} />
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
              <Route path="registration-slips" element={<RegistrationSlip />} />
              <Route path="add-student" element={<AddStudent />} />
              <Route path="assessments" element={<RegistrarAssessments />} />
              <Route path="scores" element={<StudentCourseScoreTable />} />

              <Route path="tables" element={<CustomStudentTable />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Finance Routes */}
            <Route path="/finance" element={<FinanceLayout />}>
              <Route path="dashboard" element={<FinanceDashboard />} />
              <Route path="payments" element={<FinancePayments />} />
              <Route path="history" element={<FinanceHistory />} />
              <Route path="reports" element={<FinanceReports />} />
            </Route>

            {/* Dean Routes */}
            <Route path="/dean" element={<DeanLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DeanDashboard />} />
              <Route
                path="create-department-head"
                element={<CreateDepartmentHead />}
              />
              <Route path="students" element={<DeanStudents />} />
              <Route path="grades" element={<DeanGrades />} />
              <Route path="department" element={<DeanDepartments />} />
              <Route path="reports" element={<DeanReports />} />
              <Route
                path="departments/:id"
                element={<DeanDepartmentDetail />}
              />
            </Route>
            {/*Vice Dean Routes */}

            <Route path="/vice-dean" element={<ViceDeanLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ViceDeanDashboard />} />
              <Route
                path="create-department-head"
                element={<ViceCreateDepartmentHead />}
              />
              <Route path="students" element={<ViceDeanStudents />} />
              <Route path="grades" element={<ViceDeanGrades />} />
              <Route path="reports" element={<ViceDeanReports />} />
              <Route path="department" element={<ViceDeanDepartments />} />
              <Route
                path="departments/:id"
                element={<ViceDepartmentDetail />}
              />
            </Route>

            {/* Manager Routes */}
            <Route path="/general-manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DeanDashboard />} />
              <Route path="students" element={<ManagerStudents />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="reports" element={<DeanReports />} />
              <Route path="department" element={<DeanDepartments />} />
              <Route
                path="departments/:id"
                element={<DeanDepartmentDetail />}
              />
              <Route path="teachers" element={<ManagerTeachers />} />
              <Route path="dean" element={<DeanProfile />} />
              <Route path="vice-dean" element={<ViceDeanProfile />} />
              <Route path="registrar" element={<RegistrarProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
