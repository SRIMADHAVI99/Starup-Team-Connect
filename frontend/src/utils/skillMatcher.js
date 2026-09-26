/**
 * Parses skills from string or array into trimmed lowercase strings
 */
export const parseSkills = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(s => String(s).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }
  return [];
};

/**
 * Parses roles from string or array into trimmed strings
 */
export const parseRoles = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(r => String(r).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(r => r.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Robust rule-based skill compatibility calculation
 * matched skills / total required skills * 100
 */
export const calculateSkillCompatibility = (userSkillsInput, startupSkillsInput) => {
  const userSkills = parseSkills(userSkillsInput);
  const reqSkills = parseSkills(startupSkillsInput);

  if (reqSkills.length === 0 || userSkills.length === 0) {
    return {
      percent: 0,
      matchedCount: 0,
      totalCount: reqSkills.length,
      matchedSkills: []
    };
  }

  const matchedSkills = reqSkills.filter(s => userSkills.includes(s));
  const percent = Math.round((matchedSkills.length / reqSkills.length) * 100);

  return {
    percent,
    matchedCount: matchedSkills.length,
    totalCount: reqSkills.length,
    matchedSkills
  };
};
