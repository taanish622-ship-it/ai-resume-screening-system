const natural = require('natural');
const { extractSkills, calculateSkillMatch } = require('./skillExtractor');
const { extractExperienceYears, extractEducation } = require('./experienceParser');

const TfIdf = natural.TfIdf;

/**
 * Calculate cosine similarity between two text documents using TF-IDF
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const tfidf = new TfIdf();
  tfidf.addDocument(text1.toLowerCase());
  tfidf.addDocument(text2.toLowerCase());

  const terms = new Set();
  tfidf.listTerms(0).forEach(t => terms.add(t.term));
  tfidf.listTerms(1).forEach(t => terms.add(t.term));

  const vec1 = [], vec2 = [];
  terms.forEach(term => {
    vec1.push(tfidf.tfidf(term, 0));
    vec2.push(tfidf.tfidf(term, 1));
  });

  let dot = 0, mag1 = 0, mag2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (mag1 * mag2);
}

/**
 * Score experience match
 */
function scoreExperience(candidateYears, jobDescription) {
  const reqMatch = jobDescription.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const requiredYears = reqMatch ? parseInt(reqMatch[1]) : 3;

  if (candidateYears >= requiredYears) return 100;
  if (candidateYears === 0) return 10;
  return Math.min(100, (candidateYears / requiredYears) * 100);
}

/**
 * Score education match
 */
function scoreEducation(candidateLevel, jobDescription) {
  const levels = { 'unknown': 0, 'high_school': 1, 'bachelors': 2, 'masters': 3, 'phd': 4 };
  const lower = jobDescription.toLowerCase();

  let requiredLevel = 'bachelors';
  if (/\bph\.?d\b/i.test(lower)) requiredLevel = 'phd';
  else if (/\bmaster/i.test(lower)) requiredLevel = 'masters';
  else if (/\bbachelor/i.test(lower)) requiredLevel = 'bachelors';

  const candidateScore = levels[candidateLevel] || 0;
  const requiredScore = levels[requiredLevel] || 2;

  if (candidateScore >= requiredScore) return 100;
  if (candidateScore === 0) return 20;
  return (candidateScore / requiredScore) * 100;
}

/**
 * Main scoring function — generates overall score with breakdown
 * Weights: skills 40%, experience 30%, education 15%, text similarity 15%
 */
function scoreCandidate(resumeText, jobDescription, jobSkills) {
  const candidateSkills = extractSkills(resumeText);
  const skillMatch = calculateSkillMatch(candidateSkills, jobSkills);
  const experienceYears = extractExperienceYears(resumeText);
  const education = extractEducation(resumeText);
  const textSim = calculateTextSimilarity(resumeText, jobDescription);

  const skillScore = skillMatch.matchPercentage;
  const expScore = scoreExperience(experienceYears, jobDescription);
  const eduScore = scoreEducation(education.level, jobDescription);
  const textScore = textSim * 100;

  const overall = Math.round(
    skillScore * 0.40 + expScore * 0.30 + eduScore * 0.15 + textScore * 0.15
  );

  return {
    score: Math.min(100, Math.max(0, overall)),
    scoreBreakdown: {
      skillMatch: Math.round(skillScore),
      experience: Math.round(expScore),
      education: Math.round(eduScore),
      textSimilarity: Math.round(textScore)
    },
    skills: candidateSkills,
    matchedSkills: skillMatch.matched,
    unmatchedSkills: skillMatch.unmatched,
    experienceYears,
    education: education.details,
    educationLevel: education.level
  };
}

module.exports = { scoreCandidate, calculateTextSimilarity };
