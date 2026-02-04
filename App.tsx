import React, { useState, useCallback } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import RawDataView from './components/RawDataView';
import { AnalysisResult, GeminiInput, ExecutivePulse, RawShippingData } from './types';
import { analyzeSupplyChainData } from './services/geminiService';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (input: GeminiInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeSupplyChainData(input);
      setAnalysisResult(result);
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
  }, []);

  const resetResult = () => setAnalysisResult(null);

  const isExecutivePulse = (res: AnalysisResult): res is ExecutivePulse => {
    return (res as ExecutivePulse).header !== undefined;
  };

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

      {analysisResult ? (
        <div className="w-full flex flex-col items-center">
          {isExecutivePulse(analysisResult) ? (
            <Dashboard pulse={analysisResult} />
          ) : (
            <RawDataView data={analysisResult as RawShippingData[]} />
          )}
          <button 
            onClick={resetResult}
            className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium border border-indigo-500/30 px-6 py-2 rounded-lg"
          >
            ← Back to Input
          </button>
        </div>
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
