"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface JobImageUploadProps {
  jobId?: string;
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

interface UploadingImage {
  id: string;
  preview: string;
}

export function JobImageUpload({
  jobId,
  images,
  onChange,
  disabled = false,
  maxImages = 5,
}: JobImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadMore = images.length + uploading.length < maxImages;

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const filesToUpload = Array.from(files).slice(
        0,
        maxImages - images.length - uploading.length
      );

      if (filesToUpload.length === 0) {
        toast({
          title: "Maximum images reached",
          description: `You can only upload ${maxImages} images per job.`,
          variant: "destructive",
        });
        return;
      }

      // Create previews and track uploading state
      const newUploading: UploadingImage[] = filesToUpload.map((file) => ({
        id: Math.random().toString(36).substring(7),
        preview: URL.createObjectURL(file),
      }));

      setUploading((prev) => [...prev, ...newUploading]);

      // Upload each file
      const uploadedUrls: string[] = [];
      const failedUploads: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const uploadingItem = newUploading[i];

        try {
          const formData = new FormData();
          formData.append("file", file);
          if (jobId) {
            formData.append("jobId", jobId);
          }

          const response = await fetch("/api/upload/job-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Upload failed");
          }

          const { url } = await response.json();
          uploadedUrls.push(url);
        } catch (error) {
          console.error("Upload error:", error);
          failedUploads.push(file.name);
        }

        // Remove from uploading state
        setUploading((prev) => prev.filter((u) => u.id !== uploadingItem.id));
        URL.revokeObjectURL(uploadingItem.preview);
      }

      // Update parent with new URLs
      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }

      // Show error for failed uploads
      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `Failed to upload: ${failedUploads.join(", ")}`,
          variant: "destructive",
        });
      }
    },
    [images, uploading.length, maxImages, jobId, onChange, toast]
  );

  const handleRemove = useCallback(
    async (urlToRemove: string) => {
      // Extract path from URL for deletion
      // URL format: https://xxx.supabase.co/storage/v1/object/public/job-images/jobs/...
      const pathMatch = urlToRemove.match(/job-images\/(.+)$/);

      if (pathMatch) {
        try {
          await fetch("/api/upload/job-image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pathMatch[1] }),
          });
        } catch (error) {
          console.error("Failed to delete from storage:", error);
        }
      }

      onChange(images.filter((url) => url !== urlToRemove));
    },
    [images, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && canUploadMore) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [disabled, canUploadMore, handleUpload]
  );

  const handleClick = () => {
    if (!disabled && canUploadMore) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          (disabled || !canUploadMore) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          disabled={disabled || !canUploadMore}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {canUploadMore
                ? "Drop images here or click to upload"
                : "Maximum images reached"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {images.length}/{maxImages} images • JPEG, PNG, WebP, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Existing images */}
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
            >
              <Image
                src={url}
                alt={`Job photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(url);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* Uploading placeholders */}
          {uploading.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img
                src={item.preview}
                alt="Uploading..."
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {canUploadMore &&
            Array.from({
              length: Math.min(2, maxImages - images.length - uploading.length),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                onClick={handleClick}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
