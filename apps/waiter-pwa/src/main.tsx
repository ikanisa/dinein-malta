import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ToastProvider } from './components/Toast.tsx'
import { SupabaseProvider } from './contexts/SupabaseContext.tsx'
import { CartProvider } from './contexts/CartContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <SupabaseProvider>
                <CartProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </CartProvider>
            </SupabaseProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
