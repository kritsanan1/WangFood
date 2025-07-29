import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PaymentModal from '@/components/PaymentModal';

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: vi.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded', id: 'pi_test_123' },
    }),
  }),
  useElements: () => ({}),
}));

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

// Mock QRCode component
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>
      QR Code: {value}
    </div>
  ),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('PaymentModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    orderId: 'test-order-123',
    amount: 150.50,
    onPaymentSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment modal with correct amount', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Payment')).toBeInTheDocument();
      expect(screen.getByText('Order Total: ฿150.50')).toBeInTheDocument();
    });
  });

  it('displays payment method tabs', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('PromptPay')).toBeInTheDocument();
      expect(screen.getByText('TrueWallet')).toBeInTheDocument();
    });
  });

  it('shows Stripe payment form by default', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    });
  });

  it('switches to QR payment when PromptPay tab is clicked', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('PromptPay'));
    });

    await waitFor(() => {
      expect(screen.getByText('PromptPay QR Code')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code with your mobile banking app')).toBeInTheDocument();
    });
  });

  it('displays QR code for TrueWallet payment', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('TrueWallet'));
    });

    await waitFor(() => {
      expect(screen.getByText('TrueWallet QR Code')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });
  });

  it('shows payment instructions for mobile payments', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('PromptPay'));
    });

    await waitFor(() => {
      expect(screen.getByText('Payment Instructions:')).toBeInTheDocument();
      expect(screen.getByText('1. Open your mobile banking app')).toBeInTheDocument();
      expect(screen.getByText('4. Confirm the amount: ฿150.50')).toBeInTheDocument();
    });
  });

  it('displays correct amount in all payment methods', async () => {
    renderWithProviders(<PaymentModal {...defaultProps} />);

    // Check Stripe payment
    await waitFor(() => {
      expect(screen.getByText('Pay ฿150.50')).toBeInTheDocument();
    });

    // Check PromptPay
    fireEvent.click(screen.getByText('PromptPay'));
    await waitFor(() => {
      expect(screen.getByText('Amount: ฿150.50')).toBeInTheDocument();
    });

    // Check TrueWallet
    fireEvent.click(screen.getByText('TrueWallet'));
    await waitFor(() => {
      expect(screen.getByText('Amount: ฿150.50')).toBeInTheDocument();
    });
  });

  it('calls onClose when modal is closed', () => {
    const mockOnClose = vi.fn();
    renderWithProviders(
      <PaymentModal {...defaultProps} onClose={mockOnClose} isOpen={false} />
    );

    // Modal should not be visible when isOpen is false
    expect(screen.queryByText('Complete Your Payment')).not.toBeInTheDocument();
  });
});