import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminStudents from './pages/admin/Students';
import AdminExams from './pages/admin/Exams';
import AdminQuestions from './pages/admin/Questions';
import AdminResults from './pages/admin/Results';
import AdminResultDetail from './pages/admin/ResultDetail';
import StudentLogin from './pages/student/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentExam from './pages/student/Exam';
import StudentResult from './pages/student/Result';
import AdminSignup from './pages/admin/Signup';
import AboutUs from './pages/info/AboutUs';
import ContactUsPage from './pages/info/ContactUs';
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsConditions from './pages/info/TermsConditions';
import CookiesPolicy from './pages/info/CookiesPolicy';
import RefundPolicy from './pages/info/RefundPolicy';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
};

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('student_token');
  return token ? children : <Navigate to="/student/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter basename="/portal">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portal" element={<Home />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/classes" element={<AdminRoute><AdminClasses /></AdminRoute>} />
        <Route path="/admin/subjects" element={<AdminRoute><AdminSubjects /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
        <Route path="/admin/exams" element={<AdminRoute><AdminExams /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
        <Route path="/admin/results" element={<AdminRoute><AdminResults /></AdminRoute>} />
        <Route path="/admin/results/:id" element={<AdminRoute><AdminResultDetail /></AdminRoute>} />
        
        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/exam/:id" element={<StudentRoute><StudentExam /></StudentRoute>} />
        <Route path="/student/result/:id" element={<StudentRoute><StudentResult /></StudentRoute>} />
        
        {/* Informational Routes */}
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/cookies-policy" element={<CookiesPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

