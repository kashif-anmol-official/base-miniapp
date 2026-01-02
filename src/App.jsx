"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import WalletConnect from "./components/WalletConnect";

/* Utils */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(id) {
  return `engagement-${id}`;
}

function defaultTasks() {
  return {
    dailyCheckIn: false,
    visitBase: false,
  };
}

export default function App() {
  const { address, isConnected } = useAccount();

  const userId = isConnected ? address.toLowerCase() : "guest";

  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState(defaultTasks());
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [error, setError] = useState(null);

  /* Load daily state (only after wallet connect) */
  useEffect(() => {
    if (!isConnected) return;

    const key = storageKey(userId);
    const raw = localStorage.getItem(key);
    const saved = raw ? JSON.parse(raw) : null;
    const today = todayKey();

    if (!saved || saved.date !== today) {
      const newState = {
        date: today,
        lastCheckIn: saved?.lastCheckIn || null,
        streak: saved?.streak || 0,
        tasks: defaultTasks(),
      };
      localStorage.setItem(key, JSON.stringify(newState));
      setTasks(defaultTasks());
      setCheckedInToday(false);
      setStreak(newState.streak);
    } else {
      setTasks(saved.tasks);
      setCheckedInToday(saved.tasks.dailyCheckIn);
      setStreak(saved.streak);
    }
  }, [isConnected, userId]);

  function save(updated) {
    localStorage.setItem(storageKey(userId), JSON.stringify(updated));
  }

  function handleCheckIn() {
    if (checkedInToday || !isConnected) return;

    const raw = localStorage.getItem(storageKey(userId));
    const data = raw ? JSON.parse(raw) : {};
    const today = todayKey();

    let newStreak = 1;
    if (data.lastCheckIn) {
      const last = new Date(data.lastCheckIn);
      const now = new Date();
      const diffDays = Math.floor(
        (now - last) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        newStreak = (data.streak || 0) + 1;
      }
    }

    const updated = {
      date: today,
      lastCheckIn: today,
      streak: newStreak,
      tasks: {
        ...tasks,
        dailyCheckIn: true,
      },
    };

    save(updated);
    setStreak(newStreak);
    setTasks(updated.tasks);
    setCheckedInToday(true);
  }

  function completeTask(id) {
    if (!isConnected || tasks[id]) return;

    const raw = localStorage.getItem(storageKey(userId));
    const data = raw ? JSON.parse(raw) : {};

    const updatedTasks = {
      ...tasks,
      [id]: true,
    };

    save({ ...data, tasks: updatedTasks });
    setTasks(updatedTasks);
  }

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1>Engagement Mini App</h1>

      {!isConnected && (
        <div className="card">
          <WalletConnect />
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Connect your wallet to start your streak
          </p>
        </div>
      )}

      {isConnected && (
        <>
          <div className="card">
            <p>🔥 Streak: <strong>{streak}</strong></p>

            <button
              onClick={handleCheckIn}
              disabled={checkedInToday}
              style={{ padding: "10px 20px", marginTop: 10 }}
            >
              {checkedInToday ? "Checked in today" : "Daily Check-In"}
            </button>
          </div>

          <div className="card">
            <h2>Daily Tasks</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>
                <input type="checkbox" checked={tasks.dailyCheckIn} readOnly /> Daily check-in
              </li>

              <li>
                <input type="checkbox" checked={tasks.visitBase} readOnly />{" "}
                <button
                  disabled={tasks.visitBase}
                  onClick={() => {
                    window.open("https://base.org", "_blank");
                    completeTask("visitBase");
                  }}
                >
                  Visit Base.org
                </button>
              </li>
            </ul>
          </div>

          <p style={{ marginTop: 20, fontSize: 12, color: "#777" }}>
            Wallet: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </>
      )}
    </div>
  );
}
