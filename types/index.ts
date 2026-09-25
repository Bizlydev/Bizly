export type UserRole = 'manager' | 'employee';

export interface Workspace {
  id: string;
  name: string;
  businessType: 'cafe' | 'restaurant' | 'store' | 'salon' | 'service' | 'other';
  address: string;
  latitude: number;
  longitude: number;
  currency: string;
  language: 'fa' | 'en' | 'ar';
  managerId: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  workspaceId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  workspaceId: string;
  employeeId: string;
  product: string;
  amount: number;
  time: string;
  date: string;
}

export interface WorkHours {
  id: string;
  workspaceId: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
}

export interface Customer {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface DebtTransaction {
  id: string;
  workspaceId: string;
  customerId: string;
  product: string;
  amount: number;
  paidAmount: number;
  remaining: number;
  dueDate?: string;
  isPinned: boolean;
  date: string;
  time: string;
}
