import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    /** Optional fallback UI to render when an error occurs */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In production, you might want to send to an error tracking service
        // e.g., Sentry.captureException(error);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Check if custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                        </div>

                        {typeof window !== 'undefined' && (window as unknown as { __DEV__?: boolean }).__DEV__ !== false && this.state.error && (
                            <div className="bg-muted rounded-lg p-4 text-left overflow-auto max-h-48">
                                <p className="text-xs font-mono text-destructive break-all">
                                    {this.state.error.message}
                                </p>
                                <pre className="text-xs font-mono text-muted-foreground mt-2 whitespace-pre-wrap">
                                    {this.state.error.stack?.split('\n').slice(1, 5).join('\n')}
                                </pre>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={this.handleGoHome}>
                                Go Home
                            </Button>
                            <Button onClick={this.handleReload}>
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
