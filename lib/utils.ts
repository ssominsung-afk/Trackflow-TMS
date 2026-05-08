import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import type { LoadStatus, RiskLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined, fmt = 'MMM d, yyyy h:mm a') {
  if (!date) return '—'
  return format(new Date(date), fmt)
}

export function timeAgo(date: string | null | undefined) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatWeight(lbs: number | null | undefined) {
  if (lbs == null) return '—'
  return `${lbs.toLocaleString()} lbs`
}

export const STATUS_LABELS: Record<LoadStatus, string> = {
  booked: 'Booked',
  dispatched: 'Dispatched',
  at_pickup: 'At Pickup',
  loaded: 'Loaded',
  in_transit: 'In Transit',
  at_delivery: 'At Delivery',
  delivered: 'Delivered',
  pod_uploaded: 'POD Uploaded',
  completed: 'Completed',
  cancelled: 'Cancelled',
  exception: 'Exception',
}

export const STATUS_COLORS: Record<LoadStatus, { bg: string; text: string; dot: string }> = {
  booked:       { bg: 'bg-slate-500/20', text: 'text-slate-300', dot: 'bg-slate-400' },
  dispatched:   { bg: 'bg-blue-500/20',  text: 'text-blue-300',  dot: 'bg-blue-400' },
  at_pickup:    { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400' },
  loaded:       { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400' },
  in_transit:   { bg: 'bg-indigo-500/20',text: 'text-indigo-300',dot: 'bg-indigo-400' },
  at_delivery:  { bg: 'bg-purple-500/20',text: 'text-purple-300',dot: 'bg-purple-400' },
  delivered:    { bg: 'bg-emerald-500/20',text: 'text-emerald-300',dot: 'bg-emerald-400' },
  pod_uploaded: { bg: 'bg-teal-500/20',  text: 'text-teal-300',  dot: 'bg-teal-400' },
  completed:    { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
  cancelled:    { bg: 'bg-gray-500/20',  text: 'text-gray-400',  dot: 'bg-gray-500' },
  exception:    { bg: 'bg-red-500/20',   text: 'text-red-300',   dot: 'bg-red-400' },
}

export const RISK_COLORS: Record<RiskLevel, { text: string; bg: string }> = {
  on_time: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  at_risk: { text: 'text-amber-400',   bg: 'bg-amber-500/10' },
  late:    { text: 'text-red-400',     bg: 'bg-red-500/10' },
}

export function generateLoadNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `TF-${year}-${rand}`
}
