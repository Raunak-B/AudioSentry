import React, { useState } from 'react';
import { Upload, FileAudio, Play, Pause, Trash2 } from 'lucide-react';

export function FileUploadTestMode() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-display-lg text-on-surface">Test Mode</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Upload historical audio recordings to test the Sentinel AI models against known fraud vectors.
        </p>
      </div>

      {!file ? (
        <div 
          className="neo-inset rounded-[32px] p-16 flex flex-col items-center justify-center border-2 border-dashed border-surface-variant"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 neo-raised rounded-full flex items-center justify-center text-primary mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-headline-md text-on-surface mb-2">Drag & Drop Audio File</h3>
          <p className="text-body-md text-on-surface-variant mb-8 text-center max-w-md">
            Supports WAV, MP3, and FLAC up to 50MB. Ensure files do not contain unredacted PII.
          </p>
          <button className="neo-button-primary px-8 py-3 rounded-full text-label-md">
            Browse Files
          </button>
        </div>
      ) : analyzing ? (
        <div className="neo-inset p-8 rounded-[32px] flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-label-md text-on-surface-variant font-bold">Uploading to Engine...</div>
        </div>
      ) : (
        <div className="neo-raised rounded-[32px] p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 neo-inset rounded-xl flex items-center justify-center text-primary">
                <FileAudio size={32} />
              </div>
              <div>
                <h3 className="text-headline-md text-on-surface">{file}</h3>
                <p className="text-body-md text-on-surface-variant">Audio / WAV • 4.2 MB</p>
              </div>
            </div>
            <button className="neo-inset p-3 rounded-full text-[#DC2626] hover:text-white hover:bg-[#DC2626]" onClick={() => setFile(null)}>
              <Trash2 size={20} />
            </button>
          </div>

          <div className="neo-inset p-6 rounded-2xl flex items-center gap-4">
            <button className="neo-raised w-12 h-12 rounded-full flex items-center justify-center text-primary shrink-0">
              <Play size={20} className="ml-1" />
            </button>
            <div className="flex-1 h-2 bg-surface-dim rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-primary w-1/3"></div>
            </div>
            <span className="text-label-sm text-on-surface-variant">0:45 / 2:30</span>
          </div>

          <div className="flex justify-end mt-4">
            <button className="neo-button-primary px-8 py-3 rounded-full text-label-md" onClick={() => setAnalyzing(true)}>
              Run Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
