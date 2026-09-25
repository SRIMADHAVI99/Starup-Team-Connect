import React, { useState, useEffect } from 'react';

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

  // Title Availability State (Requirement 17)
  const [titleStatus, setTitleStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [titleMessage, setTitleMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live duplicate title check with debounce (Requirement 17)
  useEffect(() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setTitleStatus(null);
      setTitleMessage('');
      return;
    }

    setTitleStatus('checking');
    setTitleMessage('Checking title availability...');

    const timer = setTimeout(async () => {
      try {
        // Backend check API: GET /api/startups/check-title?title=...
        const res = await fetch(`${apiBaseUrl}/api/startups/check-title?title=${encodeURIComponent(trimmedTitle)}`);
        if (res.ok) {
          const data = await res.json();
          // data: { exists: boolean }
          if (data.exists) {
            setTitleStatus('taken');
            setTitleMessage('⚠️ Startup exists with this title.');
          } else {
            setTitleStatus('available');
            setTitleMessage('✓ Startup title is available.');
          }
        } else {
          // Fallback to local check if backend is offline
          const exists = existingStartups.some(s => s.title.toLowerCase() === trimmedTitle.toLowerCase());
          if (exists) {
            setTitleStatus('taken');
            setTitleMessage('⚠️ Startup exists with this title.');
          } else {
            setTitleStatus('available');
            setTitleMessage('✓ Startup title is available.');
          }
        }
      } catch {
        // Local fallback check
        const exists = existingStartups.some(s => s.title.toLowerCase() === trimmedTitle.toLowerCase());
        if (exists) {
          setTitleStatus('taken');
          setTitleMessage('⚠️ Startup exists with this title.');
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

    if (titleStatus === 'taken') {
      setErrorMsg('Please select a unique title. A startup with this name already exists.');
      return;
    }

    if (!title || !shortDescription || !requiredRoles || !requiredSkills) {
      setErrorMsg('Please fill in all mandatory fields (Title, Description, Roles, Skills).');
      return;
    }

    setIsLoading(true);

    const payload = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      problemStatement: problemStatement.trim(),
      solution: solution.trim(),
      requiredRoles: requiredRoles.trim(),
      requiredSkills: requiredSkills.trim(),
      teamSize: teamSize.trim(),
      category: category.trim(),
      founderId: currentUser?.id || 1,
      founderName: currentUser?.name || 'Founder'
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
        setErrorMsg(errorText || 'Failed to save startup to database.');
      }
    } catch (err) {
      console.warn('Backend unavailable, using prototype local save fallback:', err);
      const mockCreated = { id: Date.now(), ...payload, createdAt: new Date().toISOString() };
      onStartupCreated(mockCreated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
              placeholder="e.g. EcoTrack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {titleMessage && (
              <div className={`title-availability-msg ${titleStatus}`}>
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
              placeholder="A smart waste management and recycling platform."
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
              {isLoading ? 'Saving Startup...' : 'Create Startup & Save to MySQL'}
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
