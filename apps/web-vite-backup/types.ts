export enum UserType {
  CLIENT = 'client',
  STAFF = 'staff',    // Vendor/bar staff (primary role)
  MANAGER = 'manager', // Legacy, maps to STAFF
  ADMIN = 'admin'
}

export enum OrderStatus {
  NEW = 'NEW',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  // Legacy statuses for backward compatibility
  RECEIVED = 'RECEIVED', // Maps to NEW
  SERVED = 'SERVED' // Maps to COMPLETED
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
  name: string;
  address: string;
  description: string;
  revolutHandle: string;
  momoNumber?: string;  // MTN Mobile Money number for Rwanda payments
  phone?: string;
  whatsappNumber?: string;
  website?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  openingHours?: string;
  tags?: string[];
  menu: MenuItem[];
  imageUrl?: string;
  logoUrl?: string;
  ownerId?: string;
  currency?: string; // e.g., '€', '$', '£', 'RWF'
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
  metadata: Record<string, unknown>;
  createdAt: number;
}