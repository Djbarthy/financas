import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropProps {
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
}

const ImageCrop: React.FC<ImageCropProps> = ({ onCropComplete, onClose }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
  }, []);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCropComplete(croppedImageUrl);
  }, [completedCrop, onCropComplete]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop da Imagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imgSrc && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}

          {imgSrc && (
            <div className="flex flex-col items-center space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-96"
                />
              </ReactCrop>

              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />

              <div className="flex space-x-2">
                <Button
                  onClick={() => setImgSrc('')}
                  variant="outline"
                >
                  Trocar Imagem
                </Button>
                <Button
                  onClick={getCroppedImg}
                  disabled={!completedCrop}
                  className="bg-brand-primary hover:bg-brand-rose-earthy"
                >
                  Aplicar Crop
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCrop;
