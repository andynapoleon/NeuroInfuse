import React, { useState, useEffect, useCallback } from "react";

interface ImageCompareProps {
  originalImage: string | null;
  processedImage: string | null;
}

const ImageCompare: React.FC<ImageCompareProps> = ({
  originalImage,
  processedImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  if (!originalImage || !processedImage) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!isDragging) return;

      const slider = (e.target as HTMLElement).closest(".compare-container");
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      updateSliderPosition(e);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, updateSliderPosition]);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Compare Images</h2>
      <div className="compare-container relative h-[32rem] rounded-lg overflow-hidden">
        {/* Processed Image (Right side) */}
        <img
          src={processedImage}
          alt="Processed"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Original Image (Left side) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
        >
          {/* Slider Handle */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-col-resize"
            onMouseDown={handleMouseDown}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          Processed
        </div>
      </div>
    </div>
  );
};

export default ImageCompare;
