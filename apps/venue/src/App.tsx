import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OwnerProvider } from './context/OwnerContext'
import Login from './pages/Login'
import Claim from './pages/Claim'
import Overview from './pages/Overview'
import MenuManager from './pages/MenuManager'
import OrdersQueue from './pages/OrdersQueue'
import IngestMenu from './pages/IngestMenu'
import Settings from './pages/Settings'
import { DashboardLayout } from './layouts/DashboardLayout'
import { ThemeProvider, ErrorBoundary } from '@dinein/ui'

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider storageKey="dinein-venue-theme">
                <OwnerProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/claim" element={<Claim />} />

                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<Overview />} />
                                <Route path="orders" element={<OrdersQueue />} />
                                <Route path="menu" element={<MenuManager />} />
                                <Route path="ingest/:jobId" element={<IngestMenu />} />
                                <Route path="settings" element={<Settings />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </OwnerProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}

export default App

