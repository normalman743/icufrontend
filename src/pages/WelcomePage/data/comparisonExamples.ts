/**
 * Comparison Examples Data
 * 对比问答示例数据 - 基于 aiAnswers 数据转换而来
 */

import { ICU_STAR_ANSWERS, GPT_ANSWERS, GEMINI_ANSWERS, DEEPSEEK_ANSWERS } from './aiAnswers';

export type QuestionCategory = 'Academic' | 'Life';
export type QuestionSubCategory = 
  | 'course-difficulty'    // 课程难度
  | 'professor-review'     // 教授测评  
  | 'campus-facility'      // 校园设施
  | 'study-struggle';      // 学习困惑

export interface ComparisonExample {
  id: string;
  category: QuestionCategory;
  subCategory: QuestionSubCategory;
  question: {
    zh_CN: string;
    en: string;
  };
  icuAnswer: {
    zh_CN: string;
    en: string;
  };
  otherAIAnswers: {
    [aiId: string]: {
      zh_CN: string;
      en: string;
    };
  };
}

/**
 * 子分类显示名称
 */
export const SUB_CATEGORY_LABELS: Record<QuestionSubCategory, { zh_CN: string; en: string; icon: string }> = {
  'course-difficulty': { 
    zh_CN: '课程难度', 
    en: 'Course Difficulty',
    icon: '📊'
  },
  'professor-review': { 
    zh_CN: '教授测评', 
    en: 'Professor Review',
    icon: '⭐'
  },
  'campus-facility': { 
    zh_CN: '校园设施', 
    en: 'Campus Facilities',
    icon: '🏛️'
  },
  'study-struggle': { 
    zh_CN: '学习困惑', 
    en: 'Study Struggles',
    icon: '💭'
  }
};

/**
 * 主分类显示名称
 */
export const CATEGORY_LABELS: Record<QuestionCategory, { zh_CN: string; en: string; icon: string }> = {
  Academic: { 
    zh_CN: '学术问题', 
    en: 'Academic',
    icon: '📚'
  },
  Life: { 
    zh_CN: '生活求助', 
    en: 'Life',
    icon: '🍜'
  }
};

/**
 * 问题的英文翻译
 */
const questionTranslations: { [key: string]: string } = {
  "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": 
    "Will Sunny HA's midterm multiple-choice questions be difficult? Will they be tricky?",
  "FINA2320的学习群在哪里？想加入一起讨论作业": 
    "Where can I find the FINA2320 study group? I want to join to discuss assignments.",
  "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": 
    "Can anyone review Dr. CHAN Man Long's ELTU2012? How's the grading? I heard he's strict?",
  "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": 
    "How difficult is Prof. YUNG Hei Ming's FINA2010?",
  "想问直博 HKPFS 需要什么背景？GPA 要多高？": 
    "What background is needed for direct PhD admission with HKPFS? How high should the GPA be?",
  "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": 
    "I want to take ECON1111/3021/2901/3320 plus a GE course. Will the workload be too heavy for one semester?",
  "想用学校打印机，流程具体怎样？": 
    "How do I use the school printers? What's the specific process?",
  "MATH1013 完全跟不上进度，大家怎么学的？": 
    "I'm completely falling behind in MATH1013. How does everyone study for this course?"
};

/**
 * ICU 回答的英文翻译（简化版）
 */
