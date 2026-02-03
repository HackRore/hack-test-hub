import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black text-primary font-mono p-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">SYSTEM_FAILURE</h1>
                    <p className="text-gray-400 mb-8 max-w-md">
                        A critical error occurred in the diagnostic engine.
                    </p>
                    <div className="bg-gray-900 border border-red-900 p-4 rounded text-left text-red-500 text-xs overflow-auto max-w-2xl mb-8">
                        {this.state.error?.toString()}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-colors"
                    >
                        REBOOT_SYSTEM()
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
