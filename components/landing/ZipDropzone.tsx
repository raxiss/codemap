"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export function ZipDropzone() {
  const router = useRouter();
  const { stage, analyzeZip } = useAnalysisStore();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = stage !== "idle" && stage !== "error" && stage !== "done";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith(".zip")) {
      setError("Please drop a valid .zip file");
      return;
    }

    setFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".zip")) {
        setError("Please select a .zip file");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setError("");

    const success = await analyzeZip(file);
    if (success) {
      router.push("/explore");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/20"
            : file
            ? "border-cyan-500/50 bg-slate-900/80"
            : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-3xl text-cyan-400">📦</div>
          {file ? (
            <div>
              <p className="text-sm font-semibold text-slate-100 font-mono">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drag and drop your project ZIP here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or click to browse your computer
              </p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 px-1 font-medium">{error}</p>}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing ZIP...</span>
            </>
          ) : (
            <span>Analyze {file.name}</span>
          )}
        </button>
      )}
    </div>
  );
}
