
interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  order: number;
}

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    courseId: '1',
    title: 'Data Structures Fundamentals Quiz',
    description: 'Test your knowledge of basic data structures concepts',
    order: 3,
    questions: [
      {
        id: 'q1-1',
        text: 'Which data structure uses LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        correctAnswer: 1
      },
      {
        id: 'q1-2',
        text: 'What is the time complexity of searching an element in a sorted array using binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1
      },
      {
        id: 'q1-3',
        text: 'Which of the following is NOT a linear data structure?',
        options: ['Array', 'Linked List', 'Stack', 'Tree'],
        correctAnswer: 3
      },
      {
        id: 'q1-4',
        text: 'In a singly linked list, each node contains:',
        options: [
          'Data and address of previous node',
          'Data and address of next node',
          'Only data',
          'Data and addresses of both previous and next nodes'
        ],
        correctAnswer: 1
      },
      {
        id: 'q1-5',
        text: 'What data structure would you use to implement a priority queue?',
        options: ['Stack', 'Queue', 'Heap', 'Linked List'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'quiz-2',
    courseId: '2',
    title: 'Operating Systems Concepts Quiz',
    description: 'Test your understanding of OS fundamentals',
    order: 2,
    questions: [
      {
        id: 'q2-1',
        text: 'Which of the following is not an operating system?',
        options: ['Windows', 'Linux', 'Oracle', 'macOS'],
        correctAnswer: 2
      },
      {
        id: 'q2-2',
        text: 'What is a deadlock in operating systems?',
        options: [
          'When a process is killed',
          'When a system crashes',
          'When two or more processes wait indefinitely for resources held by each other',
          'When CPU utilization is 100%'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2-3',
        text: 'Which scheduling algorithm allocates the CPU first to the process with the shortest expected processing time?',
        options: ['FIFO', 'Round Robin', 'Shortest Job First', 'Priority Scheduling'],
        correctAnswer: 2
      },
      {
        id: 'q2-4',
        text: 'Virtual memory uses which storage for temporary swapping?',
        options: ['RAM', 'Hard disk', 'CPU cache', 'ROM'],
        correctAnswer: 1
      },
      {
        id: 'q2-5',
        text: 'What is thrashing in operating systems?',
        options: [
          'When a process constantly competes for CPU time',
          'When the system spends most of its time paging instead of executing',
          'When multiple processes try to access the same resource',
          'When the CPU is idle'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'quiz-3',
    courseId: '3',
    title: 'Database Management Quiz',
    description: 'Test your knowledge of database concepts and SQL',
    order: 2,
    questions: [
      {
        id: 'q3-1',
        text: 'Which normal form eliminates transitive dependencies?',
        options: ['1NF', '2NF', '3NF', '4NF'],
        correctAnswer: 2
      },
      {
        id: 'q3-2',
        text: 'A foreign key is used to:',
        options: [
          'Uniquely identify each record in a table',
          'Link two tables together',
          'Ensure data validity',
          'Speed up queries'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3-3',
        text: 'ACID properties in database transactions stand for:',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Authentication, Computation, Integration, Delivery',
          'Authority, Connection, Integrity, Data',
          'Access, Control, Identity, Distribution'
        ],
        correctAnswer: 0
      },
      {
        id: 'q3-4',
        text: 'Which SQL statement is used to extract data from a database?',
        options: ['INSERT', 'UPDATE', 'SELECT', 'ALTER'],
        correctAnswer: 2
      },
      {
        id: 'q3-5',
        text: 'Which type of database does NOT use SQL?',
        options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'quiz-4',
    courseId: '4',
    title: 'Computer Networking Quiz',
    description: 'Test your knowledge of networking concepts and protocols',
    order: 3,
    questions: [
      {
        id: 'q4-1',
        text: 'Which protocol is used for sending email?',
        options: ['HTTP', 'FTP', 'SMTP', 'SSH'],
        correctAnswer: 2
      },
      {
        id: 'q4-2',
        text: 'What is the primary function of DNS?',
        options: [
          'To assign IP addresses',
          'To convert domain names to IP addresses',
          'To encrypt data',
          'To compress data for transmission'
        ],
        correctAnswer: 1
      },
      {
        id: 'q4-3',
        text: 'Which layer of the OSI model is responsible for routing?',
        options: ['Physical layer', 'Network layer', 'Transport layer', 'Application layer'],
        correctAnswer: 1
      },
      {
        id: 'q4-4',
        text: 'What is the maximum number of IP addresses possible in an IPv4 network?',
        options: [
          'Around 4.3 billion',
          'Around 340 undecillion',
          'Around 65,536',
          'Around 16 million'
        ],
        correctAnswer: 0
      },
      {
        id: 'q4-5',
        text: 'Which of these is NOT a valid TCP/IP protocol?',
        options: ['TCP', 'UDP', 'HTTP', 'OSI'],
        correctAnswer: 3
      }
    ]
  }
];

export const getCourseQuizzes = (courseId: string): Quiz[] => {
  return mockQuizzes.filter(quiz => quiz.courseId === courseId).sort((a, b) => a.order - b.order);
};

export const getQuiz = (quizId: string): Quiz | undefined => {
  return mockQuizzes.find(quiz => quiz.id === quizId);
};
