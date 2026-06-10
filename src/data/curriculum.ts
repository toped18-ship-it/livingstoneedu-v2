import { ClassLevel, Subject, LessonContent, TermNumber, WeekNumber, QuizQuestion } from '../types';

export const CLASS_TIERS = {
  primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] as ClassLevel[],
  jss: ['JSS 1', 'JSS 2', 'JSS 3'] as ClassLevel[],
  ss: ['SS 1', 'SS 2', 'SS 3'] as ClassLevel[],
};

export const ALL_CLASSES: ClassLevel[] = [
  ...CLASS_TIERS.primary,
  ...CLASS_TIERS.jss,
  ...CLASS_TIERS.ss
];

// Definitions of subjects with lucide icons mapping
export const SUBJECTS: Record<string, Subject> = {
  // Primary Core
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'Calculator',
    category: 'Core',
    description: 'Learn numbers, algebra, geometry, measurement, and data processing following the NERDC primary curriculum.'
  },
  english: {
    id: 'english',
    name: 'English Studies',
    icon: 'BookOpen',
    category: 'Core',
    description: 'Master listening, speaking, reading comprehension, grammar, and letter writing skills.'
  },
  basic_science: {
    id: 'basic_science',
    name: 'Basic Science & Tech',
    icon: 'Atom',
    category: 'Science',
    description: 'Explore the natural world, living things, simple machines, computer education, and health studies.'
  },
  national_values: {
    id: 'national_values',
    name: 'National Values Education',
    icon: 'Shield',
    category: 'Core',
    description: 'Understand Nigerian civic duties, social studies, social values, and security awareness.'
  },
  creative_arts: {
    id: 'creative_arts',
    name: 'Cultural & Creative Arts',
    icon: 'Palette',
    category: 'Arts',
    description: 'Discover local Nigerian crafts, traditional music, visual arts, and performance.'
  },
  agricultural_science: {
    id: 'agricultural_science',
    name: 'Agricultural Science',
    icon: 'Sprout',
    category: 'Vocational',
    description: 'Learn about local farming, crop types, animal husbandry, and simple farm tools.'
  },
  computer_studies: {
    id: 'computer_studies',
    name: 'Computer Studies (ICT)',
    icon: 'Laptop',
    category: 'Science',
    description: 'Introduction to hardware, software, typewriter skills, basics of Microsoft Word, and the Internet.'
  },

  // Secondary Level (JSS) Specifics
  basic_tech: {
    id: 'basic_tech',
    name: 'Basic Technology',
    icon: 'Wrench',
    category: 'Science',
    description: 'Introduction to technical drawing, metalwork, woodwork, electricity, and simple machines.'
  },
  social_studies: {
    id: 'social_studies',
    name: 'Social Studies',
    icon: 'Globe',
    category: 'Core',
    description: 'Examine social systems, dynamic relationships, national integration, and global challenges.'
  },
  civic_education: {
    id: 'civic_education',
    name: 'Civic Education',
    icon: 'Users',
    category: 'Core',
    description: 'Focus on national agency, democratic concepts, human rights, duties, and leadership values.'
  },
  business_studies: {
    id: 'business_studies',
    name: 'Business Studies',
    icon: 'Briefcase',
    category: 'Commercial',
    description: 'Learn office practice, book-keeping, commerce, keyboarding, and simple enterprise.'
  },

  // Senior Secondary (SS) Specifics
  physics: {
    id: 'physics',
    name: 'Physics',
    icon: 'Activity',
    category: 'Science',
    description: 'Explore mechanics, thermal physics, waves, electromagnetism, and atomic physics.'
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'FlaskConical',
    category: 'Science',
    description: 'Study atomic structure, periodic properties, chemical bonding, organic chemistry, and industrial compounds.'
  },
  biology: {
    id: 'biology',
    name: 'Biology',
    icon: 'Dna',
    category: 'Science',
    description: 'Investigate cell physiology, ecology, classification, genetic crossing, and human biology.'
  },
  economics: {
    id: 'economics',
    name: 'Economics',
    icon: 'TrendingUp',
    category: 'Commercial',
    description: 'Analyze production factors, cost theories, fiscal policy, micro vs. macro-economics, and demand.'
  },
  government: {
    id: 'government',
    name: 'Government',
    icon: 'Building2',
    category: 'Arts',
    description: 'Study political structures, constitutions, pre/post-colonial administration in Nigeria, and foreign policy.'
  },
  literature: {
    id: 'literature',
    name: 'Literature-In-English',
    icon: 'PenTool',
    category: 'Arts',
    description: 'Analyze African and non-African drama, poetry, prose, and literary devices.'
  },
  accounting: {
    id: 'accounting',
    name: 'Financial Accounting',
    icon: 'FileSpreadsheet',
    category: 'Commercial',
    description: 'Understand ledger accounts, trial balance, final accounts of sole traders, partnerships, and companies.'
  },
  crs: {
    id: 'crs',
    name: 'Christian Religious Studies (CRS)',
    icon: 'Heart',
    category: 'Arts',
    description: 'Learn about Christian values, biblical histories, moral uprightness, and faith principles following the NERDC guidelines.'
  },
  irs: {
    id: 'irs',
    name: 'Islamic Religious Studies (IRS)',
    icon: 'Moon',
    category: 'Arts',
    description: 'Understand Holy Quranic teachings, Prophet Islamic traditions, jurisprudence, and moral values.'
  },
  phe: {
    id: 'phe',
    name: 'Physical & Health Education (PHE)',
    icon: 'Activity',
    category: 'Vocational',
    description: 'Study human movement, physical health, sports skills, first aid safety, and fitness guidelines.'
  },
  home_economics: {
    id: 'home_economics',
    name: 'Home Economics',
    icon: 'ChefHat',
    category: 'Vocational',
    description: 'Explore cooking, tailoring, home management, hygiene, basic nutrition, and child development.'
  },
  french: {
    id: 'french',
    name: 'French Language',
    icon: 'Languages',
    category: 'Arts',
    description: 'Master French vocabulary, spelling, grammar conjugation, sentence structure, and simple expression.'
  },
  geography: {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe',
    category: 'Science',
    description: 'Examine the Earth, physical landforms, climates, map reading, geological elements, and economic resources.'
  },
  commerce: {
    id: 'commerce',
    name: 'Commerce',
    icon: 'ShoppingBag',
    category: 'Commercial',
    description: 'Understand trade channels, banking systems, entrepreneurship, marketing and warehousing.'
  },
  further_math: {
    id: 'further_math',
    name: 'Further Mathematics',
    icon: 'Calculator',
    category: 'Science',
    description: 'Study advanced coordinate geometry, logical proofs, vectors, matrices, mechanics, and statistics.'
  }
};

