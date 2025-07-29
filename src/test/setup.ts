import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock environment variables
process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_test_mock_key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.GOOGLE_CLIENT_ID = 'mock_google_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'mock_google_client_secret';
process.env.LINE_CHANNEL_ID = 'mock_line_channel_id';
process.env.LINE_CHANNEL_SECRET = 'mock_line_channel_secret';
process.env.LINE_CHANNEL_ACCESS_TOKEN = 'mock_line_access_token';
process.env.SESSION_SECRET = 'mock_session_secret';