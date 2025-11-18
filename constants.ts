
import { User, UserRole, Attendee, AttendeeType, ProgrammeEvent, StaffShift, VolunteerShift, TicketType, Accommodation, AccommodationType, Product, BulletinMessage } from './types';

export const MOCK_USERS: User[] = [
  { username: 'Admin', password: 'Admin', role: UserRole.Admin },
  { username: 'alice', password: 'password123', role: UserRole.Staff },
  { username: 'henry', password: 'password123', role: UserRole.Staff },
];

export const MOCK_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Alice Johnson', type: AttendeeType.Staff, contact: 'alice@festival.com', phone: '07700 900001', position: 'Stage Manager', notes: 'Radio #4' },
  { id: '2', name: 'Bob Smith', type: AttendeeType.Customer, contact: 'bob@email.com', phone: '07700 900002', paid: true, ticketTier: TicketType.Tier1 },
  { id: '3', name: 'The Cosmic Keys', type: AttendeeType.Artist, contact: 'cosmickeys@band.com', phone: '07700 900003', position: 'Headliner', notes: 'Needs vegan catering' },
  { id: '4', name: 'Charlie Brown', type: AttendeeType.Volunteer, contact: 'charlie@volunteer.org', phone: '07700 900004', position: 'Gate Scanner' },
  { id: '5', name: 'Diana Prince', type: AttendeeType.Customer, contact: 'diana@email.com', phone: '07700 900005', paid: false },
  { id: '6', name: 'Eve Adams', type: AttendeeType.Staff, contact: 'eve@festival.com', phone: '07700 900006', position: 'Sound Engineer' },
  { id: '7', name: 'Frank White', type: AttendeeType.Volunteer, contact: 'frank@volunteer.org', phone: '07700 900007', position: 'Info Booth' },
  { id: '8', name: 'DJ Spectra', type: AttendeeType.Artist, contact: 'spectra@dj.net', phone: '07700 900008', position: 'Sunrise Set' },
  { id: '9', name: 'Grace Lee', type: AttendeeType.Customer, contact: 'grace@email.com', phone: '07700 900009', paid: true, ticketTier: TicketType.Tier2 },
  { id: '10', name: 'Henry Taylor', type: AttendeeType.Staff, contact: 'henry@festival.com', phone: '07700 900010', position: 'Security Lead' },
];

export const MOCK_EVENTS: ProgrammeEvent[] = [
  { id: 'e1', day: 'Friday', time: '18:00 - 19:00', stage: 'Main Stage', eventName: 'Opening Act: The Starters', details: 'Kick off the festival with high energy rock.' },
  { id: 'e2', day: 'Friday', time: '19:30 - 21:00', stage: 'Main Stage', eventName: 'DJ Spectra', details: 'Deep house and electronic beats.' },
  { id: 'e3', day: 'Friday', time: '21:30 - 23:00', stage: 'Main Stage', eventName: 'The Cosmic Keys', details: 'Psychedelic rock headliner.' },
  { id: 'e4', day: 'Saturday', time: '16:00 - 17:00', stage: 'Acoustic Tent', eventName: 'Acoustic Harmony', details: 'Unplugged folk session.' },
  { id: 'e5', day: 'Saturday', time: '19:00 - 20:30', stage: 'Main Stage', eventName: 'Groove Collective', details: 'Funk and soul extravaganza.' },
  { id: 'e6', day: 'Sunday', time: '20:00 - 21:30', stage: 'Main Stage', eventName: 'Closing Ceremony', details: 'Grand finale with fireworks.' },
];

export const MOCK_STAFF_SHIFTS: StaffShift[] = [
  { id: 's1', day: 'Friday', time: '17:00 - 23:00', attendeeIds: ['1'], role: 'Stage Manager', locations: ['Main Stage'] },
  { id: 's2', day: 'Friday', time: '17:00 - 01:00', attendeeIds: ['10'], role: 'Security Lead', locations: ['Main Gate', 'Car Park'] },
  { id: 's3', day: 'Saturday', time: '18:00 - 00:00', attendeeIds: ['6'], role: 'Sound Engineer', locations: ['Main Stage'] },
  { id: 's4', day: 'Sunday', time: '19:00 - 22:00', attendeeIds: ['1'], role: 'Show Caller', locations: ['The Barn'] },
];

export const MOCK_VOLUNTEER_SHIFTS: VolunteerShift[] = [
  { id: 'v1', day: 'Friday', time: '16:00 - 20:00', attendeeIds: ['4'], task: 'Gate Scanner', locations: ['Main Gate'] },
  { id: 'v2', day: 'Friday', time: '16:00 - 20:00', attendeeIds: ['7'], task: 'Info Booth', locations: ['The Courtyard'] },
  { id: 'v3', day: 'Saturday', time: '14:00 - 18:00', attendeeIds: ['4'], task: 'Merch Stand', locations: ['The Yurt Field'] },
  { id: 'v4', day: 'Sunday', time: '18:00 - 22:00', attendeeIds: ['7'], task: 'Green Team (Cleanup)', locations: ['Main Camping', 'The Woods'] },
];

export const MOCK_ACCOMMODATIONS: Accommodation[] = [
  { id: 'y1', name: 'The Golden Yurt', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
  { id: 'y2', name: 'The Silver Yurt', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
  { id: 'y3', name: 'The Bronze Yurt', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
  { id: 'c1', name: 'Vintage Caravan', type: AccommodationType.Caravan, capacity: 2, attendeeIds: [] },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Beer', price: 5.00, color: 'bg-amber-500' },
  { id: 'p2', name: 'Cider', price: 5.50, color: 'bg-orange-400' },
  { id: 'p3', name: 'Soft Drink', price: 2.50, color: 'bg-blue-400' },
  { id: 'p4', name: 'Spirit + Mixer', price: 6.00, color: 'bg-purple-500' },
  { id: 'p5', name: 'Water', price: 2.00, color: 'bg-cyan-500' },
];

export const MOCK_BULLETINS: BulletinMessage[] = [
    { id: 'b1', author: 'Admin', content: 'Welcome to Bedlam Ball 2024! Please check in at the production office.', timestamp: new Date(Date.now() - 86400000).toISOString(), audience: ['(All)'] },
    { id: 'b2', author: 'Admin', content: 'Radio check will be at 14:00 on Friday.', timestamp: new Date(Date.now() - 43200000).toISOString(), audience: ['(All)'] },
    { id: 'b3', author: 'Admin', content: 'Please remember to sign out your keys.', timestamp: new Date(Date.now() - 3600000).toISOString(), audience: ['(Staff)'] },
];
