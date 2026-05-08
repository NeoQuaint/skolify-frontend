import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPage.css';
import Money from './Money';
import { FaUniversity, FaSpinner, FaCheck, FaTimes, FaInfoCircle, FaBook, FaCheckCircle, FaSearch, FaExchangeAlt, FaArrowLeft, FaMagic, FaLightbulb, FaCopy, FaHistory, FaLock, FaCommentDots } from 'react-icons/fa';
import API_URL from './config';

// Tracking helper
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
  const [selectedPackage, setSelectedPackage] = useState('premium');
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
  const [showSwitchPopup, setShowSwitchPopup] = useState(false);
  const [alternativeUniversity, setAlternativeUniversity] = useState(null);
  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [packageToApply, setPackageToApply] = useState(null);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

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
    'University of Free State': { code: 'UFS', logo: '/UFS.jpeg' },
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

  const packageLimits = useMemo(() => ({
    basic: { universities: 2 }, standard: { universities: 4 }, premium: { universities: 6 }
  }), []);

  const packagePrices = { basic: 169, standard: 329, premium: 499 };
  const packageNames = { basic: 'Basic Plan', standard: 'Standard Plan', premium: 'Premium Plan' };
  const packageDescriptions = {
    basic: 'Apply to 2 universities of your choice',
    standard: 'Apply to 4 universities of your choice',
    premium: 'Apply to 6 universities of your choice'
  };

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

  // Track page view
  useEffect(() => {
    trackEvent('page_view', { page: 'payment' });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
    const savedPackage = localStorage.getItem('selectedPackage');
    if (savedPackage) setSelectedPackage(savedPackage);
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
  const maxUnis = packageLimits[selectedPackage].universities;
  const totalApplications = Object.values(selectedCourses).reduce((sum, courses) => sum + (courses?.length || 0), 0);
  const showMaximiseBanner = selectedUniCount > 0 && selectedUniCount === maxUnis && maxUnis < 6;

  const handlePackageSelectConfirm = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem('selectedPackage', pkg);
    // Track package changed
    trackEvent('package_changed', { package: pkg, price: packagePrices[pkg] });
    const current = Object.keys(selectedCourses).length;
    const newLimit = packageLimits[pkg].universities;
    if (current > newLimit) {
      const codes = Object.keys(selectedCourses);
      const updated = { ...selectedCourses };
      for (let i = newLimit; i < codes.length; i++) delete updated[codes[i]];
      setSelectedCourses(updated);
      localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    }
  };

  const handlePackageClick = (pkg) => {
    setPackageToApply(pkg);
    setShowPackagePopup(true);
  };

  const confirmPackageSelection = () => {
    setShowPackagePopup(false);
    if (packageToApply) {
      handlePackageSelectConfirm(packageToApply);
      setPackageToApply(null);
    }
  };

  const handleUniversityClick = (university) => {
    if (isUniversityInPreviousOrders(university.code, university.name)) {
      showNotificationMessage(`You've already applied to ${university.code} in a previous order.`, 'warning');
      return;
    }
    const isAlreadySelected = selectedCourses[university.code]?.length > 0;
    if (selectedUniCount >= maxUnis && !isAlreadySelected) {
      setShowSwitchPopup(true);
      return;
    }
    // Track university selected
    trackEvent('university_selected', { university: university.code, name: university.name });
    setSelectedUniversity(university);
  };

  const handleCourseSelection = (course) => {
    if (!selectedUniversity) return;
    const code = selectedUniversity.code;
    const current = selectedCourses[code] || [];
    const limit = getInstitutionCourseLimit(selectedUniversity.name);

    if (isCourseInPreviousOrders(code, course.name)) {
      showNotificationMessage(`Already applied to "${course.name}" in a previous order.`, 'warning');
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
  }, [universities, selectedCourses, getStudentMarks, getInstitutionCourseLimit, universityLogos, showNotificationMessage]);

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
    const limit = getInstitutionCourseLimit(uni.name);
    if (temp.length !== limit) { showNotificationMessage(`Select exactly ${limit} courses for ${uni.name}`, 'warning'); return; }
    const isNew = !selectedCourses[code];
    const newTotal = Object.keys(selectedCourses).length + (isNew ? 1 : 0);
    if (isNew && newTotal > maxUnis) { setShowSwitchPopup(true); setShowMaximiseModal(false); setExpandedUniversity(null); setTempSelections({}); return; }
    const updated = { ...selectedCourses, [code]: temp };
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    setShowMaximiseModal(false); setExpandedUniversity(null); setTempSelections({});
    showNotificationMessage(`Saved ${uni.code}`, 'success');
  };

  const applyMaximiseSuggestion = (suggestion) => {
    const uni = suggestion.university;
    const courses = suggestion.eligibleCourses.slice(0, getInstitutionCourseLimit(uni.name));
    const isNew = !selectedCourses[uni.code];
    const newTotal = Object.keys(selectedCourses).length + (isNew ? 1 : 0);
    if (isNew && newTotal > maxUnis) { setShowSwitchPopup(true); setShowMaximiseModal(false); return; }
    const updated = { ...selectedCourses, [uni.code]: courses.map(c => c.name) };
    setSelectedCourses(updated);
    localStorage.setItem('selectedUniversityCourses', JSON.stringify(updated));
    setShowMaximiseModal(false);
    showNotificationMessage(`Added ${uni.code}`, 'success');
  };

  const findAlternativeCourses = useCallback(async (university) => {
    setAlternativeUniversity(university);
    const marks = getStudentMarks();

    if (marks.length === 0) {
      showNotificationMessage('No marks found. Please enter your marks first.', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/eligible-courses-at-university`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          university_id: university.id, 
          subjects: marks,
          exclude_courses: [...selectedCourseNames, ...(selectedCourses[university.code] || [])]
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.eligible_courses?.length > 0) {
          setAvailableAlternatives(data.eligible_courses);
          setShowAlternativeModal(true);
        } else {
          showNotificationMessage(`No additional eligible courses found at ${university.code}.`, 'info');
        }
      } else {
        showNotificationMessage('Could not check eligibility. Please try again.', 'error');
      }
    } catch (e) {
      console.error('Error finding alternatives:', e);
      showNotificationMessage('Network error. Please try again.', 'error');
    }
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
    setShowAlternativeModal(false);
    setAlternativeUniversity(null);
    showNotificationMessage(`Added "${course.name}" to ${uni.code}`, 'success');
  };

  const savePaymentSelectionToDatabase = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('⚠️ No auth token, cannot save selection');
      return;
    }

    setIsSavingSelection(true);

    try {
      const universitiesData = Object.entries(selectedCourses).map(([code, courses]) => {
        const uni = universities.find(u => u.code === code);
        return { code, name: uni?.name || code, courses };
      });

      const totalCourses = Object.values(selectedCourses).reduce((sum, courses) => sum + courses.length, 0);
      const totalUniversities = Object.keys(selectedCourses).length;
      const totalCost = packagePrices[selectedPackage];

      const response = await fetch(`${API_URL}/api/payment/save-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selectedPackage,
          universities: universitiesData,
          totalCourses,
          totalUniversities,
          totalCost,
          courseDetails: {}
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('trackingNumber', data.trackingNumber);
        return data.trackingNumber;
      } else {
        showNotificationMessage('Failed to save your selections. Please try again.', 'error');
        return null;
      }
    } catch (error) {
      showNotificationMessage('Network error. Please check your connection.', 'error');
      return null;
    } finally {
      setIsSavingSelection(false);
    }
  };

  const handleApply = async () => {
    const selectedCount = Object.keys(selectedCourses).length;
    const limit = packageLimits[selectedPackage].universities;
    if (selectedCount < limit) { showNotificationMessage(`Select ${limit - selectedCount} more universit${limit - selectedCount > 1 ? 'ies' : 'y'}.`, 'warning'); return; }
    if (selectedCount > limit) { showNotificationMessage(`Too many universities. Upgrade or remove some.`, 'warning'); return; }
    for (const [code, courses] of Object.entries(selectedCourses)) {
      const uni = universities.find(u => u.code === code);
      if (uni && courses.length !== getInstitutionCourseLimit(uni.name)) {
        showNotificationMessage(`${uni.code}: select ${getInstitutionCourseLimit(uni.name)} courses.`, 'warning'); return;
      }
    }

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
        localStorage.setItem('userProfile', JSON.stringify({
          package: selectedPackage, amount: packagePrices[selectedPackage],
          universities: Object.entries(selectedCourses).map(([code, courses]) => {
            const uni = universities.find(u => u.code === code);
            return { code, name: uni?.name, courses };
          }),
          courses: selectedCourses, transactionId: result.transactionId
        }));
        localStorage.removeItem('selectedUniversityCourses');
        localStorage.removeItem('selectedPackage');
        showNotificationMessage(`Payment successful!`, 'success');
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (e) { showNotificationMessage('Something went wrong.', 'error'); }
    finally { setTimeout(() => setIsProcessingComplete(false), 2000); }
  };

  const progressPercent = 75;
  const availableForSelected = selectedUniversity ? getAvailableCoursesForUniversity(selectedUniversity) : [];
  const currentForSelected = selectedUniversity ? (selectedCourses[selectedUniversity.code] || []) : [];
  const maxForSelected = selectedUniversity ? getInstitutionCourseLimit(selectedUniversity.name) : 0;
  const remainingToSelect = maxForSelected - currentForSelected.length;

  return (
    <div className="simple-payment-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="simple-payment-container">
        {isCreatingNewOrder && previousSelections.length > 0 && (
          <div className="previous-orders-banner">
            <FaHistory className="previous-icon" />
            <div className="previous-text">
              <h4>Creating New Order</h4>
              <p>Previously applied universities are locked.</p>
            </div>
            <button className="view-orders-btn" onClick={() => navigate('/profile')}>View Orders</button>
          </div>
        )}

        {showMaximiseBanner && (
          <div className="maximise-banner">
            <FaLightbulb className="maximise-icon" />
            <div className="maximise-text">
              <h4>Maximise your options</h4>
              <p>Upgrade to add more universities and improve your chances</p>
            </div>
            <button className="maximise-btn" onClick={calculateMaximiseOptions} disabled={isCalculatingMaximise}>
              {isCalculatingMaximise ? <><FaSpinner className="spinner-icon" /> Loading...</> : <><FaMagic /> Upgrade</>}
            </button>
          </div>
        )}

        <div className="simple-hero">
          <div className="hero-icon-wrapper">
            <FaCheckCircle className="hero-check-icon" />
          </div>
          <h1 className="simple-hero-title">
            Congratulations<br />
            <span className="simple-hero-text">Skolify has found <span className="simple-hero-highlight">{totalFound}</span> Universities</span>
          </h1>
        </div>

        <div className="simple-selection-section">
          <p className="simple-selection-label">choose number of universities you want to apply to</p>
          <div className="simple-number-options">
            {['basic', 'standard', 'premium'].map(pkgKey => (
              <button key={pkgKey} className={`simple-number-btn ${selectedPackage === pkgKey ? 'active' : ''}`} onClick={() => handlePackageClick(pkgKey)}>
                {packageLimits[pkgKey].universities}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="simple-loading"><FaSpinner className="spinner" /><p>Loading universities...</p></div>
        ) : (
          <>
            {noFeeUniversities.length > 0 && (
              <div className="simple-uni-group">
                <div className="simple-group-header">
                  <span className="simple-group-title">No Application Fee</span>
                  <FaInfoCircle className="simple-group-info" onClick={() => { setFeeInfoGroup('A'); setShowFeeInfo(true); }} />
                </div>
                <div className="simple-universities-grid">
                  {noFeeUniversities.map(uni => {
                    const isSelected = selectedCourses[uni.code]?.length > 0;
                    const courseCount = selectedCourses[uni.code]?.length || 0;
                    const isFull = selectedUniCount >= maxUnis && !isSelected;
                    const isPrev = isUniversityInPreviousOrders(uni.code, uni.name);
                    const disabled = isFull || isPrev;
                    return (
                      <div key={uni.id} className={`simple-uni-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && handleUniversityClick(uni)}>
                        <div className="simple-uni-logo">
                          {uni.logo ? <img src={uni.logo} alt={uni.code} className="uni-logo-img" onError={(e) => { e.target.style.display = 'none'; }} /> : <span>{uni.code?.slice(0, 2)}</span>}
                        </div>
                        <div className="simple-uni-name">{uni.code}</div>
                        {isPrev && <div className="simple-uni-badge prev-badge"><FaLock size={10} /> Applied</div>}
                        {isSelected && !isPrev && <div className="simple-uni-badge">{courseCount}/{getInstitutionCourseLimit(uni.name)}</div>}
                        {isSelected && <div className="simple-uni-check" onClick={(e) => handleUniversityDeselect(uni, e)}><FaTimes /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {feeUniversities.length > 0 && (
              <div className="simple-uni-group">
                <div className="simple-group-header">
                  <span className="simple-group-title">Application Fee Required</span>
                  <FaInfoCircle className="simple-group-info" onClick={() => { setFeeInfoGroup('B'); setShowFeeInfo(true); }} />
                </div>
                <div className="simple-universities-grid">
                  {feeUniversities.map(uni => {
                    const isSelected = selectedCourses[uni.code]?.length > 0;
                    const courseCount = selectedCourses[uni.code]?.length || 0;
                    const isFull = selectedUniCount >= maxUnis && !isSelected;
                    const isPrev = isUniversityInPreviousOrders(uni.code, uni.name);
                    const disabled = isFull || isPrev;
                    return (
                      <div key={uni.id} className={`simple-uni-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && handleUniversityClick(uni)}>
                        <div className="simple-uni-logo">
                          {uni.logo ? <img src={uni.logo} alt={uni.code} className="uni-logo-img" onError={(e) => { e.target.style.display = 'none'; }} /> : <span>{uni.code?.slice(0, 2)}</span>}
                        </div>
                        <div className="simple-uni-name">{uni.code}</div>
                        {isPrev && <div className="simple-uni-badge prev-badge"><FaLock size={10} /> Applied</div>}
                        {isSelected && !isPrev && <div className="simple-uni-badge">{courseCount}/{getInstitutionCourseLimit(uni.name)}</div>}
                        {isSelected && <div className="simple-uni-check" onClick={(e) => handleUniversityDeselect(uni, e)}><FaTimes /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="simple-usage-stats">
          <span>Universities: {selectedUniCount}/{maxUnis}</span>
          <span>Courses: {totalApplications}</span>
        </div>

        <div className="apply-section-inline">
          <button className="primary-btn-full" onClick={handleApply} disabled={isSavingSelection}>
            {isSavingSelection ? <><FaSpinner className="spinner-icon" /> Saving...</> : 'Apply'}
          </button>
        </div>

        <div className="contact-support">
          <p className="contact-message">
            Need help? Contact our support team at{' '}
            <a href="mailto:skolifyteam@gmail.com" className="support-link">skolifyteam@gmail.com</a>
          </p>
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

      {/* WELCOME PACKAGE MODAL */}
      {showWelcomeModal && (
        <div className="package-modal-overlay" onClick={() => setShowWelcomeModal(false)}>
          <div className="package-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="package-modal-close" onClick={() => setShowWelcomeModal(false)}>×</button>
            
            <div className="package-modal-hero">
              <FaCheckCircle className="package-modal-check" />
              <h2>Congratulations</h2>
              <p>Skolify found <strong>{totalFound}</strong></p>
            </div>
            
            <p className="package-modal-question">How many universities would you like to apply to?</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
              {['basic', 'standard', 'premium'].map(pkgKey => (
                <button
                  key={pkgKey}
                  className={`simple-number-btn ${selectedPackage === pkgKey ? 'active' : ''}`}
                  onClick={() => handlePackageSelectConfirm(pkgKey)}
                >
                  {packageLimits[pkgKey].universities}
                </button>
              ))}
            </div>
            
            <button className="package-modal-continue" onClick={() => setShowWelcomeModal(false)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* PACKAGE POPUP */}
      {showPackagePopup && (
        <div className="package-popup-overlay" onClick={() => setShowPackagePopup(false)}>
          <div className="package-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="package-popup-close" onClick={() => setShowPackagePopup(false)}>×</button>
            <div className="package-popup-hero">
              <FaCheckCircle className="package-popup-check" />
              <h2>Congratulations</h2>
              <p>Skolify found <strong>{totalFound}</strong></p>
            </div>
            <div className="package-popup-number">{packageLimits[packageToApply]?.universities || ''}</div>
            <h3 className="package-popup-name">{packageNames[packageToApply] || ''}</h3>
            <div className="package-popup-price">R{packagePrices[packageToApply] || ''}</div>
            <p className="package-popup-desc">{packageDescriptions[packageToApply] || ''}</p>
            <button className="package-popup-apply" onClick={confirmPackageSelection}>Apply</button>
          </div>
        </div>
      )}

      {/* COURSES MODAL */}
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
                          <div className="course-item-content">
                            <FaBook className="course-item-icon" />
                            <span className="course-item-name">{course.name}</span>
                            <div className="course-item-check"><FaCheck /></div>
                          </div>
                        </div>
                      );
                    })}
                    {availableForSelected.filter(c => !currentForSelected.includes(c.name)).map((course, idx) => {
                      const isMaxed = currentForSelected.length >= maxForSelected;
                      const isPrev = isCourseInPreviousOrders(selectedUniversity.code, course.name);
                      return (
                        <div key={`avail-${idx}`} className={`course-item ${(isMaxed || isPrev) ? 'disabled' : ''}`} onClick={() => { if (!isMaxed && !isPrev) handleCourseSelection(course); }}>
                          <div className="course-item-content">
                            <FaBook className="course-item-icon" />
                            <span className="course-item-name">{course.name}</span>
                            <div className="course-item-check">{isPrev ? <FaLock /> : '+'}</div>
                          </div>
                          {isPrev && <div className="prev-course-note">Already applied</div>}
                        </div>
                      );
                    })}
                  </div>
                  {remainingToSelect > 0 && (
                    <div className="select-more-section">
                      <button className="select-more-btn" onClick={() => { setSelectedUniversity(null); setTimeout(() => findAlternativeCourses(selectedUniversity), 200); }}>
                        <FaSearch /> Select {remainingToSelect} more Course{remainingToSelect > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-courses-message">
                  <p>None of your selected courses are available at {selectedUniversity.code}.</p>
                  <button className="alt-courses-btn" onClick={() => findAlternativeCourses(selectedUniversity)}>
                    <FaExchangeAlt /> Find Alternative Courses
                  </button>
                </div>
              )}
            </div>
            <div className="courses-modal-footer">
              <div className="selected-courses-count">Selected: {currentForSelected.length}/{maxForSelected}</div>
              <button className="done-selecting-btn" onClick={() => setSelectedUniversity(null)} disabled={currentForSelected.length !== maxForSelected}>
                {currentForSelected.length === maxForSelected ? 'Done' : `Select ${remainingToSelect} more`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE COURSES MODAL */}
      {showAlternativeModal && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={() => { setShowAlternativeModal(false); setAlternativeUniversity(null); }}></div>
          <div className="courses-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header alt-header">
              <div className="modal-university-info">
                <h3>More Courses at {alternativeUniversity?.code || selectedUniversity?.code}</h3>
                <p>Select additional courses you qualify for</p>
              </div>
              <button className="close-courses-modal" onClick={() => { setShowAlternativeModal(false); setAlternativeUniversity(null); }}><FaTimes /></button>
            </div>
            <div className="courses-modal-body">
              {availableAlternatives.length > 0 ? (
                <div className="courses-list-grid">
                  {availableAlternatives.map((course, idx) => {
                    const uni = alternativeUniversity || selectedUniversity;
                    const isSelected = uni && (selectedCourses[uni.code] || []).includes(course.name);
                    return (
                      <div key={idx} className={`course-item ${isSelected ? 'selected' : ''}`} onClick={() => !isSelected && handleAlternativeSelect(course)}>
                        <div className="course-item-content">
                          <FaBook className="course-item-icon" />
                          <div className="course-name-wrap">
                            <span className="course-item-name">{course.name}</span>
                            {course.faculty_name && <div className="course-faculty-name">{course.faculty_name}</div>}
                          </div>
                          <div className="course-item-check">{isSelected ? <FaCheck /> : '+'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-courses-message"><p>No additional courses found at {alternativeUniversity?.code || selectedUniversity?.code}.</p></div>
              )}
            </div>
            <div className="courses-modal-footer">
              <button className="done-selecting-btn" onClick={() => { setShowAlternativeModal(false); setAlternativeUniversity(null); }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MAXIMISE MODAL */}
      {showMaximiseModal && (
        <div className="courses-modal">
          <div className="courses-modal-overlay" onClick={() => { setShowMaximiseModal(false); setExpandedUniversity(null); }}></div>
          <div className="courses-modal-content maximise-content" onClick={(e) => e.stopPropagation()}>
            <div className="courses-modal-header">
              <div className="modal-university-info">
                {expandedUniversity ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setExpandedUniversity(null)} className="back-btn"><FaArrowLeft /></button>
                    <h3>{expandedUniversity.university.name}</h3>
                  </div>
                ) : (
                  <h3><FaMagic style={{ marginRight: '8px' }} />Maximise Your Options</h3>
                )}
              </div>
              <button className="close-courses-modal" onClick={() => { setShowMaximiseModal(false); setExpandedUniversity(null); }}><FaTimes /></button>
            </div>
            <div className="courses-modal-body">
              {expandedUniversity ? (
                <>
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search courses..." value={universitySearchQuery} onChange={(e) => { setUniversitySearchQuery(e.target.value); setFilteredUniversityCourses(expandedUniversity.eligibleCourses.filter(c => c.name.toLowerCase().includes(e.target.value.toLowerCase()))); }} className="search-input" />
                  </div>
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
                          <div className="course-item-content">
                            <FaBook className="course-item-icon" />
                            <div className="course-name-wrap"><span className="course-item-name">{course.name}</span></div>
                            <div className="course-item-check">{sel ? <FaCheck /> : '+'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="save-row">
                    <span>{(tempSelections[expandedUniversity.university.code]?.length || 0)}/{getInstitutionCourseLimit(expandedUniversity.university.name)}</span>
                    <button className="done-selecting-btn" onClick={saveTempSelections}>Save</button>
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
                          <div className="suggestion-logo">
                            {s.university.logo ? <img src={s.university.logo} alt="" /> : s.university.code?.slice(0, 2)}
                          </div>
                          <div className="suggestion-info">
                            <h4>{s.university.code}</h4>
                            <span>{s.courseCount} eligible course{s.courseCount > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="suggestion-actions">
                          <button className="quick-add-btn" onClick={() => applyMaximiseSuggestion(s)}>Quick Add ({s.courseCount})</button>
                          <button className="choose-btn" onClick={() => handleUniversityClickInMaximise(s)}>Choose Courses</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No new universities found with courses you qualify for.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SWITCH POPUP */}
      {showSwitchPopup && (
        <div className="simple-fee-modal">
          <div className="simple-fee-overlay" onClick={() => setShowSwitchPopup(false)}></div>
          <div className="simple-fee-content" onClick={(e) => e.stopPropagation()}>
            <div className="simple-fee-header header-orange"><h3>Package Limit</h3><button className="simple-fee-close" onClick={() => setShowSwitchPopup(false)}>×</button></div>
            <div className="simple-fee-body">
              <p>You've reached your <strong>{selectedPackage}</strong> package limit of {maxUnis} universities.</p>
              {selectedPackage !== 'premium' && (
                <div className="upgrade-option">
                  <h4>Premium Package</h4>
                  <p className="upgrade-price">R499</p>
                  <p className="upgrade-desc">6 Universities • Priority Processing</p>
                  <button className="upgrade-btn green" onClick={() => { handlePackageSelectConfirm('premium'); setShowSwitchPopup(false); }}>Switch to Premium</button>
                </div>
              )}
              {selectedPackage === 'basic' && (
                <div className="upgrade-option">
                  <h4>Standard Package</h4>
                  <p className="upgrade-price">R329</p>
                  <p className="upgrade-desc">4 Universities</p>
                  <button className="upgrade-btn blue" onClick={() => { handlePackageSelectConfirm('standard'); setShowSwitchPopup(false); }}>Switch to Standard</button>
                </div>
              )}
            </div>
            <div className="simple-fee-footer"><button className="simple-fee-btn" onClick={() => setShowSwitchPopup(false)}>Cancel</button></div>
          </div>
        </div>
      )}

      {/* FEE INFO MODAL */}
      {showFeeInfo && (
        <div className="simple-fee-modal">
          <div className="simple-fee-overlay" onClick={() => setShowFeeInfo(false)}></div>
          <div className="simple-fee-content" onClick={(e) => e.stopPropagation()}>
            <div className={`simple-fee-header ${feeInfoGroup === 'A' ? 'header-green' : 'header-orange'}`}>
              <h3>{feeInfoGroup === 'A' ? 'No Application Fee' : 'Application Fee Required'}</h3>
              <button className="simple-fee-close" onClick={() => setShowFeeInfo(false)}>×</button>
            </div>
            <div className="simple-fee-body">
              <p>{feeInfoGroup === 'A' ? 'These universities do not require an application fee. Skolify will submit your applications at no additional cost.' : 'These universities require a non-refundable application fee per submission. Application fees are the student\'s responsibility and are NOT included in any Skolify package.'}</p>
            </div>
            <div className="simple-fee-footer"><button className="simple-fee-btn" onClick={() => setShowFeeInfo(false)}>Got it</button></div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
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

      {/* CREDENTIALS */}
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
              <p className="credentials-warning">⚠️ Save these now. You won't see them again!</p>
            </div>
            <div className="credentials-modal-footer"><button className="credentials-ok-btn" onClick={() => { setShowCredentialsModal(false); navigate('/profile'); }}>I've Saved Them</button></div>
          </div>
        </div>
      )}

      <Money isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} totalAmount={packagePrices[selectedPackage]} selectedPackage={selectedPackage} onPaymentComplete={handlePaymentComplete} />

      <button className="chatbot-floating-btn" onClick={() => window.open('https://wa.me/27822589917', '_blank')} title="Chat with us on WhatsApp">
        <FaCommentDots className="chatbot-msg-icon" />
      </button>
    </div>
  );
};

export default PaymentPage;