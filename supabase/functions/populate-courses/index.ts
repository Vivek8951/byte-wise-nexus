
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = 'https://weiagpwgfmyjdglfpbeu.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real course data with open source videos
const coursesData = [
  {
    title: "Introduction to Python Programming",
    description: "Learn the basics of Python programming language including variables, data types, control flow, functions, and more.",
    category: "Programming",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Dr. Charles Severance",
    duration: "8 weeks",
    level: "beginner",
    featured: true,
    videos: [
      {
        title: "Why Program?",
        description: "An introduction to Python and programming.",
        url: "https://archive.org/download/pythonlearn/PY_Intro_01_Introduction_to_Python_in_the_Cloud.mp4",
        duration: "660",
        order: 1
      },
      {
        title: "Variables and Expressions",
        description: "Understanding variables and expressions in Python.",
        url: "https://archive.org/download/pythonlearn/PY_Intro_02_UsingPython_variables.mp4",
        duration: "590",
        order: 2
      },
      {
        title: "Conditional Execution",
        description: "Conditional statements and boolean expressions.",
        url: "https://archive.org/download/pythonlearn/PY_Intro_03_Conditional_Execution.mp4",
        duration: "540",
        order: 3
      }
    ],
    quizzes: [
      {
        title: "Python Basics Quiz",
        description: "Test your understanding of Python basics",
        order: 1,
        questions: [
          {
            text: "Which of the following is NOT a built-in data type in Python?",
            options: ["int", "str", "array", "dict"],
            correctAnswer: 2
          },
          {
            text: "What does the following expression evaluate to: 3 + 2 * 2?",
            options: ["10", "7", "5", "Error"],
            correctAnswer: 1
          },
          {
            text: "What function is used to get the length of a list?",
            options: ["count()", "length()", "len()", "size()"],
            correctAnswer: 2
          }
        ]
      }
    ]
  },
  {
    title: "Web Development Fundamentals",
    description: "Learn the core technologies of web development: HTML, CSS, and JavaScript. Build responsive websites from scratch.",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1599507593548-0187ac4043c6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Brian Holt",
    duration: "6 weeks",
    level: "beginner",
    featured: true,
    videos: [
      {
        title: "Introduction to HTML",
        description: "Learn the basics of HTML markup language.",
        url: "https://archive.org/download/fcc-javascript-and-algorithms/1-html-css/1-basic-html-and-html5/1-say-hello-to-html-elements.mp4",
        duration: "300",
        order: 1
      },
      {
        title: "CSS Basics",
        description: "Learn how to style your web pages with CSS.",
        url: "https://archive.org/download/fcc-javascript-and-algorithms/1-html-css/2-basic-css/1-change-the-color-of-text.mp4",
        duration: "330",
        order: 2
      },
      {
        title: "JavaScript Fundamentals",
        description: "Introduction to JavaScript programming language.",
        url: "https://archive.org/download/fcc-javascript-and-algorithms/2-javascript-algorithms-and-data-structures/1-basic-javascript/1-comment-your-javascript-code.mp4",
        duration: "420",
        order: 3
      }
    ],
    quizzes: [
      {
        title: "HTML & CSS Quiz",
        description: "Test your understanding of HTML and CSS fundamentals",
        order: 1,
        questions: [
          {
            text: "Which HTML tag is used for creating a hyperlink?",
            options: ["<link>", "<a>", "<href>", "<url>"],
            correctAnswer: 1
          },
          {
            text: "Which CSS property is used to change the text color?",
            options: ["text-color", "font-color", "color", "text-style"],
            correctAnswer: 2
          },
          {
            text: "Which selector has the highest specificity?",
            options: ["Class selector", "Tag selector", "ID selector", "Universal selector"],
            correctAnswer: 2
          }
        ]
      }
    ]
  },
  {
    title: "Machine Learning with Python",
    description: "Learn the fundamentals of machine learning using Python and popular libraries like scikit-learn and TensorFlow.",
    category: "Data Science",
    thumbnail: "https://images.unsplash.com/photo-1629904853893-c2c8981a3fd5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Andrew Ng",
    duration: "10 weeks",
    level: "intermediate",
    featured: true,
    videos: [
      {
        title: "Introduction to Machine Learning",
        description: "Basic concepts of machine learning and its applications.",
        url: "https://archive.org/download/youtube-jnOZB46CbYw/Introduction_to_Machine_Learning_Andrew_Ng-jnOZB46CbYw.mp4",
        duration: "840",
        order: 1
      },
      {
        title: "Linear Regression",
        description: "Understanding linear regression and its implementation.",
        url: "https://archive.org/download/youtube-kHwlB_j7Hkc/Linear_Regression_with_One_Variable-kHwlB_j7Hkc.mp4",
        duration: "780",
        order: 2
      },
      {
        title: "Classification and Logistic Regression",
        description: "Learn about classification problems and logistic regression.",
        url: "https://archive.org/download/youtube-hCOIMkcsm_g/Logistic_Regression_and_Classification-hCOIMkcsm_g.mp4",
        duration: "720",
        order: 3
      }
    ],
    quizzes: [
      {
        title: "Machine Learning Concepts",
        description: "Test your understanding of key machine learning concepts",
        order: 1,
        questions: [
          {
            text: "Which of the following is NOT a type of machine learning?",
            options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Directive learning"],
            correctAnswer: 3
          },
          {
            text: "Which algorithm is best suited for regression problems?",
            options: ["Linear Regression", "K-Means", "Decision Trees", "All of the above"],
            correctAnswer: 0
          },
          {
            text: "What does the cost function measure in supervised learning?",
            options: ["Processing time", "Memory usage", "Error in predictions", "Model complexity"],
            correctAnswer: 2
          }
        ]
      }
    ]
  }
];

