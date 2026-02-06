export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE_SETUP: '/profile/setup',
  EVENTS_NEW: '/events/new',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  EVENT_EDIT: (id: string) => `/events/${id}/edit`,
  DASHBOARD: '/dashboard',
  APPLICATIONS: (eventId: string) =>
    `/dashboard/events/${eventId}/applications`,
  MY_PAGE: '/my-page',
  CHAT: (eventId: string, userId: string) => `/chat/${eventId}/${userId}`,
} as const;
