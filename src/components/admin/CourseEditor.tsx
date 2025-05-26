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
  
  // Enhanced states for better UX
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  
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
  
  // Enhanced AI generation with better error handling and fallbacks
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
      
      // Generate description with fallback
      try {
        const { data: descData, error: descError } = await supabase.functions.invoke('text-generation', {
          body: { 
            prompt: `Write a professional course description for "${titleValue}". Include learning objectives, key topics, and target audience. Keep it between 100-200 words. Write in clear, professional English without any garbled text.`,
            maxTokens: 400,
            temperature: 0.3
          }
        });
        
        if (!descError && descData.generatedText) {
          setValue('description', descData.generatedText.trim());
        } else {
          // Fallback description
          setValue('description', `Comprehensive ${titleValue} course covering essential concepts, practical applications, and real-world scenarios. Students will learn through hands-on exercises, expert instruction, and interactive learning materials designed to build professional skills.`);
        }
      } catch (error) {
        console.error("Description generation failed, using fallback");
        setValue('description', `Learn ${titleValue} with this comprehensive course designed for practical skill development and career advancement.`);
      }
      
      // Generate other details with fallback
      try {
        const { data: detailsData, error: detailsError } = await supabase.functions.invoke('text-generation', {
          body: { 
            prompt: `For a course titled "${titleValue}", provide only these details in this exact format:
            Category: [category name]
            Instructor: [instructor name]
            Duration: [duration like "8 weeks"]
            Level: [beginner/intermediate/advanced]`,
            maxTokens: 200,
            temperature: 0.3
          }
        });
        
        if (!detailsError && detailsData.generatedText) {
          // Parse the details response
          const details = detailsData.generatedText;
          const categoryMatch = details.match(/Category:\s*(.+)/i);
          const instructorMatch = details.match(/Instructor:\s*(.+)/i);
          const durationMatch = details.match(/Duration:\s*(.+)/i);
          const levelMatch = details.match(/Level:\s*(.+)/i);
          
          if (categoryMatch) setValue('category', categoryMatch[1].trim());
          if (instructorMatch) setValue('instructor', instructorMatch[1].trim());
          if (durationMatch) setValue('duration', durationMatch[1].trim());
          if (levelMatch) {
            const levelValue = levelMatch[1].trim().toLowerCase();
            if (['beginner', 'intermediate', 'advanced'].includes(levelValue)) {
              setLevel(levelValue);
            }
          }
        } else {
          // Fallback values
          setValue('category', 'Computer Science');
          setValue('instructor', 'Dr. Sarah Johnson');
          setValue('duration', '8 weeks');
          setLevel('intermediate');
        }
      } catch (error) {
        console.error("Details generation failed, using fallback");
        setValue('category', 'Programming');
        setValue('instructor', 'Prof. Michael Chen');
        setValue('duration', '10 weeks');
        setLevel('beginner');
      }
      
      // Generate a thumbnail URL using Unsplash
      const category = watch('category') || titleValue;
      const thumbnailUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(category.toLowerCase() + ' programming')}`;
      setValue('thumbnail', thumbnailUrl);
      
      // Generate default videos
      const newVideos = [
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
        }
      ];
      
      setVideos(newVideos);
      
      // Generate default notes
      const defaultNotes = [
        {
          title: `${titleValue} Course Materials`,
          description: `Comprehensive study materials for ${titleValue}`,
          fileUrl: '',
          fileType: 'pdf' as const,
          order: 1
        }
      ];
      
      setNotes(defaultNotes);
      
      toast({
        title: "Course details generated",
        description: "Course details have been generated successfully (some may use fallback values)",
      });
    } catch (error) {
      console.error("Error generating course details:", error);
      
      // Complete fallback setup
      setValue('description', `Learn ${titleValue} with expert guidance and hands-on practice.`);
      setValue('category', 'Computer Science');
      setValue('instructor', 'Expert Instructor');
      setValue('duration', '8 weeks');
      setValue('thumbnail', `https://source.unsplash.com/800x600/?programming`);
      setLevel('intermediate');
      
      toast({
        title: "Using default values",
        description: "Generated default course details. You can modify them as needed.",
      });
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    try {
      console.log('Submitting course data:', data);
      console.log('Videos:', videos);
      console.log('Notes:', notes);
      
      // Enhanced validation
      if (!data.title?.trim()) {
        toast({
          title: "Title required",
          description: "Please enter a course title",
          variant: "destructive"
        });
        return;
      }

      if (!data.description?.trim()) {
        toast({
          title: "Description required", 
          description: "Please enter a course description",
          variant: "destructive"
        });
        return;
      }

      if (!data.category?.trim()) {
        toast({
          title: "Category required",
          description: "Please enter a course category",
          variant: "destructive"
        });
        return;
      }

      if (!data.instructor?.trim()) {
        toast({
          title: "Instructor required",
          description: "Please enter an instructor name",
          variant: "destructive"
        });
        return;
      }

      if (!data.duration?.trim()) {
        toast({
          title: "Duration required",
          description: "Please enter course duration",
          variant: "destructive"
        });
        return;
      }

      if (!data.thumbnail?.trim()) {
        toast({
          title: "Thumbnail required",
          description: "Please provide a thumbnail URL",
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

      // Validate videos - require at least one with title
      const validVideos = videos.filter(v => v.title && v.title.trim() !== '');
      if (validVideos.length === 0) {
        toast({
          title: "At least one video required",
          description: "Please add at least one video with a title",
          variant: "destructive"
        });
        return;
      }

      // Validate notes - require at least one with title
      const validNotes = notes.filter(n => n.title && n.title.trim() !== '');
      if (validNotes.length === 0) {
        toast({
          title: "At least one document required",
          description: "Please add at least one document with a title",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare course data
      const courseData = { 
        ...data, 
        level,
        enrolledCount: 0,
        rating: 0,
        featured: false
      };

      // Clean and validate videos
      const cleanVideos = validVideos.map((video, index) => ({
        ...video,
        order: index + 1,
        duration: video.duration || '10:00',
        description: video.description || '',
        url: video.url || '',
        thumbnail: video.thumbnail || ''
      }));

      // Clean and validate notes
      const cleanNotes = validNotes.map((note, index) => ({
        ...note,
        order: index + 1,
        description: note.description || '',
        fileUrl: note.fileUrl || '',
        fileType: note.fileType || 'pdf'
      }));
      
      console.log('Calling onSave with cleaned data...');
      
      // Save the course with videos and notes
      await onSave(courseData, cleanVideos, cleanNotes);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Save failed",
        description: "An error occurred while saving the course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
          
          {/* Videos section */}
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
                    {videos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
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
          
          {/* Notes section */}
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
                    {notes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNotes(notes.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-tech-blue hover:bg-tech-darkblue flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Course...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> 
                  Save Course
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
