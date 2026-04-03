import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';
import Money from './Money';
import { FaUniversity, FaSpinner, FaBook, FaTimes, FaExchangeAlt, FaArrowLeft, FaCheck, FaUser, FaLock, FaHistory, FaMagic, FaLightbulb, FaSearch, FaCopy, FaUserCircle } from 'react-icons/fa';
import API_URL from './config';

console.log('✅ PaymentPage.js loaded -', new Date().toISOString());

const PaymentPage = () => {
  console.log('🟢 PaymentPage component initializing');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const universityLogos = useMemo(() => ({
  'University of Johannesburg': { code: 'UJ', logo: '/UJ.jpeg' },
  'Stellenbosch University': { code: 'SU', logo: '/SU.jpeg' },
  'University of Pretoria': { code: 'UP', logo: '/UP.jpeg' },
  'University of South Africa': { code: 'UNISA', logo: '/UNISA.jpeg' },
  'University of Western Cape': { code: 'UWC', logo: '/UWC.jpeg' },  // Fix: UWC not UOTWC
  'University of Witwatersrand': { code: 'WITS', logo: '/WITS.jpeg' },
  'North-West University': { code: 'NWU', logo: '/NWU.jpeg' },
  'Nelson Mandela University': { code: 'NMU', logo: '/NMU.jpeg' },
  'University of KwaZulu-Natal': { code: 'UKZN', logo: '/KZN.jpeg' },
  'Rhodes University': { code: 'RHODES', logo: '/RHODES.jpeg' },
  'University of Cape Town': { code: 'UCT', logo: '/UCT.jpeg' },
  'University of Free State': { code: 'UFS', logo: '/UFS.jpeg' },  // Fix: UFS not UOTFS
  'University of Limpopo': { code: 'UL', logo: '/UL.jpeg' },
  'Tshwane University of Technology': { code: 'TUT', logo: '/TUT.jpeg' },
  }), []);

  // Universities with NO application fee
  const groupAInstitutions = useMemo(() => [
    'University of Johannesburg',  // UJ
    'Tshwane University of Technology', // TUT
    'North-West University', // NWU
    'Nelson Mandela University', // NMU
    'Walter Sisulu University', // WSU
    'Sol Plaatje University', // SPU
    'University of Free State', // UFS
    'University of Western Cape' // UWC
  ], []);

  // Universities with application fee required
  const groupBInstitutions = useMemo(() => [
    'University of Cape Town', // UCT
    'University of Witwatersrand', // WITS
    'University of South Africa', // UNISA
    'University of Limpopo', // UL
    'University of Pretoria', // UP
    'Stellenbosch University', // SU
    'University of KwaZulu-Natal', // UKZN
    'Rhodes University', // RHODES
    'University of Fort Hare', // UFH
    'University of Venda', // UNIVEN
    'University of Zululand', // UNIZULU
    'Durban University of Technology', // DUT
    'Cape Peninsula University of Technology', // CPUT
    'Central University of Technology', // CUT
    'Mangosuthu University of Technology', // MUT
    'Sefako Makgatho Health Sciences University' // SMU
  ], []);

  const institutionCourseLimits = useMemo(() => ({
    'University of Johannesburg': 2,
    'Stellenbosch University': 3,
    'University of Pretoria': 2,
    'University of South Africa': 3,
    'University of Western Cape': 2,
    'University of Witwatersrand': 3,
    'North-West University': 2,
    'Nelson Mandela University': 2,
    'University of KwaZulu-Natal': 6,
    'Rhodes University': 3,
    'University of Cape Town': 2,
    'University of Free State': 2,
    'University of Limpopo': 2,
    'Tshwane University of Technology': 3,
    'Durban University of Technology': 4,
    'Cape Peninsula University of Technology': 4,
    'University of Zululand': 4,
    'Walter Sisulu University': 3,
    'Sol Plaatje University': 3,
    'Central University of Technology': 4,
    'Mangosuthu University of Technology': 4,
    'Sefako Makgatho Health Sciences University': 3,
    'University of Fort Hare': 3,
    'University of Venda': 3
  }), []);

  const [universities, setUniversities] = useState([]);
  const [groupAUniversities, setGroupAUniversities] = useState([]);
  const [groupBUniversities, setGroupBUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [selectedCourseNames, setSelectedCourseNames] = useState([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState([]);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('premium');
  const [showSwitchToCustomPopup, setShowSwitchToCustomPopup] = useState(false);
  const [exceededItem, setExceededItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [currentUnavailableCourse, setCurrentUnavailableCourse] = useState('');
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [availableAlternatives, setAvailableAlternatives] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previousSelections, setPreviousSelections] = useState([]);
  const [isCreatingNewOrder, setIsCreatingNewOrder] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);
  
  // State for notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  
  // State for Maximise Options feature
  const [showMaximiseModal, setShowMaximiseModal] = useState(false);
  const [maximiseSuggestions, setMaximiseSuggestions] = useState([]);
  const [isCalculatingMaximise, setIsCalculatingMaximise] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  
  // State for expanded university view
  const [expandedUniversity, setExpandedUniversity] = useState(null);
  const [universitySearchQuery, setUniversitySearchQuery] = useState('');
  const [filteredUniversityCourses, setFilteredUniversityCourses] = useState([]);
  const [tempSelections, setTempSelections] = useState({});
  
  // Course type filter state
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  
  // State for credentials modal
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  
  // Profile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const profileIconRef = useRef(null);
  
  const [customOptions, setCustomOptions] = useState({
    universityApps: 0
  });

  const packageLimits = useMemo(() => ({
    basic: { universities: 2 },
    standard: { universities: 4 },
    premium: { universities: 6 },
    custom: { universities: Infinity }
  }), []);

  const packagePrices = {
    basic: 169,
    standard: 329,
    premium: 499
  };

  // Helper function to show notifications
  const showNotificationMessage = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setShowNotification(false);
    }, duration);
  }, []);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Get student marks from all possible sources
  const getStudentMarks = useCallback(() => {
    try {
      if (studentMarks.length > 0) {
        return studentMarks;
      }
      
      if (location.state?.studentMarks && location.state.studentMarks.length > 0) {
        setStudentMarks(location.state.studentMarks);
        return location.state.studentMarks;
      }
      
      const storedMarks = localStorage.getItem('student_marks');
      if (storedMarks) {
        const marks = JSON.parse(storedMarks);
        if (marks.length > 0) {
          setStudentMarks(marks);
          return marks;
        }
      }
      
      const savedSubjects = localStorage.getItem('dashboard_subjects');
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        const marks = subjects
          .filter(subject => subject.mark && subject.mark !== '' && !isNaN(subject.mark))
          .map(subject => ({
            subject_name: subject.subject,
            mark: parseInt(subject.mark)
          }));
        
        if (marks.length > 0) {
          setStudentMarks(marks);
          localStorage.setItem('student_marks', JSON.stringify(marks));
          return marks;
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting student marks:', error);
      return [];
    }
  }, [location.state, studentMarks]);

  const getInstitutionCourseLimit = useCallback((institutionName) => {
    if (institutionCourseLimits[institutionName]) {
      return institutionCourseLimits[institutionName];
    }
    
    for (const [key, limit] of Object.entries(institutionCourseLimits)) {
      if (institutionName?.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(institutionName?.toLowerCase())) {
        return limit;
      }
    }
    
    return 3;
  }, [institutionCourseLimits]);

  const calculateTotalApplications = useCallback(() => {
    return Object.values(selectedCourses).reduce((sum, courses) => sum + (courses?.length || 0), 0);
  }, [selectedCourses]);

  const getSelectedUniversities = useCallback(() => {
    return universities.filter(uni => selectedCourses[uni.code]?.length > 0);
  }, [universities, selectedCourses]);

  const getUsageStats = useCallback(() => {
    const universitiesCount = Object.keys(selectedCourses).length;
    const limits = packageLimits[selectedPackage];
    
    return {
      universities: { current: universitiesCount, limit: limits.universities },
      isWithinLimits: selectedPackage === 'custom' ? true : universitiesCount <= limits.universities
    };
  }, [selectedCourses, selectedPackage, packageLimits]);

  const getFilteredCoursesForUniversity = useCallback((university) => {
    if (!university || !university.courses) return [];
    
    const uniqueCourses = [];
    const seenCourseNames = new Set();
    
    university.courses.forEach(course => {
      if (!seenCourseNames.has(course.name)) {
        seenCourseNames.add(course.name);
        uniqueCourses.push(course);
      }
    });
    
    return uniqueCourses;
  }, []);

  const getCoursesForUniversity = useCallback((university) => {
    if (!university || !university.courses) {
      return { availableCourses: [], unavailableCourses: [] };
    }
    
    const availableCourses = university.courses.filter(course => 
      selectedCourseNames.includes(course.name)
    );
    
    const unavailableCourses = selectedCourseNames.filter(courseName => 
      !university.courses.some(course => course.name === courseName)
    );
    
    return { availableCourses, unavailableCourses };
  }, [selectedCourseNames]);

  const getOtherCoursesAtUniversity = useCallback((university) => {
    if (!university || !university.courses) return [];
    
    const otherCourses = university.courses.filter(course => 
      !selectedCourseNames.includes(course.name)
    );
    
    const uniqueCourses = [];
    const seen = new Set();
    
    otherCourses.forEach(course => {
      if (!seen.has(course.name)) {
        seen.add(course.name);
        uniqueCourses.push({
          ...course,
          minAPS: course.min_aps || course.minAPS,
          subject_requirements: course.subject_requirements || []
        });
      }
    });
    
    return uniqueCourses.slice(0, 15);
  }, [selectedCourseNames]);

  const completeAddSelection = useCallback((university, universityCode, tempSelectedCourses, isNewUniversity) => {
    const updatedSelections = {
      ...selectedCourses,
      [universityCode]: tempSelectedCourses
    };
    
    if (tempSelectedCourses.length === 0) {
      delete updatedSelections[universityCode];
    }
    
    const allSelectedCourses = Object.values(updatedSelections).flat();
    const uniqueCourseNames = [...new Set(allSelectedCourses)];
    
    setSelectedCourses(updatedSelections);
    setSelectedCourseNames(uniqueCourseNames);
    
    setUniversities(prev => {
      const exists = prev.some(u => u.id === university.id);
      if (!exists && tempSelectedCourses.length > 0) {
        return [...prev, { ...university, selected: true }];
      } else {
        return prev.map(u => 
          u.id === university.id ? { ...u, selected: tempSelectedCourses.length > 0 } : u
        );
      }
    });
    
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updatedSelections));
    localStorage.setItem('selectedCourseNames', JSON.stringify(uniqueCourseNames));
    
  }, [selectedCourses]);

  const completeAddSuggestion = useCallback((university, coursesToAdd, isNewUniversity) => {
    console.log(`➕ Adding ${university.code} with ${coursesToAdd.length} courses:`, coursesToAdd.map(c => c.name));
    
    const updatedSelections = { 
      ...selectedCourses, 
      [university.code]: coursesToAdd.map(c => c.name) 
    };
    
    const newCourseNames = [...selectedCourseNames];
    coursesToAdd.forEach(course => {
      if (!newCourseNames.includes(course.name)) {
        newCourseNames.push(course.name);
      }
    });
    
    setSelectedCourses(updatedSelections);
    setSelectedCourseNames(newCourseNames);
    
    setUniversities(prev => {
      const exists = prev.some(u => u.id === university.id);
      if (!exists) {
        return [...prev, { 
          ...university, 
          selected: true,
          courses: university.courses || [] 
        }];
      } else {
        return prev.map(u => 
          u.id === university.id ? { ...u, selected: true } : u
        );
      }
    });
    
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updatedSelections));
    localStorage.setItem('selectedCourseNames', JSON.stringify(newCourseNames));
    
  }, [selectedCourses, selectedCourseNames]);

  const calculateMaximiseOptions = useCallback(async () => {
    setIsCalculatingMaximise(true);
    setMaximiseSuggestions([]);
    
    try {
      const marks = getStudentMarks();
      
      const calculateAPS = (mark) => {
        if (!mark || mark === '') return 0;
        if (mark >= 80) return 7;
        if (mark >= 70) return 6;
        if (mark >= 60) return 5;
        if (mark >= 50) return 4;
        if (mark >= 40) return 3;
        if (mark >= 30) return 2;
        return 1;
      };
      const studentAPS = marks.reduce((sum, s) => sum + calculateAPS(s.mark), 0);
      
      if (marks.length === 0) {
        showNotificationMessage('No marks found. Please go back to Dashboard and enter your marks.', 'warning');
        setIsCalculatingMaximise(false);
        return;
      }

      let allUniversities = [];
      
      try {
        const response = await fetch(`${API_URL}/api/institutions-with-courses`);
        if (response.ok) {
          const institutions = await response.json();
          allUniversities = institutions.map(inst => {
            let logoInfo = universityLogos[inst.name];
            if (!logoInfo) {
              for (const [key, value] of Object.entries(universityLogos)) {
                if (inst.name?.toLowerCase().includes(key.toLowerCase()) || 
                    key.toLowerCase().includes(inst.name?.toLowerCase())) {
                  logoInfo = value;
                  break;
                }
              }
            }
            
            return {
              id: inst.id,
              name: inst.name,
              code: logoInfo?.code || inst.code || inst.name?.split(' ').map(word => word[0]).join('').toUpperCase(),
              logo: logoInfo?.logo || `/${inst.code || 'university'}.jpeg`,
              courses: inst.courses || []
            };
          });
        } else {
          throw new Error('Failed to fetch universities');
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        allUniversities = universities;
      }
      
      if (allUniversities.length === 0) {
        showNotificationMessage('No universities found in the system.', 'error');
        setIsCalculatingMaximise(false);
        return;
      }

      const selectedUniCodes = Object.keys(selectedCourses);
      const availableUniversities = allUniversities.filter(uni => 
        !selectedUniCodes.includes(uni.code)
      );
      
      if (availableUniversities.length === 0) {
        showNotificationMessage('You have already selected all available universities in the system.', 'info');
        setIsCalculatingMaximise(false);
        setShowMaximiseModal(false);
        return;
      }
      
      const suggestions = [];
      let checkedCount = 0;
      
      for (const uni of availableUniversities) {
        checkedCount++;
        
        try {
          const response = await fetch(`${API_URL}/api/eligible-courses-at-university`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              university_id: uni.id,
              subjects: marks,
              limit: 50
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success' && data.eligible_courses && data.eligible_courses.length > 0) {
              suggestions.push({
                university: uni,
                eligibleCourses: data.eligible_courses,
                courseCount: Math.min(data.eligible_courses.length, getInstitutionCourseLimit(uni.name)),
                maxCourses: getInstitutionCourseLimit(uni.name),
                basedOnMarks: true
              });
            }
          }
        } catch (error) {
          console.error(`Error checking ${uni.name}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      suggestions.sort((a, b) => b.courseCount - a.courseCount);
      
      if (suggestions.length === 0) {
        showNotificationMessage('No new universities found with courses you qualify for based on your marks. Try improving your marks or adding more subjects.', 'info');
        setIsCalculatingMaximise(false);
        setShowMaximiseModal(false);
        return;
      }
      
      setMaximiseSuggestions(suggestions);
      setShowMaximiseModal(true);
      
    } catch (error) {
      console.error('❌ Error calculating maximise options:', error);
      showNotificationMessage('Error finding options. Please try again.', 'error');
    } finally {
      setIsCalculatingMaximise(false);
    }
  }, [universities, selectedCourses, getStudentMarks, getInstitutionCourseLimit, universityLogos, showNotificationMessage]);

  const handleUniversityClickInMaximise = useCallback((suggestion) => {
    setExpandedUniversity(suggestion);
    setUniversitySearchQuery('');
    setFilteredUniversityCourses(suggestion.eligibleCourses);
    setCourseTypeFilter('all');
    setTempSelections({
      [suggestion.university.code]: selectedCourses[suggestion.university.code] || []
    });
  }, [selectedCourses]);

  const handleUniversitySearch = useCallback((query, courses) => {
    setUniversitySearchQuery(query);
    if (!query.trim()) {
      setFilteredUniversityCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUniversityCourses(filtered);
    }
  }, []);

  const handleBackFromExpanded = useCallback(() => {
    setExpandedUniversity(null);
    setUniversitySearchQuery('');
    setFilteredUniversityCourses([]);
    setTempSelections({});
    setCourseTypeFilter('all');
  }, []);

  const toggleTempCourse = useCallback((universityCode, course) => {
    setTempSelections(prev => {
      const current = prev[universityCode] || [];
      let newSelections;
      
      if (current.includes(course.name)) {
        newSelections = current.filter(c => c !== course.name);
      } else {
        const university = expandedUniversity?.university;
        if (university && current.length >= getInstitutionCourseLimit(university.name)) {
          showNotificationMessage(`Maximum ${getInstitutionCourseLimit(university.name)} courses at ${university.name}`, 'warning');
          return prev;
        }
        newSelections = [...current, course.name];
      }
      
      return {
        ...prev,
        [universityCode]: newSelections
      };
    });
  }, [expandedUniversity, getInstitutionCourseLimit, showNotificationMessage]);

  const saveTempSelections = useCallback(() => {
    if (!expandedUniversity) return;
    
    const university = expandedUniversity.university;
    const universityCode = university.code;
    const tempSelectedCourses = tempSelections[universityCode] || [];
    const isNewUniversity = !selectedCourses[universityCode];
    const newTotalUniversities = Object.keys(selectedCourses).length + (isNewUniversity ? 1 : 0);
    const limit = packageLimits[selectedPackage].universities;
    
    if (selectedPackage !== 'custom' && isNewUniversity && newTotalUniversities > limit) {
      setPendingSelection({
        university,
        tempSelectedCourses,
        isNewUniversity
      });
      setExceededItem({
        type: 'university',
        current: Object.keys(selectedCourses).length,
        limit: limit,
        package: selectedPackage,
        newTotal: newTotalUniversities
      });
      setShowSwitchToCustomPopup(true);
      setShowMaximiseModal(false);
      setExpandedUniversity(null);
      setTempSelections({});
      return;
    }
    
    completeAddSelection(university, universityCode, tempSelectedCourses, isNewUniversity);
    
    if (isNewUniversity && tempSelectedCourses.length > 0) {
      setMaximiseSuggestions(prev => 
        prev.filter(s => s.university.code !== universityCode)
      );
    }
    
    setExpandedUniversity(null);
    setTempSelections({});
    setCourseTypeFilter('all');
    
  }, [expandedUniversity, tempSelections, selectedCourses, selectedPackage, packageLimits, completeAddSelection]);

  const applyMaximiseSuggestion = useCallback((suggestion) => {
    const university = suggestion.university;
    const coursesToAdd = suggestion.eligibleCourses.slice(0, getInstitutionCourseLimit(university.name));
    const isNewUniversity = !selectedCourses[university.code];
    const newTotalUniversities = Object.keys(selectedCourses).length + (isNewUniversity ? 1 : 0);
    const limit = packageLimits[selectedPackage].universities;
    
    if (selectedPackage !== 'custom' && isNewUniversity && newTotalUniversities > limit) {
      setPendingSelection({
        university,
        coursesToAdd,
        isNewUniversity
      });
      setExceededItem({
        type: 'university',
        current: Object.keys(selectedCourses).length,
        limit: limit,
        package: selectedPackage,
        newTotal: newTotalUniversities
      });
      setShowSwitchToCustomPopup(true);
      setShowMaximiseModal(false);
      return;
    }
    
    completeAddSuggestion(university, coursesToAdd, isNewUniversity);
    
    setMaximiseSuggestions(prev => 
      prev.filter(s => s.university.code !== university.code)
    );
    
  }, [selectedCourses, getInstitutionCourseLimit, selectedPackage, packageLimits, completeAddSuggestion]);

  const findAlternativeCourses = useCallback(async (university, unavailableCourseName) => {
    try {
      setCurrentUnavailableCourse(unavailableCourseName);
      const marks = getStudentMarks();
      
      if (marks.length === 0) {
        showNotificationMessage('No marks found. Please go back and enter your marks.', 'warning');
        return;
      }

      const response = await fetch(`${API_URL}/api/eligible-courses-at-university`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: university.id,
          subjects: marks,
          exclude_courses: [...selectedCourseNames, ...(selectedCourses[university.code] || [])]
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch eligible courses');
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const alternatives = data.eligible_courses.map(course => ({
          ...course,
          similarity: "You qualify for this course"
        }));
        
        setAvailableAlternatives(alternatives);
        setShowAlternativeModal(true);
      } else {
        throw new Error(data.error || 'Failed to get alternatives');
      }
    } catch (error) {
      console.error('❌ Error fetching alternatives:', error.message);
      const otherCourses = getOtherCoursesAtUniversity(university);
      const alternatives = otherCourses.map(course => ({
        ...course,
        similarity: "Available at this university"
      }));
      setAvailableAlternatives(alternatives);
      setShowAlternativeModal(true);
    }
  }, [getStudentMarks, getOtherCoursesAtUniversity, selectedCourseNames, selectedCourses, showNotificationMessage]);

  const isCourseSelected = useCallback((courseName, universityCode) => {
    return selectedCourses[universityCode]?.includes(courseName) || false;
  }, [selectedCourses]);

  const separateUniversitiesIntoGroups = useCallback((allUniversities) => {
    const groupA = [];
    const groupB = [];
    
    allUniversities.forEach(uni => {
      const isInGroupA = groupAInstitutions.some(name => 
        uni.name?.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(uni.name?.toLowerCase())
      );
      
      const isInGroupB = groupBInstitutions.some(name => 
        uni.name?.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(uni.name?.toLowerCase())
      );
      
      if (isInGroupA) {
        groupA.push(uni);
      } else if (isInGroupB) {
        groupB.push(uni);
      } else {
        groupB.push(uni);
      }
    });
    
    return { groupA, groupB };
  }, [groupAInstitutions, groupBInstitutions]);

  // Clear old selections on new session
  useEffect(() => {
    const sessionStarted = sessionStorage.getItem('payment_session_started');
    if (!sessionStarted) {
      sessionStorage.setItem('payment_session_started', 'true');
    }
  }, []);

  // Load ALL previous selections from database when page loads
  useEffect(() => {
    const loadAllSelections = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      try {
        const response = await fetch(`${API_URL}/api/payment/get-all-selections`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.selections && data.selections.length > 0) {
          setPreviousSelections(data.selections);
          setIsCreatingNewOrder(true);
        }
      } catch (error) {
        console.error('❌ Error loading previous selections:', error);
      }
    };
    
    loadAllSelections();
  }, []);

  // Check if a university is in previous orders
  const isUniversityInPreviousOrders = useCallback((universityCode, universityName) => {
    if (!isCreatingNewOrder) return false;
    
    return previousSelections.some(selection => {
      if (!selection.universities) return false;
      return selection.universities.some(uni => 
        uni.code === universityCode || uni.name === universityName
      );
    });
  }, [previousSelections, isCreatingNewOrder]);

  // Check if a specific course was in previous orders
  const isCourseInPreviousOrders = useCallback((universityCode, courseName) => {
    if (!isCreatingNewOrder) return false;
    
    return previousSelections.some(selection => {
      if (!selection.universities) return false;
      const university = selection.universities.find(uni => uni.code === universityCode);
      return university && university.courses && university.courses.includes(courseName);
    });
  }, [previousSelections, isCreatingNewOrder]);

  // Initialize page with marks and courses
  useEffect(() => {
    const initializePage = async () => {
      window.scrollTo(0, 0);
      
      let courseDetails = [];
      let courseNames = [];
      
      if (location.state?.selectedCourses) {
        courseDetails = location.state.selectedCourses;
        courseNames = courseDetails.map(course => course.name);
        localStorage.setItem('selectedCourseDetails', JSON.stringify(courseDetails));
        localStorage.setItem('selectedCourseNames', JSON.stringify(courseNames));
      } else {
        const savedDetails = localStorage.getItem('selectedCourseDetails');
        const savedNames = localStorage.getItem('selectedCourseNames');
        
        if (savedDetails && savedNames) {
          courseDetails = JSON.parse(savedDetails);
          courseNames = JSON.parse(savedNames);
        }
      }
      
      setSelectedCourseDetails(courseDetails);
      setSelectedCourseNames(courseNames);
      
      let marks = [];
      if (location.state?.studentMarks) {
        marks = location.state.studentMarks;
        localStorage.setItem('student_marks', JSON.stringify(marks));
      } else {
        const savedMarks = localStorage.getItem('student_marks');
        if (savedMarks) {
          marks = JSON.parse(savedMarks);
        }
      }
      
      if (marks.length > 0) {
        setStudentMarks(marks);
      }
      
      const savedCourses = localStorage.getItem('selectedUniversityCourses');
      if (savedCourses) {
        try {
          const parsed = JSON.parse(savedCourses);
          if (Object.keys(parsed).length > 0) {
            setSelectedCourses(parsed);
          }
        } catch (e) {
          setSelectedCourses({});
        }
      }
      
      const savedPackage = localStorage.getItem('selectedPackage');
      if (savedPackage) {
        setSelectedPackage(savedPackage);
      } else {
        setSelectedPackage('premium');
      }
      
      setPageLoaded(true);
      
      setTimeout(() => {
        fetchUniversities(courseNames, marks);
      }, 100);
    };
    
    initializePage();
  }, [location.state]);

  // Update universities selected status
  useEffect(() => {
    if (universities.length > 0) {
      setUniversities(prev => prev.map(uni => ({
        ...uni,
        selected: selectedCourses[uni.code]?.length > 0 || false
      })));
    }
  }, [selectedCourses, universities.length]);

  useEffect(() => {
    if (universities.length > 0) {
      const { groupA, groupB } = separateUniversitiesIntoGroups(universities);
      setGroupAUniversities(groupA);
      setGroupBUniversities(groupB);
    }
  }, [universities, separateUniversitiesIntoGroups]);

  // Fetch universities
  const fetchUniversities = async (courseNames, marks = []) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      if (courseNames.length === 0) {
        const response = await fetch(`${API_URL}/api/institutions-with-courses`, {
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch institutions with courses');
        const institutions = await response.json();
        
        const universityList = institutions.map(inst => {
          let logoInfo = universityLogos[inst.name];
          
          if (!logoInfo) {
            for (const [key, value] of Object.entries(universityLogos)) {
              if (inst.name?.toLowerCase().includes(key.toLowerCase()) || 
                  key.toLowerCase().includes(inst.name?.toLowerCase())) {
                logoInfo = value;
                break;
              }
            }
          }
          
          if (!logoInfo) {
            logoInfo = {
              code: inst.code || inst.name?.split(' ').map(word => word[0]).join('').toUpperCase(),
              logo: `/${inst.code || inst.name?.split(' ').map(word => word[0]).join('')}.jpeg`
            };
          }
          
          return {
            id: inst.id,
            name: inst.name,
            code: logoInfo.code,
            logo: logoInfo.logo,
            courses: inst.courses || [],
            selected: selectedCourses[logoInfo.code]?.length > 0 || false,
            available: true
          };
        });
        
        setUniversities(universityList);
      } else {
        const response = await fetch(`${API_URL}/api/institutions-by-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            course_names: courseNames
          }),
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch institutions by courses');
        
        const data = await response.json();
        
        if (data.status === 'success') {
          const institutions = data.institutions || [];
          
          const universityList = institutions.map(inst => {
            let logoInfo = universityLogos[inst.name];
            
            if (!logoInfo) {
              for (const [key, value] of Object.entries(universityLogos)) {
                if (inst.name?.toLowerCase().includes(key.toLowerCase()) || 
                    key.toLowerCase().includes(inst.name?.toLowerCase())) {
                  logoInfo = value;
                  break;
                }
              }
            }
            
            if (!logoInfo) {
              logoInfo = {
                code: inst.code || inst.name?.split(' ').map(word => word[0]).join('').toUpperCase(),
                logo: `/${inst.code || inst.name?.split(' ').map(word => word[0]).join('')}.jpeg`
              };
            }
            
            return {
              id: inst.id,
              name: inst.name,
              code: logoInfo.code,
              logo: logoInfo.logo,
              courses: inst.courses || [],
              selected: selectedCourses[logoInfo.code]?.length > 0 || false,
              available: true
            };
          });
          
          setUniversities(universityList);
        } else {
          throw new Error(data.error || 'Failed to fetch institutions');
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Fetch error:', error.message);
        setError(error.message);
        setUniversities([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUniversityClick = useCallback((university) => {
    if (isCreatingNewOrder && isUniversityInPreviousOrders(university.code, university.name)) {
      showNotificationMessage(`You've already applied to ${university.name} in a previous order. Please select different universities for your new order.`, 'warning');
      return;
    }

    const currentUniversities = Object.keys(selectedCourses).length;
    const limit = packageLimits[selectedPackage].universities;
    
    if (selectedPackage !== 'custom' && currentUniversities >= limit && !selectedCourses[university.code]?.length > 0) {
      setExceededItem({
        type: 'university',
        current: currentUniversities,
        limit: limit,
        package: selectedPackage
      });
      setShowSwitchToCustomPopup(true);
      return;
    }
    
    setSelectedUniversity(university);
  }, [selectedCourses, selectedPackage, packageLimits, isCreatingNewOrder, isUniversityInPreviousOrders, showNotificationMessage]);

  const handleCourseSelection = useCallback((course) => {
    if (!selectedUniversity) return;

    if (isCreatingNewOrder && isCourseInPreviousOrders(selectedUniversity.code, course.name)) {
      showNotificationMessage(`You've already applied to "${course.name}" in a previous order. Please select different courses for your new order.`, 'warning');
      return;
    }

    const universityCode = selectedUniversity.code;
    const currentSelections = selectedCourses[universityCode] || [];
    const institutionLimit = getInstitutionCourseLimit(selectedUniversity.name);

    if (currentSelections.includes(course.name)) {
      const newSelections = currentSelections.filter(c => c !== course.name);
      const updated = { ...selectedCourses, [universityCode]: newSelections };
      if (newSelections.length === 0) {
        delete updated[universityCode];
      }
      setSelectedCourses(updated);
      localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    } else {
      if (currentSelections.length >= institutionLimit) {
        showNotificationMessage(`${selectedUniversity.name} allows maximum ${institutionLimit} courses.`, 'warning');
        return;
      }
      
      const newSelections = [...currentSelections, course.name];
      const updated = { ...selectedCourses, [universityCode]: newSelections };
      setSelectedCourses(updated);
      localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    }
  }, [selectedUniversity, selectedCourses, getInstitutionCourseLimit, isCreatingNewOrder, isCourseInPreviousOrders, showNotificationMessage]);

  const handleAlternativeSelect = useCallback((alternativeCourse) => {
    if (!selectedUniversity) return;
    
    const universityCode = selectedUniversity.code;
    const currentSelections = selectedCourses[universityCode] || [];
    const institutionLimit = getInstitutionCourseLimit(selectedUniversity.name);
    
    if (currentSelections.length >= institutionLimit) {
      const unavailableCourseIndex = currentSelections.findIndex(courseName => 
        courseName === currentUnavailableCourse
      );
      
      if (unavailableCourseIndex !== -1) {
        const newSelections = [...currentSelections];
        newSelections[unavailableCourseIndex] = alternativeCourse.name;
        
        const updated = { ...selectedCourses, [universityCode]: newSelections };
        setSelectedCourses(updated);
        localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
        
        const updatedCourseNames = [...selectedCourseNames];
        const unavailableIndex = updatedCourseNames.indexOf(currentUnavailableCourse);
        if (unavailableIndex !== -1) {
          updatedCourseNames[unavailableIndex] = alternativeCourse.name;
        }
        setSelectedCourseNames(updatedCourseNames);
        localStorage.setItem('selectedCourseNames', JSON.stringify(updatedCourseNames));
        
        setShowAlternativeModal(false);
        setCurrentUnavailableCourse('');
        setAvailableAlternatives([]);
        
        showNotificationMessage(`Successfully replaced "${currentUnavailableCourse}" with "${alternativeCourse.name}" at ${selectedUniversity.name}`, 'success');
        return;
      }
    }
    
    if (currentSelections.length >= institutionLimit) {
      showNotificationMessage(`Maximum ${institutionLimit} courses reached for ${selectedUniversity.name}.`, 'warning');
      return;
    }
    
    const newSelections = [...currentSelections, alternativeCourse.name];
    const updated = { ...selectedCourses, [universityCode]: newSelections };
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    
    if (!selectedCourseNames.includes(alternativeCourse.name)) {
      const updatedCourseNames = [...selectedCourseNames, alternativeCourse.name];
      setSelectedCourseNames(updatedCourseNames);
      localStorage.setItem('selectedCourseNames', JSON.stringify(updatedCourseNames));
    }
    
    setShowAlternativeModal(false);
    setCurrentUnavailableCourse('');
    setAvailableAlternatives([]);
    
    showNotificationMessage(`Added "${alternativeCourse.name}" at ${selectedUniversity.name}`, 'success');
  }, [selectedUniversity, selectedCourses, getInstitutionCourseLimit, currentUnavailableCourse, selectedCourseNames, showNotificationMessage]);

  const handleUniversityDeselect = useCallback((university, e) => {
    e.stopPropagation();
    
    const updated = { ...selectedCourses };
    delete updated[university.code];
    setSelectedCourses(updated);
    
    setUniversities(prev => prev.map(uni => 
      uni.id === university.id ? { ...uni, selected: false } : uni
    ));
    
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
  }, [selectedCourses]);

  const handleCloseCoursesModal = useCallback(() => {
    if (selectedUniversity) {
      const hasCourses = selectedCourses[selectedUniversity.code]?.length > 0;
      setUniversities(prev => prev.map(uni => 
        uni.id === selectedUniversity.id ? { 
          ...uni, 
          selected: hasCourses
        } : uni
      ));
    }
    
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(selectedCourses));
    setSelectedUniversity(null);
    setShowAlternativeModal(false);
    setCurrentUnavailableCourse('');
    setAvailableAlternatives([]);
  }, [selectedUniversity, selectedCourses]);

  const handlePackageSelect = useCallback((packageType) => {
    setSelectedPackage(packageType);
    localStorage.setItem('selectedPackage', packageType);
    setShowPaymentPopup(false);
    
    if (packageType !== 'custom') {
      setCustomOptions({
        universityApps: 0
      });
    }
  }, []);

  const handleSwitchToCustom = useCallback(() => {
    setSelectedPackage('custom');
    localStorage.setItem('selectedPackage', 'custom');
    setShowSwitchToCustomPopup(false);
    
    if (pendingSelection) {
      if (pendingSelection.coursesToAdd) {
        completeAddSuggestion(
          pendingSelection.university, 
          pendingSelection.coursesToAdd, 
          pendingSelection.isNewUniversity
        );
        
        setMaximiseSuggestions(prev => 
          prev.filter(s => s.university.code !== pendingSelection.university.code)
        );
      } else if (pendingSelection.tempSelectedCourses) {
        completeAddSelection(
          pendingSelection.university,
          pendingSelection.university.code,
          pendingSelection.tempSelectedCourses,
          pendingSelection.isNewUniversity
        );
        
        setMaximiseSuggestions(prev => 
          prev.filter(s => s.university.code !== pendingSelection.university.code)
        );
      }
      setPendingSelection(null);
    }
  }, [pendingSelection, completeAddSelection, completeAddSuggestion]);

  const handleCustomOptionChange = useCallback((option, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  const handleNewOrder = useCallback(() => {
    setSelectedCourses({});
    setSelectedCourseNames([]);
    setSelectedCourseDetails([]);
    localStorage.removeItem('selectedUniversityCourses');
    localStorage.removeItem('selectedCourseNames');
    localStorage.removeItem('selectedCourseDetails');
    setIsCreatingNewOrder(true);
  }, []);

  const usageStats = useMemo(() => getUsageStats(), [getUsageStats]);
  const selectedUniversities = useMemo(() => getSelectedUniversities(), [getSelectedUniversities]);
  const totalApplications = useMemo(() => calculateTotalApplications(), [calculateTotalApplications]);

  const totalCost = useMemo(() => {
    if (selectedPackage === 'custom') {
      return 25 + (Object.keys(selectedCourses).length * 80);
    } else {
      return packagePrices[selectedPackage];
    }
  }, [selectedPackage, selectedCourses]);

  const universityCourses = useMemo(() => {
    if (!selectedUniversity) return { availableCourses: [], unavailableCourses: [] };
    return getCoursesForUniversity(selectedUniversity);
  }, [selectedUniversity, getCoursesForUniversity]);

  const handleApply = useCallback(async () => {
    const selectedUnis = getSelectedUniversities();
    const totalCourses = calculateTotalApplications();
    const totalUniversities = Object.keys(selectedCourses).length;
    
    if (totalCourses === 0) {
      showNotificationMessage('Please select at least one course from any university', 'warning');
      return;
    }

    const limits = packageLimits[selectedPackage];
    
    if (selectedPackage !== 'custom' && totalUniversities > limits.universities) {
      setExceededItem({
        type: 'university',
        current: totalUniversities,
        limit: limits.universities,
        package: selectedPackage
      });
      setShowSwitchToCustomPopup(true);
      return;
    }

    const selectedUniversitiesList = selectedUnis.map(u => ({
      code: u.code,
      name: u.name,
      courses: selectedCourses[u.code] || []
    }));

    const applicationSummary = {
      package: selectedPackage,
      universities: selectedUniversitiesList,
      totalCourses: totalCourses,
      totalUniversities: totalUniversities,
      timestamp: new Date().toISOString(),
      courseDetails: selectedCourseDetails,
      totalCost: totalCost
    };
    
    localStorage.setItem('applicationSummary', JSON.stringify(applicationSummary));

    const token = localStorage.getItem('authToken');
    
    if (token) {
      setIsSaving(true);
      
      try {
        const requestBody = {
          selectedPackage,
          universities: selectedUniversitiesList,
          totalCourses,
          totalUniversities,
          totalCost,
          courseDetails: selectedCourseDetails
        };
        
        const response = await fetch(`${API_URL}/api/payment/save-selection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (result.success) {
          const updatedSummary = {
            ...applicationSummary,
            trackingNumber: result.trackingNumber
          };
          localStorage.setItem('applicationSummary', JSON.stringify(updatedSummary));
          sessionStorage.setItem('paymentTrackingNumber', result.trackingNumber);
        }
      } catch (error) {
        console.error('❌ Error saving to database:', error);
      } finally {
        setIsSaving(false);
      }
    }

    setShowPaymentPopup(true);
  }, [calculateTotalApplications, selectedCourses, selectedPackage, packageLimits, getSelectedUniversities, selectedCourseDetails, totalCost, showNotificationMessage]);

  const handlePaymentComplete = useCallback(async (paymentResult) => {
    setPaymentStatus(paymentResult);
    setShowPaymentPopup(false);
    
    if (paymentResult.showCredentials) {
      setAccountUsername(paymentResult.username);
      setAccountPassword(paymentResult.password);
      setShowCredentialsModal(true);
    }
    
    if (paymentResult.success) {
      const selectedUnis = getSelectedUniversities().map(u => ({
        code: u.code,
        name: u.name,
        courses: selectedCourses[u.code]
      }));

      let existingDocuments = {};
      try {
        const savedProfile = localStorage.getItem('userProfileData');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          existingDocuments = profile.documents || {};
        }
        
        const sessionDocs = sessionStorage.getItem('uploadedDocuments');
        if (sessionDocs) {
          const docs = JSON.parse(sessionDocs);
          existingDocuments = { ...existingDocuments, ...docs };
        }
      } catch (error) {
        console.error('Error getting existing documents:', error);
      }

      const userData = {
        firstName: paymentResult.firstName || '',
        lastName: paymentResult.lastName || '',
        gender: paymentResult.gender || '',
        email: paymentResult.email || '',
        kinName: paymentResult.kinName || '',
        kinPhone: paymentResult.kinPhone || '',
        phoneNumber: paymentResult.phoneNumber || paymentResult.phone || '',
        whatsappNumber: paymentResult.whatsappNumber || '',
        package: selectedPackage,
        amount: totalCost,
        universities: selectedUnis,
        courses: selectedCourses,
        transactionId: paymentResult.transactionId,
        province: paymentResult.province || '',
        city: paymentResult.city || '',
        homeLanguage: paymentResult.homeLanguage || '',
        nationality: paymentResult.nationality || '',
        idNumber: paymentResult.idNumber || '',
        dateOfBirth: paymentResult.dateOfBirth || ''
      };

      try {
        const token = localStorage.getItem('authToken');
        
        const appResponse = await fetch(`${API_URL}/api/applications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            whatsappNumber: userData.whatsappNumber,
            gender: userData.gender,
            province: userData.province,
            city: userData.city,
            homeLanguage: userData.homeLanguage,
            nationality: userData.nationality,
            kinName: userData.kinName,
            kinPhone: userData.kinPhone,
            idNumber: userData.idNumber,
            dateOfBirth: userData.dateOfBirth,
            trackingNumber: paymentResult.transactionId,
            documents: existingDocuments
          })
        });

        const appResult = await appResponse.json();
        
        if (appResult.success) {
          console.log('✅ Application saved with tracking:', appResult.trackingNumber);
        }

      

const orderResponse = await fetch(`${API_URL}/api/submit-order`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  },
  body: JSON.stringify({
    ...userData,
    trackingNumber: paymentResult.transactionId
  })
});
        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
          const trackingNumber = orderResult.trackingNumber;
          
          localStorage.setItem('userProfile', JSON.stringify({
            ...userData,
            trackingNumber: trackingNumber,
            status: 'Processing',
            orderDate: new Date().toISOString(),
            documents: existingDocuments
          }));
          
          const existingProfile = localStorage.getItem('userProfileData');
          const profileData = existingProfile ? JSON.parse(existingProfile) : {};
          localStorage.setItem('userProfileData', JSON.stringify({
            ...profileData,
            ...userData,
            documents: existingDocuments
          }));
          
          localStorage.removeItem('selectedUniversityCourses');
          localStorage.removeItem('selectedCourseDetails');
          localStorage.removeItem('selectedCourseNames');
          localStorage.removeItem('selectedPackage');
          localStorage.removeItem('applicationSummary');
          
          sessionStorage.removeItem('paymentTrackingNumber');
          sessionStorage.removeItem('uploadedDocuments');
          
          if (!paymentResult.showCredentials) {
            setTimeout(() => {
              navigate('/profile');
            }, 500);
          }
        } else {
          showNotificationMessage('Error submitting order: ' + orderResult.error, 'error');
        }
      } catch (error) {
        console.error('Order submission error:', error);
        showNotificationMessage('Failed to submit order. Please contact support.', 'error');
      }
    }
  }, [selectedPackage, totalCost, getSelectedUniversities, selectedCourses, navigate, showNotificationMessage]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedUniversityCourses');
    localStorage.removeItem('selectedCourseNames');
    localStorage.removeItem('selectedCourseDetails');
    localStorage.removeItem('selectedPackage');
    localStorage.removeItem('applicationSummary');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfileData');
    sessionStorage.removeItem('paymentTrackingNumber');
    sessionStorage.removeItem('uploadedDocuments');
    sessionStorage.removeItem('payment_session_started');
    
    navigate('/');
  }, [navigate]);

  console.log('🔵 PaymentPage rendering - Apply button enabled:', totalApplications > 0 && usageStats.isWithinLimits);

  return (
    <div className={`payment-page ${pageLoaded ? 'loaded' : ''}`}>

    <header style={{
  padding: '0px 40px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: 'white',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  height: '70px',
  display: 'flex',
  alignItems: 'center'
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <img src="/Skolify-Logo.jpeg" alt="Skolify Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
      <span style={{ fontSize: '24px', fontWeight: 700 }}>Skolify</span>
    </div>
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '36px',
          color: '#1a1a1a',
          cursor: 'pointer',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaUserCircle />
      </button>
      {showProfileMenu && (
        <div style={{
          position: 'absolute',
          top: '55px',
          right: 0,
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          width: '220px',
          zIndex: 1000
        }}>
          {/* menu content */}
        </div>
      )}
    </div>
  </div>
</header>

      <div className="payment-container">
        {/* New Order Banner for logged-in users with previous orders */}
        {isCreatingNewOrder && previousSelections.length > 0 && (
          <div className="new-order-banner">
            <FaHistory className="new-order-icon" />
            <div className="new-order-text">
              <h3>Creating New Order</h3>
              <p>Universities you've applied to before are disabled. Please select different universities for this new order.</p>
            </div>
            <button className="view-previous-btn" onClick={() => navigate('/profile')}>
              View Previous Orders
            </button>
          </div>
        )}

        <div className="discovery-message">
          <h2 className="university-count-title">
            Skolify has found <span className="university-count-blue">{universities.length}</span> Universities you can apply to
          </h2>
          <h1 className="main-heading">Select Your Universities & Courses</h1>
        </div>

        {/* Maximise Options Banner */}
        {selectedUniversities.length > 0 && (selectedPackage !== 'custom' ? selectedUniversities.length < packageLimits[selectedPackage].universities : true) && (
          <div className="maximise-options-banner">
            <div className="maximise-banner-content">
              <FaLightbulb className="maximise-icon" />
              <div className="maximise-text">
                <h3>
                  {selectedPackage === 'custom' 
                    ? `You've selected ${selectedUniversities.length} universities` 
                    : `You've selected ${selectedUniversities.length} out of ${packageLimits[selectedPackage].universities} universities`}
                </h3>
                <p>
                  {selectedPackage === 'custom'
                    ? 'Add more universities to build your perfect package!'
                    : `You have ${packageLimits[selectedPackage].universities - selectedUniversities.length} slot(s) left. Add more universities to maximize your chances!`}
                </p>
              </div>
              <button 
                className="maximise-btn"
                onClick={calculateMaximiseOptions}
                disabled={isCalculatingMaximise}
              >
                {isCalculatingMaximise ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Finding Options...
                  </>
                ) : (
                  <>
                    <FaMagic /> Find More Universities
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-state">
            <FaSpinner className="spinner-large" />
            <p>Finding universities that offer your selected courses...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="error-state">
            <p>⚠️ Error: {error}</p>
            <p>Please check if the backend server is running.</p>
            <button 
              className="retry-btn"
              onClick={() => fetchUniversities(selectedCourseNames)}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="usage-limits-simple">
              <div className="limit-item-simple">
                <span className="limit-label-simple">Universities:</span>
                <span className={`limit-value-simple ${selectedPackage !== 'custom' && usageStats.universities.current > usageStats.universities.limit ? 'exceeded' : ''}`}>
                  {selectedPackage === 'custom' ? (
                    <span>{usageStats.universities.current} / ∞</span>
                  ) : (
                    <span>{usageStats.universities.current} / {usageStats.universities.limit}</span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="university-selection-section">
              <p className="section-subtitle">
                Click on a university to select your courses (up to {getInstitutionCourseLimit('University')} per university).
                {selectedCourseNames.length > 0 ? (
                  <span> Only universities offering your selected courses are shown.</span>
                ) : (
                  <span> All universities are shown.</span>
                )}
              </p>
              
              {universities.length > 0 ? (
                <div className="university-groups-container">
                  {groupAUniversities.length > 0 && (
                    <div className="university-group-card">
                      <div className="group-header">
                        <span className="group-name">No Application Fee</span>
                        <span className="group-count">{groupAUniversities.length}</span>
                      </div>
                      <div className="universities-grid">
                        {groupAUniversities.map(university => {
                          const courseCount = selectedCourses[university.code]?.length || 0;
                          const isSelected = courseCount > 0;
                          const isDisabled = selectedPackage !== 'custom' && !isSelected && 
                                        (usageStats.universities.current >= usageStats.universities.limit);
                          const institutionLimit = getInstitutionCourseLimit(university.name);
                          const isPreviousOrder = isCreatingNewOrder && isUniversityInPreviousOrders(university.code, university.name);
                          
                          const finalDisabled = isDisabled || isPreviousOrder;
                          
                          return (
                            <div 
                              key={university.id}
                              className={`university-card 
                                ${isSelected ? 'selected' : ''} 
                                ${finalDisabled ? 'disabled' : ''}
                                ${isPreviousOrder ? 'previous-order' : ''}`}
                              onClick={() => !finalDisabled && handleUniversityClick(university)}
                            >
                              <div className="university-logo-container">
                                <img 
                                  src={university.logo} 
                                  alt={`${university.name} logo`}
                                  className="university-logo"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="university-logo-fallback">
                                  <FaUniversity />
                                  <span>{university.code}</span>
                                </div>
                              </div>
                              <div className="university-info">
                                <h3 className="university-name">{university.code}</h3>
                                {isSelected && (
                                  <div className="courses-selected-badge">
                                    {courseCount} course{courseCount !== 1 ? 's' : ''}
                                  </div>
                                )}
                                {!isSelected && !isPreviousOrder && (
                                  <div className="courses-limit-badge">
                                    {institutionLimit} max
                                  </div>
                                )}
                                {isPreviousOrder && (
                                  <div className="previous-order-badge">
                                    <FaLock /> Applied Before
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <div 
                                  className="selected-check"
                                  onClick={(e) => handleUniversityDeselect(university, e)}
                                  title="Deselect university"
                                >
                                  <FaTimes />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {groupBUniversities.length > 0 && (
                    <div className="university-group-card">
                      <div className="group-header">
                        <span className="group-name">Application Fee Required</span>
                        <span className="group-count">{groupBUniversities.length}</span>
                      </div>
                      <div className="universities-grid">
                        {groupBUniversities.map(university => {
                          const courseCount = selectedCourses[university.code]?.length || 0;
                          const isSelected = courseCount > 0;
                          const isDisabled = selectedPackage !== 'custom' && !isSelected && 
                                        usageStats.universities.current >= usageStats.universities.limit;
                          const institutionLimit = getInstitutionCourseLimit(university.name);
                          const isPreviousOrder = isCreatingNewOrder && isUniversityInPreviousOrders(university.code, university.name);
                          
                          const finalDisabled = isDisabled || isPreviousOrder;
                          
                          return (
                            <div 
                              key={university.id}
                              className={`university-card 
                                ${isSelected ? 'selected' : ''} 
                                ${finalDisabled ? 'disabled' : ''}
                                ${isPreviousOrder ? 'previous-order' : ''}`}
                              onClick={() => !finalDisabled && handleUniversityClick(university)}
                            >
                              <div className="university-logo-container">
                                <img 
                                  src={university.logo} 
                                  alt={`${university.name} logo`}
                                  className="university-logo"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="university-logo-fallback">
                                  <FaUniversity />
                                  <span>{university.code}</span>
                                </div>
                              </div>
                              <div className="university-info">
                                <h3 className="university-name">{university.code}</h3>
                                {isSelected && (
                                  <div className="courses-selected-badge">
                                    {courseCount} course{courseCount !== 1 ? 's' : ''}
                                  </div>
                                )}
                                {!isSelected && !isPreviousOrder && (
                                  <div className="courses-limit-badge">
                                    {institutionLimit} max
                                  </div>
                                )}
                                {isPreviousOrder && (
                                  <div className="previous-order-badge">
                                    <FaLock /> Applied Before
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <div 
                                  className="selected-check"
                                  onClick={(e) => handleUniversityDeselect(university, e)}
                                  title="Deselect university"
                                >
                                  <FaTimes />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : !isLoading ? (
                <div className="no-universities-found">
                  <FaUniversity className="no-universities-icon" />
                  <h3>No Universities Found</h3>
                  <p>No universities were found that offer your selected courses.</p>
                </div>
              ) : null}
            </div>

            <div className="selected-universities-minimal">
              <div className="minimal-header">
                <h2>Your Selected Applications</h2>
                <p className="minimal-subtitle">Total: {totalApplications} courses across {selectedUniversities.length} universities</p>
              </div>
              
              {selectedUniversities.length > 0 ? (
                <div className="minimal-selections">
                  {selectedUniversities.map(university => {
                    const institutionLimit = getInstitutionCourseLimit(university.name);
                    const currentCount = selectedCourses[university.code]?.length || 0;
                    
                    return (
                      <div key={university.id} className="minimal-university">
                        <div className="minimal-university-header">
                          <div className="minimal-university-logo">
                            <img 
                              src={university.logo} 
                              alt={university.name}
                              className="minimal-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                            <div className="minimal-logo-fallback">
                              <FaUniversity />
                            </div>
                          </div>
                          <div className="minimal-university-info">
                            <h3>{university.code}</h3>
                            <span className="minimal-courses-count">
                              {currentCount}/{institutionLimit} courses selected
                            </span>
                          </div>
                          <button 
                            className="minimal-edit-btn"
                            onClick={() => handleUniversityClick(university)}
                          >
                            Edit
                          </button>
                          <button 
                            className="minimal-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUniversityDeselect(university, e);
                            }}
                            title="Remove university"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-selections-minimal">
                  <FaUniversity className="no-selections-icon" />
                  <p>No universities selected yet. Click on a university above to choose your courses.</p>
                </div>
              )}
            </div>

            <div className="package-section">
              <h2 className="package-section-title">Choose Your Application Package</h2>
              <div className="packages-inline">
                <div 
                  className={`package-inline ${selectedPackage === 'basic' ? 'selected' : ''}`}
                  onClick={() => handlePackageSelect('basic')}
                >
                  <div className="package-inline-header">
                    <h4>Basic</h4>
                    <div className="package-price-inline">R{packagePrices.basic}</div>
                  </div>
                  <div className="package-features-inline">
                    <div className="feature-inline">
                      <span className="feature-count-inline">2</span>
                      <span className="feature-label-inline">University Applications</span>
                    </div>
                    <div className="feature-inline accent-feature">
                      <span className="feature-label-inline">Standard Processing</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`package-inline ${selectedPackage === 'standard' ? 'selected' : ''}`}
                  onClick={() => handlePackageSelect('standard')}
                >
                  <div className="package-inline-header">
                    <h4>Standard</h4>
                    <div className="package-price-inline">R{packagePrices.standard}</div>
                  </div>
                  <div className="package-features-inline">
                    <div className="feature-inline">
                      <span className="feature-count-inline">4</span>
                      <span className="feature-label-inline">University Applications</span>
                    </div>
                    <div className="feature-inline accent-feature">
                      <span className="feature-label-inline">Faster Processing</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`package-inline ${selectedPackage === 'premium' ? 'selected' : ''}`}
                  onClick={() => handlePackageSelect('premium')}
                >
                  <div className="package-inline-header">
                    <h4>Premium</h4>
                    <div className="package-price-inline">R{packagePrices.premium}</div>
                  </div>
                  <div className="package-features-inline">
                    <div className="feature-inline">
                      <span className="feature-count-inline">6</span>
                      <span className="feature-label-inline">University Applications</span>
                    </div>
                    <div className="feature-inline accent-feature">
                      <span className="feature-label-inline">Priority Processing</span>
                    </div>
                  </div>
                </div>
                
                {/* Custom Package */}
                <div 
                  className={`package-inline ${selectedPackage === 'custom' ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage('custom')}
                >
                  <div className="package-inline-header">
                    <h4>Custom</h4>
                    <div className="package-price-inline">Build</div>
                  </div>
                  
                  {selectedPackage === 'custom' ? (
                    <div className="custom-options-inline">
                      <div className="custom-option-row-inline">
                        <span>Base Fee:</span>
                        <span className="custom-price-inline">R25</span>
                      </div>
                      <div className="custom-option-row-inline">
                        <div className="custom-counter-inline">
                          <button 
                            className="counter-btn-inline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomOptionChange('universityApps', Math.max(0, Object.keys(selectedCourses).length - 1));
                            }}
                          >
                            -
                          </button>
                          <span className="counter-value-inline">{Object.keys(selectedCourses).length} {Object.keys(selectedCourses).length === 1 ? 'University' : 'Universities'}</span>
                          <button 
                            className="counter-btn-inline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomOptionChange('universityApps', Object.keys(selectedCourses).length + 1);
                            }}
                          >
                            +
                          </button>
                          <span className="price-per-item-inline">R80 each</span>
                        </div>
                      </div>
                      <div className="custom-total-inline accent-total">
                        <span>Total:</span>
                        <span className="total-amount-inline">
                          R{25 + (Object.keys(selectedCourses).length * 80)}
                        </span>
                      </div>
                      <div className="custom-note-inline">
                        <small>Build your own package • No university limit</small>
                      </div>
                    </div>
                  ) : (
                    <div className="custom-features-inline">
                      <div className="feature-inline">
                        <span className="feature-label-inline">Build Your Own</span>
                      </div>
                      <div className="feature-inline">
                        <span className="feature-label-inline">No University Limit</span>
                      </div>
                      <div className="feature-inline">
                        <span className="feature-label-inline">R25 base + R80 per uni</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="apply-section">
              <div className="application-summary">
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="summary-label">Package:</span>
                    <span className="summary-value package-name">
                      {selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Total Cost:</span>
                    <span className="summary-value total-cost">
                      R{totalCost}
                    </span>
                  </div>
                </div>

                <button 
                  className="apply-now-btn"
                  onClick={handleApply}
                  disabled={totalApplications === 0 || (selectedPackage !== 'custom' && !usageStats.isWithinLimits) || isSaving}
                >
                  {isSaving ? 'Saving...' : (selectedPackage !== 'custom' && !usageStats.isWithinLimits) ? 'Exceeds Package Limits' : 'Apply Now'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedUniversity && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={handleCloseCoursesModal}></div>
          <div className="courses-modal-content">
            <div className="courses-modal-header">
              <div className="modal-university-header">
                <div className="modal-university-logo">
                  <img 
                    src={selectedUniversity.logo} 
                    alt={selectedUniversity.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="modal-logo-fallback">
                    <FaUniversity />
                  </div>
                </div>
                <div className="modal-university-info">
                  <h3>Select Courses for {selectedUniversity.name}</h3>
                  <p className="modal-subtitle">
                    Choose courses (up to {getInstitutionCourseLimit(selectedUniversity.name)} per university)
                    <br />
                    <small>You selected {selectedCourseNames.length} courses in total</small>
                  </p>
                </div>
              </div>
              <button 
                className="close-courses-modal"
                onClick={handleCloseCoursesModal}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="courses-modal-body">
              <div className="courses-section">
                <h4 className="section-title">
                  Available Courses at {selectedUniversity.code}
                  <span className="count-badge available-count">
                    {universityCourses.availableCourses.length} available
                  </span>
                </h4>
                
                {universityCourses.availableCourses.length > 0 ? (
                  <div className="courses-list-grid">
                    {universityCourses.availableCourses.map((course, index) => {
                      const selected = isCourseSelected(course.name, selectedUniversity.code);
                      const isPreviousCourse = isCreatingNewOrder && isCourseInPreviousOrders(selectedUniversity.code, course.name);
                      
                      return (
                        <div
                          key={`available-${index}`}
                          className={`course-item 
                            ${selected ? 'selected' : ''} 
                            ${isPreviousCourse ? 'previous-order-course' : ''}`}
                          onClick={() => !isPreviousCourse && handleCourseSelection(course)}
                        >
                          <div className="course-item-content">
                            <FaBook className="course-item-icon" />
                            <div className="course-details">
                              <span className="course-item-name">{course.name}</span>
                              <small className="course-status available">✓ Available at {selectedUniversity.code}</small>
                              {isPreviousCourse && (
                                <small className="previous-course-badge">
                                  <FaLock /> Already applied
                                </small>
                              )}
                            </div>
                            <div className="course-item-check">
                              {selected ? <FaCheck /> : (isPreviousCourse ? <FaLock /> : '+')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-available-courses">
                    <FaBook className="no-courses-icon" />
                    <p>None of your selected courses are available at {selectedUniversity.code}</p>
                  </div>
                )}
              </div>

              {universityCourses.unavailableCourses.length > 0 && (
                <div className="unavailable-courses-section">
                  <h4 className="section-title unavailable-title">
                    Courses Not Available at {selectedUniversity.code}
                    <span className="count-badge unavailable-count">
                      {universityCourses.unavailableCourses.length} unavailable
                    </span>
                  </h4>
                  <p className="section-subtitle">
                    These courses from your selection aren't offered here. Switch to alternatives to maximize your applications.
                  </p>
                  
                  <div className="unavailable-courses-list">
                    {universityCourses.unavailableCourses.map((courseName, index) => {
                      const isPreviousCourse = isCreatingNewOrder && isCourseInPreviousOrders(selectedUniversity.code, courseName);
                      
                      return (
                        <div key={`unavailable-${index}`} className="unavailable-course-item">
                          <div className="unavailable-course-content">
                            <FaBook className="unavailable-course-icon" />
                            <div className="course-details">
                              <span className="course-item-name">{courseName}</span>
                              <small className="course-status unavailable">✗ Not offered at {selectedUniversity.code}</small>
                              {isPreviousCourse && (
                                <small className="previous-course-badge">
                                  <FaLock /> Already applied
                                </small>
                              )}
                            </div>
                            {!isPreviousCourse && (
                              <button 
                                className="switch-course-btn"
                                onClick={() => findAlternativeCourses(selectedUniversity, courseName)}
                              >
                                Switch Course
                                <FaExchangeAlt />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {getOtherCoursesAtUniversity(selectedUniversity).length > 0 && (
                <div className="other-courses-section">
                  <h4 className="section-title other-title">
                    Other Courses at {selectedUniversity.code}
                    <span className="count-badge other-count">
                      {getOtherCoursesAtUniversity(selectedUniversity).length} more
                    </span>
                  </h4>
                  <p className="section-subtitle">
                    Additional courses available at this university (not in your original selection)
                  </p>
                  
                  <div className="other-courses-list">
                    {getOtherCoursesAtUniversity(selectedUniversity).slice(0, 5).map((course, index) => {
                      const selected = isCourseSelected(course.name, selectedUniversity.code);
                      const isPreviousCourse = isCreatingNewOrder && isCourseInPreviousOrders(selectedUniversity.code, course.name);
                      
                      return (
                        <div
                          key={`other-${index}`}
                          className={`course-item other-course-item 
                            ${selected ? 'selected' : ''}
                            ${isPreviousCourse ? 'previous-order-course' : ''}`}
                          onClick={() => !isPreviousCourse && handleCourseSelection(course)}
                        >
                          <div className="course-item-content">
                            <FaBook className="course-item-icon" />
                            <div className="course-details">
                              <span className="course-item-name">{course.name}</span>
                              <small className="course-status other">Available at {selectedUniversity.code}</small>
                              {isPreviousCourse && (
                                <small className="previous-course-badge">
                                  <FaLock /> Already applied
                                </small>
                              )}
                            </div>
                            <div className="course-item-check">
                              {selected ? <FaCheck /> : (isPreviousCourse ? <FaLock /> : '+')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="courses-modal-footer">
              <div className="selected-courses-count">
                <span>{selectedCourses[selectedUniversity.code]?.length || 0}</span> / {getInstitutionCourseLimit(selectedUniversity.name)} courses selected
              </div>
              <div className="available-slots">
                <span className="slots-available">
                  {getInstitutionCourseLimit(selectedUniversity.name) - (selectedCourses[selectedUniversity.code]?.length || 0)} slots available
                </span>
              </div>
              <button 
                className="done-selecting-btn"
                onClick={handleCloseCoursesModal}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlternativeModal && (
        <div className="alternative-courses-modal">
          <div className="alternative-modal-overlay" onClick={() => setShowAlternativeModal(false)}></div>
          <div className="alternative-modal-content">
            <div className="alternative-modal-header">
              <button 
                className="back-button"
                onClick={() => setShowAlternativeModal(false)}
              >
                <FaArrowLeft />
              </button>
              <h3>Alternative Courses at {selectedUniversity?.name}</h3>
              <button 
                className="close-alternative-modal"
                onClick={() => setShowAlternativeModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="alternative-modal-body">
              <p className="alternative-modal-info">
                <strong>{currentUnavailableCourse}</strong> is not available at {selectedUniversity?.name}.
                Select an alternative course to replace it:
              </p>
              
              {availableAlternatives.length > 0 ? (
                <div className="alternative-courses-list">
                  {availableAlternatives.map((course, index) => {
                    const selected = isCourseSelected(course.name, selectedUniversity?.code);
                    const isPreviousCourse = isCreatingNewOrder && isCourseInPreviousOrders(selectedUniversity?.code, course.name);
                    
                    return (
                      <div
                        key={`alt-${index}`}
                        className={`alternative-course-item 
                          ${selected ? 'selected' : ''}
                          ${isPreviousCourse ? 'previous-order-course' : ''}`}
                        onClick={() => !isPreviousCourse && handleAlternativeSelect(course)}
                      >
                        <div className="alternative-course-content">
                          <FaBook className="alternative-course-icon" />
                          <div className="course-details">
                            <span className="course-item-name">{course.name}</span>
                            <div className="course-meta">
                              <small>Faculty: {course.faculty_name || 'N/A'}</small>
                              <small>Min APS: {course.minAPS || course.min_aps || 'N/A'}</small>
                              {course.similarity && (
                                <small className="similarity-info">{course.similarity}</small>
                              )}
                            </div>
                          </div>
                          <div className="select-alternative-btn">
                            {selected ? <FaCheck /> : (isPreviousCourse ? <FaLock /> : 'Replace')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-alternatives">
                  <FaBook className="no-alternatives-icon" />
                  <p>No alternative courses found at {selectedUniversity?.name}</p>
                  <button 
                    className="refresh-btn"
                    onClick={() => findAlternativeCourses(selectedUniversity, currentUnavailableCourse)}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Maximise Options Modal */}
      {showMaximiseModal && (
        <div className="maximise-modal">
          <div className="maximise-modal-overlay" onClick={() => {
            setShowMaximiseModal(false);
            setExpandedUniversity(null);
            setTempSelections({});
            setMaximiseSuggestions([]);
          }}></div>
          <div className="maximise-modal-content">
            <div className="maximise-modal-header">
              {expandedUniversity ? (
                <>
                  <button 
                    className="back-button"
                    onClick={handleBackFromExpanded}
                  >
                    <FaArrowLeft />
                  </button>
                  <h3>{expandedUniversity.university.name}</h3>
                </>
              ) : (
                <>
                  <div className="maximise-header-icon">
                    <FaMagic />
                  </div>
                  <h3>Find More Universities</h3>
                </>
              )}
              <button 
                className="close-maximise-modal"
                onClick={() => {
                  setShowMaximiseModal(false);
                  setExpandedUniversity(null);
                  setTempSelections({});
                  setMaximiseSuggestions([]);
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="maximise-modal-body">
              {expandedUniversity ? (
                <>
                  <div className="university-search-container">
                    <div className="search-input-group">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={universitySearchQuery}
                        onChange={(e) => handleUniversitySearch(e.target.value, expandedUniversity.eligibleCourses)}
                        className="university-search-input"
                      />
                    </div>
                  </div>
                  
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
                  
                  <div className="courses-list-grid">
                    {(filteredUniversityCourses.length > 0 ? filteredUniversityCourses : expandedUniversity.eligibleCourses)
                      .filter(course => {
                        if (courseTypeFilter === 'all') return true;
                        const name = course.name.toLowerCase();
                        if (courseTypeFilter === 'degree') return name.includes('bachelor') || name.includes('bcom') || name.includes('bsc') || name.includes('degree');
                        if (courseTypeFilter === 'diploma') return name.includes('diploma');
                        if (courseTypeFilter === 'certificate') return name.includes('certificate');
                        if (courseTypeFilter === 'online') return name.includes('online');
                        return true;
                      })
                      .map((course, index) => {
                        const isSelected = tempSelections[expandedUniversity.university.code]?.includes(course.name) || false;
                        return (
                          <div
                            key={`course-${index}`}
                            className={`course-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleTempCourse(expandedUniversity.university.code, course)}
                          >
                            <div className="course-item-content">
                              <FaBook className="course-item-icon" />
                              <div className="course-details">
                                <span className="course-item-name">{course.name}</span>
                                {course.faculty_name && (
                                  <small className="course-faculty">{course.faculty_name}</small>
                                )}
                              </div>
                              <div className="course-item-check">
                                {isSelected ? <FaCheck /> : '+'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  <div className="courses-modal-footer">
                    <div className="selected-courses-count">
                      Selected: {tempSelections[expandedUniversity.university.code]?.length || 0}/{getInstitutionCourseLimit(expandedUniversity.university.name)}
                    </div>
                    <button 
                      className="done-selecting-btn"
                      onClick={saveTempSelections}
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="maximise-modal-intro">
                    {maximiseSuggestions.length > 0 
                      ? `We found ${maximiseSuggestions.length} NEW universit${maximiseSuggestions.length > 1 ? 'ies' : 'y'} where you qualify for courses based on your marks.`
                      : 'No new universities found with courses you qualify for.'}
                  </p>
                  
                  {maximiseSuggestions.length > 0 ? (
                    <div className="maximise-suggestions-list">
                      {maximiseSuggestions.map((suggestion, index) => {
                        const university = suggestion.university;
                        
                        return (
                          <div 
                            key={`suggestion-${index}`}
                            className="maximise-suggestion-item"
                          >
                            <div className="suggestion-university-header">
                              <div className="suggestion-university-logo">
                                <img 
                                  src={university.logo} 
                                  alt={university.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="suggestion-logo-fallback">
                                  <FaUniversity />
                                </div>
                              </div>
                              <div className="suggestion-university-info">
                                <h4>{university.code}</h4>
                                <span className="suggestion-courses-count">
                                  {suggestion.courseCount} eligible course(s)
                                </span>
                              </div>
                            </div>
                            
                            <div className="suggestion-courses-preview">
                              <p className="preview-title">Courses you qualify for:</p>
                              <div className="preview-courses-list">
                                {suggestion.eligibleCourses.slice(0, 3).map((course, idx) => (
                                  <div key={`preview-${idx}`} className="preview-course-item">
                                    <FaBook className="preview-course-icon" />
                                    <span>{course.name}</span>
                                  </div>
                                ))}
                                {suggestion.eligibleCourses.length > 3 && (
                                  <div className="preview-more">
                                    +{suggestion.eligibleCourses.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <button 
                              className="view-courses-btn-full"
                              onClick={() => handleUniversityClickInMaximise(suggestion)}
                            >
                              Add {suggestion.courseCount} Courses
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-maximise-suggestions">
                      <FaUniversity className="no-suggestions-icon" />
                      <p>No new universities found with courses you qualify for based on your marks.</p>
                      <p className="suggestion-note">Try improving your marks or adding more subjects on the Dashboard.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Package Upgrade Popup */}
      {showSwitchToCustomPopup && (
        <div className="switch-custom-popup-modal">
          <div className="switch-custom-popup-overlay" onClick={() => setShowSwitchToCustomPopup(false)}></div>
          <div className="switch-custom-popup-content">
            <div className="switch-custom-header">
              <h3>Package Limit Reached</h3>
            </div>
            
            <div className="switch-custom-body">
              {exceededItem?.type === 'university' && (
                <p>
                  You are about to exceed your <strong>{exceededItem.package}</strong> package limit of {exceededItem.limit} universities.
                  {exceededItem.newTotal && (
                    <span className="exceeded-details"> You'll have {exceededItem.newTotal} universities total.</span>
                  )}
                </p>
              )}
              
              <div className="switch-options">
                <p className="upgrade-title">Switch to Custom Package to add more:</p>
                
                <div className="upgrade-option">
                  <h4>Custom Package</h4>
                  <p className="upgrade-price">Build Your Own</p>
                  <p className="upgrade-features">
                    R25 base + R80 per university<br />
                    {exceededItem?.newTotal && (
                      <strong>New total: R{25 + (exceededItem.newTotal * 80)}</strong>
                    )}
                  </p>
                  <button 
                    className="upgrade-btn custom-btn"
                    onClick={handleSwitchToCustom}
                  >
                    Switch to Custom Package
                  </button>
                </div>
              </div>
            </div>
            
            <div className="switch-custom-footer">
              <button 
                className="cancel-switch-btn"
                onClick={() => {
                  setShowSwitchToCustomPopup(false);
                  setPendingSelection(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Notification Popup */}
      {showNotification && (
        <div className="notification-modal">
          <div className="notification-overlay" onClick={() => setShowNotification(false)}></div>
          <div className={`notification-content notification-${notificationType}`}>
            <div className="notification-header">
              <h3>
                {notificationType === 'success' && '✅ Success'}
                {notificationType === 'error' && '❌ Error'}
                {notificationType === 'warning' && '⚠️ Warning'}
                {notificationType === 'info' && 'ℹ️ Information'}
              </h3>
              <button className="close-notification" onClick={() => setShowNotification(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="notification-body">
              <p>{notificationMessage}</p>
            </div>
            <div className="notification-footer">
              <button 
                className="notification-ok-btn"
                onClick={() => setShowNotification(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Credentials Modal */}
      {showCredentialsModal && (
        <div className="credentials-modal">
          <div className="credentials-modal-overlay" onClick={() => setShowCredentialsModal(false)}></div>
          <div className="credentials-modal-content">
            <div className="credentials-modal-header">
              <h3>✅ Account Created Successfully!</h3>
              <button className="close-credentials" onClick={() => setShowCredentialsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="credentials-modal-body">
              <p className="credentials-intro">Please save these credentials to sign in later:</p>
              
              <div className="credentials-box">
                <div className="credential-row">
                  <span className="credential-label">Username:</span>
                  <div className="credential-value">
                    <strong>{accountUsername}</strong>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(accountUsername);
                        showNotificationMessage('Username copied!', 'success');
                      }}
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                
                <div className="credential-row">
                  <span className="credential-label">Password:</span>
                  <div className="credential-value">
                    <strong>{accountPassword}</strong>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(accountPassword);
                        showNotificationMessage('Password copied!', 'success');
                      }}
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="credentials-warning">
                ⚠️ Save these credentials now. You won't see them again!
              </p>
            </div>
            <div className="credentials-modal-footer">
              <button 
                className="credentials-ok-btn"
                onClick={() => {
                  setShowCredentialsModal(false);
                  setTimeout(() => {
                    navigate('/profile');
                  }, 300);
                }}
              >
                I've Saved Them
              </button>
            </div>
          </div>
        </div>
      )}

      <Money 
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        totalAmount={totalCost}
        onPaymentComplete={handlePaymentComplete}
      />
      {/* Footer */}
<footer className="payment-footer">
  <div className="footer-links">
    <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
    <span className="footer-separator">|</span>
    <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
  </div>
  <p className="copyright">© {new Date().getFullYear()} Skolify. All rights reserved.</p>
</footer>
    </div>
  );
};

export default PaymentPage;