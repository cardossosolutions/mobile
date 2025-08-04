import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (imageFile: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onPhotoTaken }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Usar câmera traseira se disponível
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      if (err.name === 'NotAllowedError' || err.message.includes('Permission dismissed')) {
        setError('Acesso à câmera foi negado. Por favor, permita o acesso à câmera nas configurações do navegador e recarregue a página.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera foi encontrada no dispositivo.');
      } else if (err.name === 'NotReadableError') {
        setError('A câmera está sendo usada por outro aplicativo.');
      } else {
        setError('Não foi possível acessar a câmera. Verifique as permissões e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Definir dimensões do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
  }, []);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    // Converter data URL para File
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'plate.jpg', { type: 'image/jpeg' });
        onPhotoTaken(file);
        handleClose();
      }
    }, 'image/jpeg', 0.8);
  }, [capturedImage, onPhotoTaken]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  // Iniciar câmera quando modal abrir
  React.useEffect(() => {
    if (isOpen && !stream && !capturedImage) {
      startCamera();
    }
  }, [isOpen, stream, capturedImage, startCamera]);

  // Limpar recursos quando modal fechar
  React.useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Capturar Foto da Placa</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao Acessar Câmera</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-3 text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-lg font-medium">Iniciando câmera...</span>
              </div>
            </div>
          ) : capturedImage ? (
            // Foto capturada - mostrar preview
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Foto Capturada</h3>
                <div className="relative inline-block">
                  <img
                    src={capturedImage}
                    alt="Foto capturada"
                    className="max-w-full max-h-96 rounded-lg shadow-lg"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Instruções:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Verifique se a placa está legível na foto</li>
                  <li>• A foto será enviada para identificação do veículo</li>
                  <li>• Clique em "Confirmar" para enviar ou "Tirar Novamente" para refazer</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={retakePhoto}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Tirar Novamente</span>
                </button>
                <button
                  onClick={confirmPhoto}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirmar Foto</span>
                </button>
              </div>
            </div>
          ) : (
            // Câmera ativa - mostrar preview
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Posicione a Placa do Veículo</h3>
                <div className="relative inline-block bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-w-full max-h-96"
                  />
                  
                  {/* Overlay para guiar o posicionamento */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white border-dashed rounded-lg p-8 bg-black bg-opacity-30">
                      <div className="text-white text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Posicione a placa aqui</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Dicas para uma boa foto:</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Certifique-se de que a placa está bem iluminada</li>
                  <li>• Mantenha a câmera estável e paralela à placa</li>
                  <li>• A placa deve ocupar a maior parte do enquadramento</li>
                  <li>• Evite reflexos e sombras sobre os caracteres</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-lg font-medium">Capturar Foto</span>
                </button>
              </div>
            </div>
          )}

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default CameraModal;