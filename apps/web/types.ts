export enum UserType {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
}

export interface UIContext {
  appName: string;
  greeting: string;
  currencySymbol: string;
  visualVibe?: string;
}

export interface MenuOption {
  id: string;
  name: string;
  priceModifier: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
  tags?: string[];
  options?: MenuOption[];
}

export interface Venue {
  id: string;
  googlePlaceId?: string; // For claiming
  name: string;
  address: string;
  description: string;
  revolutHandle: string;
  phone?: string;
  whatsappNumber?: string;
  googleMapsUrl?: string;
  website?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  openingHours?: string;
  tags?: string[];
  menu: MenuItem[];
  imageUrl?: string;
  ownerId?: string;
  lat?: number;
  lng?: number;
  currency?: string; // e.g., '€', '$', '£'
  status?: 'active' | 'pending_claim' | 'suspended';
}

export interface Table {
  id: string;
  venueId: string;
  label: string;
  code: string;
  active: boolean;
}

export interface Order {
  id: string;
  venueId: string;
  tableNumber: string;
  orderCode: string;
  items: { item: MenuItem; quantity: number; selectedOptions?: string[] }[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  timestamp: number;
  createdAt?: string;
  customerNote?: string;
}

export interface Reservation {
  id: string;
  venueId: string;
  clientAuthUserId: string;
  customerName?: string;
  partySize: number;
  datetime: string; // ISO timestamp string
  note?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserType;
  email?: string;
  favorites: string[];
  notificationsEnabled: boolean;
}

export interface AdminUser {
  id: string;
  authUserId: string;
  email: string;
  role: 'superadmin' | 'moderator';
  isActive: boolean;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  createdAt: number;
}