import { Intern } from '../types';

export const INITIAL_INTERNS: Intern[] = [
  {
    id: 'intern-1',
    name: 'Sera',
    email: 'sera@traininghub.internal',
    role: 'Lead Intern',
    avatar: 'SE',
    phone: '+1 (555) 234-8901',
    skills: ['Slide QA', 'Agenda Timekeeping', 'Trainer Coordination', 'Speaker Liaison'],
    status: 'active',
  },
  {
    id: 'intern-2',
    name: 'Jiamin',
    email: 'jiamin@traininghub.internal',
    role: 'Technical Intern',
    avatar: 'JM',
    phone: '+1 (555) 872-4419',
    skills: ['AV Setup', 'Zoom Rooms', 'Digital Whiteboards', 'Clickers & Microphones'],
    status: 'active',
  },
];

// Sample QR Code SVG encoded as data URL for evaluation forms
