export const timeSince = (timestamp: number): string => {
  const now = Date.now();
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear() === new Date().getFullYear() ? '' : ` ${date.getFullYear()}`;
  const secondsPast = (now - timestamp) / 1000;
  if (secondsPast < 60) {
    return `${Math.round(secondsPast)}s`;
  }
  if (secondsPast < 3600) {
    return `${Math.round(secondsPast / 60)}m`;
  }
  if (secondsPast <= 86400) {
    return `${Math.round(secondsPast / 3600)}h`;
  }
  return `${month} ${day}${year}`;
};
