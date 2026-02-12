import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Search, Filter, Mail } from "lucide-react";

// Placeholder data
const mockModerators = [
  { name: "Asha Tamang", email: "asha@example.com", area: "Bagmati / Lalitpur", phone: "+977-9841234567", status: "active" },
  { name: "Ravi Gurung", email: "ravi@example.com", area: "Koshi / Dharan", phone: "+977-9851234567", status: "active" },
  { name: "Sita BK", email: "sita@example.com", area: "Gandaki / Pokhara", phone: "+977-9861234567", status: "pending" },
];

const mockContributors = [
  { name: "Ramesh K", email: "ramesh@example.com", area: "Bagmati / Bhaktapur", phone: "+977-9811234567", contributions: 12 },
  { name: "Puja Rai", email: "puja@example.com", area: "Koshi / Ilam", phone: "+977-9821234567", contributions: 8 },
  { name: "Kiran Lama", email: "kiran@example.com", area: "Gandaki / Nuwakot", phone: "+977-9831234567", contributions: 5 },
  { name: "Devi Shah", email: "devi@example.com", area: "Lumbini / Kapilbastu", phone: "+977-9841234567", contributions: 15 },
];

const Community = () => {
  const [searchMods, setSearchMods] = useState("");
  const [searchContribs, setSearchContribs] = useState("");

  const filteredMods = mockModerators.filter(m => 
    m.name.toLowerCase().includes(searchMods.toLowerCase()) ||
    m.area.toLowerCase().includes(searchMods.toLowerCase())
  );

  const filteredContribs = mockContributors.filter(c => 
    c.name.toLowerCase().includes(searchContribs.toLowerCase()) ||
    c.area.toLowerCase().includes(searchContribs.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-80">Moderator View</p>
              <h1 className="text-3xl font-bold">Community Network</h1>
            </div>
          </div>
          <p className="text-primary-foreground/80">View and manage all moderators and contributors</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Active Moderators</CardTitle>
              <Shield className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockModerators.length}</p>
              <p className="text-xs text-muted-foreground">Covering all areas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Contributors</CardTitle>
              <Users className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockContributors.length}</p>
              <p className="text-xs text-muted-foreground">Active contributors</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="moderators" className="space-y-4">
          <TabsList>
            <TabsTrigger value="moderators">Moderators</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
          </TabsList>

          <TabsContent value="moderators" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search moderators by name or area..."
                  className="pl-10"
                  value={searchMods}
                  onChange={(e) => setSearchMods(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMods.map((mod) => (
                    <TableRow key={mod.name}>
                      <TableCell className="font-medium">{mod.name}</TableCell>
                      <TableCell>{mod.area}</TableCell>
                      <TableCell className="text-sm">{mod.phone}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mod.email}</TableCell>
                      <TableCell>
                        <Badge className={mod.status === "active" ? "bg-green-500" : "bg-amber-500"}>
                          {mod.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="contributors" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search contributors by name or area..."
                  className="pl-10"
                  value={searchContribs}
                  onChange={(e) => setSearchContribs(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContribs.map((contrib) => (
                    <TableRow key={contrib.name}>
                      <TableCell className="font-medium">{contrib.name}</TableCell>
                      <TableCell>{contrib.area}</TableCell>
                      <TableCell className="text-sm">{contrib.phone}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contrib.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contrib.contributions}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Mail className="w-4 h-4" /> Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
