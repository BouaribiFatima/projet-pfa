// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Ventes from './pages/Ventes';
import Previsions from './pages/Previsions';
import Utilisateurs from './pages/Utilisateurs';
import Rapports from './pages/Rapports';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Accessible à tous les rôles */}
                    <Route path="/dashboard" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    } />
                    <Route path="/ventes" element={
                        <PrivateRoute><Ventes /></PrivateRoute>
                    } />

                    {/* Superadmin + Manager */}
                  <Route path="/produits" element={
                       <RoleRoute roles={['superadmin', 'manager']}>
                          <Produits />
                       </RoleRoute>
                    } />
                    <Route path="/previsions" element={
                        <RoleRoute roles={['superadmin', 'manager']}>
                            <Previsions />
                        </RoleRoute>
                    } />
                    <Route path="/rapports" element={
                        <RoleRoute roles={['superadmin', 'manager']}>
                            <Rapports />
                        </RoleRoute>
                    } />

                    {/* Superadmin seulement */}
                    <Route path="/utilisateurs" element={
                        <RoleRoute roles={['superadmin']}>
                            <Utilisateurs />
                        </RoleRoute>
                    } />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}