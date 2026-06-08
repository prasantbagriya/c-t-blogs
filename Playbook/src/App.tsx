/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import PlaybookPage from "./pages/PlaybookPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/playbook" replace />} />
            <Route path="/playbook" element={<PlaybookPage />} />
            <Route path="/login" element={<LoginPage user={user} />} />
            <Route
              path="/admin"
              element={user ? <AdminPage user={user} /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
        <footer className="bg-white border-t py-8 px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Playbook Store. Proper Design Copy Shalom.
        </footer>
      </div>
    </BrowserRouter>
  );
}

