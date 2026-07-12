import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';
import Money from './Money';
import { FaUniversity, FaSpinner, FaCheck, FaTimes, FaInfoCircle, FaBook, FaCheckCircle, FaSearch, FaExchangeAlt, FaArrowLeft, FaMagic, FaCopy, FaHistory, FaLock, FaCommentDots, FaTag, FaCreditCard, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import API_URL from './config';

const trackEvent = (eventType, eventData = {}) => {
  const token = localStorage.getItem('authToken');
  fetch(`${API_URL}/api/track-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ eventType, eventData })
  }).catch(() => {});
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [selectedCourseNames, setSelectedCourseNames] = useState([]);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [isTermSaleActive, setIsTermSaleActive] = useState(() => {
    const saved = localStorage.getItem('isTermSaleActive');
    return saved === 'true' || false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [feeInfoGroup, setFeeInfoGroup] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);
  const [previousSelections, setPreviousSelections] = useState([]);
  const [isCreatingNewOrder, setIsCreatingNewOrder] = useState(false);
  const [showMaximiseModal, setShowMaximiseModal] = useState(false);
  const [maximiseSuggestions, setMaximiseSuggestions] = useState([]);
  const [isCalculatingMaximise, setIsCalculatingMaximise] = useState(false);
  const [expandedUniversity, setExpandedUniversity] = useState(null);
  const [universitySearchQuery, setUniversitySearchQuery] = useState('');
  const [filteredUniversityCourses, setFilteredUniversityCourses] = useState([]);
  const [tempSelections, setTempSelections] = useState({});
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [availableAlternatives, setAvailableAlternatives] = useState([]);
  const [alternativeUniversity, setAlternativeUniversity] = useState(null);
  const [isSavingSelection, setIsSavingSelection] = useState(false);

  // R19 Paywall state
  const [showR19Paywall, setShowR19Paywall] = useState(true);
  const [resultsUnlocked, setResultsUnlocked] = useState(false);
  const [isPayingR19, setIsPayingR19] = useState(false);
  const [r19Error, setR19Error] = useState('');
  const [isCheckingR19, setIsCheckingR19] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const TERM_SALE_PRICE = 199;
  const TERM_SALE_UNI_COUNT = 4;
  const PRICE_PER_UNI = 49;

  const universityLogos = useMemo(() => ({
    'University of Johannesburg': { code: 'UJ', logo: '/UJ.jpeg' },
    'Stellenbosch University': { code: 'SU', logo: '/SU.jpeg' },
    'University of Pretoria': { code: 'UP', logo: '/UP.jpeg' },
    'University of South Africa': { code: 'UNISA', logo: '/UNISA.jpeg' },
    'University of Western Cape': { code: 'UWC', logo: '/UWC.jpeg' },
    'University of Witwatersrand': { code: 'WITS', logo: '/WITS.jpeg' },
    'North-West University': { code: 'NWU', logo: '/NWU.jpeg' },
    'University of KwaZulu-Natal': { code: 'UKZN', logo: '/KZN.jpeg' },
    'Rhodes University': { code: 'RHODES', logo: '/RHODES.jpeg' },
    'University of Cape Town': { code: 'UCT', logo: '/UCT.jpeg' },
    'University of Free State': { code: 'UFS', logo: '/UOFS.jpeg' },
    'University of Limpopo': { code: 'UL', logo: '/UL.jpeg' },
    'Tshwane University of Technology': { code: 'TUT', logo: '/TUT.jpeg' },
    'Walter Sisulu University': { code: 'WSU', logo: '/WSU.jpeg' },
    'Durban University of Technology': { code: 'DUT', logo: '/DUT.jpeg' },
    'Cape Peninsula University of Technology': { code: 'CPUT', logo: '/CPUT.jpeg' },
    'Central University of Technology': { code: 'CUT', logo: '/CUT.jpeg' },
    'Mangosuthu University of Technology': { code: 'MUT', logo: '/MUT.jpeg' },
    'University of Fort Hare': { code: 'UFH', logo: '/UFH.jpeg' },
    'University of Venda': { code: 'UNIVEN', logo: '/UNIVEN.jpeg' },
    'University of Zululand': { code: 'UNIZULU', logo: '/UNIZULU.jpeg' },
    'Sefako Makgatho Health Sciences University': { code: 'SMU', logo: '/SMU.jpeg' },
  }), []);

  const hiddenInstitutions = ['Nelson Mandela University', 'Sol Plaatje University'];
  const filterHiddenInstitutions = (institutions) => {
    return institutions.filter(inst => !hiddenInstitutions.some(hidden => inst.name?.toLowerCase().includes(hidden.toLowerCase())));
  };

  const noFeeUniversitiesList = useMemo(() => [
    'University of Johannesburg', 'North-West University', 'University of Free State',
    'University of Western Cape', 'Walter Sisulu University'
  ], []);

  const getInstitutionCourseLimit = useCallback((institutionName) => {
    const limits = {
      'University of Johannesburg': 2, 'Stellenbosch University': 3, 'University of Pretoria': 2,
      'University of South Africa': 3, 'University of Western Cape': 2, 'University of Witwatersrand': 3,
      'North-West University': 2, 'University of KwaZulu-Natal': 6, 'Rhodes University': 3,
      'University of Cape Town': 2, 'University of Free State': 2, 'University of Limpopo': 2,
      'Tshwane University of Technology': 3, 'Walter Sisulu University': 3, 'Durban University of Technology': 4,
      'Cape Peninsula University of Technology': 4, 'Central University of Technology': 4,
      'Mangosuthu University of Technology': 4, 'University of Fort Hare': 3, 'University of Venda': 3,
      'University of Zululand': 4, 'Sefako Makgatho Health Sciences University': 3,
    };
    return limits[institutionName] || 3;
  }, []);

  const showNotificationMessage = useCallback((message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  const getStudentMarks = useCallback(() => {
    if (studentMarks.length > 0) return studentMarks;
    if (location.state?.studentMarks?.length > 0) { setStudentMarks(location.state.studentMarks); return location.state.studentMarks; }
    const storedMarks = localStorage.getItem('student_marks');
    if (storedMarks) { try { const m = JSON.parse(storedMarks); if (m.length > 0) { setStudentMarks(m); return m; } } catch (e) {} }
    return [];
  }, [location.state, studentMarks]);

  // Check R19 status on load - LOCALSTORAGE FIRST
  useEffect(() => {
    const checkR19Status = async () => {
      setIsCheckingR19(true);
      
      // CHECK LOCAL STORAGE FIRST - immediate bypass
      if (localStorage.getItem('r19_paid') === 'true') {
        setResultsUnlocked(true);
        setShowR19Paywall(false);
        setIsCheckingR19(false);
        return;
      }
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setShowR19Paywall(true);
        setIsCheckingR19(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/payment/check-r19-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.hasPaid) {
          setResultsUnlocked(true);
          setShowR19Paywall(false);
          localStorage.setItem('r19_paid', 'true');
          localStorage.removeItem('r19_payment_pending');
          localStorage.removeItem('r19_checkout_id');
          setIsCheckingR19(false);
          return;
        }

        const pendingCheckoutId = localStorage.getItem('r19_checkout_id');
        const isPending = localStorage.getItem('r19_payment_pending') === 'true';

        if (isPending && pendingCheckoutId) {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payment/verify-r19-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ checkoutId: pendingCheckoutId })
            });
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success && verifyData.status === 'completed') {
              localStorage.setItem('r19_paid', 'true');
              localStorage.removeItem('r19_payment_pending');
              localStorage.removeItem('r19_checkout_id');
              setResultsUnlocked(true);
              setShowR19Paywall(false);
              setIsCheckingR19(false);
              return;
            }
          } catch (e) {}
          
          setShowR19Paywall(true);
          setR19Error('Complete payment in the opened tab, or try again.');
        } else {
          setShowR19Paywall(true);
        }
      } catch (error) {
        setShowR19Paywall(true);
      }
      
      setIsCheckingR19(false);
    };

    checkR19Status();

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  useEffect(() => {
    const loadPreviousOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/payment/get-all-selections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.selections?.length > 0) {
          setPreviousSelections(data.selections);
          setIsCreatingNewOrder(true);
        }
      } catch (error) { console.error('Error loading previous orders:', error); }
    };
    loadPreviousOrders();
  }, []);

  useEffect(() => { trackEvent('page_view', { page: 'payment' }); }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-wrapper')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const isUniversityInPreviousOrders = useCallback((code, name) => {
    if (!isCreatingNewOrder) return false;
    return previousSelections.some(s => s.universities?.some(u => u.code === code || u.name === name));
  }, [previousSelections, isCreatingNewOrder]);

  const isCourseInPreviousOrders = useCallback((code, courseName) => {
    if (!isCreatingNewOrder) return false;
    return previousSelections.some(s => {
      const uni = s.universities?.find(u => u.code === code);
      return uni?.courses?.includes(courseName);
    });
  }, [previousSelections, isCreatingNewOrder]);

  useEffect(() => {
    if (location.state?.selectedCourses) {
      const courses = location.state.selectedCourses;
      setSelectedCourseNames(courses.map(c => c.name));
      localStorage.setItem('selectedCourseDetails', JSON.stringify(courses));
      localStorage.setItem('selectedCourseNames', JSON.stringify(courses.map(c => c.name)));
    } else {
      const savedNames = localStorage.getItem('selectedCourseNames');
      if (savedNames) setSelectedCourseNames(JSON.parse(savedNames));
    }
    const savedMarks = localStorage.getItem('student_marks');
    if (savedMarks) { try { const m = JSON.parse(savedMarks); if (m.length > 0) setStudentMarks(m); } catch (e) {} }
    const savedCourses = localStorage.getItem('selectedUniversityCourses');
    if (savedCourses) { try { setSelectedCourses(JSON.parse(savedCourses)); } catch (e) { setSelectedCourses({}); } }
  }, [location.state]);

  useEffect(() => {
    const fetchUniversities = async () => {
      if (selectedCourseNames.length === 0) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/institutions-by-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_names: selectedCourseNames })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            const filtered = filterHiddenInstitutions(data.institutions || []);
            const uniList = filtered.map(uni => {
              let logoInfo = universityLogos[uni.name];
              if (!logoInfo) {
                for (const [key, value] of Object.entries(universityLogos)) {
                  if (uni.name?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(uni.name?.toLowerCase())) {
                    logoInfo = value; break;
                  }
                }
              }
              return {
                id: uni.id, name: uni.name,
                code: logoInfo?.code || uni.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4),
                logo: logoInfo?.logo || `/${uni.code || 'university'}.jpeg`,
                courses: uni.courses || []
              };
            });
            setUniversities(uniList);
          }
        }
      } catch (error) { console.error('Error fetching universities:', error); }
      finally { setIsLoading(false); }
    };
    fetchUniversities();
  }, [selectedCourseNames, universityLogos]);

  const noFeeUniversities = useMemo(() => universities.filter(uni => noFeeUniversitiesList.includes(uni.name)), [universities, noFeeUniversitiesList]);
  const feeUniversities = useMemo(() => universities.filter(uni => !noFeeUniversitiesList.includes(uni.name)), [universities, noFeeUniversitiesList]);
  const totalFound = universities.length;

  const getAvailableCoursesForUniversity = useCallback((university) => {
    if (!university?.courses || selectedCourseNames.length === 0) return [];
    const available = university.courses.filter(c => selectedCourseNames.includes(c.name));
    const unique = [];
    const seen = new Set();
    available.forEach(c => { if (!seen.has(c.name)) { seen.add(c.name); unique.push(c); } });
    return unique;
  }, [selectedCourseNames]);

  const selectedUniCount = Object.keys(selectedCourses).length;
  const totalApplications = Object.values(selectedCourses).reduce((sum, courses) => sum + (courses?.length || 0), 0);
  const universitiesWithCourses = Object.values(selectedCourses).filter(courses => courses && courses.length > 0).length;
  const totalCost = isTermSaleActive ? TERM_SALE_PRICE : universitiesWithCourses * PRICE_PER_UNI;

  const handleTermSaleToggle = () => {
    const newState = !isTermSaleActive;
    setIsTermSaleActive(newState);
    localStorage.setItem('isTermSaleActive', newState.toString());
    if (newState) {
      trackEvent('term_sale_activated');
      if (selectedUniCount > TERM_SALE_UNI_COUNT) {
        const codes = Object.keys(selectedCourses);
        const updated = { ...selectedCourses };
        for (let i = TERM_SALE_UNI_COUNT; i < codes.length; i++) delete updated[codes[i]];
        setSelectedCourses(updated);
        localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
        showNotificationMessage('3rd Term Sale activated! Limited to 4 universities.', 'info');
      } else {
        showNotificationMessage('3rd Term Sale activated! Select exactly 4 universities for R199.', 'success');
      }
    } else {
      trackEvent('term_sale_deactivated');
      showNotificationMessage('Switched to regular pricing: R49 per university.', 'info');
    }
  };

  const handleUniversityClick = (university) => {
    if (!resultsUnlocked) return;
    if (isUniversityInPreviousOrders(university.code, university.name)) {
      showNotificationMessage(`Already applied to ${university.code}.`, 'warning');
      return;
    }
    const isAlreadySelected = selectedCourses[university.code]?.length > 0;
    if (isTermSaleActive && selectedUniCount >= TERM_SALE_UNI_COUNT && !isAlreadySelected) {
      showNotificationMessage(`3rd Term Sale limited to ${TERM_SALE_UNI_COUNT} universities.`, 'warning');
      return;
    }
    trackEvent('university_selected', { university: university.code, name: university.name });
    setSelectedUniversity(university);
  };

  const handleCourseSelection = (course) => {
    if (!selectedUniversity) return;
    const code = selectedUniversity.code;
    const current = selectedCourses[code] || [];
    const limit = getInstitutionCourseLimit(selectedUniversity.name);
    if (isCourseInPreviousOrders(code, course.name)) {
      showNotificationMessage(`Already applied to "${course.name}".`, 'warning');
      return;
    }
    if (current.includes(course.name)) {
      const updated = { ...selectedCourses, [code]: current.filter(c => c !== course.name) };
      if (updated[code].length === 0) delete updated[code];
      setSelectedCourses(updated);
      localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    } else {
      if (current.length >= limit) {
        showNotificationMessage(`${selectedUniversity.code} allows max ${limit} courses.`, 'warning');
        return;
      }
      const updated = { ...selectedCourses, [code]: [...current, course.name] };
      setSelectedCourses(updated);
      localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    }
  };

  const handleUniversityDeselect = (university, e) => {
    e.stopPropagation();
    const updated = { ...selectedCourses };
    delete updated[university.code];
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
  };

  const calculateMaximiseOptions = useCallback(async () => {
    if (!resultsUnlocked) return;
    setIsCalculatingMaximise(true);
    setMaximiseSuggestions([]);
    try {
      const marks = getStudentMarks();
      if (marks.length === 0) { showNotificationMessage('No marks found.', 'warning'); setIsCalculatingMaximise(false); return; }
      let allUnis = [];
      try {
        const res = await fetch(`${API_URL}/api/institutions-with-courses`);
        if (res.ok) {
          const insts = await res.json();
          const filtered = filterHiddenInstitutions(insts);
          allUnis = filtered.map(inst => {
            let logoInfo = universityLogos[inst.name];
            if (!logoInfo) {
              for (const [key, value] of Object.entries(universityLogos)) {
                if (inst.name?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(inst.name?.toLowerCase())) {
                  logoInfo = value; break;
                }
              }
            }
            return {
              id: inst.id, name: inst.name,
              code: logoInfo?.code || inst.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4),
              logo: logoInfo?.logo || `/${inst.code || 'university'}.jpeg`,
              courses: inst.courses || []
            };
          });
        }
      } catch (e) { allUnis = universities; }
      const selectedCodes = Object.keys(selectedCourses);
      const available = allUnis.filter(u => !selectedCodes.includes(u.code));
      if (available.length === 0) { showNotificationMessage('All universities already selected.', 'info'); setIsCalculatingMaximise(false); return; }
      const suggestions = [];
      for (const uni of available.slice(0, 15)) {
        try {
          const res = await fetch(`${API_URL}/api/eligible-courses-at-university`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ university_id: uni.id, subjects: marks, limit: 50 })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.eligible_courses?.length > 0) {
              suggestions.push({
                university: uni, eligibleCourses: data.eligible_courses,
                courseCount: Math.min(data.eligible_courses.length, getInstitutionCourseLimit(uni.name)),
                maxCourses: getInstitutionCourseLimit(uni.name)
              });
            }
          }
        } catch (e) {}
      }
      suggestions.sort((a, b) => b.courseCount - a.courseCount);
      setMaximiseSuggestions(suggestions);
      setShowMaximiseModal(true);
    } catch (e) { showNotificationMessage('Error finding options.', 'error'); }
    finally { setIsCalculatingMaximise(false); }
  }, [universities, selectedCourses, getStudentMarks, getInstitutionCourseLimit, universityLogos, showNotificationMessage, resultsUnlocked]);

  const handleUniversityClickInMaximise = (suggestion) => {
    setExpandedUniversity(suggestion);
    setUniversitySearchQuery('');
    setFilteredUniversityCourses(suggestion.eligibleCourses);
    setCourseTypeFilter('all');
    setTempSelections({ [suggestion.university.code]: selectedCourses[suggestion.university.code] || [] });
  };

  const toggleTempCourse = (code, course) => {
    setTempSelections(prev => {
      const current = prev[code] || [];
      if (current.includes(course.name)) return { ...prev, [code]: current.filter(c => c !== course.name) };
      const uni = expandedUniversity?.university;
      if (uni && current.length >= getInstitutionCourseLimit(uni.name)) {
        showNotificationMessage(`Max ${getInstitutionCourseLimit(uni.name)} courses at ${uni.name}`, 'warning');
        return prev;
      }
      return { ...prev, [code]: [...current, course.name] };
    });
  };

  const saveTempSelections = () => {
    if (!expandedUniversity) return;
    const uni = expandedUniversity.university;
    const code = uni.code;
    const temp = tempSelections[code] || [];
    const isNew = !selectedCourses[code];
    const newTotal = Object.keys(selectedCourses).length + (isNew ? 1 : 0);
    if (isNew && isTermSaleActive && newTotal > TERM_SALE_UNI_COUNT) {
      showNotificationMessage(`3rd Term Sale limited to ${TERM_SALE_UNI_COUNT} universities.`, 'warning');
      return;
    }
    const updated = { ...selectedCourses, [code]: temp };
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    setExpandedUniversity(null);
    setTempSelections({});
    if (temp.length > 0) showNotificationMessage(`Saved ${uni.code}`, 'success');
  };

  const findAlternativeCourses = useCallback(async (university) => {
    setAlternativeUniversity(university);
    const marks = getStudentMarks();
    if (marks.length === 0) { showNotificationMessage('No marks found.', 'warning'); return; }
    try {
      const res = await fetch(`${API_URL}/api/eligible-courses-at-university`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ university_id: university.id, subjects: marks, exclude_courses: [...selectedCourseNames, ...(selectedCourses[university.code] || [])] })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.eligible_courses?.length > 0) {
          setAvailableAlternatives(data.eligible_courses);
          setShowAlternativeModal(true);
        } else {
          showNotificationMessage(`No additional courses found at ${university.code}.`, 'info');
        }
      } else {
        showNotificationMessage('Could not check eligibility.', 'error');
      }
    } catch (e) { showNotificationMessage('Network error.', 'error'); }
  }, [getStudentMarks, selectedCourseNames, selectedCourses, showNotificationMessage]);

  const handleAlternativeSelect = (course) => {
    const uni = alternativeUniversity || selectedUniversity;
    if (!uni) return;
    const code = uni.code;
    const current = selectedCourses[code] || [];
    const limit = getInstitutionCourseLimit(uni.name);
    if (current.includes(course.name)) { showNotificationMessage('Course already selected', 'warning'); return; }
    if (current.length >= limit) { showNotificationMessage(`Max ${limit} courses at ${uni.code}`, 'warning'); return; }
    const updated = { ...selectedCourses, [code]: [...current, course.name] };
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    showNotificationMessage(`Added "${course.name}" to ${uni.code}`, 'success');
  };

  const handleAlternativeDone = () => { setShowAlternativeModal(false); setAlternativeUniversity(null); };

  const savePaymentSelectionToDatabase = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    setIsSavingSelection(true);
    try {
      const universitiesData = Object.entries(selectedCourses).map(([code, courses]) => {
        const uni = universities.find(u => u.code === code);
        return { code, name: uni?.name || code, courses };
      });
      const totalCourses = Object.values(selectedCourses).reduce((sum, courses) => sum + courses.length, 0);
      const totalUniversities = Object.keys(selectedCourses).length;
      const cost = totalCost;
      const applicationSummary = { package: isTermSaleActive ? 'term_sale' : 'per_university', isTermSale: isTermSaleActive, universities: universitiesData, totalCourses, totalUniversities, totalCost: cost, courseDetails: {} };
      sessionStorage.setItem('pendingApplicationSummary', JSON.stringify(applicationSummary));
      const response = await fetch(`${API_URL}/api/payment/save-selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ selectedPackage: isTermSaleActive ? 'term_sale' : 'per_university', isTermSale: isTermSaleActive, universities: universitiesData, totalCourses, totalUniversities, totalCost: cost, courseDetails: {} })
      });
      const data = await response.json();
      if (data.success) { localStorage.setItem('trackingNumber', data.trackingNumber); return data.trackingNumber; }
      return 'pending-' + Date.now();
    } catch (error) { return 'pending-' + Date.now(); }
    finally { setIsSavingSelection(false); }
  };

  const handleApply = async () => {
    const selectedCount = Object.keys(selectedCourses).length;
    if (selectedCount === 0) { showNotificationMessage('Select at least one university.', 'warning'); return; }
    if (universitiesWithCourses === 0) { showNotificationMessage('Select at least one course.', 'warning'); return; }
    if (isTermSaleActive && selectedCount !== TERM_SALE_UNI_COUNT) { showNotificationMessage(`3rd Term Sale requires exactly ${TERM_SALE_UNI_COUNT} universities.`, 'warning'); return; }
    trackEvent('payment_initiated', { pricingType: isTermSaleActive ? 'term_sale' : 'per_university', price: totalCost, universityCount: selectedUniCount, courseCount: totalApplications });
    await savePaymentSelectionToDatabase();
    setShowPaymentPopup(true);
  };

  const handlePaymentComplete = async (result) => {
    if (isProcessingComplete) return;
    setIsProcessingComplete(true);
    try {
      setShowPaymentPopup(false);
      if (result.showCredentials) { setAccountUsername(result.username); setAccountPassword(result.password); setShowCredentialsModal(true); }
      if (result.success) {
        localStorage.setItem('userProfile', JSON.stringify({ pricingType: isTermSaleActive ? 'term_sale' : 'per_university', isTermSale: isTermSaleActive, amount: totalCost, universities: Object.entries(selectedCourses).map(([code, courses]) => { const uni = universities.find(u => u.code === code); return { code, name: uni?.name, courses }; }), courses: selectedCourses, transactionId: result.transactionId }));
        localStorage.removeItem('selectedUniversityCourses');
        localStorage.removeItem('isTermSaleActive');
        showNotificationMessage('Application submitted! We will process it shortly.', 'success');
      }
    } catch (e) { showNotificationMessage('Something went wrong.', 'error'); }
    finally { setTimeout(() => setIsProcessingComplete(false), 2000); }
  };

  // R19 payment - creates checkout, opens Yoco link, polls backend
  const handleR19Payment = async () => {
    setIsPayingR19(true);
    setR19Error('');

    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const createResponse = await fetch(`${API_URL}/api/payment/create-r19-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 19,
          email: user.email || '',
          name: `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Student'
        })
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create payment');
      }

      localStorage.setItem('r19_checkout_id', createData.checkoutId);
      localStorage.setItem('r19_payment_pending', 'true');

      window.open(createData.redirectUrl, '_blank');

      setR19Error('Complete payment in the opened tab. Waiting for confirmation...');

      const interval = setInterval(async () => {
        try {
          const verifyResponse = await fetch(`${API_URL}/api/payment/verify-r19-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ checkoutId: createData.checkoutId })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success && verifyData.status === 'completed') {
            clearInterval(interval);
            setPollingInterval(null);
            localStorage.setItem('r19_paid', 'true');
            localStorage.removeItem('r19_payment_pending');
            localStorage.removeItem('r19_checkout_id');
            setResultsUnlocked(true);
            setShowR19Paywall(false);
            setIsPayingR19(false);
            setR19Error('');
            trackEvent('r19_payment_complete', { universityCount: totalFound });
            showNotificationMessage('Results unlocked!', 'success');
          }
        } catch (e) {
          // Keep polling
        }
      }, 3000);

      setPollingInterval(interval);

      setTimeout(() => {
        clearInterval(interval);
        setPollingInterval(null);
        if (!resultsUnlocked) {
          setIsPayingR19(false);
          setR19Error('Payment not confirmed. Please try again.');
        }
      }, 300000);

    } catch (error) {
      setR19Error(error.message || 'Payment failed. Please try again.');
      setIsPayingR19(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const availableForSelected = selectedUniversity ? getAvailableCoursesForUniversity(selectedUniversity) : [];
  const currentForSelected = selectedUniversity ? (selectedCourses[selectedUniversity.code] || []) : [];
  const maxForSelected = selectedUniversity ? getInstitutionCourseLimit(selectedUniversity.name) : 0;
  const remainingToSelect = maxForSelected - currentForSelected.length;

  if (isCheckingR19) {
    return (
      <div className="simple-payment-page">
        <div className="simple-payment-container">
          <div className="simple-loading">
            <FaSpinner className="spinner" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-payment-page">
      {/* Profile Icon with Dropdown */}
      {localStorage.getItem('authToken') && (
        <div className="profile-dropdown-wrapper">
          <button 
            className="profile-icon-btn" 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            title="Account"
          >
            <FaUserCircle />
          </button>
          {showProfileDropdown && (
            <div className="profile-dropdown-menu">
              <button className="profile-dropdown-item" onClick={handleProfileClick}>
                <FaUser /> Profile
              </button>
              <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      )}

      {showR19Paywall && (
        <div className="r19-fullscreen-paywall">
          <div className="r19-paywall-card">
            <FaCheckCircle className="r19-paywall-icon" />
            <h2>See Your Results</h2>
            <p>Skolify has found <strong>{totalFound}</strong> {totalFound === 1 ? 'university' : 'universities'} you qualify for. Pay R19 to unlock all details.</p>
            
            {r19Error && (
              <div className="r19-error-message">{r19Error}</div>
            )}
            
            <button 
              className="r19-paywall-btn" 
              onClick={handleR19Payment}
              disabled={isPayingR19}
            >
              {isPayingR19 ? (
                <><FaSpinner className="spinner-icon" /> Processing...</>
              ) : (
                <><FaCreditCard /> Pay R19 — Unlock Results</>
              )}
            </button>
            <p className="r19-secure-text">🔒 Secure payment via Yoco</p>
          </div>
        </div>
      )}

      <div className={`simple-payment-container ${!resultsUnlocked ? 'blurred-content' : ''}`}>
        <div className="simple-hero">
          <div className="hero-icon-wrapper">
            <FaCheckCircle className="hero-check-icon" />
          </div>
          <h1 className="simple-hero-title">
            Congratulations<br />
            <span className="simple-hero-text">Skolify has found <span className="simple-hero-highlight">{totalFound}</span> Universities</span>
          </h1>
        </div>

        {universities.length > 0 && (
          <div className="maximise-banner">
            <FaMagic className="maximise-icon" />
            <div className="maximise-text">
              <h4>Explore all qualifying universities</h4>
              <p>See all other universities where you qualify for courses</p>
            </div>
            <button className="maximise-btn" onClick={calculateMaximiseOptions} disabled={isCalculatingMaximise || !resultsUnlocked}>
              {isCalculatingMaximise ? <><FaSpinner className="spinner-icon" /> Loading...</> : <><FaMagic /> Explore</>}
            </button>
          </div>
        )}

        <div className="simple-usage-stats">
          <span>Universities: {selectedUniCount}{isTermSaleActive ? `/${TERM_SALE_UNI_COUNT}` : ''}</span>
          <span>Courses: {totalApplications}</span>
          <span className="total-cost-display">Total: R{totalCost}</span>
        </div>

        {isLoading ? (
          <div className="simple-loading"><FaSpinner className="spinner" /><p>Loading universities...</p></div>
        ) : (
          <>
            {noFeeUniversities.length > 0 && (
              <div className="simple-uni-group no-fee-group">
                <div className="simple-group-header">
                  <span className="simple-group-title">No Application Fee</span>
                  <FaInfoCircle className="simple-group-info" onClick={() => { if (resultsUnlocked) { setFeeInfoGroup('A'); setShowFeeInfo(true); } }} />
                </div>
                <div className="simple-universities-grid">
                  {noFeeUniversities.map(uni => {
                    const isSelected = selectedCourses[uni.code]?.length > 0;
                    const courseCount = selectedCourses[uni.code]?.length || 0;
                    const isFull = isTermSaleActive && selectedUniCount >= TERM_SALE_UNI_COUNT && !isSelected;
                    const isPrev = isUniversityInPreviousOrders(uni.code, uni.name);
                    const disabled = isFull || isPrev || !resultsUnlocked;
                    return (
                      <div key={uni.id} className={`simple-uni-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && handleUniversityClick(uni)}>
                        <div className="simple-uni-logo">
                          {uni.logo ? <img src={uni.logo} alt={uni.code} className="uni-logo-img" onError={(e) => { e.target.style.display = 'none'; }} /> : <span>{uni.code?.slice(0, 2)}</span>}
                        </div>
                        <div className="simple-uni-name">{uni.code}</div>
                        {isPrev && <div className="simple-uni-badge prev-badge"><FaLock size={10} /> Applied</div>}
                        {isSelected && !isPrev && <div className="simple-uni-badge">{courseCount}/{getInstitutionCourseLimit(uni.name)}</div>}
                        {isSelected && resultsUnlocked && <div className="simple-uni-check" onClick={(e) => handleUniversityDeselect(uni, e)}><FaTimes /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {feeUniversities.length > 0 && (
              <div className="simple-uni-group fee-group">
                <div className="simple-group-header">
                  <span className="simple-group-title">Application Fee Required</span>
                  <FaInfoCircle className="simple-group-info" onClick={() => { if (resultsUnlocked) { setFeeInfoGroup('B'); setShowFeeInfo(true); } }} />
                </div>
                <div className="simple-universities-grid">
                  {feeUniversities.map(uni => {
                    const isSelected = selectedCourses[uni.code]?.length > 0;
                    const courseCount = selectedCourses[uni.code]?.length || 0;
                    const isFull = isTermSaleActive && selectedUniCount >= TERM_SALE_UNI_COUNT && !isSelected;
                    const isPrev = isUniversityInPreviousOrders(uni.code, uni.name);
                    const disabled = isFull || isPrev || !resultsUnlocked;
                    return (
                      <div key={uni.id} className={`simple-uni-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && handleUniversityClick(uni)}>
                        <div className="simple-uni-logo">
                          {uni.logo ? <img src={uni.logo} alt={uni.code} className="uni-logo-img" onError={(e) => { e.target.style.display = 'none'; }} /> : <span>{uni.code?.slice(0, 2)}</span>}
                        </div>
                        <div className="simple-uni-name">{uni.code}</div>
                        {isPrev && <div className="simple-uni-badge prev-badge"><FaLock size={10} /> Applied</div>}
                        {isSelected && !isPrev && <div className="simple-uni-badge">{courseCount}/{getInstitutionCourseLimit(uni.name)}</div>}
                        {isSelected && resultsUnlocked && <div className="simple-uni-check" onClick={(e) => handleUniversityDeselect(uni, e)}><FaTimes /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {Object.keys(selectedCourses).length > 0 && (
          <div className="selected-courses-summary">
            <h4 className="selected-courses-title">Your Chosen Courses</h4>
            {Object.entries(selectedCourses).map(([code, courses]) => {
              const uni = universities.find(u => u.code === code);
              return (
                <div key={code} className="selected-uni-row">
                  <span className="selected-uni-code">{uni?.code || code}</span>
                  <span className="selected-uni-courses">
                    {courses.map((course, idx) => (
                      <span key={idx} className="selected-course-tag"><FaBook className="selected-course-icon" />{course}</span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!isTermSaleActive && (
          <div className="regular-pricing-info">
            <span>R{PRICE_PER_UNI} per university application (N.B Skolify does not cover application fees)</span>
          </div>
        )}

        <div className="bottom-checkout-section">
          <div className={`term-sale-banner ${isTermSaleActive ? 'active' : ''}`} onClick={handleTermSaleToggle}>
            <div className="term-sale-content">
              <div className="term-sale-left">
                <FaTag className="term-sale-tag-icon" />
                <div className="term-sale-text">
                  <span className="term-sale-label">3rd Term Sale</span>
                  <span className="term-sale-desc">4 universities + free NSFAS</span>
                </div>
              </div>
              <div className="term-sale-right">
                <span className="term-sale-price">R{TERM_SALE_PRICE}</span>
                <div className={`term-select-dot ${isTermSaleActive ? 'filled' : ''}`}></div>
              </div>
            </div>
          </div>

          <div className="apply-section-inline">
            <button className="primary-btn-full" onClick={handleApply} disabled={isSavingSelection || !resultsUnlocked}>
              {isSavingSelection ? <><FaSpinner className="spinner-icon" /> Saving...</> : 'Apply'}
            </button>
          </div>
        </div>

        <div className="contact-support">
          <p className="contact-message">Need help? Contact <a href="mailto:skolifyteam@gmail.com" className="support-link">skolifyteam@gmail.com</a></p>
        </div>

        <footer className="dashboard-footer">
          <div className="footer-links">
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms & Conditions</a>
            <span className="footer-separator">|</span>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
          </div>
          <p className="copyright">© {new Date().getFullYear()} Skolify. All rights reserved.</p>
        </footer>
      </div>

      {selectedUniversity && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={() => setSelectedUniversity(null)}></div>
          <div className="courses-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header">
              <div className="modal-university-info">
                <h3>Select Courses for {selectedUniversity.code}</h3>
                <p>Choose {maxForSelected} course{maxForSelected > 1 ? 's' : ''} • {currentForSelected.length}/{maxForSelected} selected</p>
              </div>
              <button className="close-courses-modal" onClick={() => setSelectedUniversity(null)}><FaTimes /></button>
            </div>
            <div className="courses-modal-body">
              {availableForSelected.length > 0 || currentForSelected.length > 0 ? (
                <>
                  <div className="courses-list-grid">
                    {currentForSelected.map((courseName, idx) => {
                      const course = availableForSelected.find(c => c.name === courseName) || { name: courseName };
                      return (
                        <div key={`sel-${idx}`} className="course-item selected" onClick={() => handleCourseSelection(course)}>
                          <div className="course-item-content"><FaBook className="course-item-icon" /><span className="course-item-name">{course.name}</span><div className="course-item-check"><FaCheck /></div></div>
                        </div>
                      );
                    })}
                    {availableForSelected.filter(c => !currentForSelected.includes(c.name)).map((course, idx) => {
                      const isMaxed = currentForSelected.length >= maxForSelected;
                      const isPrev = isCourseInPreviousOrders(selectedUniversity.code, course.name);
                      return (
                        <div key={`avail-${idx}`} className={`course-item ${(isMaxed || isPrev) ? 'disabled' : ''}`} onClick={() => { if (!isMaxed && !isPrev) handleCourseSelection(course); }}>
                          <div className="course-item-content"><FaBook className="course-item-icon" /><span className="course-item-name">{course.name}</span><div className="course-item-check">{isPrev ? <FaLock /> : '+'}</div></div>
                          {isPrev && <div className="prev-course-note">Already applied</div>}
                        </div>
                      );
                    })}
                  </div>
                  {remainingToSelect > 0 && (
                    <div className="select-more-section">
                      <button className="select-more-btn" onClick={(e) => { e.stopPropagation(); const uni = selectedUniversity; setSelectedUniversity(null); setTimeout(() => findAlternativeCourses(uni), 200); }}>
                        <FaSearch /> Select {remainingToSelect} more Course{remainingToSelect > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-courses-message">
                  <p>None of your selected courses are available at {selectedUniversity.code}.</p>
                  <button className="alt-courses-btn" onClick={() => findAlternativeCourses(selectedUniversity)}><FaExchangeAlt /> Find Alternative Courses</button>
                </div>
              )}
            </div>
            <div className="courses-modal-footer">
              <div className="selected-courses-count">Selected: {currentForSelected.length}/{maxForSelected}</div>
              <button className="done-selecting-btn" onClick={() => setSelectedUniversity(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showAlternativeModal && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={handleAlternativeDone}></div>
          <div className="courses-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header alt-header">
              <div className="modal-university-info"><h3>More Courses at {alternativeUniversity?.code || selectedUniversity?.code}</h3><p>Select additional courses you qualify for</p></div>
              <button className="close-courses-modal" onClick={handleAlternativeDone}><FaTimes /></button>
            </div>
            <div className="courses-modal-body">
              {availableAlternatives.length > 0 ? (
                <div className="courses-list-grid">
                  {availableAlternatives.map((course, idx) => {
                    const uni = alternativeUniversity || selectedUniversity;
                    const isSelected = uni && (selectedCourses[uni.code] || []).includes(course.name);
                    return (
                      <div key={idx} className={`course-item ${isSelected ? 'selected' : ''}`} onClick={() => !isSelected && handleAlternativeSelect(course)}>
                        <div className="course-item-content"><FaBook className="course-item-icon" /><div className="course-name-wrap"><span className="course-item-name">{course.name}</span>{course.faculty_name && <div className="course-faculty-name">{course.faculty_name}</div>}</div><div className="course-item-check">{isSelected ? <FaCheck /> : '+'}</div></div>
                      </div>
                    );
                  })}
                </div>
              ) : (<div className="no-courses-message"><p>No additional courses found.</p></div>)}
            </div>
            <div className="courses-modal-footer"><button className="done-selecting-btn" onClick={handleAlternativeDone}>Done</button></div>
          </div>
        </div>
      )}

      {showMaximiseModal && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={() => { setShowMaximiseModal(false); setExpandedUniversity(null); }}></div>
          <div className="courses-modal-content maximise-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header">
              <div className="modal-university-info">
                {expandedUniversity ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><button onClick={() => setExpandedUniversity(null)} className="back-btn"><FaArrowLeft /></button><h3>{expandedUniversity.university.name}</h3></div>
                ) : (<h3><FaMagic style={{ marginRight: '8px' }} />Explore All Qualifying Universities</h3>)}
              </div>
              <button className="close-courses-modal" onClick={() => { setShowMaximiseModal(false); setExpandedUniversity(null); }}><FaTimes /></button>
            </div>
            <div className="courses-modal-body">
              {expandedUniversity ? (
                <>
                  <div className="search-box"><FaSearch className="search-icon" /><input type="text" placeholder="Search courses..." value={universitySearchQuery} onChange={(e) => { setUniversitySearchQuery(e.target.value); setFilteredUniversityCourses(expandedUniversity.eligibleCourses.filter(c => c.name.toLowerCase().includes(e.target.value.toLowerCase()))); }} className="search-input" /></div>
                  <div className="filter-row">
                    {['all', 'degree', 'diploma', 'certificate', 'online'].map(type => (
                      <button key={type} className={`filter-chip ${courseTypeFilter === type ? 'active' : ''}`} onClick={() => setCourseTypeFilter(type)}>
                        {type === 'all' ? 'All' : type === 'degree' ? 'Degree' : type === 'diploma' ? 'Diploma' : type === 'certificate' ? 'H. Cert' : 'Online'}
                      </button>
                    ))}
                  </div>
                  <div className="courses-list-grid">
                    {(universitySearchQuery ? filteredUniversityCourses : expandedUniversity.eligibleCourses).filter(c => {
                      if (courseTypeFilter === 'all') return true;
                      const n = c.name.toLowerCase();
                      if (courseTypeFilter === 'degree') return n.includes('bachelor') || n.includes('bcom') || n.includes('bsc');
                      if (courseTypeFilter === 'diploma') return n.includes('diploma');
                      if (courseTypeFilter === 'certificate') return n.includes('certificate');
                      if (courseTypeFilter === 'online') return n.includes('online');
                      return true;
                    }).map((course, idx) => {
                      const sel = tempSelections[expandedUniversity.university.code]?.includes(course.name);
                      return (
                        <div key={idx} className={`course-item ${sel ? 'selected' : ''}`} onClick={() => toggleTempCourse(expandedUniversity.university.code, course)}>
                          <div className="course-item-content"><FaBook className="course-item-icon" /><div className="course-name-wrap"><span className="course-item-name">{course.name}</span></div><div className="course-item-check">{sel ? <FaCheck /> : '+'}</div></div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {isCalculatingMaximise ? (
                    <div className="loading-state"><FaSpinner className="spinner-icon large" /><p>Finding universities...</p></div>
                  ) : maximiseSuggestions.length > 0 ? (
                    maximiseSuggestions.map((s, idx) => (
                      <div key={idx} className="suggestion-card">
                        <div className="suggestion-top">
                          <div className="suggestion-logo">{s.university.logo ? <img src={s.university.logo} alt="" /> : s.university.code?.slice(0, 2)}</div>
                          <div className="suggestion-info"><h4>{s.university.code}</h4><span>{s.courseCount} eligible course{s.courseCount > 1 ? 's' : ''}</span></div>
                        </div>
                        <div className="suggestion-actions"><button className="choose-btn" onClick={() => handleUniversityClickInMaximise(s)}>Choose Courses</button></div>
                      </div>
                    ))
                  ) : (<p className="empty-state">No new universities found.</p>)}
                </>
              )}
            </div>
            <div className="courses-modal-footer maximise-footer">
              {expandedUniversity ? (
                <><span>{(tempSelections[expandedUniversity.university.code]?.length || 0)}/{getInstitutionCourseLimit(expandedUniversity.university.name)} selected</span><button className="done-selecting-btn" onClick={saveTempSelections}>Save</button></>
              ) : (<button className="done-selecting-btn" onClick={() => { setShowMaximiseModal(false); setExpandedUniversity(null); }}>Done</button>)}
            </div>
          </div>
        </div>
      )}

      {showFeeInfo && (
        <div className="simple-fee-modal">
          <div className="simple-fee-overlay" onClick={() => setShowFeeInfo(false)}></div>
          <div className="simple-fee-content" onClick={(e) => e.stopPropagation()}>
            <div className={`simple-fee-header ${feeInfoGroup === 'A' ? 'header-green' : 'header-orange'}`}><h3>{feeInfoGroup === 'A' ? 'No Application Fee' : 'Application Fee Required'}</h3><button className="simple-fee-close" onClick={() => setShowFeeInfo(false)}>×</button></div>
            <div className="simple-fee-body"><p>{feeInfoGroup === 'A' ? 'These universities do not require an application fee.' : 'These universities require a non-refundable application fee. Not included in Skolify packages.'}</p></div>
            <div className="simple-fee-footer"><button className="simple-fee-btn" onClick={() => setShowFeeInfo(false)}>Got it</button></div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="notification-modal">
          <div className="notification-overlay" onClick={() => setShowNotification(false)}></div>
          <div className={`notification-content notification-${notificationType}`} onClick={(e) => e.stopPropagation()}>
            <div className="notification-header"><h3>{notificationType === 'success' ? 'Success' : notificationType === 'error' ? 'Error' : notificationType === 'warning' ? 'Warning' : 'Info'}</h3><button className="close-notification" onClick={() => setShowNotification(false)}>×</button></div>
            <div className="notification-body"><p>{notificationMessage}</p></div>
            <div className="notification-footer"><button className="notification-ok-btn" onClick={() => setShowNotification(false)}>OK</button></div>
          </div>
        </div>
      )}

      {showCredentialsModal && (
        <div className="credentials-modal">
          <div className="credentials-modal-overlay" onClick={() => setShowCredentialsModal(false)}></div>
          <div className="credentials-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="credentials-modal-header"><h3>Account Created!</h3><button className="close-credentials" onClick={() => setShowCredentialsModal(false)}>×</button></div>
            <div className="credentials-modal-body">
              <p>Save these credentials:</p>
              <div className="credentials-box">
                <div className="credential-row"><span>Username:</span><div className="credential-value"><strong>{accountUsername}</strong><button className="copy-btn" onClick={() => { navigator.clipboard.writeText(accountUsername); showNotificationMessage('Copied!', 'success'); }}><FaCopy /></button></div></div>
                <div className="credential-row"><span>Password:</span><div className="credential-value"><strong>{accountPassword}</strong><button className="copy-btn" onClick={() => { navigator.clipboard.writeText(accountPassword); showNotificationMessage('Copied!', 'success'); }}><FaCopy /></button></div></div>
              </div>
              <p className="credentials-warning">⚠️ Save these now.</p>
            </div>
            <div className="credentials-modal-footer"><button className="credentials-ok-btn" onClick={() => setShowCredentialsModal(false)}>I've Saved Them</button></div>
          </div>
        </div>
      )}

      <Money isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} totalAmount={totalCost} selectedPackage={isTermSaleActive ? 'term_sale' : 'per_university'} onPaymentComplete={handlePaymentComplete} />

      <button className="chatbot-floating-btn" onClick={() => window.open('https://wa.me/27822589917', '_blank')} title="Chat with us on WhatsApp">
        <FaCommentDots className="chatbot-msg-icon" />
      </button>
    </div>
  );
};

export default PaymentPage;