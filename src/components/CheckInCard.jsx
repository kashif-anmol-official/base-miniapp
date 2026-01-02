import { useState } from "react";
import { useAccount } from "wagmi";
import { useStreak } from "../hooks/useStreak";

export default function CheckInCard() {
  const { address } = useAccount();
  const { getStreak, checkIn } = useStreak(address);
  const [data, setData] = useState(getStreak());

  if (!address) return null;

  return (
    <div className="card">
      <h2>Daily Check-In</h2>
      <p>Streak: {data.count} days</p>
      <button
        onClick={() => {
          const updated = checkIn();
          setData(updated);
        }}
      >
        Check In Today
      </button>
    </div>
  );
}
