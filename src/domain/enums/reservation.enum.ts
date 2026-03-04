export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const
  export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus]
