import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUserCircle, FaChevronRight, FaChevronLeft, FaBook, FaSearch, FaArrowRight, FaTimes, FaSpinner } from 'react-icons/fa';
import RadialPulseLoader from './RadialPulseLoader';

const Dashboard = () => {
  const navigate = useNavigate();

  // Backend connection state
  const [backendData, setBackendData] = useState({
    isConnected: false,
    courses: [],
    faculties: [],
    institutions: [],
    isLoading: true,
    error: null
  });

  // Initialize with sessionStorage data or defaults
  const [subjects, setSubjects] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_subjects');
    return saved ? JSON.parse(saved) : [
      { subject: 'Mathematics', mark: '' },
      { subject: 'English', mark: '' },
      { subject: 'Physical Science', mark: '' }
    ];
  });

  const [userAPS, setUserAPS] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_userAPS');
    return saved ? JSON.parse(saved) : 0;
  });

  const [selectedFaculties, setSelectedFaculties] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_selectedFaculties');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCourses, setSelectedCourses] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_selectedCourses');
    return saved ? JSON.parse(saved) : [];
  });

  const [eligibleCourses, setEligibleCourses] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_eligibleCourses');
    return saved ? JSON.parse(saved) : [];
  });

  const [eligibleFaculties, setEligibleFaculties] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_eligibleFaculties');
    return saved ? JSON.parse(saved) : [];
  });

  const [showFaculties, setShowFaculties] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_showFaculties');
    return saved ? JSON.parse(saved) : false;
  });

  const [showChatbot, setShowChatbot] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentFacultyIndex, setCurrentFacultyIndex] = useState(0);
  const [showCoursesForFaculty, setShowCoursesForFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCalculatingEligibility, setIsCalculatingEligibility] = useState(false);
  
  // State for course filtering
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  
  // State for course details modal
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Chatbot state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // SMOOTH FACULTY SLIDING STATES
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);
  
  const facultiesPerView = 5;

  // Refs for click outside detection and smooth scrolling
  const profileMenuRef = useRef(null);
  const profileIconRef = useRef(null);
  const subjectsSectionRef = useRef(null);
  const facultiesSectionRef = useRef(null);
  const selectedCoursesSectionRef = useRef(null);
  const applySectionRef = useRef(null);
  const searchInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Student name
  const studentName = "John";

  // ====================
  // SUBJECT CATEGORIES - MATCH DATABASE PLURALS
  // ====================

  const subjectCategories = {
    mathematics: [
      'Mathematics',
      'Technical Mathematics',
      'Mathematical Literacy'
    ],
    sciences: [
      'Physical Sciences',
      'Technical Sciences',
      'Life Sciences',
      'Agricultural Sciences'
    ],
    business: [
      'Accounting',
      'Business Studies',
      'Economics'
    ],
    technology: [
      'Computer Applications Technology',
      'Information Technology',
      'Engineering Graphics and Design',
      'Civil Technology',
      'Electrical Technology',
      'Mechanical Technology'
    ],
    creative: [
      'Visual Arts',
      'Design',
      'Music',
      'Dramatic Arts',
      'Dance Studies'
    ],
    humanities: [
      'Geography',
      'History',
      'Tourism',
      'Religion Studies'
    ],
    consumer: [
      'Consumer Studies',
      'Hospitality Studies'
    ],
    homeLanguages: [
      'English HL',
      'Afrikaans HL',
      'IsiZulu HL',
      'IsiXhosa HL',
      'Sepedi HL',
      'Sesotho HL',
      'Setswana HL',
      'Tshivenda HL',
      'Xitsonga HL',
      'SiSwati HL',
      'Ndebele HL'
    ],
    additionalLanguages: [
      'English',
      'Afrikaans',
      'IsiZulu',
      'IsiXhosa',
      'Sepedi',
      'Sesotho',
      'Setswana',
      'Tshivenda',
      'Xitsonga',
      'SiSwati',
      'Ndebele'
    ]
  };

  // Create grouped subjects for select dropdown
  const groupedSubjects = {
    'Mathematics': subjectCategories.mathematics,
    'Science': subjectCategories.sciences,
    'Business/Commerce': subjectCategories.business,
    'Technology': subjectCategories.technology,
    'Creative Arts': subjectCategories.creative,
    'Humanities': subjectCategories.humanities,
    'Consumer Studies': subjectCategories.consumer,
    'Home Language': subjectCategories.homeLanguages,
    'Additional Language': subjectCategories.additionalLanguages
  };

  // Define faculty priority order (higher priority first)
  const facultyPriority = [
    'College of Business and Economics',
    'Faculty of Science',
    'Faculty of Engineering and the Built Environment',
    'Faculty of Engineering',
    'Faculty of Engineering, the Built Environment and Technology',
    'Faculty of ICT (Technology)',
    'Faculty of Health Sciences',
    'Faculty of Law',
    'Faculty of Education',
    'Faculty of Humanities',
    'Faculty of Management Sciences',
    'Faculty of Agriculture',
    'Faculty of Agriculture (Forestry)',
    'Art, Design and Architecture',
    'Faculty of Theology'
  ];

  // Helper function to determine qualification type from course
  const getQualificationType = (course) => {
    const name = course.name?.toLowerCase() || '';
    
    if (name.includes('bachelor') || name.includes('bcom') || name.includes('bsc') || 
        name.includes('degree') || name.startsWith('b.') || name.includes('b ')) {
      return 'degree';
    } else if (name.includes('diploma')) {
      return 'diploma';
    } else if (name.includes('higher certificate') || name.includes('certificate')) {
      return 'certificate';
    } else if (name.includes('online')) {
      return 'online';
    } else {
      if (course.qualification_type) {
        return course.qualification_type.toLowerCase();
      }
      return 'other';
    }
  };

  // Filter courses based on selected type
  const filterCoursesByType = (courses, filterType) => {
    if (filterType === 'all') return courses;
    return courses.filter(course => getQualificationType(course) === filterType);
  };

  // Fetch course details from backend
  const fetchCourseDetails = async (course) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${course.id}/additional-info`);
      let additionalInfo = [];
      
      if (response.ok) {
        const data = await response.json();
        additionalInfo = data.additional_info || [];
      }
      
      setSelectedCourseDetails({
        ...course,
        description: course.description || 'No description available.',
        additional_info: additionalInfo
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      setSelectedCourseDetails({
        ...course,
        description: course.description || 'No description available.',
        additional_info: []
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Send message to AI chatbot
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);
    
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }, 100);
    
    try {
      const marks = getStudentMarks();
      
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          studentMarks: marks,
          studentAPS: userAPS,
          selectedCourses: selectedCourses
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I had trouble understanding. Please try again!' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please check your internet and try again.' }]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Get student marks from all sources
  const getStudentMarks = useCallback(() => {
    try {
      const marks = subjects
        .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
        .map(subject => ({
          subject_name: subject.subject,
          mark: parseInt(subject.mark)
        }));
      return marks;
    } catch (error) {
      console.error('Error getting student marks:', error);
      return [];
    }
  }, [subjects]);

  // Initialize chat with welcome message
  useEffect(() => {
    setChatMessages([
      { role: 'bot', text: `Hey, how can I help?` }
    ]);
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        console.log("Testing backend connection...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const testResponse = await fetch('http://localhost:5000/api/test', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!testResponse.ok) {
          throw new Error(`Backend responded with status: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log("Backend test response:", testData);
        
        const coursesResponse = await fetch('http://localhost:5000/api/courses', {
          signal: controller.signal
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log(`Loaded ${coursesData.length} courses from backend`);
          
          setBackendData(prev => ({
            ...prev,
            isConnected: true,
            courses: coursesData,
            isLoading: false,
            error: null
          }));
        } else {
          setBackendData(prev => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            error: 'Could not load courses, but backend is connected'
          }));
        }
        
      } catch (error) {
        console.error("Backend connection error:", error);
        setBackendData(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
          error: error.message
        }));
      }
    };
    
    fetchBackendData();
  }, []);

  // Get current faculties from backend data
  const getCurrentFaculties = useCallback(() => {
    if (backendData.isConnected && backendData.courses.length > 0) {
      const facultiesMap = {};
      
      backendData.courses.forEach(course => {
        const facultyName = course.faculty_name || 'General';
        const facultyCategory = course.faculty_category || 'General';
        
        if (!facultiesMap[facultyName]) {
          facultiesMap[facultyName] = {
            id: course.faculty_id || facultyName.toLowerCase().replace(/\s+/g, '-'),
            name: facultyName,
            category: facultyCategory,
            courses: [],
            _coursesFull: [],
            minAPS: course.minAPS || 24
          };
        }
        
        if (!facultiesMap[facultyName].courses.includes(course.name)) {
          facultiesMap[facultyName].courses.push(course.name);
          facultiesMap[facultyName]._coursesFull.push(course);
        }
      });
      
      return Object.values(facultiesMap);
    }
    
    return [];
  }, [backendData]);

  // Get faculty by ID
  const getFacultyById = (facultyId) => {
    const currentFaculties = getCurrentFaculties();
    return currentFaculties.find(f => f.id === facultyId);
  };

  // Get faculty by name
  const getFacultyByName = (facultyName) => {
    const currentFaculties = getCurrentFaculties();
    return currentFaculties.find(f => f.name === facultyName);
  };

  // Calculate APS
  const calculateAPS = useCallback((mark) => {
    if (!mark || mark === '') return 0;
    const numMark = parseInt(mark);
    if (numMark >= 80) return 7;
    if (numMark >= 70) return 6;
    if (numMark >= 60) return 5;
    if (numMark >= 50) return 4;
    if (numMark >= 40) return 3;
    if (numMark >= 30) return 2;
    return 1;
  }, []);

  // Save subjects to sessionStorage
  const saveSubjects = useCallback((subjects) => {
    sessionStorage.setItem('dashboard_subjects', JSON.stringify(subjects));
  }, []);

  // Save other states to sessionStorage
  const saveState = useCallback((key, value) => {
    sessionStorage.setItem(`dashboard_${key}`, JSON.stringify(value));
  }, []);

  // Calculate total APS and save
  useEffect(() => {
    let totalAPS = 0;
    
    subjects.forEach(subject => {
      if (subject.mark && !isNaN(subject.mark) && subject.mark >= 0 && subject.mark <= 100) {
        totalAPS += calculateAPS(parseInt(subject.mark));
      }
    });
    
    setUserAPS(totalAPS);
    saveState('userAPS', totalAPS);
  }, [subjects, calculateAPS, saveState]);

  // Save subjects when they change
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects, saveSubjects]);

  // Save other states when they change
  useEffect(() => {
    saveState('selectedFaculties', selectedFaculties);
  }, [selectedFaculties, saveState]);

  useEffect(() => {
    saveState('selectedCourses', selectedCourses);
  }, [selectedCourses, saveState]);

  useEffect(() => {
    saveState('eligibleCourses', eligibleCourses);
  }, [eligibleCourses, saveState]);

  useEffect(() => {
    saveState('eligibleFaculties', eligibleFaculties);
  }, [eligibleFaculties, saveState]);

  useEffect(() => {
    saveState('showFaculties', showFaculties);
  }, [showFaculties, saveState]);

  // Clear data on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('dashboard_subjects');
      sessionStorage.removeItem('dashboard_userAPS');
      sessionStorage.removeItem('dashboard_selectedFaculties');
      sessionStorage.removeItem('dashboard_selectedCourses');
      sessionStorage.removeItem('dashboard_eligibleCourses');
      sessionStorage.removeItem('dashboard_eligibleFaculties');
      sessionStorage.removeItem('dashboard_showFaculties');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Call backend API to get eligible courses
  const calculateEligibleCourses = async () => {
    setIsCalculatingEligibility(true);
    
    try {
      const subjectsData = subjects
        .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
        .map(subject => ({
          subject_name: subject.subject,
          mark: parseInt(subject.mark)
        }));

      if (subjectsData.length === 0) {
        throw new Error('Please enter at least one subject mark');
      }

      if (!backendData.isConnected) {
        throw new Error('Backend server is not connected. Please check if server is running.');
      }

      const response = await fetch('http://localhost:5000/api/eligible-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjects: subjectsData })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const eligibleCoursesData = result.eligible_courses || [];
        setEligibleCourses(eligibleCoursesData);
        saveState('eligibleCourses', eligibleCoursesData);

        const facultiesMap = {};
        eligibleCoursesData.forEach(course => {
          const facultyName = course.faculty_name || 'General';
          if (!facultiesMap[facultyName]) {
            facultiesMap[facultyName] = {
              id: course.faculty_id || facultyName.toLowerCase().replace(/\s+/g, '-'),
              name: facultyName,
              category: course.faculty_category || 'General',
              courses: [],
              _coursesFull: []
            };
          }
          if (!facultiesMap[facultyName].courses.includes(course.name)) {
            facultiesMap[facultyName].courses.push(course.name);
            facultiesMap[facultyName]._coursesFull.push(course);
          }
        });

        let eligibleFacultiesData = Object.values(facultiesMap);
        
        // Sort faculties by priority
        eligibleFacultiesData.sort((a, b) => {
          const indexA = facultyPriority.indexOf(a.name);
          const indexB = facultyPriority.indexOf(b.name);
          
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setEligibleFaculties(eligibleFacultiesData);
        saveState('eligibleFaculties', eligibleFacultiesData);
        
        setCurrentFacultyIndex(0);
        
        const updatedSelectedFaculties = selectedFaculties.filter(facultyId => 
          eligibleFacultiesData.some(f => f.id === facultyId)
        );
        setSelectedFaculties(updatedSelectedFaculties);
        
        setShowFaculties(true);
        
        return eligibleFacultiesData;
      } else {
        throw new Error(result.error || 'Unknown error from backend');
      }
      
    } catch (error) {
      console.error('❌ Error calculating eligibility:', error);
      alert(`Error: ${error.message}`);
      return [];
    } finally {
      setIsCalculatingEligibility(false);
    }
  };

  // Find matches - calls backend
  const findMatches = async () => {
    const hasMarks = subjects.some(s => s.mark && s.mark !== '' && !isNaN(s.mark));
    if (!hasMarks) {
      alert('Please enter at least one mark to find matches');
      return;
    }
    
    if (!backendData.isConnected) {
      alert('Backend not connected. Please check if server is running on http://localhost:5000');
      return;
    }
    
    const eligibleFacultiesData = await calculateEligibleCourses();
    
    if (eligibleFacultiesData.length > 0) {
      setTimeout(() => {
        smoothScrollTo(facultiesSectionRef);
      }, 50);
    } else {
      alert('No faculties found that match your subjects. Try improving your marks or adding more subjects.');
      setShowFaculties(false);
    }
  };

  // Click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && 
          profileMenuRef.current && 
          !profileMenuRef.current.contains(event.target) &&
          profileIconRef.current &&
          !profileIconRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      
      if (showSearchModal && 
          !event.target.closest('.search-modal') && 
          !event.target.closest('.search-btn')) {
        setShowSearchModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showSearchModal]);

  // Smooth scroll function
  const smoothScrollTo = (ref, offset = 100) => {
    if (ref.current) {
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle faculty selection
  const toggleFacultySelection = (facultyId) => {
    const wasSelected = selectedFaculties.includes(facultyId);
    const faculty = getFacultyById(facultyId);
    
    setSelectedFaculties(prev => {
      if (prev.includes(facultyId)) {
        if (faculty) {
          setSelectedCourses(prevCourses => 
            prevCourses.filter(course => !faculty.courses.includes(course.name))
          );
        }
        setShowCoursesForFaculty(null);
        return prev.filter(id => id !== facultyId);
      } else {
        if (prev.length < 5) {
          setShowCoursesForFaculty(faculty);
          return [...prev, facultyId];
        } else {
          alert('You can only select up to 5 faculties');
          return prev;
        }
      }
    });
  };

  // Toggle course selection
  const toggleCourseSelection = (course) => {
    const courseName = course.name || course;
    const wasSelected = selectedCourses.some(c => c.name === courseName);
    
    setSelectedCourses(prev => {
      if (wasSelected) {
        return prev.filter(c => c.name !== courseName);
      } else {
        if (prev.length < 6) {
          const fullCourse = typeof course === 'object' ? course : { name: courseName };
          const newSelection = [...prev, fullCourse];
          
          if (prev.length === 0 && newSelection.length === 1) {
            setTimeout(() => smoothScrollTo(selectedCoursesSectionRef), 100);
          }
          return newSelection;
        } else {
          alert('You can only select up to 6 courses');
          return prev;
        }
      }
    });
  };

  // Check if a course is selected
  const isCourseSelected = (course) => {
    const courseName = course.name || course;
    return selectedCourses.some(c => c.name === courseName);
  };

  // Search for courses
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert('Please enter a course name to search');
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const results = [];
    
    eligibleCourses.forEach(course => {
      if (course.name.toLowerCase().includes(query)) {
        results.push({
          course: course.name,
          faculty: course.faculty_name,
          isEligible: true,
          facultyId: course.faculty_id,
          courseData: course
        });
      }
    });
    
    if (results.length === 0) {
      setSearchResults([{ course: 'No courses found', isEligible: false }]);
    } else {
      setSearchResults(results);
    }
    
    setShowSearchModal(true);
    
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Apply to selected courses
  const handleApply = () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course to apply');
      smoothScrollTo(facultiesSectionRef);
      return;
    }

    setIsNavigating(true);
    smoothScrollTo(applySectionRef);
    
    const studentMarks = subjects
      .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
      .map(subject => ({
        subject_name: subject.subject,
        mark: parseInt(subject.mark)
      }));
    
    console.log('📤 Passing marks to PaymentPage:', studentMarks);
    
    sessionStorage.setItem('dashboard_subjects', JSON.stringify(subjects));
    sessionStorage.setItem('student_marks', JSON.stringify(studentMarks));
    
    localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
    localStorage.setItem('student_marks', JSON.stringify(studentMarks));
    
    setTimeout(() => {
      navigate('/payment', { 
        state: { 
          selectedCourses: selectedCourses,
          studentMarks: studentMarks
        } 
      });
    }, 500);
  };

  // Handle closing courses modal
  const handleCloseCoursesModal = () => {
    setShowCoursesForFaculty(null);
    setCourseTypeFilter('all');
    if (selectedCourses.length > 0) {
      setTimeout(() => smoothScrollTo(selectedCoursesSectionRef), 300);
    }
  };

  // Calculate APS for individual subject
  const calculateIndividualAPS = (mark) => {
    if (!mark || mark === '' || isNaN(mark)) return '0';
    const numMark = parseInt(mark);
    return calculateAPS(numMark);
  };

  // ============================================
  // SMOOTH FACULTY SLIDING NAVIGATION
  // ============================================
  
  const nextFaculties = () => {
    if (currentFacultyIndex < eligibleFaculties.length - facultiesPerView && !isSliding) {
      setSlideDirection('right');
      setIsSliding(true);
      
      setTimeout(() => {
        setCurrentFacultyIndex(prev => prev + 1);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 350);
    }
  };

  const prevFaculties = () => {
    if (currentFacultyIndex > 0 && !isSliding) {
      setSlideDirection('left');
      setIsSliding(true);
      
      setTimeout(() => {
        setCurrentFacultyIndex(prev => prev - 1);
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection(null);
        }, 50);
      }, 350);
    }
  };

  // Get visible faculties
  const getVisibleFaculties = () => {
    return eligibleFaculties.slice(currentFacultyIndex, currentFacultyIndex + facultiesPerView);
  };

  // Handle subject updates
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { subject: 'Mathematics', mark: '' }]);
    setTimeout(() => {
      if (subjectsSectionRef.current) {
        const lastRow = subjectsSectionRef.current.querySelector('.subject-row:last-child');
        if (lastRow) {
          lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchModal(false);
  };

  // Clear all data
  const clearAllData = () => {
    sessionStorage.removeItem('dashboard_subjects');
    sessionStorage.removeItem('dashboard_userAPS');
    sessionStorage.removeItem('dashboard_selectedFaculties');
    sessionStorage.removeItem('dashboard_selectedCourses');
    sessionStorage.removeItem('dashboard_eligibleCourses');
    sessionStorage.removeItem('dashboard_eligibleFaculties');
    sessionStorage.removeItem('dashboard_showFaculties');
    
    setSubjects([
      { subject: 'Mathematics', mark: '' },
      { subject: 'English', mark: '' },
      { subject: 'Physical Science', mark: '' }
    ]);
    setUserAPS(0);
    setSelectedFaculties([]);
    setSelectedCourses([]);
    setEligibleCourses([]);
    setEligibleFaculties([]);
    setShowFaculties(false);
    setCurrentFacultyIndex(0);
    setShowCoursesForFaculty(null);
  };

  // Navigate to landing page and clear data
  const goToLandingPage = () => {
    clearAllData();
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  // Get courses for selected faculty with filter applied
  const getFilteredCoursesForSelectedFaculty = () => {
    if (!showCoursesForFaculty) return [];
    const courses = eligibleCourses.filter(course => 
      course.faculty_name === showCoursesForFaculty.name
    );
    return filterCoursesByType(courses, courseTypeFilter);
  };

  const visibleFaculties = getVisibleFaculties();

  return (
    <div className={`dashboard-app ${isNavigating ? 'page-exit' : ''}`}>
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="navigation-overlay">
          <div className="navigation-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Header with Logo and Navigation */}
      <header className="app-header fixed">
        <div className="header-content">
          <div className="logo">
            <img 
              src="/SKOLIFY LOGO.jpeg" 
              alt="Skolify Logo" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <span className="logo-text">Skolify</span>
          </div>
          
          <div className="header-actions">
            <div className="profile-container">
              <button 
                ref={profileIconRef}
                className="profile-icon"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Your profile"
              >
                <FaUserCircle />
              </button>
              
              {showProfileMenu && (
                <div className="profile-menu" ref={profileMenuRef}>
                  <div className="profile-header">
                    <FaUserCircle className="profile-menu-icon" />
                    <div>
                      <h4>Student Profile</h4>
                      <p>student@example.com</p>
                    </div>
                  </div>
                  <div className="profile-menu-items">
                    <button 
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }}
                    >
                      My Profile
                    </button>
                    <button 
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        alert('Applications page coming soon!');
                      }}
                    >
                      My Applications
                    </button>
                    <button 
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        alert('Settings page coming soon!');
                      }}
                    >
                      Settings
                    </button>
                    <button 
                      className="logout-btn"
                      onClick={goToLandingPage}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="search-modal">
          <div className="search-modal-content">
            <div className="search-modal-header">
              <h3>Search Courses</h3>
              <button 
                className="close-search-modal"
                onClick={clearSearch}
              >
                <FaTimes />
              </button>
            </div>
            <div className="search-input-group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a course..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-course-input"
              />
              <button 
                className="search-course-btn"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Search Results ({searchResults.length})</h4>
                <div className="results-list">
                  {searchResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`search-result-item ${result.isEligible ? 'eligible' : 'not-eligible'}`}
                      onClick={() => {
                        if (result.isEligible && result.courseData) {
                          toggleCourseSelection(result.courseData);
                          setShowSearchModal(false);
                        }
                      }}
                    >
                      <div className="result-course">{result.course}</div>
                      <div className="result-faculty">{result.faculty}</div>
                      <div className={`result-status ${result.isEligible ? 'eligible' : 'not-eligible'}`}>
                        {result.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourseDetails && (
        <div className="courses-modal" onClick={() => setSelectedCourseDetails(null)}>
          <div className="courses-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header">
              <h3>{selectedCourseDetails.name}</h3>
              <button 
                className="close-courses-modal"
                onClick={() => setSelectedCourseDetails(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="courses-modal-info">
              <p><strong>Institution:</strong> {selectedCourseDetails.institution_name || 'N/A'}</p>
              <p><strong>Faculty:</strong> {selectedCourseDetails.faculty_name || 'N/A'}</p>
              <p><strong>Duration:</strong> {selectedCourseDetails.duration_years} years</p>
              {selectedCourseDetails.minAPS && (
                <p><strong>Minimum APS:</strong> {selectedCourseDetails.minAPS}</p>
              )}
            </div>
            
            <div className="course-description-section" style={{ padding: '15px 20px', borderBottom: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Description</h4>
              <p style={{ margin: 0, color: '#666', lineHeight: 1.6, fontSize: '14px' }}>
                {selectedCourseDetails.description || 'No description available.'}
              </p>
            </div>
            
            {selectedCourseDetails.additional_info && selectedCourseDetails.additional_info.length > 0 && (
              <div className="course-additional-section" style={{ padding: '15px 20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Additional Information</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                  {selectedCourseDetails.additional_info.map((info, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>{info.info_text}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="courses-modal-footer">
              <div className="selected-count">
                {isLoadingDetails ? 'Loading...' : 'Course Details'}
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedCourseDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Floating Button */}
      <button 
        className="chatbot-floating-btn"
        onClick={() => setShowChatbot(!showChatbot)}
        title="Chat with our assistant"
      >
        <img 
          src="/chatbot.jpeg" 
          alt="Chat Assistant" 
          className="chatbot-icon"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.textContent = '💬';
          }}
        />
      </button>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <h3>Skolify Assistant</h3>
            <button 
              className="close-chatbot"
              onClick={() => setShowChatbot(false)}
            >
              ×
            </button>
          </div>
          <div className="chatbot-messages" ref={chatMessagesRef}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.role}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isChatLoading && (
              <div className="chatbot-message bot">
                <p><FaSpinner className="spinner-icon" /> Thinking...</p>
              </div>
            )}
          </div>
          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder="Ask me about courses, careers, or applications..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              disabled={isChatLoading}
            />
            <button onClick={sendChatMessage} disabled={isChatLoading}>
              {isChatLoading ? <FaSpinner className="spinner-icon" /> : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        <div className="app-container">
          
          {/* Divider Line */}
          <div className="divider-line"></div>

          {/* Main Heading */}
          <h1 className="main-heading">Enter Your Subjects</h1>

          {/* Subjects Section */}
          <div className="subjects-section" ref={subjectsSectionRef}>
            <p className="section-description">
              Enter your final high school marks. Click "Find My Options" to see eligible faculties.
            </p>
            
            <div className="subjects-table">
              <div className="table-header">
                <div className="subject-col">Subject</div>
                <div className="mark-col">Mark %</div>
                <div className="aps-col">APS</div>
                <div className="action-col"></div>
              </div>
              
              {subjects.map((subject, index) => (
                <div key={index} className="subject-row">
                  <div className="subject-col">
                    <select 
                      value={subject.subject} 
                      onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                      className="subject-select"
                    >
                      {Object.entries(groupedSubjects).map(([category, subjectsList]) => (
                        subjectsList.length > 0 && (
                          <optgroup key={category} label={category}>
                            {subjectsList.map(subj => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </optgroup>
                        )
                      ))}
                    </select>
                  </div>
                  <div className="mark-col">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="0-100" 
                      value={subject.mark}
                      onChange={(e) => handleSubjectChange(index, 'mark', e.target.value)}
                      className="mark-input"
                    />
                  </div>
                  <div className="aps-col">
                    <span className="aps-points">
                      {calculateIndividualAPS(subject.mark)} pts
                    </span>
                  </div>
                  <div className="action-col">
                    {subjects.length > 1 && (
                      <button 
                        className="remove-subject-btn"
                        onClick={() => removeSubject(index)}
                        title="Remove subject"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="add-subject-btn" onClick={addSubject}>
              + Add another subject
            </button>

            {/* APS Display */}
            <div className="aps-display">
              <div className="aps-info">
                <div className="aps-label">Your Current APS:</div>
                <div className="aps-score">{userAPS > 0 ? userAPS : '--'}</div>
              </div>
            </div>

            {/* Loading Overlay for Find My Options */}
            {isCalculatingEligibility && (
              <div className="finding-courses-overlay">
                <div className="finding-courses-content">
                  <RadialPulseLoader 
                    size={120}
                    color="#007bff"
                    text="Finding Courses..."
                    showText={true}
                  />
                </div>
              </div>
            )}

            <button 
              className={`get-started-btn ${isCalculatingEligibility ? 'loading' : ''}`}
              onClick={findMatches}
              disabled={!backendData.isConnected || backendData.courses.length === 0 || isCalculatingEligibility}
            >
              {isCalculatingEligibility ? (
                <>
                  <FaSpinner className="spinner-icon" /> Finding Courses...
                </>
              ) : backendData.isConnected && backendData.courses.length > 0 
                ? "Find My Options" 
                : "Loading..."}
            </button>
          </div>

          {/* Eligible Faculties Section */}
          {showFaculties && eligibleFaculties.length > 0 && (
            <>
              <div className="divider-line"></div>
              
              <div ref={facultiesSectionRef}>
                <h2 className="career-matches-heading">Your Eligible Faculties</h2>
                <p className="career-matches-subtitle">
                  {eligibleFaculties.length} faculty(s) found • {eligibleCourses.length} eligible courses
                </p>
              </div>

              {/* Faculty Navigation Info with Search */}
              {eligibleFaculties.length > 0 && (
                <div className="faculty-navigation-info">
                  <p>
                    Showing {Math.min(facultiesPerView, visibleFaculties.length)} of {eligibleFaculties.length} faculties
                  </p>
                  
                  {/* Search Bar for Courses */}
                  <div className="faculty-search-container">
                    <div className="faculty-search-input-group">
                      <input
                        type="text"
                        placeholder="Search for a specific course..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="faculty-search-input"
                      />
                      <button 
                        className="faculty-search-btn"
                        onClick={handleSearch}
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Cards Grid - SMOOTH SLIDING */}
              <div className="faculties-section">
                {eligibleFaculties.length > facultiesPerView && (
                  <button 
                    className={`faculty-nav-btn prev-btn ${isSliding ? 'disabled' : ''}`}
                    onClick={prevFaculties}
                    disabled={currentFacultyIndex === 0 || isSliding}
                  >
                    <FaChevronLeft />
                  </button>
                )}

                <div className="faculties-slider-container">
                  <div 
                    className={`faculties-grid ${isSliding ? `sliding-${slideDirection}` : ''}`}
                  >
                    {visibleFaculties.map((faculty) => (
                      <div 
                        key={faculty.id} 
                        className={`faculty-card ${selectedFaculties.includes(faculty.id) ? 'selected' : ''}`}
                        onClick={() => toggleFacultySelection(faculty.id)}
                      >
                        <div className="faculty-card-header">
                          <h3 className="faculty-name">{faculty.name}</h3>
                          {selectedFaculties.includes(faculty.id) && (
                            <div className="selected-badge">✓</div>
                          )}
                        </div>
                        <div className="faculty-category">{faculty.category}</div>
                        
                      </div>
                    ))}
                  </div>
                </div>

                {eligibleFaculties.length > facultiesPerView && (
                  <button 
                    className={`faculty-nav-btn next-btn ${isSliding ? 'disabled' : ''}`}
                    onClick={nextFaculties}
                    disabled={currentFacultyIndex >= eligibleFaculties.length - facultiesPerView || isSliding}
                  >
                    <FaChevronRight />
                  </button>
                )}
              </div>

              {/* Courses Selection Modal */}
              {showCoursesForFaculty && (
                <div className="courses-modal">
                  <div className="courses-modal-content">
                    <div className="courses-modal-header">
                      <h3>Select Courses from {showCoursesForFaculty.name}</h3>
                      <button 
                        className="close-courses-modal"
                        onClick={handleCloseCoursesModal}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="courses-modal-info">
                      <p>You can select up to 6 courses total</p>
                    </div>
                    
                    {/* Filter Buttons */}
                    <div className="course-filters">
                      <button 
                        className={`filter-btn ${courseTypeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCourseTypeFilter('all')}
                      >
                        All
                      </button>
                      <button 
                        className={`filter-btn ${courseTypeFilter === 'degree' ? 'active' : ''}`}
                        onClick={() => setCourseTypeFilter('degree')}
                      >
                        Degree
                      </button>
                      <button 
                        className={`filter-btn ${courseTypeFilter === 'diploma' ? 'active' : ''}`}
                        onClick={() => setCourseTypeFilter('diploma')}
                      >
                        Diploma
                      </button>
                      <button 
                        className={`filter-btn ${courseTypeFilter === 'certificate' ? 'active' : ''}`}
                        onClick={() => setCourseTypeFilter('certificate')}
                      >
                        H. Certificate
                      </button>
                      <button 
                        className={`filter-btn ${courseTypeFilter === 'online' ? 'active' : ''}`}
                        onClick={() => setCourseTypeFilter('online')}
                      >
                        Online
                      </button>
                    </div>

                    <div className="courses-list">
                      {getFilteredCoursesForSelectedFaculty()
                        .map((course, index) => {
                          const isTopCourse = index < 5 && course.matchScore;
                          
                          return (
                            <div 
                              key={`${course.id}-${index}`}
                              className={`course-item ${isCourseSelected(course) ? 'selected' : ''} ${isTopCourse ? 'top-course' : ''}`}
                            >
                              <div className="course-content">
                                <button 
                                  className="course-info-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchCourseDetails(course);
                                  }}
                                  title="View course details"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#666',
                                    transition: 'color 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                >
                                  <FaBook className="course-icon" />
                                </button>
                                <div className="course-details" onClick={() => toggleCourseSelection(course)} style={{ cursor: 'pointer', flex: 1 }}>
                                  <span className="course-name">{course.name}</span>
                                  {course.minAPS && (
                                    <small className="course-summary" style={{ display: 'block', fontSize: '12px', color: '#999' }}>
                                      Min APS: {course.minAPS}
                                    </small>
                                  )}
                                  {course.recommended_subjects && course.recommended_subjects.length > 0 && (
                                    <small style={{ display: 'block', fontSize: '11px', color: '#28a745', marginTop: '2px' }}>
                                      Recommended: {course.recommended_subjects.map(r => `${r.subject_name} (${r.minimum_mark}%)`).join(', ')}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="course-check" onClick={() => toggleCourseSelection(course)} style={{ cursor: 'pointer' }}>
                                {isCourseSelected(course) ? '✓' : '+'}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="courses-modal-footer">
                      <div className="selected-count">
                        Selected: {selectedCourses.length}/6
                      </div>
                      <button 
                        className="close-modal-btn"
                        onClick={handleCloseCoursesModal}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Courses Summary */}
              {selectedCourses.length > 0 && (
                <div className="selected-courses" ref={selectedCoursesSectionRef}>
                  <h3>Your Selected Courses ({selectedCourses.length}/6)</h3>
                  <div className="selected-courses-list">
                    {selectedCourses.map((course, index) => {
                      const faculty = getFacultyByName(course.faculty_name);
                      return (
                        <div key={index} className="selected-course-item">
                          <div className="selected-course-content">
                            <FaBook className="course-icon-small" />
                            <div className="course-details">
                              <span className="course-name-small">{course.name}</span>
                              {faculty && (
                                <span className="course-faculty">{faculty.name}</span>
                              )}
                              {course.recommended_subjects && course.recommended_subjects.length > 0 && (
                                <small style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px', display: 'block' }}>
                                  Recommended: {course.recommended_subjects.map(r => r.subject_name).join(', ')}
                                </small>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCourseSelection(course);
                            }}
                            className="remove-course-btn"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Apply Now Button */}
              <div className="apply-section" ref={applySectionRef}>
                <button 
                  className="apply-now-btn"
                  onClick={handleApply}
                  disabled={selectedCourses.length === 0}
                >
                  <span>Proceed</span>
                  <FaArrowRight className="apply-icon" />
                </button>
                <p className="apply-note">
                  You've selected {selectedCourses.length} course(s). Next, we'll show you all institutions offering these courses.
                </p>
              </div>
            </>
          )}

                    {/* No Faculties Found */}
          {showFaculties && eligibleFaculties.length === 0 && subjects.some(s => s.mark && !isNaN(s.mark)) && (
            <div className="no-faculties">
              <h3>No Eligible Faculties Found</h3>
              <p>Based on your current marks, you don't meet the minimum requirements for any faculties.</p>
              <div className="suggestions">
                <p><strong>Suggestions:</strong></p>
                <ul>
                  <li>Improve your marks in key subjects</li>
                  <li>Add more relevant subjects</li>
                  <li>Consider alternative pathways like bridging courses</li>
                </ul>
              </div>
            </div>
          )}

          {/* Contact Support - ALWAYS SHOWN */}
          <div className="contact-support">
            <p className="contact-message">
              Need help? Contact our support team at{' '}
              <a href="mailto:skolifyteam@gmail.com" className="support-link">
                skolifyteam@gmail.com
              </a>
            </p>
          </div>

          {/* Footer - ALWAYS SHOWN */}
          <footer className="dashboard-footer">
            <div className="footer-links">
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
              <span className="footer-separator">|</span>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
            </div>
            <p className="copyright">© {new Date().getFullYear()} Skolify. All rights reserved.</p>
          </footer>

        </div> {/* Close app-container */}
      </main> {/* Close app-main */}
    </div> /* Close dashboard-app */
  );
};

export default Dashboard;