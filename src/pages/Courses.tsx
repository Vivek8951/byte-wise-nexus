import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BackButton } from "@/components/ui/back-button";

export default function Courses() {
  const { courses, isLoading } = useCourses();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  
  useEffect(() => {
    document.title = "Courses - TechLearn";
    
    // Get initial filters from URL params
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);
  
  useEffect(() => {
    // Apply filters
    let result = [...courses];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        course => course.title.toLowerCase().includes(term) || 
                 course.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(course => course.category === selectedCategory);
    }
    
    // Filter by level
    if (selectedLevel) {
      result = result.filter(course => course.level === selectedLevel);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
        result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    setFilteredCourses(result);
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update search parameters
  };
  
  const applyFilters = () => {
    // Update URL params if needed
    if (selectedCategory) {
      searchParams.set("category", selectedCategory);
    } else {
      searchParams.delete("category");
    }
    
    setSearchParams(searchParams);
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedLevel(null);
    setSearchTerm("");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };
  
  const categories = [
    { id: 'algorithms', name: 'Data Structures & Algorithms' },
    { id: 'systems', name: 'Operating Systems' },
    { id: 'databases', name: 'Database Management' },
    { id: 'networking', name: 'Networking' },
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'web', name: 'Web Development' },
  ];
  
  const levels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];
  
  const renderFilters = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.id}`} 
                checked={selectedCategory === category.id}
                onCheckedChange={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              />
              <Label 
                htmlFor={`category-${category.id}`}
                className="text-sm"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Levels */}
      <div>
        <h3 className="font-medium mb-4">Difficulty Level</h3>
        <div className="space-y-2">
          {levels.map(level => (
            <div key={level.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`level-${level.id}`} 
                checked={selectedLevel === level.id}
                onCheckedChange={() => setSelectedLevel(
                  selectedLevel === level.id ? null : level.id
                )}
              />
              <Label 
                htmlFor={`level-${level.id}`}
                className="text-sm"
              >
                {level.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
      </div>
    </div>
  );
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <BackButton href="/" className="mr-4" />
          <div>
            <h1 className="text-3xl font-bold heading-gradient">Browse Courses</h1>
            <p className="text-muted-foreground">
              Explore our comprehensive library of computer science courses
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block">
            <div className="sticky top-20">
              <div className="bg-card rounded-lg border p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
                {renderFilters()}
              </div>
            </div>
          </div>
          
          {/* Course Listing */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search courses..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <div key={index} className="h-80 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredCourses.length} of {courses.length} courses
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
