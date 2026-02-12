import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { TrendingUp, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Market {
  id: string;
  name: string;
  municipality: string;
  district: string;
}

interface Commodity {
  id: string;
  name: string;
  name_nepali: string;
  unit: string;
  category: string;
}

interface MarketPrice {
  id: string;
  price: number;
  price_date: string;
  commodity_id: string;
  market_id: string;
  commodity?: Commodity;
  market?: Market;
}

const MarketPrices = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');
    setIsLoggedIn(!!loggedIn);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [selectedMarket]);

  const fetchMarkets = async () => {
    try {
      const marketsRef = collection(db, "markets");
      const q = query(marketsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      const marketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Market[];
      
      setMarkets(marketsData);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const pricesRef = collection(db, "market_prices");
      let q = query(pricesRef, orderBy("price_date", "desc"));

      if (selectedMarket && selectedMarket !== "all") {
        q = query(pricesRef, where("market_id", "==", selectedMarket), orderBy("price_date", "desc"));
      }

      const querySnapshot = await getDocs(q);
      
      // Fetch related data (commodities and markets)
      const pricesData = await Promise.all(
        querySnapshot.docs.map(async (priceDoc) => {
          const priceData = priceDoc.data();
          
          // Fetch commodity
          const commodityDoc = await getDocs(
            query(collection(db, "commodities"), where("__name__", "==", priceData.commodity_id))
          );
          const commodity = commodityDoc.docs[0]?.data() as Commodity;
          
          // Fetch market
          const marketDoc = await getDocs(
            query(collection(db, "markets"), where("__name__", "==", priceData.market_id))
          );
          const market = marketDoc.docs[0]?.data() as Market;
          
          return {
            id: priceDoc.id,
            ...priceData,
            commodity,
            market
          } as MarketPrice;
        })
      );
      
      setPrices(pricesData);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
    setLoading(false);
  };

  const groupPricesByCategory = () => {
    const grouped: { [key: string]: MarketPrice[] } = {};
    prices.forEach((price) => {
      const category = price.commodity?.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(price);
    });
    return grouped;
  };

  const groupedPrices = groupPricesByCategory();
  const latestDate = prices[0]?.price_date;

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
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Market Prices</h1>
          </div>
          <p className="text-xl text-white/90 mb-6">Daily updated commodity prices from local markets</p>
          
          {latestDate && (
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Last Updated: {format(new Date(latestDate), "PPP")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filter Section */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Filter by Market:</span>
            </div>
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name} - {market.municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Price Tables by Category */}
        {loading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading market prices...</p>
          </Card>
        ) : Object.keys(groupedPrices).length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Prices Available</h3>
            <p className="text-muted-foreground">Check back later for updated market prices.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPrices).map(([category, categoryPrices]) => (
              <Card key={category} className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoryPrices.length} {categoryPrices.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Commodity</TableHead>
                        <TableHead className="w-[20%]">Nepali Name</TableHead>
                        <TableHead className="w-[25%]">Market</TableHead>
                        <TableHead className="text-right w-[15%]">Price</TableHead>
                        <TableHead className="text-right w-[10%]">Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryPrices.map((price) => (
                        <TableRow key={price.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {price.commodity?.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {price.commodity?.name_nepali}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{price.market?.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {price.market?.municipality}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            NPR {price.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            per {price.commodity?.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            📞 Call for Voice Updates
          </h3>
          <p className="text-muted-foreground">
            Dial <span className="font-semibold text-foreground">1660-XXX-XXXX</span> and press{" "}
            <span className="font-semibold text-primary">1</span> to hear the latest market prices
          </p>
        </Card>
      </div>
      <Footer isLoggedIn={isLoggedIn} userData={userData} />
    </div>
  );
};

export default MarketPrices;