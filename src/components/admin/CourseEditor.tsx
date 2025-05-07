import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus,
  Save,
  Trash2, 
  File,
  Video,
  Upload
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

interface CourseEditorProps {
  course?: Course;
  onSave: (courseData: Partial<Course>, videos: Partial<VideoType>[], notes: Partial<Note>[]) => void;
  onCancel: () => void;
}

export function CourseEditor({ course, onSave, onCancel }: CourseEditorProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
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
  
  const [level, setLevel] = useState<string>(course?.level || 'beginner');
  const [videos, setVideos] = useState<Partial<VideoType>[]>(
    course?.id ? [] : [{ title: '', description: '', url: '', duration: '', order: 1 }]
  );
  const [notes, setNotes] = useState<Partial<Note>[]>(
    course?.id ? [] : [{ title: '', description: '', fileUrl: '', fileType: 'pdf', order: 1 }]
  );
  
  // File upload references
  const videoFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const noteFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { toast } = useToast();
  
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
  
  // Handle file uploads for videos
  const handleVideoFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just store the file name in the URL field
      // In a real app, you would upload this to storage and get a URL
      updateVideo(index, 'url', `file: ${file.name}`);
      
      // If you have a file upload service, you would use it here
      toast({
        title: "File selected",
        description: `Selected video: ${file.name}`,
      });
    }
  };
  
  // Handle file uploads for notes/documents
  const handleNoteFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just store the file name in the URL field
      // In a real app, you would upload this to storage and get a URL
      updateNote(index, 'fileUrl', `file: ${file.name}`);
      
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
        title: "File selected",
        description: `Selected document: ${file.name}`,
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
  
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title<span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">Course title is required</p>
            )}
          </div>
          
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
                      <Video className="h-5 w-5 mr-2 text-tech-blue" />
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
                      <Label htmlFor={`video-url-${index}`}>Video File<span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id={`video-url-${index}`}
                          value={video.url}
                          onChange={(e) => updateVideo(index, 'url', e.target.value)}
                          placeholder="https://example.com/video.mp4 or upload"
                          className="flex-1"
                          required
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => triggerVideoFileInput(index)}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" /> Upload
                        </Button>
                        <input
                          type="file"
                          ref={(el) => (videoFileRefs.current[index] = el)}
                          className="hidden"
                          accept="video/*"
                          onChange={(e) => handleVideoFileChange(index, e)}
                        />
                      </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
          
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
                      <Label htmlFor={`note-url-${index}`}>Document File<span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id={`note-url-${index}`}
                          value={note.fileUrl}
                          onChange={(e) => updateNote(index, 'fileUrl', e.target.value)}
                          placeholder="https://example.com/document.pdf or upload"
                          className="flex-1"
                          required
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => triggerNoteFileInput(index)}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" /> Upload
                        </Button>
                        <input
                          type="file"
                          ref={(el) => (noteFileRefs.current[index] = el)}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleNoteFileChange(index, e)}
                        />
                      </div>
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
