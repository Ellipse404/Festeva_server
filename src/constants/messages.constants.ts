export const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'An account with this email address already exists',
    INVALID_CREDENTIALS: 'Invalid email address or password',
    GOOGLE_CLIENT_ID_NOT_CONFIGURED: 'Google Client ID is not configured',
    INVALID_GOOGLE_PAYLOAD: 'Invalid Google ID Token payload',
    GOOGLE_VERIFICATION_FAILED:
      'Failed to verify Google token with Google OAuth servers',
    INVALID_FACEBOOK_TOKEN: 'Facebook Access Token is invalid or expired',
    FACEBOOK_APP_MISMATCH:
      'Facebook Token security mismatch: Token was not generated for this application',
    FACEBOOK_VERIFICATION_FAILED:
      'Failed to verify Facebook token with Meta servers',
    USER_NOT_FOUND: 'User associated with token no longer exists',
    TOKEN_EXPIRED: 'Token has expired or is invalid',
  },
  VALIDATION: {
    EMAIL_INVALID: 'Please provide a valid email address',
    NAME_REQUIRED: 'Full Name is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    GOOGLE_TOKEN_REQUIRED: 'Google ID Token is required',
    FACEBOOK_TOKEN_REQUIRED: 'Facebook Access Token is required',
    PROVIDER_MUST_BE_GOOGLE_OR_FACEBOOK: 'Provider must be google or facebook',
    TITLE_REQUIRED: 'Event title is required',
    CATEGORY_REQUIRED: 'Event category is required',
    DATE_REQUIRED: 'Event date is required',
    TIME_REQUIRED: 'Event time is required',
    LOCATION_NAME_REQUIRED: 'Location name is required',
    LATITUDE_INVALID: 'Latitude must be between -90 and 90 degrees',
    LONGITUDE_INVALID: 'Longitude must be between -180 and 180 degrees',
    TICKET_PRICE_INVALID: 'Ticket price must be greater than or equal to 0',
    TOTAL_CAPACITY_INVALID: 'Total capacity must be greater than or equal to 1',
  },
  EVENTS: {
    NOT_FOUND: (id: string) => `Event with ID "${id}" was not found`,
    INVALID_LATITUDE: 'Latitude must be between -90 and 90 degrees',
    INVALID_LONGITUDE: 'Longitude must be between -180 and 180 degrees',
    INVALID_RADIUS: 'Search radius must be greater than 0 km',
  },
} as const;
