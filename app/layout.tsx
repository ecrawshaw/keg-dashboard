import type { Metadata } from 'next'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Keg Dashboard',
  description: 'Real-time beer keg monitoring system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <nav className="nav">
              <h1 className="logo">🍺 Keg Dashboard</h1>
              <ul className="nav-links">
                <li><a href="/">Dashboard</a></li>
                <li><a href="/manage">Manage Kegs</a></li>
                <li><a href="/devices">Devices</a></li>
                <li><a href="/analytics">Analytics</a></li>
                <li><a href="/settings">Settings</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="main">
          {children}
        </main>
        <footer className="footer">
          <div className="container">
            <p className="text-center text-muted">
              Keg Dashboard © {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
