import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number; // width / height, e.g. 16/9 = 1.77
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ 
  imageUrl, 
  aspectRatio = 16 / 9, 
  onCrop, 
  onCancel 
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Calculate crop area dimensions
  const getCropDimensions = useCallback(() => {
    const containerWidth = 400;
    const containerHeight = containerWidth / aspectRatio;
    return { width: containerWidth, height: containerHeight };
  }, [aspectRatio]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    
    // Auto-fit image to crop area
    const cropDims = getCropDimensions();
    const scaleX = cropDims.width / img.naturalWidth;
    const scaleY = cropDims.height / img.naturalHeight;
    const initialScale = Math.max(scaleX, scaleY);
    setScale(initialScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleZoomIn = () => setScale(prev => Math.min(5, prev + 0.2));
  const handleZoomOut = () => setScale(prev => Math.max(0.1, prev - 0.2));
  
  const handleReset = () => {
    if (!imageRef.current) return;
    const cropDims = getCropDimensions();
    const scaleX = cropDims.width / imageSize.width;
    const scaleY = cropDims.height / imageSize.height;
    setScale(Math.max(scaleX, scaleY));
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropDims = getCropDimensions();
    
    // Output size
    const outputWidth = 800;
    const outputHeight = outputWidth / aspectRatio;
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const img = imageRef.current;
    
    // Логика отображения в CSS:
    // 1. Изображение центрируется в crop area (left: 50%, top: 50%, margin: -width/2, -height/2)
    // 2. Применяется transform: translate(position.x, position.y) scale(scale)
    // 3. transformOrigin: center
    
    // Размер масштабированного изображения
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    // Позиция левого верхнего угла масштабированного изображения в crop area
    // При position={0,0} изображение центрировано
    const imgLeftInCrop = (cropDims.width - scaledWidth) / 2 + position.x;
    const imgTopInCrop = (cropDims.height - scaledHeight) / 2 + position.y;
    
    // Какую часть масштабированного изображения занимает crop area (0,0) - (cropDims.width, cropDims.height)
    // Левый верхний угол crop area относительно изображения:
    const cropLeftInScaledImg = -imgLeftInCrop;
    const cropTopInScaledImg = -imgTopInCrop;
    
    // Переводим в координаты оригинального изображения (делим на scale)
    const sourceX = cropLeftInScaledImg / scale;
    const sourceY = cropTopInScaledImg / scale;
    const sourceWidth = cropDims.width / scale;
    const sourceHeight = cropDims.height / scale;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  };

  const cropDims = getCropDimensions();

  const content = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80" style={{ zIndex: 999999 }}>
      <div className="bg-base-100 rounded-2xl p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Обрезка изображения</h3>
          <button onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden rounded-lg bg-base-300 mx-auto cursor-move"
          style={{ 
            width: cropDims.width, 
            height: cropDims.height,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            onLoad={handleImageLoad}
            className="absolute select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
              left: '50%',
              top: '50%',
              marginLeft: imageLoaded ? -imageSize.width / 2 : 0,
              marginTop: imageLoaded ? -imageSize.height / 2 : 0,
            }}
            draggable={false}
          />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
          
          {/* Move hint */}
          {!isDragging && imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-2 text-white/70 text-sm">
                <Move className="w-4 h-4" />
                Перетащите для позиционирования
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button 
            onClick={handleZoomOut} 
            className="btn btn-ghost btn-sm btn-circle"
            title="Уменьшить"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="range range-primary range-xs w-32"
          />
          
          <button 
            onClick={handleZoomIn} 
            className="btn btn-ghost btn-sm btn-circle"
            title="Увеличить"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <div className="divider divider-horizontal mx-1" />
          
          <button 
            onClick={handleReset} 
            className="btn btn-ghost btn-sm btn-circle"
            title="Сбросить"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect ratio info */}
        <p className="text-center text-xs text-base-content/50 mt-2">
          Соотношение сторон: {aspectRatio.toFixed(2)} ({Math.round(aspectRatio * 9)}:9)
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            Отмена
          </button>
          <button onClick={handleCrop} className="btn btn-primary flex-1">
            <Check className="w-4 h-4" />
            Применить
          </button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );

  // Render via portal to ensure it's above all other content
  return createPortal(content, document.body);
}
