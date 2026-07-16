import { LessonNote, QuizQuestion, TheoryQuestion, CurriculumWeek } from '../types';

interface SubjectTopicTemplate {
  subtopic: string;
  duration: string;
  objectives: string[];
  teachingMaterials: string[];
  keyVocabulary: string[];
  introduction: string;
  teacherExplanationSteps: string[];
  detailedLessonNote: string;
  studentActivities: string[];
  classExercises: string[];
  homeworkAssignment: string;
  quizQuestions: QuizQuestion[];
  theoryQuestions: TheoryQuestion[];
  subjectSpecificFocus: {
    title: string;
    content: string;
    safeguardsOrMoralLesson: string;
  };
}

export function generateLocalFallbackNote(
  subject: string,
  classLevel: string,
  term: string,
  week: string,
  storedTopic: string
): LessonNote {
  const normalized = storedTopic.toLowerCase();
  let category: string = 'general';

  // Determine the educational topic category using keyword analysis
  if (normalized.includes('count') || normalized.includes('whole number') || normalized.includes('place value') || normalized.includes('digit')) {
    category = 'numbers';
  } else if (normalized.includes('fraction') || normalized.includes('decimal') || normalized.includes('percent') || normalized.includes('ratio')) {
    category = 'fractions';
  } else if (normalized.includes('multipli') || normalized.includes('divis') || normalized.includes('bodmas') || normalized.includes('arithmetic') || normalized.includes('addition') || normalized.includes('subtraction')) {
    category = 'arithmetic';
  } else if (normalized.includes('algebra') || normalized.includes('equation') || normalized.includes('indices') || normalized.includes('surd') || normalized.includes('polynomial')) {
    category = 'algebra';
  } else if (normalized.includes('shape') || normalized.includes('geometry') || normalized.includes('angle') || normalized.includes('perimeter') || normalized.includes('area') || normalized.includes('circle') || normalized.includes('triangle')) {
    category = 'geometry';
  } else if (normalized.includes('living thing') || normalized.includes('plant') || normalized.includes('animal') || normalized.includes('digestive') || normalized.includes('respirat') || normalized.includes('cell') || normalized.includes('biolog')) {
    category = 'biology';
  } else if (normalized.includes('matter') || normalized.includes('atom') || normalized.includes('acid') || normalized.includes('base') || normalized.includes('salt') || normalized.includes('chem') || normalized.includes('solubil')) {
    category = 'chemistry';
  } else if (normalized.includes('force') || normalized.includes('motion') || normalized.includes('energy') || normalized.includes('work') || normalized.includes('wave') || normalized.includes('sound') || normalized.includes('light') || normalized.includes('physic')) {
    category = 'physics';
  } else if (normalized.includes('civic') || normalized.includes('value') || normalized.includes('symbol') || normalized.includes('constitut') || normalized.includes('citizen') || normalized.includes('integrity') || normalized.includes('discipline')) {
    category = 'civics';
  } else if (normalized.includes('noun') || normalized.includes('verb') || normalized.includes('pronoun') || normalized.includes('grammar') || normalized.includes('letter') || normalized.includes('concord') || normalized.includes('essay') || normalized.includes('english')) {
    category = 'english';
  } else if (normalized.includes('trade') || normalized.includes('commerce') || normalized.includes('business') || normalized.includes('buyn') || normalized.includes('sell') || normalized.includes('profit') || normalized.includes('saving')) {
    category = 'commerce';
  } else if (normalized.includes('soil') || normalized.includes('farm') || normalized.includes('crop') || normalized.includes('agricultur') || normalized.includes('tillage') || normalized.includes('sprout')) {
    category = 'agriculture';
  } else if (normalized.includes('food') || normalized.includes('nutrition') || normalized.includes('groom') || normalized.includes('sew') || normalized.includes('kitchen') || normalized.includes('cooking') || normalized.includes('home eco')) {
    category = 'home_economics';
  } else if (normalized.includes('computer') || normalized.includes('hardware') || normalized.includes('software') || normalized.includes('ict') || normalized.includes('internet') || normalized.includes('laptop')) {
    category = 'computer_studies';
  }

  const templates: Record<string, SubjectTopicTemplate> = {
    numbers: {
      subtopic: 'Understanding Digits, Numeric Values, and Positional Systems',
      duration: '40 Mins',
      objectives: [
        `Identify the face value and place value of digits in whole numbers within the specified scope.`,
        `Read and write whole numbers correctly in both numeric symbols and matching words.`,
        `Demonstrate active skip counting (in 2s, 5s, 10s, or 100s) to build numeric agility and patterns.`
      ],
      teachingMaterials: [
        'Abacus showing placeholders (Units, Tens, Hundreds, Thousands)',
        'Place Value grid card charts displayed on the class bulletin board',
        'Numerical flash cards and counting tokens/counters'
      ],
      keyVocabulary: [
        '🔢 Digits: Single symbols from 0 to 9 used to form numbers.',
        '📌 Place Value: The positional value a digit holds in a number (e.g., Units, Tens).',
        '🔑 Skip Counting: Counting forward or backward by incrementing values other than 1.'
      ],
      introduction: `To capture student attention, the teacher displays an abacus or holds up cards containing different numbers of zero. The teacher writes the number '5' and '50' on the board and asks: 'Are these the same? Why does adding a zero completely change what we can buy in the market with this naira value?' This highlights how the position of a digit dictates its entire value!`,
      teacherExplanationSteps: [
        `Step 1: Write down a multi-digit number (e.g., 5,432) on the blackboard and read it aloud with the class.`,
        `Step 2: Draw the Standard Place Value Grid consisting of Units (U), Tens (T), Hundreds (H), and Thousands (Th) columns.`,
        `Step 3: Insert the digits of the number into the columns, explaining that 5 represents 5 Thousands, 4 represents 4 Hundreds, 3 represents 3 Tens, and 2 represents 2 Units.`,
        `Step 4: Demonstrate expanded notation: 5,432 = 5000 + 400 + 30 + 2, showing that each position increases tenfold as we move from right to left.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. Conceptual Breakdown of Whole Numbers
Whole numbers are foundational numerical structures without fractional or decimal components. In our daily lives, from counting currency notes to managing inventories in local shops, we constantly engage with whole numbers.

To master whole numbers, we must distinguish between two essential attributes of a digit:
*   **Face Value**: The actual digit itself (e.g., in the number **74**, the face value of 7 is simply 7).
*   **Place Value**: The value represented by the digit depending on its position in the number (e.g., in **74**, the place value of 7 is **7 Tens**, which equals 70).

### 2. The Positional Place Value Columns
The National Educational Research and Development Council (NERDC) syllabus emphasizes structured positional grids. We represent digit positions using standardized columns:

| Place Column | Abbreviation | Mathematical Equivalent | Example (in **8,624**) |
| :--- | :--- | :--- | :--- |
| **Thousands** | Th | $1,000 \times \text{digit}$ | $8 \times 1,000 = 8,000$ |
| **Hundreds** | H | $100 \times \text{digit}$ | $6 \times 100 = 600$ |
| **Tens** | T | $10 \times \text{digit}$ | $2 \times 10 = 20$ |
| **Units** | U | $1 \times \text{digit}$ | $4 \times 1 = 4$ |

Therefore, the expanded notation is written as:
$$\\mathbf{8,624 = 8,000 + 600 + 20 + 4}$$

### 3. Writing Numbers in Words
When translating numbers to official words, we group digits from the right. For Primary 4 pupils, mastering spelling is vital:
*   **345**: Three hundred and forty-five (Note the Nigerian standard 'and' insertion).
*   **1,208**: One thousand, two hundred and eight.
*   **5,040**: Five thousand and forty.

### 4. Skip Counting Patterns
Skip counting involves incrementing numbers by a uniform number. This builds multiplication readiness:
*   **Counting in 5s**: $5, 10, 15, 20, 25, 30, \\dots$
*   **Counting in 10s**: $10, 20, 30, 40, 50, 60, \\dots$
*   **Counting in 100s**: $100, 200, 300, 400, 500, \\dots$`,
      studentActivities: [
        'Pupils work in pairs using the abacus to represent different numbers written by the teacher on the blackboard.',
        'Pupils play the "Place Value Toss" game, calling out positional names as digits are highlighted on cards.'
      ],
      classExercises: [
        'Write down the place value of the underlined digit in: 3,\\underline{7}84.',
        'Write the following number in words: 8,023.',
        'Complete the skip counting pattern: 150, 250, 350, ____, ____.'
      ],
      homeworkAssignment: 'Practice identifying numbers at home. Look at your parent\'s phone or utility bills and write down 5 numbers that contain up to 4 digits. Create a place value table for each and write them in words in your workbook.',
      quizQuestions: [
        {
          question: 'In the number 6,432, what is the place value of the digit 4?',
          options: ['4 Units', '4 Tens', '4 Hundreds', '4 Thousands'],
          correctIndex: 2,
          explanation: 'The digit 4 is in the third column from the right, which represents the Hundreds position.'
        },
        {
          question: 'What is the correct expanded form of 3,058?',
          options: ['300 + 50 + 8', '3000 + 500 + 8', '3000 + 50 + 8', '3000 + 500 + 80'],
          correctIndex: 2,
          explanation: '3,058 has 3 Thousands, 0 Hundreds, 5 Tens (50), and 8 Units (8), so 3000 + 50 + 8.'
        }
      ],
      theoryQuestions: [
        {
          question: 'Express the number "Seven thousand and ninety-four" in numerals, draw a place value grid, and write its expanded notation.',
          modelAnswer: '1. Numerals: 7,094\n2. Grid:\n- Thousands (Th) = 7\n- Hundreds (H) = 0\n- Tens (T) = 9\n- Units (U) = 4\n3. Expanded form: 7000 + 90 + 4.',
          markingSchemeName: 'Award 2 marks for correct numeral spelling; 4 marks for drawing and fully filling the grid; 4 marks for the mathematical expanded notation.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Concrete Counting and Active Place Visualization',
        content: 'Ensure pupils do not confuse the face value with the positional value. Common misconception: thinking that the 7 in 78 is worth 7. Always use color-coded columns on the board to reinforce position.',
        safeguardsOrMoralLesson: 'Discipline in measurement and counting builds honest trade practices. Remind pupils that in business, counting correctly ensures everyone is treated fairly without cheating.'
      }
    },
    fractions: {
      subtopic: 'Fractions, Decimals, Percentages, and Proportions',
      duration: '40 Mins',
      objectives: [
        `Explain the mathematical concept of a fraction as a part of a whole.`,
        `Differentiate clearly between the Numerator and the Denominator of a fraction.`,
        `Convert simple common fractions into their corresponding decimal and percentage forms.`
      ],
      teachingMaterials: [
        'A real local orange or circular paper representing "The Whole"',
        'Colored whiteboard markers to shade fraction segments',
        'Fraction strips and comparison charts'
      ],
      keyVocabulary: [
        '🍕 Fraction: A mathematical expression representing a part of an entire whole.',
        '➗ Denominator: The bottom number showing the total equal parts the whole is divided into.',
        '🔑 Numerator: The top number showing how many equal parts are selected or shaded.'
      ],
      introduction: `To capture interest, the teacher displays a single whole fresh Nigerian orange. The teacher asks: 'If three pupils want to share this single orange equally so that no one is angry, how do we cut it? Do we write this as 1 or something else?' This introduces the necessity of fractions to represent shared segments.`,
      teacherExplanationSteps: [
        `Step 1: Draw a large circle on the board and label it "1 Whole".`,
        `Step 2: Divide the circle into 4 equal quadrants. Shade one quadrant.`,
        `Step 3: Write $1/4$ on the board. Identify 1 as the Numerator (shaded part) and 4 as the Denominator (total parts).`,
        `Step 4: Show how $1/4$ converts to $0.25$ by division, and to $25\\%$ by multiplying by 100.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. The Core Definition of a Fraction
A fraction represents a part of a whole object or group. When we divide an item into equal portions, each portion represents a fraction of that item.

A standard fraction is written in the form:
$$\\frac{a}{b}$$
*   **$a$ (Numerator)**: The top number, representing the count of parts we have or are analyzing.
*   **$b$ (Denominator)**: The bottom number, representing the total number of equal divisions in the entire whole. **Crucially, the denominator can never be zero.**

### 2. Visualizing Division
Consider a local Nigerian round baked loaf of bread. If we divide this loaf into segments:
*   **Halves ($1/2$)**: Dividing into **2 equal parts**. One part is $1/2$ (one-half).
*   **Quarters ($1/4$)**: Dividing into **4 equal parts**. Shading 3 parts gives $3/4$ (three-quarters).
*   **Thirds ($1/3$)**: Dividing into **3 equal parts**.

### 3. Converting Fractions to Decimals and Percentages
We can express parts of a whole in multiple mathematical languages:

| Common Fraction | Decimal Conversion (Divide) | Percentage Conversion ($\times 100\\%$) |
| :--- | :--- | :--- |
| **$1/2$ (Half)** | $1 \div 2 = 0.5$ | $0.5 \times 100 = 50\\%$ |
| **$1/4$ (Quarter)** | $1 \div 4 = 0.25$ | $0.25 \times 100 = 25\\%$ |
| **$3/4$ (Three-Quarters)** | $3 \div 4 = 0.75$ | $0.75 \times 100 = 75\\%$ |
| **$1/10$ (One-Tenth)** | $1 \div 10 = 0.1$ | $0.1 \times 100 = 10\\%$ |

### 4. Real-world Proportions
Fractions are vital for measuring commodities, sharing agricultural yields, and reading maps. For example, if a cocoa farmer harvests 10 bags of cocoa and sells 6 bags, the fraction sold is:
$$\\frac{6}{10} = \\frac{3}{5}$$`,
      studentActivities: [
        'Pupils fold clean rectangular paper strips to create halves ($1/2$), quarters ($1/4$), and eighths ($1/8$) under teacher guidance.',
        'Pupils work in groups to solve real-world share scenarios involving sharing bags of chin-chin.'
      ],
      classExercises: [
        'Draw a rectangle, divide it into 8 equal parts, and shade 5 parts. Write the fraction shaded.',
        'Convert $3/10$ into decimal and percentage.',
        'Identify which is larger: $1/2$ or $1/4$ and explain why.'
      ],
      homeworkAssignment: 'Find a circular object at home, draw its shape on your homework sheet, and divide it into 6 equal sections. Shade 4 sections and write down the fraction, decimal, and percentage represented by the shaded and unshaded areas.',
      quizQuestions: [
        {
          question: 'If a circular pie is divided into 8 equal slices, and Obi eats 3 slices, what fraction of the pie is left?',
          options: ['3/8', '5/8', '8/3', '5/3'],
          correctIndex: 1,
          explanation: 'Obi ate 3 slices, leaving 8 - 3 = 5 slices. So 5 out of 8 equal parts remain.'
        },
        {
          question: 'What is the decimal equivalent of the fraction 3/5?',
          options: ['0.3', '0.5', '0.6', '0.75'],
          correctIndex: 2,
          explanation: 'Dividing 3 by 5 gives 0.6. (3.0 ÷ 5 = 0.6).'
        }
      ],
      theoryQuestions: [
        {
          question: 'A trader in Balogun Market has 20 crates of soft drinks. She sells 15 crates in the morning. Calculate the fraction of crates sold, reduce it to its lowest terms, and express this sale as a percentage.',
          modelAnswer: '1. Fraction sold: 15/20\n2. Lowest terms: Divide numerator and denominator by 5: (15÷5)/(20÷5) = 3/4\n3. Percentage: 3/4 * 100% = 75%.',
          markingSchemeName: 'Award 3 marks for writing 15/20; 3 marks for simplification to 3/4; 4 marks for converting to 75%.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Active Sharing and Equal Portion Modeling',
        content: 'Emphasize that the denominator represents *equal* parts. Pupils often draw unequal segments when dividing shapes. Correct this by demonstrating equal folds with paper strips.',
        safeguardsOrMoralLesson: 'Fractions teach us the value of equity, fairness, and transparency in distribution. Emphasize that when we share things, equal division prevents disputes and fosters peace.'
      }
    },
    arithmetic: {
      subtopic: 'Addition, Subtraction, Multiplication, and Division of Numbers',
      duration: '40 Mins',
      objectives: [
        `Carry out multi-digit additions and subtractions using positional carry-over and borrowing methods.`,
        `Apply the BODMAS rule correctly to solve multi-operational arithmetic problems.`,
        `Formulate and solve arithmetic word problems related to trading transactions in local markets.`
      ],
      teachingMaterials: [
        'Mock currency notes (Naira)',
        'Whiteboard grid for multi-digit column alignment',
        'Mathematical operation symbol cards (+, -, x, ÷, =)'
      ],
      keyVocabulary: [
        '➕ Carrying: Moving a tens digit to the next column during addition.',
        '➖ Borrowing (Regrouping): Taking a ten from a higher column to assist in subtraction.',
        '📌 BODMAS: Order of operations: Brackets, Of, Division, Multiplication, Addition, Subtraction.'
      ],
      introduction: `To capture student attention, the teacher acts out a quick buyer-seller trade scenario. 'I go to the market with 1,000 Naira to buy a book of 650 Naira and a pencil of 150 Naira. If the seller hands me back 100 Naira, is she correct or did she cheat me? How do we calculate our balance?' This establishes the practical value of multi-operational arithmetic.`,
      teacherExplanationSteps: [
        `Step 1: Write a multi-operational problem on the board: $25 + 5 \times 3$. Ask pupils for answers (some will say 90, some 40).`,
        `Step 2: Introduce BODMAS. Explain that Multiplication must be solved BEFORE Addition.`,
        `Step 3: Solve $5 \times 3 = 15$ first. Then add 25: $25 + 15 = 40$. Explain why 40 is mathematically correct.`,
        `Step 4: Demonstrate multi-digit addition and subtraction columns, aligning digits carefully.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. Operations and Place Value Alignment
To perform multi-digit addition and subtraction, alignment of numbers in their correct place value column is mandatory. Always start calculations from the **Units** column on the extreme right and proceed leftwards.

#### Example 1: Addition with Carrying
$$\\begin{array}{r@{\\quad}l}
\\mathbf{Th\\;H\\;T\\;U} \\\\
\\mathbf{3\\;4\\;8\\;6} \\\\
\\mathbf{+\\;2\\;7\\;3\\;9} \\\\
\\hline
\\mathbf{6\\;2\\;2\\;5}
\\end{array}$$
*   **Units**: $6 + 9 = 15$. Write **5**, carry **1 Ten** to the Tens column.
*   **Tens**: $8 + 3 + 1\\text{ (carried)} = 12$. Write **2**, carry **1 Hundred** to the Hundreds column.
*   **Hundreds**: $4 + 7 + 1\\text{ (carried)} = 12$. Write **2**, carry **1 Thousand** to the Thousands column.
*   **Thousands**: $3 + 2 + 1\\text{ (carried)} = 6$.

### 2. Subtraction with Regrouping (Borrowing)
When a digit in the upper row is smaller than the digit directly below it, we must borrow from the immediate left column:
$$\\begin{array}{r@{\\quad}l}
\\mathbf{H\\;T\\;U} \\\\
\\mathbf{5\\;2\\;3} \\\\
\\mathbf{-\\;1\\;8\\;7} \\\\
\\hline
\\mathbf{3\\;3\\;6}
\\end{array}$$
*   **Units**: $3 < 7$. Borrow 1 Ten from 2. The 3 becomes **13** ($13 - 7 = 6$).
*   **Tens**: The 2 became 1. Since $1 < 8$, borrow 1 Hundred from 5. The 1 becomes **11** ($11 - 8 = 3$).
*   **Hundreds**: The 5 became 4 ($4 - 1 = 3$).

### 3. Order of Operations: BODMAS
When multiple operational symbols appear in a single expression, we resolve them strictly according to the hierarchical rules of **BODMAS**:
1.  **B** - Brackets $(\quad)$
2.  **O** - Of $(\times \text{ conceptually})$
3.  **D** - Division $(\div)$
4.  **M** - Multiplication $(\times)$
5.  **A** - Addition $(+)$
6.  **S** - Subtraction $(-)$

#### Example 2: Solve $30 - (10 \div 2) + 4 \times 3$
*   **Brackets** first: $10 \div 2 = 5$. The expression becomes: $30 - 5 + 4 \times 3$
*   **Multiplication** next: $4 \times 3 = 12$. The expression becomes: $30 - 5 + 12$
*   **Addition**: Rearrange positive terms: $(30 + 12) - 5 = 42 - 5$
*   **Subtraction**: $42 - 5 = 37$.`,
      studentActivities: [
        'Pupils practice solving column addition equations on individual slate boards and present them to the teacher.',
        'Pupils roleplay a dynamic "Naira Market" in the classroom, calculating totals and change.'
      ],
      classExercises: [
        'Calculate: $5,283 + 2,948$.',
        'Solve using BODMAS: $15 + 24 \div 6 - 3 \times 2$.',
        'Subtract 1,845 from 4,000.'
      ],
      homeworkAssignment: 'Solve the following 3 arithmetic problems in your homework book: (a) $450 + (12 * 5) - 80$, (b) $8,230 - 4,756$, (c) A baker sells 5 crates of eggs for 2,500 Naira each, and spends 3,200 Naira on flour. How much profit does she make?',
      quizQuestions: [
        {
          question: 'What is the correct answer to: 18 - 6 ÷ 2 + 5?',
          options: ['11', '20', '16', '12'],
          correctIndex: 1,
          explanation: 'Under BODMAS, solve division first: 6 ÷ 2 = 3. The expression is 18 - 3 + 5. Rearrange addition: (18 + 5) - 3 = 23 - 3 = 20.'
        },
        {
          question: 'When we subtract 289 from 602, what do we get?',
          options: ['313', '323', '413', '303'],
          correctIndex: 0,
          explanation: 'Using standard column subtraction with borrowing: 602 - 289 = 313.'
        }
      ],
      theoryQuestions: [
        {
          question: 'Solve: 50 + (8 * 9) - 100 ÷ 4, clearly indicating each stage of the BODMAS rule you applied.',
          modelAnswer: '1. Brackets: (8 * 9) = 72. Expression becomes: 50 + 72 - 100 ÷ 4\n2. Division: 100 ÷ 4 = 25. Expression becomes: 50 + 72 - 25\n3. Addition: 50 + 72 = 122. Expression becomes: 122 - 25\n4. Subtraction: 122 - 25 = 97.',
          markingSchemeName: 'Award 2.5 marks for each completed calculation step in the correct hierarchy (Total 10 marks).'
        }
      ],
      subjectSpecificFocus: {
        title: 'BODMAS Hierarchy and Grid Alignment',
        content: 'Check for sign error traps. Ensure pupils do not add or subtract from left to right mechanically. Always mandate drawing of lines to align digits vertically before subtracting.',
        safeguardsOrMoralLesson: 'Fairness and integrity in counting. Remind pupils that accurate calculations protect us from being cheated, and ensure we give the exact change to others.'
      }
    },
    geometry: {
      subtopic: '2D and 3D Shapes, Angles, Perimeter, and Area',
      duration: '80 Mins',
      objectives: [
        `Identify and describe properties of common 2D shapes (squares, rectangles, circles) and 3D shapes (cubes, cuboids, cylinders).`,
        `Define and draw different classes of angles (acute, right, obtuse, straight).`,
        `Calculate the perimeter and area of regular rectangles and squares using standard formulas.`
      ],
      teachingMaterials: [
        'A physical cardboard box (cuboid) and chalk box (cube)',
        'Blackboard protractor and wooden ruler',
        'Pre-cut colorful shapes from cardboard'
      ],
      keyVocabulary: [
        '📐 Perimeter: The total distance around the outer boundary of a closed shape.',
        '🟩 Area: The total space occupied by a flat 2D shape, measured in square units.',
        '📌 Protractor: A measuring instrument used to determine or draw angles in degrees.'
      ],
      introduction: `To capture interest, the teacher holds up a flat sheet of cardboard and a small chalk box. 'What is the main difference between these two? If I step on the cardboard, it is flat. If I try to step on this box, it has height! Today we discover the world of 2D (flat) and 3D (solid) shapes.' This visually distinguishes the spatial dimensions.`,
      teacherExplanationSteps: [
        `Step 1: Sketch a square and a cube side-by-side on the board, pointing out edges, vertices, and faces.`,
        `Step 2: Draw a straight horizontal line. Create a vertical perpendicular line to show a $90^\\circ$ Right Angle.`,
        `Step 3: Introduce the perimeter formula for a rectangle: $P = 2(L + W)$ and area formula: $A = L \\times W$.`,
        `Step 4: Solve a practical perimeter problem on the board using a mock school garden size.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. 2D Shapes vs. 3D Shapes
Geometry explores the spatial properties of shapes.
*   **2D (Two-Dimensional) Shapes**: Flat shapes having only **Length** and **Width**. They have no thickness. Examples include Squares, Rectangles, Circles, and Triangles.
*   **3D (Three-Dimensional) Shapes**: Solid shapes having **Length**, **Width**, and **Height** (or thickness). Examples include Cubes, Cuboids, Cylinders, Spheres, and Cones.

#### Attributes of Solid Shapes:
*   **Face**: The flat or curved surface of the shape (e.g., a Cube has **6 flat square faces**).
*   **Edge**: The line where two faces meet (e.g., a Cube has **12 edges**).
*   **Vertex (plural: Vertices)**: The corner point where edges meet (e.g., a Cube has **8 vertices**).

### 2. Classification of Angles
Angles are formed when two straight lines meet at a point. We measure angles in degrees ($^\\circ$):
1.  **Acute Angle**: An angle **less than $90^\\circ$** (sharp corner).
2.  **Right Angle**: An angle **exactly equal to $90^\\circ$** (square corner, e.g., corner of a book).
3.  **Obtuse Angle**: An angle **greater than $90^\\circ$ but less than $180^\\circ$**.
4.  **Straight Angle**: An angle **exactly equal to $180^\\circ$** (a straight line).

### 3. Calculating Perimeter and Area
#### A. Rectangle Properties:
*   Opposite sides are equal.
*   All four angles are right angles ($90^\\circ$).

Let Length $= L$ and Width $= W$.
*   **Perimeter ($P$)**: The sum of all sides.
    $$P = L + W + L + W = 2(L + W)$$
*   **Area ($A$)**: The space inside.
    $$A = L \\times W$$

#### Example Calculation:
A rectangular classroom has a Length of **8 metres** and a Width of **5 metres**.
*   $$\\text{Perimeter } P = 2(8 + 5) = 2(13) = 26\\text{ metres}$$
*   $$\\text{Area } A = 8 \\times 5 = 40\\text{ square metres } (\\text{m}^2)$$`,
      studentActivities: [
        'Pupils trace faces of solid boxes on their drawing paper to observe how 3D shapes are built from flat 2D faces.',
        'Pupils identify acute, obtuse, and right angles within the classroom (e.g. window corners, open door positions).'
      ],
      classExercises: [
        'Calculate the perimeter and area of a square table with sides of 6 cm.',
        'Draw and label: (a) A Right Angle, (b) An Acute Angle.',
        'How many faces, edges, and vertices does a standard cuboid have?'
      ],
      homeworkAssignment: 'Measure the length and width of your dining table or sleeping mat at home in centimetres. Write down the values, and calculate the total perimeter and flat area using the formulas learned in class today.',
      quizQuestions: [
        {
          question: 'Which of the following describes an obtuse angle?',
          options: ['An angle exactly 90 degrees', 'An angle less than 90 degrees', 'An angle between 90 and 180 degrees', 'An angle exactly 180 degrees'],
          correctIndex: 2,
          explanation: 'An obtuse angle is wider than a right angle but smaller than a straight line, meaning it is between 90 and 180 degrees.'
        },
        {
          question: 'If a rectangle has length 10 cm and width 4 cm, what is its perimeter?',
          options: ['14 cm', '28 cm', '40 cm', '20 cm'],
          correctIndex: 1,
          explanation: 'Perimeter P = 2(L + W) = 2(10 + 4) = 2(14) = 28 cm.'
        }
      ],
      theoryQuestions: [
        {
          question: 'List the flat faces, edges, and vertices of a cylinder, and calculate the area of a rectangular plot of land in Lagos measuring 15 metres by 10 metres.',
          modelAnswer: '1. Cylinder Properties: 2 flat circular faces, 1 curved face, 2 curved edges, and 0 vertices.\n2. Area Calculation: Area = Length * Width = 15m * 10m = 150 square metres (m²).',
          markingSchemeName: 'Award 5 marks for correctly stating cylinder features; 5 marks for showing step-by-step rectangular area calculation with units.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Tactile Shape Exploration and Angle Verification',
        content: 'Avoid purely abstract drawing. Let pupils touch real solid objects like boxes, cans, and books to count vertices and faces themselves.',
        safeguardsOrMoralLesson: 'Precision in boundaries. Remind pupils that learning geometry helps land surveyors and builders construct solid houses and mark proper land boundaries fairly.'
      }
    },
    biology: {
      subtopic: 'Characteristics of Living Things, Plant Organs, and Animal Classification',
      duration: '40 Mins',
      objectives: [
        `State all seven characteristics of living things using the "MR NIGER D" mnemonic.`,
        `Label the major parts of a plant (leaf, stem, root, flower) and explain their biological functions.`,
        `Differentiate between plants and animals based on feeding, movement, and responsiveness.`
      ],
      teachingMaterials: [
        'A potted green plant brought from the school garden',
        'Diagram of the human skeletal system',
        'Flashcards of different animals (mammals, birds, insects)'
      ],
      keyVocabulary: [
        '🌱 MR NIGER D: Mnemonic for Movement, Respiration, Nutrition, Irritability, Growth, Excretion, Reproduction.',
        '🔬 Photosynthesis: The process green plants use to synthesize food using sunlight and carbon dioxide.',
        '🌿 Chlorophyll: Green pigment inside plant leaves that absorbs solar light energy.'
      ],
      introduction: `To capture interest, the teacher places a real green potted plant and a plastic toy car side by side. 'This car can move, and this plant cannot move from its spot. Does that mean the car is alive and the plant is dead? How do we know what is truly living?' This immediately triggers curiosity and sets up the definition of life.`,
      teacherExplanationSteps: [
        `Step 1: Write the letters M-R-N-I-G-E-R-D vertically on the board.`,
        `Step 2: Have pupils call out what each letter represents, writing definitions next to each character.`,
        `Step 3: Uproot a small weed carefully to display the roots, stem, and leaves, explaining the path of water and nutrients.`,
        `Step 4: Draw a comparative table contrasting plants and animals on the board.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. The Characteristics of Living Things
Living things are biological organisms that carry out active life processes. Non-living things do not perform these processes. We memorize the seven key characteristics using the famous Nigerian curriculum mnemonic: **MR NIGER D**

1.  **M - Movement**: The ability of an organism to change its position. Animals move their entire bodies (locomotion), while plants show restricted movement (e.g., leaves turning toward light).
2.  **R - Respiration**: The biological process of breaking down food substances inside cells to release energy.
3.  **N - Nutrition**: Obtaining food to provide energy for metabolic growth and body repairs.
4.  **I - Irritability (Sensitivity)**: The ability of an organism to respond to external stimuli (e.g., pulling your hand back from a hot stove).
5.  **G - Growth**: A permanent increase in size, dry mass, and complexity of an organism.
6.  **E - Excretion**: The removal of toxic metabolic waste products from the body (e.g., sweat, urine, carbon dioxide).
7.  **R - Reproduction**: The process of generating new offspring of the same species to ensure continuity of life.
8.  **D - Death**: The natural termination of all biological activity in an organism.

### 2. Anatomy and Functions of Plant Parts
Green plants are autotrophic (make their own food). A typical flowering plant has specific organs:
*   **Roots**: Hold the plant firmly in the soil. They absorb water and mineral salts from the ground.
*   **Stem**: Supports the leaves, flowers, and fruits. It transports water from the roots to the leaves.
*   **Leaves**: The "kitchen" of the plant. They contain **Chlorophyll** and capture solar rays to execute **Photosynthesis**:
$$\\text{Carbon Dioxide} + \\text{Water} \\xrightarrow{\\text{Sunlight}} \\text{Glucose} + \\text{Oxygen}$$
*   **Flowers**: The reproductive organs of the plant that develop into seeds and fruits.

### 3. Differences Between Plants and Animals

| Property | Green Plants | Animals |
| :--- | :--- | :--- |
| **Feeding** | Autotrophic (make food via photosynthesis) | Heterotrophic (must consume other organisms) |
| **Movement** | Restricted (growth movements towards stimulus) | Active locomotion (moving from place to place) |
| **Cell Wall** | Present (made of tough cellulose) | Absent |
| **Response** | Slow response, no nervous system | Rapid response via specialized nervous system |`,
      studentActivities: [
        'Pupils draw a neatly labeled diagram of a flowering plant in their notebooks.',
        'Pupils inspect fresh leaves to observe veins and feel leaf textures.'
      ],
      classExercises: [
        'Write out the full meaning of the MR NIGER D mnemonic.',
        'State two major functions of plant roots.',
        'Differentiate between excretion and nutrition.'
      ],
      homeworkAssignment: 'Go around your home environment. Make a list of 5 living things and 5 non-living things that you can see. For each living thing, describe how it exhibits at least two characteristics of "MR NIGER D".',
      quizQuestions: [
        {
          question: 'Which of the following characteristics of living things represents the removal of metabolic waste from the body?',
          options: ['Respiration', 'Nutrition', 'Excretion', 'Irritability'],
          correctIndex: 2,
          explanation: 'Excretion is the biological removal of toxic waste products of metabolism from cells.'
        },
        {
          question: 'What green pigment inside plant leaves is responsible for trapping sunlight during photosynthesis?',
          options: ['Stomata', 'Cellulose', 'Chlorophyll', 'Cytoplasm'],
          correctIndex: 2,
          explanation: 'Chlorophyll is the green pigment in chloroplasts that absorbs light energy to fuel photosynthesis.'
        }
      ],
      theoryQuestions: [
        {
          question: 'Draw a neatly labeled diagram of a flowering plant, and write a detailed paragraph comparing how plants and animals obtain food and move.',
          modelAnswer: '1. Diagram should label: Root, Stem, Leaf, Flower.\n2. Comparison paragraph: Green plants are autotrophic, synthesizing their food via photosynthesis using chlorophyll, water, and sunlight, whereas animals are heterotrophic and must ingest other organisms. For movement, animals move actively from place to place (locomotion) using limbs, wings, or fins, whereas plants only exhibit restricted growth movements, such as roots growing towards water or shoots turning towards sunlight.',
          markingSchemeName: 'Award 5 marks for neatness and accuracy of plant diagram labels; 5 marks for deep comparison paragraph on feeding and movement.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Handling Fresh Biological Specimens Carefully',
        content: 'When displaying plants in the classroom, remind pupils to treat local flora with care. Teach them that pulling too many leaves unnecessarily degrades the local school ecosystem.',
        safeguardsOrMoralLesson: 'Respect for life and environment. Teach pupils that because plants generate the oxygen we breathe, protecting local forests and planting trees is our civic duty to ensure national environmental health.'
      }
    },
    chemistry: {
      subtopic: 'States of Matter, Elements, Atoms, and Acids/Bases',
      duration: '40 Mins',
      objectives: [
        `Differentiate between the three physical states of matter (solids, liquids, gases) using particle arrangement descriptions.`,
        `Identify subatomic particles (protons, neutrons, electrons) inside the structure of an atom.`,
        `Classify common substances as acidic, basic, or neutral using a litmus paper test indicator.`
      ],
      teachingMaterials: [
        'A bottle of local pure water (liquid), a wooden block (solid), and an inflated balloon (gas)',
        'Red and Blue Litmus papers with real lemon juice and soap solution specimens',
        'Diagram of atomic structure showing shell orbitals'
      ],
      keyVocabulary: [
        '🧪 Matter: Anything that has mass and occupies physical space.',
        '🔑 Atom: The smallest chemical particle of an element that can take part in a chemical reaction.',
        '🍋 Acid: A chemical substance that releases hydrogen ions ($H^+$) in water and turns blue litmus red.'
      ],
      introduction: `To capture interest, the teacher sprays a small amount of local perfume in front of the class. Within seconds, pupils at the back raise their hands confirming they can smell it. The teacher asks: 'I sprayed this liquid here. How did its invisible particles travel across the room to your noses? Today, we enter the atomic world of matter!' This demonstrates gas particle diffusion.`,
      teacherExplanationSteps: [
        `Step 1: Draw three boxes representing Solids, Liquids, and Gases, drawing circles inside to represent particle densities.`,
        `Step 2: Draw the nucleus of an atom containing Protons (+) and Neutrons (0), with Electrons (-) spinning on outer energy shells.`,
        `Step 3: Dip blue litmus paper into lemon juice to show a sharp color change to red, explaining acid properties.`,
        `Step 4: Dip red litmus paper into laundry soap water to demonstrate its change to blue, establishing alkaline/base properties.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. The States of Matter and Particulate Arrangement
Matter is defined as any physical substance that occupies space and has mass. All matter is made up of tiny moving particles. We classify matter into three primary states:

*   **Solids**: Particles are tightly packed together in a fixed, regular pattern. They vibrate in place. Solids have a **definite shape and volume** (e.g., desk, stone, iron sheet).
*   **Liquids**: Particles are close together but slide past one another. Liquids have a **definite volume but take the shape of their container** (e.g., water, palm oil, kerosene).
*   **Gases**: Particles are spaced very far apart and move rapidly in all directions. Gases have **no definite shape or volume** (e.g., oxygen, cooking gas, water vapour).

### 2. The Structure of the Atom
An atom is the building block of all elements. An atom consists of two primary regions:
1.  **The Nucleus (Center)**: Contains heavy, dense particles:
    *   **Protons**: Positively charged particles ($+$).
    *   **Neutrons**: Neutral particles ($0$) with no charge.
2.  **The Shell Orbitals**: Circular paths surrounding the nucleus where **Electrons** (negatively charged particles, $-$) rotate at high speed.

### 3. Introduction to Acids, Bases, and Salts
Chemical compounds around us can be categorized depending on their pH attributes:

| Group | Chemical Definition | Litmus Test Action | Local Examples |
| :--- | :--- | :--- | :--- |
| **Acids** | Sour tasting substances that release $H^+$ ions | Turns Blue Litmus **Red** | Lemon, lime, vinegar, unripe mango |
| **Bases (Alkalis)** | Bitter tasting, soapy substances that release $OH^-$ ions | Turns Red Litmus **Blue** | Laundry soap, ash water, baking soda |
| **Neutral** | Balanced substances that are neither acidic nor basic | No change on litmus paper | Pure drinking water, table salt solution |

When an acid reacts with a base, they cancel each other out to form a neutral salt and water. This is called a **Neutralization Reaction**:
$$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$$`,
      studentActivities: [
        'Pupils observe the teacher dip Litmus paper indicator strips into household solutions (lime, soap water) and record colors.',
        'Pupils act out particle arrangements by standing close together (solid), walking around loosely (liquid), and running apart (gas).'
      ],
      classExercises: [
        'List three major differences between solids and gases based on their particle arrangements.',
        'State the charge of: (a) Protons, (b) Electrons, (c) Neutrons.',
        'What color does blue litmus paper turn when dipped in lime juice?'
      ],
      homeworkAssignment: 'Identify 3 acidic items and 3 basic/soapy items in your kitchen or washroom at home. Write them down in your science notebook, noting their tastes or textures (soapy/bitter/sour) and explain why we must handle concentrated chemicals with gloves.',
      quizQuestions: [
        {
          question: 'Which of the following subatomic particles has a negative charge and orbits around the nucleus of an atom?',
          options: ['Proton', 'Neutron', 'Electron', 'Molecule'],
          correctIndex: 2,
          explanation: 'Electrons are negatively charged subatomic particles that revolve in orbitals around the central positive nucleus.'
        },
        {
          question: 'A solution turns red litmus paper blue. This substance is classified as a/an:',
          options: ['Acid', 'Base (Alkali)', 'Neutral salt', 'Organic element'],
          correctIndex: 1,
          explanation: 'Bases or alkalis turn red litmus paper blue and feel soapy to the touch.'
        }
      ],
      theoryQuestions: [
        {
          question: 'Describe the atomic structure of an element, specifying the locations and charges of all three subatomic particles, and outline the particle configurations of solids, liquids, and gases.',
          modelAnswer: '1. Atomic Structure: An atom has a positive center called the nucleus containing positive Protons (+) and neutral Neutrons (0). Negative Electrons (-) orbit the nucleus on circular shell paths.\n2. Particle Configurations: Solids have particles tightly packed in a fixed lattice with vibrating motions. Liquids have slightly spaced particles that slide past one another. Gases have widely spaced particles that move rapidly and randomly in all directions.',
          markingSchemeName: 'Award 5 marks for complete, accurate atomic structure analysis; 5 marks for clear comparative descriptions of particle states.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Safe Handling of Classroom Chemical Indicators',
        content: 'Ensure pupils never taste unknown liquids in the laboratory to check if they are sour (acid) or bitter (base). Tasting is highly dangerous. Litmus indicators or pH meters must always be used.',
        safeguardsOrMoralLesson: 'Safety and discipline. Teach pupils that following rules in science lab experiments prevents fire or chemical accidents, building a mindset of responsibility and safety in our community.'
      }
    },
    physics: {
      subtopic: 'Forces, Motion, Energy Transformations, and Wave Properties',
      duration: '40 Mins',
      objectives: [
        `Define force as a pull or push action and state its standard unit of measurement.`,
        `Calculate speed using the distance-over-time formula and convert units from kilometres to metres.`,
        `Analyze energy transformations in simple daily setups (e.g. electrical to heat or kinetic to potential).`
      ],
      teachingMaterials: [
        'A spring balance and standard mass weights',
        'A toy ramp and marble to demonstrate acceleration and friction',
        'A physical flashlight showing battery energy chemical transformations'
      ],
      keyVocabulary: [
        '🔧 Force: A push or pull applied to an object, measured in Newtons (N).',
        '🏃 Speed: The rate of change of distance per unit time, measured in m/s.',
        '🔋 Chemical Energy: Energy stored within batteries, food, or fuel substances.'
      ],
      introduction: `To capture interest, the teacher pushes a heavy desk across the room and then releases a spring toy. 'Why did this desk move when I pressed it? Why does this spring jump back up? What is the invisible currency of work that we call energy?' This links forces directly to physical work.`,
      teacherExplanationSteps: [
        `Step 1: Push a cart on the board, draw arrows showing Force (F) and Friction (f) acting in opposite directions.`,
        `Step 2: Write down the Speed equation: $\\text{Speed} = \\text{Distance} \\div \\text{Time}$ with units.`,
        `Step 3: Solve a speed word problem: A car traveling 100 metres in 5 seconds has a speed of $20\\text{ m/s}$.`,
        `Step 4: Trace battery energy conversion: Chemical Energy $\\rightarrow$ Electrical Energy $\\rightarrow$ Light Energy.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. Forces and Friction
In physics, a **Force** is defined as any push or pull action applied to an object. Forces are vector quantities (they have both magnitude and direction).
*   **Unit of Force**: Newton (symbol: **N**).

When a force is applied to an object, it can:
1.  Cause a stationary object to move.
2.  Stop a moving object.
3.  Change the speed or direction of motion.
4.  Change the physical shape of the object (e.g., stretching a rubber band).

**Friction** is a contact force that opposes motion. It acts in the opposite direction to the movement of the object. Friction on local Nigerian roads is essential for cars to brake safely without sliding.

### 2. Motion and Calculating Speed
Motion is the change in position of an object over time. To analyze motion, we calculate **Speed**:
$$\\text{Speed} = \\frac{\\text{Distance Traveled}}{\\text{Time Taken}}$$

*   **Distance** is measured in **metres (m)**.
*   **Time** is measured in **seconds (s)**.
*   **Speed Unit**: Metres per second (**m/s**).

#### Sample Calculation:
A high-speed train travels a distance of **200 metres** in exactly **10 seconds**. Calculate its speed:
$$\\text{Speed} = \\frac{200\\text{ m}}{10\\text{ s}} = 20\\text{ m/s}$$

### 3. Energy Transformations
Energy cannot be created or destroyed, but it can change form. This is called the **Law of Conservation of Energy**:
*   **Electric Fan**: Electrical Energy $\\rightarrow$ Kinetic (mechanical) Energy.
*   **Kerosene Lamp**: Chemical Energy (fuel) $\\rightarrow$ Heat and Light Energy.
*   **Solar Panel**: Solar Energy (sunlight) $\\rightarrow$ Electrical Energy.
*   **Hydroelectric Dam (e.g., Kainji Dam)**: Potential Energy of Water $\\rightarrow$ Kinetic Energy $\\rightarrow$ Electrical Energy.`,
      studentActivities: [
        'Pupils rub their palms together vigorously for 10 seconds to feel the conversion of mechanical energy into heat via friction.',
        'Pupils measure the distance from one wall to another and time how long it takes to walk it, calculating their average speed.'
      ],
      classExercises: [
        'A cyclist rides a distance of 150 metres in 15 seconds. Calculate the cyclist\'s speed.',
        'List 3 effects that a force can have on a moving ball.',
        'Trace the energy transformations that occur when a flashlight powered by dry cells is switched on.'
      ],
      homeworkAssignment: 'Identify 4 electrical or mechanical appliances inside your home. In your workbook, write down their names, draw their simplified forms, and map out the exact input and output energy transformations for each appliance.',
      quizQuestions: [
        {
          question: 'What is the standard unit of measurement for force in Physics?',
          options: ['Watt', 'Joule', 'Newton', 'Metre per second'],
          correctIndex: 2,
          explanation: 'Force is measured in Newtons (N), named after Sir Isaac Newton.'
        },
        {
          question: 'If an athlete runs 400 metres in 50 seconds, what is her average speed?',
          options: ['4 m/s', '8 m/s', '10 m/s', '12 m/s'],
          correctIndex: 1,
          explanation: 'Speed = Distance / Time = 400m ÷ 50s = 8 m/s.'
        }
      ],
      theoryQuestions: [
        {
          question: 'State the Law of Conservation of Energy, define friction, and outline two advantages and two disadvantages of friction on our highways.',
          modelAnswer: '1. Law of Conservation of Energy: Energy cannot be created or destroyed, but only converted from one form to another.\n2. Friction: A contact force that opposes the relative motion between two surfaces in contact.\n3. Advantages of friction: Allows cars to brake safely without skidding; enables humans to walk without slipping.\n4. Disadvantages: Causes wear and tear on car tires; generates unwanted heat and reduces engine efficiency.',
          markingSchemeName: 'Award 4 marks for stating the energy law correctly; 2 marks for friction definition; 4 marks for giving clear advantages and disadvantages.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Safe Mechanical Measurements and Unit Accuracy',
        content: 'Ensure pupils write the correct units (m/s, N, m, s) next to all numerical answers. In physics, numbers without units are scientifically incomplete.',
        safeguardsOrMoralLesson: 'Precision and hard work. Just as physics requires precise calculations to build safe bridges, our personal tasks require dedication and accuracy to build a prosperous nation.'
      }
    },
    civics: {
      subtopic: 'National Identity, Citizenship, Integrity, and Democratic Values',
      duration: '40 Mins',
      objectives: [
        `Explain the civic concept of citizenship and outline how to become a citizen of Nigeria.`,
        `Identify the five official Nigerian national symbols and state their historical and civic importance.`,
        `Demonstrate a deep understanding of integrity and discipline as core values for national development.`
      ],
      teachingMaterials: [
        'A large high-quality picture of the Nigerian National Flag',
        'Printed sheet containing the words of the National Anthem and Pledge',
        'National Passport sample or representation'
      ],
      keyVocabulary: [
        '🇳🇬 National Flag: Green-White-Green banner representing agriculture and peace.',
        '🤝 Integrity: Being honest, upright, and having strong moral principles.',
        '🔑 Citizenship: The official status of belonging to a specific sovereign country.'
      ],
      introduction: `To capture interest, the teacher points to the green-white-green flag mounted in the classroom. 'When we see this flag at the stadium or on our president's car, what does it tell the rest of the world? Why do we stand perfectly erect when the anthem is sung?' This anchors the concept of national identity and collective respect.`,
      teacherExplanationSteps: [
        `Step 1: Draw the Nigerian National Flag on the board, pointing out the Green (agriculture) and White (peace) stripes.`,
        `Step 2: Explain the coat of arms: the red eagle (strength), the white horse (dignity), the Y-shape (Rivers Niger and Benue).`,
        `Step 3: Define "Integrity" through everyday classroom scenarios (returning a lost pen, telling the truth).`,
        `Step 4: Recite the National Pledge in unison, explaining the weight of terms like "To be faithful, loyal, and honest".`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. Citizenship and the Nigerian State
A citizen is a person who is legally recognized as a member of a country. Citizenship grants individuals legal rights, such as voting and protection under the constitution, and demands civic duties, such as paying taxes and obeying laws.

According to the Constitution of Nigeria, a person can obtain Nigerian citizenship through:
1.  **Birth**: If either of the person's parents is a citizen of Nigeria.
2.  **Registration**: Granted to foreign women married to Nigerian men under specific guidelines.
3.  **Naturalization**: Granted to foreigners who have lived in Nigeria for over 15 years, obey local laws, and contribute positively to our society.

### 2. The Official National Symbols of Nigeria
National symbols represent our unity, sovereignty, and rich historical heritage:
*   **The National Flag**: Designed by Mr. Michael Taiwo Akinkunmi in 1959. It consists of three vertical bands of equal width: **Green, White, and Green**. Green represents Nigeria's rich agricultural wealth, while White represents peace and national unity.
*   **The National Anthem ("Arise, O Compatriots")**: A call to action for all Nigerians to serve their fatherland with love, strength, and faith.
*   **The National Pledge**: A solemn promise to be faithful, loyal, and honest to Nigeria, and to defend her unity.
*   **The Coat of Arms**: Represents our national power and geographical identity:
    *   **Red Eagle**: Strength and pride.
    *   **White Horses**: National dignity.
    *   **Black Shield**: Nigeria's fertile soil.
    *   **Silver Y-Shape**: The confluence of the great Rivers Niger and Benue at Lokoja.
    *   **Yellow Wildflowers (Coctus Spectabilis)**: Our beautiful natural landscape.
*   **The National Currency**: Naira (₦) and Kobo (k), representing our economic sovereignty.

### 3. Core Moral Values: Integrity and Discipline
National development is built on the moral character of its citizens.
*   **Integrity**: Standing up for what is right even when no one is watching. An honest pupil does not cheat during exams or steal.
*   **Discipline**: Self-control and obedience to rules. Arriving at school early, wearing the proper uniform, and keeping the environment clean are expressions of civic discipline.`,
      studentActivities: [
        'Pupils color a template of the Nigerian Coat of Arms or Flag in their drawing books.',
        'Pupils practice a mock court scenario where a citizen defends their constitutional rights.'
      ],
      classExercises: [
        'Who designed the Nigerian National Flag and in what year?',
        'Describe what the Y-shape and the red eagle represent on the Nigerian Coat of Arms.',
        'List 3 ways an individual can demonstrate civic discipline at school.'
      ],
      homeworkAssignment: 'Memorize the second stanza of the Nigerian National Anthem. In your workbook, write down the words of the second stanza neatly and write a short 3-sentence summary of what we are praying for in that stanza.',
      quizQuestions: [
        {
          question: 'What do the green stripes on the Nigerian national flag represent?',
          options: ['Peace and Unity', 'Rich Agricultural Wealth', 'Strength and Pride', 'Our local water bodies'],
          correctIndex: 1,
          explanation: 'The green color on the Nigerian flag represents the country\'s fertile agricultural land and natural wealth.'
        },
        {
          question: 'Which of the following is NOT an official method of becoming a citizen of Nigeria?',
          options: ['By Birth', 'By Naturalization', 'By Registration', 'By buying local land'],
          correctIndex: 3,
          explanation: 'Buying land or property in Nigeria does not legally confer citizenship on a foreigner.'
        }
      ],
      theoryQuestions: [
        {
          question: 'State the importance of national symbols in promoting unity among Nigerians, and explain the core difference between integrity and discipline in daily civic life.',
          modelAnswer: '1. National Symbols promote unity by acting as a single rallying banner for all diverse ethnic groups, instilling national pride, and reminding us of our shared history and laws.\n2. Integrity vs Discipline: Integrity is the moral quality of being consistently honest and adhering to ethical values (e.g., returning a lost phone). Discipline is the systemic practice of self-control and obeying established codes of conduct (e.g., punctuality and following traffic signs).',
          markingSchemeName: 'Award 5 marks for rich analysis of national symbols; 5 marks for clearly distinguishing integrity and discipline with local examples.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Respecting National Symbols with Civic Care',
        content: 'Teach pupils that tearing the national flag or steping on currency notes is illegal and highly unpatriotic. Teach proper handling of currency and national banners.',
        safeguardsOrMoralLesson: 'Patriotism and national service. Remind pupils that the future of Nigeria depends on our daily choices. Small actions of honesty inside the classroom prepare us to lead the nation with excellence.'
      }
    },
    general: {
      subtopic: 'Core NERDC Syllabus Subject Context and Pedagogy',
      duration: '40 Mins',
      objectives: [
        `Understand the foundational concepts of the specified topic: "${storedTopic}".`,
        `Apply theoretical rules to solve practical problems associated with "${storedTopic}".`,
        `Relate this knowledge to local everyday applications in the Nigerian environment.`
      ],
      teachingMaterials: [
        'Chalkboard and colored chalk indicators',
        'Standard NERDC-approved reference textbook',
        'Relevant local case sheets'
      ],
      keyVocabulary: [
        `🔑 ${storedTopic}: The core topic of this weekly module.`,
        '📌 NERDC Syllabus: The National Educational Research and Development Council guidelines.',
        '💡 Practical Application: Solving real-world issues using academic theory.'
      ],
      introduction: `To capture student interest, the teacher connects the topic to local Nigerian life. 'Why do we need to study ${storedTopic}? Understanding this helps us solve problems in our local market, trade fairly, and speak clearly in our community.' This sets a practical frame for learning.`,
      teacherExplanationSteps: [
        `Step 1: Write down the topic "${storedTopic}" on the blackboard.`,
        `Step 2: Breakdown the fundamental definitions and key rules clearly.`,
        `Step 3: Solve a step-by-step example on the board with active pupil participation.`,
        `Step 4: Answer student questions and clarify common misconceptions.`
      ],
      detailedLessonNote: `## Detailed Lesson Note: ${storedTopic}

### 1. Core Overview of ${storedTopic}
Understanding the fundamentals of **${storedTopic}** is essential for academic growth and practical application. This lesson breaks down the key definitions, principles, and concepts that form the foundation of this topic in the **${subject}** curriculum for **${classLevel}**.

*   **Primary Definition**: This refers to the core concepts, terms, and systems that define ${storedTopic}, establishing the rules and frameworks we use to study and analyze this subject.
*   **Key Academic Relevance**: This topic helps students develop logical reasoning, structured analytical thinking, and practical problem-solving skills necessary for both school exams and everyday life.

### 2. Conceptual Breakdown & Step-by-Step Explanation
When exploring **${storedTopic}**, we follow a structured approach to understand how different elements interact:
1.  **Identifying Key Variables & Vocabulary**: We first define the central elements and words associated with this topic to build a clear vocabulary.
2.  **Applying Rules & Formulas**: We connect these elements together using standard academic guidelines, formulas, or logical principles.
3.  **Solving Practical Examples**: By practicing step-by-step problems and analyzing complete case studies, we learn how to verify our results and avoid common mistakes.

### 3. Practical Applications in local Nigerian Contexts
The principles of **${storedTopic}** are applied every single day across various regions of Nigeria, from busy commercial centers like Lagos, Onitsha, and Kano to agricultural communities in Benue and Kaduna:
*   **Trade & Business Transactions**: Helps in calculating correct values, budgeting costs, and managing small business accounts fairly in our local markets.
*   **Structured Communication & Literacy**: Guides how we organize information, write clear reports, and communicate with others in public or professional settings.
*   **Technical and Scientific Systems**: Assists in planning, measurement, and execution of daily activities in schools, farms, or workshops.`,
      studentActivities: [
        'Pupils read the definitions from their notebooks in unison and complete group worksheets.',
        'Pupils ask questions to clarify complex terms highlighted on the chalkboard.'
      ],
      classExercises: [
        `Define the main principles of: ${storedTopic}.`,
        'Solve the primary task written on the chalkboard by the teacher.',
        'Give one local Nigerian example where this topic is applied in everyday life.'
      ],
      homeworkAssignment: `Complete the exercises on page 12 of your standard ${subject} textbook related to "${storedTopic}". Show all working clearly in your exercise book.`,
      quizQuestions: [
        {
          question: `Which of the following is correct regarding the core principles of ${storedTopic}?`,
          options: [
            'We should ignore rules and guess answers',
            'We must follow structured steps and verify our calculations',
            'Only teachers need to understand these guidelines',
            'None of the above'
          ],
          correctIndex: 1,
          explanation: 'Standard academic success depends on following structured steps and double-checking our calculations.'
        },
        {
          question: 'Who sets the official national educational standards in Nigeria?',
          options: ['Aviation Ministry', 'NERDC (National Educational Research and Development Council)', 'Postal Service', 'Naira Council'],
          correctIndex: 1,
          explanation: 'The NERDC is the official body responsible for compiling curriculum guidelines for primary and secondary schools.'
        }
      ],
      theoryQuestions: [
        {
          question: `Explain the fundamental importance of "${storedTopic}" in high school curricula, and list two practical real-world scenarios where this is used in Nigeria.`,
          modelAnswer: `Understanding ${storedTopic} builds logical and quantitative reasoning skills. Real-world applications include managing retail trade calculations in local markets (e.g., Alaba or Ariaria) and executing environmental or crop planning in agriculture.`,
          markingSchemeName: 'Award 5 marks for clear conceptual explanation; 5 marks for realistic local market/farm applications.'
        }
      ],
      subjectSpecificFocus: {
        title: 'Aligning Instruction with Active Pupil Feedback',
        content: 'Check for student understanding at each step of the explanation. Encourage active questions rather than rote passive copying from the board.',
        safeguardsOrMoralLesson: 'Academic commitment and moral honesty. Remind pupils that working hard on their schoolwork prepares them to lead positive developments in Nigeria.'
      }
    }
  };

  const selectedTemplate = templates[category] || templates['general'];

  return {
    topic: storedTopic,
    subtopic: selectedTemplate.subtopic,
    duration: selectedTemplate.duration,
    objectives: selectedTemplate.objectives,
    teachingMaterials: selectedTemplate.teachingMaterials,
    keyVocabulary: selectedTemplate.keyVocabulary,
    introduction: selectedTemplate.introduction,
    teacherExplanationSteps: selectedTemplate.teacherExplanationSteps,
    detailedLessonNote: selectedTemplate.detailedLessonNote,
    studentActivities: selectedTemplate.studentActivities,
    classExercises: selectedTemplate.classExercises,
    homeworkAssignment: selectedTemplate.homeworkAssignment,
    quizQuestions: selectedTemplate.quizQuestions,
    theoryQuestions: selectedTemplate.theoryQuestions,
    subjectSpecificFocus: selectedTemplate.subjectSpecificFocus
  };
}

export function generateLocalFallbackCurriculum(
  subject: string,
  classLevel: string,
  term: string
): CurriculumWeek[] {
  const normSubject = subject.toLowerCase().trim();
  const weeks: CurriculumWeek[] = [];

  const isMath = normSubject.includes('math') || normSubject.includes('algebra') || normSubject.includes('geometry') || normSubject.includes('arithmetic');
  const isEnglish = normSubject.includes('english') || normSubject.includes('grammar') || normSubject.includes('literature') || normSubject.includes('comprehension') || normSubject.includes('writing');
  const isScience = normSubject.includes('science') || normSubject.includes('tech') || normSubject.includes('biolog') || normSubject.includes('chemist') || normSubject.includes('physic');
  const isCivic = normSubject.includes('civic') || normSubject.includes('social') || normSubject.includes('government') || normSubject.includes('value');

  if (isMath) {
    const mathTopics = [
      {
        topic: 'Whole Numbers: Place Value, Face Value, and Expanded Notation',
        objectives: [
          'Identify face value and place value of digits in whole numbers',
          'Read and write whole numbers correctly in digits and words',
          'Represent whole numbers using a standard positional grid'
        ],
        keywords: ['numbers', 'place value', 'digits', 'expanded form']
      },
      {
        topic: 'Arithmetic Operations: Multi-Digit Addition and Subtraction',
        objectives: [
          'Perform multi-digit addition using positional carrying methods',
          'Perform multi-digit subtraction with positional borrowing and regrouping',
          'Solve practical money transactions and change problems'
        ],
        keywords: ['addition', 'subtraction', 'borrowing', 'naira']
      },
      {
        topic: 'Multiplication and Division: Tables, Factors, and Long Division',
        objectives: [
          'Recall multiplication facts and tables up to 12',
          'Execute multi-digit multiplication step-by-step',
          'Perform long division with and without remainders'
        ],
        keywords: ['multiplication', 'division', 'tables', 'factors']
      },
      {
        topic: 'Fractions: Types, Numerator, Denominator, and Operations',
        objectives: [
          'Define fractions as parts of a whole shape or group',
          'Distinguish between proper, improper, and mixed fractions',
          'Add and subtract fractions with common denominators'
        ],
        keywords: ['fractions', 'numerator', 'denominator', 'sharing']
      },
      {
        topic: 'Decimals, Percentages, and Ratios: Conversions and Scales',
        objectives: [
          'Convert common fractions to decimals by long division',
          'Convert decimals to percentages by multiplying by 100',
          'Calculate simple ratios representing shared commodities'
        ],
        keywords: ['decimals', 'percentages', 'ratios', 'conversions']
      },
      {
        topic: 'Estimation and Approximation: Rounding Off to Positional Ranges',
        objectives: [
          'Explain the concept of approximation and rounding in calculations',
          'Round numbers to the nearest ten, hundred, and thousand',
          'Estimate totals before carrying out precise calculations'
        ],
        keywords: ['estimation', 'approximation', 'rounding', 'tens']
      },
      {
        topic: 'Algebraic Expressions: Simple Variables and Linear Operations',
        objectives: [
          'Explain variables as letters representing unknown quantities',
          'Combine like terms in algebraic additions and subtractions',
          'Solve simple linear equations with one variable'
        ],
        keywords: ['algebra', 'variables', 'equations', 'linear']
      },
      {
        topic: 'Geometry: Flat 2D Shapes and Core Spatial Properties',
        objectives: [
          'Identify common 2D shapes: squares, rectangles, circles, triangles',
          'List characteristics of regular polygons (vertices, sides, corners)',
          'Draw regular 2D shapes accurately using a wooden ruler'
        ],
        keywords: ['geometry', 'shapes', 'squares', 'circles']
      },
      {
        topic: 'Geometry: Solid 3D Shapes, Faces, Edges, and Vertices',
        objectives: [
          'Differentiate between flat 2D shapes and solid 3D structures',
          'Identify common 3D shapes: cubes, cuboids, cylinders, spheres',
          'Count the faces, edges, and vertices of cubes and cuboids'
        ],
        keywords: ['geometry', '3d shapes', 'cubes', 'faces']
      },
      {
        topic: 'Measurement of Perimeter: Calculating Outermost Boundaries',
        objectives: [
          'Define perimeter as the total distance around a shape border',
          'Calculate the perimeter of rectangles using P = 2(L + W)',
          'Measure the perimeter of classroom desks and physical boards'
        ],
        keywords: ['perimeter', 'measurement', 'rectangle', 'boundary']
      },
      {
        topic: 'Measurement of Area: Flat Surface Spaces and Formulas',
        objectives: [
          'Define area as flat spatial coverage measured in square units',
          'Apply the formula Area = Length * Width for squares and rectangles',
          'Calculate area coordinates of simple layout models'
        ],
        keywords: ['area', 'measurement', 'formula', 'square units']
      },
      {
        topic: 'Term Syllabus Review, Comprehensive Drills, and Examination',
        objectives: [
          'Review all mathematical concepts from week 1 to 11',
          'Solve comprehensive past examination papers in teams',
          'Evaluate term performance under exam-like guidelines'
        ],
        keywords: ['review', 'examination', 'drills', 'evaluation']
      }
    ];

    return mathTopics.map((item, idx) => ({
      weekNum: idx + 1,
      topic: item.topic,
      objectives: item.objectives,
      keywords: item.keywords
    }));
  }

  if (isEnglish) {
    const englishTopics = [
      {
        topic: 'Grammar: Nouns, Identification, and standard Categories',
        objectives: [
          'Define a noun as a naming word for persons, places, things',
          'Differentiate clearly between common nouns and proper nouns',
          'Apply correct capitalization to proper nouns in sentences'
        ],
        keywords: ['grammar', 'nouns', 'proper nouns', 'naming']
      },
      {
        topic: 'Grammar: Pronouns and Antecedent Gender/Number Concord',
        objectives: [
          'Define pronouns as words that replace nouns to prevent repetition',
          'Identify personal, possessive, and demonstrative pronouns',
          'Ensure gender and plural agreement between pronouns and antecedents'
        ],
        keywords: ['grammar', 'pronouns', 'concord', 'agreement']
      },
      {
        topic: 'Verbs and Tenses: Past, Present, and Future Conjugations',
        objectives: [
          'Define verbs as action or state of being words in sentences',
          'Conjugate regular and irregular verbs into past and present tenses',
          'Construct sentences representing ongoing and future intentions'
        ],
        keywords: ['verbs', 'tenses', 'conjugation', 'action']
      },
      {
        topic: 'Adjectives and Adverbs: Modifying and Describing Words',
        objectives: [
          'Define adjectives as describing words modifying nouns',
          'Define adverbs as words specifying how, when, or where actions occur',
          'Construct rich, descriptive paragraphs using adjectives and adverbs'
        ],
        keywords: ['grammar', 'adjectives', 'adverbs', 'modifiers']
      },
      {
        topic: 'Sentence Structure: Concord, Subject-Verb-Object Rules',
        objectives: [
          'Identify the Subject, Verb, and Object (SVO) in standard sentences',
          'Apply core grammatical concord rules (singular subject takes singular verb)',
          'Detect and correct common concord errors in oral and written work'
        ],
        keywords: ['sentence', 'concord', 'structure', 'grammar']
      },
      {
        topic: 'Prepositions and Conjunctions: Linking Ideas and Thoughts',
        objectives: [
          'Identify prepositions showing location, direction, or time indices',
          'Use conjunctions (and, but, or, because) to link clauses',
          'Combine simple sentences into structured compound sentences'
        ],
        keywords: ['prepositions', 'conjunctions', 'linking', 'clauses']
      },
      {
        topic: 'Vocabulary Development: Synonyms, Antonyms, and Homophones',
        objectives: [
          'Identify synonyms (words with similar meanings) in text passages',
          'Identify antonyms (words with opposite meanings) for given terms',
          'Use homophones correctly depending on contextual spelling rules'
        ],
        keywords: ['vocabulary', 'synonyms', 'antonyms', 'homophones']
      },
      {
        topic: 'Reading Comprehension: Active Skimming and Main Idea Scanning',
        objectives: [
          'Skim paragraphs to locate central themes and main ideas quickly',
          'Scan comprehension texts to extract specific facts and names',
          'Answer direct and inferential questions on read passages'
        ],
        keywords: ['reading', 'comprehension', 'skimming', 'scanning']
      },
      {
        topic: 'Composition Writing: Formal and Informal Letter Structures',
        objectives: [
          'Distinguish between formal letter and informal letter formats',
          'Structure letter addresses, greetings, body paragraphs, and sign-offs',
          'Draft a letter to a friend describing school activities'
        ],
        keywords: ['composition', 'writing', 'letters', 'addresses']
      },
      {
        topic: 'Narrative Essay Writing: Structuring Stories with Morals',
        objectives: [
          'Outline a story using introduction, climax, and resolution parts',
          'Write a narrative essay on "My Memorable Holiday Trip"',
          'Integrate a helpful civic or moral lesson into the conclusion'
        ],
        keywords: ['essay', 'narrative', 'writing', 'stories']
      },
      {
        topic: 'Spoken English: Syllables, Intonations, and Direct Speech',
        objectives: [
          'Divide words into syllables to aid proper phonetic pronunciation',
          'Identify rising and falling intonations in spoken statements',
          'Differentiate between direct speech and reported indirect speech'
        ],
        keywords: ['speech', 'pronunciation', 'syllables', 'intonation']
      },
      {
        topic: 'Term Syllabus Review, Essay Critiques, and Examination',
        objectives: [
          'Review all grammatical, reading, and writing concepts',
          'Participate in classroom peer reviews of letter assignments',
          'Evaluate English proficiency under formal exam guidelines'
        ],
        keywords: ['review', 'evaluation', 'examination', 'grammar']
      }
    ];

    return englishTopics.map((item, idx) => ({
      weekNum: idx + 1,
      topic: item.topic,
      objectives: item.objectives,
      keywords: item.keywords
    }));
  }

  if (isScience) {
    const scienceTopics = [
      {
        topic: 'Living Things: Characteristics of Life (MR NIGER D Mnemonic)',
        objectives: [
          'State all seven characteristics of living things using the mnemonic',
          'Define the processes of respiration, nutrition, and excretion',
          'Distinguish between living organisms and non-living objects'
        ],
        keywords: ['living things', 'mr niger d', 'characteristics', 'life']
      },
      {
        topic: 'Flowering Plants: Anatomy, Organs, and Photosynthesis',
        objectives: [
          'Label parts of a flowering plant: leaf, stem, root, flower',
          'Explain the absorption function of roots and support role of stems',
          'Outline photosynthesis as food preparation using solar energy'
        ],
        keywords: ['plants', 'anatomy', 'roots', 'photosynthesis']
      },
      {
        topic: 'Human Anatomy: Skeletal, Muscular, and Locomotion Systems',
        objectives: [
          'Identify major bones in the human body (skull, ribs, spine)',
          'Describe the functions of joints and skeletal muscles',
          'Explain how joints enable flexible, responsive human movement'
        ],
        keywords: ['human body', 'skeleton', 'bones', 'movement']
      },
      {
        topic: 'Nutrition and Health: Balanced Diet and Disease Protection',
        objectives: [
          'List the six classes of nutrients required for healthy growth',
          'Formulate a balanced meal plan using accessible local foods',
          'Link vitamin and protein deficiencies to specific illnesses'
        ],
        keywords: ['nutrition', 'balanced diet', 'vitamins', 'health']
      },
      {
        topic: 'Environmental Health: Hygiene, Refuse, and Clean Water Sources',
        objectives: [
          'Explain why maintaining clean school and home sanitation is vital',
          'List methods of safe refuse disposal and recycling practices',
          'Identify standard physical filtration methods to purify water'
        ],
        keywords: ['environment', 'hygiene', 'waste disposal', 'water']
      },
      {
        topic: 'Matter and Particle Configurations: Solid, Liquid, and Gas States',
        objectives: [
          'Differentiate between solids, liquids, and gases based on shape',
          'Describe particle densities and vibrations in each physical state',
          'Explain physical state transitions (melting, boiling, freezing)'
        ],
        keywords: ['matter', 'solids', 'liquids', 'gases']
      },
      {
        topic: 'Structure of the Atom: Subatomic Orbitals and Charges',
        objectives: [
          'Identify protons, neutrons, and electrons inside an atom',
          'Locate subatomic particles in the central nucleus or outer shells',
          'State the electrical charge associated with each subatomic unit'
        ],
        keywords: ['atom', 'protons', 'electrons', 'nucleus']
      },
      {
        topic: 'Forces and Motion: Pull, Push, Gravity, and Friction',
        objectives: [
          'Define force as a pull or push action measured in Newtons',
          'Demonstrate the effect of gravity on falling classroom weights',
          'Observe how surface friction slows moving toy vehicles'
        ],
        keywords: ['forces', 'motion', 'gravity', 'friction']
      },
      {
        topic: 'Energy Configurations: Types, Sources, and Transformations',
        objectives: [
          'Identify energy types: mechanical, chemical, electrical, solar',
          'State the Law of Conservation of Energy (energy cannot be destroyed)',
          'Analyze energy transformations in flashlights and radio systems'
        ],
        keywords: ['energy', 'transformation', 'solar', 'conservation']
      },
      {
        topic: 'Simple Machines: Levers, Pulleys, and Mechanical Advantage',
        objectives: [
          'Identify simple machines: levers, pulleys, inclined planes',
          'Locate the fulcrum, effort, and load positions in levers',
          'Explain how simple machines reduce human effort in daily tasks'
        ],
        keywords: ['machines', 'levers', 'pulleys', 'effort']
      },
      {
        topic: 'Scientific Method: Observation, Experiment, and Deductions',
        objectives: [
          'Outline standard steps: question, hypothesis, test, results',
          'Execute a basic observation experiment on seed germination',
          'Record observations clearly and write a logical, honest conclusion'
        ],
        keywords: ['scientific method', 'experiment', 'observation', 'conclusions']
      },
      {
        topic: 'Term Syllabus Review, Lab Demonstrations, and Examination',
        objectives: [
          'Review all scientific terms and diagrams from week 1 to 11',
          'Demonstrate simple science experiments in school teams',
          'Complete the end of term comprehensive science examination'
        ],
        keywords: ['review', 'examination', 'experiments', 'evaluation']
      }
    ];

    return scienceTopics.map((item, idx) => ({
      weekNum: idx + 1,
      topic: item.topic,
      objectives: item.objectives,
      keywords: item.keywords
    }));
  }

  if (isCivic) {
    const civicTopics = [
      {
        topic: 'National Values: Discipline, Honesty, and Community Integrity',
        objectives: [
          'Define discipline and honesty under civic education standards',
          'Identify characteristics of individuals with high personal integrity',
          'Discuss how honest habits reduce corruption and build society'
        ],
        keywords: ['values', 'discipline', 'honesty', 'integrity']
      },
      {
        topic: 'National Symbols: Patriotism, Coat of Arms, and Flag Rules',
        objectives: [
          'Identify national symbols: flag, anthem, coat of arms, currency',
          'Recite and explain the deeper meaning of the National Pledge',
          'Apply strict respect protocols to the Nigerian flag colors'
        ],
        keywords: ['symbols', 'patriotism', 'flag', 'pledge']
      },
      {
        topic: 'Citizenship and Rights: Civic Rights and Responsibilities',
        objectives: [
          'Define a citizen and list conditions for acquiring citizenship',
          'Outline human rights guaranteed under national constitutions',
          'Explain matched duties (paying taxes, protecting public property)'
        ],
        keywords: ['citizenship', 'rights', 'duties', 'constitution']
      },
      {
        topic: 'Democratic Values: Fair Representation and Electoral Choice',
        objectives: [
          'Explain democracy as selection of leaders by equal voting',
          'Identify steps involved in transparent, peaceful school elections',
          'Discuss why peaceful, fair choices prevent community disputes'
        ],
        keywords: ['democracy', 'elections', 'voting', 'leaders']
      },
      {
        topic: 'The Constitution: Core Legal Guidelines and Social Order',
        objectives: [
          'Define the constitution as the supreme legal handbook of a nation',
          'Explain why written laws are essential to prevent social chaos',
          'State consequences of law-breaking and criminal behaviors'
        ],
        keywords: ['constitution', 'laws', 'rules', 'order']
      },
      {
        topic: 'Human Rights: Child Protection Rights and Equal Treatment',
        objectives: [
          'State rights of a child: access to quality education, health, safety',
          'Identify agencies responsible for protecting child rights',
          'Discuss how equal opportunities protect weak citizens from abuse'
        ],
        keywords: ['child rights', 'protection', 'equality', 'justice']
      },
      {
        topic: 'National Identity: Cultural Heritage and Unity in Diversity',
        objectives: [
          'List major local ethnic groups and languages across Nigeria',
          'Identify rich aspects of traditional attire, food, and music',
          'Acknowledge that unity in differences makes our nation strong'
        ],
        keywords: ['culture', 'diversity', 'unity', 'heritage']
      },
      {
        topic: 'Arms of Government: Legislative, Executive, and Judicial Roles',
        objectives: [
          'Differentiate between the three main arms of government',
          'Explain the law-making function of legislative assemblies',
          'Outline the judicial arm role in interpreting laws in courts'
        ],
        keywords: ['government', 'legislature', 'executive', 'judiciary']
      },
      {
        topic: 'Community Leadership: Traditional Rulers and Counselors',
        objectives: [
          'Identify leadership structures in local villages and towns',
          'Describe the role of kings, chiefs, and traditional elders',
          'Explain how community heads resolve local family disputes'
        ],
        keywords: ['leadership', 'traditional rulers', 'community', 'elders']
      },
      {
        topic: 'Law Enforcement: National Public Safety Agencies',
        objectives: [
          'Identify law enforcement groups: Police, FRSC, NDLEA, civil defense',
          'Explain the responsibility of the Federal Road Safety Corps (FRSC)',
          'Demonstrate helper phone contacts and safety protocols'
        ],
        keywords: ['safety', 'agencies', 'police', 'frsc']
      },
      {
        topic: 'Civic Engagement: Community Service and Team Projects',
        objectives: [
          'Explain community service as volunteer help without pay',
          'Organize a small physical school classroom clean-up exercise',
          'Discuss how combined community actions improve environment'
        ],
        keywords: ['civic service', 'community help', 'volunteer', 'hygiene']
      },
      {
        topic: 'Term Syllabus Review, Civic Debates, and Examination',
        objectives: [
          'Review all national values, symbols, and legal concepts',
          'Participate in classroom debate on civic duties and leadership',
          'Evaluate civic education knowledge in the final term exam'
        ],
        keywords: ['review', 'examination', 'debate', 'evaluation']
      }
    ];

    return civicTopics.map((item, idx) => ({
      weekNum: idx + 1,
      topic: item.topic,
      objectives: item.objectives,
      keywords: item.keywords
    }));
  }

  // General Subject Catch-All Fallback
  const generalTopics = [
    {
      topic: `Introduction to ${subject}: Foundational definitions and terminology`,
      objectives: [
        `Define the core scope of ${subject} under standard educational models`,
        'Identify key terms and introductory structures',
        'Relate the topic to daily household observations'
      ],
      keywords: [subject.toLowerCase(), 'foundations', 'definitions']
    },
    {
      topic: `Essential Classifications and Core Component Structures`,
      objectives: [
        `Classify various categories of items within ${subject}`,
        'Analyze how components work together as a unified system',
        'State standard rules governing element organization'
      ],
      keywords: [subject.toLowerCase(), 'classification', 'components']
    },
    {
      topic: `Primary Analytical Methods and Core Calculations`,
      objectives: [
        'Apply basic formulas or analysis steps to solve simple problems',
        'Recognize standard variables and common mathematical or structural relationships',
        'Verify answer accuracy using logical proof tables'
      ],
      keywords: [subject.toLowerCase(), 'analysis', 'formulas']
    },
    {
      topic: `Practical Applications in the West African Sub-Region`,
      objectives: [
        `Trace how the concepts of ${subject} are applied across West Africa`,
        'Understand historical and contemporary industrial patterns',
        'Identify domestic tools or programs implementing these concepts'
      ],
      keywords: [subject.toLowerCase(), 'west africa', 'applications']
    },
    {
      topic: `Local Environmental Context and Nigerian Case Studies`,
      objectives: [
        `Connect theoretical ${subject} with community situations inside Nigeria`,
        'Analyze successful domestic business or administrative case studies',
        'Identify local natural resources and regional factors'
      ],
      keywords: [subject.toLowerCase(), 'nigeria', 'context']
    },
    {
      topic: `Medium-Term Progress Review and Collaborative Group Work`,
      objectives: [
        'Re-evaluate learning milestones from weeks 1 to 5',
        'Solve group problems and present collective findings in class',
        'Formulate constructive critiques of individual project drafts'
      ],
      keywords: [subject.toLowerCase(), 'review', 'collaboration']
    },
    {
      topic: `Advanced Conceptual Investigations and Analytical Reasoning`,
      objectives: [
        `Analyze complex scenarios and theoretical configurations inside ${subject}`,
        'Determine underlying causes and patterns using critical thinking',
        'Draft structured summaries of advanced research findings'
      ],
      keywords: [subject.toLowerCase(), 'advanced', 'reasoning']
    },
    {
      topic: `Primary Tools, Apparatus, and Workplace Safety Standards`,
      objectives: [
        'Identify key instruments and professional equipment in the field',
        'Demonstrate proper, safe care, handling, and cleanup protocols',
        'Formulate quick response drills in case of workshop accidents'
      ],
      keywords: [subject.toLowerCase(), 'tools', 'apparatus', 'safety']
    },
    {
      topic: `Interactive Worksheets, Quantitative Studies, and Exercises`,
      objectives: [
        'Solve multi-step study questions and quantitative problems',
        'Translate written descriptions into logical diagram layouts',
        'Compare results with established guidelines and tables'
      ],
      keywords: [subject.toLowerCase(), 'worksheets', 'quantitative']
    },
    {
      topic: `Case Study Reports, Professional Writing, and Presentations`,
      objectives: [
        'Compile research findings into a formatted case study document',
        'Present reports verbally to classmates using visual aid cards',
        'Formulate helpful answers to audience feedback questions'
      ],
      keywords: [subject.toLowerCase(), 'reports', 'presentation']
    },
    {
      topic: `Modern Innovations, Digital Integration, and Future Careers`,
      objectives: [
        'Explore how computers and digital tools optimize current operations',
        'Identify career opportunities related to this academic domain',
        'Discuss ethical concerns and professional responsibility rules'
      ],
      keywords: [subject.toLowerCase(), 'innovations', 'careers']
    },
    {
      topic: `Syllabus Synthesis, Practical Problem Drills, and Examination`,
      objectives: [
        'Review all curriculum modules covered throughout the 12 weeks',
        'Attempt practice past examination questions in exam-like conditions',
        'Complete the end of term evaluation with confidence'
      ],
      keywords: [subject.toLowerCase(), 'evaluation', 'examination']
    }
  ];

  return generalTopics.map((item, idx) => ({
    weekNum: idx + 1,
    topic: item.topic,
    objectives: item.objectives,
    keywords: item.keywords
  }));
}
