import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  propertyType?: string; // e.g., "hotel", "apartment", etc. (for future use)
  maxFileSize?: number; // in bytes, default 5MB
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  isLoading?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  disableUpload?: boolean; // disable adding new images, but allow removing existing ones
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelected,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024,
  selectedFiles = [],
  onRemoveFile,
  isLoading = false,
  existingImages = [],
  onRemoveExisting,
  propertyType = "Hotel",
  disableUpload = false,
}) => {
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const validateFiles = (files: File[]): File[] => {
    setError("");
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          `Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP, GIF`,
        );
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        setError(
          `File ${file.name} exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`,
        );
        return;
      }

      validFiles.push(file);
    });

    // Check total count
    const totalFiles =
      selectedFiles.length + existingImages.length + validFiles.length;
    if (totalFiles > maxImages) {
      setError(
        `Maximum ${maxImages} images allowed. You have ${
          selectedFiles.length + existingImages.length
        } current images.`,
      );
      return [];
    }

    return validFiles;
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = validateFiles(fileArray);
    if (validFiles.length > 0) {
      onImagesSelected([...selectedFiles, ...validFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (index: number) => {
    onRemoveFile?.(index);
  };

  const handleRemoveExistingImage = (url: string) => {
    onRemoveExisting?.(url);
  };

  const totalImages = selectedFiles.length + existingImages.length;

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload" className="text-sm font-medium">
        {propertyType}
        <span className="text-gray-500">(Max {maxImages})</span>
      </Label>

      {/* Upload Area - Hidden when disableUpload is true */}
      {!disableUpload && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleInputChange}
            disabled={isLoading}
            className="hidden"
          />

          <div className="p-8 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Uploading images...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop images here or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP, GIF up to 5MB each
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Images Preview Grid */}
      {totalImages > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Current Images ({totalImages}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Existing Images */}
            {existingImages.map((url, index) => (
              <div
                key={`existing-${index}`}
                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square border border-gray-200"
              >
                <img
                  src={url}
                  alt={`Hotel ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveExistingImage(url)}
                    disabled={isLoading || disableUpload}
                    className="rounded-full p-2 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl">
                  Stored
                </div>
              </div>
            ))}

            {/* New Selected Files */}
            {selectedFiles.map((file, index) => (
              <div
                key={`new-${index}`}
                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square border-2 border-green-500/50"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                    disabled={isLoading || disableUpload}
                    className="rounded-full p-2 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!disableUpload && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Upload multiple high-quality images to showcase your property. The
            first image will be used as the primary image in listings.
          </p>
        </div>
      )}
    </div>
  );
};
