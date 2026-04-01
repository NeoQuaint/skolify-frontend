import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaUniversity, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaSearch, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import './Bursary.css';

const Bursary = () => {
  const [bursaries, setBursaries] = useState([]);
  const [filteredBursaries, setFilteredBursaries] = useState([]);
  const [selectedField, setSelectedField] = useState('all');
  const [selectedDeadline, setSelectedDeadline] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBursaries, setSelectedBursaries] = useState([]);

  // Study fields
  const studyFields = [
    { id: 'all', name: 'All Fields' },
    { id: 'engineering', name: 'Engineering & Technology' },
    { id: 'health', name: 'Health Sciences' },
    { id: 'commerce', name: 'Commerce & Business' },
    { id: 'science', name: 'Science & Mathematics' },
    { id: 'humanities', name: 'Humanities & Social Sciences' },
    { id: 'education', name: 'Education' },
    { id: 'law', name: 'Law' },
    { id: 'arts', name: 'Arts & Design' },
    { id: 'agriculture', name: 'Agriculture' },
  ];

  // Deadline filters
  const deadlineFilters = [
    { id: 'all', name: 'All Deadlines' },
    { id: '30', name: 'Within 30 days' },
    { id: '60', name: 'Within 60 days' },
    { id: '90', name: 'Within 90 days' },
    { id: '2024', name: '2024 Applications' },
  ];

  // Sample bursaries data
  const sampleBursaries = [
    {
      id: 1,
      name: 'NSFAS Bursary',
      provider: 'National Student Financial Aid Scheme',
      field: 'all',
      amount: 'Full Funding',
      deadline: '2024-11-30',
      requirements: 'South African citizen, Combined household income ≤ R350k',
      description: 'Government bursary covering tuition, accommodation, and living expenses for undergraduate studies.',
      link: 'https://www.nsfas.org.za',
      icon: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true
    },
    {
      id: 2,
      name: 'FUNZA LUSHAKA Bursary',
      provider: 'Department of Basic Education',
      field: 'education',
      amount: 'Full Funding + Stipend',
      deadline: '2024-02-28',
      requirements: 'Teaching qualification, Commitment to teach in public school',
      description: 'Bursary for students who want to become teachers in public schools.',
      link: 'https://www.funzalushaka.doe.gov.za',
      icon: 'https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true
    },
    {
      id: 3,
      name: 'SASOL Bursary',
      provider: 'SASOL Limited',
      field: 'engineering',
      amount: 'R120,000/year',
      deadline: '2024-04-30',
      requirements: 'Engineering students, 70% average, Leadership potential',
      description: 'Bursary for engineering students with excellent academic record.',
      link: 'https://www.sasol.com/careers/bursaries',
      icon: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 4,
      name: 'MANDELA RHODES Scholarship',
      provider: 'The Mandela Rhodes Foundation',
      field: 'all',
      amount: 'Full Funding',
      deadline: '2024-04-15',
      requirements: 'African citizen, Leadership qualities, Academic excellence',
      description: 'Combines financial support with a leadership development programme.',
      link: 'https://www.mandelarhodes.org',
      icon: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      popular: true
    },
    {
      id: 5,
      name: 'TRANSnet Bursary',
      provider: 'Transnet SOC Ltd',
      field: 'engineering',
      amount: 'Full Tuition + Allowance',
      deadline: '2024-05-31',
      requirements: 'Engineering/Technical fields, 65% average',
      description: 'Bursary for engineering and technical qualifications in transport and logistics.',
      link: 'https://www.transnet.net/careers/bursaries.html',
      icon: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 6,
      name: 'ABSA Bursary',
      provider: 'ABSA Bank',
      field: 'commerce',
      amount: 'R100,000/year',
      deadline: '2024-03-31',
      requirements: 'Commerce/Finance students, 65% average',
      description: 'Bursary for commerce, finance, and IT students with career opportunities at ABSA.',
      link: 'https://www.absa.africa/about-us/careers/bursaries/',
      icon: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 7,
      name: 'SAMRC Bursary',
      provider: 'South African Medical Research Council',
      field: 'health',
      amount: 'R150,000/year',
      deadline: '2024-06-30',
      requirements: 'Health/Medical research, Postgraduate studies',
      description: 'Bursaries for health and medical research students at postgraduate level.',
      link: 'https://www.samrc.ac.za/funding/bursaries',
      icon: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 8,
      name: 'Nedbank Bursary',
      provider: 'Nedbank',
      field: 'commerce',
      amount: 'Full Tuition + Monthly Allowance',
      deadline: '2024-07-31',
      requirements: 'Commerce/IT students, Financial need, Academic potential',
      description: 'Comprehensive bursary including tuition, accommodation, and monthly allowance.',
      link: 'https://www.nedbank.co.za/content/nedbank/desktop/gt/en/careers/bursaries.html',
      icon: 'https://images.unsplash.com/photo-1616514161214-d6c44d2482f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 9,
      name: 'DTI Bursary',
      provider: 'Department of Trade and Industry',
      field: 'all',
      amount: 'Full Funding',
      deadline: '2024-08-31',
      requirements: 'South African citizen, Fields aligned with national priorities',
      description: 'Bursary for studies in fields that support South Africa’s industrial policy.',
      link: 'https://www.thedti.gov.za/financial_assistance/bursaries.jsp',
      icon: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 10,
      name: 'ARM Bursary',
      provider: 'African Rainbow Minerals',
      field: 'engineering',
      amount: 'R110,000/year',
      deadline: '2024-09-30',
      requirements: 'Mining/Engineering students, From mining communities',
      description: 'Bursary for students from mining communities studying mining-related engineering.',
      link: 'https://www.arm.co.za/careers/bursaries/',
      icon: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 11,
      name: 'SAASTA Bursary',
      provider: 'South African Agency for Science and Technology Advancement',
      field: 'science',
      amount: 'R80,000/year',
      deadline: '2024-10-15',
      requirements: 'Science/Technology students, 70% average',
      description: 'Bursary for students in science, technology, engineering, and mathematics.',
      link: 'https://www.saasta.ac.za/bursaries/',
      icon: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 12,
      name: 'Tiger Brands Bursary',
      provider: 'Tiger Brands',
      field: 'commerce',
      amount: 'R95,000/year',
      deadline: '2024-11-15',
      requirements: 'Food Science/Commerce students, Leadership potential',
      description: 'Bursary for studies related to food science, commerce, and supply chain.',
      link: 'https://www.tigerbrands.com/careers/bursaries',
      icon: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
  ];

  // Initialize bursaries
  useEffect(() => {
    setBursaries(sampleBursaries);
    setFilteredBursaries(sampleBursaries);
  }, []);

  // Filter bursaries
  useEffect(() => {
    let filtered = [...bursaries];

    // Filter by field
    if (selectedField !== 'all') {
      filtered = filtered.filter(b => b.field === selectedField);
    }

    // Filter by deadline
    if (selectedDeadline !== 'all') {
      const today = new Date();
      filtered = filtered.filter(b => {
        const deadlineDate = new Date(b.deadline);
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        switch (selectedDeadline) {
          case '30': return daysUntilDeadline <= 30 && daysUntilDeadline >= 0;
          case '60': return daysUntilDeadline <= 60 && daysUntilDeadline >= 0;
          case '90': return daysUntilDeadline <= 90 && daysUntilDeadline >= 0;
          case '2024': return deadlineDate.getFullYear() === 2024;
          default: return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.provider.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.requirements.toLowerCase().includes(query)
      );
    }

    setFilteredBursaries(filtered);
    setSelectedBursaries([]);
  }, [selectedField, selectedDeadline, searchQuery, bursaries]);

  // Toggle bursary selection
  const toggleBursarySelection = (bursaryId) => {
    setSelectedBursaries(prev => {
      if (prev.includes(bursaryId)) {
        return prev.filter(id => id !== bursaryId);
      } else {
        return [...prev, bursaryId];
      }
    });
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Closed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 30) return `${diffDays} days (Urgent)`;
    return `${diffDays} days`;
  };

  // Get deadline color
  const getDeadlineColor = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#dc3545'; // Red for closed
    if (diffDays <= 7) return '#dc3545'; // Red for urgent
    if (diffDays <= 30) return '#ffc107'; // Yellow for soon
    return '#28a745'; // Green for normal
  };

  // Open bursary link
  const openBursaryLink = (link, e) => {
    e.stopPropagation();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="dashboard-app">
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Header - Same as Dashboard */}
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

      {/* Main Content */}
      <main className="app-main bursary-main">
        <div className="app-container bursary-container">
          
          {/* Divider Line */}
          <div className="divider-line"></div>

          {/* Main Heading */}
          <h1 className="main-heading">Find Bursaries & Scholarships</h1>

          {/* Description */}
          <p className="section-description bursary-description">
            Discover funding opportunities for your studies. Filter by field, deadline, or search for specific bursaries.
          </p>

          {/* Search and Filters Section */}
          <div className="bursary-filters-section">
            {/* Search Bar */}
            <div className="bursary-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search bursaries by name, provider, or requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bursary-search-input"
              />
            </div>

            {/* Filters - Horizontal */}
            <div className="bursary-filters-horizontal">
              <div className="filter-group">
                <label htmlFor="field-filter">
                  <FaGraduationCap className="filter-icon" /> Field of Study
                </label>
                <select 
                  id="field-filter"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="bursary-select"
                >
                  {studyFields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="deadline-filter">
                  <FaCalendarAlt className="filter-icon" /> Application Deadline
                </label>
                <select 
                  id="deadline-filter"
                  value={selectedDeadline}
                  onChange={(e) => setSelectedDeadline(e.target.value)}
                  className="bursary-select"
                >
                  {deadlineFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <h3>
              {filteredBursaries.length} bursary{filteredBursaries.length !== 1 ? 'ies' : ''} found
              {selectedField !== 'all' && ` in ${studyFields.find(f => f.id === selectedField)?.name}`}
            </h3>
            {selectedDeadline !== 'all' && (
              <p className="filter-indicator">
                Deadline: {deadlineFilters.find(d => d.id === selectedDeadline)?.name}
              </p>
            )}
            {selectedBursaries.length > 0 && (
              <div className="selected-count">
                {selectedBursaries.length} bursar{selectedBursaries.length !== 1 ? 'ies' : 'y'} selected
              </div>
            )}
          </div>

          {/* Bursary Cards */}
          {filteredBursaries.length > 0 ? (
            <div className="bursary-section">
              <div className="bursary-cards">
                {filteredBursaries.map(bursary => (
                  <div 
                    key={bursary.id} 
                    className={`bursary-card ${selectedBursaries.includes(bursary.id) ? 'selected' : ''}`}
                    onClick={() => toggleBursarySelection(bursary.id)}
                  >
                    <div className="bursary-card-header">
                      <div className="bursary-image">
                        <img 
                          src={bursary.icon} 
                          alt={bursary.name}
                          className="bursary-img"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                          }}
                        />
                      </div>
                      <div className="bursary-title-section">
                        <h3 className="bursary-name">{bursary.name}</h3>
                        <p className="bursary-provider">{bursary.provider}</p>
                        {bursary.popular && (
                          <span className="popular-badge">Popular</span>
                        )}
                      </div>
                    </div>

                    <div className="bursary-details">
                      <div className="bursary-info">
                        <div className="info-item">
                          <FaMoneyBillWave className="info-icon" />
                          <span className="info-label">Amount:</span>
                          <span className="info-value">{bursary.amount}</span>
                        </div>
                        <div className="info-item">
                          <FaGraduationCap className="info-icon" />
                          <span className="info-label">Field:</span>
                          <span className="info-value">
                            {studyFields.find(f => f.id === bursary.field)?.name || 'All Fields'}
                          </span>
                        </div>
                        <div className="info-item">
                          <FaCalendarAlt className="info-icon" />
                          <span className="info-label">Deadline:</span>
                          <span 
                            className="info-value deadline-value"
                            style={{ color: getDeadlineColor(bursary.deadline) }}
                          >
                            {getDaysUntilDeadline(bursary.deadline)}
                          </span>
                        </div>
                      </div>

                      <div className="bursary-requirements">
                        <h4>Requirements:</h4>
                        <p className="requirements-text">{bursary.requirements}</p>
                      </div>

                      <div className="bursary-description">
                        <p>{bursary.description}</p>
                      </div>

                      <div className="bursary-actions">
                        <button 
                          className="apply-link-btn"
                          onClick={(e) => openBursaryLink(bursary.link, e)}
                        >
                          <FaExternalLinkAlt />
                          Visit Website
                        </button>
                        <div className="selection-indicator">
                          {selectedBursaries.includes(bursary.id) ? (
                            <>
                              <FaCheckCircle className="selected-icon" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span className="select-hint">Click to select</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Bursaries Summary */}
              {selectedBursaries.length > 0 && (
                <div className="selected-bursaries-section">
                  <div className="selected-bursaries-header">
                    <h3>Selected Bursaries ({selectedBursaries.length})</h3>
                    <button className="track-applications-btn">
                      Track Applications
                    </button>
                  </div>
                  <div className="selected-bursaries-list">
                    {selectedBursaries.map(bursaryId => {
                      const bursary = bursaries.find(b => b.id === bursaryId);
                      return bursary ? (
                        <div key={bursary.id} className="selected-bursary-item">
                          <span className="selected-bursary-name">{bursary.name}</span>
                          <span className="selected-bursary-deadline">
                            Deadline: {getDaysUntilDeadline(bursary.deadline)}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">
              <h3>No bursaries found</h3>
              <p>
                Try adjusting your filters or search term.
                {selectedField !== 'all' && ` No bursaries found in ${studyFields.find(f => f.id === selectedField)?.name}`}
              </p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedField('all');
                  setSelectedDeadline('all');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="app-footer bursary-footer">
            <p>
              Need help with bursary applications? Contact our financial aid team at{' '}
              <a href="mailto:bursaries@skolify.co.za" className="support-link">
                bursaries@skolify.co.za
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Bursary;