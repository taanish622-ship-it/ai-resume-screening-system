/**
 * Comprehensive skills taxonomy for resume matching
 */

const SKILLS_DATABASE = {
  // Programming Languages
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 'golang',
    'rust', 'swift', 'kotlin', 'php', 'scala', 'perl', 'r', 'matlab', 'dart', 'lua',
    'objective-c', 'haskell', 'elixir', 'clojure', 'shell', 'bash', 'powershell', 'sql',
    'html', 'css', 'sass', 'scss', 'less', 'graphql', 'solidity'
  ],

  // Frameworks & Libraries
  frameworks: [
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
    'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'svelte', 'ember', 'backbone',
    'express', 'expressjs', 'express.js', 'fastify', 'koa', 'hapi', 'nest', 'nestjs',
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot',
    'rails', 'ruby on rails', 'laravel', 'symfony', 'codeigniter',
    'asp.net', '.net', 'dotnet', '.net core',
    'jquery', 'bootstrap', 'tailwind', 'tailwindcss', 'material ui', 'mui',
    'redux', 'mobx', 'zustand', 'recoil', 'rxjs',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
    'flutter', 'react native', 'ionic', 'xamarin', 'electron'
  ],

  // Databases
  databases: [
    'mongodb', 'mongoose', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle',
    'sql server', 'mssql', 'redis', 'cassandra', 'dynamodb', 'couchdb', 'neo4j',
    'elasticsearch', 'firebase', 'firestore', 'supabase', 'mariadb', 'cockroachdb'
  ],

  // DevOps & Cloud
  devops: [
    'docker', 'kubernetes', 'k8s', 'aws', 'amazon web services', 'azure', 'gcp',
    'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean',
    'terraform', 'ansible', 'jenkins', 'gitlab ci', 'github actions', 'circleci',
    'nginx', 'apache', 'linux', 'ubuntu', 'centos',
    'ci/cd', 'devops', 'microservices', 'serverless', 'lambda'
  ],

  // Tools
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'jira', 'confluence', 'trello', 'asana', 'slack',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'postman', 'swagger', 'insomnia',
    'webpack', 'vite', 'rollup', 'parcel', 'babel',
    'npm', 'yarn', 'pnpm', 'pip', 'maven', 'gradle',
    'vs code', 'intellij', 'eclipse', 'vim'
  ],

  // Concepts & Methodologies
  concepts: [
    'rest', 'restful', 'api', 'graphql', 'grpc', 'websocket', 'oauth', 'jwt',
    'agile', 'scrum', 'kanban', 'waterfall', 'tdd', 'bdd', 'ci/cd',
    'oop', 'functional programming', 'design patterns', 'solid', 'mvc', 'mvvm',
    'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'nlp',
    'natural language processing', 'computer vision', 'data science', 'data analysis',
    'big data', 'data engineering', 'etl', 'data mining', 'data visualization',
    'blockchain', 'web3', 'defi', 'smart contracts',
    'unit testing', 'integration testing', 'e2e testing', 'automation testing',
    'responsive design', 'accessibility', 'seo', 'performance optimization',
    'system design', 'distributed systems', 'cloud architecture'
  ],

  // Soft Skills
  soft: [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'project management', 'time management', 'adaptability', 'creativity',
    'collaboration', 'mentoring', 'presentation', 'negotiation',
    'analytical', 'detail oriented', 'self motivated', 'fast learner'
  ]
};

// Flatten all skills into a single searchable array
const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat();

/**
 * Extract skills from resume text
 */
function extractSkills(text) {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set();

  for (const skill of ALL_SKILLS) {
    // Use word boundary matching for short skills to avoid false positives
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex;
    
    if (skill.length <= 2) {
      // Very short skills need strict boundaries (e.g., "r", "c")
      regex = new RegExp(`(?:^|\\s|,|;|\\||\\()${escapedSkill}(?:$|\\s|,|;|\\||\\))`, 'i');
    } else {
      regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    }

    if (regex.test(normalizedText)) {
      // Normalize skill names for display
      foundSkills.add(normalizeSkillName(skill));
    }
  }

  return Array.from(foundSkills);
}

/**
 * Normalize skill name for display
 */
function normalizeSkillName(skill) {
  const normalizations = {
    'reactjs': 'React', 'react.js': 'React', 'react': 'React',
    'vuejs': 'Vue.js', 'vue.js': 'Vue.js', 'vue': 'Vue.js',
    'angularjs': 'Angular', 'angular': 'Angular',
    'nextjs': 'Next.js', 'next.js': 'Next.js',
    'expressjs': 'Express.js', 'express.js': 'Express.js', 'express': 'Express.js',
    'nestjs': 'NestJS', 'nest': 'NestJS',
    'nodejs': 'Node.js', 'node.js': 'Node.js',
    'typescript': 'TypeScript', 'javascript': 'JavaScript',
    'python': 'Python', 'java': 'Java', 'golang': 'Go', 'go': 'Go',
    'mongodb': 'MongoDB', 'mongoose': 'Mongoose',
    'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
    'mysql': 'MySQL', 'redis': 'Redis',
    'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
    'aws': 'AWS', 'gcp': 'GCP', 'azure': 'Azure',
    'git': 'Git', 'github': 'GitHub', 'gitlab': 'GitLab',
    'tailwindcss': 'Tailwind CSS', 'tailwind': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'springboot': 'Spring Boot', 'spring boot': 'Spring Boot',
    'ruby on rails': 'Ruby on Rails', 'rails': 'Ruby on Rails',
    'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch',
    'sklearn': 'Scikit-Learn', 'scikit-learn': 'Scikit-Learn',
    'graphql': 'GraphQL', 'restful': 'RESTful', 'rest': 'REST',
    'ci/cd': 'CI/CD', 'devops': 'DevOps',
    'html': 'HTML', 'css': 'CSS', 'sass': 'Sass', 'scss': 'SCSS',
    'sql': 'SQL', 'nosql': 'NoSQL',
    'figma': 'Figma', 'jira': 'Jira'
  };
  
  return normalizations[skill.toLowerCase()] || 
    skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Extract skills from job description (same logic)
 */
function extractJobSkills(description) {
  return extractSkills(description);
}

/**
 * Calculate skill match between candidate and job
 */
function calculateSkillMatch(candidateSkills, jobSkills) {
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());

  const matched = normalizedJobSkills.filter(s => normalizedCandidateSkills.includes(s));
  const unmatched = normalizedJobSkills.filter(s => !normalizedCandidateSkills.includes(s));

  const matchPercentage = normalizedJobSkills.length > 0 
    ? (matched.length / normalizedJobSkills.length) * 100 
    : 0;

  return {
    matched: matched.map(s => normalizeSkillName(s)),
    unmatched: unmatched.map(s => normalizeSkillName(s)),
    matchPercentage
  };
}

module.exports = {
  extractSkills,
  extractJobSkills,
  calculateSkillMatch,
  normalizeSkillName,
  SKILLS_DATABASE,
  ALL_SKILLS
};
