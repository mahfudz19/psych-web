"use client";

import type React from "react";

import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Save,
  Trash,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Slider from "../../ui/Slider";

interface ImageEditorModalProps {
  width?: number;
  height?: number;
  shape?: "circle" | "square" | "rounded";
  image: string | null;
  load?: boolean;
  onSave?: (data: string, file: File | null, formData: FormData | null) => void;
  onCancel?: () => void;
  showControls?: boolean;
}

export function ImageEditorModal(props: ImageEditorModalProps) {
  const {
    width = 256,
    height = 256,
    shape = "circle",
    image,
    onSave,
    onCancel,
    load,
    showControls = true,
  } = props;
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate minimum scale to fit image width to container width
  const getMinScale = () => {
    if (!naturalDimensions.width || !naturalDimensions.height) return 0.5;

    // Minimum scale when image width fits container width
    return Math.min(width / naturalDimensions.width, 1);
  };

  // Calculate container scale to fit width
  const getContainerScale = () => {
    if (!containerWidth) return 1;
    return Math.min(1, containerWidth / width);
  };

  // Constrain position to keep image within reasonable bounds
  const constrainPosition = (
    newPosition: { x: number; y: number },
    currentScale: number,
  ) => {
    if (!naturalDimensions.width || !naturalDimensions.height)
      return newPosition;

    // Calculate scaled dimensions
    const scaledWidth = naturalDimensions.width * currentScale;
    const scaledHeight = naturalDimensions.height * currentScale;

    // Calculate maximum allowed offset (allow some movement but keep image visible)
    const maxOffsetX = Math.max(0, (scaledWidth - width) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - height) / 2);

    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newPosition.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newPosition.y)),
    };
  };

  // Reset transformations when image changes
  useEffect(() => {
    if (image) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [image]);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle image dragging for positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setPosition(constrainPosition(newPosition, scale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !image) return;
    const newPosition = {
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    };
    setPosition(constrainPosition(newPosition, scale));
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Rotation handlers
  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);

  // Zoom handlers
  const zoomIn = () => {
    const newScale = Math.min(scale + 0.1, 3);
    setScale(newScale);
    // Constrain position when scale changes
    setPosition(constrainPosition(position, newScale));
  };

  const zoomOut = () => {
    const minScale = getMinScale();
    const newScale = Math.max(scale - 0.1, minScale);
    setScale(newScale);
    // Constrain position when scale changes
    setPosition(constrainPosition(position, newScale));
  };

  // Load image and get natural dimensions
  useEffect(() => {
    if (image && imageRef.current) {
      const img = imageRef.current;
      const handleLoad = () =>
        setNaturalDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

      // If already loaded
      if (img.complete) handleLoad();
      else img.onload = handleLoad;
    }
  }, [image]);

  // Generate final avatar
  const generateAvatar = () => {
    if (
      !image ||
      !canvasRef.current ||
      !imageRef.current ||
      !naturalDimensions.width
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Create clipping path for shape
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();
    } else if (shape === "rounded") {
      ctx.beginPath();
      const radius = 8;
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(
        canvas.width,
        canvas.height,
        canvas.width - radius,
        canvas.height,
      );
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
    }

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flip transformations
    const scaleX = flipHorizontal ? -1 : 1;
    const scaleY = flipVertical ? -1 : 1;
    ctx.scale(scaleX * scale, scaleY * scale);

    // Calculate dimensions to maintain aspect ratio (cover)
    const img = imageRef.current;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
    }

    // Draw image with position offset and proper dimensions
    // Adjust position.x and position.y for flip to keep image position consistent
    const posX = flipHorizontal ? -position.x / scale : position.x / scale;
    const posY = flipVertical ? -position.y / scale : position.y / scale;

    ctx.drawImage(
      img,
      -drawWidth / 2 + posX,
      -drawHeight / 2 + posY,
      drawWidth,
      drawHeight,
    );

    // Restore context state
    ctx.restore();
  };

  // Update canvas when image or transformations change
  useEffect(() => {
    if (
      image &&
      imageRef.current &&
      canvasRef.current &&
      naturalDimensions.width > 0
    ) {
      generateAvatar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    image,
    scale,
    rotation,
    position,
    naturalDimensions,
    shape,
    flipHorizontal,
    flipVertical,
  ]);

  // Constrain position when image dimensions are loaded
  useEffect(() => {
    if (naturalDimensions.width > 0) {
      const minScale = getMinScale();
      if (scale < minScale) {
        setScale(minScale);
      }
      setPosition(constrainPosition(position, scale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalDimensions]);

  // Handle save button click
  const handleSave = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "image.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("image", file);

      if (onSave) await onSave(dataUrl, file, formData);
    }, "image/png");
  };

  if (!image) return null;

  return (
    <div
      className="flex flex-col items-stretch w-full space-y-2 mx-auto"
      ref={containerRef}
    >
      {/* Preview area */}
      <div
        className={`relative overflow-hidden mx-auto outline outline-offset-4 outline-divider ${
          shape === "circle"
            ? "rounded-full"
            : shape === "rounded"
              ? "rounded-xl"
              : ""
        } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${getContainerScale()})`,
          transformOrigin: "top left",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          width={width}
          height={height}
          src={image || "/placeholder.svg"}
          alt="Avatar preview"
          className="hidden"
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
      </div>

      {showControls && (
        <>
          <p className="text-xs text-gray-500 text-center">
            Geser gambar untuk mengatur posisi
          </p>

          {/* Zoom controls */}
          <div>
            <span className="text-sm font-medium">Zoom</span>
            <div className="flex gap-1 items-center">
              <IconButton
                variant="text"
                size="sm"
                className="p-0"
                onClick={zoomOut}
                disabled={scale <= getMinScale()}
              >
                <ZoomOut size={18} />
              </IconButton>
              <Slider
                value={scale * 100}
                min={getMinScale() * 100}
                max={300}
                step={1}
                onChange={(value) => {
                  const newScale = Number(value) / 100;
                  setScale(newScale);
                  setPosition(constrainPosition(position, newScale));
                }}
              />
              <IconButton
                variant="text"
                size="sm"
                className="p-0"
                onClick={zoomIn}
                disabled={scale >= 3}
              >
                <ZoomIn size={18} />
              </IconButton>
            </div>
          </div>

          {/* Rotation controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rotasi</span>
            <div className="flex space-x-2">
              <IconButton size="sm" variant="text" onClick={rotateLeft}>
                <RotateCcw size={16} />
              </IconButton>
              <IconButton size="sm" variant="text" onClick={rotateRight}>
                <RotateCw size={16} />
              </IconButton>
            </div>
          </div>

          {/* Flip control */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Flip</span>
            <div className="flex space-x-2">
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setFlipHorizontal((prev) => !prev)}
                color={flipHorizontal ? "primary" : undefined}
              >
                <FlipHorizontal size={16} />
              </IconButton>
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setFlipVertical((prev) => !prev)}
                color={flipVertical ? "primary" : undefined}
              >
                <FlipVertical size={16} />
              </IconButton>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 pt-4">
            {onCancel && (
              <Button
                variant="text"
                disabled={load}
                startIcon={<X fontSize={14} />}
                onClick={onCancel}
                color="error"
              >
                Batal
              </Button>
            )}
            <Button
              variant="outlined"
              loading={load}
              disabled={load}
              startIcon={<Save fontSize={16} />}
              onClick={handleSave}
            >
              Image
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const ViewImage = (props: {
  defaultImage: File | FormData | string;
  width?: number;
  height?: number;
}) => {
  const { defaultImage, height, width } = props;
  const [image, setImage] = useState<string>("");

  const resolveImageSource = async (
    defaultImage: File | FormData | string | null | undefined,
  ): Promise<string> => {
    const fileToDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    if (defaultImage instanceof File) return await fileToDataURL(defaultImage);
    if (defaultImage instanceof FormData) {
      const values = Array.from(defaultImage.values());
      for (const value of values) {
        if (value instanceof File) return await fileToDataURL(value);
      }
    }
    if (typeof defaultImage === "string") {
      if (!defaultImage.includes("data:")) return `${defaultImage}`;
      return defaultImage;
    }

    return "";
  };

  useEffect(() => {
    const load = async () => setImage(await resolveImageSource(defaultImage));
    load();
  }, [defaultImage]);

  return (
    <img
      src={image}
      alt={image.slice(image.length - 20, image.length)}
      width={width}
      height={height}
      style={{ objectFit: "contain" }}
      className="block mx-auto"
    />
  );
};

interface ImageEditorProps {
  width?: number;
  height?: number;
  defaultImage?: File | FormData | string | null;
  shape?: "circle" | "square" | "rounded";
  onImageSelect: (canvas: string) => void;
  limitSize?: number;
  error?: boolean;
  disabled?: boolean;
  message?: string;
}

const convertBytesToMB = (bytes: number): string => {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)}MB`;
};

export default function ImageEditor(props: ImageEditorProps) {
  const {
    width = 256,
    height = 256,
    shape = "circle",
    onImageSelect,
    defaultImage,
    limitSize = 5 * 1024 * 1024,
    disabled,
    error: errorStyle,
    message,
  } = props;
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > limitSize) {
        setError(
          `Batas gambar hanya ${convertBytesToMB(limitSize)} MB, gambar yang di upload ${convertBytesToMB(
            file.size,
          )} Mb`,
        );
        setTimeout(() => setError(""), 5000);
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const canvas = event.target?.result as string;
        onImageSelect(canvas);
      };
      reader.readAsDataURL(file);

      // Reset file input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) return;
    e.preventDefault();
    onImageSelect("");
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > limitSize) {
        setError(
          `Batas gambar hanya ${convertBytesToMB(limitSize)} MB, gambar yang di upload ${convertBytesToMB(
            file.size,
          )} Mb`,
        );
        setTimeout(() => setError(""), 5000);
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const canvas = event.target?.result as string;
        if (onImageSelect) onImageSelect(canvas);
      };
      reader.readAsDataURL(file);

      // Reset file input value
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative inline-block w-full"
      style={{ maxWidth: `${width}px`, height: `${height}px` }}
    >
      {error && (
        <div className="absolute text-xs text-red-500 bottom-0 left-0 right-0 bg-red-100 rounded-md px-1.5 py-0.5 outline-dashed outline-2 outline-error-main z-20">
          {error}
        </div>
      )}
      {defaultImage && !disabled && (
        <IconButton
          variant="outlined"
          size="sm"
          color="error"
          onClick={handleClear}
          className="absolute top-2 right-2 z-10 bg-background-paper p-0.5"
        >
          <Trash fontSize={18} />
        </IconButton>
      )}
      {/* Upload area */}
      <div
        className={twMerge(
          "relative inline-block w-full overflow-hidden outline-dashed outline-2 outline-offset-4 cursor-pointer hover:outline-primary-main transition-colors text-text-secondary max-w-full",
          isDragOver
            ? "outline-primary-main bg-secondary-main/25"
            : "outline-divider",
          errorStyle ? "outline-error-main bg-error-light/25" : "",
          shape === "circle"
            ? "rounded-full"
            : shape === "rounded"
              ? "rounded-lg"
              : "",
        )}
        style={{ maxWidth: "inherit", height: "inherit" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {defaultImage ? (
          <ViewImage
            defaultImage={defaultImage}
            width={width}
            height={height}
          />
        ) : (
          <div
            className={twMerge(
              "flex flex-col items-center justify-center h-full",
              disabled ? "opacity-50" : "",
            )}
          >
            <Upload className="w-10 h-10 mb-2" />
            <p className="text-sm text-center">
              Drag & drop gambar atau klik untuk upload
            </p>
            {message && <p className="text-xs mt-1.5 text-center">{message}</p>}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
