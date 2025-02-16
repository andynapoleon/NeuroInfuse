import React from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface ImageCompareProps {
  originalImage: string | null;
  processedImage: string | null;
}

const ImageCompare: React.FC<ImageCompareProps> = ({
  originalImage,
  processedImage,
}) => {
  if (!originalImage || !processedImage) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Compare Images</h2>
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={originalImage}
              alt="Original"
              className="h-full object-contain"
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={processedImage}
              alt="Processed"
              className="h-full object-contain"
            />
          }
          position={50}
          style={{
            height: "100%",
            width: "100%",
          }}
          handle={
            <div className="absolute w-1 bg-white h-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>
          }
        />

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