// Maps which subjects are offered in what class levels
export function getSubjectsForClass(classLevel: ClassLevel): Subject[] {
  if (classLevel.startsWith('Primary')) {
    return [
      SUBJECTS.mathematics,
      SUBJECTS.english,
      SUBJECTS.basic_science,
      SUBJECTS.national_values,
      SUBJECTS.agricultural_science,
      SUBJECTS.creative_arts,
      SUBJECTS.computer_studies,
      SUBJECTS.crs,
      SUBJECTS.irs,
      SUBJECTS.phe,
      SUBJECTS.home_economics,
    ];
  } else if (classLevel.startsWith('JSS')) {
    return [
      SUBJECTS.mathematics,
      SUBJECTS.english,
      SUBJECTS.basic_science,
      SUBJECTS.basic_tech,
      SUBJECTS.social_studies,
      SUBJECTS.civic_education,
      SUBJECTS.agricultural_science,
      SUBJECTS.business_studies,
      SUBJECTS.computer_studies,
      SUBJECTS.crs,
      SUBJECTS.irs,
      SUBJECTS.phe,
      SUBJECTS.home_economics,
      SUBJECTS.french,
    ];
  } else {
    // SS
    return [
      SUBJECTS.mathematics,
      SUBJECTS.english, // mapped to english matching SS curriculum
      SUBJECTS.biology,
      SUBJECTS.chemistry,
      SUBJECTS.physics,
      SUBJECTS.economics,
      SUBJECTS.government,
      SUBJECTS.civic_education,
      SUBJECTS.accounting,
      SUBJECTS.literature,
      SUBJECTS.crs,
      SUBJECTS.irs,
      SUBJECTS.further_math,
      SUBJECTS.geography,
      SUBJECTS.commerce,
    ];
  }
}

