export type EventLevel =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'advanced'
  | 'all';

export type EventStatus = 'published' | 'cancelled';

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  venueAddress: string;
  municipality: string;
  level: EventLevel;
  levelNote: string | null;
  capacity: number;
  fee: number;
  description: string | null;
  rules: string | null;
  equipment: string | null;
  notes: string | null;
  deadlineHoursBefore: number | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithOrganizer extends Event {
  organizer: {
    id: string;
    displayName: string;
  };
}

export interface EventWithCounts extends EventWithOrganizer {
  approvedCount: number;
}
