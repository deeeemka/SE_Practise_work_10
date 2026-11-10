import type { Room } from './types';

// Fictional booking data for the campus room catalog.
// All times are minutes after midnight (0–1440).
// "now" is fixed fictional value within 0–1439 per AC3.
export const FICTIONAL_NOW_MINUTES = 615; // 10:15

export const ROOMS: Room[] = [
  {
    id: 'room-engineering-204',
    name: 'Engineering 204',
    building: 'Foster Engineering Building',
    capacity: 24,
    equipment: ['Projector', 'Whiteboard', 'Video Conferencing'],
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Senior Design Studio', organizer: 'Dr. Patel', start: 540, end: 600 },
      { id: 'b2', title: 'Faculty Sync', organizer: 'Prof. Lin', start: 660, end: 720 },
      { id: 'b3', title: 'Robotics Lab Prep', organizer: 'M. Garcia', start: 840, end: 930 },
      { id: 'b4', title: 'Algorithms Review', organizer: 'Study Group A', start: 1020, end: 1080 },
    ],
  },
  {
    id: 'room-library-110',
    name: 'Library Seminar 110',
    building: 'Central Library',
    capacity: 8,
    equipment: ['Whiteboard', 'Video Conferencing'],
    blocked: false,
    bookings: [
      { id: 'b5', title: 'Reading Group', organizer: 'L. Okafor', start: 600, end: 630 },
      { id: 'b6', title: 'Thesis Defense Prep', organizer: 'J. Moreau', start: 780, end: 900 },
      { id: 'b7', title: 'Tutoring Session', organizer: 'Peer Tutors', start: 1000, end: 1020 },
    ],
  },
  {
    id: 'room-science-310',
    name: 'Science Hall 310',
    building: 'Science Hall',
    capacity: 60,
    equipment: ['Projector', 'Microphone'],
    blocked: false,
    bookings: [
      { id: 'b8', title: 'Lecture Overflow', organizer: 'Dr. Brandt', start: 480, end: 540 },
      { id: 'b9', title: 'Lab Briefing', organizer: 'Dr. Ishikawa', start: 720, end: 780 },
      { id: 'b10', title: 'Guest Lecture', organizer: 'Dept. of Physics', start: 900, end: 960 },
    ],
  },
  {
    id: 'room-arts-102',
    name: 'Arts Studio 102',
    building: 'Fine Arts Annex',
    capacity: 16,
    equipment: ['Whiteboard', 'Video Conferencing', 'Microphone'],
    blocked: true,
    blockReason: 'Scheduled maintenance: HVAC system inspection',
    bookings: [
      { id: 'b11', title: 'Life Drawing', organizer: 'Prof. Keller', start: 660, end: 780 },
      { id: 'b12', title: 'Design Critique', organizer: 'Studio Club', start: 840, end: 900 },
    ],
  },
];
