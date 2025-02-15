import React, { useState, useRef } from "react";
import {
  Send,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ArrowUpCircle,
  Image as ImageIcon,
  Download,
} from "lucide-react";

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface Corner {
  x: number;
  y: number;
}

interface ProcessedResult {
  id: string;
  imageUrl: string;
}

const ImageEditor: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>(
    []
  );
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const frontImageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBgImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFrontImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFrontImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!frontImage) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setTransform((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleRotate = (direction: "left" | "right") => {
    const delta = direction === "left" ? -15 : 15;
    setTransform((prev) => ({
      ...prev,
      rotation: prev.rotation + delta,
    }));
  };

  const handleScale = (direction: "in" | "out") => {
    const delta = direction === "in" ? 1.1 : 0.9;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale * delta)),
    }));
  };

  const handleSubmit = async () => {
    if (!bgImage || !frontImage) return;

    try {
      setIsLoading(true);

      // Convert base64 strings to files
      const bgBlob = await fetch(bgImage).then((r) => r.blob());
      const frontBlob = await fetch(frontImage).then((r) => r.blob());

      // Create FormData
      const formData = new FormData();
      formData.append("background_image", new File([bgBlob], "background.png"));
      formData.append("front_image", new File([frontBlob], "front.png"));
      formData.append("transform", JSON.stringify(transform));
      formData.append("batch_count", batchCount.toString());

      // Send request
      const response = await fetch("http://localhost:8000/api/infuse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process images");
      }

      const results = await response.json();
      setProcessedResults(results);
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueProcessing = (result: ProcessedResult) => {
    setBgImage(result.imageUrl);
    setFrontImage(null);
    setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `processed-image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <div className="w-full max-w-[1600px] flex gap-6">
        {/* Editor Section - Left Side */}
        <div
          className="w-3/5 bg-white rounded-lg shadow-lg p-6 sticky top-4 h-fit"
          id="editor"
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Image Infusion Editor
          </h1>

          {/* Upload Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Background Image
              </label>
              <div
                className={`relative h-64 group ${
                  bgImage
                    ? "bg-gray-100"
                    : "bg-gray-50 border-2 border-dashed border-gray-300"
                } rounded-lg overflow-hidden`}
              >
                {bgImage ? (
                  <>
                    <img
                      src={bgImage}
                      alt="Background"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100">
                    <ImageIcon size={48} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload background image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Front Image
              </label>
              <div
                className={`relative h-64 group ${
                  frontImage
                    ? "bg-gray-100"
                    : "bg-gray-50 border-2 border-dashed border-gray-300"
                } rounded-lg overflow-hidden`}
              >
                {frontImage ? (
                  <>
                    <img
                      src={frontImage}
                      alt="Front"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100">
                    <ImageIcon size={48} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload front image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFrontImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Editor Section */}
          {(bgImage || frontImage) && (
            <div className="relative mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Image Editor
              </label>
              <div
                ref={containerRef}
                className="relative w-full h-[calc(100vh-24rem)] bg-gray-100 rounded-lg overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {bgImage && (
                  <img
                    src={bgImage}
                    alt="Background"
                    className="absolute w-full h-full object-contain"
                  />
                )}
                {frontImage && (
                  <img
                    ref={frontImageRef}
                    src={frontImage}
                    alt="Front"
                    className="absolute object-contain"
                    style={{
                      transform: `translate(${transform.x}px, ${transform.y}px) 
                      rotate(${transform.rotation}deg) 
                      scale(${transform.scale})`,
                      maxWidth: "50%",
                      maxHeight: "50%",
                    }}
                  />
                )}
              </div>

              {frontImage && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-lg shadow-lg p-2">
                  <div className="flex gap-2 border-r pr-2">
                    <button
                      onClick={() => handleRotate("left")}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Rotate Left"
                    >
                      <RotateCcw size={20} />
                    </button>
                    <button
                      onClick={() => handleRotate("right")}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Rotate Right"
                    >
                      <RotateCw size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2 pl-2">
                    <button
                      onClick={() => handleScale("out")}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={() => handleScale("in")}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Batch Count:
              </label>
              <input
                type="number"
                min="1"
                value={batchCount}
                onChange={(e) =>
                  setBatchCount(
                    Math.max(1, Math.min(4, parseInt(e.target.value) || 1))
                  )
                }
                className="border rounded px-3 py-2 w-24"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!bgImage || !frontImage || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section - Right Side */}
        <div className="w-2/5 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <div className="flex flex-col gap-6">
            {processedResults.map((result) => (
              <div key={result.id} className="relative group">
                <img
                  src={result.imageUrl}
                  alt={`Result ${result.id}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleContinueProcessing(result)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ArrowUpCircle size={20} />
                    Continue Processing
                  </button>
                  <button
                    onClick={() => handleDownload(result.imageUrl, result.id)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Download size={20} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
