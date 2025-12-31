
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

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Acceso a cámara denegado:", err);
      alert("No se pudo acceder a la cámara.");
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
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
    <div className="relative w-40 h-48 border-4 border-blue-900 bg-gray-100 flex flex-col items-center justify-center overflow-hidden rounded-lg shadow-inner group">
      {isCapturing ? (
        <div className="absolute inset-0 z-20 bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-2">
            <button 
              onClick={capturePhoto}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg uppercase"
            >
              Capturar
            </button>
            <button 
              onClick={stopCamera}
              className="bg-gray-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : photo ? (
        <>
          <img src={photo} alt="Member" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => onPhotoChange(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase"
            >
              Quitar
            </button>
          </div>
        </>
      ) : (
        <div className="text-center p-4 flex flex-col gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[10px] text-blue-900 font-black uppercase">Foto</span>
          <div className="flex flex-col gap-2">
            <button 
              onClick={startCamera}
              className="bg-blue-900 text-white py-2 px-3 rounded-lg text-[9px] font-bold uppercase"
            >
              Cámara
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border border-blue-900 text-blue-900 py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase"
            >
              Archivo
            </button>
          </div>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onPhotoChange(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoUpload;
