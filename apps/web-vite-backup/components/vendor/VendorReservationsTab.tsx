import React from 'react';
import { GlassCard } from '../GlassCard';
import { Badge } from '../ui/Badge';
import { Reservation, ReservationStatus } from '../../types';

interface VendorReservationsTabProps {
  reservations: Reservation[];
}

const statusClassName: Record<ReservationStatus, string> = {
  [ReservationStatus.CONFIRMED]: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30',
  [ReservationStatus.PENDING]: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  [ReservationStatus.DECLINED]: 'bg-red-500/15 text-red-600 border border-red-500/30',
  [ReservationStatus.CANCELLED]: 'bg-rose-500/15 text-rose-600 border border-rose-500/30',
};

export const VendorReservationsTab: React.FC<VendorReservationsTabProps> = ({ reservations }) => {
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <GlassCard key={reservation.id} className="border-l-4 border-accent-500 bg-surface">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-lg text-foreground">
                {reservation.customerName || 'Guest'}
              </div>
              <div className="text-xs text-muted">
                {new Date(reservation.datetime).toLocaleString()} • {reservation.partySize} ppl
              </div>
            </div>
            <Badge className={statusClassName[reservation.status]}>
              {reservation.status}
            </Badge>
          </div>
        </GlassCard>
      ))}
      {reservations.length === 0 ? (
        <div className="text-center text-muted mt-10">No bookings yet</div>
      ) : null}
    </div>
  );
};
