'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error!</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={reset}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
