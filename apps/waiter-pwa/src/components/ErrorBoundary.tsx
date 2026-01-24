import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-slate-500 mb-6 text-sm max-w-[260px]">
                        We encountered an unexpected error. Please try reloading the app.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Reload App
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