const icuAnswerTranslations: { [key: string]: string } = {
  "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": 
    `Based on feedback from CUHK TreeHole discussions, Sunny HA's multiple-choice questions are moderate to slightly challenging. While some questions may be tricky with unclear information, they're generally within normal difficulty range.\n\nKey points:\n• **Time management is crucial** - Pay attention to calculator speed\n• **Review focus** - Emphasize core concepts from lecture notes, not just practice problems\n• **Question types** - Exercise samples are simpler, but homework difficulty is closer to midterm level\n\nRecommend practicing past papers and reviewing based on homework difficulty.`,
  
  "FINA2320的学习群在哪里？想加入一起讨论作业": 
    `ICU TreeHole already has discussion boards for FINA2320! You can:\n\n• Search "FINA2320" directly in ICU to find discussions from senior students\n• Post questions, and students who've taken the course usually respond\n• If there's no active discussion, create a new post to gather classmates for a study group\n\nMany students find coursemates through TreeHole!`,
  
  "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": 
    `Based on ICU TreeHole data and senior student feedback, Dr. CHAN Man Long's ELTU2012:\n\n**Course Requirements**: High expectations for class participation and assignment quality\n\n**Grading Standards**: Strict but fair in marking. If you complete assignments seriously and actively participate in class discussions, grades won't be bad\n\n**Study Suggestions**:\n• Actively speak up and participate in discussions\n• Don't procrastinate on assignments, maintain quality\n• Proactively communicate with professor, show learning attitude\n\n**Note**: Strict ≠ unfair. Many students ultimately achieve satisfactory grades.`,
  
  "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": 
    `Regarding Prof. YUNG Hei Ming's FINA2010, ICU senior students generally feedback:\n\n**Difficulty Level**: Moderate difficulty, not the easiest finance course\n\n**Teaching Style**: Clear explanations, thorough coverage of finance concepts\n\n**Content Scope**: Covers financial market fundamentals and common tools with theoretical depth\n\n**Time Investment**: Requires considerable time for review and practice problems\n\n**Exam Format**: Tests conceptual understanding, not purely calculation-based\n\n**Study Advice**: Keep up with class progress, review regularly, practice more problems.`,
  
  "想问直博 HKPFS 需要什么背景？GPA 要多高？": 
    `Based on ICU TreeHole senior students' experience, requirements for direct PhD admission and HKPFS:\n\n**Direct PhD (RPG) Requirements**:\n• **Core conditions**: Find a willing supervisor + have funding\n• **Competition**: Intense in recent years, need to **contact professors early (start in Year 3)**\n• **Local advantage**: If you're a Hong Kong local, government has special funding to encourage local RPG students\n• **GPA reference**: CS department admits typically have CGPA around 3.85-3.9, MGPA around 3.95\n\n**HKPFS**:\n• **Very competitive**, GPA requirements higher (3.95+)\n• If not exceptionally outstanding, consider direct PhD route first\n\n**Action suggestions**:\n• Contact your Academic Advisor for specific procedures\n• Proactively discuss research interests with professors\n• Try to participate in professors' research projects`,
  
  "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": 
    `This is an important course planning question! Based on ICU senior students' course selection experience:\n\n**Risks of this combination**:\n• **Course load**: 5-6 courses is quite heavy\n• **Course difficulty**: Some of these economics courses are rated as "intense," taking them together creates pressure\n• **Time conflicts**: Need to check for course time conflicts or exam periods being too dense\n\n**Senior students' suggestions**:\n• If you have **strong math foundation** and **high study efficiency**, you can try\n• If it's your **first semester or average foundation**, suggest **spreading across two semesters**\n• Confirm professor and exam times first, avoid consecutive high-intensity exam weeks\n\n**Planning advice**:\n• Don't be greedy in Year 1; better to graduate a semester later than fail due to too many courses\n• Start with 3-4 courses, add more after adapting to university pace\n• Consult academic advisors in TreeHole to plan your 4-year course schedule`,
  
  "想用学校打印机，流程具体怎样？": 
    `Based on ICU TreeHole senior students' printing experience, the complete process:\n\n**Operating on school computers**:\n1. Open file, select print\n2. **Important**: Choose printer carefully\n   - For color printing, select "color" printer\n   - For black & white, select "blackwhite" printer\n3. Create username and password (remember this!)\n4. Confirm print\n\n**At the printer**:\n1. Insert Octopus card (tap card)\n2. Find your username on screen\n3. Enter password\n4. Click "Print"\n\n**Common issues**:\n• **Why is my color print coming out black & white?** → Don't select color in "color options," you need to select a printer with "color" in its name when choosing the printer!\n• **Printing from personal computer** → Need to download drivers first (check school website), then transfer to school computer via USB or network\n• **Detailed steps** → Check official guide on university library website`,
  
  "MATH1013 完全跟不上进度，大家怎么学的？": 
    `Many students have faced this dilemma. ICU senior students' experience:\n\n**First, don't panic**:\n• MATH1013 is indeed challenging, but many students gradually adapt by mid-term\n• Falling behind now doesn't mean you can't master it\n\n**Study strategies**:\n• **Lectures + notes**: Listen carefully in class, note key concepts and examples\n• **Practice problems**: Start with simple problems, gradually increase difficulty. Don't just read solutions\n• **Review frequency**: Review after each class on the same day, don't accumulate until weekend\n• **Seek help**:\n  - Attend professor/TA office hours\n  - Form study groups with senior students\n  - Post in ICU TreeHole, people will help explain\n\n**Mindset adjustment**:\n• Year 1 math courses are generally difficult, this is normal\n• Don't give up due to one or two poor exam results\n• Many people suddenly "get it" in Year 2`
};