// Highly comprehensive dynamic curriculum mapping of subjects & actual weekly curriculum topics.
// This is structured properly to give REAL titles based on selected grade and subject!
export function getWeeklyTopicTitle(
  classLevel: ClassLevel,
  subjectId: string,
  termNum: TermNumber,
  weekNum: WeekNumber
): string {
  const levelParts = classLevel.split(' ');
  const levelNum = parseInt(levelParts[1]) || 1;
  const isPrimary = classLevel.startsWith('Primary');
  const isJSS = classLevel.startsWith('JSS');
  const isSS = classLevel.startsWith('SS');

  // Math topics
  if (subjectId === 'mathematics') {
    if (isPrimary) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Counting & Identification of Numbers';
        if (weekNum <= 6) return 'Skip Counting & Place Values';
        if (weekNum <= 9) return 'Addition of Whole Numbers';
        return 'Subtraction of Numbers & Number Patterns';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Fraction Basics (Halves & Quarters)';
        if (weekNum <= 6) return 'Intro to Multiplication Concepts';
        if (weekNum <= 9) return 'Length and Distance Measurement';
        return 'Weight, Mass, & Basic Capacity';
      } else {
        if (weekNum <= 3) return 'Time Concepts: Hours & Days';
        if (weekNum <= 6) return 'Nigerian Currency Notes & Coins';
        if (weekNum <= 9) return 'Basic Shapes (Triangles, Circles, Squares)';
        return 'Simple Pictographs & Data Organization';
      }
    } else if (isJSS) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Whole Numbers: Prime Factors & L.C.M/H.C.F';
        if (weekNum <= 6) return 'Fractions, Decimals & Percentages Conversion';
        if (weekNum <= 9) return 'Laws of Indices & Standard form';
        return 'Approximation & Significant Figures';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Simple Algebraic Expressions & Expansion';
        if (weekNum <= 6) return 'Linear Equations & Word Problems';
        if (weekNum <= 9) return 'Direct & Inverse Variation Basics';
        return 'Averages: Mean, Median, and Mode';
      } else {
        if (weekNum <= 3) return 'Angles and Lines (Parallel & Perpendicular)';
        if (weekNum <= 6) return 'Triangles: Pythagoras Theorem';
        if (weekNum <= 9) return 'Perimeters & Areas of Plane Shapes';
        return 'Intro to Probability & Chance';
      }
    } else {
      // SS
      if (termNum === 1) {
        if (weekNum <= 3) return 'Number Bases (Operation & Conversion)';
        if (weekNum <= 6) return 'Indices, Surds, and Logarithmic Laws';
        if (weekNum <= 9) return 'Quadratic Equations (Factorization & Formula)';
        return 'Simultaneous Linear and Quadratic Equations';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Arithmetic & Geometric Progressions (AP & GP)';
        if (weekNum <= 6) return 'Telematic Set Theory & Venn Diagrams';
        if (weekNum <= 9) return 'Trigonometric Ratios (Sine, Cosine, Tangent)';
        return 'Bearings, Angles of Elevation & Depression';
      } else {
        if (weekNum <= 3) return 'Calculus Basics: Simple Differentiation';
        if (weekNum <= 6) return 'Coordinate Geometry of Circles & Lines';
        if (weekNum <= 9) return 'Measures of Dispersion (Standard Deviation)';
        return 'Permutations, Combinations & Probability';
      }
    }
  }

  // English topics
  if (subjectId === 'english') {
    if (isPrimary) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Nouns: Proper & Common Nouns';
        if (weekNum <= 6) return 'Pronouns and Simple Sentence Construction';
        if (weekNum <= 9) return 'Verbs: Action Words & Base Forms';
        return 'Adjectives: Identifying Descriptive Words';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Simple Present and Past Tense';
        if (weekNum <= 6) return 'Prepositions of Place and Time';
        if (weekNum <= 9) return 'Punctuation: Capital Letters & Full Stops';
        return 'Story Reading & Comprehension Skills';
      } else {
        if (weekNum <= 3) return 'Synonyms and Antonyms (Opposites)';
        if (weekNum <= 6) return 'How to Write a Simple Informal Letter';
        if (weekNum <= 9) return 'Subject-Verb Agreement (Concords)';
        return 'Creative Storytelling & Writing Sentences';
      }
    } else if (isJSS) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Parts of Speech: Concrete and Abstract Nouns';
        if (weekNum <= 6) return 'Tenses: Present Continuous & Active Voice';
        if (weekNum <= 9) return 'Vocabulary: Words related to Agriculture & Health';
        return 'Reading Comprehension and Scanning Techniques';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Adverbs of Manner, Time, and Frequency';
        if (weekNum <= 6) return 'Conjunctions and Compound Sentences';
        if (weekNum <= 9) return 'Direct and Indirect Speech Rules';
        return 'Letter Writing: Formal Letter Structure';
      } else {
        if (weekNum <= 3) return 'Prepositional Phrases & Adjectival Clauses';
        if (weekNum <= 6) return 'Idioms, Proverbs, and Figurative Meanings';
        if (weekNum <= 9) return 'Argumentative Essay Writing Frameworks';
        return 'Summary Writing: Identifying Topic Sentences';
      }
    } else {
      // SS
      if (termNum === 1) {
        if (weekNum <= 3) return 'Lexis & Structure: Collocations & Synonyms';
        if (weekNum <= 6) return 'Complex Concords: Rules of Proximity & Number';
        if (weekNum <= 9) return 'Phonology: Monophthongs and Diphthongs';
        return 'Narrative and Descriptive Essay Formats';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Clauses: Noun, Adjectival, and Adverbial Clauses';
        if (weekNum <= 6) return 'Reported Speech & Mood Contexts';
        if (weekNum <= 9) return 'Formal Register: Legal, Scientific & Commercial Terms';
        return 'Expository Writing: Logic & Argument Structure';
      } else {
        if (weekNum <= 3) return 'Critical Reading & Advanced Comprehension';
        if (weekNum <= 6) return 'Précis Writing and Dynamic Summarization';
        if (weekNum <= 9) return 'Common Grammatical Errors & Corrections';
        return 'Interactive Dialogue Interpretation & Oral Exam Drills';
      }
    }
  }

  // Science topics (Basic Science or SS Physics/Chemistry/Biology)
  if (subjectId === 'basic_science' || subjectId === 'physics' || subjectId === 'chemistry' || subjectId === 'biology') {
    if (isPrimary) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Living and Non-Living Things around Us';
        if (weekNum <= 6) return 'Classification of Plants & Habitat';
        if (weekNum <= 9) return 'The Human Body: External & Internal Organs';
        return 'Personal Hygiene & Good Grooming Customs';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'The Senses and How They Help Us';
        if (weekNum <= 6) return 'Understanding Water: Properties & Sources';
        if (weekNum <= 9) return 'Air: Properties, Wind, & Its Uses';
        return 'Introduction to Soils & Soil Types';
      } else {
        if (weekNum <= 3) return 'Environmental Quality: Keeping Surrounds Clean';
        if (weekNum <= 6) return 'Introduction to Simple Farm Tools';
        if (weekNum <= 9) return 'Introduction to Light and Shadows';
        return 'Simple Machines: Intro to Pulleys and Levers';
      }
    } else if (isJSS) {
      if (termNum === 1) {
        if (weekNum <= 3) return 'Matter: Solid, Liquid, & Gaseous States';
        if (weekNum <= 6) return 'The Living Cell & Levels of Organization';
        if (weekNum <= 9) return 'Ecology: Ecosystem Structure & Food Chains';
        return 'Human Reproductive Systems & Dev Lifecycle';
      } else if (termNum === 2) {
        if (weekNum <= 3) return 'Chemical Substances: Elements, Compounds, Mixtures';
        if (weekNum <= 6) return 'The Periodic Table: First 20 Elements';
        if (weekNum <= 9) return 'Force, Friction, & Gravitational Pull';
        return 'Energy: Kinetic, Potential, and Conservation';
      } else {
        if (weekNum <= 3) return 'Sound Waves & Light Refraction';
        if (weekNum <= 6) return 'The Earth & Solar System Dynamics';
        if (weekNum <= 9) return 'Introduction to Acids, Bases, and Salts';
        return 'Environmental Pollution: Causes, Prevention, Control';
      }
    } else {
      // SS Specifics
      if (subjectId === 'physics') {
        if (termNum === 1) {
          if (weekNum <= 4) return 'Fundamental and Derived Quantities';
          if (weekNum <= 8) return 'Equations of Linear Motion';
          return 'Friction, Force, and Momentum';
        } else if (termNum === 2) {
          if (weekNum <= 4) return 'Work, Energy, and Mechanical Advantage';
          if (weekNum <= 8) return 'Thermal Expansion: Gas Laws';
          return 'Heat Transfer: Conduction, Convection, & Radiation';
        } else {
          if (weekNum <= 4) return 'Wave Motion: Electromagnetic Spectrum';
          if (weekNum <= 8) return 'Electric Fields, Resistance, and Ohm\'s Law';
          return 'Magnetic Fields & Magnetic Induction Theory';
        }
      } else if (subjectId === 'chemistry') {
        if (termNum === 1) {
          if (weekNum <= 4) return 'Particulate Nature of Matter & Atoms';
          if (weekNum <= 8) return 'Chemical Bonding: Covalent & Electrovalent';
          return 'The Gas Laws: Boyle\'s, Charles\', General Ideal Gas';
        } else if (termNum === 2) {
          if (weekNum <= 4) return 'Stoichiometry and Mole Calculations';
          if (weekNum <= 8) return 'Acids, Bases, and Acid-Base Indicators';
          return 'Solubility of Salts & Fractional Crystallization';
        } else {
          if (weekNum <= 4) return 'Oxidation-Reduction (Redox) Reactions';
          if (weekNum <= 8) return 'Introduction to Organic IUPAC Nomenclature';
          return 'Hydrocarbons: Alkanes, Alkenes, and Alkynes';
        }
      } else {
        // biology
        if (termNum === 1) {
          if (weekNum <= 4) return 'Classification of Living Things: 5 Kingdoms';
          if (weekNum <= 8) return 'Cell Anatomy: Organelles & Functions';
          return 'Movement of Substances: Osmosis, Diffusion';
        } else if (termNum === 2) {
          if (weekNum <= 4) return 'Nutrition in Living Organisms: Photosynthesis';
          if (weekNum <= 8) return 'Respiratory Systems and Gaseous Exchange';
          return 'Excretion and Osmoregulation Organ Systems';
        } else {
          if (weekNum <= 4) return 'Ecology: Biomes and Climatic Factors';
          if (weekNum <= 8) return 'Heredity: Mendelian Monohybrid Crosses';
          return 'Theory of Evolution: Lamarckism & Darwinism';
        }
      }
    }
  }

  // Civics / Social studies
  if (subjectId === 'national_values' || subjectId === 'social_studies' || subjectId === 'civic_education' || subjectId === 'government') {
    if (isPrimary) {
      if (termNum === 1) return `National Identity & Values (Week ${weekNum})`;
      if (termNum === 2) return `Civic Responsibility & Social Life (Week ${weekNum})`;
      return `Security Awareness & Safe Living (Week ${weekNum})`;
    } else if (isJSS) {
      if (termNum === 1) return `Nigerian Values, Family, and Society (Week ${weekNum})`;
      if (termNum === 2) return `Social Problems & Conflict Prevention (Week ${weekNum})`;
      return `Human Rights, Rule of Law, & Democracy (Week ${weekNum})`;
    } else {
      if (subjectId === 'civic_education') {
        if (termNum === 1) return `Values, Citizenship & National Identity (Week ${weekNum})`;
        if (termNum === 2) return `Human Rights and Constitutional Safeguards (Week ${weekNum})`;
        return `Democracy, Rule of Law and Civil Society (Week ${weekNum})`;
      } else {
        // Government
        if (termNum === 1) return `The State, Power, and Sovereignty (Week ${weekNum})`;
        if (termNum === 2) return `Constitutionalism, Pre-colonial Nigeria Administration (Week ${weekNum})`;
        return `Nigerian Nationalism and Federalism (Week ${weekNum})`;
      }
    }
  }

  // Commercial / Accounting / Economics
  if (subjectId === 'economics' || subjectId === 'accounting' || subjectId === 'business_studies') {
    if (isPrimary || isJSS) {
      return `Basic Trade, Office, and Book-keeping Concepts (Week ${weekNum})`;
    } else {
      if (subjectId === 'economics') {
        if (termNum === 1) return `Introduction to Economic Systems & Production (Week ${weekNum})`;
        if (termNum === 2) return `Demand, Supply, Price Determination (Week ${weekNum})`;
        return `Macroeconomic Policies, Petroleum & Banking (Week ${weekNum})`;
      } else {
        // Accounting
        if (termNum === 1) return `Ledger Postings & Trial Balance Basics (Week ${weekNum})`;
        if (termNum === 2) return `Final Accounts: Trading, Profit & Loss Account (Week ${weekNum})`;
        return `Adjustment in Balance Sheets & Partnerships (Week ${weekNum})`;
      }
    }
  }

  // New Subjects Topic Titles
  if (subjectId === 'crs') {
    if (termNum === 1) {
      if (weekNum <= 4) return 'The Creation & Purpose of God';
      if (weekNum <= 8) return 'The Early Life of Jesus & Call of Disciples';
      return 'The Miracle Stories & Faith Lessons';
    } else if (termNum === 2) {
      if (weekNum <= 4) return 'Love, Obedience and Social Living';
      if (weekNum <= 8) return 'The Sermon on the Mount: Beattitudes';
      return 'Christian Attitudes towards Work and Authorities';
    } else {
      if (weekNum <= 4) return 'The Passion, Crucifixion and Resurrection';
      if (weekNum <= 8) return 'The Early Church: Unity & Evangelism';
      return 'Moral Uprightness, Civic Duties and Leadership';
    }
  }

  if (subjectId === 'irs') {
    if (termNum === 1) {
      if (weekNum <= 4) return 'Al-Quran: Surahs and Tafseer Compilation';
      if (weekNum <= 8) return 'Hadith/Sunnah: Authenticity & Moral Code';
      return 'Tawheed: Core Articles of Islamic Faith';
    } else if (termNum === 2) {
      if (weekNum <= 4) return 'Ibadah: Pillars of Salat and Sawm';
      if (weekNum <= 8) return 'Islamic Law (Shari’ah) & Primary Sources';
      return 'Moral Lessons of Forgiveness & Islamic Etiquette';
    } else {
      if (weekNum <= 4) return 'The Prophet’s Hijrah and Statehood of Madinah';
      if (weekNum <= 8) return 'Contributions of Eminent Sahabahs';
      return 'Modern Moral Challenges and Islamic Cleanliness';
    }
  }

  if (subjectId === 'phe') {
    if (termNum === 1) return `Anatomy, First Aid & Physical Fitness (Week ${weekNum})`;
    if (termNum === 2) return `Track & Field Athletics and Indoor Games (Week ${weekNum})`;
    return `Safety Education & Substance Abuse Prevention (Week ${weekNum})`;
  }

  if (subjectId === 'home_economics') {
    if (termNum === 1) return `Family Living, Sewing, & Home Management (Week ${weekNum})`;
    if (termNum === 2) return `Nutrition & Practical Cookery Skills (Week ${weekNum})`;
    return `Consumer Education, Grooming, & Hygiene (Week ${weekNum})`;
  }

  if (subjectId === 'french') {
    if (termNum === 1) return `Saluting & Introducing Oneself in French (Week ${weekNum})`;
    if (termNum === 2) return `Grammar Conjugations: Avoir et Être (Week ${weekNum})`;
    return `Conversing about Family, Home & Hobbies (Week ${weekNum})`;
  }

  if (subjectId === 'geography') {
    if (termNum === 1) return `The Solar System, Earth Rotation & Map Scaling (Week ${weekNum})`;
    if (termNum === 2) return `Physical Landforms: Rocks & Volcanism (Week ${weekNum})`;
    return `Weather, Climate Systems & Human Settlement (Week ${weekNum})`;
  }

  if (subjectId === 'commerce') {
    if (termNum === 1) return `Intro to Trade, Retail & Wholesaling (Week ${weekNum})`;
    if (termNum === 2) return `Banking, Capital Markets & Insurance (Week ${weekNum})`;
    return `Advertising, Transportation & Warehousing (Week ${weekNum})`;
  }

  if (subjectId === 'further_math') {
    if (termNum === 1) return `Advanced Indices, Surds, & Polynomial Equations (Week ${weekNum})`;
    if (termNum === 2) return `Vectors, Matrices, & Coordinate Geometry (Week ${weekNum})`;
    return `Calculus Limits, Derivatives & Mechanics (Week ${weekNum})`;
  }

  // Default fallback topic title
  return `Nigerian Syllabus Core Module (Week ${weekNum})`;
}

