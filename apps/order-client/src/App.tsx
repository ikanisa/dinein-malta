import { useState } from 'react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-sm">
                <h1 className="text-4xl font-bold tracking-tight">DineIn</h1>
                <p className="text-gray-500">Minimalist Ordering Client</p>

                <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <p className="mb-4">Setup Complete</p>
                    <button
                        onClick={() => setCount(c => c + 1)}
                        className="px-4 py-2 bg-black text-white rounded-lg active:scale-95 transition-transform"
                    >
                        Count is {count}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
