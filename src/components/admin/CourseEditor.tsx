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
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm({
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

  // Watch for title changes
  const watchedTitle = watch('title');

  // Load course videos and notes if editing existing course
  useEffect(() => {
    if (course?.id) {
      const fetchCourseContent = async () => {
        try {
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
          
          setVideos([{ title: '', description: '', url: '', duration: '', order: 1 }]);
          setNotes([{ title: '', description: '', fileUrl: '', fileType: 'pdf', order: 1 }]);
        }
      };
      
      fetchCourseContent();
    }
  }, [course?.id, course?.thumbnail, toast]);
  
  // Enhanced AI generation with YouTube video fetching
  const generateCourseDetails = async () => {
    const titleValue = watchedTitle || titleRef.current?.value;
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
      console.log('Generating course details for:', titleValue);
      
      const { data, error } = await supabase.functions.invoke('generate-course-details', {
        body: { title: titleValue }
      });
      
      if (error) throw error;
      
      if (data.success && data.courseDetails) {
        const { description, category, instructor, duration, level: aiLevel, videos: videoData } = data.courseDetails;
        
        // Update form values
        setValue('description', description);
        setValue('category', category);
        setValue('instructor', instructor);
        setValue('duration', duration);
        setLevel(aiLevel);
        
        // Generate a thumbnail URL using Unsplash
        const thumbnailUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(category.toLowerCase() + ' programming')}`;
        setValue('thumbnail', thumbnailUrl);
        
        // Process videos - now with YouTube URLs
        let newVideos = [];
        if (videoData && videoData.length > 0) {
          newVideos = videoData.map((video: any, index: number) => ({
            title: video.title || `Lesson ${index + 1}: ${titleValue}`,
            description: video.description || `Video lesson covering ${video.title || 'key concepts'}`,
            url: video.youtubeUrl || '',
            duration: video.duration || '10:00',
            thumbnail: video.thumbnail || '',
            order: index + 1
          }));
        } else {
          // Fallback videos if none were generated
          newVideos = [
            { 
              title: `Introduction to ${titleValue}`, 
              description: `Get started with the fundamentals of ${titleValue}`, 
              url: '', 
              duration: '15:00', 
              order: 1 
            },
            { 
              title: `${titleValue} Advanced Concepts`, 
              description: `Deep dive into advanced ${titleValue} topics`, 
              url: '', 
              duration: '20:00', 
              order: 2 
            },
            { 
              title: `${titleValue} Practical Applications`, 
              description: `Real-world applications and projects using ${titleValue}`, 
              url: '', 
              duration: '25:00', 
              order: 3 
            }
          ];
        }
        
        setVideos(newVideos);
        
        // Generate default notes
        const defaultNotes = [
          {
            title: `${titleValue} Course Materials`,
            description: `Comprehensive study materials for ${titleValue}`,
            fileUrl: '',
            fileType: 'pdf' as const,
            order: 1
          },
          {
            title: `${titleValue} Reference Guide`,
            description: `Quick reference guide and cheat sheet`,
            fileUrl: '',
            fileType: 'pdf' as const,
            order: 2
          }
        ];
        
        setNotes(defaultNotes);
        
        toast({
          title: "Course details generated",
          description: "AI has generated course details with YouTube videos based on your title",
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

  const onSubmit = (data: any) => {
    console.log('Submitting course data:', data);
    console.log('Videos:', videos);
    console.log('Notes:', notes);
    
    // Enhanced validation
    if (!data.title || !data.description || !data.category || !data.instructor || !data.duration || !data.thumbnail) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required course fields",
        variant: "destructive"
      });
      return;
    }

    // Validate level
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      toast({
        title: "Invalid level",
        description: "Please select a valid difficulty level",
        variant: "destructive"
      });
      return;
    }

    // Validate videos - allow empty URL for now, will be filled later
    const validVideos = videos.filter(v => v.title && v.title.trim() !== '');
    if (validVideos.length === 0) {
      toast({
        title: "At least one video required",
        description: "Please add at least one video to the course",
        variant: "destructive"
      });
      return;
    }

    // Validate notes - allow empty fileUrl for now
    const validNotes = notes.filter(n => n.title && n.title.trim() !== '');
    if (validNotes.length === 0) {
      toast({
        title: "At least one document required",
        description: "Please add at least one document to the course",
        variant: "destructive"
      });
      return;
    }
    
    // Show saving indicator
    toast({
      title: "Saving course...",
      description: "Please wait while we save your course",
    });
    
    // Save the course with videos and notes
    onSave(
      { 
        ...data, 
        level,
        enrolledCount: 0,
        rating: 0,
        featured: false
      },
      validVideos,
      validNotes
    );
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Title field with enhanced AI generation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="title">Course Title<span className="text-red-500">*</span></Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={generateCourseDetails}
                disabled={isGeneratingDetails || !watchedTitle}
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
              {...register('title', { required: 'Course title is required' })}
              className={errors.title ? 'border-red-500' : ''}
              placeholder="Enter course title to enable AI generation"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description<span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              className={errors.description ? 'border-red-500' : ''}
              rows={4}
              placeholder="Course description will be generated by AI"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category<span className="text-red-500">*</span></Label>
              <Input
                id="category"
                {...register('category', { required: 'Category is required' })}
                className={errors.category ? 'border-red-500' : ''}
                placeholder="Will be generated by AI"
              />
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor<span className="text-red-500">*</span></Label>
              <Input
                id="instructor"
                {...register('instructor', { required: 'Instructor is required' })}
                className={errors.instructor ? 'border-red-500' : ''}
                placeholder="Will be generated by AI"
              />
              {errors.instructor && (
                <p className="text-red-500 text-sm">{errors.instructor.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration<span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                placeholder="e.g., 8 weeks"
                {...register('duration', { required: 'Duration is required' })}
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm">{errors.duration.message}</p>
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
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL<span className="text-red-500">*</span></Label>
            <Input
              id="thumbnail"
              placeholder="Will be generated automatically"
              {...register('thumbnail', { required: 'Thumbnail URL is required' })}
              className={errors.thumbnail ? 'border-red-500' : ''}
            />
            {errors.thumbnail && (
              <p className="text-red-500 text-sm">{errors.thumbnail.message}</p>
            )}
          </div>
          
          {/* Videos section with better validation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Videos</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setVideos([...videos, { 
                  title: '', 
                  description: '', 
                  url: '', 
                  duration: '',
                  order: videos.length + 1 
                }])}
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
                      onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`video-title-${index}`}>Title<span className="text-red-500">*</span></Label>
                      <Input
                        id={`video-title-${index}`}
                        value={video.title || ''}
                        onChange={(e) => {
                          const updatedVideos = [...videos];
                          updatedVideos[index] = { ...updatedVideos[index], title: e.target.value };
                          setVideos(updatedVideos);
                        }}
                        placeholder="Video title (generated by AI)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-description-${index}`}>Description</Label>
                      <Textarea
                        id={`video-description-${index}`}
                        value={video.description || ''}
                        onChange={(e) => {
                          const updatedVideos = [...videos];
                          updatedVideos[index] = { ...updatedVideos[index], description: e.target.value };
                          setVideos(updatedVideos);
                        }}
                        placeholder="Video description (generated by AI)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-url-${index}`}>YouTube URL</Label>
                      <Input
                        id={`video-url-${index}`}
                        value={video.url || ''}
                        onChange={(e) => {
                          const updatedVideos = [...videos];
                          updatedVideos[index] = { ...updatedVideos[index], url: e.target.value };
                          setVideos(updatedVideos);
                        }}
                        placeholder="YouTube URL (can be added later)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`video-duration-${index}`}>Duration</Label>
                      <Input
                        id={`video-duration-${index}`}
                        value={video.duration || ''}
                        onChange={(e) => {
                          const updatedVideos = [...videos];
                          updatedVideos[index] = { ...updatedVideos[index], duration: e.target.value };
                          setVideos(updatedVideos);
                        }}
                        placeholder="e.g., 15:30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes section with better validation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Notes & Documents</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setNotes([...notes, { 
                  title: '', 
                  description: '', 
                  fileUrl: '', 
                  fileType: 'pdf',
                  order: notes.length + 1 
                }])}
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
                      onClick={() => setNotes(notes.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`note-title-${index}`}>Title<span className="text-red-500">*</span></Label>
                      <Input
                        id={`note-title-${index}`}
                        value={note.title || ''}
                        onChange={(e) => {
                          const updatedNotes = [...notes];
                          updatedNotes[index] = { ...updatedNotes[index], title: e.target.value };
                          setNotes(updatedNotes);
                        }}
                        placeholder="Document title (generated by AI)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`note-description-${index}`}>Description</Label>
                      <Textarea
                        id={`note-description-${index}`}
                        value={note.description || ''}
                        onChange={(e) => {
                          const updatedNotes = [...notes];
                          updatedNotes[index] = { ...updatedNotes[index], description: e.target.value };
                          setNotes(updatedNotes);
                        }}
                        placeholder="Document description (generated by AI)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`note-type-${index}`}>File Type</Label>
                      <Select 
                        value={note.fileType as string} 
                        onValueChange={(value: string) => {
                          const updatedNotes = [...notes];
                          updatedNotes[index] = { ...updatedNotes[index], fileType: value as 'pdf' | 'doc' | 'txt' };
                          setNotes(updatedNotes);
                        }}
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