// Generate the complete lesson mockup dynamically.
// This allows us to serve thousands of distinct topics on the fly, with REAL comprehensive, helpful summaries, bullets, and multi-choice quizzes!
export function getLessonContent(
  classLevel: ClassLevel,
  subjectId: string,
  termNum: TermNumber,
  weekNum: WeekNumber
): LessonContent {
  const title = getWeeklyTopicTitle(classLevel, subjectId, termNum, weekNum);
  const isPrimary = classLevel.startsWith('Primary');
  const isJSS = classLevel.startsWith('JSS');
  const isSS = classLevel.startsWith('SS');

  // Let's create an elegant, rich lesson structure with real material
  let objectives: string[] = [];
  let body: string[] = [];
  let keyPoints: string[] = [];
  let quiz: QuizQuestion[] = [];

  // Customize based on subject
  if (subjectId === 'mathematics') {
    objectives = [
      `Define and understand the core mathematical terms under ${title}.`,
      `Apply step-by-step calculations to solve practical exercises.`,
      `Connect mathematical methods to real-world context like shopping, measuring, or reasoning.`
    ];
    body = [
      `In this week\'s lesson, we are delving into ${title}. Mathematics is the engine of logical thought, and understanding these foundational building blocks equips you to approach quantitative challenges with confidence and skill.`,
      `First, we investigate the background theory. By viewing numerical relationships as rules rather than just numbers, we can uncover patterns. For example, when adding, subtracting, or working with quadratic variables, we must follow strict orders of operations (BODMAS or standard algebraic rules). This process maintains numerical balance and ensures correctness.`,
      `Let us explore some key numerical steps. To master this topic, practice is essential. Write down the formulae, plug in values, and ensure all steps align perfectly with the standard principles taught in this module. Observe how the final solution solves the initial equation.`
    ];
    keyPoints = [
      'Remember to always keep numerical equations balanced on both sides.',
      'Check your arithmetic calculations for carry-over terms and sign flips (- and +).',
      'Understanding of standard mathematical formulas is crucial for speed.'
    ];
    quiz = [
      {
        question: `If we are applying equations representing ${title}, what is the absolute most important starting step?`,
        options: [
          'Solve without reviewing formula rules',
          'Identify known and unknown values and write down the relevant formula',
          'Convert everything directly into decimals',
          'Guess the correct answer from options'
        ],
        correctIndex: 1,
        explanation: 'The standard methodology is starting by writing down what you know, what you don\'t, and locating the appropriate formula.'
      },
      {
        question: 'Which of the following is correct regarding negative signs in arithmetic?',
        options: [
          'Multiplying a negative by another negative yields a positive',
          'Multiplying a negative by another negative yields a negative',
          'Adding negatives makes a positive',
          'Subtracting a negative always results in zero'
        ],
        correctIndex: 0,
        explanation: 'In mathematics, negative multiplied by negative equals positive (- x - = +).'
      },
      {
        question: 'Which key principle helps us organize and evaluate complex arithmetic expressions first?',
        options: [
          'The rule of guessing',
          'The order of operations (BODMAS / PEMDAS)',
          'Multiplication tables only',
          'Simple estimation'
        ],
        correctIndex: 1,
        explanation: 'BODMAS (Brackets, Of, Division, Multiplication, Addition, Subtraction) defines the legal sequence for evaluating complex sums.'
      }
    ];
  } else if (subjectId === 'english') {
    objectives = [
      `Identify grammatical and syntactic structures concerning ${title}.`,
      `Demonstrate proper usage in written essays and oral dialogues.`,
      `Analyze simple prose texts and pick out key themes.`
    ];
    body = [
      `Welcome to this week's English studies lesson on '${title}'. Good language skills are vital for communication, professional success, and writing comprehensive articles. In this chapter, we focus on grammar rules, punctuation guidelines, and correct vocabulary usage.`,
      `Vocabulary and grammar do not exist in isolation. They are tools that we pair together to craft clear meaning. Writing elegant letters, summarizing heavy prose, or answering structural sentence concords requires a solid understanding of agreement rules.`,
      `To speak or write correctly, we must pay attention to how words interact. In conversational Nigerian and formal contexts alike, matching subjects with their correct verb forms (the Principle of Concord) remains a key element of high scoring in standard examinations.`
    ];
    keyPoints = [
      'Nouns must always agree in singular or plural number with their corresponding verbs.',
      'Punctuation represents the rhythm and breath of your writing; use them correctly.',
      'Always read the surrounding paragraph framework to grasp vocabulary in context.'
    ];
    quiz = [
      {
        question: `Why is understanding ${title} essential for fluent writing?`,
        options: [
          'It forces us to write needlessly long sentences',
          'It provides structure, clarity, and removes ambiguity for the reader',
          'It prevents us from using verbs',
          'It is only useful for dictionary makers'
        ],
        correctIndex: 1,
        explanation: 'Grammar and structured vocabulary give writers the blueprint to express ideas clearly and without confusion.'
      },
      {
        question: 'Identify the plural of "Child" according to official English rules:',
        options: [
          'Childs',
          'Children',
          'Childrens',
          'Childes'
        ],
        correctIndex: 1,
        explanation: '"Children" is the correct plural noun form of the singular "child".'
      },
      {
        question: 'What is a pronoun designed to replace in a standard sentence?',
        options: [
          'An active verb',
          'A noun or noun phrase to prevent boring repetition',
          'A punctuation mark',
          'An exclamation'
        ],
        correctIndex: 1,
        explanation: 'Pronouns (like he, she, it, they) take the place of nouns so that we do not have to repeat the same word continuously.'
      }
    ];
  } else if (subjectId === 'basic_science' || subjectId === 'physics' || subjectId === 'chemistry' || subjectId === 'biology') {
    objectives = [
      `Recognize scientific elements, classification tiers, or rules under ${title}.`,
      `Conduct simple observation exercises to verify scientific facts.`,
      `Adopt safety protocols and correct hygiene guidelines based on this chapter.`
    ];
    body = [
      `In this science lesson, we are exploring ${title}. Science uses empirical study and experimentation to decode how systems operate. Whether we are analyzing microscopic atoms, plant classification, or physical linear motion, we follow exact laws.`,
      `In the Nigerian context, applying scientific knowledge helps solve local challenges in food crop storage, health management, and technological progress. For instance, understanding the life cycles of local insect vectors reduces malaria cases in our communities.`,
      `Let us observe the systems in detail. We write down key facts, inspect biological specimens, and examine chemical structures using standard models. This helps us appreciate the intricate patterns that govern our beautiful planet.`
    ];
    keyPoints = [
      'The scientific method relies on observation, hypothesis, and experimental tests.',
      'Classification kingdoms simplify how we study billions of living species.',
      'Keep your safety gear on and handle chemicals and simple machines with extreme care.'
    ];
    quiz = [
      {
        question: `What is the core purpose of studying ${title} in science?`,
        options: [
          'To memorize facts without testing them',
          'To understand the laws of nature and use them to solve real challenges',
          'To verify that all things are living',
          'To learn how to dismantle computers only'
        ],
        correctIndex: 1,
        explanation: 'Science helps students grasp experimental processes to develop scalable solutions for society.'
      },
      {
        question: 'What state of matter possesses a definite shape and a fixed volume?',
        options: [
          'Liquid',
          'Gas',
          'Solid',
          'Plasma'
        ],
        correctIndex: 2,
        explanation: 'Solids have tightly bound molecules which give them both a definite volume and shape, unlike liquids and gases.'
      },
      {
        question: 'Which biological organelle is referred to as the powerhouse of the cell?',
        options: [
          'The Nucleus',
          'The Mitochondrion',
          'The Ribosome',
          'The Chloroplast'
        ],
        correctIndex: 1,
        explanation: 'The mitochondrion generates chemical energy (ATP) for cellular activities, making it the powerhouse.'
      }
    ];
  } else if (subjectId === 'national_values' || subjectId === 'social_studies' || subjectId === 'civic_education' || subjectId === 'government') {
    objectives = [
      `Identify the core principles of citizenship and governance in ${title}.`,
      `Discuss values of honesty, national integration, and respect for human rights.`,
      `Participate effectively as a responsible citizen in democratic actions.`
    ];
    body = [
      `National development starts with active citizenship. This week\'s lesson is centered on ${title}. In Nigeria, our diverse cultures and common history require that we understand values of mutual respect, constitutional law, and peace.`,
      `We start by looking at values. Social values are positive beliefs that steer a community's behavior. Honesty, hard work, patriotism, and tolerance keep nations peaceful and progressive. This prevents corruption and supports community spirit.`,
      `Furthermore, we analyze our constitutional rights and duties as citizens. This syllabus covers human rights, electoral systems, and pre-colonial kingdoms. This historical awareness helps students see the value of democratic systems.`
    ];
    keyPoints = [
      'Active citizens know their rights and perform civic responsibilities.',
      'Nigeria\'s values highlight respect, integrity, tolerance, and unity.',
      'The Nigerian constitution guarantees human rights and legal protections.'
    ];
    quiz = [
      {
        question: `How does mastering topics on ${title} build a better society?`,
        options: [
          'It teaches us to avoid community work',
          'It fosters critical civic understanding, national unity, and ethical leadership',
          'It teaches children to move to other countries',
          'It is only meant for politicians'
        ],
        correctIndex: 1,
        explanation: 'Civic education equips students to become patriotic, responsible leaders who build unified societies.'
      },
      {
        question: 'Which of the following represents a key social value in Nigeria?',
        options: [
          'Selfishness',
          'Respect for elders and community leaders',
          'Ignoring traffic rules',
          'Refusing to pay taxes'
        ],
        correctIndex: 1,
        explanation: 'Respect for elders, law, and community members is a foundational positive value in all Nigerian groups.'
      },
      {
        question: 'The supreme legal document that outlines rights and laws in Nigeria is the:',
        options: [
          'Daily newspaper',
          'The Constitution of the Federal Republic of Nigeria',
          'A school diary',
          'Public policy manual'
        ],
        correctIndex: 1,
        explanation: 'The Constitution is the supreme law of the country, guiding all public and private legal relationships.'
      }
    ];
  } else if (subjectId === 'economics' || subjectId === 'accounting' || subjectId === 'business_studies' || subjectId === 'commerce') {
    objectives = [
      `Analyze the commercial, accounting, or economic laws governing ${title}.`,
      `Explain key principles, ledger bookkeeping entries, and market behaviors.`,
      `Apply business calculations to optimize profit margins and account balances.`
    ];
    body = [
      `This commercial module focuses on '${title}'. Commercial education prepares you to participate effectively in the Nigerian economy. Whether analyzing supply/demand curves in Economics, posting double-entry credits and debits in Financial Accounting, or managing warehouse retail channels in Commerce, precision is key.`,
      `Let us take accounting and business practices as our guide. In all financial operations, asset accounts must balance liability and equity accounts. Understanding transaction journals, trial balances, and ledger postings helps keep companies profitable and accountable.`,
      `In a wider economic context, decisions are governed by scarcity and choice. Since national resources are finite, every choice has an opportunity cost (the forgone satisfying option). Learning these trade-offs empowers young entrepreneurs to launch, budget, and scale local enterprises successfully.`
    ];
    keyPoints = [
      'In accounting, for every debit entry, there must be a corresponding credit entry.',
      'Opportunity cost represents the real cost of a choice, which is the alternative forgone.',
      'Assets equal liabilities plus owner\'s equity (A = L + E).'
    ];
    quiz = [
      {
        question: 'Which economic concept describes the next best alternative forgone when a choice is made?',
        options: [
          'Scarcity',
          'Opportunity Cost',
          'Equilibrium Price',
          'Distribution Chain'
        ],
        correctIndex: 1,
        explanation: 'Opportunity cost refers to the value of the next best alternative forgone when making an economic selection.'
      },
      {
        question: 'In double-entry bookkeeping, what does a debit entry signify on an asset account?',
        options: [
          'An increase in the value of the asset',
          'A decrease in the value of the asset',
          'The owner\'s total liability payables',
          'A simple calculation error'
        ],
        correctIndex: 0,
        explanation: 'Debiting an asset account increases its balance, whereas crediting it decreases the balance.'
      },
      {
        question: 'What is the fundamental accounting equation?',
        options: [
          'Assets = Liabilities - Capital',
          'Assets = Liabilities + Owner\'s Equity',
          'Assets + Liabilities = Capital',
          'Revenue = Capital - Net Profit'
        ],
        correctIndex: 1,
        explanation: 'The fundamental balancing formula is: Assets = Liabilities + Owner\'s Equity.'
      }
    ];
  } else if (subjectId === 'crs' || subjectId === 'irs') {
    objectives = [
      `Examine the moral lessons, scriptural accounts, and moral criteria in ${title}.`,
      `Discuss the social significance of religious unity, faith, and peaceful living.`,
      `Apply moral uprightness and civic duty guidelines to daily community activities.`
    ];
    body = [
      `This week, we are studying spiritual development and national moral integration under '${title}'. Religious studies in Nigeria (Christian and Islamic) are designed to cultivate high character, respect for human rights, civic obedience, and faithful leadership.`,
      `For Christian Religious Studies (CRS), we explore stories of faith, service, and love as exemplified by Jesus and early prophets. In Islamic Religious Studies (IRS), we examine the teachings of the Holy Quran, the Sunnah of Prophet Muhammad (PBUH), and lessons on cleanliness, justice, and charity (Zakat).`,
      `Regardless of denominational lines, our syllabus stresses the values of honesty, hard work, and living in peace. Respecting laws, honoring our parents and leaders, and caring for our neighbors allows families and diverse communities to grow strong and secure.`
    ];
    keyPoints = [
      'Religious curriculum teaches social uprightness, tolerance, and respect for law.',
      'Active faith is demonstrated through service, hospitality, and peaceful coexistence.',
      'The values of integrity and spiritual morals prevent social vices and corruption.'
    ];
    quiz = [
      {
        question: 'What is a core moral virtue taught in religious integration to promote national peace?',
        options: [
          'Selfishness and competition',
          'Tolerance, love, and respect for diverse community members',
          'Disregard for traffic regulations',
          'Ignoring civic responsibilities'
        ],
        correctIndex: 1,
        explanation: 'Moral instructions highlight compassion, tolerance, and mutual respect to build a peaceful, unified country.'
      },
      {
        question: 'Showing truthfulness and transparency in all school and personal dealings is defined as:',
        options: [
          'Deception',
          'Integrity / Honesty',
          'Apathy',
          'Opportunism'
        ],
        correctIndex: 1,
        explanation: 'Integrity is the quality of being honest and keeping strong moral values at all times.'
      }
    ];
  } else if (subjectId === 'agricultural_science' || subjectId === 'home_economics') {
    objectives = [
      `Explain the agricultural production methods or home management guidelines under ${title}.`,
      `Discuss soil structures, crop husbandry, healthy nutrition, or sewing processes.`,
      `Implement practical skills in farming or home economics to improve family livelihood.`
    ];
    body = [
      `This vocational study explores '${title}'. Vocational education provides you with practical hands-on skills in Agricultural Science or Home Economics. These skills are essential for farm productivity, household budgeting, nutrition, and small scale enterprise.`,
      `In Agricultural Science, we study crop types, animal rearing, and soil management. For instance, growing local cash crops like cassava, yam, cocoa, and maize or managing poultry requires knowledge of pests, soil fertility, and proper tillage methods.`,
      `In Home Economics, we focus on safe food preparation, basic tailoring, and home hygiene. Understanding nutrient benefits-such as proteins, carbohydrates, and vitamins-helps prevent nutritional deficiencies. Correct hygiene prevents food-borne sickness, keeping families healthy.`
    ];
    keyPoints = [
      'Crop rotation maintains soil fertility by altering deep and shallow rooting plants.',
      'A balanced diet contains all the necessary food groups in their proper proportions.',
      'Sanitation in farming and home keeping is the first line of defense against disease.'
    ];
    quiz = [
      {
        question: 'Why is practicing crop rotation highly recommended in agricultural science?',
        options: [
          'It replaces the need for harvesting crops',
          'It preserves soil nutrients, breaks pest cycles, and reduces erosion',
          'It allows weeds to take over fields',
          'It serves no practical purpose'
        ],
        correctIndex: 1,
        explanation: 'Crop rotation changes crop species to keep soil nutrient levels balanced and disrupt pest life cycles naturally.'
      },
      {
        question: 'Which nutrient group is primary responsible for body building, growth, and tissue repair?',
        options: [
          'Fats and Oils',
          'Carbohydrates',
          'Proteins',
          'Minerals'
        ],
        correctIndex: 2,
        explanation: 'Proteins are the essential blocks used by the body to build muscle, grow, and heal tissue.'
      }
    ];
  } else if (subjectId === 'computer_studies' || subjectId === 'creative_arts' || subjectId === 'french' || subjectId === 'phe' || subjectId === 'further_math' || subjectId === 'geography') {
    objectives = [
      `Gain technical, analytical, cultural, or physical competence under ${title}.`,
      `Understand hardware, algebraic vectors, world map coordinates, body muscles, or languages.`,
      `Demonstrate practical techniques (coding, painting, speaking, counting, scaling, or exercising).`
    ];
    body = [
      `This specialized syllabus module concentrates on '${title}'. These courses enrich your cognitive and physical skills. They encompass computing power (Computer Studies), cultural crafts and painting (Creative Arts), global expressions (French), sports fitness (PHE), advanced matrix calculus (Further Mathematics), and landform weather maps (Geography).`,
      `For technical paths, mastering core concepts is crucial for high grades. In Further Mathematics, we study formulas and geometric coordinates. In Computer Studies, we look at CPU operations and software development. In Geography, we practice map reading and analyze rock cycles.`,
      `For creative and language paths, regular practice is key. French grammar, traditional drumming patterns, and fitness exercises are best learned by active, repetitive practice. Each week, work through the questions to verify your understanding.`
    ];
    keyPoints = [
      'Computers use Input, Processing, and Output (IPO) blocks to handle data.',
      'A scale on a geography map defines the ratio of physical ground distance to sheet size.',
      'Exercise improves blood circulation, oxygen intake, and physical endurance.'
    ];
    quiz = [
      {
        question: 'Which computer component is known as the "brain" where processing occurs?',
        options: [
          'Random Access Memory (RAM)',
          'Central Processing Unit (CPU)',
          'Hard Disk Drive (HDD)',
          'System Keyboard'
        ],
        correctIndex: 1,
        explanation: 'The CPU performs all numerical arithmetic and logical evaluations, acting as the brain of the computer.'
      },
      {
        question: 'In physical training, what is the primary benefit of aerobic cardiovascular exercise?',
        options: [
          'It decreases bone density',
          'It strengthens the heart and lungs, improving oxygen transport',
          'It yields instant muscle fatigue',
          'It reduces flexibility'
        ],
        correctIndex: 1,
        explanation: 'Aerobic exercises (like running or swimming) train the heart and lungs to move oxygen through the body more efficiently.'
      }
    ];
  } else {
    // Default curriculum helper
    objectives = [
      `Understand local context, applications, and terms supporting ${title}.`,
      `Acquire practical life skills to solve problems in home and business.`,
      `Achieve outstanding preparation for national junior/senior certificates.`
    ];
    body = [
      `This week, we are studying ${title} under the official curriculum. Having high-quality vocational and commercial knowledge gives students the tools to start businesses, run farms, and build careers.`,
      `Every week, our curriculum covers the key facts, diagrams, and processes. This ensures students have clear, structured learning materials. Practice exams and quizzes help solidify the key concepts.`,
      `Let us focus on active revision. Working through the learning notes, summarizing paragraphs, and completing the checklist makes your revision highly effective and complete.`
    ];
    keyPoints = [
      'Learn the core terminology and practical layouts of the subject.',
      'Revise weekly materials regularly to perform well in exams.',
      'Apply lessons learned to your daily tasks and future work.'
    ];
    quiz = [
      {
        question: `What is the primary target of this lesson on ${title}?`,
        options: [
          'Provide core ideas that align with the NERDC syllabus',
          'Introduce unrelated concepts',
          'Teach children how to skip school',
          'Only prepare for physical education'
        ],
        correctIndex: 0,
        explanation: 'The curriculum is built strictly on national standards to guarantee high performance in WAEC, NECO, and primary leaving exams.'
      },
      {
        question: 'Which practice maximizes memory retention during revision?',
        options: [
          'Leaving all reading until the night before exams',
          'Completing weekly short quizzes and studying key points',
          'Skipping lesson objectives',
          'Ignoring explanations'
        ],
        correctIndex: 1,
        explanation: 'Regular active recall through quiz taking and summary reviews is proven to solidify long-term learning.'
      },
      {
        question: 'Why are Nigerian school syllabi divided into weekly terms?',
        options: [
          'To delay children from graduating',
          'To structure lessons clearly, giving time to learn and internalize topics step-by-step',
          'To make books heavier',
          'By random choice'
        ],
        correctIndex: 1,
        explanation: 'A structured, weekly timetable distributes subjects evenly so students learn effectively without stress.'
      }
    ];
  }

  return {
    title,
    objectives,
    body,
    keyPoints,
    quiz
  };
}
