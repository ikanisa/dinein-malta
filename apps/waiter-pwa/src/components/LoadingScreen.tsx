import { Bot } from 'lucide-react'

export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Bot className="h-10 w-10 text-green-600 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                </div>
                <p className="mt-4 text-gray-600">Loading Waiter AI...</p>
            </div>
        </div>
    )
}
