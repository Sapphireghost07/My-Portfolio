/**
 * CONTENT.JS — Single Source of Truth
 * All text content extracted EXACTLY from index.html
 * S Abdul Baasit Portfolio
 */

export const PERSONAL = {
  name: 'S Abdul Baasit',
  initials: 'SAB',
  title: 'Software Developer',
  email: 'afzalabd207@gmail.com',
  phone: '+918073434893',
  linkedin: 'https://www.linkedin.com/in/abdulbaasit07',
  github: 'https://github.com',
  resume: 'assets/Abdul_Baasit_Updated_Resume.pdf',
  photo: 'assets/profile.jpg',
  availability: 'Available for work',
  bio: 'Hands-on experience building enterprise-grade Angular applications at Petro Infotech. Proud recipient of the AI Transition Award for integrating AI tools across the SDLC.',
};

export const ROLES = [
  'Angular & TypeScript',
  'REST API Integration',
  'Responsive UI Engineering',
  'AI-Assisted Development',
];

export const STICKY_FACTS = [
  '🚀 Open to work',
  '📍 Kozhikode, India',
  '🎓 B.Tech CSE',
  '🤖 AI Transition Award',
  '⚡ Angular Specialist',
];

export const SKILLS = [
  // Core
  { name: 'HTML5',              level: 90, category: 'frontend', icon: 'fa-brands fa-html5',          color: '#e34c26' },
  { name: 'CSS3',               level: 88, category: 'frontend', icon: 'fa-brands fa-css3-alt',        color: '#264de4' },
  { name: 'SCSS',               level: 80, category: 'frontend', icon: 'fa-brands fa-sass',            color: '#cc6699' },
  { name: 'JavaScript (ES6+)',  level: 85, category: 'frontend', icon: 'fa-brands fa-js',              color: '#f7df1e' },
  { name: 'TypeScript',         level: 82, category: 'frontend', icon: 'fa-solid fa-code',             color: '#3178c6' },
  // Angular
  { name: 'Angular',            level: 88, category: 'frontend', icon: 'fa-brands fa-angular',         color: '#dd0031' },
  { name: 'Reactive Forms',     level: 82, category: 'frontend', icon: 'fa-solid fa-list-check',       color: '#dd0031' },
  { name: 'Angular Router',     level: 84, category: 'frontend', icon: 'fa-solid fa-route',            color: '#dd0031' },
  { name: 'Route Guards',       level: 78, category: 'frontend', icon: 'fa-solid fa-shield-halved',    color: '#dd0031' },
  { name: 'RxJS',               level: 76, category: 'frontend', icon: 'fa-solid fa-wave-square',      color: '#dd0031' },
  { name: 'HttpClient',         level: 80, category: 'frontend', icon: 'fa-solid fa-network-wired',    color: '#dd0031' },
  // UI
  { name: 'Bootstrap',          level: 85, category: 'frontend', icon: 'fa-brands fa-bootstrap',       color: '#7952b3' },
  { name: 'PrimeNG',            level: 75, category: 'frontend', icon: 'fa-solid fa-cubes',            color: '#4caf50' },
  { name: 'Responsive Design',  level: 88, category: 'frontend', icon: 'fa-solid fa-mobile-screen-button', color: '#00bcd4' },
  // Backend
  { name: 'REST API',           level: 82, category: 'backend',  icon: 'fa-solid fa-server',           color: '#607d8b' },
  { name: 'JSON Server',        level: 78, category: 'backend',  icon: 'fa-solid fa-database',         color: '#4caf50' },
  { name: 'ASP.NET Web API',    level: 65, category: 'backend',  icon: 'fa-solid fa-layer-group',      color: '#512bd4' },
  { name: 'PL/SQL (Basic)',     level: 55, category: 'backend',  icon: 'fa-solid fa-database',         color: '#f80000' },
  // Tools
  { name: 'Python',             level: 70, category: 'tools',    icon: 'fa-brands fa-python',          color: '#3776ab' },
  { name: 'GitHub',             level: 85, category: 'tools',    icon: 'fa-brands fa-github',          color: '#ffffff' },
  { name: 'VS Code',            level: 92, category: 'tools',    icon: 'fa-solid fa-code',             color: '#007acc' },
  { name: 'Node.js CLI',        level: 72, category: 'tools',    icon: 'fa-solid fa-terminal',         color: '#339933' },
  { name: 'Manual QA',          level: 75, category: 'tools',    icon: 'fa-solid fa-vial-circle-check',color: '#ff9800' },
  { name: 'AI-Assisted Dev',    level: 88, category: 'tools',    icon: 'fa-solid fa-wand-magic-sparkles', color: '#00c8ff' },
];

