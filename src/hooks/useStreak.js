export function useStreak(address) {
  const key = `streak-${address}`;

  function getStreak() {
    const raw = localStorage.getItem(key);
    if (!raw) return { count: 0, lastCheck: null };
    return JSON.parse(raw);
  }

  function checkIn() {
    const today = new Date().toDateString();
    const data = getStreak();

    if (data.lastCheck === today) {
      return data;
    }

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const count = data.lastCheck === yesterday ? data.count + 1 : 1;

    const updated = { count, lastCheck: today };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }

  return { getStreak, checkIn };
}