// Simplified list of other course templates
const courseTemplates = [
  {
    title: "Data Structures and Algorithms",
    category: "Computer Science",
    level: "intermediate",
    instructor: "Robert Sedgewick",
    description: "Master essential data structures like arrays, linked lists, trees, and graphs. Learn algorithms for sorting, searching, and graph traversal, with complexity analysis and optimization techniques.",
    videos: [
      { title: "Introduction to Algorithms", description: "Basic concepts and importance of algorithms" },
      { title: "Arrays and Linked Lists", description: "Understanding linear data structures" },
      { title: "Trees and Graphs", description: "Advanced data structures for complex relationships" }
    ]
  },
  {
    title: "React.js Fundamentals",
    category: "Web Development",
    level: "intermediate",
    instructor: "Kent C. Dodds",
    description: "Learn the core concepts of React.js including components, props, state, hooks, and the virtual DOM. Build interactive user interfaces with the most popular JavaScript library.",
    videos: [
      { title: "React Components and JSX", description: "Understanding the building blocks of React applications" },
      { title: "State and Props", description: "Managing data within React components" },
      { title: "Hooks and Effects", description: "Using functional components with React hooks" }
    ]
  },
  {
    title: "Introduction to Artificial Intelligence",
    category: "Data Science",
    level: "intermediate",
    instructor: "Sebastian Thrun",
    description: "Explore the fundamentals of AI including search algorithms, knowledge representation, machine learning, natural language processing, and computer vision applications.",
    videos: [
      { title: "Foundations of AI", description: "History and core concepts of artificial intelligence" },
      { title: "Search Algorithms", description: "Problem-solving with search strategies" },
      { title: "Knowledge Representation", description: "Representing and reasoning with knowledge" }
    ]
  },
  {
    title: "Mobile App Development with Flutter",
    category: "Mobile Development",
    level: "intermediate",
    instructor: "Angela Yu",
    description: "Create cross-platform mobile applications for iOS and Android using Flutter and Dart. Learn UI design, state management, and how to deploy apps to app stores.",
    videos: [
      { title: "Dart Programming Basics", description: "Learning the language behind Flutter" },
      { title: "Flutter Widgets", description: "Building UI components with Flutter" },
      { title: "State Management", description: "Managing application state effectively" }
    ]
  },
  {
    title: "Cybersecurity Fundamentals",
    category: "Cybersecurity",
    level: "beginner",
    instructor: "Kevin Mitnick",
    description: "Learn essential security concepts including threat modeling, encryption, network security, web security, and ethical hacking techniques to protect systems from attacks.",
    videos: [
      { title: "Security Mindset", description: "Thinking like a security professional" },
      { title: "Common Vulnerabilities", description: "Understanding attack vectors and weaknesses" },
      { title: "Defense Strategies", description: "Implementing effective security controls" }
    ]
  }
];