/**
 * 其他 AI 回答的英文翻译
 */
const otherAIAnswerTranslations: { [aiId: string]: { [question: string]: string } } = {
  chatgpt: {
    "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": 
      `I'm sorry, I couldn't find reliable information about whether Sunny HA's midterm multiple-choice questions are difficult or tricky. I recommend:\n– Check past exam papers or practice sets from this teacher\n– Ask seniors who've taken the course or study groups\n– Pay close attention in class to what the teacher emphasizes and what types of questions are covered.\nThis will help you better judge the difficulty.`,
    
    "FINA2320的学习群在哪里？想加入一起讨论作业": 
      `About FINA2320 (Investments and Portfolio Analysis):\n– I found that HKU's course resources include past mid-term and tutorial exercises for reference.\n– However, I couldn't find any publicly recognized or official "study group" links or entry points.\nI recommend:\n  * Ask TAs, classmates in your department/faculty if they have WhatsApp, Telegram, or Discord groups;\n  * Check the course Moodle/Canvas or discussion boards for "study group" invitations;\n  * Ask upper-year students how they joined their groups.\nIf you want, I can also help you search for spontaneously organized groups by students (but I can't guarantee they're legitimate/official).`,
    
    "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": 
      `I'm sorry, I couldn't find reliable, public evaluation data to confirm Dr. CHAN Man Long's grading standards or strictness in ELTU2012 (assuming it's an English language/communication course at HKU).\nI recommend contacting the following sources for information:\n– Classmates currently taking or who've taken the course, ask about their views on teaching style, workload, assessment methods, and grading leniency;\n– Check the course evaluation system (SETL) or similar platforms for ratings and teaching comments;\n– Attend the course introduction session, observe the professor's teaching style, assignment requirements, and grading criteria.\nIf you want, I can try to help you find anonymous reviews of this professor on student forums/evaluation websites, but I can't guarantee I'll find any.`,
    
    "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": 
      `About Prof. YUNG Hei Ming and FINA2010, I couldn't find systematic public data. However, I can provide some judgment suggestions based on general situations:\n– FINA2010 is typically an undergraduate finance course that may cover financial principles, tools, and case analysis, with difficulty depending on your existing math/statistics/economics background;\n– If you've performed well in finance, investment, or economics courses before, it may be moderately difficult; if your foundation is weak, it might feel quite challenging;\n– I suggest checking past course syllabi, Tutorial exercises, and the first few assignments to assess workload and difficulty.\nIf you want, I can help you look up this course's recent syllabus, assignment formats, and exam types to help you judge more intuitively.`,
    
    "想问直博 HKPFS 需要什么背景？GPA 要多高？": 
      `About HKPFS (Hong Kong PhD Fellowship Scheme) application background and requirements:\n– Applicants must be new full-time PhD candidates at UGC/RGC-funded Hong Kong universities.\n– Selection criteria emphasize: outstanding academic performance, strong research ability or potential, good communication/interpersonal skills and leadership qualities.\n– For academic qualifications: generally requires a research master's or taught master's; or first-class honors bachelor's (or equivalent) is sufficient.\n– Regarding GPA: although there's no unified public "minimum GPA number," it's extremely competitive, and scores should be among the top in your school/department. Some pages mention "undergraduate grades at least second-class upper honors (or equivalent)" is more appropriate.\n\n**Summary recommendations**: If you want to apply for HKPFS, your undergraduate GPA should be in the top 10-20% of your department, preferably first-class honors if possible, along with strong research experience, recommendation letters, and research proposal. Many factors are important besides GPA.\nIf you want, I can help you look up GPA backgrounds of recent HKU awardees for a more specific reference.`,
    
    "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": 
      `About your proposed course combination (assuming at a certain university or similar):\n– ECON1111, 3021, 2901, 3320 seem to be economics courses at different levels (1000 entry, 2000 intermediate, 3000 advanced). If you're taking four economics courses plus a general education course simultaneously, the workload may be quite high, especially if the content requires math, statistics, or extensive writing/assignments.\n– If your general education course is light and you've had good economics/math background before, this combination might be feasible. But consider:\n   * Class time + post-class reading/assignments/review time for each course;\n   * If there are large projects, papers, presentations/discussions, it adds extra time;\n   * If you also need to participate in clubs/part-time work/rest time, the workload needs to be managed appropriately.\n– I suggest:\n   * Look at each course's syllabus to estimate weekly expected post-class time;\n   * If two or more are 3000-level, consider reducing to three economics courses plus general education to leave a time buffer;\n   * Talk to seniors who've taken these courses about their workload.\nOverall, if you have solid foundations and good time management, this is feasible, but it's not a light load. You need to assess your own situation first.`,
    
    "想用学校打印机，流程具体怎样？": 
      `Here are the steps for using HKU's campus printing/reproduction service (uPrint):\n1. Ensure you're connected to the campus network or on-campus environment. The service notes that "HKU" WiFi network ("Wi-Fi.HK via HKU" or "eduroam" is not supported).\n2. Log in to the printing system: Open browser and visit https://uprintpro.hku.hk/user and log in with your UID + PIN.\n3. Submit printing job: Select "Web Print" → "Submit a Job" → choose printer, upload file, set number of copies. Supported formats: PDF, DOCX, XLSX, PNG, etc.\n4. Payment/Quota: The service is quota-based, with different costs for black & white/color. You can add value to your printing account through campus cards, Add Value Machines (AVM).\n5. Pick up: Go to the printer, use your student card to tap or log in to your account, select your printing job in the "Print Release" menu, and click print.\n6. Notes: Web Print has a single job file size limit of about 10 MB. If files are large or have many pages, suggest splitting uploads.\nIf your school is not HKU but similar, also check your school's information service/IT support center to confirm the printing system, network, and payment methods.\nHope this helps you use the school printer smoothly!`,
    
    "MATH1013 完全跟不上进度，大家怎么学的？": 
      `About MATH1013 (assuming it's a basic mathematics course at a certain university), if you're completely falling behind, here are some common strategies:\n– **Strengthen basics**: Review prerequisite courses (calculus, linear algebra, mathematical analysis basics) where you're weak. If the teacher/TA provides pre-class review materials or recordings, use them.\n– **Practice is key**: After understanding basic concepts, consolidate through exercises. Find textbook exercises, past exam questions, Tutorial exercises.\n– **Utilize TA/office hours**: Join discussion classes, ask TAs, and study with classmates who are stronger in certain areas.\n– **Talk to teacher/TA**: If the pace is too fast or you're having difficulty understanding, suggest finding the teacher or TA to discuss, see if they can provide catch-up help, etc.\n– **Arrange reasonable time schedule**: Since math courses require a lot of post-class time if your foundation is weak, set aside more time, e.g., 1-2 hours daily for this course's review and practice.\n– **Use resources**: Online teaching videos (Khan Academy, MIT OCW), past notes from your department, question banks.\nIf you want, I can help you collect study experiences, reference materials, or question banks from past students in this course to help you catch up more targetedly.`
  },
  gemini: {
    "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": 
      `Based on some general information about "Health Assessment (HA)" midterm exams from search results:\n\n**Question types**: Exams typically cover core concepts of health assessment, steps, purposes of different types of assessments, interview techniques (open/closed questions, non-verbal communication), documentation guidelines, and pain assessment, etc.\n\n**Question types**: In addition to multiple-choice questions (Multiple Choice Questions), there may be matching questions, such as matching interview stages with their characteristics.\n\n**Assessment goals**: Mainly to assess students' understanding and mastery of key concepts.\n\n**Speculation on "difficult" or "tricky"**: Generally speaking, multiple-choice questions will be rigorous in design. If the options are similar, you need precise understanding of concepts to choose the best answer (this might feel "tricky" to you).\n\n**Preparation methods**: Focus on reviewing core concepts emphasized in class, differences in purposes of different assessment types, details of interview techniques, and documentation principles. Do more practice questions, familiarize yourself with possible question angles, especially those requiring situational judgment.\n\nThe best approach is to refer to the course syllabus (Syllabus), review materials provided by the teacher, and past practice questions/exams to understand the specific difficulty and question style of this course.`,
    
    "FINA2320的学习群在哪里？想加入一起讨论作业": 
      `FINA2320 study groups (such as WeChat groups, QQ groups, Telegram groups, or WhatsApp groups, etc.) are usually organized spontaneously by students, so as an AI, I cannot directly provide an accurate joining link or QR code.\n\nHowever, you can try the following channels to find study groups:\n\n**Course forum or learning management system (LMS)**: Check the discussion boards in FINA2320's online platform at school (such as Canvas, Blackboard, or Moodle, etc.). Students may share group information there. Some university course platforms have "People" or "Roster" features, you can try contacting other students in the class.\n\n**Classroom/Lecture**: Ask the students sitting around you directly in class or after lectures, they are likely to have joined the group, or know to join.\n\n**Social media and school anonymous forums**: Search for "FINA2320" on the school's forum, post bar, Reddit community, or Facebook groups, or post to ask if there are study groups. If it's Hong Kong or overseas universities, you can try searching for "[your university name] FINA2320" keywords.\n\n**TA (Teaching Assistant) or instructor**: Some course TAs may organize or know about unofficial study groups, but they may not advertise publicly. You can politely ask them if they know of any assignment discussion groups.\n\nWish you success in finding study partners and efficiently completing assignments!`,
    
    "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": 
      `Hello! Regarding Dr. CHAN Man Long (Chen Wenlong) professor's ELTU2012 course evaluation and grading situation, since I cannot access the latest student evaluation system or internal grading data, I cannot give a definitive conclusion.\n\nHowever, I can provide some general information and search directions for this type of course:\n\n**1. Grading and strictness (general experience)**\nELTU courses (university English general education courses): These courses usually focus on improving academic English writing and speaking skills, and grading standards often pay great attention to details, grammar accuracy, logical organization, and expression depth. Therefore, many students find ELTU course grading to be quite strict.\n\nAbout "strict": Strict usually means high requirements for assignments and projects, such as precision in format, citations, and argumentation. For improving language skills, a strict teacher can actually provide more detailed feedback.\n\n**2. Specific evaluation of Dr. CHAN Man Long (search suggestions)**\nTo find specific evaluations of Dr. CHAN Man Long himself, I suggest you:\n\n• Search for relevant evaluations on the school's local forums\n• Find course evaluation websites\n• Ask seniors who have taken the course directly\n\n**Summary**: When preparing for ELTU2012, regardless of whether the professor is strict, focus on improving your writing and speaking logic and accuracy. If Dr. Chan is indeed strict, that means you need to pay more attention to details and teacher feedback in every assignment and every speaking exercise, which will help you get good grades.`,
    
    "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": 
      `Regarding Prof. YUNG Hei Ming's FINA2010 course difficulty and grading situation, since I cannot access the latest student evaluation system or internal grading data, I cannot give a specific difficulty rating or grading guarantee.\n\nHowever, I can provide some reference information based on the course itself and general situations:\n\n**1. General difficulty of FINA2010 (Financial Management)**\nFINA2010 is usually an introductory course in financial management, covering the following core content:\n\n**Course content**: Time value of money (TVM), capital budgeting, risk and return, security valuation (stocks and bonds), and capital structure, etc.\n\n**Difficulty characteristics**: The difficulty here usually lies in strong calculation ability (especially TVM and valuation parts) and clear understanding of financial concepts. You need to be proficient in using calculators or Excel to solve problems.\n\n**Learning focus**: Understanding concepts and proficient application of formulas are equally important.\n\n**2. Speculation about Prof. YUNG Hei Ming (experience)**\nTo understand the professor's specific teaching style and grading standards, the best method is:\n• Ask seniors\n• Check course evaluation websites\n\n**Summary suggestions**: If the course difficulty mainly focuses on calculations and concept understanding, then regardless of the professor's style, as long as you practice diligently, master calculation tools, and clearly understand the logic behind each financial decision, you can pass smoothly.`,
    
    "想问直博 HKPFS 需要什么背景？GPA 要多高？": 
      `"Direct PhD HKPFS" (Hong Kong PhD Fellowship Scheme) is one of Hong Kong's most competitive scholarships, aiming to attract the world's best PhD students to Hong Kong. It not only requires applicants to meet the university's basic admission requirements, but also emphasizes the applicant's comprehensive excellence.\n\n**Core background requirements**\nThe selection committee considers the following four main criteria when reviewing applications:\n\n**1. Outstanding academic ability**\nThis is the primary consideration. Need top grades, strong recommendation letters, and the reputation of the institution attended.\n\n**2. Research ability and potential**\nThis is the soul of PhD applications. Need:\n• High-quality research experience (such as participating in national/provincial/school-level research projects)\n• Outstanding research achievements (such as papers published in core journals or top conferences)\n• Clear and promising research plans (Research Proposal)\n\n**3. Communication and interpersonal skills**\nAssess whether you can express your research interests and ideas clearly and logically in interviews, and whether you have good teamwork and communication abilities.\n\n**4. Leadership ability**\nAssess your comprehensive qualities, such as leadership experience in academic organizations, student societies, social services, etc.\n\n**GPA requirements**\nHKPFS does not have an official "minimum GPA" score line, because it is a competitive scholarship, and every year the best are selected. However, based on past successful cases and its "academic excellence" primary standard, GPA must be at the top level. Usually, First Class Honours bachelor's degree is very common background. If using a 4.0 GPA system, usually need 3.7+ or higher.`,
    
    "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": 
      `Hello, based on the course list you listed, I can clearly tell you: the workload for this semester will be very large, and may exceed the endurance of general students.\n\nThis combination's challenge is not the number of courses (5 courses), but **taking four professional economics courses simultaneously**, including multiple high-level or technically strong courses.\n\n**Detailed workload analysis of your course schedule**:\n\n• **ECON1111**: Economics foundation/introduction course (entry level) - moderate difficulty, but need time to establish economic thinking\n• **ECON2901**: Intermediate course or econometrics foundation - medium to high difficulty. Intermediate courses begin to introduce mathematical models and rigorous proofs, requiring a lot of time to do problem sets\n• **ECON3021**: Advanced professional course - high difficulty, theoretical complexity, usually has extremely difficult problem sets (P-Sets)\n• **ECON3320**: Advanced course - high difficulty, if it's econometrics, need to invest a lot of time in learning statistical software and data processing\n• **General education course**: Relatively light (usually)\n\n**Reasons why workload is too large in summary**:\n1. **High-intensity problem sets (P-Sets)**: Economics professional courses have the largest workload from weekly or bi-weekly problem sets that need to be completed with mathematical rigor and logical rigor\n2. **Concept overlap and confusion**: Simultaneously learning four different theoretical frameworks can easily cause concept confusion\n3. **Calculation and software requirements**: 3xxx level courses may involve complex mathematical derivations and statistical software operations\n\n**Suggestions**:\nStrongly suggest you reassess this semester's course combination and consider reducing the number of professional courses. At least consider postponing one 3xxx course to next semester.`,
    
    "想用学校打印机，流程具体怎样？": 
      `Different universities' printing systems may vary slightly, but the core process is mostly similar. Here are the general steps and key points for using campus printers at universities:\n\n**Core process (4 steps)**\n\n**Step 1: Prepare/Submit files**\n• **Method A: Wireless/Cloud printing (mainstream)**: Install the printing driver provided by the university on your computer (or phone). When printing, select the virtual printer. The file will be sent to the cloud printing server and wait for your authentication and release.\n• **Method B: USB direct insertion**: Few all-in-one machines support this, you need to save the file (usually PDF format) to a USB drive.\n\n**Step 2: Go to the printing location**\nMainly in libraries (most common), learning centers, computer rooms, or some teaching buildings' public areas.\n\n**Step 3: Authenticate and release files**\n• At the self-service printing/reproduction all-in-one machine, select "Print" or "Self-service Print" option\n• Use campus card (or "Octopus Card"), student ID/work ID and unified authentication password to log in to the system\n• Find your previously submitted printing job list on the screen\n• Confirm printing settings (black & white/color, single-sided/double-sided, number of pages)\n\n**Step 4: Payment and pickup**\n• Swipe card again to deduct fees: After confirming printing, the system will prompt you to place your campus card on the sensor area for deduction\n• Complete printing: Wait for the machine to output paper\n• **Important**: Take your printout, retrieve your campus card, and click "Exit" or "Logout" on the screen\n\n**Key details and precautions**:\n• Most universities charge for printing services\n• Some universities may provide free printing quotas`,
    
    "MATH1013 完全跟不上进度，大家怎么学的？": 
      `I fully understand the anxiety of feeling completely behind in MATH1013 (Calculus). As an important foundational course in university, its difficulty and abstraction indeed make many beginners feel overwhelmed.\n\nHere are the learning methods and suggestions that senior students usually adopt:\n\n**1. Change learning mentality and methods**\n• **Don't just memorize conclusions, understand the "why" of definitions and theorems**: Calculus is a course based on rigorous logic. If you only remember formulas and problem-solving steps, you'll get stuck when encountering slightly changed questions.\n• **Insist on "daily clearing"**: Once you fall behind, calculus knowledge points are interconnected, it's hard to catch up. Ensure that the content of each class must be reviewed on the same day.\n\n**2. Optimize your learning resources**\n• **Make good use of textbooks and reference books**: Carefully read the conceptual explanations in the book, especially those explained in words about mathematical meanings\n• **Utilize online resources**: Search for MIT OpenCourseWare (OCW) Calculus series or Khan Academy\n\n**3. Most importantly: Master through practice**\n• **Calculate personally, don't copy**: Only by writing step by step yourself can you discover where you're really stuck in concepts or calculation steps\n• **Repeat typical questions**: For basic and typical example questions, you should be able to write the solution steps with your eyes closed\n\n**4. Seek help and group learning**\n• **Office Hour / TA (Teaching Assistant)**: You must go! This is the best place to solve your specific problems\n• **Form study groups**: Study together with classmates at similar progress levels, explain to each other\n\n**Summary**: MATH1013 requires a lot of time investment for practice and understanding. Start now, spend fixed time every day (such as 2-3 hours) focusing on "understanding concepts + doing problems", and actively seek help, you will definitely catch up.`
  },
  Deepseek: {
    "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": 
      `Based on feedback from past students, Sunny HA's midterm multiple-choice questions are generally moderate in difficulty but require careful preparation. It's unlikely to have particularly tricky questions.`,
    
    "FINA2320的学习群在哪里？想加入一起讨论作业": 
      `FINA2320 study groups can usually be found through:\n1) Course Canvas system discussion boards\n2) Student self-organized WhatsApp/Telegram groups (join via classmate invitations)\n3) Various university academic societies\n\nSuggest directly asking classmates or TAs for the latest group information.`,
    
    "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": 
      `Dr. CHAN Man Long teaches responsibly and seriously, with clear grading standards. For grading: Students who complete assignments on time and actively participate in class discussions usually get good grades. He is indeed quite demanding, but it effectively improves English expression skills.`,
    
    "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": 
      `FINA2010 as a finance foundation course, Prof. YUNG's teaching is systematic and strong, difficulty is moderate. Need to master basic mathematical calculations and financial concepts, regular review and practice problems are key.`,
    
    "想问直博 HKPFS 需要什么背景？GPA 要多高？": 
      `HKPFS (Hong Kong PhD Fellowship Scheme) is highly competitive, usually requires:\n\n1) Undergraduate/master's GPA 3.5/4.0 or above\n2) Strong research background (paper publications, research experience)\n3) Outstanding performance in relevant fields\n4) Strong recommendation letters and research plans\n\nSpecific standards vary by major.`,
    
    "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": 
      `This combination has heavy workload: ECON3021 and ECON3320 involve more mathematical derivations, ECON2901 requires programming practice. Suggest replacing one economics course with a lighter load course, or depending on your mathematical foundation and time management skills.`,
    
    "想用学校打印机，流程具体怎样？": 
      `School printer usage process:\n\n1) Log in to campus account in computer room\n2) Upload files to Print@CUHK system or send print command directly\n3) Tap card (student ID) at printer or enter account password\n4) Select print job and confirm\n\nPrinting quota can be checked on ITSC website.`,
    
    "MATH1013 完全跟不上进度，大家怎么学的？": 
      `MATH1013 learning suggestions:\n\n1) Regularly attend professor and TA consultation times\n2) Form study groups for problem solving together\n3) Utilize free tutoring services from math tutoring centers\n4) Do more Past Papers and textbook exercises\n5) Build knowledge system step by step from basic concepts`
  }
};

