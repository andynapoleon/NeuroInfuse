import React, { useState, useCallback } from "react";
import ReactCrop, { PixelCrop, Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageUrl,
  onCrop,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    setImageRef(img);
    const { width, height } = img;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: "%",
      x: (x / width) * 100,
      y: (y / height) * 100,
      width: (size / width) * 100,
      height: (size / height) * 100,
    });
  }, []);

  const handleCrop = useCallback(async () => {
    if (!completedCrop || !imageRef) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set a fixed size for the output canvas (e.g., 1024x1024)
    const outputSize = 1024;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";

    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;

    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      imageRef,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            }
          },
          "image/png",
          1
        );
      });

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          onCrop(reader.result);
        }
      };
    } catch (error) {
      console.error("Error creating cropped image:", error);
    }
  }, [completedCrop, imageRef, onCrop]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-auto">
        <h2 className="text-2xl font-bold mb-4">Crop Image to Square</h2>
        <p className="text-lg text-gray-600 mb-4">
          Please adjust the crop area to create a square image.
        </p>
        <div className="max-w-xl mx-auto aspect-square mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            className="max-w-full max-h-full"
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              onLoad={(e) => onImageLoad(e.currentTarget)}
              className="max-w-full max-h-full object-contain"
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="text-lg px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="text-lg px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            disabled={!completedCrop}
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