// Video sources for content, grouped by category
const videoSources = {
  "Programming": [
    "https://archive.org/download/pythonlearn/PY_Intro_01_Introduction_to_Python_in_the_Cloud.mp4",
    "https://archive.org/download/pythonlearn/PY_Intro_02_UsingPython_variables.mp4",
    "https://archive.org/download/pythonlearn/PY_Intro_03_Conditional_Execution.mp4",
    "https://archive.org/download/pythonlearn/PY_Intro_04_Functions.mp4"
  ],
  "Web Development": [
    "https://archive.org/download/fcc-javascript-and-algorithms/1-html-css/1-basic-html-and-html5/1-say-hello-to-html-elements.mp4",
    "https://archive.org/download/fcc-javascript-and-algorithms/1-html-css/2-basic-css/1-change-the-color-of-text.mp4",
    "https://archive.org/download/fcc-javascript-and-algorithms/2-javascript-algorithms-and-data-structures/1-basic-javascript/1-comment-your-javascript-code.mp4"
  ],
  "Data Science": [
    "https://archive.org/download/youtube-jnOZB46CbYw/Introduction_to_Machine_Learning_Andrew_Ng-jnOZB46CbYw.mp4",
    "https://archive.org/download/youtube-kHwlB_j7Hkc/Linear_Regression_with_One_Variable-kHwlB_j7Hkc.mp4",
    "https://archive.org/download/youtube-hCOIMkcsm_g/Logistic_Regression_and_Classification-hCOIMkcsm_g.mp4"
  ],
  "default": [
    "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
    "https://archive.org/download/ElephantsDream/ed_hd.mp4",
    "https://archive.org/download/SintelTrailer/sintel_trailer-480p.mp4"
  ]
};

// Function to get video URLs based on course category
function getVideosForCategory(category: string, count: number = 3) {
  const sources = videoSources[category] || videoSources.default;
  // If we don't have enough videos in the category, cycle through them
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(sources[i % sources.length]);
  }
  return result;
}

// Analyze video content function
function generateAnalyzedContent(title: string, description: string, courseTitle: string, courseCategory: string) {
  // Generate a realistic transcript related to the course content
  const transcript = `Welcome to this lecture on ${title} as part of our ${courseTitle} course. 
  In this session, we'll be exploring key concepts related to ${description.split('.')[0].toLowerCase()}. 
  This knowledge is fundamental to understanding ${courseCategory}. 
  We'll start with the basic principles, then move on to more advanced topics and practical applications.
  Throughout this lecture, we'll cover several important techniques and methodologies used in the field,
  and discuss how they relate to real-world scenarios in ${courseCategory}.
  By the end of this lecture, you'll have a solid understanding of ${title.toLowerCase()} 
  and be able to apply this knowledge in your own ${courseCategory} projects.`;
  
  // Generate a summary related to the course topic
  const summary = `This lecture on ${title} provides essential knowledge for ${courseCategory} students.
  It covers core concepts, practical applications, and best practices in the context of ${courseTitle}.
  The material builds a foundation for more advanced topics in later modules.`;
  
  // Generate quiz questions related to the course content
  const questions = [
    {
      question: `Which best describes the main focus of ${title} in ${courseCategory}?`,
      options: [
        `Understanding fundamental concepts in ${courseCategory}`, 
        `Advanced topics beyond the scope of this course`, 
        `Historical development of unrelated technologies`, 
        `Theoretical aspects with no practical applications`
      ],
      correctAnswer: 0
    },
    {
      question: `What is a key benefit of mastering ${title} as presented in this lecture?`,
      options: [
        `It's not useful for practical applications`, 
        `It helps build a foundation for advanced ${courseCategory} skills`, 
        `It's only relevant for academic research`, 
        `It's becoming obsolete in the industry`
      ],
      correctAnswer: 1
    },
    {
      question: `Which approach is recommended when applying ${title} concepts in real-world ${courseCategory} scenarios?`,
      options: [
        `Ignoring best practices for faster development`, 
        `Using only deprecated methods for compatibility`, 
        `Applying structured methodology with proper testing`, 
        `Avoiding documentation to save time`
      ],
      correctAnswer: 2
    }
  ];
  
  // Generate keywords related to the course topic
  const commonKeywords = courseCategory.toLowerCase().split(' ')
    .concat(courseTitle.toLowerCase().split(' '));
  
  const specificKeywords = title.toLowerCase().split(' ')
    .concat(description.toLowerCase().split(' ').filter(word => word.length > 5));
  
  const allKeywords = [...commonKeywords, ...specificKeywords]
    .filter((word, index, self) => self.indexOf(word) === index && word.length > 3)
    .slice(0, 6);
  
  return {
    transcript,
    summary,
    questions,
    keywords: allKeywords
  };
}

