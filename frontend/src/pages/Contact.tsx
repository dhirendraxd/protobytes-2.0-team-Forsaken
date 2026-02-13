import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  Send,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const Contact = () => {
  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: "support@voicelink.com",
      subtext: "We'll respond within 24 hours",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      subtext: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Chat",
      details: "Available 24/7",
      subtext: "Click the chat icon below",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      details: "123 Tech Street, San Francisco, CA 94105",
      subtext: "By appointment only",
    },
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Tech Street, CA 94105",
      phone: "+1 (555) 123-4567",
    },
    {
      city: "New York",
      address: "456 Business Ave, NY 10001",
      phone: "+1 (555) 987-6543",
    },
    {
      city: "London",
      address: "789 Innovation Rd, EC1A 1BB",
      phone: "+44 20 1234 5678",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10">
        <Navbar />

        {/* Hero Section */}
        <section className="mb-16 overflow-hidden rounded-[26px] bg-lime-300 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[64px] lg:text-[80px]">
              Get in Touch
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/75">
              Have a question? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="rounded-[26px] border border-black/10 bg-white p-8 sm:p-10">
              <h2 className="mb-6 text-[32px] font-semibold tracking-[-0.02em] text-black">
                Send us a Message
              </h2>
              <form className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-black">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="h-11 rounded-xl border-black/20"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-11 rounded-xl border-black/20"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-medium text-black">
                    Company (Optional)
                  </label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your Company Inc."
                    className="h-11 rounded-xl border-black/20"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-black">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="h-11 rounded-xl border-black/20"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-black">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="rounded-xl border-black/20 resize-none"
                  />
                </div>
                <Button className="h-11 w-full rounded-xl bg-black text-white hover:bg-lime-600 transition-all">
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="rounded-[26px] border border-black/10 bg-white p-8">
                <h2 className="mb-6 text-[32px] font-semibold tracking-[-0.02em] text-black">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lime-300/20 text-black">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{info.title}</h3>
                        <p className="text-sm text-black/90">{info.details}</p>
                        <p className="text-xs text-black/60">{info.subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-[26px] border border-black/10 bg-white p-8">
                <h3 className="mb-4 text-lg font-semibold text-black">Follow Us</h3>
                <div className="flex gap-4">
                  <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-lime-600">
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-lime-600">
                    <Twitter className="h-5 w-5" />
                  </button>
                  <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-lime-600">
                    <Instagram className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="mb-16">
          <div className="rounded-[26px] bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em]">
              Our Global Offices
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {offices.map((office, index) => (
                <div key={index} className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-300/20">
                    <MapPin className="h-6 w-6 text-lime-300" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{office.city}</h3>
                  <p className="mb-2 text-sm text-white/80">{office.address}</p>
                  <p className="text-sm text-white/70">{office.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <section className="mb-16">
          <Card className="rounded-[26px] border border-black/10 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lime-300/20">
              <Clock className="h-8 w-8 text-black" />
            </div>
            <h2 className="mb-2 text-[28px] font-semibold text-black">24/7 Support Available</h2>
            <p className="mx-auto max-w-2xl text-black/70">
              Our support team is available around the clock to assist you. Whether it's a technical issue or a general inquiry, we're here to help.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="rounded-xl bg-lime-300/10 px-6 py-3">
                <p className="text-sm font-medium text-black">Live Chat: 24/7</p>
              </div>
              <div className="rounded-xl bg-lime-300/10 px-6 py-3">
                <p className="text-sm font-medium text-black">Email: 24 hour response</p>
              </div>
              <div className="rounded-xl bg-lime-300/10 px-6 py-3">
                <p className="text-sm font-medium text-black">Phone: Mon-Fri 9AM-6PM</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Contact;
