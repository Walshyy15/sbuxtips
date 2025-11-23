import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export default function FileDropzone({ onFileSelect, isProcessing }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await onFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
          isDragging ? "border-[hsl(var(--starbucks-green))] bg-[hsl(var(--starbucks-green))]/5" : "border-[hsl(var(--md-sys-color-outline))]",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-[hsl(var(--starbucks-green))] animate-spin" />
              <p className="text-sm text-[hsl(var(--starbucks-gray))]">Processing image...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--starbucks-green))]/10 flex items-center justify-center">
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-[hsl(var(--starbucks-green))]" />
                ) : (
                  <Upload className="w-8 h-8 text-[hsl(var(--starbucks-green))]" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-[hsl(var(--starbucks-green))] mb-1">
                  {isDragging ? "Drop your report here" : "Upload tip distribution report"}
                </p>
                <p className="text-sm text-[hsl(var(--starbucks-gray))]">
                  Drag and drop or click to browse
                </p>
              </div>
              <p className="text-xs text-[hsl(var(--starbucks-gray))]">
                Supported formats: PNG, JPG, JPEG
              </p>
            </>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={isProcessing}
      />
    </>
  );
}
