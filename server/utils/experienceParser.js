/**
 * Experience and education extraction from resume text
 */

function extractExperienceYears(text) {
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
    /(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|of)\s*(?:software|development|engineering)/i,
    /(?:over|more than|approximately)\s*(\d+)\s*(?:years?|yrs?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const years = parseInt(match[1]);
      if (years > 0 && years < 50) return years;
    }
  }

  const dateRangePattern = /(\d{4})\s*[-–to]+\s*(\d{4}|[Pp]resent|[Cc]urrent)/gi;
  const ranges = [];
  let m;
  while ((m = dateRangePattern.exec(text)) !== null) {
    const s = parseInt(m[1]);
    const e = m[2].toLowerCase() === 'present' || m[2].toLowerCase() === 'current' ? new Date().getFullYear() : parseInt(m[2]);
    if (s >= 1970 && s <= new Date().getFullYear() && e >= s) ranges.push({ start: s, end: e });
  }
  if (ranges.length > 0) {
    const minS = Math.min(...ranges.map(r => r.start));
    const maxE = Math.max(...ranges.map(r => r.end));
    return maxE - minS;
  }
  return 0;
}

function extractEducation(text) {
  const lower = text.toLowerCase();
  const levels = [
    { level: 'phd', patterns: [/\bph\.?d\.?\b/, /\bdoctorate\b/] },
    { level: 'masters', patterns: [/\bm\.?s\.?\b/, /\bmaster'?s?\b/, /\bm\.?tech\b/, /\bm\.?b\.?a\b/] },
    { level: 'bachelors', patterns: [/\bb\.?s\.?\b/, /\bbachelor'?s?\b/, /\bb\.?tech\b/, /\bb\.?b\.?a\b/] },
    { level: 'high_school', patterns: [/\bhigh school\b/, /\bdiploma\b/] }
  ];
  for (const { level, patterns } of levels) {
    for (const p of patterns) {
      if (p.test(lower)) return { level, details: level };
    }
  }
  return { level: 'unknown', details: 'Not specified' };
}

function extractExperienceDetails(text) {
  const sections = text.split(/\n/);
  const keywords = ['experience', 'work history', 'employment'];
  let inside = false;
  const details = [];
  for (const line of sections) {
    const t = line.trim();
    if (!t) continue;
    if (keywords.some(kw => t.toLowerCase().includes(kw))) { inside = true; continue; }
    if (inside) {
      if (/^(education|skills|projects|certifications)/i.test(t)) break;
      details.push(t);
    }
  }
  return details.slice(0, 15).join('\n');
}

module.exports = { extractExperienceYears, extractEducation, extractExperienceDetails };
