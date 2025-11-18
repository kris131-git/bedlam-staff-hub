
export enum UserRole {
  Admin = 'Admin',
  Staff = 'Staff',
}

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export enum AttendeeType {
  Staff = 'Staff',
  Customer = 'Customer',
  Artist = 'Artist',
  Volunteer = 'Volunteer',
}

export enum TicketType {
  Tier1 = 'Tier 1',
  Tier2 = 'Tier 2',
  Tier3 = 'Tier 3',
}

export interface Attendee {
  id: string;
  name: string;
  type: AttendeeType;
  contact: string;
  phone?: string;
  notes?: string;
  paid?: boolean;
  ticketTier?: TicketType;
  position?: string;
  checkInTime?: string;
}

export interface ProgrammeEvent {
  id: string;
  time: string;
  day: string;
  stage: string;
  eventName: string;
  details: string;
}

export interface StaffShift {
  id: string;
  time: string;
  day: string;
  attendeeIds: string[];
  role: string;
  locations: string[];
}

export interface VolunteerShift {
  id: string;
  time: string;
  day: string;
  attendeeIds: string[];
  task: string;
  locations: string[];
}

export enum AccommodationType {
  Yurt = 'Yurt',
  Caravan = 'Caravan',
}

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  capacity: number;
  attendeeIds: string[]; // List of Attendee IDs assigned here
}

// Till Types
export interface Product {
  id: string;
  name: string;
  price: number;
  color?: string; // Tailwind bg class
}

export interface CartItem extends Product {
  quantity: number;
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
}

export interface Transaction {
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  method: PaymentMethod;
}

// Bulletin Types
export interface BulletinReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface BulletinMessage {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  audience: string[]; // List of recipients (groups or usernames)
  likes?: string[]; // List of usernames who liked
  replies?: BulletinReply[];
}