// Function to generate a unique course title
function generateUniqueCourseTitle(existingTitles: string[], template: any, attempt: number = 0): string {
  // If we're using a predefined course
  if (!template.customizable) {
    return template.title;
  }
  
  const baseTitle = template.title;
  // First attempt, use the base title
  if (attempt === 0) {
    if (!existingTitles.includes(baseTitle)) {
      return baseTitle;
    }
  }
  
  // Add variations to make the title unique
  const topics = [
    "Modern", "Advanced", "Professional", "Practical", "Essential", 
    "Comprehensive", "Mastering", "Ultimate", "Complete", "In-depth",
    "Hands-on", "Accelerated", "Interactive", "Strategic", "Fundamental"
  ];
  
  const frameworks = [
    "React", "Angular", "Vue", "Node.js", "Express", 
    "Django", "Flask", "Spring Boot", "Laravel", "ASP.NET",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn"
  ];
  
  const prefix = topics[attempt % topics.length];
  const suffix = frameworks[(attempt + 3) % frameworks.length];
  
  // Attempt different variations
  if (attempt < 5) {
    const newTitle = `${prefix} ${baseTitle}`;
    if (!existingTitles.includes(newTitle)) return newTitle;
  } else if (attempt < 10) {
    const newTitle = `${baseTitle} with ${suffix}`;
    if (!existingTitles.includes(newTitle)) return newTitle;
  } else {
    const newTitle = `${prefix} ${baseTitle} with ${suffix} - ${attempt}`;
    if (!existingTitles.includes(newTitle)) return newTitle;
  }
  
  // Recursively try another variation
  return generateUniqueCourseTitle(existingTitles, template, attempt + 1);
}

