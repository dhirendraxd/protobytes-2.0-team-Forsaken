import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  Target,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Megaphone,
  Building2,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge className="mb-4" variant="outline">
            <Globe className="w-3 h-3 mr-1" />
            Empowering Rural Nepal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Village Voice Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A grassroots civic engagement platform redistributing power and information 
            to empower rural communities to demand accountability and make informed decisions.
          </p>
        </section>

        {/* Problem Statement */}
        <section className="mb-16">
          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-5 h-5 text-destructive" />
                <CardTitle>The Problem</CardTitle>
              </div>
              <CardDescription>Critical challenges facing rural Nepal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-destructive">❌</span> No Safe Reporting Channels
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Citizens lack safe ways to report infrastructure issues, misuse of public funds, 
                    and governance failures—leading to ignored problems and fear of retaliation.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-destructive">❌</span> Broken Trust & Transparency
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Lack of transparency erodes trust between communities and local authorities. 
                    Citizens have no visibility into how complaints are handled or funds are used.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-destructive">❌</span> Information Asymmetries
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Farmers struggle without market price data; citizens lack reliable transport 
                    schedules—forcing uninformed decisions that harm livelihoods.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="text-destructive">❌</span> Inefficient Systems
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Traditional complaint systems are time-consuming, inefficient, and provide 
                    no feedback on resolution status—creating a cycle of frustration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Solution Overview */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Our Solution</h2>
            <p className="text-muted-foreground">
              A three-layer approach to empower rural communities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Layer 1 */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Layer 1: Civic Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Anonymous issue reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Community moderation system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transparent tracking dashboard</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  → Solves: Governance gap
                </p>
              </CardContent>
            </Card>

            {/* Layer 2 */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Layer 2: Information Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Real-time market prices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transport schedules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Local news & announcements</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  → Solves: Information asymmetry
                </p>
              </CardContent>
            </Card>

            {/* Layer 3 */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Layer 3: Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Nepali language interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Low-bandwidth optimized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Non-digital-native UX</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  → Solves: Digital divide
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Target Users */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Who Benefits?</h2>
            <p className="text-muted-foreground">
              Empowering multiple stakeholders across rural Nepal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Rural Citizens</CardTitle>
                <CardDescription>18-60 years, rural villages</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-medium">Benefits:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Safe anonymous reporting</li>
                  <li>• Access to market prices</li>
                  <li>• Reliable transport info</li>
                  <li>• Voice in governance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Government Officials</CardTitle>
                <CardDescription>Ward & municipal level</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-medium">Benefits:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Direct citizen feedback</li>
                  <li>• Data-driven insights</li>
                  <li>• Improved transparency</li>
                  <li>• Accountability mechanisms</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HeartHandshake className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Civil Society</CardTitle>
                <CardDescription>NGOs & advocates</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-medium">Benefits:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Governance research data</li>
                  <li>• Amplify rural voices</li>
                  <li>• Community insights</li>
                  <li>• Accountability journalism</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Expected Impact */}
        <section className="mb-16">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Expected Impact</CardTitle>
              </div>
              <CardDescription>Measurable improvements in rural governance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">40-60%</span>
                    <span className="text-sm text-muted-foreground">from ~5%</span>
                  </div>
                  <p className="text-sm font-medium">Citizen Reporting Rate</p>
                  <p className="text-xs text-muted-foreground">
                    Anonymous safety increases participation
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">2-4 weeks</span>
                    <span className="text-sm text-muted-foreground">from 6-12 months</span>
                  </div>
                  <p className="text-sm font-medium">Issue Resolution Time</p>
                  <p className="text-xs text-muted-foreground">
                    Public tracking creates accountability
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">Data-driven</span>
                    <span className="text-sm text-muted-foreground">from guesswork</span>
                  </div>
                  <p className="text-sm font-medium">Farmer Market Decisions</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time prices improve livelihoods
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Implementation Roadmap */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Implementation Roadmap</h2>
            <p className="text-muted-foreground">
              Scaling from pilot to nationwide impact
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg">Phase 1: Pilot</CardTitle>
                    <CardDescription>1-2 remote villages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li>• Test anonymous reporting system</li>
                  <li>• Verify moderation works</li>
                  <li>• Validate market price integration</li>
                  <li>• Measure citizen engagement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg">Phase 2: Expansion</CardTitle>
                    <CardDescription>10-20 villages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li>• Integrate with local government systems</li>
                  <li>• Train moderators and officials</li>
                  <li>• Add transport schedule data</li>
                  <li>• Measure governance improvements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-lg">Phase 3: Scale</CardTitle>
                    <CardDescription>All rural Nepal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li>• Open-source release</li>
                  <li>• NGO partnerships for expansion</li>
                  <li>• Government integration</li>
                  <li>• Create sustainable revenue model</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Insight */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">The Core Insight</CardTitle>
            </CardHeader>
            <CardContent className="text-center max-w-3xl mx-auto">
              <p className="text-lg mb-4">
                This isn't a technology problem—it's a <span className="font-bold text-primary">power redistribution problem</span>.
              </p>
              <Separator className="my-6" />
              <p className="text-muted-foreground">
                Village Voice Hub uses technology to give rural communities the information and 
                accountability mechanisms they've always deserved. We transform passive citizens 
                into active participants in their own governance while giving officials the data 
                and accountability frameworks they need to serve effectively.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-primary/20">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Help us strengthen democracy from the grassroots up. Whether you're a rural citizen, 
                government official, or civil society advocate—Village Voice Hub empowers you to 
                make a difference.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/apply-moderator">
                  <Button size="lg" className="gap-2">
                    Become a Moderator
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="gap-2">
                    Get in Touch
                    <MapPin className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