/**
 * 将问题映射到类别和子类别
 */
const questionCategoryMap: { [key: string]: { category: QuestionCategory; subCategory: QuestionSubCategory } } = {
  "Sunny HA的midterm选择题会不会很难？会出很刁钻的吗？": { category: 'Academic', subCategory: 'course-difficulty' },
  "Prof. YUNG Hei Ming 的 FINA2010 难度怎么样？": { category: 'Academic', subCategory: 'course-difficulty' },
  "求测评 Dr. CHAN Man Long 的 ELTU2012，给分怎么样？听说他很严格？": { category: 'Academic', subCategory: 'professor-review' },
  "我想选 ECON1111/3021/2901/3320，加上通识课，一学期 workload 会不会太大？": { category: 'Academic', subCategory: 'professor-review' },
  "想用学校打印机，流程具体怎样？": { category: 'Life', subCategory: 'campus-facility' },
  "FINA2320的学习群在哪里？想加入一起讨论作业": { category: 'Life', subCategory: 'campus-facility' },
  "MATH1013 完全跟不上进度，大家怎么学的？": { category: 'Life', subCategory: 'study-struggle' },
  "想问直博 HKPFS 需要什么背景？GPA 要多高？": { category: 'Life', subCategory: 'study-struggle' }
};

/**
 * 生成对比示例数据
 * 从 aiAnswers 数据自动生成，并添加英文翻译
 */
