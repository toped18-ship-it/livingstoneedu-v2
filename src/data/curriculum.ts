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
const CURRICULUM_DATA: Record<string, Record<number, string[]>> = {
  mathematics_primary: {
    1: ["Counting Whole Numbers up to 100", "Place Values of Whole Numbers: Tens and Units", "Concept of Skip Counting: 2s, 5s and 10s", "Fractions: Identifying Halves, Quarters, and Thirds", "Ordering Numbers and Comparison Symbols (<, >, =)", "Addition of Double-Digit Numbers Without Carrying", "Addition of Double-Digit Numbers With Regrouping", "Subtraction of Numbers Without Borrowing", "Subtraction of Numbers With Regrouping", "Pattern Completing & Number Sequences", "Syllabus Review & Key Concept Drills", "End of 1st Term Evaluation & Examination"],
    2: ["Concept of Multiplication as Repeated Addition", "Multiplication Tables 2, 3, 4, 5 and 10", "Fractions: Practical Quarter and Half Division", "Simple Division of Numbers Without Remainder", "Open Sentences: Finding Missing Terms in Algebra", "Measurement of Length: Standard Metres & Centimetres", "Perimeter of Regular Shapes in Classroom Environment", "Measurement of Mass/Weight: Grams & Kilograms", "Capacity Measurement: Litres and Half-Litres", "Nigerian Currency Notes and Coins Identification", "Simple Buying, Selling and Profit Calculations", "End of 2nd Term Evaluation & Examination"],
    3: ["Telling Time: Clock Readings to Minutes & Hours", "Calender Studies: Months, Days and special weeks", "2D Shapes: Properties of Square, Rectangle, Circle", "3D Shapes: Properties of Cubes, Cuboids & Spheres", "Line Identification: Parallel and Diagonal Lines", "Constructing Angles: Right and Straight Angles", "Identifying Symmetrical Properties in Shapes", "Data Collection: Counting Objects in Environment", "Constructing Simple Pictographs and Tables", "Reading Basic Block/Bar Chart Configurations", "Introduction to Chance, Likelihood & Probability", "End of 3rd Term Evaluation & Examination"]
  },
  mathematics_jss: {
    1: ["Whole Numbers: Prime Factors, LCM & HCF", "Fractions, Decimals, & Percentage Computations", "Positive & Negative Integers on Number Line", "Laws of Indices & Index Notation Concepts", "Standard Form representation & Approximation", "Basic Algebra: Symbols and Coefficient Forms", "Open Sentences in Algebra: Linear Form", "Simplifying Expressions: Like and Unlike Terms", "Word Problems in Algebra Construction", "Introduction to Angles and Angle Measurement", "Syllabus Review & Examination Prep", "End of 1st Term Evaluation & Examination"],
    2: ["Expansion of Simple Algebraic Expressions", "Solving Simple Linear Equations with Variables", "Direct, Inverse and Joint Variation Basics", "Averages: Calculations of Mean, Median, & Mode", "Simple Commercial Interest & Tax Computations", "Percentages: Calculating Percentage Profit & Loss", "Ratio & Proportion Division of Quantities", "Household Utility Ledger Bills Computations", "Formulating and Graphing Equations of Variation", "Plotting Positions on Cartesian Coordinates", "Syllabus Review & Term Revision Exercises", "End of 2nd Term Evaluation & Examination"],
    3: ["Lines and Angles: Transversal Line Angles", "Angles in Triangles & Polygon Calculations", "Triangles: Applying Pythagoras Theorems", "Perimeter & Area of Compound Plane Shapes", "Circle Measurements: Radius, Sector & Segment Area", "Symmetry of 2D and 3D Shapes Basics", "Drawing and Bisecting Geometric Angles", "Data Organization: Frequency Tables & Bar Charts", "Basic Probability: Event Sample Spaces", "Pie Chart Representation and Analysis", "General Curriculum Term Review", "End of 3rd Term Comprehensive Exams"]
  },
  mathematics_ss: {
    1: ["Number Bases: Operations and Binary Systems", "Number Bases: Base Compilations & Conversions", "Laws of Indices, Surds, and Logarithms", "Quadratic Equations: Factorization & Formula Forms", "Simultaneous Linear & Quadratic Equations", "Arithmetic & Geometric Sequences (AP & GP)", "Venn Diagrams & Three-Set Problem Solving", "Trigonometric Ratios & Unit Circle Metrics", "Bearings, Elevation and Depression Computations", "Intro to Calculus: Functional Differentiation", "Measures of Dispersion: Variance & Deviation", "Permutations, Combinations & Probability Laws"],
    2: ["AP & GP Formulas & Sums of Progressions", "Logarithms Theory: Characteristics & Mantissa", "Graphical Solutions of Quadratic Curves", "Simultaneous Graphical Solutions and Tangents", "Trigonometric Sine and Cosine Law Equations", "Trigonometric Equations & Solution of Triangles", "Bearings & Advanced Coordinate Navigation", "Logic and Truth Tables of Compound Statements", "Commercial Math: Compound Interest & Annuities", "Inequalities and Linear Programming Regimes", "Syllabus Review & Examination Prep", "End of 2nd Term Evaluation & Examination"],
    3: ["Calculus Limits, Derivatives & Integrals", "Calculus Integration: Definite & Indefinite", "Coordinate Geometry: General Equation of Circle", "Measures of Dispersion: Grouped Standard Deviation", "Matrices: Addition, Multiplication, Determinant", "Binary Operations: Closure, Identity & Inverse", "Logical Proof of Mathematical Statements", "Calculus Applications: Maxima and Minima", "Geometric Proofs of Circle Theorems", "West African Exam Revision and Drill Practices", "Revision of High School Syllabus Modules", "End of 3rd Term Comprehensive Exams"]
  },
  english_primary: {
    1: ["Nouns: Identifying Common and Proper Nouns", "Pronouns: Personal and Possessive Pronouns", "Verbs: Actions and Helping Verbs", "Adjectives: Describing Objects in Classroom", "Vocabulary: Agricultural and Health Terms", "Word Sounds: Single Vowels & Word Blending", "Sentence Building: Subject and Predicates", "Punctuation: Capital Letters & Full Stop Basics", "Comprehension: Reading and Answering Stories", "Informal Letters: Writing to Friends/Parents", "Termly Syllabus Revision & Drills", "End of 1st Term Evaluation & Examination"],
    2: ["Adverbs: Adverbs of Time and Place", "Prepositions & Conjunctions: Basic connectors", "Grammar: Simple Present and Past Tenses", "Concord: Singular and Plural Agreement", "Phonology: Consonants and Initial Blends", "Writing: Narrative Essay Blueprint Layouts", "Speeches: Introducing Oneself and family members", "Synonyms & Antonyms: Simple Word Pairs", "Comprehension: Identifying Main Points in Text", "Direct & Indirect Speech: Simple Conversions", "Termly Grammar Revision", "End of 2nd Term Evaluation & Examination"],
    3: ["Punctuation: Commas, Apostrophes, Question Marks", "Grammar: Future and Perfect Tense Sequences", "Writing: Descriptive Essay Paragraph Outlines", "Vocabulary: Business and Transportation Terms", "Oral English: Identifying Diphthong Sounds", "Compound Sentences and Coordinating Conjunctions", "Letter Writing: Simple Formal Applications", "Active and Passive Voice: Basic Sentence Forms", "Reading: Scanning and Skimming Reading Tech", "Grammar Concord: Collective Noun Rules", "Termly Literature and Reading Review", "End of 3rd Term Evaluation & Examination"]
  },
  english_jss: {
    1: ["Grammar: Lexical and Grammatical Categories", "Nouns and Noun Phrases Formation", "Verbs: Active Transitivities & Voice", "Vocabulary: School Life and Education Terms", "Narrative Essay Structure and Elements", "Letter Writing: Informal Personal Letters", "Phonemes: Vowels and Consonants Contrast", "Grammar Concord: Subject-Verb Match Rules", "Reading: Paragraph Topic Sentences Extraction", "Punctuation: Colons and Semicolons placement", "Termly Grammar Drills", "End of 1st Term Evaluation & Examination"],
    2: ["Adjectives and Adjectival Clauses Details", "Adverbs and Adverbial Clauses Functions", "Grammar Concord: Distance and Plurality", "Vocabulary: Industry and Commerce terms", "Descriptive Writing: Descriptive Essays", "Letter Writing: Formal Business Applications", "Diphthongs and Consonant Cluster pronunciations", "Active and Passive Voice conversions", "Reading Compositions: Making Deductions and Summaries", "Direct and Indirect Quote conversions", "Termly Grammar Drills", "End of 2nd Term Evaluation & Examination"],
    3: ["Grammar: Relative Pronouns & Clauses", "Punctuation: Dash, Hyphens & Parenthesis", "Argumentative Essay Outlines and Body Paragraphs", "Expository Writing: Informative Composition", "Oral English: Intonation, Stress and Rhythm", "Vocabulary: Science, Space and ICT registers", "Idioms, Proverbs and Figurative Language", "Literature: Introducing African Prose Styles", "Literature: Recommended African Drama Review", "Grammar: Conditional Clauses Sequences", "Comprehensive Class Revision Exercises", "End of 3rd Term Comprehensive Exams"]
  },
  english_ss: {
    1: ["Grammar Classes: Extensive Parts of Speech Drill", "Noun Clauses & Grammatical Functions on sentence", "Structural Concords and Advanced Agreement Rules", "Vocabulary: Legal, Medical and Academic registers", "Narrative Writing: WAEC Standard Formatting", "Formal Letters: Structure, Address and Headers", "Pronunciation: Monophthongs & Diphthongs Contrast", "Active & Passive Voice: Complex Multi-clausal Forms", "Comprehension: Standard Summary Writing Skills", "Prepositional Phrases and Idiomatic Collocations", "Syllabus Review and Composition Checkpoints", "End of 1st Term Evaluation & Examination"],
    2: ["Adjectival Clauses and Phrases Configurations", "Adverbial Clauses of Time, Place and Condition", "Lexis: Synonyms, Antonyms, and Homonyms Drills", "Vocabulary: Technology, Energy and Oil Registers", "Argumentative Essays: Techniques of Persuasion", "Informal and Semi-formal letter conventions", "Consonant Sequences and Syllabic Consonant sounds", "Grammar: Concord Rules for Correlative Conjunctions", "Comprehension: Analytical Reading & Tone Decoders", "Direct and Indirect Speech Complex Conversions", "Termly Grammar Drills", "End of 2nd Term Evaluation & Examination"],
    3: ["Punctuation: Advanced Mastery of Colon & Semicolon", "Grammar: Question Tags and Auxiliary Verbs Rule", "Expository Essays: Technical & Academic formats", "Letter Writing: Articles for Publication formats", "Oral English: Phonetic transcription & Word stress", "Vocabulary: Government, Politics and Administration", "Idioms & Figurative Registers of WAEC Syllabus", "Literature: Poetry Analysis & Standard Lit Devices", "Reading Comprehension and Summary Writing Drills", "WAEC Standard English Past Questions Practice", "Undergraduate Prep Writing and Speech Practices", "End of 3rd Term Comprehensive Exams"]
  },
  basic_science_primary: {
    1: ["Living and Non-living things in environment", "Identifying plants: Leaf, stem, and root structures", "Characteristics of animals: Senses and locomotion", "The Human Body: Senses and outer body parts", "Personal Hygiene: Teeth brushing and hand washing", "Health: Balanced feeding and clean drinking water", "Weather Systems in Nigeria: Rainy & Dry Seasons", "Air: Properties of air and simple wind toys", "Water: Uses, sources, and simple filtration methods", "Soils: Clay, Sandy and Loamy soil structures", "Syllabus Review of General Sciences", "End of 1st Term Evaluation & Examination"],
    2: ["Classification of Plants: Flowering & Non-flowering", "Skeletal structures and bones of animals", "Human Senses: Detailed functions of the eyeball", "Hygiene: Preventing germs and skin diseases", "Balanced Diet: Carbohydrates, proteins & vitamins", "Water Pollution: Causes and organic purification", "Forces: Push and Pull effects on light objects", "Energy: Sources of Heat, Light, and Sound", "Simple Magnets: Magnetic and Non-magnetic materials", "Electricity Basics: Sockets and safe use laws", "Termly Science Review", "End of 2nd Term Evaluation & Examination"],
    3: ["Tillage: Simple garden and farming tools", "Crop Growth: Sowing seeds and looking after them", "Introduction to Simple Chemistry in Home Life", "Properties of Liquids: Flow and boiling limits", "Simple Machines: Levers and Wheels on vehicles", "Sound: Vibration and making musical toys", "Light and Shadows: How light travels on lines", "Substance Safety: Identifying expired products", "Intro to Human Digestive Organs and Waste", "Safety: Fire prevention and simple exits", "General Primary Science Review", "End of 3rd Term Evaluation & Examination"]
  },
  basic_science_jss: {
    1: ["Introduction to Science & Scientific Method", "Safety in the Laboratory and First Aid Rules", "Matter: Particulate theory, solids and gases", "Living Things: Characteristics & cellular structures", "Plants & Animals Classification Schemes", "Human Organs: Skeletal & Muscular systems", "Health: Communicable diseases & transmission routes", "Energy: Heat and Temperature Scales", "Forces: Friction, Gravity and Magnetic forces", "Simple Machines: Mechanical Advantage of Levers", "Termly JSS Science Review", "End of 1st Term Evaluation & Examination"],
    2: ["Elements, Compounds & Chemical Mixtures Basics", "Atomic Structures: Neutrons, Protons, Electrons", "Human Respiratory System & Gaseous Exchange", "Human Digestive System: Enzymes and Nutrition", "Circulatory System: Heart Beats & Blood Cells", "Ecology: Biotic and Abiotic factors in habitat", "Environmental Pollution: Air, Land, and Water", "Kinetic Theory of Matter: Phase transformations", "Calculations of Speed, Velocity, and Acceleration", "Electricity: Simple Parallel and Series Circuits", "Termly JSS Science Review", "End of 2nd Term Evaluation & Examination"],
    3: ["Acids, Bases, and Salts: Indicators and pH", "Chemical Reactions and Simple Balancing Equations", "Eruptions: Volcanism & Earthquakes impact", "Human Reproductive System: Growth and maturity", "Excretory System: Removal of waste in humans", "Nervous System: Brain cells and sensory systems", "Magnetism: Properties of Permanent Magnets", "Waves: Reflection of Sound and Echoes", "Light: Reflections in Mirrors and Lenses", "Space Science: Solar System, Stars & galaxies", "General JSS Science Revision", "End of 3rd Term Comprehensive Exams"]
  },
  physics_ss: {
    1: ["Physics: Fundamental and Derived Quantities", "Measurement of Length, Mass, Time & Volume", "Scalar and Vector Quantities: Vector Resolution", "Linear Motion: Distance, Displacement, Speed", "Equations of Uniformly Accelerated Motion", "Concepts of Force, Inertia & Friction Laws", "Work, Energy and Power: Calculations", "Simple Machines: Pulleys, Screws, and Levers", "Projectiles: Trajectory and Maximum Height", "Elasticity: Hooke's Law of Extension and Strain", "Syllabus Review & Laboratory Practical", "End of 1st Term Evaluation & Examination"],
    2: ["Kinetic Theory of Matter & Thermal Expansion", "Heat Energy, Temperature, and Thermometers", "Specific Heat Capacity and Latent Heat Systems", "Gas Laws: Boyle's, Charles' and Pressure Laws", "Thermal Conductivity, Convection and Radiation", "Wave Motion: Transverse and Longitudinal Waves", "Properties of Waves: Reflection & Refraction", "Sound Waves: Speed, Pitch and Harmony", "Reflection of Light: Spherical Curved Mirrors", "Refraction of Light: Prisms, Lenses & Vision", "Syllabus Review & Multi-topic Practical", "End of 2nd Term Evaluation & Examination"],
    3: ["Electrostatics: Charge, Coulomb's Law & Fields", "Electric Currents: Ohm's Law & Circuit Graphs", "Electrical Energy, Resistors, and Capacitors", "Magnetism: Magnetic Fields and Electromagnets", "Electromagnetic Induction: Faraday's Laws & Dynamos", "Modern Physics: Radioactive atomic decay rules", "X-Rays, Photoelectric effect, and Semiconductors", "Nuclear Fission, Fusion and Energy generation", "Wave-Particle Duality and Quantum Mechanics", "Review of WAEC Physics Theoretical Questions", "Review of Physics Practical Lab Experiments", "End of 3rd Term Comprehensive Exams"]
  },
  chemistry_ss: {
    1: ["Particulate Nature of Matter & Atomic Outline", "Laws of Chemical Combination & Atomic Theories", "Periodic Table: Grouping and First 20 Elements", "Chemical Bonding: Electrovalent, Covalent, Metallic", "Stoichiometry: Atoms, Molecules, and Moles", "Chemical Equations: Balancing and Gas Constants", "Gas Laws: Kinetic Molecular Explanations", "Water: Hardness, Softness, and Treatments", "Acids, Bases, Salts: Classifications and Acid Strength", "pH Metric Scale & Acid-base Titrations Details", "Syllabus Review & Core Lab Experiments", "End of 1st Term Evaluation & Examination"],
    2: ["Solubility of Salts & Precipitation Reactions", "Rates of Chemical Reactions & Collision Theory", "Chemical Equilibrium: Le Chatelier's Principle", "Thermodynamics: Exothermic and Endothermic Limits", "Redox Reactions: Oxidation States & Equations", "Electrolysis: Faraday's Laws, Cells and Coatings", "Non-metals: Carbon, Allotropes, and Compounds", "Non-metals: Nitrogen, Ammonia, and Nitric Acid", "Non-metals: Oxygen, Oxides, and Sulphur Elements", "Organic Chemistry: Tetravalency & Nomenclature", "Syllabus Review & Chemistry Lab Practical", "End of 2nd Term Evaluation & Examination"],
    3: ["Organic Hydrocarbons: Alkanes, Alkenes & Alkynes", "Alkanols: Properties, Uses, and Esterification", "Alkanoic Acids, Amides, and Polymer Materials", "Metals Extraction: Iron, Aluminium, and Alloys", "Industrial Chemistry: Soap, Petroleum & Plastics", "Environmental Chemistry: Greenhouses and Smog", "Biochemistry: Proteins, Fats, and Starch digestion", "Chemical Tests for Anions and Cations in Lab", "WAEC Standard Inorganic Chemistry Revision", "WAEC Standard Volumetric Titration Practicals", "Exam strategies and Quantitative Practice", "End of 3rd Term Comprehensive Exams"]
  },
  biology_ss: {
    1: ["Characteristics of Living Things & Classification", "Cell Biology: Cell Organelles and Functions", "Cell Physiology: Diffusion, Osmosis & Plasmolysis", "Levels of Organization: Cells, Tissues, Organs", "Plant Nutrition: Photosynthesis mechanics and test", "Animal Nutrition: Balanced Diet & Enzymes action", "Mammalian Digestive System: Structures & stages", "Transport System: Heart, Arteries & Blood cells", "Plant Transport: Xylem, Phloem & Transpiration", "Respiration: Gaseous Exchange in Fish & Birds", "Syllabus Review & Microscope Practicals", "End of 1st Term Evaluation & Examination"],
    2: ["Excretory System: Excreta removal in Animals", "Homeostasis: Kidney, Skin & Liver regulations", "Nervous System: Neurons, Reflex arcs and Brain", "Hormones: Endocrine Glands and Coordination", "Skeletal System & Locomotion: Joints & Bones", "Ecology: Biotic Communities and Energy flow", "Ecology: Food Webs, Pyramids and Ecosystems", "Environmental Conservation & Natural Resources", "Micro-organisms: Bacteria, Virus and Vaccines", "Plant Reproduction: Pollination, Fruits & Seeds", "Syllabus Review & Flower Dissection Practical", "End of 2nd Term Evaluation & Examination"],
    3: ["Animal Reproduction: Fertilization & Gestation", "Genetics: Chromosomes, DNA and Mendelian Laws", "Inheritance: Monohybrid Crosses and Blood Groups", "Variation: Continuous and Discontinuous Variation", "Adaptations of Organisms to Extreme Habitats", "Evolution: Theories of Lamarck, Darwin & Evidence", "Natural Selection and Survival of the Fittest", "Ecology of Soil: Decomposition and Humus", "Review of WAEC Standard Biological Diagrams", "Past Exam Objective and Essay Questions Practise", "Mock Lab Practical Examination and Specimens", "End of 3rd Term Comprehensive Exams"]
  },
  civic_education_primary: {
    1: ["National Values: Meaning and Origin of Integrity", "National Values: Importance of Discipline & Honesty", "Civic Rights: Meaning of Citizenship", "Civic Duties: Respecting Elders and Authorities", "National Symbols: Flag, Anthem, and Pledge Rules", "National Integration: Promoting Unity in Nigeria", "Security Awareness: Identifying Strangers & Safety", "Safe Living: Road Safety and pedestrian rules", "Drug Abuse: Identifying medicines and chemicals", "Government: Introduction to Community leaders", "Syllabus Review of Civic responsibility", "End of 1st Term Evaluation & Examination"],
    2: ["National Values: National Loyalty and Patriotism", "Social Development: Importance of Community Work", "Human Rights: Fundamental rights of every child", "Constitution: Definition and why we need rules", "Elections: Meaning of voting and representation", "Democratic values: Fairness, equity and freedom", "Security: Safety at school and on streets", "First Aid: Assisting injured classmates", "Syllabus Review and Civic Drama play", "Social Integrity: Being truthful at all times", "Civic Quiz and interactive reviews", "End of 2nd Term Evaluation & Examination"],
    3: ["Social challenges: Substance Abuse and prevention", "Road signs: Identifying major warning symbols", "Traffic Wardens and FRSC agencies of Nigeria", "The Constitution: Basic structures of Government", "Human Rights: Fighting abuse and reporting", "Eminent Nigerian Heroes and accomplishments", "Promoting Local Crafts and Cultural heritage", "Integrity: Managing personal and class secrets", "Social life: Tolerance and religious harmony", "Civic Duties: Paying taxes and keeping clean", "Primary Civics Review and quiz drills", "End of 3rd Term Comprehensive Exams"]
  },
  civic_education_ss: {
    1: ["Civics: Introduction to Values and Citizenship", "National Identity and Organs of Government", "Human Rights: Universal Declaration of Human Rights", "Human Rights: Constitutional limitations on rights", "Democratic Process: Rule of Law and Equity", "Electoral System: Franchise, Parties and Voting", "The Constitution: Types and Historic Developments", "Civil Society: Advocacy and Voluntary Agencies", "Substance Abuse and Narcotics Agencies of Nigeria", "Citizen duties: Compliance, Taxes and Defense", "Syllabus Review & Case Study Investigations", "End of 1st Term Evaluation & Examination"],
    2: ["Cultism: Causes, Consequence and Prevention", "National Values: Promoting National Unity", "Constitutional Safekeeping & Sovereign Borders", "Human Trafficking: Causes, Effects and agencies", "Public Agencies: EFCC, ICPC and Transparency", "Democratic values: Representative Accountability", "Social problems: Corruption and public solutions", "Road Safety: FRSC and Highway Code metrics", "Syllabus Review of Civic Responsibilities", "Civil Rights: Right of Association and speech", "Civic Case Studies on Governance in Nigeria", "End of 2nd Term Evaluation & Examination"],
    3: ["Rule of Law: Judicial Independence and Rights", "Democracy: Challenges facing developing nations", "Political apathy: Causes, consequence & therapy", "National Integration: Multi-ethnic co-existence", "Foreign relationships: Bilateral and multilateral", "United Nations, African Union & ECOWAS roles", "West African Exam preparation for Civic Studies", "Mock Examinations and Case Study Analysis", "Review of Civic Duties & Citizen Engagement", "Civic engagement projects for high schoolers", "Revision of Civic Syllabus and core questions", "End of 3rd Term Comprehensive Exams"]
  },
  government_ss: {
    1: ["Government: State, Nation, Power & Sovereignty", "Forms of Government: Democracy and Monarchy", "Forms of Government: Unitary and Federalism", "Constitutions: Written, Unwritten, Rigid & Flexible", "Organs of Government: The Executive Arm", "Organs of Government: The Legislature & Lawmaking", "Organs of Government: The Judiciary & Interpretation", "Rule of Law: Judicial Review and Delegated Power", "Pre-Colonial Administration: Yoruba Traditional State", "Pre-Colonial Administration: Hausa-Fulani Emirate", "Pre-Colonial Administration: Igbo Traditional System", "End Of Term Exams"],
    2: ["Electoral Systems: Franchise and Secret Ballot", "Political Parties and Public Opinion Polls", "Colonial Administration: Lugard & Indirect Rule", "Constitutional Developments: Clifford & Richards", "Constitutional Developments: Macpherson & Lyttelton", "Independence Constitutions: 1960 and 1963 Republic", "Military Rule: Causes, Structures and Remedies", "Local Government Reforms of 1976 and autonomy", "Nigerian Federalism: Origin, Structure & Problems", "Public Service: Civil Service and Public Corporations", "Term Review & Government Past Exams", "End of 2nd Term Evaluation & Examination"],
    3: ["Nigeria's Foreign Policy: Principles & Motives", "Foreign Policy: Relations with Africa & West", "International Organizations: United Nations (UN)", "International Organizations: Commonwealth of Nations", "International Organizations: African Union (AU)", "International Organizations: ECOWAS and Integration", "International Organizations: OPEC and Petroleum Sector", "Electoral Malpractices and Democratic Failures", "WAEC Standard Government Past Questions Practice", "Review of Constitutional Reforms in West Africa", "Review of Nigeria's Administrative history", "End of 3rd Term Comprehensive Exams"]
  },
  economics_ss: {
    1: ["Economics: Scarcity, Choice & Scale of Preference", "Production: Factors, Divisions & Organizations", "Business Units: Sole Proprietor & Partnerships", "Introduction to Demand: Laws and Demand Schedule", "Introduction to Supply: Laws and Supply Schedule", "Price Determination: Equilibrium prices & shifts", "Elasticity of Demand: Calculation & Graphical", "Elasticity of Supply: Calculation & Graphical", "Population: Census, Growth and Demographics", "Labour Market: Unemployment and Wage Rates", "Syllabus Review and Demand/Supply Calculus", "End of 1st Term Evaluation & Examination"],
    2: ["Market Structures: Perfect, Monopoly, Oligopoly", "National Income: GDP, GNP, and Calculations", "Money & Financial Institutions: Central Banking", "Commercial Banking: Deposits and Credit Creation", "Inflation: Types, Causes, and Economic Remedies", "Fiscal Policy: Public Finance, Taxation & Budgets", "Monetary Policy: Tools of the Central Bank", "International Trade: Balance of Payments & Tariffs", "Economic Integration: ECOWAS, OPEC and OPEC-10", "Economic Planning & Development Strategies", "Termly Revision and Economics Formulas Drills", "End of 2nd Term Evaluation & Examination"],
    3: ["West African Agriculture & Land Tenure systems", "Petroleum Industry and Economic Diversification", "Mining and Industrialization Policies in Nigeria", "Financial Markets: Stocks, Bonds and Forex", "Statistics: Mean, Median, Mode of Grouped Data", "Measures of Dispersion: Standard Deviation in Econ", "Economic Problems of Developing Nations (Africa)", "WAEC Economics Theory and Calculation Practice", "WAEC Economics Objective Questions Practice", "Applied Economics: Reviewing Nigerian Budgets", "High School Economic Syllabus Comprehensive Review", "End of 3rd Term Comprehensive Exams"]
  },
  accounting_ss: {
    1: ["Principles: Introduction to Bookkeeping & Accounting", "Double Entry System & Ledger Postings", "Cash Book: Single Column & Double Column Cashbook", "Cash Book: Three Column Cashbook Operations", "Petty Cash Book & Imprest System Rules", "Trial Balance: Meaning, Construction & Uses", "Correction of Bookkeeping Errors & Suspense Acc", "Trading, Profit and Loss Account: Basic Outlines", "Balance Sheet Structure: Fixed & Current Assets", "Source Documents & Original Books of Entry", "Syllabus Review and Ledger Drills", "End of 1st Term Evaluation & Examination"],
    2: ["Adjustments in Trading Accounts: Prepayments", "Adjustments in Trading Accounts: Accruals", "Depreciation of Fixed Assets: Straight Line Method", "Depreciation: Reducing Balance & Disposal Acc", "Bad Debts, Provisions & Reserves Administrations", "Bank Reconciliation Statements: Causes of Discrepancies", "Bank Reconciliation: Adjusted Cash Book Method", "Incomplete Records & Single Entry Computations", "Partnership Accounts: Capital and Current Accounts", "Partnership Accounts: Appropriation Accounts", "Termly Accounting Exercises & Ledger Postings", "End of 2nd Term Evaluation & Examination"],
    3: ["Non-Profit Making Organizations: Receipts & Payments", "Non-Profit Organizations: Income & Expenditure Acc", "Manufacturing Accounts: Direct and Indirect Costs", "Company Accounts: Share Capital and Debentures", "Departmental and Branch Account Foundations", "Joint Venture Accounts: Venture Ledgers", "Consignment Accounts: Consignors and Consignee", "Analysis of Accounting Financial Ratios basics", "WAEC Bookkeeping and Financial Accounts Exams Practice", "Standard Auditing Foundations: Internal Audits", "Revision of Accounting Ledger entry systems", "End of 3rd Term Comprehensive Exams"]
  },
  agricultural_science_primary: {
    1: ["Introduce Agriculture: Farming Importance", "Types of Local crops: Food and Cash Crops", "Soil: Components of Sandy and Clayey Soils", "Land Tillage: Meaning of clearing and hoeing", "Garden Tools: Safe handling of Hoes & Cutlasses", "Weeds: Definition of unwanted garden plants", "Domestic animals: Dogs, Cats, Poultry and Cattle", "Farming methods: Crop rotation and shifting tillage", "Watering: Basic methods of manual farm watering", "Pests: Identifying grasshoppers and rodents", "Primary Agriculture Review and farm visit", "End of 1st Term Evaluation & Examination"],
    2: ["Crop Classification: Roots, Tubers, and Grains", "Sowing seeds: Transplanting seedlings in beds", "Soil Fertility: Adding natural manures and compost", "Farm animals: Feeds, pasture and clean water", "Tools: Wheels, Watering cans and pruning shears", "Crop diseases: Rust, Smut and fungal spots", "Animal products: Milk, Meat, Eggs and Leather", "Farm Records: Simple record counts of livestock", "Syllabus Review & Practical Field Day", "Weed control: Manual hand-pulling and weeding", "Farm Safety: Keeping hands clean and safe", "End of 2nd Term Evaluation & Examination"],
    3: ["Aquaculture: Introduction to Fish Farming/Ponds", "Forestry: Trees, Wood output and local uses", "Poultry farming: Keeping chickens and eggs", "Goat and Sheep farming: Small ruminants care", "Farm records: Simple income logs in Agriculture", "Fertilizers: Standard NPK fertilizer safe use", "Climate: Influence of temperature on crops", "Irrigation: Sprinklers and simple water dams", "Selling farm produce: Open market operations", "Agribusiness: Local cooperatives and savings", "General Primary Agriculture Syllabus Revisions", "End of 3rd Term Comprehensive Exams"]
  },
  agricultural_science_jss: {
    1: ["Agriculture: Comprehensive Definitions and History", "Farming Systems: Mixed, Shifting and Monoculture", "Importance of Agriculture in West African Economy", "Land Availability and Tenure Systems Basics", "Simple Hand Tools: Maintenance and Safe Uses", "Farm Machinery: Tractor, Plough & Harrow Parts", "Soil Formation: Weathering and Composition", "Soil Profile: Layers (A, B, C, D) Structures", "Plant Nutrients: Macronutrients and Trace Elements", "Weeds: Classification, Harm and Control Methods", "JSS Agricultural Science Term Syllabus Review", "End of 1st Term Evaluation & Examination"],
    2: ["Crop Husbandry: Production of Maize & Cassava", "Crop Husbandry: Production of Cocoa & Oil Palm", "Pests of Crops: Invertebrates, Nematodes, Birds", "Crop Disease Vectors: Fungal, Viral & Bacteria", "Forestry: Forest Reserves, Trees and Timber", "Floriculture Summary: Cultivating flowers and lawns", "Animal Husbandry: Classification of Livestock", "Poultry Management: Brooding, Layering & Feeds", "Animal Feeds: Roughages, Concentrates, Rations", "Farm Power: Solar, Wind, Electrical & Animal", "Syllabus Review & Multi-topic Animal Practical", "End of 2nd Term Evaluation & Examination"],
    3: ["Farm Structures: Buildings, Silos and Fences", "Farm Buildings Maintenance and Preservation Tech", "Fish Farming: Pond Construction & Stocking", "Beekeeping (Apiculture): Honey harvest & safety", "Agribusiness: Simple Accounting Farm Records", "Agricultural Marketing: Channels and Cooperatives", "Agricultural Extension: Passing skills to farmers", "Environmental Impact of Farming and Ecology", "General JSS Agricultural syllabus revisions", "Practical gardening and Livestock Observation", "WAEC JSS Agricultural Past Exams Practice", "End of 3rd Term Comprehensive Exams"]
  },
  agricultural_science_ss: {
    1: ["Meaning, Scope and Importance of Agriculture", "Problems of Agricultural Development in W/Africa", "Agricultural Laws: Land Use Act of 1978 Nigeria", "Farm Mechanization: Advantages & Limitations", "Agricultural Power: Solar, Wind, Electrical, Bio", "Soil Science: Soil Water Types & Conservation", "Plant Nutrients: Organic Manure & Fertilizers", "Crop Husbandry: Cereal and Leguminous Crops", "Crop Diseases: Description, Symptoms & Remedies", "Pest Management: Cultural, Chemical and Biological", "Review of Crop Husbandry Practicals", "End of 1st Term Evaluation & Examination"],
    2: ["Animal Anatomy: Digestive & Reproductive Systems", "Animal Husbandry: Ruminant Cattle, Sheep & Goats", "Animal Nutrition: Ingredients and feed formulations", "Rangeland and Pasture Management Principles", "Livestock Diseases: Viral, Bacterial & Parasitic", "Farm Structures: Layout, Design and Materials", "Farm Accounts: Balance Sheet and Income Statements", "Agricultural Marketing: Boards and Supply chain", "Agricultural Extension: Teaching local farmers", "Land Mapping: Principles of simple farm surveying", "Livestock Science Review & Past Exams", "End of 2nd Term Evaluation & Examination"],
    3: ["Aquaculture: Stocking, Harvesting and Preservation", "Forestry: Forest Management and Forest Products", "Apiculture: Honeybees Life-Cycle and Apiary Safety", "Agricultural Cooperatives and Agribusiness Finance", "Genetics: Principles of Animal Selection & Breeding", "Genetics: Hybrid Vigor and Crop Breeding", "Diseases of Poultry: Newcastle and Avian Flu", "Past WAEC Agricultural Science Questions Drill", "Past WAEC Agricultural Science Practical Mock Exam", "Review of Farm Surveying tools and records", "Revision of Senior Secondary Agribusiness Syllabus", "End of 3rd Term Comprehensive Exams"]
  },
  computer_studies_primary: {
    1: ["Introduction to Computer: Meaning and definition", "History of Computers: The Abacus and Calculators", "Computer Hardware: Monitor, Keyboard and Mouse", "Computer Software: Identifying Games and Apps", "System boot: How to turn on and shut down", "Keyboarding: Proper finger placements on keys", "The Mouse: Left click, right click, and dragging", "Windows Desktop: Identifying icons and folders", "Introduction to Paint: Drawing simple shapes", "Information technology in daily life: Smartphones", "Computer Laboratory safety rules for children", "End of 1st Term Evaluation & Examination"],
    2: ["Generations of Computers: Basic outlines", "Input Devices: Keyboard, Joystick and Scanner", "Output Devices: Monitors, Printers and Speakers", "Central Processing Unit: Meaning of CPU", "Computer Storage: Disk, CD and Flash Drive", "Operating Systems: Windows, Android and iOS", "Application Programs: MS Word and Web Browsers", "Keyboarding: Typing simple letters and words", "Internet basics: Educational websites and search", "Web browsers: How to type a URL address", "Primary Computer Studies Term Review", "End of 2nd Term Evaluation & Examination"],
    3: ["Information Communication Tech: Emails and chat", "Paint Application: Coloring and Brush techniques", "Word Processing: Typing a short composition", "Document saving: How to name and save files", "Computer Ethics: Keeping details private", "Cyber safety: Avoiding malicious download links", "Intro to coding: Simple sequencing games", "Logo Language: Simple pixel motion blocks", "Computer Networking: Connecting to WI-FI", "MS Paint: Making a greeting card illustration", "General Computer Studies Syllabus Revisions", "End of 3rd Term Comprehensive Exams"]
  },
  computer_studies_jss: {
    1: ["Information Age: Historical evolution of ICT", "Definition of Computer, Data, and Information", "Generations of Computers: 1st to 5th", "Computer Classification: Size and Processing power", "Computer Hardware: System Unit and motherboard", "Computer Input Devices: Keyboard, Mouse, Scanners", "Computer Output Devices: Monitors and Printer Types", "Computer Storage Device: Primary and Secondary RAM", "Computer Software: System and Application Software", "Operating System functions: Booting and File paths", "JSS Computer Studies Termly Theory Review", "End of 1st Term Evaluation & Examination"],
    2: ["Information Technology: The Internet & Web browsers", "Internet services: Search Engines, Emails and WWW", "Digital Safety: Cybersecurity, Viruses and Malware", "Logic Gates: AND, OR, NOT gate truth tables", "Number Systems: Binary, Octal, Hexadecimal Basics", "Word Processing: MS Word Interface & Typing tools", "Word Processing: Margins, Formatting and Tables", "Spreadsheets: Excel cell addresses, Sum & Averages", "Database Management: Meaning and Simple Tables", "Basic Programming: Algorithms and Flowcharts", "JSS Computer Studies Termly Practice Review", "End of 2nd Term Evaluation & Examination"],
    3: ["Formatting Spreadsheet formulas & Charts", "Presentation Software: PowerPoint Slides layout", "Computer Ethics, Copyrights & Intellectual Property", "Simple Web development: Introduction to HTML", "Networking: LAN, WAN, MAN and Internet topology", "Graphics Applications: Vector vs Raster illustration", "Binary Arithmetic: Binary addition & subtraction", "Intro to Python/Basic: Standard syntax blocks", "Computer careers and Professional bodies in Nigeria", "WAEC JSS Computer Studies Exams Practices", "Comprehensive Laboratory Practical reviews", "End of 3rd Term Comprehensive Exams"]
  },
  computer_studies_ss: {
    1: ["Basic Computer Concepts & Advanced Architectures", "Von Neumann Architecture & Computer Operations", "Systems Software: Kernel, Drivers & Utility Apps", "Introduction to Database Systems: SQL syntax", "SQL SELECT statements & filtering entries", "Binary Arithmetic: Two's Complement & Math", "Logic Gates: NAND, NOR, XOR Multi-gate sheets", "Spreadsheet Calculations: Nesting IF statements", "Introduction to Web Foundations: CSS & HTML5", "Introduction to Algorithms: Flowchart Structures", "Syllabus Review & Computer Lab practicals", "End of 1st Term Evaluation & Examination"],
    2: ["Networking: OSI Reference Model Layers 1-7", "Web design: Forms, Tables, and CSS styling", "Database Normalization: 1NF, 2NF and 3NF rules", "Programming Fundamentals: JavaScript Variable Scope", "Control Structures: IF, FOR loops in JS", "Arrays, Functions, and Object-Oriented ideas", "Subroutines and Recursion in Programming", "Operating Systems: Process Schedules & Deadlocks", "Digital Security: Encryption, Keys, and SSL", "Tech and Society: Artificial Intelligence Trends", "Syllabus Review & Practical Web project", "End of 2nd Term Evaluation & Examination"],
    3: ["Data Structures: Stacks, Queues, and Lists", "Algorithms: Bubble Sort & Binary Search Metrics", "System Analysis and Software Development Lifecycle", "Database Security & Real-world Transaction Rules", "Python Programming: Data Processing & Logic", "WAEC Senior Computer Studies Exams Revision", "Mock Practical Examination: Web and Databases", "Computer Careers & Professional Ethos in ICT", "High School Computer Studies Syllabus Review", "Review of Advanced Network configurations", "Final lab projects and presentation", "End of 3rd Term Comprehensive Exams"]
  },
  creative_arts_primary: {
    1: ["Introduction to visual arts: Coloring book", "Drawing simple objects: Cup, Box, Car, Tree", "Introduction to primary colors: Red, Blue, Yellow", "Introduction to secondary colors: Green, Orange", "Clay modeling: Modeling cups and round balls", "Paper craft: Origami folding of planes and boats", "Traditional crafts: Weaving simple threads", "Performing arts: Simple dances and singing songs", "Drama: Acting our local stories and folklore", "Nigerian craft history: Clay Nok art outline", "Syllabus Review of Creative performance", "End of 1st Term Evaluation & Examination"],
    2: ["Drawing: Constructing margins and shadow tones", "Painting: Mixing water colors on clean sheets", "Visual collage: Gluing scraps onto drawings", "Traditional Craft: Weaving small palm leaf mats", "Music: Introduction to beats, rhythm, and songs", "Instruments: Identifying local drums and flutes", "Drama: Acting out school and morals plays", "Art history: Visual Ife and Benin royal art", "Exhibition: Showcasing classroom drawings", "Bead making: Stringing simple colored beads", "Termly Creative Arts Class Review", "End of 2nd Term Evaluation & Examination"],
    3: ["Drawing: Sketching mammalian animals and birds", "Craft: Making paper mache models and bowls", "Cultural dance: Understanding traditional patterns", "Music: Singing national and folk anthem songs", "Crafts: Fabric tie and dye (Adire) basics", "Art history: Traditional Igbo-Ukwu artworks", "Drama: Improvisation and storytelling on stage", "Visual art: Landscape and nature drawings", "Exhibition: Arranging gallery for parent visual", "General Primary Creative Arts syllabus revisions", "Creative Arts Quiz and interactive reviews", "End of 3rd Term Comprehensive Exams"]
  },
  creative_arts_jss: {
    1: ["Introduction to Fine Arts: History and Scope", "Elements of Design: Line, Shape, Color, Texture", "Principles of Design: Balance, Rhythm, Contrast", "Drawing: Perspective and Shading Techniques", "Painting: Color Theory, Wheel, and Hue values", "Nigerian Crafts: Pottery, Leatherwork & Textiles", "Introduction to Music: Notation, Clefs, and Pitch", "Introduction to Drama: Theater terms, genres, play", "Traditional Art History: Nok and Ife Artworks", "Life Drawing: Proportion of Human Faces & Bodies", "Syllabus Review and Practical Art session", "End of 1st Term Evaluation & Examination"],
    2: ["Craft: Tie and Dye (Adire) methods & patterns", "Graphic Design: Lettering, Logos, poster layouts", "Art History: Royal Benin Bronzes and Symbolism", "Sculpting: Clay modeling and wire armatures", "Performing Arts: Choreography and Dance Steps", "Music: Sight-singing, Scales, and local drums", "Drama: Writing scripts and setting stage lights", "Craft: Weaving cane baskets and simple frames", "Syllabus Review and Practical Theater Day", "Landscape Painting: Capturing Outdoor Elements", "Mock Exhibition: Presentation of individual crafts", "End of 2nd Term Evaluation & Examination"],
    3: ["Traditional Art: Igbo-Ukwu Bronze artifacts", "Digital Design: Simple vector logo illustration", "Costume and Makeup design in stage theater", "Art History: Contemporary Nigerian Artists", "Music: Composition, triads, and chord blocks", "Drama: Producing and Directing JSS Class Play", "Craft: Bead looming and wire work structures", "Art Exhibition: Curating JSS Gallery display", "Comprehensive JSS Creative Arts Review", "WAEC JSS Creative Arts Examination Drills", "Interactive reviews and visual feedback", "End of 3rd Term Comprehensive Exams"]
  },
  creative_arts_ss: {
    1: ["Advanced Fine Arts: Visual Arts Classifications", "Advanced Perspective Drawing: Three-Point systems", "Painting: Acrylic and Woodboard oil color mix", "History of Nigerian Art: Ancient Nok to Benin", "Sculpting: Casting concrete and wood carving", "Graphic Design: Branding, Fonts, and Print works", "Performing Arts: Advanced Stage Play Directing", "Music Theory: Key signatures and transposition", "Art History: Taron, Esie, and Mbari arts", "Life Drawing: Sketching human figures in action", "Practical Art Project: High schooler exhibitions", "End of 1st Term Evaluation & Examination"],
    2: ["Craft: Advanced Adire fabric printing & design", "Graphic Design: Corporate Brand Identity layouts", "Art History: Oshogbo Art School developments", "Sculpting: Resin casting and modern welding", "Performing Arts: Acting styles and Voice pitch", "Music Theory: Orchestration, choir, and chords", "Drama Theory: Classical Greek vs Modern Plays", "Craft: Leatherwork bags and sandals crafting", "Practical Art Project: Curating Solo Exhibitions", "Painting: Still life, abstracts, and murals", "General Art Portfolio review and feedback", "End of 2nd Term Evaluation & Examination"],
    3: ["Traditional Crafts: Calabash carving and Glass", "Modern Art: Digital illustrations and UI layouts", "Exhibition: Curating Year-Ending Art Festival", "Art Criticism: Analyzing aesthetic masterpieces", "Independent Art Projects: Final Submissions", "West African Exam: Visual Arts Prep theory", "Mock Studio practical tests and portfolio review", "Review of careers in Visual and Theater arts", "High School Creative arts syllabus review", "Review of historical global art movements", "Final Senior Class design project review", "End of 3rd Term Comprehensive Exams"]
  },
  basic_tech_jss: {
    1: ["Basic Technology: Introduction and safety rules", "Technical Drawing: Equipment, pencils, and lines", "Drawing letter concepts: Lettering and numbering", "Plane Geometry: Angles, Triangles, and Circles", "Materials Processing: Woodwork hand tool systems", "Materials Processing: Metalwork hand tool systems", "Plastics and Rubbers: Structural properties", "Ceramics and Glass: Composition and safe uses", "Simple woodwork joints: Mortise and Tenon", "Simple metalwork joints: Riveting and screwing", "Basic Tech Termly Theory Revision", "End of 1st Term Evaluation & Examination"],
    2: ["Mechanical Power: Gears, Pulleys, and chains", "Pneumatics and Hydraulics: Pressure basics", "Electrical Circuits: Parallel and Series Loops", "Electronics Elements: Resistors, Diodes, Triodes", "Building Tech: Foundations, walls, and bricks", "Building: Bricklaying, plastering, and roofs", "Maintenance: Simple tool repairs and lubrication", "Technical Drawing: Orthographic projections", "Isometric drawing methods: Cubes and prisms", "Technical Drawing: Sectioning and dimensioning", "Basic Tech Termly Drawing Revision", "End of 2nd Term Evaluation & Examination"],
    3: ["Drawing: Auxiliary views and Developments", "Simple engines: Two-stroke vs Four-stroke", "Electricity: Generating power and solar panels", "Electronics: Integrated circuits & microchips", "Woodwork Machines: Lathe, Band saw, Sanding", "Metalwork Machines: Drill press, Lathe, Grinder", "Sewerage and plumbing systems in modern houses", "Technical drawing: Sectional views of tools", "WAEC JSS Basic Technology Exams Preparation", "Mock Practical drawing tests and assessments", "Review of industrial safety rules in workshops", "End of 3rd Term Comprehensive Exams"]
  },
  business_studies_jss: {
    1: ["Business Studies: Intro, scope, and objectives", "The Office: Structure, departments, and roles", "The Office Mail: Incoming and outgoing mail slips", "Office Documents: Receipts, Invoices, and Orders", "Office Equipment: Computers, Filing cabinets, Safe", "The Receptionist: Duties, manners, and phone log", "Introduction to Bookkeeping: Cash and Credit trade", "Bookkeeping Ledger: Double Entry Rules of debit", "The Journal System: Purchases and Sales Journals", "The Trial Balance: Simple balancing and checks", "Business Studies JSS 1 Syllabus Review", "End of 1st Term Evaluation & Examination"],
    2: ["Introduction to Commerce: Classification of Trade", "Aids to Trade: Banking, Transport, Insurance", "Aids to Trade: Shipping, Advertising, Warehouse", "Entrepreneurship: Setting up a small boutique", "Business Organizations: Proprietor and Partnership", "Keyboarding: Proper Home row keys typing skills", "Keyboarding: Typing speed and paragraph letters", "Office filing systems: Alphabetical and Numerical", "The Cash Book: Single Column ledger sheets", "The Petty Cash Book: Ledger and Voucher receipts", "Business Studies JSS 2 Syllabus Review", "End of 2nd Term Evaluation & Examination"],
    3: ["The Double Column Cash Book: Cash vs Bank logs", "Trial Balance Corrections and Suspense accounts", "Keyboarding: Word Processors formatting text", "Entrepreneurship: Funding options for small firms", "Consumer Rights: Protection, Agencies of Nigeria", "The Ledger: General Ledger, Sales Ledger postings", "Simple business budgets and calculations", "Sole Trade vs Limited liability corporations", "WAEC JSS Business Studies Exams Preparation", "Interactive JSS mock exams and reviews", "Review of Business Etiquettes and communications", "End of 3rd Term Comprehensive Exams"]
  },
  literature_ss: {
    1: ["Introduction to Literature: Prose, Drama, Poetry", "Literary Devices: Simile, Metaphor, Sarcasm", "Literary Devices: Alliteration, Imagery, Contrast", "Required African Drama: Wole Soyinka's plays", "Required Non-African Drama: Shakespeare plays", "Required African Prose: Classic Nigerian Novels", "Required Non-African Prose: Prescribed books", "African Poetry: Analysis of standard lyric poems", "Non-African Poetry: Unseen poetry analyses", "Characterization, plot, and themes development", "Termly Literature Review and essay outlines", "End of 1st Term Evaluation & Examination"],
    2: ["Drama Analysis: Tone, setting, and subplots", "Drama: Soliloquies and dramatic irony rules", "Prose Analysis: Narrative perspective, POV", "Prose: Contextual symbols and motifs analyses", "Poetry Analysis: Structure, stanza, rhyming", "Poetry: Figure of Speech structural analysis", "Literary criticism: Essay formatting for WAEC", "Reviewing WAEC prescribed Poems Weeks 1 to 5", "Reviewing WAEC prescribed Drama Characters", "Reviewing WAEC Prose structures and summaries", "Termly Literature Review and Essay outlines", "End of 2nd Term Evaluation & Examination"],
    3: ["Poetry: Analyzing Unseen Poems for Exams", "Drama: Comparing African and Non-African works", "Prose: Cross-textual themes and motifs", "Literary Essays: Formatting and timing strategies", "WAEC Prescribed Literature Syllabus Review", "Mock literature examinations and grading", "Analyzing historical literary movements", "Reviewing contemporary African writers", "High school senior literature study paths", "Mock quiz drills on poetic and stage terms", "Final review of literary devices and quotes", "End of 3rd Term Comprehensive Exams"]
  },
  crs_primary: {
    1: ["God the Creator: The creation story in Genesis", "Creation: Man in the Image of God", "The Fall of Man: Disobedience in Garden of Eden", "Abraham: The Call & Obedience of Faith", "Moses: The Exodus and Crossing the Red Sea", "David: The Shepherd Boy who defeated Goliath", "Solomon: The request for Wisdom and the Temple", "Jesus: Birth, Childhood, and family life", "Jesus: Baptism, temptation, and early fasting", "Jesus: Call of the Twelve Disciples to preach", "Primary CRS Term Syllabus Review and songs", "End of 1st Term Evaluation & Examination"],
    2: ["Jesus: Preaching and Parables of the Kingdom", "Parables: The Prodigal Son and Loving neighbor", "Parables: The Sower and Seed and Faith lessons", "Miracles: Healing the Sick and blind man Bart", "Miracles: Walking on Water and Calming Storm", "Miracles: Feeding of Five Thousand people", "Christian Values: Love, Obedience, and Mercy", "Christian Concord: Forgiving classmate errors", "Church Assembly: Celebrating together and worship", "Apostles: Early missionary trips and preaches", "Termly CRS Review and class moral discussion", "End of 2nd Term Evaluation & Examination"],
    3: ["Passion: The Last Supper and feet washing", "Passion: Gethsemane arrest and trials of Jesus", "Passion: Crucifixion, Cross death, and burial", "Easter: The Resurrection and empty tomb joy", "Ascension: Great Commission and Holy Spirit", "Pentecost: Gift of Holy Spirit and early church", "Early Church: Sharing of food and unity models", "Paul: Encounter on Damascus road & conversion", "Paul: Prison release and Roman travels basics", "Moral Living: Telling the truth and civic duties", "General Primary CRS Syllabus Comprehensive Review", "End of 3rd Term Comprehensive Exams"]
  },
  crs_jss: {
    1: ["Religion: The Call of Abraham & Isaac obedience", "The Exodus: Freedom of Children of Israel", "The Decalogue: Moses and Ten Commandments", "Early Leaders: Joshua, Deborah & Gideon", "Early Kings: Saul, David & Solomon Kingdoms", "The Prophets: Elijah, Elisha, Amos and Micah", "Birth of Jesus: Annunciation & nativity records", "Life of Jesus: Baptism, Temptations and fasting", "Ministry: Beatitudes Sermon on Mount", "Apostles: The Commission & Sending of Twelve", "JSS CRS Term Syllabus Review and drills", "End of 1st Term Evaluation & Examination"],
    2: ["Parables of Jesus: Kingdom morals and values", "Miracles of Jesus: Faith, Nature & Healing logs", "Social Morals: Love, Forgiveness and Integrity", "Christian Citizenship: Obeying state laws & tax", "Eminent Christian Pioneers in West African history", "Christian values: Diligence, honesty & work ethics", "Family values: Parental obedience and unity", "Civic safety: Peace-making and conflict therapies", "Syllabus Review & JSS scripture recitations", "Modern challenges: Cultism and positive choices", "Religious Harmony: Dialogues and mutual respect", "End of 2nd Term Evaluation & Examination"],
    3: ["The Passion of Jesus: Gethsemane to Calvary", "The Resurrection of Jesus & Empty Tomb Proofs", "The Ascension & Promise of the Comforter", "Pentecost: Outpouring of Holy Spirit on church", "Early Church Community: Sharing & Deacons selection", "Paul: Conversion, missionary journeys & Epistles", "Faith and Works: Bible teachings of James", "Christian stewardship: Caring for nature and poor", "JSS CRS Syllabus comprehensive termly review", "WAEC JSS CRS Examination question drills", "Scripture context analysis and moral quiz", "End of 3rd Term Comprehensive Exams"]
  },
  crs_ss: {
    1: ["The Sovereignty of God: Creation Genesis accounts", "The Call of Abraham and Covenant Obligations", "Leadership qualities of Moses and Joshua", "Early Monarchy: The Success and Failures of Saul", "The Shepherd King: David and Eternal Promise", "Wisdom and Decadence: King Solomon Era", "Elijah and Prophets of Baal Mount Carmel test", "Amos and Micah: Trust and Justice in Land", "Jeremiah: New Covenant and national distress", "Babyon Exile and Hope of Restoration Ezekiel", "Syllabus Review and Old Testament Analyses", "End of 1st Term Evaluation & Examination"],
    2: ["Birth of Jesus: Synoptic Gospels Comparative Studies", "Baptism & Temptations of Jesus: Theological core", "Miracles of Jesus: Analysis of Healing and Power", "Sermon on the Mount: Moral and Civic Standard", "Parables of Jesus: Theological mysteries of King", "The Passion Narrative: Last Supper to Crucifixion", "The Resurrection: Doctrinal implications", "The Holy Spirit on Pentecost: Doctrinal core", "Early Church: Life, Fellowship and Stephen Martyr", "Paul: Conversion of Saul and Acts Outline", "Syllabus Review and New Testament Analyses", "End of 2nd Term Evaluation & Examination"],
    3: ["Pauline Epistles: Justification by Faith Roman", "Letters: Love, Unity, and Christian Conduct Cor", "Eschatology: Hope, Thessalonians & Revelation", "Christian Citizenship: Political power Roman 13", "Social Crimes: Bible advice on Theft, cults, etc", "Stewardship and Financial Honesty in Malachi", "WAEC Senior Secondary CRS Syllabus Revisions", "Review of Old Testament Historical contexts", "Review of New Testament Doctrinal questions", "Mock CRS Examination Drills for West Africa", "General Ethics and High school moral studies", "End of 3rd Term Comprehensive Exams"]
  },
  irs_primary: {
    1: ["Al-Quran: Introduction to the Holy Scripture", "Quranic recitation of Surah Al-Fatihah", "Quranic recitation of Surah Al-Ikhlas", "Hadith: Introduction to Prophet's sayings", "Hadith: Importance of truth and cleanliness", "Tawheed: Five Pillars of Islamic Faith", "Tawheed: Faith in Allah, angels, and books", "Sirah: Birth of Prophet Muhammad PBUH", "Sirah: Prophet's childhood in Makkah", "Ibadah: Meaning of Wudu and steps", "Primary IRS Termly Syllabus Review & songs", "End of 1st Term Evaluation & Examination"],
    2: ["Quranic recitation of Surah An-Nas", "Quranic recitation of Surah Al-Falaq", "Hadith: Respecting parents and neighbors", "Tawheed: Faith in Prophets and Last Day", "Ibadah: Salat (The Five Daily Prayers)", "Salat: Times and steps of daily prayers", "Sirah: Prophet's marriage to Khadijah", "Sirah: First revelation in cave Hira", "Moral values: Honesty and kindness to poor", "Syllabus Review and Islamic moral play", "Termly Cleanliness and personal hygiene review", "End of 2nd Term Evaluation & Examination"],
    3: ["Quranic recitation of Surah Al-Asr", "Quranic recitation of Surah Al-Kawthar", "Hadith: Sharing food and keeping promises", "Tawheed: Allah is the One, Creator of all", "Ibadah: Sawm (Fasting in Month of Ramadan)", "Ibadah: Zakat (Giving charity to needy)", "Sirah: The Hijrah (Migration to Madinah)", "Sirah: Early Companion (Sahabah) Abu Bakr", "Mosque Etiquettes: Entering and leaving prayers", "Islamic clothing and modest habits for kids", "General Primary IRS Syllabus Revisions", "End of 3rd Term Comprehensive Exams"]
  },
  irs_jss: {
    1: ["Quranic Studies: Surah Al-Qariah & Al-Adiyat", "The compilation and preservation of Al-Quran", "Hadith: Arba'un (Forty Hadith) of Al-Nawawi", "Hadith: Moral teachings on trust and speech", "Tawheed: Shirk (Polytheism) and its gravity", "Allah's Attributes: Al-Khaliq, Al-Razzaq", "Sirah: Prophet's call to open dawah in Mak", "Sirah: persecution of early Sahabah Muslims", "Tawheed: Belief in Divine Decree (Qadar)", "Ibadah: Detailed Wudu, Ghusl, and Tayammum", "JSS IRS Term Syllabus Review & Recitation", "End of 1st Term Evaluation & Examination"],
    2: ["Quranic Studies: Surah Al-Alaq & Al-Asr", "Hadith: Teachings of work, Halal and Haram", "Islamic Law (Shari’ah): Definition and sources", "The Quran and Sunnah as primary sources of Law", "Ibadah: Detailed Salat steps, Sunnah, Nafl", "Sawm: Conditions, nullifications & benefits", "Zakat: Calculation, Nisab, and categories", "Hajj: Pillars, steps, and spiritual importance", "Sirah: Prophet's treaties and Badr Battle", "Moral value: Forgiveness, modesty and integrity", "JSS IRS Syllabus and jurisprudence reviews", "End of 2nd Term Evaluation & Examination"],
    3: ["Quranic Studies: Surah Al-Hujurat & Al-Mulk", "Hadith: Moral issues, modern drugs, cultism", "Sirah: Hijrah to Madinah, State establishment", "Eminent Sahabah: Abu Bakr, Umar, Uthman, Ali", "Sahabah: Female roles (Khadijah, Aisha)", "Islamic civil civilization in West Africa history", "Moral: Rights of neighbors and clean parenting", "JSS IRS Syllabus comprehensive termly review", "WAEC JSS IRS Examination question drills", "Jurisprudence context analysis and moral quiz", "Final Class reviews and Tajweed practices", "End of 3rd Term Comprehensive Exams"]
  },
  irs_ss: {
    1: ["Al-Quran: Revelation, preservation & Tafseer", "Surah Study: Surah Al-Baqarah (selected verses)", "Hadith: Study of Bukhari and Muslim selections", "Hadith: Sound, Fair, and Weak Hadith science", "Tawheed: Pure Monotheism (Tawheed Al-Asma)", "Allah's Attributes: Al-Hakim, Al-Qadir, Al-Wadud", "Sirah: Migration to Abyssinia and Boycott", "Sirah: Pledge of Aqabah and Hijrah blueprint", "Islamic Law: Sources (Quran, Sunnah, Ijma, Qiyas)", "Ibadah: Fiqh of Marriage, Nikah, and Family", "Syllabus Review and Quranic Recitation drills", "End of 1st Term Evaluation & Examination"],
    2: ["Surah Study: Surah Luqman (parent counsel)", "Surah Study: Surah Yasin (selected verses)", "Hadith: Social issues, usury, interest, trade", "Islamic Law: Inheritances and sharing rules", "Fiqh: Trade, contracts, and banking in Islam", "Islam in West Africa: empires of Mali, Songhai", "Sokoto Jihad: Sheikh Usman Dan Fodio reforms", "Sirah: Conquest of Makkah & Farewell Hajj", "Moral: Chastity, modesty, and avoidance of Zina", "Islamic statehood: Political and civil structures", "Syllabus Review and Jurisprudence drills", "End of 2nd Term Evaluation & Examination"],
    3: ["Islamic Philosophy & theology (Kalam) basics", "Contemporary moral issues: Islam and sciences", "Islamic Economy: Zakat and Waqf institutions", "Eminent Sahabah: Bilal, Khalid bin Walid, Abu", "Islam and Peace: Treaties and non-combat rules", "WAEC Senior Secondary IRS Syllabus Revisions", "Quranic Tajweed rules and Recitation practices", "Mock IRS Examinations for West African schools", "Review of Islamic inheritance math rules", "Review of sirah historical battles and treaties", "Revision of IRS syllabus and core questions", "End of 3rd Term Comprehensive Exams"]
  },
  phe_primary: {
    1: ["Introduce Physical Education: Meaning and types", "Physical fitness: Cardiovascular muscle exercises", "Locomotor skills: Walking, running, and jumping", "Non-locomotor skills: Stretching, bending, twisting", "Postures: Proper standing or seating positions", "Sprints: Starting stance, arm swings, running", "Jumps: High jump and Long jump basic steps", "Ball games: Kicking and passing soccer ball", "Gymnastics: Forward roll and physical balances", "Personal Safety: Wearing proper sports shoes", "PHE Termly Class Review and playground day", "End of 1st Term Evaluation & Examination"],
    2: ["Health Education: Clean body, hair, and teeth", "Diseases: Airborne vs waterborne germ spreads", "Nutrition: Eating proteins for repair & strength", "First Aid: Meaning and contents of box", "Safety: Avoiding falls and playground cuts", "Ball games: Bouncing and passing basketball", "Athletics: Relays and passing baton stick", "Swimming: Water safety and leg kick drills", "Traditional games: Local dances and matches", "Substance use: Warning kids about medicines", "Termly PHE Review & Physical drills day", "End of 2nd Term Evaluation & Examination"],
    3: ["Recreation: Leisure, games, and camping fun", "Posture: Correcting back bends and heavy bags", "Safety: Domestic fire exits and electricity", "Gymnastics: Balancing on low beams and rolls", "Ball games: Hand passing volleyball games", "Environmental hygiene: Classroom clean up day", "Nutrition: Healthy snacks versus sweet candies", "First Aid: Standard bandage wrapping drills", "Traditional dances: Cultural sports and games", "General Primary PHE Syllabus Revisions", "Physical and Health Education Quiz reviews", "End of 3rd Term Comprehensive Exams"]
  },
  phe_jss: {
    1: ["PHE: Historical definitions and components", "Physical Fitness: Agility, power, & endurance", "Athletics: Track events (Sprint, Middle, Long)", "Athletics: Field events (High Jump, Shot Put)", "Ball games: Football rules, pitches, and fouls", "Ball games: Basketball drills, double-dribble", "Gymnastics: Floor exercises, cartwheels, flips", "First Aid: Cardiopulmonary Resuscitation (CPR)", "Safety Education: Treating playground fractures", "Health: Communicable diseases, vectors, controls", "JSS PHE Syllabus Review & Fitness drills", "End of 1st Term Evaluation & Examination"],
    2: ["Ball games: Volleyball, Netball rules & specs", "Racket games: Table Tennis, Badminton matches", "Traditional African sports: Wrestling (Kokawa)", "Recreation: Camping, wilderness trails, leaves", "Nutrition: Water, Minerals & Athletic feeding", "Skeletal Anatomy: Bone structures & joints", "Muscular Anatomy: Triceps, biceps, and quads", "Circulatory system: Aerobic vs anaerobic sport", "Substance abuse: Danger of anabolic steroids", "Environmental health: Sewage & waste controls", "JSS PHE Term Syllabus sports practical", "End of 2nd Term Evaluation & Examination"],
    3: ["Nervous System: Sport reflex arcs and Brain", "First Aid: Rescue breathing, choking, burns", "PHE: National sporting organizations Nigeria", "PHE: International sports: Olympics & Commonwealth", "Diseases: HIV/AIDS, Syphilis, and prevention", "Community health: Clean air, noise and pollution", "Sportsmanship: Violence in stadiums and solutions", "Gymnastics: Vaulting box and gymnastics safety", "WAEC JSS PHE Examination question drills", "JSS Sports practical assessments on pitches", "General JSS Physical Syllabus Revisions", "End of 3rd Term Comprehensive Exams"]
  },
  home_economics_primary: {
    1: ["Home Economics: Meaning & importance in family", "Personal Grooming: Hair combing and body wash", "Personal grooming: Dental hygiene & clean teeth", "Clothing: Selecting appropriate clothes for weather", "Sewing: Introduction to simple threading & needles", "Sewing: Basic running stitches on small fabrics", "Home Management: Sweeping and vacuuming rooms", "Home: Keeps beds and toys neatly structured", "Food & Nutrition: Three classes of healthy foods", "Nutrition: Identifying fresh fruits & vegetables", "Primary Home Economics practical day", "End of 1st Term Evaluation & Examination"],
    2: ["Kitchen safety: Safety with knives and gas stove", "Food: Basic hygiene in washing cooking pots", "Textiles: Identifying cotton, wool, and silk", "Tailoring: Sewing simple buttons onto shirts", "Grooming: Washing and ironing school uniforms", "Health: Preventing insect bites in the home", "Budgeting: Saving piggybank money for toys", "Family relationships: Roles of mom and dad", "Syllabus Review & manual cooking contest", "Consumer choice: Checking dates on food boxes", "Primary home decor: Preparing nice flower pots", "End of 2nd Term Evaluation & Examination"],
    3: ["Nutrition: Cooking simple rice and egg meals", "Safety: Avoiding domestic water spills & falls", "Grooming: Keeping finger nails short and clean", "Textiles: Natural fibers versus artificial polyester", "Sewing: Constructing basic pillowcase envelopes", "Home: Arranging drawing room and visual spaces", "Consumer: Comparing prices in open food markets", "Family: Caring for babies and young siblings", "General Primary Home Economics Syllabus Revisions", "Mock Home Econ quizzes and practical drills", "Interactive feedback session and mock show", "End of 3rd Term Comprehensive Exams"]
  },
  home_economics_jss: {
    1: ["Home Economics: Meaning, Branches, and Careers", "Personal Grooming: Cleansing skincare and puberty", "Grooming: Hair textures and care products", "Clothing: Basic textile fibers (Cotton, Linen, Silk)", "Sewing: Stitches, seams, and sewing machines parts", "Sewing machine: Operations, threading and faults", "Home Management: Housing, choice and accessories", "Management: Surface flooring cleaning techniques", "Family: Structure, relationships, life cycle", "Nutrition: Micro & Macro nutrients in diet", "JSS Home Economics Termly Practices Review", "End of 1st Term Evaluation & Examination"],
    2: ["Nutrition: Dietary requirements for teenagers", "Meal Planning: Standard breakfast menu blueprint", "Kitchen layout: Safety rules, sinks and gas pipes", "Cooking methods: Boiling, baking, and roasting", "Food hygiene: Preventing salmonella & storage", "Tailoring: Fabric layouts and patterns cutting", "Clothing: Care labels, soap powders & irons", "Budgeting: Income, expenditure & family savings", "Consumer: Fraud, fake items, protecting money", "Home decor: Curtains, flower pots & visual match", "JSS Home Science termly cooking contest", "End of 2nd Term Evaluation & Examination"],
    3: ["Specialized Cookery: Baking cakes & pastries", "Tailoring: Sewing a JSS school blouse skirt", "Family: Social issues, child abuse, solutions", "Management: Selecting home furniture, lights", "Consumer: Consumer Protection agency (CPC) cases", "Community hygiene: Garbage dump and safe drains", "Traditional foods: Nigerian native recipe reviews", "General JSS Home Economics syllabus revisions", "WAEC JSS Home Economics Exams Practise", "Comprehensive JSS Cooking and Sewing Mock Exam", "Practical Portfolio reviews and grade marks", "End of 3rd Term Comprehensive Exams"]
  },
  french_jss: {
    1: ["Salutations: Bon matin, Bon après-midi, Salut", "Présentations: Je m'appelle, Enchanté de vous", "Les Nombres: Cardinal count 1 to 50", "L'école: Classroom objects and vocabulary", "La Famille: Mon père, ma mère, mes frères", "Les Verbes: Conjugating Présent de l'Indicatif", "Avoir et Être: Verbes de base et phrases", "Aller et Faire: Verbe d'action et expressions", "Les Jours et Mois: Days of week and month calendar", "L'Heure: Telling time (Quelle heure est-il?)", "Syllabus Review and French oral conversations", "End of 1st Term Evaluation & Examination"],
    2: ["La Nourriture: Food items, fruits & meals", "Les Vêtements: Clothing items and color labels", "La Maison: Rooms, furniture and decorations", "Les Hobbies: Sports, cinema, and outdoor acts", "Les Adjectifs Possessifs: Mon, ton, son rules", "Les Adjectifs Démonstratifs: Ce, cette, ces", "Les Verbes en -ER: Parler, manger, chanter", "Les Verbes en -IR: Finir, choisir, grandir", "La Météo: Weather talk (Le temps qu'il fait)", "Les Directions: Simple navigation and maps", "Syllabus Review and French written compositions", "End of 2nd Term Evaluation & Examination"],
    3: ["Les Nombres: Counting numbers 50 to 100", "Le Passé Composé: Easy past tense introductions", "Le Futur Proche: Going to do things (Aller + Inf)", "La Ville: Public places (Café, Bibliothèque)", "Les Professions: Teacher, doctor, and tech careers", "La Santé: Human body aches and hospital vocab", "French Culture: West African francophone nations", "JSS French Language syllabus termly revision", "WAEC JSS French Oral and Aural examinations", "French written letters of simple application", "General interactive class play and French songs", "End of 3rd Term Comprehensive Exams"]
  },
  geography_ss: {
    1: ["Geography: Scope and fields of Physical & Human", "The Solar System: Planets, Stars, Sun and Moon", "Earth Rotation & Revolution: Days and Night", "Earth Internal: Crust, Mantle, and Core structures", "Rock Types: Igneous, Sedimentary, and Metamorphic", "Practical Geography: Map scaling, grid lines", "Map reading: Identifying contours & heights", "Calculation of Gradient and vertical intervals", "Landforms: Volcanism, Earthquakes, and Plateaus", "Denudation: Mechanical and Chemical Weathering", "Syllabus Review and Local Map reading exercises", "End of 1st Term Evaluation & Examination"],
    2: ["Climatology: Temperature, Rainfall & pressure systems", "Climate: Wind systems, cyclones and monsoons", "World Climatic Types: Equatorial, Savanna, Sahara", "Vast Vegetation: Rainforests, Steppes, Coniferous", "Soil Science: Soil formation, profile, and types", "Sewerage: World population size and densities", "Transportation: Land routes, Railways, and Ships", "Industry: Global industrial hubs and manufacturing", "GIS: Geographical Information Systems basics", "Ecology: Environmental issues, erosion & dunes", "Termly Geography Map reading evaluations", "End of 2nd Term Evaluation & Examination"],
    3: ["Regional Geography of Nigeria: Coordinates, boundaries", "Nigeria: Relief geology and major drainage basins", "Nigeria: Climate regions, rainfall and temperature", "Nigeria: Vegetation types and Agricultural setups", "Nigeria: Mineral resources (Petroleum, Coal, Gas)", "Nigeria: Industrial hubs and shipping terminals", "Eco: Desertification, flooding and waste in Nigeria", "WAEC Map reading case study past sheets", "Past WAEC Geography Objective and Essay Practice", "Review of African Regional economics (ECOWAS)", "Comprehensive Senior Geography Syllabus Review", "End of 3rd Term Comprehensive Exams"]
  },
  commerce_ss: {
    1: ["Commerce: Meaning, Scope, Historical developments", "Occupation classification and Commercial divisions", "Introduction to Trade: Home trade transactions", "Trade: Detailed Retail Trade, setups & chains", "Trade: Detailed Wholesale Trade operations", "Foreign Trade: Imp, Exp, and Balance of trade", "Incoterms Rules: FOB, CIF, EXW transactions", "Sole Proprietorship and its financial layout", "Partnership: Agreement deed and funding models", "Limited Liability Companies: Shares, prospectus", "Syllabus Review and Trade documentation", "End of 1st Term Evaluation & Examination"],
    2: ["Aids to Trade: Banking services, Central & Comm", "Aids: Insurance principles (Indemnity, Utmost)", "Aids: Transportation (Road, Rail, Sea, Air)", "Aids: Communication forms and modern internet", "Aids: Warehousing benefits, types, and bonds", "Advertising: media, ethics, and marketing sales", "Stock Exchange: Trading shares and security deals", "Legal Aspect: Law of Contract & agreements details", "Consumer Protection: Rights, CPC, NAFDAC cases", "Business Financing: Loans, overdrafts and capital", "Termly Commerce practices and documentation", "End of 2nd Term Evaluation & Examination"],
    3: ["Public Corporations: Meaning, setups and funding", "Cooperative Societies: Types and Local benefits", "Trade Associations and Chambers of Commerce", "Business Communication: Internal memo, board notes", "Tourism and its economic inputs in West Africa", "Applied Commerce: Audits, marketing & logistics", "WAEC Senior Commerce Past Exams Practice", "WAEC Commercial Law case studies review", "Undergraduate commercial careers and professional", "Drafting Business prospectus and slide decks", "Senior Commerce High School Syllabus Review", "End of 3rd Term Comprehensive Exams"]
  },
  further_math_ss: {
    1: ["Algebra: Advanced Indices, Surds, & Quadratic Equs", "Polynomials: Factor Theorem and Remainder Theorem", "Partial Fractions: Linear, quadratic denominators", "Binary Operations: Closure, Commutative & Associative", "Matrices: 3x3 Determinants & Cramer's Rule", "Linear Transformations and Inverse Matrices", "Coordinate Geometry: Circle equations, tangent slope", "Conic Sections: Parabola, Ellipse, Hyperbola", "Trigonometric compound angle formula equations", "Vectors: Dot and Cross products of 3D lines", "Syllabus Review & Coordinate Calculus Drills", "End of 1st Term Evaluation & Examination"],
    2: ["Advanced Calculus: Limits & Continuity rules", "Calculus: First Principle of Differentiation", "Differentiation: Chain, Product & Quotient Rules", "Differentiation of Trigonometric functions", "Derivative application: Rate of change, tangent", "Derivative application: Maxima and Minima curves", "Calculus: Integration methods on polynomials", "Calculus: Integration by parts and substitutions", "Calculus: Area bounded by curves applications", "Kinematics: Velocity, displacement, uniform acc", "Syllabus Review and Calculus calculation Drills", "End of 2nd Term Evaluation & Examination"],
    3: ["Mechanics: Forces, resolutions, and equilibrium", "Mechanics: Friction, slopes, and inclined planes", "Dynamics: Newton's Laws & Momentum colliders", "Statics: Center of Gravity and Moments of Force", "Projectiles: Range, flight time on angular launches", "Statistics: Mean, Variance of Grouped Distributions", "Probability: Binomial and Poisson Distributions", "Probability: Normal Distribution standard curves", "WAEC Further Mathematics Past Questions Practice", "Undergraduate level calculus introduction", "High School Senior Further Math Syllabus Review", "End of 3rd Term Comprehensive Exams"]
  }
};

