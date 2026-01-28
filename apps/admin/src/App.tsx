import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import { ThemeProvider, ErrorBoundary } from '@dinein/ui'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Claims from './pages/Claims'
import Venues from './pages/Venues'
import Menus from './pages/Menus'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import AIAnalytics from './pages/AIAnalytics'
import Approvals from './pages/Approvals'
import { AdminLayout } from './layouts/AdminLayout'

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider storageKey="dinein-admin-theme">
                <AdminProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public route */}
                            <Route path="/" element={<Login />} />

                            {/* Protected admin routes */}
                            <Route path="/dashboard" element={
                                <ProtectedAdminRoute>
                                    <AdminLayout />
                                </ProtectedAdminRoute>
                            }>
                                <Route index element={<Overview />} />
                                <Route path="claims" element={<Claims />} />
                                <Route path="venues" element={<Venues />} />
                                <Route path="menus" element={<Menus />} />
                                <Route path="users" element={<Users />} />
                                <Route path="approvals" element={<Approvals />} />
                                <Route path="audit" element={<AuditLogs />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="ai" element={<AIAnalytics />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </AdminProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}

export default App
