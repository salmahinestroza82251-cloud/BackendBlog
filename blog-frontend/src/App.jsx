import { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/Home';
import NotesPage from './pages/Notespage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import ChatPage from './pages/Chat';

function AppRoutes() {
  const [busqueda, setBusqueda] = useState('');
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Rutas de autenticación (si ya inició sesión, lo manda a /) */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />

        {/* Ruta raíz: LandingPage para visitantes | HomePage (apuntes) para usuarios autenticados */}
        <Route
          path="/"
          element={
            <>
              <Navbar busqueda={busqueda} setBusqueda={setBusqueda} />
              {token ? <HomePage busqueda={busqueda} /> : <LandingPage />}
            </>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Navbar busqueda={busqueda} setBusqueda={setBusqueda} />
              <NotesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Navbar busqueda={busqueda} setBusqueda={setBusqueda} />
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Cualquier ruta desconocida redirige a la raíz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}