export function getWeeklyTopicTitle(
  classLevel: ClassLevel,
  subjectId: string,
  termNum: TermNumber,
  weekNum: WeekNumber
): string {
  const isPrimary = classLevel.startsWith('Primary');
  const isJSS = classLevel.startsWith('JSS');
  const isSS = classLevel.startsWith('SS');

  // Standardize the subjectId mapping keys
  let categoryKey = '';
  const subj = String(subjectId).toLowerCase().trim().replace(/__/g, '_');
  
  if (subj === 'mathematics' || subj === 'math') {
    categoryKey = `mathematics_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'further_mathematics' || subj === 'further_math') {
    categoryKey = 'further_math_ss';
  } else if (subj === 'english' || subj === 'english_studies' || subj === 'english_language' || subj === 'englishstudies') {
    categoryKey = `english_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'basic_science' || subj === 'basic_science_tech' || subj === 'physics' || subj === 'chemistry' || subj === 'biology') {
    if (isPrimary) {
      categoryKey = 'basic_science_primary';
    } else if (isJSS) {
      categoryKey = 'basic_science_jss';
    } else {
      categoryKey = `${subj}_ss`;
    }
  } else if (subj === 'civic_education' || subj === 'national_values' || subj === 'social_studies' || subj === 'government') {
    if (isPrimary) {
      categoryKey = 'civic_education_primary';
    } else if (isJSS) {
      categoryKey = 'civic_education_primary'; // Map JSS Social Studies & Civics to Primary-level baseline structures
    } else {
      categoryKey = subj === 'government' ? 'government_ss' : 'civic_education_ss';
    }
  } else if (subj === 'economics' || subj === 'accounting' || subj === 'financial_accounting' || subj === 'business_studies' || subj === 'commerce') {
    if (isPrimary || isJSS) {
      categoryKey = 'business_studies_jss';
    } else {
      categoryKey = subj === 'economics' ? 'economics_ss' : (subj === 'accounting' || subj === 'financial_accounting') ? 'accounting_ss' : 'commerce_ss';
    }
  } else if (subj === 'agricultural_science' || subj === 'agricultural_studies' || subj === 'agriculture') {
    categoryKey = `agricultural_science_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'computer_studies' || subj === 'computer_studies_ict' || subj === 'computer_science' || subj === 'ict') {
    categoryKey = `computer_studies_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'creative_arts' || subj === 'cultural_and_creative_arts' || subj === 'cultural_arts' || subj === 'cultural_creative_arts') {
    categoryKey = `creative_arts_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'basic_tech') {
    categoryKey = 'basic_tech_jss';
  } else if (subj === 'literature' || subj === 'literature_in_english' || subj === 'literature_studies') {
    categoryKey = 'literature_ss';
  } else if (subj === 'crs') {
    categoryKey = `crs_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'irs') {
    categoryKey = `irs_${isPrimary ? 'primary' : isJSS ? 'jss' : 'ss'}`;
  } else if (subj === 'phe') {
    categoryKey = `phe_${isPrimary ? 'primary' : 'jss'}`;
  } else if (subj === 'home_economics') {
    categoryKey = `home_economics_${isPrimary ? 'primary' : 'jss'}`;
  } else if (subj === 'french') {
    categoryKey = 'french_jss';
  } else if (subj === 'geography') {
    categoryKey = 'geography_ss';
  }

  const dataset = CURRICULUM_DATA[categoryKey];
  if (dataset && dataset[termNum]) {
    const list = dataset[termNum];
    const topic = list[weekNum - 1];
    if (topic) return topic;
  }

  // Beautiful algorithmic general fallback if specific array is missing
  const titles: Record<number, string[]> = {
    1: [
      `Introduction to Key Principles in ${subjectId.replace('_', ' ').toUpperCase()}`,
      `Essential Framework and Definitions of ${subjectId.replace('_', ' ').toUpperCase()}`,
      `Practical Exercises and Everyday Examples in ${subjectId.toUpperCase()}`,
      `Conceptual Mapping and Standard Methods in ${subjectId.toUpperCase()}`,
      `Intermediate Operations and Practical Case Studies`,
      `Core Review and Classroom Performance Exercises`,
      `Advanced Systems of Multi-tier Operations`,
      `Integrative Case Investigations and Quizzes`,
      `Regional Applications and Group Projects in Nigeria`,
      `Industrial Implications and Standard Regulations`,
      `Syllabus Revision and Interactive Mock Exercises`,
      `Comprehensive End-of-Term Examination`
    ],
    2: [
      `Comparative Studies of Core ${subjectId.toUpperCase()} Formulas`,
      `Measurement, Precision and Application Standards`,
      `Process Flowcharts and Systematic Structuring`,
      `Collaborative Projects and Performance Tests`,
      `Analysis of Complex Structural Components`,
      `Evaluation of Mid-term Project Submissions`,
      `Implementation Pipelines and Practical Lab Sessions`,
      `Solving Analytical Scenarios and Exercises`,
      `Future Technologies and Innovations in ${subjectId.replace('_', ' ').toUpperCase()}`,
      `Ethics, Safety and Environmental Concerns`,
      `Review of termly milestones and exam guidelines`,
      `Comprehensive End-of-Term Evaluation`
    ],
    3: [
      `Exploring Advanced ${subjectId.toUpperCase()} Landscapes`,
      `Quantitative Analyses and Analytical Formats`,
      `Empirical Assessments and Real-world Research`,
      `Strategic Case Analysis & Presentation Days`,
      `Development pipelines and validation procedures`,
      `Constructing Detailed Mind-maps and Charts`,
      `Interactive Class Debates and Performance Tests`,
      `Syllabic Synthesis and West African Alignments`,
      `Mock Theoretical Examination Drills`,
      `Review of Academic Portfolio Milestones`,
      `General Curriculum Revision Exercises`,
      `Comprehensive Final Examination Protocols`
    ]
  };

  const fallbacks = titles[termNum] || titles[1];
  return fallbacks[weekNum - 1] || `${subjectId.replace('_', ' ').toUpperCase()} Syllabus Concept (Week ${weekNum})`;
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
