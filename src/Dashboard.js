import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUserCircle, FaChevronRight, FaChevronLeft, FaBook, FaTimes, FaSpinner, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';
import RadialPulseLoader from './RadialPulseLoader';
import API_URL from './config';

// ==================== AUTH-ONLY HEADER ====================
function AuthHeader() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const goToProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!token) return null;

  return (
    <header className="auth-only-header">
      <div className="auth-header-inner">
        <div className="auth-header-logo" onClick={() => navigate('/dashboard')}>
          <img
            src="/Skolify-Logo.jpeg"
            alt="Skolify"
            className="auth-header-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="auth-header-logo-text">Skolify</span>
        </div>

        <div ref={dropdownRef} className="auth-header-profile">
          <FaUserCircle 
            size={28}
            className="auth-header-icon"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="auth-header-dropdown">
              <button onClick={goToProfile} className="auth-dropdown-item">
                <FaUserCircle size={16} />
                <span>Profile</span>
              </button>
              <button onClick={handleLogout} className="auth-dropdown-item auth-dropdown-logout">
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ==================== AUTH POPUP ====================
function AuthPopup({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError('Network error. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success && data.newUser) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.user);
        onClose();
      } else if (data.existingUser) {
        setError('An account with this email already exists. Please sign in.');
        setIsLogin(true);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    if (isLogin) {
      handleSignIn(e);
    } else {
      handleSignUp(e);
    }
  };

  return (
    <div className="auth-popup-overlay" onClick={onClose}>
      <div className="auth-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-popup-close" onClick={onClose}>×</button>
        
        <div className="auth-popup-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue your application' : 'Create an account to continue'}</p>
        </div>

        {error && <div className="auth-popup-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-popup-group">
            <FaEnvelope className="auth-popup-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-popup-group">
            <FaLock className="auth-popup-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="auth-popup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {!isLogin && (
            <div className="auth-popup-group">
              <FaLock className="auth-popup-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-popup-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}

          <button type="submit" className="auth-popup-submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-popup-footer">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', confirmPassword: '' });
            }}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to clean faculty name (remove "Faculty of " prefix)
const cleanFacultyName = (name) => {
  return name.replace(/^Faculty of\s+/i, '');
};

// ==================== COURSE SELECTION MODAL ====================
function CourseSelectionModal({ faculty, onClose, selectedCourses, onToggleCourse, getSelectedCountForFaculty }) {
  if (!faculty) return null;

  const selectedCount = getSelectedCountForFaculty(faculty.name);
  const maxForFaculty = Math.min(3, faculty.courses.length);
  const isMaxReached = selectedCount >= 3;
  
  // Sort courses: recommended first
  const sortedCourses = [...faculty.courses].sort((a, b) => {
    const aIsRecommended = (a.matchScore && a.matchScore >= 80) || (a.recommended_subjects && a.recommended_subjects.length > 0);
    const bIsRecommended = (b.matchScore && b.matchScore >= 80) || (b.recommended_subjects && b.recommended_subjects.length > 0);
    
    if (aIsRecommended && !bIsRecommended) return -1;
    if (!aIsRecommended && bIsRecommended) return 1;
    return 0;
  });

  // Get recommended courses count for green dash
  const recommendedCourses = sortedCourses.filter(c => (c.matchScore && c.matchScore >= 80) || (c.recommended_subjects && c.recommended_subjects.length > 0));

  return (
    <div className="courses-modal-overlay" onClick={onClose}>
      <div className="courses-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="courses-modal-header">
          <h3 className="courses-modal-title">{cleanFacultyName(faculty.name)}</h3>
          <button className="courses-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="courses-modal-list">
          {sortedCourses.map((course, idx) => {
            const isSelected = selectedCourses.some(c => c.id === course.id);
            const isDisabled = !isSelected && isMaxReached;
            const isRecommended = (course.matchScore && course.matchScore >= 80) || (course.recommended_subjects && course.recommended_subjects.length > 0);
            const isTopRecommended = isRecommended && idx < 5;
            
            return (
              <div 
                key={course.id}
                className={`course-modal-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isTopRecommended ? 'recommended' : ''}`}
                onClick={() => !isDisabled && onToggleCourse(course, faculty.name)}
              >
                <div className="course-modal-content">
                  <div className="course-modal-name">{course.name}</div>
                  {course.minAPS && (
                    <div className="course-modal-aps">Min APS: {course.minAPS}</div>
                  )}
                </div>
                <div className="course-modal-check">
                  {isSelected ? '✓' : '+'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="courses-modal-footer">
          <div className="courses-modal-counter">
            {selectedCount}/{maxForFaculty} selected
          </div>
          <button className="courses-modal-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
const Dashboard = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const [backendData, setBackendData] = useState({
    isConnected: false,
    courses: [],
    isLoading: true,
    error: null
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_subjects');
    return saved ? JSON.parse(saved) : [
      { subject: '', mark: '' },
      { subject: '', mark: '' },
      { subject: '', mark: '' },
      { subject: 'Life Orientation', mark: '' }
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

  const [activeFacultyModal, setActiveFacultyModal] = useState(null);
  const [isCalculatingEligibility, setIsCalculatingEligibility] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const [facultyPage, setFacultyPage] = useState(0);
  const facultiesPerPage = 6;

  const hiddenInstitutions = [
    'Nelson Mandela University',
    'Sol Plaatje University'
  ];

  const filterHiddenInstitutions = (courses) => {
    return courses.filter(course => 
      !hiddenInstitutions.some(institution => 
        course.institution_name?.toLowerCase().includes(institution.toLowerCase())
      )
    );
  };

  const subjectCategories = {
    mathematics: ['Mathematics', 'Technical Mathematics', 'Mathematical Literacy'],
    sciences: ['Physical Sciences', 'Technical Sciences', 'Life Sciences', 'Agricultural Sciences'],
    business: ['Accounting', 'Business Studies', 'Economics'],
    technology: ['Computer Applications Technology', 'Information Technology', 'Engineering Graphics and Design', 'Civil Technology', 'Electrical Technology', 'Mechanical Technology'],
    creative: ['Visual Arts', 'Design', 'Music', 'Dramatic Arts', 'Dance Studies'],
    humanities: ['Geography', 'History', 'Tourism', 'Religion Studies'],
    consumer: ['Consumer Studies', 'Hospitality Studies'],
    homeLanguages: ['English HL', 'Afrikaans HL', 'IsiZulu HL', 'IsiXhosa HL', 'Sepedi HL', 'Sesotho HL', 'Setswana HL', 'Tshivenda HL', 'Xitsonga HL', 'SiSwati HL', 'Ndebele HL'],
    additionalLanguages: ['English', 'Afrikaans', 'IsiZulu', 'IsiXhosa', 'Sepedi', 'Sesotho', 'Setswana', 'Tshivenda', 'Xitsonga', 'SiSwati', 'Ndebele'],
    lifeOrientation: ['Life Orientation']
  };

  const groupedSubjects = {
    'Mathematics': subjectCategories.mathematics,
    'Science': subjectCategories.sciences,
    'Business/Commerce': subjectCategories.business,
    'Technology': subjectCategories.technology,
    'Creative Arts': subjectCategories.creative,
    'Humanities': subjectCategories.humanities,
    'Consumer Studies': subjectCategories.consumer,
    'Home Language': subjectCategories.homeLanguages,
    'Additional Language': subjectCategories.additionalLanguages,
    'Life Orientation': subjectCategories.lifeOrientation
  };

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

  const calculateIndividualAPS = (mark) => {
    if (!mark || mark === '' || isNaN(mark)) return '0';
    return calculateAPS(parseInt(mark));
  };

  const saveState = useCallback((key, value) => {
    sessionStorage.setItem(`dashboard_${key}`, JSON.stringify(value));
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [step]);

  // Scroll to top when faculty page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [facultyPage]);

  useEffect(() => {
    let totalAPS = 0;
    subjects.forEach(subject => {
      if (subject.subject !== 'Life Orientation' && 
          subject.mark && !isNaN(subject.mark) && 
          subject.mark >= 0 && subject.mark <= 100) {
        totalAPS += calculateAPS(parseInt(subject.mark));
      }
    });
    setUserAPS(totalAPS);
    saveState('userAPS', totalAPS);
  }, [subjects, calculateAPS, saveState]);

  useEffect(() => {
    saveState('subjects', subjects);
  }, [subjects, saveState]);

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
    const fetchBackendData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const testResponse = await fetch(`${API_URL}/api/test`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!testResponse.ok) {
          throw new Error(`Backend responded with status: ${testResponse.status}`);
        }
        
        const coursesResponse = await fetch(`${API_URL}/api/courses`);
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const filteredCourses = filterHiddenInstitutions(coursesData);
          
          setBackendData(prev => ({
            ...prev,
            isConnected: true,
            courses: filteredCourses,
            isLoading: false,
            error: null
          }));
        } else {
          setBackendData(prev => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            error: 'Could not load courses'
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

  const calculateEligibleCourses = async () => {
    setIsCalculatingEligibility(true);
    
    try {
      const subjectsData = subjects
        .filter(subject => subject.subject !== 'Life Orientation')
        .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
        .map(subject => ({
          subject_name: subject.subject,
          mark: parseInt(subject.mark)
        }));

      if (subjectsData.length === 0) {
        throw new Error('Please enter at least one subject mark');
      }

      if (!backendData.isConnected) {
        throw new Error('Backend server is not connected');
      }

      const response = await fetch(`${API_URL}/api/eligible-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjectsData })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const eligibleCoursesData = filterHiddenInstitutions(result.eligible_courses || []);
        
        const coursesWithScores = eligibleCoursesData.map(course => ({
          ...course,
          matchScore: course.matchScore || Math.floor(Math.random() * 40) + 60
        }));
        
        setEligibleCourses(coursesWithScores);
        saveState('eligibleCourses', coursesWithScores);

        const facultiesMap = {};
        coursesWithScores.forEach(course => {
          const facultyName = course.faculty_name || 'General';
          if (!facultiesMap[facultyName]) {
            facultiesMap[facultyName] = {
              id: course.faculty_id || facultyName.toLowerCase().replace(/\s+/g, '-'),
              name: facultyName,
              category: course.faculty_category || 'General',
              courses: []
            };
          }
          if (!facultiesMap[facultyName].courses.find(c => c.id === course.id)) {
            facultiesMap[facultyName].courses.push(course);
          }
        });

        let eligibleFacultiesData = Object.values(facultiesMap);
        
        eligibleFacultiesData.sort((a, b) => {
          const indexA = facultyPriority.indexOf(a.name);
          const indexB = facultyPriority.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setEligibleFaculties(eligibleFacultiesData);
        saveState('eligibleFaculties', eligibleFacultiesData);
        
        return eligibleFacultiesData;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error calculating eligibility:', error);
      alert(`Error: ${error.message}`);
      return [];
    } finally {
      setIsCalculatingEligibility(false);
    }
  };

  const findMatches = async () => {
    const hasMarks = subjects
      .filter(s => s.subject !== 'Life Orientation')
      .some(s => s.mark && s.mark !== '' && !isNaN(s.mark));
    
    if (!hasMarks) {
      alert('Please enter at least one mark to find matches');
      return;
    }
    
    if (!backendData.isConnected) {
      alert('Backend not connected. Please check if server is running.');
      return;
    }
    
    const eligibleFacultiesData = await calculateEligibleCourses();
    
    if (eligibleFacultiesData && eligibleFacultiesData.length > 0) {
      setStep(2);
      setFacultyPage(0);
      setSelectedFaculties([]);
    } else {
      alert('No faculties found that match your subjects. Try improving your marks or adding more subjects.');
    }
  };

  const getSelectedFacultyObjects = () => {
    return eligibleFaculties.filter(f => selectedFaculties.includes(f.id));
  };

  const getSelectedCountForFaculty = (facultyName) => {
    return selectedCourses.filter(c => c.faculty_name === facultyName).length;
  };

  const isFacultySelectionComplete = (faculty) => {
    const selectedCount = getSelectedCountForFaculty(faculty.name);
    const availableCourses = faculty.courses.length;
    
    return selectedCount === 3 || (selectedCount > 0 && selectedCount === availableCourses);
  };

  const canProceedToPayment = () => {
    const selectedFacultiesObjects = getSelectedFacultyObjects();
    for (const faculty of selectedFacultiesObjects) {
      const selectedCount = getSelectedCountForFaculty(faculty.name);
      const availableCourses = faculty.courses.length;
      
      if (availableCourses < 3 && selectedCount !== availableCourses) {
        return false;
      }
      if (availableCourses >= 3 && selectedCount !== 3) {
        return false;
      }
    }
    return selectedCourses.length > 0;
  };

  const toggleFacultySelection = (facultyId) => {
    setSelectedFaculties(prev => {
      if (prev.includes(facultyId)) {
        const faculty = eligibleFaculties.find(f => f.id === facultyId);
        if (faculty) {
          setSelectedCourses(prevCourses => 
            prevCourses.filter(c => c.faculty_name !== faculty.name)
          );
        }
        return prev.filter(id => id !== facultyId);
      } else {
        if (prev.length < 3) {
          return [...prev, facultyId];
        } else {
          alert('You can only select up to 3 faculties');
          return prev;
        }
      }
    });
  };

  const toggleCourseSelection = (course, facultyName) => {
    const currentFacultyCount = getSelectedCountForFaculty(facultyName);
    const isSelected = selectedCourses.some(c => c.id === course.id);
    
    if (isSelected) {
      setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
    } else {
      if (currentFacultyCount >= 3) {
        alert(`You can only select up to 3 courses from ${cleanFacultyName(facultyName)}`);
        return;
      }
      
      if (selectedCourses.length >= 9) {
        alert('You can only select up to 9 courses total (3 per faculty)');
        return;
      }
      
      setSelectedCourses(prev => [...prev, course]);
    }
  };

  const proceedToPayment = () => {
    setIsNavigating(true);
    
    const studentMarks = subjects
      .filter(subject => subject.subject !== 'Life Orientation')
      .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
      .map(subject => ({
        subject_name: subject.subject,
        mark: parseInt(subject.mark)
      }));
    
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

  const handleAuthSuccess = () => {
    proceedToPayment();
  };

  const handleApply = () => {
    if (!canProceedToPayment()) {
      alert('Please select 3 courses from each of your chosen faculties');
      return;
    }

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setShowAuthPopup(true);
    } else {
      proceedToPayment();
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', mark: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const totalFacultyPages = Math.ceil(eligibleFaculties.length / facultiesPerPage);
  const visibleFaculties = eligibleFaculties.slice(
    facultyPage * facultiesPerPage,
    (facultyPage + 1) * facultiesPerPage
  );

  const nextFacultyPage = () => {
    if (facultyPage < totalFacultyPages - 1) {
      setFacultyPage(prev => prev + 1);
    }
  };

  const prevFacultyPage = () => {
    if (facultyPage > 0) {
      setFacultyPage(prev => prev - 1);
    }
  };

  const getProgressPercent = () => {
    if (step === 1) return 25;
    if (step === 2) return 50;
    if (step === 3) {
      const selectedFacultiesObjects = getSelectedFacultyObjects();
      if (selectedFacultiesObjects.length === 0) return 50;
      
      let completedCount = 0;
      for (const faculty of selectedFacultiesObjects) {
        if (isFacultySelectionComplete(faculty)) {
          completedCount++;
        }
      }
      
      const progressPerFaculty = 25 / selectedFacultiesObjects.length;
      return 50 + (completedCount * progressPerFaculty);
    }
    return 100;
  };

  const progressPercent = getProgressPercent();

  return (
    <div className={`dashboard-app ${isNavigating ? 'page-exit' : ''}`}>
      <AuthHeader />

      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
        onSuccess={handleAuthSuccess}
      />

      {isNavigating && (
        <div className="navigation-overlay">
          <div className="navigation-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      <div className="background-pattern"></div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <main className="app-main dashboard-main">
        <div className="app-container">

          {step === 1 && (
            <div className="wizard-step step-marks">
              <div className="marks-header-row">
                <h1 className="step-heading-large">ENTER MARKS</h1>
                <div className="aps-spiky-circle">
                  <span className="aps-spiky-number">{userAPS}</span>
                </div>
              </div>

              <p className="step-subtitle-large">
                This will be used to calculate your APS and recommend the best courses for YOU
              </p>

              <div className="marks-list">
                {subjects.map((subject, index) => (
                  <div key={index} className="mark-card">
                    <div className="mark-card-inner">
                      <div className="mark-subject-col">
                        <select 
                          value={subject.subject} 
                          onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                          className="subject-select-clean"
                        >
                          <option value="">Select subject</option>
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

                      <div className="mark-input-col">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="%"
                          value={subject.mark}
                          onChange={(e) => handleSubjectChange(index, 'mark', e.target.value)}
                          className="mark-input-clean"
                        />
                      </div>

                      <div className="mark-aps-col">
                        {subject.subject !== 'Life Orientation' && subject.mark && !isNaN(subject.mark) && subject.mark !== '' ? (
                          <span className="mark-aps-badge">{calculateIndividualAPS(subject.mark)}</span>
                        ) : subject.subject === 'Life Orientation' ? (
                          <span className="mark-lo-tag">LO</span>
                        ) : (
                          <span className="mark-aps-empty">—</span>
                        )}
                      </div>

                      {subjects.length > 1 && subject.subject !== 'Life Orientation' && (
                        <button 
                          className="remove-mark-btn"
                          onClick={() => removeSubject(index)}
                          title="Remove subject"
                        >
                          <FaTrash />
                        </button>
                      )}
                      {subjects.length > 1 && subject.subject === 'Life Orientation' && (
                        <div className="remove-mark-spacer"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="add-mark-btn" onClick={addSubject}>
                + Add another subject
              </button>

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
                className="primary-btn-full"
                onClick={findMatches}
                disabled={!backendData.isConnected || backendData.courses.length === 0 || isCalculatingEligibility}
              >
                {isCalculatingEligibility ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Finding Courses...
                  </>
                ) : backendData.isConnected && backendData.courses.length > 0 
                  ? "Continue" 
                  : "Loading..."}
              </button>
            </div>
          )}

          {step === 2 && eligibleFaculties.length > 0 && (
            <div className="wizard-step step-faculties">
              <h1 className="step-heading-large">CHOOSE 3 FACULTIES</h1>
              <p className="step-subtitle-large">
                Select up to 3 faculties to see available courses
              </p>

              <div className="faculty-grid-2col">
                {visibleFaculties.map((faculty) => (
                  <div 
                    key={faculty.id} 
                    className={`faculty-card-square ${selectedFaculties.includes(faculty.id) ? 'selected' : ''}`}
                    onClick={() => toggleFacultySelection(faculty.id)}
                  >
                    <span className="faculty-card-name">{cleanFacultyName(faculty.name)}</span>
                    {selectedFaculties.includes(faculty.id) && (
                      <span className="faculty-card-check">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {totalFacultyPages > 1 && (
                <div className="faculty-pagination">
                  <button className="page-arrow" onClick={prevFacultyPage} disabled={facultyPage === 0}>
                    <FaChevronLeft />
                  </button>
                  <div className="page-dots">
                    {Array.from({ length: totalFacultyPages }).map((_, i) => (
                      <span key={i} className={`dot ${i === facultyPage ? 'active' : ''}`} />
                    ))}
                  </div>
                  <button className="page-arrow" onClick={nextFacultyPage} disabled={facultyPage === totalFacultyPages - 1}>
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <button 
                className="primary-btn-full"
                onClick={() => {
                  if (selectedFaculties.length === 0) {
                    alert('Please select at least one faculty');
                    return;
                  }
                  setStep(3);
                }}
                disabled={selectedFaculties.length === 0}
              >
                Continue to Select Courses
              </button>

              <button className="text-btn" onClick={() => setStep(1)}>
                ← Back to marks
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step step-choose-courses">
              <h1 className="step-heading-large">Choose 9 courses</h1>
              <p className="step-subtitle-large">
                This will be used to calibrate your courses
              </p>

              <div className="faculty-courses-list">
                {getSelectedFacultyObjects().map((faculty) => {
                  const selectedCount = getSelectedCountForFaculty(faculty.name);
                  const maxForFaculty = Math.min(3, faculty.courses.length);
                  const isComplete = isFacultySelectionComplete(faculty);
                  
                  return (
                    <div 
                      key={faculty.id} 
                      className={`faculty-selection-card ${isComplete ? 'complete' : ''}`}
                      onClick={() => setActiveFacultyModal(faculty)}
                    >
                      <div className="faculty-selection-info">
                        <span className="faculty-selection-name">{cleanFacultyName(faculty.name)}</span>
                      </div>
                      <div className="faculty-selection-right">
                        <span className="faculty-selection-count">{selectedCount}/{maxForFaculty}</span>
                        <FaChevronRight className="faculty-selection-arrow" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className="primary-btn-full"
                onClick={handleApply}
                disabled={!canProceedToPayment()}
              >
                Continue
              </button>

              <button className="text-btn" onClick={() => setStep(2)}>
                ← Back to faculties
              </button>
            </div>
          )}

          <CourseSelectionModal 
            faculty={activeFacultyModal}
            onClose={() => setActiveFacultyModal(null)}
            selectedCourses={selectedCourses}
            onToggleCourse={toggleCourseSelection}
            getSelectedCountForFaculty={getSelectedCountForFaculty}
          />

          {step === 2 && eligibleFaculties.length === 0 && subjects.some(s => s.mark && !isNaN(s.mark)) && (
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
              <button className="text-btn" onClick={() => setStep(1)}>← Back to marks</button>
            </div>
          )}

          {selectedCourseDetails && (
            <div className="courses-modal-overlay" onClick={() => setSelectedCourseDetails(null)}>
              <div className="courses-modal-container details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="courses-modal-header">
                  <h3 className="courses-modal-title">{selectedCourseDetails.name}</h3>
                  <button className="courses-modal-close" onClick={() => setSelectedCourseDetails(null)}>×</button>
                </div>
                
                <div className="course-details-info">
                  <p><strong>Institution:</strong> {selectedCourseDetails.institution_name || 'N/A'}</p>
                  <p><strong>Faculty:</strong> {cleanFacultyName(selectedCourseDetails.faculty_name || 'N/A')}</p>
                  <p><strong>Duration:</strong> {selectedCourseDetails.duration_years} years</p>
                  {selectedCourseDetails.minAPS && (
                    <p><strong>Minimum APS:</strong> {selectedCourseDetails.minAPS}</p>
                  )}
                </div>
                
                <div className="course-details-description">
                  <h4>Description</h4>
                  <p>{selectedCourseDetails.description || 'No description available.'}</p>
                </div>
                
                {selectedCourseDetails.additional_info && selectedCourseDetails.additional_info.length > 0 && (
                  <div className="course-details-additional">
                    <h4>Additional Information</h4>
                    <ul>
                      {selectedCourseDetails.additional_info.map((info, idx) => (
                        <li key={idx}>{info.info_text}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="courses-modal-footer">
                  <button className="courses-modal-done" onClick={() => setSelectedCourseDetails(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer className="dashboard-footer">
            <div className="footer-links">
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
              <span className="footer-separator">|</span>
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
            </div>
            <p className="copyright">© {new Date().getFullYear()} Skolify. All rights reserved.</p>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;