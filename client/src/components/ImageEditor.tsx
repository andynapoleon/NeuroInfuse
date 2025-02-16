import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ArrowUpCircle,
  Image as ImageIcon,
  Download,
  Split,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCompare from "./ImageCompare";
import ImageCropModal from "./ImageCropModal";

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

interface Corner {
  x: number;
  y: number;
}

interface ProcessedResult {
  id: string;
  imageUrl: string;
}

interface DragStart {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

const ImageEditor: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>(
    []
  );
  // Update the initial transform state
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
  });

  const [compareOriginal, setCompareOriginal] = useState<string | null>(null);
  const [compareProcessed, setCompareProcessed] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<"background" | "front" | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const frontImageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<DragStart>({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveDocument);
      document.removeEventListener("mouseup", handleMouseUpDocument);
    };
  }, []);

  const handleImageUpload = (file: File, type: "background" | "front") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Check if image is already square
        if (Math.abs(img.width - img.height) <= 1) {
          // Image is square, set it directly
          if (type === "background") {
            setBgImage(e.target?.result as string);
          } else {
            setFrontImage(e.target?.result as string);
          }
        } else {
          // Image needs cropping
          setCropImage(e.target?.result as string);
          setCropType(type);
          setShowCropModal(true);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, "background");
    }
  };

  const handleFrontImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, "front");
    }
  };

  const handleCrop = (croppedImageUrl: string) => {
    if (cropType === "background") {
      setBgImage(croppedImageUrl);
    } else {
      setFrontImage(croppedImageUrl);
    }
    setShowCropModal(false);
    setCropImage(null);
    setCropType(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImage(null);
    setCropType(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!frontImage || !frontImageRef.current) return;

    isDragging.current = true;
    dragStart.current = {
      x: transform.x, // Store the current transform position
      y: transform.y,
      offsetX: e.clientX - transform.x, // Store the mouse offset from the image position
      offsetY: e.clientY - transform.y,
    };

    // Add event listeners to document
    document.addEventListener("mousemove", handleMouseMoveDocument);
    document.addEventListener("mouseup", handleMouseUpDocument);
  };

  const handleMouseMoveDocument = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const newX = e.clientX - dragStart.current.offsetX;
    const newY = e.clientY - dragStart.current.offsetY;

    setTransform((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleMouseUpDocument = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMoveDocument);
    document.removeEventListener("mouseup", handleMouseUpDocument);
  };

  // const handleMouseMove = (e: React.MouseEvent) => {
  //   if (!isDragging.current) return;
  //   const newX = e.clientX - dragStart.current.x;
  //   const newY = e.clientY - dragStart.current.y;
  //   setTransform((prev) => ({ ...prev, x: newX, y: newY }));
  // };

  // const handleMouseUp = () => {
  //   isDragging.current = false;
  // };

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

  const handleFlip = (axis: "x" | "y") => {
    setTransform((prev) => ({
      ...prev,
      [axis === "x" ? "flipX" : "flipY"]:
        !prev[axis === "x" ? "flipX" : "flipY"],
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
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    });
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

  const handleCompare = async () => {
    if (!bgImage || !frontImage) return;

    // Create a temporary canvas to draw just the background image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx || !containerRef.current) return;

    // Set canvas size to match the editor container
    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Load and draw background image
    const bgImg = new Image();
    bgImg.src = bgImage;
    await new Promise((resolve) => (bgImg.onload = resolve));

    // Draw background image to fit container while maintaining aspect ratio
    const bgAspect = bgImg.width / bgImg.height;
    const containerAspect = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let drawX = 0;
    let drawY = 0;

    if (bgAspect > containerAspect) {
      drawHeight = canvas.width / bgAspect;
      drawY = (canvas.height - drawHeight) / 4;
    } else {
      drawWidth = canvas.height * bgAspect;
      drawX = (canvas.width - drawWidth) / 4;
    }

    ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);

    // Convert canvas to data URL
    setCompareOriginal(canvas.toDataURL());
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <div className="w-full max-w-[1600px] grid grid-cols-[2fr,1fr] gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Editor Section */}
          <div className="bg-white rounded-lg shadow-lg p-6" id="editor">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Image Infusion Editor
            </h1>

            {/* Upload Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block mb-2 text-lg font-medium text-gray-700">
                  Background Image
                </label>
                <div
                  className={`relative aspect-square group ${
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
                          Upload Another Image
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
                      <span className="text-lg text-gray-500">
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
                <label className="block mb-2 text-lg font-medium text-gray-700">
                  Front Image
                </label>
                <div
                  className={`relative aspect-square group ${
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
                          Upload Another Image
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
                      <span className="text-lg text-gray-500">
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
                <label className="block mb-2 text-lg font-medium text-gray-700">
                  Image Editor
                </label>
                <div
                  ref={containerRef}
                  className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden cursor-move"
                  onMouseDown={handleMouseDown}
                  // onMouseMove={handleMouseMove}
                  // onMouseUp={handleMouseUp}
                  // onMouseLeave={handleMouseUp}
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
                      className="absolute object-contain cursor-move"
                      style={{
                        transform: `
        translate(${transform.x}px, ${transform.y}px)
        rotate(${transform.rotation}deg)
        scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${
                          transform.scale * (transform.flipY ? -1 : 1)
                        })
      `,
                        width: "50%",
                        height: "50%",
                        left: "25%",
                        top: "25%",
                      }}
                      onMouseDown={handleMouseDown}
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
                    <div className="flex gap-2 pl-2">
                      <button
                        onClick={() => handleFlip("y")}
                        className={`p-2 hover:bg-gray-100 rounded ${
                          transform.flipY ? "bg-gray-200" : ""
                        }`}
                        title="Flip Horizontal"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v18" />
                          <path d="m16 7-4-4-4 4" />
                          <path d="m16 17-4 4-4-4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleFlip("x")}
                        className={`p-2 hover:bg-gray-100 rounded ${
                          transform.flipX ? "bg-gray-200" : ""
                        }`}
                        title="Flip Vertical"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ transform: "rotate(90deg)" }}
                        >
                          <path d="M12 3v18" />
                          <path d="m16 7-4-4-4 4" />
                          <path d="m16 17-4 4-4-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-lg font-medium text-gray-700">
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
                  className="text-lg border rounded px-3 py-2 w-24"
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
                    <p className="text-lg"> Submit </p>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4 h-fit">
          <h2 className="text-2xl font-bold mb-4">Results</h2>

          {processedResults.length > 0 && (
            <div className="flex flex-col gap-4">
              {/* Main Image Display */}
              <div className="relative aspect-square w-full bg-gray-100 rounded-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={processedResults[currentImageIndex].imageUrl}
                      alt={`Result ${processedResults[currentImageIndex].id}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {processedResults.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? processedResults.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === processedResults.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Action Buttons - Now outside the image container */}
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() =>
                    handleContinueProcessing(
                      processedResults[currentImageIndex]
                    )
                  }
                  className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  <ArrowUpCircle size={20} />
                  <p className="text-lg"> Continue </p>
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      processedResults[currentImageIndex].imageUrl,
                      processedResults[currentImageIndex].id
                    )
                  }
                  className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Download size={20} />
                  <p className="text-lg"> Download </p>
                </button>
                <button
                  onClick={() => {
                    handleCompare();
                    setCompareProcessed(
                      processedResults[currentImageIndex].imageUrl
                    );
                  }}
                  className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Split size={20} />
                  <p className="text-lg"> Compare </p>
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto p-2">
                {processedResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden ${
                      currentImageIndex === index
                        ? "ring-2 ring-purple-500"
                        : ""
                    }`}
                  >
                    <img
                      src={result.imageUrl}
                      alt={`Thumbnail ${result.id}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compare Section */}
          {compareOriginal && compareProcessed && (
            <ImageCompare
              originalImage={compareOriginal}
              processedImage={compareProcessed}
            />
          )}
        </div>
      </div>

      {showCropModal && cropImage && (
        <ImageCropModal
          imageUrl={cropImage}
          onCrop={handleCrop}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ImageEditor;
