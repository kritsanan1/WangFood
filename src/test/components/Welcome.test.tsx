import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Welcome from '@/pages/Welcome';

// Mock the logo import
vi.mock('@/assets/logo.png', () => ({
  default: '/mock-logo.png',
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Welcome Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders welcome page with Tourderwang branding', () => {
    render(<Welcome />);

    expect(screen.getByText('ทัวร์เดอร์วาง')).toBeInTheDocument();
    expect(screen.getByText('Wang Sam Mo Food Delivery')).toBeInTheDocument();
    expect(screen.getByAltText('Tourderwang Logo')).toBeInTheDocument();
  });

  it('displays location badge', () => {
    render(<Welcome />);

    expect(screen.getByText('Wang Sam Mo, Udonthani, Thailand')).toBeInTheDocument();
  });

  it('shows social login options', () => {
    render(<Welcome />);

    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with LINE')).toBeInTheDocument();
    expect(screen.getByText('Continue with Replit')).toBeInTheDocument();
  });

  it('displays guest browsing option', () => {
    render(<Welcome />);

    expect(screen.getByText('Browse as Guest')).toBeInTheDocument();
  });

  it('shows app features', () => {
    render(<Welcome />);

    expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
    expect(screen.getByText('Multiple Payment Options')).toBeInTheDocument();
    expect(screen.getByText('Social Login')).toBeInTheDocument();
    expect(screen.getByText('Quality Food')).toBeInTheDocument();
  });

  it('displays popular restaurants', () => {
    render(<Welcome />);

    expect(screen.getByText('Popular Restaurants')).toBeInTheDocument();
    expect(screen.getByText('ร้านอาหารไทยดั้งเดิม')).toBeInTheDocument();
    expect(screen.getByText('ส้มตำอีสาน')).toBeInTheDocument();
    expect(screen.getByText('ก๋วยเตี๋ยวต้มยำ')).toBeInTheDocument();
  });

  it('shows restaurant ratings and delivery times', () => {
    render(<Welcome />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('20-30 นาที')).toBeInTheDocument();
    expect(screen.getByText('15-25 นาที')).toBeInTheDocument();
    expect(screen.getByText('25-35 นาที')).toBeInTheDocument();
  });

  it('redirects to Google auth when Google login is clicked', () => {
    render(<Welcome />);

    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    expect(mockLocation.href).toBe('/api/auth/google');
  });

  it('redirects to LINE auth when LINE login is clicked', () => {
    render(<Welcome />);

    const lineButton = screen.getByText('Continue with LINE');
    fireEvent.click(lineButton);

    expect(mockLocation.href).toBe('/api/auth/line');
  });

  it('redirects to Replit auth when Replit login is clicked', () => {
    render(<Welcome />);

    const replitButton = screen.getByText('Continue with Replit');
    fireEvent.click(replitButton);

    expect(mockLocation.href).toBe('/api/auth/');
  });

  it('shows contact information', () => {
    render(<Welcome />);

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('+66 XX XXX XXXX')).toBeInTheDocument();
    expect(screen.getByText('Daily: 6:00 AM - 11:00 PM')).toBeInTheDocument();
  });

  it('displays Thai description text', () => {
    render(<Welcome />);

    expect(
      screen.getByText(/Authentic Thai food delivery from local restaurants/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fast, fresh, and delicious meals delivered to your door/)
    ).toBeInTheDocument();
  });

  it('shows feature descriptions with payment options', () => {
    render(<Welcome />);

    expect(
      screen.getByText('Cash, Stripe, LINE Pay, and QR codes supported')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Login with Google, LINE, or Replit account')
    ).toBeInTheDocument();
  });
});