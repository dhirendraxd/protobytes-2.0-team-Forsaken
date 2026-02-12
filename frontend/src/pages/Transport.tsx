import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

interface Schedule {
  id: string;
  route: string;
  time: string;
  operator: string;
  status: string;
  seats: string;
  delay?: string;
  reason?: string;
}

const Transport = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const schedulesRef = collection(db, "transport_schedules");
      const q = query(schedulesRef, orderBy("time"));
      const querySnapshot = await getDocs(q);
      
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Schedule[];
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="relative animated-gradient text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating particles */}
        <div className="floating-particle w-12 h-12 left-[10%]" style={{ animation: 'float-up 15s infinite linear' }}></div>
        <div className="floating-particle w-8 h-8 left-[25%]" style={{ animation: 'float-up 12s infinite linear 2s' }}></div>
        <div className="floating-particle w-16 h-16 left-[40%]" style={{ animation: 'float-diagonal 18s infinite linear 1s' }}></div>
        <div className="floating-particle w-6 h-6 left-[55%]" style={{ animation: 'float-up 10s infinite linear 3s' }}></div>
        <div className="floating-particle w-10 h-10 left-[70%]" style={{ animation: 'float-diagonal 16s infinite linear' }}></div>
        <div className="floating-particle w-14 h-14 left-[85%]" style={{ animation: 'float-up 14s infinite linear 4s' }}></div>
        <div className="floating-particle w-8 h-8 left-[15%]" style={{ animation: 'float-diagonal 13s infinite linear 5s' }}></div>
        <div className="floating-particle w-12 h-12 left-[60%]" style={{ animation: 'float-up 17s infinite linear 2.5s' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        
        <Navbar />
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-3">Transport Schedules</h1>
          <p className="text-xl text-white/90">Real-time bus and jeep schedules with delay alerts</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <Card className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transport schedules...</p>
            </Card>
          ) : schedules.length === 0 ? (
            <Card className="p-12 text-center">
              <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Schedules Available</h3>
              <p className="text-muted-foreground">Check back later for updated transport schedules.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
              <Card key={schedule.id} className="p-5 hover:shadow-[var(--card-shadow-hover)] transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{schedule.route}</h3>
                        <p className="text-sm text-muted-foreground">{schedule.operator}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{schedule.time}</p>
                        <Badge variant={
                          schedule.status === 'on-time' ? 'default' :
                          schedule.status === 'delayed' ? 'secondary' : 'destructive'
                        }>
                          {schedule.status === 'on-time' ? 'On Time' :
                           schedule.status === 'delayed' ? `Delayed ${schedule.delay}` : 'Cancelled'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Seats: <span className="font-medium text-foreground">{schedule.seats}</span></span>
                      {schedule.reason && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span>{schedule.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📞 Call for Voice Updates</h3>
            <p className="text-muted-foreground">Dial <span className="font-semibold text-foreground">1660-XXX-XXXX</span> and press <span className="font-semibold text-primary">2</span> to hear transport schedules</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transport;