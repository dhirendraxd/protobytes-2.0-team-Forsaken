import { Card } from "@/components/ui/card";
import { Mail, Github, Linkedin, CircleArrowOutUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Team = () => {
  const members = [
    {
      name: "Dhiren",
      github: "https://github.com/dhirendraxd",
      linkedin: "https://www.linkedin.com/in/dhirendrasinghdhami/",
      website: "https://www.dhirendrasinghdhami.com.np/",
    },
    {
      name: "Ritendra",
      email: "ritentam404@gmail.com",
      github: "https://github.com/RitenTam",
      linkedin: "https://www.linkedin.com/in/ritendra-tamang/",
    },
    {
      name: "Shishir",
      email: "shishirjoshi65@gmail.com",
      github: "https://github.com/Shishirjoshi",
      linkedin: "https://www.linkedin.com/in/shishir-joshi-5948aa276/",
    },
    {
      name: "Hitesh",
      email: "hitesh18nayak@gmail.com",
      github: "https://github.com/hitesh113",
      linkedin: "https://www.linkedin.com/in/hitesh-nayak-58b6b7344/",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10">
        <Navbar />

        <section className="mb-16 overflow-hidden rounded-[26px] bg-lime-300 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[64px] lg:text-[80px]">
              Meet the Team
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-black/75">
              We are the team behind VoiceLink, a cloud-based communication platform for SMEs that simplifies bulk SMS and voice messaging with scheduling, analytics, contact management, and multi-language support.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.name} className="rounded-[22px] border border-black/10 bg-white p-8">
                <h2 className="text-2xl font-semibold text-black">{member.name}</h2>

                <div className="mt-6 space-y-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black"
                    >
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {member.website && (
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-black/80 transition-colors hover:text-black"
                    >
                      <CircleArrowOutUpRight className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;
