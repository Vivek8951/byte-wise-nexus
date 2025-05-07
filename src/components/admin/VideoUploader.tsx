
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/utils/supabaseStorage";
import { useCourses } from "@/context/CourseContext";

interface VideoUploaderProps {
  courseId: string;
  onUploadComplete?: () => void;
}

export function VideoUploader({ courseId, onUploadComplete }: VideoUploaderProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { addVideo, videos } = useCourses();

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast({
        title: "Video required",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for the video",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Calculate estimated video duration (in seconds)
      // In a real app, this would be more accurate
      const estimatedDuration = Math.round(videoFile.size / (1024 * 1024) * 5); // ~5 seconds per MB

      // 1. Upload video file to Supabase Storage
      const videoPath = `${courseId}/${Date.now()}_${videoFile.name.replace(/\s+/g, '_')}`;
      const videoUrl = await uploadFile(videoFile, 'course-materials', videoPath);
      setProgress(40);

      if (!videoUrl) {
        throw new Error("Failed to upload video");
      }

      // 2. Upload thumbnail if provided, otherwise use a placeholder
      let thumbnailUrl = '';
      if (thumbnail) {
        const thumbPath = `${courseId}/${Date.now()}_thumb_${thumbnail.name.replace(/\s+/g, '_')}`;
        thumbnailUrl = await uploadFile(thumbnail, 'course-thumbnails', thumbPath) || '';
      }
      setProgress(60);

      // 3. Create video record in database
      const videoData = {
        courseId: courseId,
        title: title,
        description: description,
        url: videoUrl,
        duration: String(estimatedDuration), // Convert number to string to match the Video interface
        thumbnail: thumbnailUrl,
        order: videos.filter(v => v.courseId === courseId).length + 1,
        analyzedContent: null
      };

      const newVideo = await addVideo(videoData);
      setProgress(80);

      if (!newVideo || !newVideo.id) {
        throw new Error("Failed to create video record");
      }

      setIsUploading(false);
      setProgress(100);

      // 4. Trigger AI processing
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke("process-video", {
        body: { videoId: newVideo.id, courseId: courseId },
      });

      if (error) {
        console.error("Error processing video:", error);
        toast({
          title: "Processing error",
          description: "Video uploaded but AI processing failed. You can try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Video uploaded and processed",
          description: "The video has been successfully uploaded and analyzed",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnail(null);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-left">Upload New Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="video-title">Video Title</Label>
          <Input
            id="video-title"
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading || isProcessing}
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="video-description">Description</Label>
          <Textarea
            id="video-description"
            placeholder="Enter video description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading || isProcessing}
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="video-file">Video File (MP4)</Label>
          <Input
            id="video-file"
            type="file"
            accept="video/mp4"
            onChange={handleVideoChange}
            disabled={isUploading || isProcessing}
            className="cursor-pointer"
          />
          {videoFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="video-thumbnail">Thumbnail (Optional)</Label>
          <Input
            id="video-thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={isUploading || isProcessing}
            className="cursor-pointer"
          />
          {thumbnail && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="h-20 w-auto object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {(isUploading || isProcessing) && (
          <div className="w-full bg-secondary rounded-full h-2.5 my-4">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-sm text-muted-foreground mt-1">
              {isUploading ? "Uploading..." : "AI Processing..."}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isUploading || isProcessing || !videoFile}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
