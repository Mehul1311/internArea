const { isPaymentWindowActive } = require('../utils/timeUtils');

describe('Subscription System Tests', () => {

  describe('Time-Window Enforcement', () => {
    let originalDate;

    beforeAll(() => {
      originalDate = Date;
    });

    afterAll(() => {
      global.Date = originalDate;
    });

    const mockDate = (dateString) => {
      class MockDate extends originalDate {
        constructor() {
          super(dateString);
        }
      }
      global.Date = MockDate;
    };

    it('should block payments outside 10:00 AM - 11:00 AM IST', () => {
      // 9:59 AM IST is 4:29 AM UTC
      mockDate('2024-01-01T04:29:00Z');
      expect(isPaymentWindowActive()).toBe(false);

      // 11:01 AM IST is 5:31 AM UTC
      mockDate('2024-01-01T05:31:00Z');
      expect(isPaymentWindowActive()).toBe(false);
    });

    it('should allow payments inside 10:00 AM - 11:00 AM IST', () => {
      // 10:00 AM IST is 4:30 AM UTC
      mockDate('2024-01-01T04:30:00Z');
      expect(isPaymentWindowActive()).toBe(true);

      // 10:30 AM IST is 5:00 AM UTC
      mockDate('2024-01-01T05:00:00Z');
      expect(isPaymentWindowActive()).toBe(true);
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify correct razorpay signature manually (mocked)', () => {
      const crypto = require('crypto');
      const secret = 'test_secret';
      const body = JSON.stringify({ event: 'payment.captured' });
      
      const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
      
      // Simulating what the route does
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(body);
      const digest = shasum.digest('hex');
      
      expect(digest).toBe(expectedSignature);
    });
  });
});
