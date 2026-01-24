import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import { ThemeProvider, ErrorBoundary } from '@dinein/ui'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Claims from './pages/Claims'
import Venues from './pages/Venues'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'
import { AdminLayout } from './layouts/AdminLayout'

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider storageKey="dinein-admin-theme">
                <AdminProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />

                            <Route path="/dashboard" element={<AdminLayout />}>
                                <Route index element={<Overview />} />
                                <Route path="claims" element={<Claims />} />
                                <Route path="venues" element={<Venues />} />
                                <Route path="users" element={<Users />} />
                                <Route path="audit" element={<AuditLogs />} />
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