// Function to generate templates specific to a requested topic
function generateTopicSpecificTemplates(topic: string) {
  const templates = [];
  const normalizedTopic = topic.toLowerCase();
  
  // Common instructors for various topics
  const instructors = {
    "web": ["Sarah Johnson", "Michael Chen", "Jessica Taylor"],
    "data": ["David Rodriguez", "Emma Wilson", "James Lee"],
    "programming": ["Linda Kumar", "Robert Martinez", "Sophia Wang"],
    "ai": ["Daniel Kim", "Olivia Smith", "Ethan Johnson"],
    "design": ["Mia Thompson", "Noah Garcia", "Isabella Chen"]
  };
  
  // Get appropriate instructors based on topic
  let topicInstructors = instructors.programming; // Default
  Object.entries(instructors).forEach(([key, value]) => {
    if (normalizedTopic.includes(key)) {
      topicInstructors = value;
    }
  });
  
  // Add a few topic-specific courses
  if (normalizedTopic.includes("javascript") || normalizedTopic.includes("web")) {
    templates.push({
      title: `Modern JavaScript ${normalizedTopic.includes("advanced") ? "Advanced Techniques" : "Fundamentals"}`,
      category: "Web Development",
      level: "intermediate",
      instructor: topicInstructors[0],
      description: "Master modern JavaScript with ES6+ features, async programming, and advanced patterns for building robust web applications."
    });
    
    templates.push({
      title: "Full Stack Web Development Bootcamp",
      category: "Web Development",
      level: "intermediate",
      instructor: topicInstructors[1],
      description: "Build complete web applications from frontend to backend using modern frameworks and tools including React, Node.js, Express, and MongoDB."
    });
  }
  
  if (normalizedTopic.includes("python") || normalizedTopic.includes("data")) {
    templates.push({
      title: "Python for Data Science and Analytics",
      category: "Data Science",
      level: "intermediate",
      instructor: topicInstructors[0],
      description: "Learn to analyze and visualize data using Python libraries like Pandas, NumPy, and Matplotlib for data-driven insights and decision making."
    });
    
    templates.push({
      title: "Data Engineering Fundamentals",
      category: "Data Science",
      level: "intermediate",
      instructor: topicInstructors[2],
      description: "Master the skills of building robust data pipelines, ETL processes, and data warehouses for effective data management."
    });
  }
  
  if (normalizedTopic.includes("ai") || normalizedTopic.includes("machine")) {
    templates.push({
      title: "Practical Machine Learning Projects",
      category: "Data Science",
      level: "advanced",
      instructor: topicInstructors[1],
      description: "Apply machine learning algorithms to real-world problems using Python and industry-standard libraries like scikit-learn and TensorFlow."
    });
    
    templates.push({
      title: "Deep Learning Fundamentals",
      category: "Data Science",
      level: "advanced",
      instructor: topicInstructors[0],
      description: "Understand the principles of neural networks and implement deep learning models for computer vision, NLP, and more."
    });
  }
  
  // If we still don't have any templates, create generic ones based on the topic
  if (templates.length === 0) {
    templates.push({
      title: `Introduction to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
      category: "Programming",
      level: "beginner",
      instructor: topicInstructors[0],
      description: `Learn the fundamentals of ${topic} from the ground up with practical exercises and real-world examples.`
    });
    
    templates.push({
      title: `Advanced ${topic.charAt(0).toUpperCase() + topic.slice(1)} Techniques`,
      category: "Programming",
      level: "advanced",
      instructor: topicInstructors[1],
      description: `Take your ${topic} skills to the next level with advanced concepts, best practices, and professional workflows.`
    });
  }
  
  return templates;
}

// Function to populate courses
async function populateCourses(requestedCount = 1, options: { specificTopic?: string; ensureUnique?: boolean; clearExisting?: boolean } = {}) {
  const maxCount = Math.min(requestedCount, 100);  // Increased limit to 100 courses from 30
  const actualCount = Math.max(1, maxCount);      // Ensure at least 1 course
  
  console.log(`Generating ${actualCount} courses${options.specificTopic ? ` on topic: ${options.specificTopic}` : ''}`);
  
  try {
    // Get existing course titles to ensure uniqueness
    const existingTitles: string[] = [];
    if (options.ensureUnique) {
      const { data: existingCourses } = await supabase
        .from('courses')
        .select('title');
      
      if (existingCourses) {
        existingCourses.forEach(course => existingTitles.push(course.title));
      }
    }

    // Clear existing courses if requested
    if (options.clearExisting) {
      console.log("Clearing existing courses as requested");
      const { error: clearError } = await supabase
        .from('courses')
        .delete()
        .not('id', 'is', null);
      
      if (clearError) {
        console.error("Error clearing courses:", clearError);
        return { success: false, error: clearError };
      }
    }

    let coursesAdded = 0;
    const totalToAdd = actualCount;
    
    // Process the fully detailed courses first, up to the requested count
    const detailedCourseLimit = Math.min(actualCount, coursesData.length);
    for (let i = 0; i < detailedCourseLimit && coursesAdded < totalToAdd; i++) {
      const course = coursesData[i];
      
      // Make the title unique if needed
      const courseTitle = options.ensureUnique 
        ? generateUniqueCourseTitle(existingTitles, { title: course.title, customizable: false }) 
        : course.title;
      
      if (options.ensureUnique) {
        existingTitles.push(courseTitle);
      }
      
      // Insert course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseTitle,
          description: course.description,
          category: course.category,
          thumbnail: course.thumbnail,
          thumbnail_url: course.thumbnail, // Added to support new schema
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          featured: course.featured || false,
          enrolled_count: 0,
          rating: 4.5
        })
        .select()
        .single();
      
      if (courseError) {
        console.error("Error inserting course:", courseError);
        continue;
      }
      
      const courseId = courseData.id;
      
      // Insert videos with content specific to the course
      for (const video of course.videos) {
        const analyzedContent = generateAnalyzedContent(
          video.title, 
          video.description,
          courseTitle,
          course.category
        );
        
        const { error: videoError } = await supabase
          .from('videos')
          .insert({
            course_id: courseId,
            title: video.title,
            description: video.description,
            url: video.url,
            duration: video.duration,
            thumbnail: course.thumbnail,
            order_num: video.order,
            analyzed_content: analyzedContent
          });
        
        if (videoError) {
          console.error("Error inserting video:", videoError);
        }
      }
      
      // Insert quizzes and notes
      for (const quiz of course.quizzes) {
        const { error: quizError } = await supabase
          .from('quizzes')
          .insert({
            course_id: courseId,
            title: quiz.title,
            description: quiz.description,
            order_num: quiz.order,
            questions: quiz.questions
          });
        
        if (quizError) {
          console.error("Error inserting quiz:", quizError);
        }
      }
      
      // Insert note as study material
      const { error: noteError } = await supabase
        .from('notes')
        .insert({
          course_id: courseId,
          title: `${courseTitle} - Study Material`,
          description: `Comprehensive study materials for ${courseTitle}`,
          file_url: "https://cdn.lovablecdn.com/demo-content/sample-course-notes.pdf",
          file_type: "pdf",
          order_num: 1
        });
      
      if (noteError) {
        console.error("Error inserting note:", noteError);
      }
      
      // Insert document to support the new schema
      const { error: documentError } = await supabase
        .from('documents')
        .insert({
          course_id: courseId,
          title: `${courseTitle} - Documentation`,
          description: `Official documentation for ${courseTitle}`,
          document_url: "https://cdn.lovablecdn.com/demo-content/sample-course-notes.pdf",
          file_type: "PDF"
        });
      
      if (documentError) {
        console.error("Error inserting document:", documentError);
      }
      
      coursesAdded++;
    }
    
    // If we need more courses, fill in with template-based courses
    if (coursesAdded < actualCount) {
      // How many more courses to generate from templates
      const remainingToAdd = actualCount - coursesAdded;
      
      // Add additional topics if a specific topic is requested
      let filteredTemplates = [...courseTemplates];
      if (options.specificTopic) {
        const topic = options.specificTopic.toLowerCase();
        // Add some topic-specific templates
        const specificTemplates = generateTopicSpecificTemplates(topic);
        filteredTemplates = [...specificTemplates, ...filteredTemplates];
      }
      
      // We'll cycle through the templates if we need more than we have templates for
      for (let i = 0; i < remainingToAdd; i++) {
        // Use modulo to cycle through templates but add an offset based on courses already added
        // This prevents the same templates from being used in the same order every time
        const offset = coursesAdded % 3; // Add some variability
        const templateIdx = (i + offset) % filteredTemplates.length;
        const template = filteredTemplates[templateIdx];
        
        // Generate a unique title
        const uniqueTitle = options.ensureUnique 
          ? generateUniqueCourseTitle(existingTitles, { ...template, customizable: true }) 
          : template.title;
        
        if (options.ensureUnique) {
          existingTitles.push(uniqueTitle);
        }
        
        // Generate a thumbnail URL
        const thumbnail = `https://images.unsplash.com/photo-${Math.floor(1500000000 + Math.random() * 500000000)}?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;
        
        // Insert course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: uniqueTitle,
            description: template.description,
            category: template.category,
            thumbnail: thumbnail,
            thumbnail_url: thumbnail, // Added to support new schema
            instructor: template.instructor,
            duration: `${Math.floor(4 + Math.random() * 8)} weeks`,
            level: template.level,
            featured: Math.random() > 0.8, // 20% chance to be featured
            enrolled_count: 0,
            rating: 4 + Math.random() * 1 // Random rating between 4.0 and 5.0
          })
          .select()
          .single();
        
        if (courseError) {
          console.error("Error inserting template course:", courseError);
          continue;
        }
        
        // Get appropriate videos for this category
        const videoUrls = getVideosForCategory(template.category, 3);
        
        // Insert videos with content matching the course
        const courseId = courseData.id;
        for (let v = 0; v < Math.min(template.videos.length, videoUrls.length); v++) {
          const videoTemplate = template.videos[v];
          const videoUrl = videoUrls[v];
          
          const analyzedContent = generateAnalyzedContent(
            videoTemplate.title,
            videoTemplate.description,
            template.title,
            template.category
          );
          
          const { error: videoError } = await supabase
            .from('videos')
            .insert({
              course_id: courseId,
              title: videoTemplate.title,
              description: videoTemplate.description,
              url: videoUrl,
              duration: Math.floor(300 + Math.random() * 600).toString(), // Random duration
              thumbnail: thumbnail,
              order_num: v + 1,
              analyzed_content: analyzedContent
            });
          
          if (videoError) {
            console.error("Error inserting video for template course:", videoError);
          }
        }
        
        // Create a quiz related to the course content
        const quizTitle = `${template.title} Assessment`;
        const quizDescription = `Test your understanding of ${template.title} concepts`;
        
        // Generate quiz questions specific to this course
        const quizQuestions = [
          {
            text: `What is the primary focus of ${template.title}?`,
            options: [`Core ${template.category} concepts and applications`, 
                      `Unrelated technological topics`, 
                      `Historical perspectives only`, 
                      `Basic introductory material only`],
            correctAnswer: 0
          },
          {
            text: `Which skill is most important when studying ${template.category}?`,
            options: [`Memorization without understanding`, 
                      `Practical application of concepts`, 
                      `Skipping foundational topics`, 
                      `Working without proper planning`],
            correctAnswer: 1
          },
          {
            text: `What approach does the course recommend for mastering ${template.title}?`,
            options: [`Focusing only on theory`, 
                      `Ignoring best practices`, 
                      `Consistent practice and application`, 
                      `Learning in isolation`],
            correctAnswer: 2
          }
        ];
        
        const { error: quizError } = await supabase
          .from('quizzes')
          .insert({
            course_id: courseId,
            title: quizTitle,
            description: quizDescription,
            order_num: 1,
            questions: quizQuestions
          });
        
        if (quizError) {
          console.error("Error inserting quiz for template course:", quizError);
        }
        
        // Add study materials
        const { error: noteError } = await supabase
          .from('notes')
          .insert({
            course_id: courseId,
            title: `${template.title} - Study Guide`,
            description: `Essential materials for mastering ${template.title}`,
            file_url: "https://cdn.lovablecdn.com/demo-content/sample-course-notes.pdf",
            file_type: "pdf",
            order_num: 1
          });
        
        if (noteError) {
          console.error("Error inserting note for template course:", noteError);
        }
        
        // Insert document to support the new schema
        const { error: documentError } = await supabase
          .from('documents')
          .insert({
            course_id: courseId,
            title: `${template.title} - Documentation`,
            description: `Official documentation for ${template.title}`,
            document_url: "https://cdn.lovablecdn.com/demo-content/sample-course-notes.pdf",
            file_type: "PDF"
          });
        
        if (documentError) {
          console.error("Error inserting document for template course:", documentError);
        }
        
        coursesAdded++;
      }
    }
    
    return { 
      success: true, 
      coursesAdded: coursesAdded 
    };
  } catch (error) {
    console.error("Error in populateCourses:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    const numberOfCourses = requestData.numberOfCourses || 1;
    const specificTopic = requestData.specificTopic || '';
    const ensureUnique = requestData.ensureUnique || false;
    const clearExisting = requestData.clearExisting || false;
    
    console.log(`Received request to generate ${numberOfCourses} courses${specificTopic ? ` on topic: ${specificTopic}` : ''}`);
    console.log(`Clear existing courses: ${clearExisting}`);
    
    const result = await populateCourses(numberOfCourses, { 
      specificTopic,
      ensureUnique,
      clearExisting
    });
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
