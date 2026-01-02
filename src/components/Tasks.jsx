export default function Tasks() {
  const tasks = [
    { id: 1, title: "Daily check-in", done: false },
    { id: 2, title: "Connect wallet", done: true },
    { id: 3, title: "Share app on Warpcast", done: false },
  ];

  return (
    <div className="card">
      <h2>Tasks</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.done ? "✅" : "⬜"} {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
