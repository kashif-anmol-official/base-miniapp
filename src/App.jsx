import { useEffect, useState } from "react";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [error, setError] = useState(null);

  // Read wallet from Base SDK
  useEffect(() => {
    if (!window.base) {
      setError("Base SDK not available. Open in Base App.");
      return;
    }

    try {
      const address = window.base?.user?.walletAddress;
      if (address) {
        setWallet(address);
      } else {
        setError("Wallet not found");
      }
    } catch {
      setError("Failed to read Base SDK");
    }
  }, []);

  // Load streak from localStorage
  useEffect(() => {
    if (!wallet) return;

    const data = JSON.parse(
      localStorage.getItem(`streak-${wallet}`) || "{}"
    );

    const today = getToday();

    if (data.lastCheckIn === today) {
      setCheckedInToday(true);
      setStreak(data.streak || 1);
    } else {
      setCheckedInToday(false);
      setStreak(data.streak || 0);
    }
  }, [wallet]);

  function handleCheckIn() {
    if (!wallet) return;

    const today = getToday();
    const key = `streak-${wallet}`;
    const data = JSON.parse(localStorage.getItem(key) || "{}");

    let newStreak = 1;

    if (data.lastCheckIn) {
      const last = new Date(data.lastCheckIn);
      const diff =
        (new Date(today) - last) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        newStreak = (data.streak || 0) + 1;
      }
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        lastCheckIn: today,
        streak: newStreak,
      })
    );

    setStreak(newStreak);
    setCheckedInToday(true);
  }

  return (
    <div className="container">
      <h1>Base Streak</h1>

      {error && <p className="error">{error}</p>}

      {wallet && (
        <>
          <p className="wallet">
            Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </p>

          <div className="card">
            <p className="streak">
              Current streak: <strong>{streak}</strong>
            </p>

            <button
              onClick={handleCheckIn}
              disabled={checkedInToday}
            >
              {checkedInToday ? "Checked in today" : "Check in"}
            </button>

            {checkedInToday && (
              <p className="hint">
                Come back tomorrow to continue your streak.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
