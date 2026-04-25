export enum PackageStatus {
  ACTIVE = 'Active',
  ENDED = 'Ended',
  PENDING = 'Pending'
}

export interface SubscriptionPlan {
  id: string;
  nameKey: string;
  price: number;
  durationDays: number | 'lifetime';
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: '1_week', nameKey: 'subscription.week_1', price: 10, durationDays: 7 },
  { id: '2_weeks', nameKey: 'subscription.week_2', price: 15, durationDays: 14 },
  { id: '1_month', nameKey: 'subscription.month_1', price: 20, durationDays: 30 },
  { id: '2_months', nameKey: 'subscription.month_2', price: 30, durationDays: 60 },
  { id: '6_months', nameKey: 'subscription.month_6', price: 60, durationDays: 180 },
  { id: '1_year', nameKey: 'subscription.year_1', price: 100, durationDays: 365 },
  { id: 'lifetime', nameKey: 'subscription.lifetime', price: 0, durationDays: 'lifetime' }, // Support contact
];

export enum PaymentMethod {
  BKASH = 'bkash',
  NAGAD = 'nagad',
  NSAVE = 'nsave',
  GPAY = 'gpay',
  BINANCE = 'binance'
}

export const PAYMENT_METHODS = [
  { id: PaymentMethod.BKASH, nameKey: 'payment.methods.bkash', icon: 'Wallet' },
  { id: PaymentMethod.NAGAD, nameKey: 'payment.methods.nagad', icon: 'Wallet' },
  { id: PaymentMethod.NSAVE, nameKey: 'payment.methods.nsave', icon: 'ShieldCheck' },
  { id: PaymentMethod.GPAY, nameKey: 'payment.methods.gpay', icon: 'Smartphone' },
  { id: PaymentMethod.BINANCE, nameKey: 'payment.methods.binance', icon: 'Coins' },
];
