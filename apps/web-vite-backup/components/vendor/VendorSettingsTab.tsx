import React from 'react';
import { GlassCard } from '../GlassCard';
import { AccessibleButton } from '../AccessibleButton';
import { Venue } from '../../types';

interface VendorSettingsTabProps {
  venue: Venue;
  onVenueChange: (nextVenue: Venue) => void;
  onSave: () => Promise<void> | void;
}

export const VendorSettingsTab: React.FC<VendorSettingsTabProps> = ({
  venue,
  onVenueChange,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <span>🏠</span> Venue Profile
        </h3>
        <div className="space-y-4">
          <input
            value={venue.name}
            onChange={(e) => onVenueChange({ ...venue, name: e.target.value })}
            className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-foreground font-bold"
          />
        </div>
      </GlassCard>
      <AccessibleButton fullWidth size="lg" onClick={onSave} className="shadow-lg">
        Save Changes
      </AccessibleButton>
    </div>
  );
};
