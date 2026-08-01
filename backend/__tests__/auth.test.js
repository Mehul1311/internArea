const { parseLoginContext } = require('../utils/uaParser');
const { isMobileLoginWindowActive } = require('../utils/timeUtils');

describe('Login Tracking & Conditional Access Tests', () => {

  describe('UA Parsing Logic', () => {
    it('should correctly parse Chrome desktop', () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const context = parseLoginContext(req);
      expect(context.browser).toBe('Chrome');
      expect(context.os).toBe('Windows');
      expect(context.deviceType).toBe('desktop');
      expect(context.ip).toBe('127.0.0.1');
    });

    it('should correctly parse Mobile browser', () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        },
        socket: { remoteAddress: '192.168.1.1' }
      };
      const context = parseLoginContext(req);
      expect(context.browser).toBe('Mobile Safari');
      expect(context.os).toBe('iOS');
      expect(context.deviceType).toBe('mobile');
    });

    it('should default missing device type to desktop', () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
        },
        socket: { remoteAddress: '10.0.0.1' }
      };
      const context = parseLoginContext(req);
      expect(context.browser).toBe('Firefox');
      expect(context.os).toBe('Linux');
      expect(context.deviceType).toBe('desktop');
    });
  });

  describe('Time-Window Enforcement (Mobile)', () => {
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

    it('should block mobile login outside 10:00 AM - 1:00 PM IST', () => {
      // 9:59 AM IST = 4:29 AM UTC
      mockDate('2024-01-01T04:29:00Z');
      expect(isMobileLoginWindowActive()).toBe(false);

      // 1:01 PM IST = 7:31 AM UTC
      mockDate('2024-01-01T07:31:00Z');
      expect(isMobileLoginWindowActive()).toBe(false);
    });

    it('should allow mobile login inside 10:00 AM - 1:00 PM IST', () => {
      // 10:00 AM IST = 4:30 AM UTC
      mockDate('2024-01-01T04:30:00Z');
      expect(isMobileLoginWindowActive()).toBe(true);

      // 12:30 PM IST = 7:00 AM UTC
      mockDate('2024-01-01T07:00:00Z');
      expect(isMobileLoginWindowActive()).toBe(true);
    });
  });

});
