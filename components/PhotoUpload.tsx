
import React, { useRef, useState } from 'react';

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (base64: string | null) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photo, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    stopCameraStream();
    setIsCapturing(true);

    const constraints = {
      video: { 
        facingMode: mode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      alert("Cámara no disponible.");
      setIsCapturing(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
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
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    stopCameraStream();
    setIsCapturing(false);
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-40">
      {/* VISOR DE FOTO */}
      <div className="relative w-40 h-48 border-[3px] border-blue-900 bg-gray-50 flex items-center justify-center overflow-hidden rounded-lg shadow-sm">
        {isCapturing ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
          />
        ) : photo ? (
          <img src={photo} alt="Member" className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-200">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>

      {/* CONTROLES MINIATURA (HORIZONTAL) */}
      <div className="w-full flex justify-center items-center gap-2 h-10">
        {isCapturing ? (
          <>
            {/* Cambiar Cámara */}
            <button 
              onClick={toggleCamera}
              className="w-9 h-9 flex items-center justify-center bg-white border-2 border-blue-900 text-blue-900 rounded-full active:bg-blue-50 transition-colors"
              title="Girar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Disparador Central */}
            <button 
              onClick={capturePhoto}
              className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg active:scale-90 transition-transform border-2 border-white"
              title="Capturar"
            >
              <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
            </button>
            
            {/* Cerrar */}
            <button 
              onClick={stopCamera}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 border-2 border-gray-200 rounded-full active:bg-gray-200 transition-colors"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : photo ? (
          <div className="flex gap-4">
            <button 
              onClick={() => startCamera("user")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-full text-[10px] font-black uppercase shadow-sm active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              Otra
            </button>
            <button 
              onClick={() => onPhotoChange(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Borrar
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => startCamera("user")}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white py-2 rounded-lg text-[10px] font-black uppercase active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              Cámara
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-900 text-blue-900 py-2 rounded-lg text-[10px] font-black uppercase active:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Subir
            </button>
          </>
        )}
      </div>

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
