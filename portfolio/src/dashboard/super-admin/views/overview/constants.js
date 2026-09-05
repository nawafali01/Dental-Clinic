/**
 * CONSTANTS & UTILITIES FOR SUPER ADMIN DASHBOARD OVERVIEW
 */

export const DATE_RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];

export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const safePct = (numerator, denominator) => {
  const n = Number(numerator) || 0;
  const d = Number(denominator) || 0;
  if (d <= 0) return '0%';
  return `${((n / d) * 100).toFixed(1)}%`;
};

export const safePctNumber = (numerator, denominator) => {
  const n = Number(numerator) || 0;
  const d = Number(denominator) || 0;
  if (d <= 0) return 0;
  return Number(((n / d) * 100).toFixed(1));
};

export const getDateScale = (selectedDateRange) => {
  switch (selectedDateRange) {
    case 'Today':
      return { multiplier: 0.04, label: 'Today', trend: '+4.2%' };
    case 'Last 7 Days':
      return { multiplier: 0.25, label: 'Last 7 Days', trend: '+8.6%' };
    case 'This Month':
      return { multiplier: 0.88, label: 'This Month', trend: '+14.8%' };
    case 'Last 30 Days':
    default:
      return { multiplier: 1.0, label: 'Last 30 Days', trend: '+18.6%' };
  }
};