export const EXPERIENCE = [
  {
    id: 'petro',
    title: 'Software Developer Trainee',
    company: 'Petro Infotech',
    period: 'Oct 2025 – Present',
    location: 'Kozhikode (On-site)',
    type: 'Current',
    highlights: [
      'Developed and enhanced frontend features for DigiHR — an HR management platform — building Angular components, services, and routing for employee, payroll, and attendance workflows.',
      'Contributed to NBG DigiHR (government deployment for Oman), implementing Angular UI logic and integrating ASP.NET Web API endpoints for client-specific requirements.',
      'Worked on IGC-MIS for Integrated Gas Company (Oman), handling Angular development and API integration, with AI-assisted support for PL/SQL procedures.',
      'Applied AI-assisted development tools across SDLC tasks to accelerate implementation and improve test case quality.',
      'Received the AI Transition Award for notable contributions integrating AI tools into workflows.',
    ],
  },
  {
    id: 'edunet',
    title: 'Frontend Developer Intern',
    company: 'Edunet Foundation',
    period: 'Jun 2024 – Jul 2024',
    location: 'Remote',
    type: 'Internship',
    highlights: [
      'Built a responsive e-commerce web application with dynamic product listings, category filters, search, and checkout flow using HTML, CSS, and JavaScript.',
      'Improved UI consistency and accessibility across pages, gaining practical experience in responsive design and real-world frontend development.',
    ],
  },
];

export const PROJECTS = [
  {
    id: 'careerconnect',
    name: 'CareerConnect',
    sub: 'Role-Based Job Board Application',
    icon: 'briefcase',
    tags: ['Angular', 'TypeScript', 'PrimeNG', 'SweetAlert2', 'SCSS'],
    highlights: [
      'Full job board with separate Job Seeker and Employer experiences using component-driven Angular.',
      'Route guards and role-based access control for secure navigation and personalised dashboards.',
      'Employer-side CRUD for job listings; job seeker workflows for profile creation and application tracking.',
    ],
    live: null,
    source: null,
  },
  {
    id: 'usermgmt',
    name: 'User Management System',
    sub: 'Full CRUD with REST API',
    icon: 'users-gear',
    tags: ['Angular', 'TypeScript', 'JSON Server', 'HttpClient', 'SweetAlert2'],
    highlights: [
      'Full CRUD with Angular Reactive Forms, services, routing, and REST API integration via JSON Server.',
      'Input validation, reusable component design, smooth user workflows for creating, updating, deleting records.',
      'Toastr notifications, SweetAlert2 confirmations, and Font Awesome iconography.',
    ],
    live: null,
    source: null,
  },
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    sub: '3D Immersive Website',
    icon: 'globe',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Three.js', 'GitHub Pages'],
    highlights: [
      'Designed and deployed a responsive portfolio with dark/light theming, 3D scroll effects, and immersive Three.js background.',
      'Hosted on GitHub Pages with optimised assets for consistent performance across devices.',
    ],
    live: null,
    source: null,
  },
  {
    id: 'flipkart',
    name: 'Flipkart Clone',
    sub: 'E-Commerce UI',
    icon: 'cart-shopping',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    highlights: [
      'Responsive e-commerce UI clone with product listings, category browsing, search, filtering, and cart flow built with modular JavaScript.',
    ],
    live: null,
    source: null,
  },
];

export const EDUCATION = [
  {
    degree: 'B.Tech — Computer Science Engineering',
    institution: 'BSA Crescent Institute of Science & Technology, Chennai',
    period: '2021 – 2025',
    grade: 'CGPA: 7.75',
    icon: 'graduation-cap',
  },
  {
    degree: 'Senior Secondary (CBSE, Class XII)',
    institution: 'Velammal Vidhyashram, Chennai',
    period: '2019 – 2021',
    grade: '81.2%',
    icon: 'school',
  },
  {
    degree: 'Secondary (CBSE, Class X)',
    institution: 'TMAES DAV Public School, Hospet',
    period: '2019',
    grade: '85%',
    icon: 'book-open',
  },
];

export const CERTIFICATIONS = [
  {
    name: 'Full Stack Developer',
    issuer: 'OneRoadmap',
    date: 'Jul 2025',
    icon: 'certificate',
  },
  {
    name: 'Python Certification',
    issuer: 'OneRoadmap',
    date: 'Jul 2025',
    icon: 'python',
  },
  {
    name: 'Front-End Development',
    issuer: 'IBM SkillsBuild',
    date: '2024',
    icon: 'laptop-code',
  },
];

export const AWARDS = [
  {
    title: 'AI Transition Award',
    org: 'Petro Infotech',
    description:
      'Recognised for effectively integrating AI-assisted development tools into development and testing workflows, contributing to the organisation\'s AI adoption roadmap across the SDLC.',
    image: 'assets/ai-transition-award.jpg',
    tags: ['AI Tools', 'QA', 'Productivity'],
  },
];

export const SECTION_LABELS = {
  hero:    '// who i am',
  about:   '// my story',
  projects:'// what i built',
  skills:  '// what i know',
  contact: '// say hi',
};

export const BOOK_TITLES = [
  'Clean Code',
  'JS: The Good Parts',
  'You Don\'t Know JS',
  'Angular in Action',
  'CSS Secrets',
  'TypeScript Deep Dive',
];
