
import React, { useRef, useState } from 'react';

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (base64: string | null) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photo, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  return (
    <div className="relative w-40 h-48 border-4 border-blue-900 bg-gray-100 flex flex-col items-center justify-center overflow-hidden group">
      {isCapturing ? (
        <div className="absolute inset-0 z-20 bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <button 
              onClick={capturePhoto}
              className="bg-red-600 text-white p-2 rounded-full text-xs font-bold"
            >
              Capturar
            </button>
            <button 
              onClick={stopCamera}
              className="bg-gray-600 text-white p-2 rounded-full text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : photo ? (
        <>
          <img src={photo} alt="Member" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button 
              onClick={() => onPhotoChange(null)}
              className="text-white text-xs bg-red-600 px-2 py-1 rounded"
            >
              Quitar
            </button>
          </div>
        </>
      ) : (
        <div className="text-center p-2 flex flex-col gap-2">
          <svg className="w-12 h-12 text-blue-900 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] text-blue-900 font-bold leading-tight">SUBIR FOTO</span>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[9px] bg-blue-900 text-white py-1 px-2 rounded hover:bg-blue-800"
            >
              Galería
            </button>
            <button 
              onClick={startCamera}
              className="text-[9px] border border-blue-900 text-blue-900 py-1 px-2 rounded hover:bg-blue-50"
            >
              Cámara
            </button>
          </div>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoUpload;
