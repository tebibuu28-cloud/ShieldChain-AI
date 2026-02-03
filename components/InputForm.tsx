import React, { useState, useRef } from 'react';
import Button from './Button';
import { GeminiInput } from '../types';

interface InputFormProps {
  onSubmit: (input: GeminiInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (e.g., JPG, PNG).');
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data:image/...;base64, prefix
        setImage(base64String.split(',')[1]); 
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (text.trim() === '') {
      alert('Please enter some supply chain data for analysis.');
      return;
    }
    onSubmit({ text, image: image || undefined });
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Supply Chain Data Input</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="supplyChainData" className="block text-gray-300 text-lg font-medium mb-2">
            Raw Supply Chain Data (Contracts, BOLs, Routes, Performance, etc.)
          </label>
          <textarea
            id="supplyChainData"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            rows={8}
            placeholder="E.g., 'Contract ID: SC-2026-001, Supplier: GlobalLogistics Inc., Route: Shanghai -> Rotterdam. BOL: #456789. Performance: On-time 98%. Geopolitical: Typhoon expected near Taiwan next week.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          ></textarea>
        </div>
        <div>
          <label htmlFor="imageUpload" className="block text-gray-300 text-lg font-medium mb-2">
            Optional: Upload Image (Labels, Containers for Seal Integrity/Fraud Detection)
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="block w-full text-base text-gray-300
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-indigo-500 file:text-white
                       hover:file:bg-indigo-600
                       disabled:file:bg-gray-600 disabled:file:text-gray-400 disabled:cursor-not-allowed
                       transition duration-300 ease-in-out"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {image && (
            <div className="mt-4">
              <img src={`data:image/jpeg;base64,${image}`} alt="Uploaded" className="max-h-48 rounded-lg shadow-md mx-auto" />
            </div>
          )}
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full">
          Analyze Supply Chain Pulse
        </Button>
      </form>
    </div>
  );
};

export default InputForm;
