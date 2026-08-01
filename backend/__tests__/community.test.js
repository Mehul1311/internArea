const { getDailyPostLimit } = require('../utils/communityUtils');

describe('Public Space - Friend Limits', () => {
  it('should return 0 limit for 0 friends', () => {
    expect(getDailyPostLimit(0)).toBe(0);
  });

  it('should return 1 limit for 1 friend', () => {
    expect(getDailyPostLimit(1)).toBe(1);
  });

  it('should return 2 limit for 2 friends', () => {
    expect(getDailyPostLimit(2)).toBe(2);
  });

  it('should return friendCount for 3 to 10 friends', () => {
    expect(getDailyPostLimit(3)).toBe(3);
    expect(getDailyPostLimit(7)).toBe(7);
    expect(getDailyPostLimit(10)).toBe(10);
  });

  it('should return Infinity for >10 friends', () => {
    expect(getDailyPostLimit(11)).toBe(Infinity);
    expect(getDailyPostLimit(100)).toBe(Infinity);
  });
});
