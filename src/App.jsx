"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

/* Utils */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(userId) {
  return `engagement-${userId}`;
}

/* Default daily tasks */
function defaultTasks() {
  return {
    dailyCheckIn: false,
    visitBase: false,
  };
}

export default function App() {
  const [userId, setUserId] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState(defaultTasks());
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [error, setError] = useState(null);

  /* 1. Initialize Farcaster SDK (Fixes "Not Ready" Error) */
  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      sdk.actions.ready(); // Tells the validator the app is ready
    };

    if (sdk && sdk.actions) {
      load();
    }
  }, []);

  /* 2. Read identity from Base/Farcaster context */
  useEffect(() => {
    // Note: window.base might not exist in the emulator, so we check safely
    if (typeof window !== "undefined" && window.base) {
      try {
        const address = window.base?.user?.walletAddress;
        if (address) {
          setWallet(address);
          setUserId(address.toLowerCase());
        }
      } catch {
        setError("Failed to read Base SDK");
      }
    }
  }, []);

  /* 3. Load daily state */
  useEffect(() => {
    if (!userId) return;

    const raw = localStorage.getItem(storageKey(userId));
    const data = raw ? JSON.parse(raw) : {};

    const today = todayKey();

    if (data.date !== today) {
      // New day reset
      setTasks(defaultTasks());
      setCheckedInToday(false);
      setStreak(data.streak || 0);

      localStorage.setItem(
        storageKey(userId),
        JSON.stringify({
          date: today,
          streak: data.streak || 0,
          tasks: defaultTasks(),
        })
      );
    } else {
      setTasks(data.tasks || defaultTasks());
      setCheckedInToday(data.tasks?.dailyCheckIn || false);
      setStreak(data.streak || 0);
    }
  }, [userId]);

  /* Save state helper */
  function saveState(updated) {
    localStorage.setItem(storageKey(userId), JSON.stringify(updated));
  }

  /* Daily check-in */
  function handleCheckIn() {
    if (checkedInToday) return;

    const today = todayKey();
    const raw = localStorage.getItem(storageKey(userId));
    const data = raw ? JSON.parse(raw) : {};

    let newStreak = 1;

    if (data.lastCheckIn) {
      const last = new Date(data.lastCheckIn);
      const diff =
        (new Date(today) - last) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        newStreak = (data.streak || 0) + 1;
      }
    }

    const updatedTasks = {
      ...tasks,
      dailyCheckIn: true,
    };

    const updated = {
      date: today,
      lastCheckIn: today,
      streak: newStreak,
      tasks: updatedTasks,
    };

    saveState(updated);

    setStreak(newStreak);
    setTasks(updatedTasks);
    setCheckedInToday(true);
  }

  /* Task actions */
  function completeTask(taskId) {
    if (tasks[taskId]) return;

    const raw = localStorage.getItem(storageKey(userId));
    const data = raw ? JSON.parse(raw) : {};

    const updatedTasks = {
      ...tasks,
      [taskId]: true,
    };

    const updated = {
      ...data,
      tasks: updatedTasks,
    };

    saveState(updated);
    setTasks(updatedTasks);
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Engagement Mini App</h1>

      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}

      {/* Render content even if no wallet is found (for debugging) */}
      <div className="card">
        <p className="streak">
          🔥 Streak: <strong>{streak}</strong>
        </p>

        <button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          style={{ padding: '10px 20px', margin: '10px 0' }}
        >
          {checkedInToday ? "Checked in today" : "Daily Check-In"}
        </button>
      </div>

      <div className="card">
        <h2>Daily Tasks</h2>

        <ul className="tasks" style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '10px 0' }}>
            <input
              type="checkbox"
              checked={tasks.dailyCheckIn}
              readOnly
              style={{ marginRight: '10px' }}
            />
            Daily check-in
          </li>

          <li style={{ margin: '10px 0' }}>
            <input
              type="checkbox"
              checked={tasks.visitBase}
              readOnly
              style={{ marginRight: '10px' }}
            />
            <button
              className="link"
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
      
      {wallet && (
          <p className="wallet" style={{ marginTop: '20px', fontSize: '0.8em', color: '#666' }}>
            Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </p>
      )}
    </div>
  );
}