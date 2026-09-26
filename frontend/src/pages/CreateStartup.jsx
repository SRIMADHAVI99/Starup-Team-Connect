import React, { useState, useEffect } from 'react';
import CustomModal from '../components/CustomModal';

/**
 * CreateStartup Page
 * Allows founders to post a new startup with live title availability check,
 * role/skills specification, problem/solution definition.
 */
export default function CreateStartup({ 
  currentUser, 
  onStartupCreated, 
  onCancel, 
  apiBaseUrl, 
  existingStartups = [] 
}) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [requiredRoles, setRequiredRoles] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [teamSize, setTeamSize] = useState('3-5 members');
  const [category, setCategory] = useState('CleanTech');

  // Title Availability State (Requirement 8 & 9)
  const [titleStatus, setTitleStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [titleMessage, setTitleMessage] = useState('Enter a startup title');

  // Custom Modal State (Requirement 8)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'warning' });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Title normalization helper (trim, replace multiple spaces, lowercase)
  const normalizeTitle = (str) => {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  // Live duplicate title check with debounce (Requirement 8 & 9)
  useEffect(() => {
    const normalized = normalizeTitle(title);
    if (!normalized || normalized.length < 2) {
      setTitleStatus(null);
      setTitleMessage('Enter a startup title');
      return;
    }

    setTitleStatus('checking');
    setTitleMessage('Checking title availability...');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/startups/check-title?title=${encodeURIComponent(normalized)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setTitleStatus('taken');
            setTitleMessage('⚠️ Startup title already registered. Please choose a different title.');
          } else {
            setTitleStatus('available');
            setTitleMessage('✓ Startup title is available.');
          }
        } else {
          // Local normalized fallback check
          const exists = existingStartups.some(s => normalizeTitle(s.title) === normalized);
          if (exists) {
            setTitleStatus('taken');
            setTitleMessage('⚠️ Startup title already registered. Please choose a different title.');
          } else {
            setTitleStatus('available');
            setTitleMessage('✓ Startup title is available.');
          }
        }
      } catch {
        // Local normalized fallback check
        const exists = existingStartups.some(s => normalizeTitle(s.title) === normalized);
        if (exists) {
          setTitleStatus('taken');
          setTitleMessage('⚠️ Startup title already registered. Please choose a different title.');
        } else {
          setTitleStatus('available');
          setTitleMessage('✓ Startup title is available.');
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, apiBaseUrl, existingStartups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const normalized = normalizeTitle(title);
    if (!normalized) {
      setErrorMsg('Please enter a valid startup title.');
      return;
    }

    if (titleStatus === 'taken') {
      setModalConfig({
        isOpen: true,
        title: 'Startup Already Exists',
        message: 'This startup title is already registered. Please choose a different title.',
        type: 'warning'
      });
      return;
    }

    if (!title || !shortDescription || !requiredRoles || !requiredSkills) {
      setErrorMsg('Please fill in all mandatory fields (Title, Description, Roles, Skills).');
      return;
    }

    setIsLoading(true);

    // Final backend verification on submit
    try {
      const checkRes = await fetch(`${apiBaseUrl}/api/startups/check-title?title=${encodeURIComponent(normalized)}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setTitleStatus('taken');
          setModalConfig({
            isOpen: true,
            title: 'Startup Already Exists',
            message: 'This startup title is already registered. Please choose a different title.',
            type: 'warning'
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    if (!currentUser || !currentUser.id) {
      setErrorMsg('You must be logged in as a founder to create a startup.');
      return;
    }

    const payload = {
      title: title.trim().replace(/\s+/g, ' '),
      shortDescription: shortDescription.trim(),
      problemStatement: problemStatement.trim(),
      solution: solution.trim(),
      requiredRoles: requiredRoles.trim(),
      requiredSkills: requiredSkills.trim(),
      teamSize: teamSize.trim(),
      category: category.trim(),
      founderId: currentUser.id,
      founderName: currentUser.name || 'Founder'
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/startups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdData = await res.json();
        onStartupCreated(createdData);
      } else {
        const errorText = await res.text();
        setErrorMsg(errorText || 'Unable to create startup. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the backend server. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CustomModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="section-header" style={{ maxWidth: '780px', margin: '0 auto 20px auto' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Create a New Startup</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            List your project requirements, problem statement, and skills needed.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="form-card">
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Startup Title with Live Availability Checker */}
          <div className="form-group">
            <label className="form-label" htmlFor="title-input">
              Startup Title *
            </label>
            <input
              id="title-input"
              type="text"
              className="form-input"
              placeholder="e.g. HealthConnect"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {titleMessage && (
              <div className={`title-availability-msg ${titleStatus || 'default'}`} style={{ marginTop: '6px', fontSize: '0.84rem' }}>
                {titleMessage}
              </div>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="CleanTech">CleanTech / Environment</option>
                <option value="EdTech">EdTech / Education</option>
                <option value="HealthTech">HealthTech / Healthcare</option>
                <option value="FinTech">FinTech / Finance</option>
                <option value="AI/ML">AI & Machine Learning</option>
                <option value="SaaS">SaaS / Web Software</option>
                <option value="General">General / Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Team Size</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 3-4 members"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief summary of your startup idea and product vision."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Problem Statement</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="What real-world problem does your startup aim to solve?"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proposed Solution</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="How does your application or product solve this problem?"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Roles * (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Java Developer, UI Designer, Data Analyst"
              value={requiredRoles}
              onChange={(e) => setRequiredRoles(e.target.value)}
              required
            />
            <span className="form-hint">List roles candidates can apply for.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Required Skills * (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Java, SQL, HTML, CSS"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              required
            />
            <span className="form-hint">Used for automatic rule-based candidate matching.</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isLoading || titleStatus === 'taken'}
            >
              {isLoading ? 'Saving Startup...' : 'Create Startup & Save'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