export const COMPARISON_EXAMPLES: ComparisonExample[] = ICU_STAR_ANSWERS.map((icuAnswer, index) => {
  const gptAnswer = GPT_ANSWERS[index];
  const geminiAnswer = GEMINI_ANSWERS[index];
  const deepseekAnswer = DEEPSEEK_ANSWERS[index];
  
  const categoryInfo = questionCategoryMap[icuAnswer.question] || { category: 'Academic', subCategory: 'course-difficulty' };
  
  return {
    id: `example-${index + 1}`,
    category: categoryInfo.category,
    subCategory: categoryInfo.subCategory,
    question: {
      zh_CN: icuAnswer.question,
      en: questionTranslations[icuAnswer.question] || icuAnswer.question
    },
    icuAnswer: {
      zh_CN: icuAnswer.answer,
      en: icuAnswerTranslations[icuAnswer.question] || icuAnswer.answer
    },
    otherAIAnswers: {
      chatgpt: {
        zh_CN: gptAnswer.answer,
        en: otherAIAnswerTranslations.chatgpt[icuAnswer.question] || gptAnswer.answer
      },
      gemini: {
        zh_CN: geminiAnswer.answer,
        en: otherAIAnswerTranslations.gemini[icuAnswer.question] || geminiAnswer.answer
      },
      Deepseek: {
        zh_CN: deepseekAnswer.answer,
        en: otherAIAnswerTranslations.Deepseek[icuAnswer.question] || deepseekAnswer.answer
      }
    }
  };
});

/**
 * 推荐的前 3 个示例（用于首屏展示）
 * 选择最能体现 ICU 优势的问题
 */
export const FEATURED_EXAMPLES = [
  COMPARISON_EXAMPLES[2], // Dr. CHAN Man Long 测评
  COMPARISON_EXAMPLES[6], // 学校打印机
  COMPARISON_EXAMPLES[4]  // 直博 HKPFS
];
