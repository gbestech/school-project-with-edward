// Detailed mock exam data for admin dashboard
// This structure mirrors what would be received from the backend

export interface ObjectiveQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface TheoryQuestion {
  question: string;
  subQuestions: string[];
  marks: number;
}

export interface SectionCQuestion {
  title: string;
  subtitle: string;
  text: string;
  questions: { question: string; marks: number }[];
}

export interface SchoolInfo {
  name: string;
  address: string;
  session: string;
  term: string;
}

export interface Exam {
  id: number;
  title: string;
  subject: string;
  class: string;
  level: 'nursery' | 'primary' | 'secondary';
  teacher: string;
  date: string;
  duration: string;
  totalMarks: number;
  questions: {
    objectives: ObjectiveQuestion[];
    theory: TheoryQuestion[];
    sectionc?: SectionCQuestion[];
  };
  school: SchoolInfo;
}

export const mockExams: Exam[] = [
  {
    id: 1,
    title: 'Final Examination',
    subject: 'English Language',
    class: 'Primary 2',
    level: 'primary',
    teacher: 'Mrs. Rueben',
    date: '2025-07-28',
    duration: '45 Minutes',
    totalMarks: 60,
    questions: {
      objectives: [
        {
          question: 'We are _______ to school.',
          options: ['go', 'gones', 'gotten', 'going'],
          answer: 'd',
        },
        {
          question: 'I believe what Favour said. She is not _______  liar.',
          options: ['their', 'them', 'we', 'a'],
          answer: 'd',
        },
        {
          question: ' /ɔ:/   as in ____.',
          options: ['horse', 'pot', 'power', 'pull'],
          answer: 'a',
        },
        {
          question: '______ is a word used instead of a noun in a sentence.',
          options: ['noun', 'verbs', 'pronoun', 'clause'],
          answer: 'c',
        },
        {
          question: 'Vowel sound in Cup is ____________',
          options: ['/æ/', '/ʌ/', '/ʊ/', '/ɒ/'],
          answer: 'c',
        },
        {
          question: 'Underline the plural in the sentence: The children are playing during the day.',
          options: ['children', 'day', 'playing', 'are'],
          answer: 'a',
        },
        {
          question: 'In phonics, a vowel is said to be short when you pronounce /ɪ/ as in ___________.',
          options: ['big', 'bed', 'bug', 'bag'],
          answer: 'a',
        },
        {
          question: "The short 'e' sound  _______.",
          options: ['mug', 'must', 'egg', 'bit'],
          answer: 'a',
        },
        {
          question: 'Rewrite these letters in alphabetical order  c  b  a.',
          options: ['b c d', 'a b c', 'a b e', 'e b a'],
          answer: 'b',
        },
        {
          question: 'The title of my literature text is _______.',
          options: ["the land of my promise", "mother's land", "From the magic land", "From the unknown land"],
          answer: 'c',
        },
        {
          question: 'The plural of fish is ______.',
          options: ['fish', 'fishes', 'fishs', 'A and B'],
          answer: 'd',
        },
        {
          question: 'Jump, Write and Cry are examples of ______.',
          options: ['pronoun', 'noun', 'vowel', 'preposition'],
          answer: 'd',
        },
        {
          question: 'The novel was written by _______.',
          options: ['Mrs. Awnna', 'my parents', 'Teachers', 'Oludele Deborah'],
          answer: 'd',
        },
        {
          question: "The Ibuowo's family is in chapter.",
          options: ['4', '5', '6', 'Oludele Deborah'],
          answer: 'a',
        },
        {
          question: 'Underline the verb in the sentence; Bola makes the bed',
          options: ['Bola', 'makes', 'the', 'bed'],
          answer: 'b',
        },
      ],
      theory: [
        {
          question: `Singular\t\tPlural\n'Child\t\t______'\n'______\t\tmice'\n'tooth\t\t______'\n'_______\t\tfeet'\n'Man\t\t______'`,
          subQuestions: ['State the three (3) types of maintenance'],
          marks: 10,
        },
        {
          question: 'Complete the words with vowel A E I O U : _______rt,   _________range , ______nder,   ________nsect _________mbrella',
          subQuestions: [''],
          marks: 10,
        },
        {
          question: 'Write three (3) words with /ɒ/ sound',
          subQuestions: [''],
          marks: 10,
        },
        {
          question: `Make five (5) sentences from the table below\nMum  Cooked ______ Dishes  ________ Mum\nJubril Bought Some  Bags    ________ _____\nTope   Made   ____  Glasses For      Ladi\n____   _____  ____  cakes   _______  ____\n____   _____  ____  Potatoes   _______  Jumia`,
          subQuestions: [''],
          marks: 10,
        },
      ],
      sectionc: [
        {
          title: 'Literature',
          subtitle: 'My Hubby',
          text: `My name is Alimat. I am in primary 2. My hubby is reading. I love reading story books, magazines and any kind of material that I find interesting.\nI started reading when I was a little girl. My mother always read fairytales and other bed time stories to me. Later she got tired of reading to me. As soon as I could, I learnt to read. I started with A B C. Now I can read, and I read anything that is available. Reading has helped me a lot. I have learnt so many things about people, their customs and their ways of life.\nI learnt about how many people lived in the ancient days of magic and mystery.\nThrough reading, I don't have to learn the hard way. I know about dangerous diseases to avoid. I know about dangerous animals to avoid and also know how to stay healthy and alive.`,
          questions: [
            { question: 'Who is in primary 2?', marks: 10 },
            { question: 'What is her hubby?', marks: 10 },
            { question: 'When did she start to read?', marks: 10 },
            { question: 'State two things she learnt while reading', marks: 10 },
          ],
        },
      ],
    },
    school: {
      name: "GOD'S TREASURE SCHOOLS",
      address: "NO. 54 DAGBANA ROAD JIKWOYI PHASE 3 ABUJA",
      session: '2025/2026 ACADEMIC SESSION',
      term: 'FIRST TERM EXAMINATION',
    },
  },
  // Add more mock exams as needed
]; 