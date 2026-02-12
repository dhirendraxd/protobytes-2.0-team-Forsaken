import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            VoiceLink
          </h1>
          <p className="text-xl text-muted-foreground">
            Bridging Communities Through Voice and Technology
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Welcome to VoiceLink</h2>
            <p className="text-muted-foreground mb-4">
              A comprehensive community information system designed to bridge the digital divide
              by providing critical information to rural villages in Nepal through both voice-based
              (IVR) and web-based interfaces.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">📊 Market Prices</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time agricultural commodity prices
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">🚌 Transport Info</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule and delay alerts
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">📢 Community Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Critical announcements and updates
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
