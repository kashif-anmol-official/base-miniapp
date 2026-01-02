import { useEffect, useState } from "react"

function App() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!window.BaseMiniApp) {
      setError("Base Mini App SDK not available. Open in Base Preview.")
      return
    }

    const app = window.BaseMiniApp

    try {
      app.ready()
      app.getUser().then(setUser)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Base Mini App</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!user && !error && <p>Waiting for Base user context...</p>}

      {user && (
        <>
          <p>User ID: {user.id}</p>
          <p>Wallet: {user.walletAddress}</p>
        </>
      )}
    </div>
  )
}

export default App
