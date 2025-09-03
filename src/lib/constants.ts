
export type MemoryImage = {
  id: string;
  src: string;
  alt: string;
  title: string;
  tags: string[];
  dataAiHint?: string;
};

export type CampusEvent = {
  id: string;
  title: string;
  date: string; // Should be ISO string format for consistency
  type: 'Tech' | 'Cultural' | 'Sports' | 'Academic';
  description: string;
  posterUrl?: string;
  dataAiHint?: string;
};

export const placeholderImages: MemoryImage[] = [
  {
    id: '1',
    src: 'https://placehold.co/600x400.png',
    alt: 'Students at a cultural event',
    title: 'Cultural Festivities',
    tags: ['culture', 'event', 'students', 'dance'],
    dataAiHint: 'cultural event',
  },
  {
    id: '2',
    src: 'https://placehold.co/600x400.png',
    alt: 'Tech seminar in progress',
    title: 'Tech Seminar Highlights',
    tags: ['tech', 'seminar', 'learning', 'presentation'],
    dataAiHint: 'tech seminar',
  },
  {
    id: '3',
    src: 'https://placehold.co/600x400.png',
    alt: 'Campus sports day',
    title: 'Annual Sports Meet',
    tags: ['sports', 'competition', 'outdoor', 'team'],
    dataAiHint: 'campus sports',
  },
  {
    id: '4',
    src: 'https://placehold.co/600x400.png',
    alt: 'Graduation ceremony',
    title: 'Graduation Day 2023',
    tags: ['graduation', 'ceremony', 'students', 'achievement'],
    dataAiHint: 'graduation ceremony',
  },
  {
    id: '5',
    src: 'https://placehold.co/600x400.png',
    alt: 'Library study session',
    title: 'Quiet Study Time',
    tags: ['library', 'study', 'books', 'students'],
    dataAiHint: 'library study',
  },
  {
    id: '6',
    src: 'https://placehold.co/600x400.png',
    alt: 'Art exhibition on campus',
    title: 'Student Art Show',
    tags: ['art', 'exhibition', 'creativity', 'painting'],
    dataAiHint: 'art exhibition',
  },
  {
    id: '7',
    src: 'https://placehold.co/600x400.png', // Corrected from '{{VisionOutput}}'
    alt: 'Three students in uniform posing for a photo',
    title: 'Student Friends',
    tags: ['students', 'friends', 'uniform', 'selfie', 'college life'],
    dataAiHint: 'students uniform',
  },
];

export const placeholderEvents: CampusEvent[] = [
  {
    id: 'e1',
    title: 'Annual Tech Symposium',
    date: new Date('2024-10-15T10:00:00').toISOString(),
    type: 'Tech',
    description: 'A full day of tech talks, workshops, and hackathons. Join us to explore the latest in technology.',
    posterUrl: 'https://placehold.co/400x600.png',
    dataAiHint: 'tech poster',
  },
  {
    id: 'e2',
    title: 'Spring Cultural Festival',
    date: new Date('2024-11-05T14:00:00').toISOString(),
    type: 'Cultural',
    description: 'Celebrate diversity with music, dance, and food from around the world. A vibrant showcase of talent.',
    posterUrl: 'https://placehold.co/400x600.png',
    dataAiHint: 'festival poster',
  },
  {
    id: 'e3',
    title: 'Inter-College Sports Championship',
    date: new Date('2024-09-20T09:00:00').toISOString(),
    type: 'Sports',
    description: 'Cheer for your college teams as they compete in various sports for the championship trophy.',
    posterUrl: 'https://placehold.co/400x600.png',
    dataAiHint: 'sports poster',
  },
  {
    id: 'e4',
    title: 'Guest Lecture on AI Ethics',
    date: new Date('2024-10-02T16:00:00').toISOString(),
    type: 'Academic',
    description: 'An insightful lecture by Dr. Evelyn Reed on the ethical implications of Artificial Intelligence.',
    posterUrl: 'https://placehold.co/400x600.png',
    dataAiHint: 'lecture poster',
  },
];
