import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateProfit(revenue: number, cost: number): number {
  return revenue - cost;
}

export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getConditionColor(condition: string): string {
  switch (condition) {
    case 'new':
      return 'bg-green-100 text-green-800';
    case 'refurbished':
      return 'bg-blue-100 text-blue-800';
    case 'used':
      return 'bg-yellow-100 text-yellow-800';
    case 'activated':
      return 'bg-purple-100 text-purple-800';
    case 'open_box':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
