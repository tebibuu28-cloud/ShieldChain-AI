import React, { useState, useCallback } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { ExecutivePulse, GeminiInput } from './types';
import { analyzeSupplyChainData } from './services/geminiService';

const App: React.FC = () => {
  const [executivePulse, setExecutivePulse] = useState<ExecutivePulse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (input: GeminiInput) => {
    setIsLoading(true);
    setError(null);
    setExecutivePulse(null);
    try {
      const result = await analyzeSupplyChainData(input);
      setExecutivePulse(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this function is created once.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-100">
      <h1 className="text-5xl font-extrabold text-white mb-10 text-center leading-tight">
        <span className="bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">ShieldChain AI</span> Command Center
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg shadow-md mb-8 max-w-lg text-center">
          <p className="font-semibold text-lg">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {executivePulse ? (
        <Dashboard pulse={executivePulse} />
      ) : (
        <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}

      <div className="mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini AI - 2026 ShieldChain Technologies</p>
      </div>
    </div>
  );
};

export default App;