export type ApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Application {
  id: string;
  eventId: string;
  applicantId: string;
  comment: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationWithApplicant extends Application {
  applicant: {
    id: string;
    displayName: string;
  };
}

export interface ApplicationWithEvent extends Application {
  event: {
    id: string;
    title: string;
    startDatetime: string;
    endDatetime: string;
    venueName: string;
    status: string;
    organizerId: string;
    organizer: {
      id: string;
      displayName: string;
    };
  };
}
