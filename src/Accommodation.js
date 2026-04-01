import React, { useState, useEffect } from 'react';
import { FaHome, FaMapMarkerAlt, FaWifi, FaUtensils, FaUsers, FaCar, FaDumbbell, FaSwimmingPool, FaTv, FaShieldAlt, FaBook, FaTree, FaUniversity, FaChevronRight, FaChevronLeft, FaCheck, FaTimes, FaChevronLeft as FaChevronLeftIcon, FaChevronRight as FaChevronRightIcon, FaMoneyBillAlt, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Accommodation.css';

const Accommodation = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [budgetRange, setBudgetRange] = useState('all');
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const universities = [
    { id: 'all', name: 'All Universities' },
    { id: 'uj', name: 'University of Johannesburg' },
    { id: 'uct', name: 'University of Cape Town' },
    { id: 'wits', name: 'University of the Witwatersrand' },
    { id: 'up', name: 'University of Pretoria' },
    { id: 'ukzn', name: 'University of KwaZulu-Natal' },
    { id: 'tut', name: 'Tshwane University of Technology' },
    { id: 'nwu', name: 'North-West University' },
    { id: 'ru', name: 'Rhodes University' },
    { id: 'ufs', name: 'University of the Free State' },
    { id: 'unisa', name: 'UNISA' },
    { id: 'cput', name: 'Cape Peninsula University of Technology' },
  ];

  const accommodationTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'residence', name: 'University Residence' },
    { id: 'private', name: 'Private Student Accommodation' },
    { id: 'shared', name: 'Shared House/Apartment' },
    { id: 'hostel', name: 'Student Hostel' },
    { id: 'apartment', name: 'Private Apartment' },
  ];

  const budgetRanges = [
    { id: 'all', name: 'Any Budget' },
    { id: '2000', name: 'Under R2,000', max: 2000 },
    { id: '4000', name: 'R2,000 - R4,000', min: 2000, max: 4000 },
    { id: '6000', name: 'R4,000 - R6,000', min: 4000, max: 6000 },
    { id: '8000', name: 'R6,000+', min: 6000 },
  ];

  const getUniversityCode = (universityId) => {
    const universityMap = {
      'uj': 'UJ',
      'uct': 'UCT',
      'wits': 'WITS',
      'up': 'UP',
      'ukzn': 'KZN',
      'tut': 'TUT',
      'nwu': 'NWU',
      'ru': 'RHODES',
      'ufs': 'UFS',
      'unisa': 'UNISA',
      'cput': 'CPUT'
    };
    return universityMap[universityId] || universityId.toUpperCase();
  };

  const sampleAccommodations = [
    {
      id: 1,
      name: 'StudentHub Johannesburg',
      university: 'uj',
      type: 'private',
      price: 3500,
      location: 'Braamfontein, Johannesburg',
      distance: '1.2km from UJ',
      features: ['WiFi', 'Kitchen', 'Study Room', 'Security'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: true,
      description: 'Modern student accommodation with excellent amenities and 24/7 security.'
    },
    {
      id: 2,
      name: 'UCT Kopano Residence',
      university: 'uct',
      type: 'residence',
      price: 1800,
      location: 'Rondebosch, Cape Town',
      distance: 'On UCT Campus',
      features: ['Meal Plan', 'Gym', 'Laundry', 'Study Area'],
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: true,
      description: 'Official UCT residence with meal plans and campus facilities included.'
    },
    {
      id: 3,
      name: 'Hatfield Shared House',
      university: 'up',
      type: 'shared',
      price: 1200,
      location: 'Hatfield, Pretoria',
      distance: '0.8km from UP',
      features: ['Shared', 'Parking', 'Garden', 'Kitchen'],
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: false,
      description: 'Affordable shared house perfect for students on a budget.'
    },
    {
      id: 4,
      name: 'The Student Manor',
      university: 'ukzn',
      type: 'private',
      price: 5500,
      location: 'Berea, Durban',
      distance: '2.1km from UKZN',
      features: ['Pool', 'Entertainment', 'Gym', 'Security'],
      images: [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: true,
      description: 'Premium student accommodation with luxury amenities and services.'
    },
    {
      id: 5,
      name: 'Education Heights',
      university: 'tut',
      type: 'private',
      price: 3200,
      location: 'Sunnyside, Pretoria',
      distance: '1.5km from TUT',
      features: ['Security', 'Study Room', 'WiFi', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: false,
      description: 'Newly built accommodation with modern facilities and study spaces.'
    },
    {
      id: 6,
      name: 'Observatory Commons',
      university: 'uct',
      type: 'shared',
      price: 1500,
      location: 'Observatory, Cape Town',
      distance: '2.3km from UCT',
      features: ['Shared', 'Garden', 'Kitchen', 'WiFi'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      ],
      nsfasAccredited: true,
      description: 'Community-focused shared accommodation with beautiful garden spaces.'
    },
  ];

  useEffect(() => {
    setAccommodations(sampleAccommodations);
    setFilteredAccommodations(sampleAccommodations);
    
    // Load saved accommodations
    const savedAccommodations = localStorage.getItem('selectedAccommodationsWithUni');
    if (savedAccommodations) {
      try {
        const parsed = JSON.parse(savedAccommodations);
        // Extract accommodation IDs from saved data
        const savedIds = [];
        Object.values(parsed).forEach(accList => {
          accList.forEach(acc => {
            const sampleAcc = sampleAccommodations.find(sa => sa.name === acc.name);
            if (sampleAcc) {
              savedIds.push(sampleAcc.id);
            }
          });
        });
        setSelectedAccommodations(savedIds);
      } catch (e) {
        console.error('Error loading saved accommodations:', e);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = [...accommodations];

    if (selectedUniversity !== 'all') {
      filtered = filtered.filter(acc => acc.university === selectedUniversity);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(acc => acc.type === selectedType);
    }

    if (budgetRange !== 'all') {
      const range = budgetRanges.find(r => r.id === budgetRange);
      if (range) {
        filtered = filtered.filter(acc => {
          if (range.max && !range.min) {
            return acc.price <= range.max;
          } else if (range.min && range.max) {
            return acc.price >= range.min && acc.price <= range.max;
          } else if (range.min && !range.max) {
            return acc.price >= range.min;
          }
          return true;
        });
      }
    }

    setFilteredAccommodations(filtered);
  }, [selectedUniversity, selectedType, budgetRange, accommodations]);

  const toggleAccommodationSelection = (accommodationId, e) => {
    if (e.target.closest('.accommodation-card-horizontal') && !e.target.closest('.accommodation-image-horizontal')) {
      setSelectedAccommodations(prev => {
        if (prev.includes(accommodationId)) {
          return prev.filter(id => id !== accommodationId);
        } else {
          return [...prev, accommodationId];
        }
      });
    }
  };

  const removeSelectedAccommodation = (accommodationId) => {
    setSelectedAccommodations(prev => prev.filter(id => id !== accommodationId));
  };

  const openGallery = (accommodation, e) => {
    if (e.target.closest('.accommodation-image-horizontal')) {
      setSelectedGallery(accommodation);
      setCurrentImageIndex(0);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeGallery = () => {
    setSelectedGallery(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedGallery.images.length - 1 : prev - 1
      );
    }
  };

  const handleApply = () => {
    if (selectedAccommodations.length === 0) {
      alert('Please select at least one accommodation');
      return;
    }

    const selectedAccommodationDetails = accommodations.filter(acc => 
      selectedAccommodations.includes(acc.id)
    );
    
    // Save accommodations to localStorage
    const savedAccommodations = JSON.parse(localStorage.getItem('selectedAccommodationsWithUni') || '{}');
    
    // Group accommodations by university
    selectedAccommodationDetails.forEach(acc => {
      const uniCode = getUniversityCode(acc.university);
      if (!savedAccommodations[uniCode]) {
        savedAccommodations[uniCode] = [];
      }
      
      // Check if this accommodation already exists for this university
      const exists = savedAccommodations[uniCode].some(existingAcc => existingAcc.id === acc.id);
      if (!exists) {
        savedAccommodations[uniCode].push({
          id: acc.id,
          name: acc.name,
          price: acc.price,
          location: acc.location,
          nsfasAccredited: acc.nsfasAccredited
        });
      }
    });
    
    // Save to localStorage
    localStorage.setItem('selectedAccommodationsWithUni', JSON.stringify(savedAccommodations));
    
    alert(`Added ${selectedAccommodations.length} accommodation${selectedAccommodations.length !== 1 ? 's' : ''} to your application`);
    
    // Navigate back to payment page
    navigate('/payment');
  };

  const getUniversityName = (universityId) => {
    const uni = universities.find(u => u.id === universityId);
    return uni ? uni.name : 'Unknown University';
  };

  const getFeatureIcon = (feature) => {
    switch (feature.toLowerCase()) {
      case 'wifi': return <FaWifi />;
      case 'kitchen': return <FaUtensils />;
      case 'shared': return <FaUsers />;
      case 'parking': return <FaCar />;
      case 'gym': return <FaDumbbell />;
      case 'meal plan': return <FaUtensils />;
      case 'pool': return <FaSwimmingPool />;
      case 'entertainment': return <FaTv />;
      case 'security': return <FaShieldAlt />;
      case 'study room': return <FaBook />;
      case 'garden': return <FaTree />;
      case 'laundry': return <FaUsers />;
      case 'study area': return <FaBook />;
      default: return <FaHome />;
    }
  };

  return (
    <div className="dashboard-app">
      <div className="background-pattern"></div>

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
        </div>
      </header>

      <main className="app-main accommodation-main">
        <div className="app-container accommodation-container">
          
          <div className="divider-line"></div>

          <h1 className="main-heading">Find Student Accommodation</h1>

          <p className="section-description accommodation-description">
            Secure your home away from home. Find verified student accommodation near your chosen institution.
            <br />
            <strong style={{ color: '#007bff', fontSize: '14px', marginTop: '5px', display: 'block' }}>
              Each accommodation application costs R40 (added to your total application fee)
            </strong>
          </p>

          <div className="accommodation-filters-horizontal">
            <div className="filter-group-horizontal">
              <label htmlFor="university-filter">
                <FaUniversity className="filter-icon" /> University
              </label>
              <select 
                id="university-filter"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="accommodation-select"
              >
                {universities.map(uni => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group-horizontal">
              <label htmlFor="type-filter">
                <FaHome className="filter-icon" /> Type
              </label>
              <select 
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="accommodation-select"
              >
                {accommodationTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group-horizontal">
              <label htmlFor="budget-filter">Monthly Budget</label>
              <select 
                id="budget-filter"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="accommodation-select"
              >
                {budgetRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="results-summary">
            <h3>
              {filteredAccommodations.length} accommodation{filteredAccommodations.length !== 1 ? 's' : ''} found
              {selectedUniversity !== 'all' && ` near ${getUniversityName(selectedUniversity)}`}
            </h3>
            <p className="filter-indicator">
              {selectedType !== 'all' && `Type: ${accommodationTypes.find(t => t.id === selectedType)?.name} • `}
              {budgetRange !== 'all' && `Budget: ${budgetRanges.find(b => b.id === budgetRange)?.name}`}
            </p>
            {selectedAccommodations.length > 0 && (
              <div className="selected-count">
                {selectedAccommodations.length} accommodation{selectedAccommodations.length !== 1 ? 's' : ''} selected • R{selectedAccommodations.length * 40}
              </div>
            )}
          </div>

          {filteredAccommodations.length > 0 ? (
            <div className="accommodation-section">
              <div className="accommodation-cards-horizontal">
                {filteredAccommodations.map(acc => (
                  <div 
                    key={acc.id} 
                    className={`accommodation-card-horizontal ${selectedAccommodations.includes(acc.id) ? 'selected' : ''}`}
                    onClick={(e) => toggleAccommodationSelection(acc.id, e)}
                  >
                    <div 
                      className="accommodation-image-horizontal"
                      onClick={(e) => openGallery(acc, e)}
                    >
                      <img 
                        src={acc.images[0]} 
                        alt={acc.name}
                        className="accommodation-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                      {acc.nsfasAccredited && (
                        <div className="nsfas-badge">
                          <FaCheckCircle /> NSFAS Accredited
                        </div>
                      )}
                      {selectedAccommodations.includes(acc.id) && (
                        <div className="selection-check">
                          <FaCheck />
                        </div>
                      )}
                      <div className="gallery-indicator">
                        <span className="gallery-count">{acc.images.length} photos</span>
                        <span className="gallery-hint">Click to view</span>
                      </div>
                    </div>
                    
                    <div className="accommodation-details-horizontal">
                      <div className="accommodation-title">{acc.name}</div>
                      
                      <div className="accommodation-university">
                        <FaUniversity />
                        {getUniversityName(acc.university)}
                      </div>
                      
                      <div className="accommodation-location">
                        <FaMapMarkerAlt />
                        {acc.location}
                      </div>
                      
                      <div className="accommodation-features">
                        {acc.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="feature">
                            {getFeatureIcon(feature)}
                            {feature}
                          </span>
                        ))}
                        {acc.features.length > 3 && (
                          <span className="feature more-features">
                            +{acc.features.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="accommodation-price-distance">
                        <div className="accommodation-price">
                          R{acc.price.toLocaleString()}/month
                        </div>
                        <div className="accommodation-distance">
                          {acc.distance}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Your Selected Accommodation Applications Section */}
              {selectedAccommodations.length > 0 && (
                <div className="selected-accommodations-section">
                  <div className="selected-accommodations-header">
                    <h2>Your Selected Accommodation Applications</h2>
                    <div className="selected-total-cost">
                      <FaMoneyBillAlt className="total-cost-icon" />
                      <span className="total-cost-label">Total Application Fee:</span>
                      <span className="total-cost-value">R{selectedAccommodations.length * 40} ({selectedAccommodations.length})</span>
                    </div>
                  </div>
                  
                  <div className="selected-accommodations-list">
                    {accommodations
                      .filter(acc => selectedAccommodations.includes(acc.id))
                      .map(acc => (
                        <div key={acc.id} className="selected-accommodation-item">
                          <div className="selected-accommodation-info">
                            <div className="selected-accommodation-image">
                              <img 
                                src={acc.images[0]} 
                                alt={acc.name}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/phone-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                                }}
                              />
                              {acc.nsfasAccredited && (
                                <div className="nsfas-badge-selected">
                                  <FaCheckCircle /> NSFAS Accredited
                                </div>
                              )}
                            </div>
                            <div className="selected-accommodation-details">
                              <h4>{acc.name}</h4>
                              <div className="selected-accommodation-meta">
                                <span className="selected-university">
                                  <FaUniversity /> {getUniversityName(acc.university)}
                                </span>
                                <span className="selected-location">
                                  <FaMapMarkerAlt /> {acc.location}
                                </span>
                                <span className="selected-price">
                                  R{acc.price.toLocaleString()}/month
                                </span>
                              </div>
                              <div className="selected-features">
                                {acc.features.slice(0, 3).map((feature, index) => (
                                  <span key={index} className="selected-feature">
                                    {getFeatureIcon(feature)}
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button 
                            className="remove-selected-btn"
                            onClick={() => removeSelectedAccommodation(acc.id)}
                          >
                            <FaTrash />
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedAccommodations.length > 0 && (
                <div className="apply-accommodation-section">
                  <button 
                    className="apply-accommodation-btn"
                    onClick={handleApply}
                  >
                    Apply to Selected ({selectedAccommodations.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">
              <h3>No accommodations found</h3>
              <p>
                Try adjusting your filters. 
                {selectedUniversity !== 'all' && ` No accommodations found near ${getUniversityName(selectedUniversity)}`}
                {budgetRange !== 'all' && ` within your selected budget.`}
              </p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedUniversity('all');
                  setSelectedType('all');
                  setBudgetRange('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          <footer className="app-footer accommodation-footer">
            <p>
              Need help? Contact our accommodation team at{' '}
              <a href="mailto:accommodation@skolify.co.za" className="support-link">
                accommodation@skolify.co.za
              </a>
            </p>
          </footer>
        </div>
      </main>

      {selectedGallery && (
        <div className="gallery-modal">
          <div className="gallery-modal-overlay" onClick={closeGallery}></div>
          <div className="gallery-modal-content">
            <div className="gallery-header">
              <div className="gallery-title">
                <h3>{selectedGallery.name}</h3>
                <p className="gallery-subtitle">{selectedGallery.location}</p>
              </div>
              <button className="gallery-close" onClick={closeGallery}>
                <FaTimes />
              </button>
            </div>
            
            <div className="gallery-main">
              <div className="gallery-current-image">
                <img 
                  src={selectedGallery.images[currentImageIndex]} 
                  alt={`${selectedGallery.name} - Image ${currentImageIndex + 1}`}
                  className="gallery-img"
                />
                <button className="gallery-nav prev" onClick={prevImage}>
                  <FaChevronLeftIcon />
                </button>
                <button className="gallery-nav next" onClick={nextImage}>
                  <FaChevronRightIcon />
                </button>
                <div className="gallery-counter">
                  {currentImageIndex + 1} / {selectedGallery.images.length}
                </div>
              </div>
              
              <div className="gallery-thumbnails">
                {selectedGallery.images.map((img, index) => (
                  <div 
                    key={index}
                    className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
              
              <div className="gallery-details">
                <div className="gallery-description">
                  <h4>Description</h4>
                  <p>{selectedGallery.description}</p>
                </div>
                <div className="gallery-features">
                  <h4>Features</h4>
                  <div className="features-grid">
                    {selectedGallery.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        {getFeatureIcon(feature)}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="gallery-price">
                  <h4>Price</h4>
                  <div className="price-display">
                    R{selectedGallery.price.toLocaleString()} / month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accommodation;