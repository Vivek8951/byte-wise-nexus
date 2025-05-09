
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus,
  Save,
  Trash2, 
  File,
  Video as VideoIcon,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Course, Video as VideoType, Note } from '@/types';
import { Progress } from '@/components/ui/progress';
import { VideoAnalysis } from '@/components/courses/VideoAnalysis';
import { supabase } from "@/integrations/supabase/client";

interface CourseEditorProps {
  course?: Course;
  onSave: (courseData: Partial<Course>, videos: Partial<VideoType>[], notes: Partial<Note>[]) => void;
  onCancel: () => void;
}

export function CourseEditor({ course, onSave, onCancel }: CourseEditorProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: course || {
      title: '',
      description: '',
      category: '',
      instructor: '',
      duration: '',
      level: 'beginner',
      thumbnail: '',
    }
  });
  
  // Main states
  const [level, setLevel] = useState<string>(course?.level || 'beginner');
  const [videos, setVideos] = useState<Partial<VideoType>[]>(
    course?.id ? [] : [{ title: '', description: '', url: '', duration: '', order: 1 }]
  );
  const [notes, setNotes] = useState<Partial<Note>[]>(
    course?.id ? [] : [{ title: '', description: '', fileUrl: '', fileType: 'pdf', order: 1 }]
  );
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});
  
  // AI generation states
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  
  // File upload references
  const videoFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const noteFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const previewVideos = useRef<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement | null>(null);
  
  const { toast } = useToast();
  
  // Load course videos and notes if editing existing course
  useEffect(() => {
    if (course?.id) {
      // In a real app, you would fetch videos and notes for this course
      // For now, we'll just simulate this with the existing mock data
      
      // Simulated API call delay
      const fetchCourseContent = async () => {
        try {
          // Fetch videos
          const { data: videoData, error: videoError } = await supabase
            .from('videos')
            .select('*')
            .eq('course_id', course.id)
            .order('order_num', { ascending: true });
          
          if (videoError) throw videoError;
          
          const fetchedVideos: Partial<VideoType>[] = videoData.map(video => ({
            id: video.id,
            courseId: video.course_id,
            title: video.title,
            description: video.description,
            url: video.url,
            duration: video.duration,
            thumbnail: video.thumbnail,
            order: video.order_num
          }));
          
          // Fetch notes
          const { data: notesData, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('course_id', course.id)
            .order('order_num', { ascending: true });
          
          if (notesError) throw notesError;
          
          const fetchedNotes: Partial<Note>[] = notesData.map(note => ({
            id: note.id,
            courseId: note.course_id,
            title: note.title,
            description: note.description, 
            fileUrl: note.file_url,
            fileType: note.file_type as 'pdf' | 'doc' | 'txt',
            order: note.order_num
          }));
          
          // If no videos or notes were found, add empty ones
          if (fetchedVideos.length === 0) {
            fetchedVideos.push({ title: '', description: '', url: '', duration: '', order: 1 });
          }
          
          if (fetchedNotes.length === 0) {
            fetchedNotes.push({ title: '', description: '', fileUrl: '', fileType: 'pdf', order: 1 });
          }
          
          setVideos(fetchedVideos);
          setNotes(fetchedNotes);
        } catch (error) {
          console.error("Error fetching course content:", error);
          toast({
            title: "Error",
            description: "Failed to load course content",
            variant: "destructive",
          });
          
          // Set default empty content
          setVideos([{ title: '', description: '', url: '', duration: '', order: 1 }]);
          setNotes([{ title: '', description: '', fileUrl: '', fileType: 'pdf', order: 1 }]);
        }
      };
      
      fetchCourseContent();
    }
  }, [course?.id, course?.thumbnail, toast]);
  
  // Generate course details with AI
  const generateCourseDetails = async () => {
    const titleValue = titleRef.current?.value;
    if (!titleValue) {
      toast({
        title: "Title required",
        description: "Please enter a course title before generating details",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingDetails(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-details', {
        body: { title: titleValue }
      });
      
      if (error) throw error;
      
      if (data.success && data.courseDetails) {
        const { description, category, instructor, duration, level: aiLevel, videos: videoTitles } = data.courseDetails;
        
        // Update form values
        setValue('description', description);
        setValue('category', category);
        setValue('instructor', instructor);
        setValue('duration', duration);
        setLevel(aiLevel);
        
        // Generate a thumbnail URL - use Unsplash for now
        const thumbnailUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(category.toLowerCase())}`;
        setValue('thumbnail', thumbnailUrl);
        
        // Update video titles
        const newVideos = videoTitles.map((title: string, index: number) => ({
          title,
          description: `Video lesson for ${title}`,
          url: '',
          duration: '',
          order: index + 1
        }));
        
        // Add at least one video if none were generated
        if (newVideos.length === 0) {
          newVideos.push({ 
            title: `Introduction to ${titleValue}`, 
            description: `Video lesson introducing ${titleValue}`, 
            url: '', 
            duration: '', 
            order: 1 
          });
        }
        
        setVideos(newVideos);
        
        toast({
          title: "Course details generated",
          description: "AI has generated course details based on your title",
        });
      } else {
        throw new Error("Failed to generate course details");
      }
    } catch (error) {
      console.error("Error generating course details:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate course details. Please try again or fill in manually.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDetails(false);
    }
  };
  
  // Add new state for auto-generated content
  const [autoGeneratedContent, setAutoGeneratedContent] = useState<{
    videoIndex: number;
    title?: string;
    description?: string;
    parts?: any[];
  } | null>(null);
  
  const addVideo = () => {
    setVideos([...videos, { 
      title: '', 
      description: '', 
      url: '', 
      duration: '',
      order: videos.length + 1 
    }]);
    
    // Add null to the refs array for the new video
    videoFileRefs.current = [...videoFileRefs.current, null];
  };
  
  const updateVideo = (index: number, field: string, value: string) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setVideos(updatedVideos);
  };
  
  const removeVideo = (index: number) => {
    const videoToRemove = videos[index];
    
    // Clean up any previews
    if (videoToRemove && videoToRemove.url && previewVideos.current[videoToRemove.url]) {
      URL.revokeObjectURL(previewVideos.current[videoToRemove.url]);
      delete previewVideos.current[videoToRemove.url];
    }
    
    setVideos(videos.filter((_, i) => i !== index));
    
    // Remove the ref for the deleted video
    const newRefs = [...videoFileRefs.current];
    newRefs.splice(index, 1);
    videoFileRefs.current = newRefs;
  };
  
  const addNote = () => {
    setNotes([...notes, { 
      title: '', 
      description: '', 
      fileUrl: '', 
      fileType: 'pdf',
      order: notes.length + 1 
    }]);
    
    // Add null to the refs array for the new note
    noteFileRefs.current = [...noteFileRefs.current, null];
  };
  
  const updateNote = (index: number, field: string, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = { ...updatedNotes[index], [field]: value };
    setNotes(updatedNotes);
  };
  
  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
    
    // Remove the ref for the deleted note
    const newRefs = [...noteFileRefs.current];
    newRefs.splice(index, 1);
    noteFileRefs.current = newRefs;
  };
  
  // Simulated file upload function (in a real app, this would upload to a server)
  const simulateFileUpload = (file: File, id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Set initial status
      setUploadStatus(prev => ({ ...prev, [id]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      // Create a simulated progress interval
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[id] || 0;
          const newProgress = Math.min(currentProgress + Math.random() * 20, 99);
          return { ...prev, [id]: newProgress };
        });
      }, 300);
      
      // After a delay, complete the "upload"
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [id]: 100 }));
        
        // 10% chance of error for realistic simulation
        if (Math.random() > 0.9) {
          setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
          reject(new Error('Upload failed'));
        } else {
          setUploadStatus(prev => ({ ...prev, [id]: 'success' }));
          
          // Create a local URL for video previews
          if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            previewVideos.current[file.name] = url;
          }
          
          resolve(file.name);
        }
      }, 2000 + Math.random() * 2000);
    });
  };
  
  // Process and fetch YouTube information for a video URL
  const processYouTubeUrl = async (index: number, url: string) => {
    // Check if this is a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (!match) return;
    
    const videoId = match[1];
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    
    // Update the URL to the embed version
    updateVideo(index, 'url', embedUrl);
    
    try {
      // Call the process-video edge function to get video details
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { videoId, courseId: course?.id || 'new' }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        // Update with the retrieved data
        updateVideo(index, 'title', data.data.title || videos[index].title || '');
        updateVideo(index, 'description', data.data.description || videos[index].description || '');
        updateVideo(index, 'thumbnail', data.data.thumbnail || '');
        
        toast({
          title: "Video processed",
          description: "YouTube video details have been retrieved",
        });
      }
    } catch (error) {
      console.error("Error processing YouTube video:", error);
      toast({
        title: "Processing failed",
        description: "Failed to retrieve YouTube video details",
        variant: "destructive"
      });
    }
  };
  
  // Handle file uploads for videos - enhanced with video analysis
  const handleVideoFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileId = `video_${index}_${Date.now()}`;
    
    try {
      // Create a local URL for the video
      const objectUrl = URL.createObjectURL(file);
      previewVideos.current[file.name] = objectUrl;
      
      // Set initial upload status
      setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          const newProgress = Math.min(currentProgress + Math.random() * 20, 99);
          return { ...prev, [fileId]: newProgress };
        });
      }, 300);
      
      // After a delay, complete the "upload"
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(interval);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      setUploadStatus(prev => ({ ...prev, [fileId]: 'success' }));
      
      // Set the video URL
      updateVideo(index, 'url', file.name);
      
      // Create a Video object for analysis
      const videoForAnalysis: VideoType = {
        id: `temp_${index}`,
        title: videos[index].title || 'Untitled Video', 
        description: videos[index].description || 'Video content', 
        url: objectUrl,
        courseId: course?.id || '',
        order: index + 1, 
        thumbnail: '',
        duration: videos[index].duration || '0:00',
      };
      
      // Set current video for auto-analysis
      setAutoGeneratedContent({
        videoIndex: index,
        title: undefined,
        description: undefined,
        parts: undefined
      });
      
      toast({
        title: "Video uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle analysis results
  const handleAnalysisComplete = (videoIndex: number, analysis: { title?: string, description?: string, parts?: any[] }) => {
    // Auto-fill the video title if it's empty
    if (analysis.title && !videos[videoIndex].title) {
      updateVideo(videoIndex, 'title', analysis.title);
    }
    
    // Auto-fill the description if it's empty
    if (analysis.description && !videos[videoIndex].description) {
      updateVideo(videoIndex, 'description', analysis.description);
    }
    
    // Clear auto-generated content state
    setAutoGeneratedContent(null);
    
    toast({
      title: "Content generated",
      description: "Video content has been analyzed and information has been generated",
    });
  };
  
  // Handle file uploads for notes/documents
  const handleNoteFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileId = `note_${index}_${Date.now()}`;
    
    try {
      // In a real app, upload the file to storage and get a URL
      const fileUrl = await simulateFileUpload(file, fileId);
      
      updateNote(index, 'fileUrl', fileUrl);
      
      // Set the file type based on the file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType = 'pdf';
      
      if (['doc', 'docx'].includes(fileExtension)) {
        fileType = 'doc';
      } else if (['txt'].includes(fileExtension)) {
        fileType = 'txt';
      }
      
      updateNote(index, 'fileType', fileType);
      
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    }
  };
  
  // Trigger file input click
  const triggerVideoFileInput = (index: number) => {
    videoFileRefs.current[index]?.click();
  };
  
  const triggerNoteFileInput = (index: number) => {
    noteFileRefs.current[index]?.click();
  };
  
  const onSubmit = (data: any) => {
    // Show saving indicator
    toast({
      title: "Saving course...",
      description: "Please wait while we save your course",
    });
    
    // Validate required fields for videos and notes
    const videosValid = videos.every(v => v.title && v.url);
    const notesValid = notes.every(n => n.title && n.fileUrl);
    
    if (!videosValid) {
      toast({
        title: "Missing information",
        description: "Please fill out all required video fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!notesValid) {
      toast({
        title: "Missing information",
        description: "Please fill out all required note fields",
        variant: "destructive"
      });
      return;
    }
    
    // Save the course with videos and notes
    onSave(
      { ...data, level },
      videos,
      notes
    );
  };
  
  // Upload status indicator component
  const UploadStatus = ({ id, fileName }: { id: string, fileName: string }) => {
    const status = uploadStatus[id] || 'idle';
    const progress = uploadProgress[id] || 0;
    
    if (status === 'idle') return null;
    
    return (
      <div className="mt-1 mb-2">
        <div className="flex items-center gap-2 text-xs mb-1">
          {status === 'uploading' ? (
            <Loader2 className="h-3 w-3 animate-spin text-tech-blue" />
          ) : status === 'success' ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
          <span>
            {status === 'uploading' 
              ? `Uploading ${fileName}...` 
              : status === 'success' 
              ? `${fileName} uploaded successfully` 
              : `Failed to upload ${fileName}`}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    );
  };
  
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic course information form fields */}
        <div className="space-y-6">
          {/* Title field with AI generation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="title">Course Title<span className="text-red-500">*</span></Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={generateCourseDetails}
                disabled={isGeneratingDetails}
                className="flex items-center gap-1 text-xs"
              >
                {isGeneratingDetails ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                )}
                {isGeneratingDetails ? "Generating..." : "Generate Details with AI"}
              </Button>
            </div>
            <Input
              id="title"
              {...register('title', { required: true })}
              className={errors.title ? 'border-red-500' : ''}
              ref={(el) => {
                titleRef.current = el;
                const { ref } = register('title', { required: true });
                if (typeof ref === 'function') ref(el);
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">Course title is required</p>
            )}
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description<span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              {...register('description', { required: true })}
              className={errors.description ? 'border-red-500' : ''}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">Description is required</p>
            )}
          </div>
          
          {/* Category and instructor fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category<span className="text-red-500">*</span></Label>
              <Input
                id="category"
                {...register('category', { required: true })}
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && (
                <p className="text-red-500 text-sm">Category is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor<span className="text-red-500">*</span></Label>
              <Input
                id="instructor"
                {...register('instructor', { required: true })}
                className={errors.instructor ? 'border-red-500' : ''}
              />
              {errors.instructor && (
                <p className="text-red-500 text-sm">Instructor is required</p>
              )}
            </div>
          </div>
          
          {/* Duration and level fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration<span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                placeholder="e.g., 8 weeks"
                {...register('duration', { required: true })}
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm">Duration is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Level<span className="text-red-500">*</span></Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Thumbnail URL field */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL<span className="text-red-500">*</span></Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/image.jpg"
              {...register('thumbnail', { required: true })}
              className={errors.thumbnail ? 'border-red-500' : ''}
            />
            {errors.thumbnail && (
              <p className="text-red-500 text-sm">Thumbnail URL is required</p>
            )}
          </div>
          
          {/* Videos section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Videos</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addVideo}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Video
              </Button>
            </div>
            
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div 
                  key={index} 
                  className="border rounded-md p-4 space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <VideoIcon className="h-5 w-5 mr-2 text-tech-blue" />
                      <h4 className="font-medium">Video {index + 1}</h4>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  {/* Video preview if available */}
                  {video.url && previewVideos.current[video.url] && (
                    <div className="mt-2 mb-3">
                      <video 
                        src={previewVideos.current[video.url]} 
                        className="w-full max-h-40 object-cover rounded-md" 
                        controls
                      />
                    </div>
                  )}
                  
                  {/* YouTube video preview */}
                  {video.url && video.url.includes('youtube') && video.thumbnail && (
                    <div className="mt-2 mb-3 relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title || "Video thumbnail"}
                        className="w-full max-h-40 object-cover rounded-md" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-3">
                          <VideoIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Check if this video is currently being analyzed */}
                  {autoGeneratedContent && autoGeneratedContent.videoIndex === index && (
                    <div className="mb-3 p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-tech-blue" />
                        <span>Analyzing video content and generating information...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`video-title-${index}`}>Title<span className="text-red-500">*</span></Label>
                      <Input
                        id={`video-title-${index}`}
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-description-${index}`}>Description</Label>
                      <Textarea
                        id={`video-description-${index}`}
                        value={video.description}
                        onChange={(e) => updateVideo(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-file-${index}`}>Video URL or File<span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id={`video-url-${index}`}
                          value={video.url}
                          onChange={(e) => {
                            updateVideo(index, 'url', e.target.value);
                            if (e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be')) {
                              processYouTubeUrl(index, e.target.value);
                            }
                          }}
                          placeholder="YouTube URL or upload a video file"
                          className="flex-1"
                          required
                          disabled={uploadStatus[`video_${index}_${Date.now()}`] === 'uploading'}
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => triggerVideoFileInput(index)}
                          disabled={uploadStatus[`video_${index}_${Date.now()}`] === 'uploading'}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" /> {video.url ? 'Change' : 'Upload'}
                        </Button>
                        <input
                          type="file"
                          ref={(el) => (videoFileRefs.current[index] = el)}
                          className="hidden"
                          accept="video/*"
                          onChange={(e) => handleVideoFileChange(index, e)}
                        />
                      </div>
                      
                      {/* Show upload progress if uploading */}
                      {Object.keys(uploadStatus)
                        .filter(key => key.startsWith(`video_${index}_`) && uploadStatus[key] !== 'idle')
                        .map(key => (
                          <UploadStatus 
                            key={key} 
                            id={key} 
                            fileName={video.url || 'video'} 
                          />
                        ))
                      }
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-duration-${index}`}>Duration</Label>
                      <Input
                        id={`video-duration-${index}`}
                        value={video.duration}
                        onChange={(e) => updateVideo(index, 'duration', e.target.value)}
                        placeholder="45:30"
                      />
                    </div>
                    
                    {/* Video analysis component for auto-generating content */}
                    {video.url && previewVideos.current[video.url] && (
                      <div className="mt-4 border-t pt-4">
                        <VideoAnalysis 
                          video={{
                            ...video,
                            id: `temp_${index}`,
                            url: previewVideos.current[video.url],
                            courseId: course?.id || '',
                            title: video.title || 'Untitled Video',
                            description: video.description || 'Video content',
                            duration: video.duration || '0:00',
                            order: index + 1,
                          }}
                          onAnalysisComplete={(analysis) => handleAnalysisComplete(index, analysis)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes & Documents section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Notes & Documents</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addNote}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Document
              </Button>
            </div>
            
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div 
                  key={index} 
                  className="border rounded-md p-4 space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <File className="h-5 w-5 mr-2 text-tech-purple" />
                      <h4 className="font-medium">Document {index + 1}</h4>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNote(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`note-title-${index}`}>Title<span className="text-red-500">*</span></Label>
                      <Input
                        id={`note-title-${index}`}
                        value={note.title}
                        onChange={(e) => updateNote(index, 'title', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`note-description-${index}`}>Description</Label>
                      <Textarea
                        id={`note-description-${index}`}
                        value={note.description}
                        onChange={(e) => updateNote(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`note-file-${index}`}>Document File<span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id={`note-url-${index}`}
                          value={note.fileUrl}
                          onChange={(e) => updateNote(index, 'fileUrl', e.target.value)}
                          placeholder="Upload a document file"
                          className="flex-1"
                          required
                          disabled={uploadStatus[`note_${index}_${Date.now()}`] === 'uploading'}
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => triggerNoteFileInput(index)}
                          disabled={uploadStatus[`note_${index}_${Date.now()}`] === 'uploading'}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" /> {note.fileUrl ? 'Change' : 'Upload'}
                        </Button>
                        <input
                          type="file"
                          ref={(el) => (noteFileRefs.current[index] = el)}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleNoteFileChange(index, e)}
                        />
                      </div>
                      
                      {/* Show upload progress if uploading */}
                      {Object.keys(uploadStatus)
                        .filter(key => key.startsWith(`note_${index}_`) && uploadStatus[key] !== 'idle')
                        .map(key => (
                          <UploadStatus 
                            key={key} 
                            id={key} 
                            fileName={note.fileUrl || 'document'} 
                          />
                        ))
                      }
                    </div>
                    
                    <div>
                      <Label htmlFor={`note-type-${index}`}>File Type</Label>
                      <Select 
                        value={note.fileType as string} 
                        onValueChange={(value) => updateNote(index, 'fileType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select file type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">Document</SelectItem>
                          <SelectItem value="txt">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit and cancel buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-tech-blue hover:bg-tech-darkblue flex items-center gap-2">
              <Save className="h-4 w-4" /> 
              Save Course
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
