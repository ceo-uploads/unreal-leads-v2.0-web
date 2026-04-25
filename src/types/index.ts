import { PackageStatus } from '@/src/constants/plans';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  whatsApp?: string;
  isAdmin?: boolean;
  currentPackage?: PurchasedPackage;
  purchaseHistory: PurchasedPackage[];
  transactionHistory: Transaction[];
  notifications: Notification[];
}

export interface PurchasedPackage {
  id: string;
  planId: string;
  planName: string;
  amountPaid: number;
  activationDate: number;
  deadline: number | 'lifetime';
  status: PackageStatus;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  method: string;
  trxId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  planId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Lead {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  extraInfo?: Record<string, any>;
}

export interface SoftUser {
  id: string;
  username: string;
  password?: string;
  createdAt: number;
  userId?: string;
  displayName?: string;
  enrolledAt?: number;
  deadline?: number | 'lifetime';
  status?: 'Active' | 'Expired';
}
