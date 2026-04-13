import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  propertyType?: string;
  maxFileSize?: number;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  isLoading?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  disableUpload?: boolean;
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
  const { isDark } = useTheme();
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tk = {
    labelText: isDark ? "rgba(255,255,255,0.80)" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    dropBg: isDark ? "rgba(255,255,255,0.03)" : "#faf8f5",
    dropBgActive: isDark ? "rgba(232,25,44,0.08)" : "#fff1f2",
    dropBorder: isDark ? "rgba(255,255,255,0.12)" : "#d1cdc9",
    dropBorderActive: "#E8192C",
    dropText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    iconColor: isDark ? "rgba(255,255,255,0.30)" : "#9e9994",
    errorBg: isDark ? "rgba(239,68,68,0.10)" : "#fef2f2",
    errorBorder: isDark ? "rgba(239,68,68,0.30)" : "#fca5a5",
    errorText: isDark ? "#f87171" : "#dc2626",
    countText: isDark ? "rgba(255,255,255,0.70)" : "#44403c",
    imgBg: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
    imgBorder: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    storedBadge: "#E8192C",
    newBadge: "#16a34a",
    hintBg: isDark ? "rgba(232,25,44,0.08)" : "#fff1f2",
    hintBorder: isDark ? "rgba(232,25,44,0.25)" : "#fca5a5",
    hintIcon: "#E8192C",
    hintText: isDark ? "#f87171" : "#be123c",
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const validateFiles = (files: File[]): File[] => {
    setError("");
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP, GIF`);
        return;
      }
      if (file.size > maxFileSize) {
        setError(`File ${file.name} exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
        return;
      }
      validFiles.push(file);
    });

    const totalFiles = selectedFiles.length + existingImages.length + validFiles.length;
    if (totalFiles > maxImages) {
      setError(
        `Maximum ${maxImages} images allowed. You have ${selectedFiles.length + existingImages.length} current images.`,
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
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isLoading) fileInputRef.current?.click();
  };

  const totalImages = selectedFiles.length + existingImages.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Label */}
      <label style={{ fontSize: "13px", fontWeight: 600, color: tk.labelText }}>
        {propertyType}{" "}
        <span style={{ color: tk.mutedText, fontWeight: 400 }}>(Max {maxImages})</span>
      </label>

      {/* Upload Area */}
      {!disableUpload && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{
            position: "relative",
            borderRadius: "10px",
            border: `2px dashed ${dragActive ? tk.dropBorderActive : tk.dropBorder}`,
            background: dragActive ? tk.dropBgActive : tk.dropBg,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleInputChange}
            disabled={isLoading}
            style={{ display: "none" }}
          />
          <div style={{ padding: "32px", textAlign: "center" }}>
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <Loader2 style={{ width: "32px", height: "32px", color: "#E8192C", animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: "13px", color: tk.mutedText }}>Uploading images...</p>
              </div>
            ) : (
              <>
                <Upload style={{ width: "32px", height: "32px", color: tk.iconColor, margin: "0 auto 8px" }} />
                <p style={{ fontSize: "13px", fontWeight: 600, color: tk.dropText }}>
                  Drag and drop images here or click to select
                </p>
                <p style={{ fontSize: "12px", color: tk.mutedText, marginTop: "4px" }}>
                  PNG, JPG, WebP, GIF up to 5MB each
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "12px",
            background: tk.errorBg,
            border: `1px solid ${tk.errorBorder}`,
            borderRadius: "8px",
          }}
        >
          <AlertCircle style={{ width: "16px", height: "16px", color: tk.errorText, flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontSize: "13px", color: tk.errorText }}>{error}</p>
        </div>
      )}

      {/* Images Preview Grid */}
      {totalImages > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: tk.countText }}>
            Current Images ({totalImages}/{maxImages})
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
            {/* Existing Images */}
            {existingImages.map((url, index) => (
              <div
                key={`existing-${index}`}
                className="group"
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: tk.imgBg,
                  border: `1px solid ${tk.imgBorder}`,
                  aspectRatio: "1",
                }}
              >
                <img src={url} alt={`Image ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <button
                    type="button"
                    onClick={() => onRemoveExisting?.(url)}
                    disabled={isLoading || disableUpload}
                    style={{
                      background: "#dc2626",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isLoading || disableUpload ? "not-allowed" : "pointer",
                      color: "white",
                    }}
                  >
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: tk.storedBadge,
                    color: "white",
                    fontSize: "9px",
                    padding: "2px 6px",
                    borderBottomLeftRadius: "6px",
                    fontWeight: 600,
                  }}
                >
                  Stored
                </div>
              </div>
            ))}

            {/* New Selected Files */}
            {selectedFiles.map((file, index) => (
              <div
                key={`new-${index}`}
                className="group"
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: tk.imgBg,
                  border: `2px solid rgba(22,163,74,0.45)`,
                  aspectRatio: "1",
                }}
              >
                <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <button
                    type="button"
                    onClick={() => onRemoveFile?.(index)}
                    disabled={isLoading || disableUpload}
                    style={{
                      background: "#dc2626",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isLoading || disableUpload ? "not-allowed" : "pointer",
                      color: "white",
                    }}
                  >
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: tk.newBadge,
                    color: "white",
                    fontSize: "9px",
                    padding: "2px 6px",
                    borderBottomLeftRadius: "6px",
                    fontWeight: 600,
                  }}
                >
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!disableUpload && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "12px",
            background: tk.hintBg,
            border: `1px solid ${tk.hintBorder}`,
            borderRadius: "8px",
          }}
        >
          <ImageIcon style={{ width: "14px", height: "14px", color: tk.hintIcon, marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: tk.hintText }}>
            Upload multiple high-quality images to showcase your property. The first image will be used as the primary image in listings.
          </p>
        </div>
      )}
    </div>
  );
};
