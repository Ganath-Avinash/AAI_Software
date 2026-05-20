import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Linkedin, Mail, ExternalLink, Code2, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/credits")({
  component: CreditsPage,
});

const interns = [
  {
    name: "Agneay B Nair",
    role: "Frontend Developer",
    education: "B.Tech Amrita Vishwa Vidyapeetham",
    experience: "2+ years Frontend Development",
    bio: "Passionate about coding and continually developing skills in AR/VR technologies. Building GitHub repositories and striving for quality. Always striving for quality in my work and excited to learn something new each day.",
    skills: ["React", "HTML", "CSS", "SASS", "JavaScript", "TypeScript", "Material UI", "Node JS", "Express JS", "PostgreSQL", "Git"],
    contact: {
      email: "agneaybnair@gmail.com",
      linkedin: "https://www.linkedin.com/in/agneay-b-nair-977424211/",
      website: "https://agneay.tech",
    }
  },
  {
    name: "Chetan Kumar G",
    role: "Frontend Developer",
    education: "B.Tech CSE – Amrita Vishwa Vidyapeetham",
    experience: "2+ years Frontend Development",
    bio: "Passionate developer interested in Full Stack Development, AR/VR, and innovative tech solutions. Always learning new technologies and building real-world projects.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub", "Unity"],
    contact: {
      email: "chetankumarg210307@gmail.com",
      linkedin: "https://linkedin.com/in/chetan-kumar-g-7275743b2",
      github: "https://github.com/Chetan-Kumar-G"
    }
  }
];

function CreditsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "Credits" }]} />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
        <p className="text-muted-foreground mt-2">
          Meet the team of talented interns from Airports Authority of India who built this Asset Management System.
        </p>
      </div>

      <div className="flex justify-center py-10 px-12">
        <Carousel className="w-full max-w-3xl">
          <CarouselContent>
            {interns.map((intern, index) => (
              <CarouselItem key={index}>
                <Card className="border-2 shadow-sm h-full">
                  <CardHeader className="text-center pb-6 bg-muted/30">
                    <div className="mx-auto size-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Code2 className="size-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{intern.name}</CardTitle>
                    <p className="text-primary font-medium">{intern.role}</p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground font-medium mb-1">Education</div>
                        <div>{intern.education}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-medium mb-1">Experience</div>
                        <div>{intern.experience}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground font-medium mb-2 text-sm">About</div>
                      <p className="text-sm leading-relaxed">{intern.bio}</p>
                    </div>

                    <div>
                      <div className="text-muted-foreground font-medium mb-2 text-sm">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {intern.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-primary/5 hover:bg-primary/10">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t flex items-center justify-center gap-6 mt-auto">
                      {'email' in intern.contact && intern.contact.email && (
                        <a href={`mailto:${intern.contact.email}`} className="text-muted-foreground hover:text-primary transition-colors" title="Email">
                          <Mail className="size-6" />
                        </a>
                      )}
                      {'linkedin' in intern.contact && intern.contact.linkedin && (
                        <a href={intern.contact.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="LinkedIn">
                          <Linkedin className="size-6" />
                        </a>
                      )}
                      {'website' in intern.contact && intern.contact.website && (
                        <a href={intern.contact.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="Website">
                          <ExternalLink className="size-6" />
                        </a>
                      )}
                      {'github' in intern.contact && intern.contact.github && (
                        <a href={intern.contact.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="GitHub">
                          <Github className="size-6" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
