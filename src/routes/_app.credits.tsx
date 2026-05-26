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
    role: "Full-stack Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "2+ years Full-stack Development",
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
    role: "Full-stack Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "2+ years Full-stack Development",
    bio: "Passionate and creative developer focused on Full Stack Development and modern web technologies. Enthusiastic about building innovative real-world projects and continuously learning new technologies to improve skills and create impactful solutions.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub", "Unity"],
    contact: {
      email: "chetankumarg210307@gmail.com",
      linkedin: "https://linkedin.com/in/chetan-kumar-g-7275743b2",
      github: "https://github.com/Chetan-Kumar-G"
    }
  },
  {
    name: "Ganath Avinash G R",
    role: "Full-stack Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "Full-stack (1 year)",
    bio: "Passionate Computer Science undergraduate interested in Full Stack Development, AI/ML, and innovative tech solutions. Skilled in building real-world projects and continuously exploring new technologies.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub", "Next.js", "Python", "Tailwind CSS", "C++", "Java", "REST APIs", "Docker", "Machine Learning"],
    contact: {
      email: "ganathavinash.gr@gmail.com",
      linkedin: "https://www.linkedin.com/in/ganath-avinash",
      github: "https://github.com/Ganath-Avinash"
    }
  },
  {
    name: "Yamuna S",
    role: "Backend Developer",
    education: "Chennai Institute Of Technology",
    experience: "Backend(1yr)",
    bio: "Passionate Computer Science and Engineering student with strong technical knowledge in Artificial Intelligence, networking, embedded systems, and software development. Skilled in programming, logical problem-solving, and project development with a keen interest in emerging technologies. Dedicated to continuous learning through internships, certifications, and hands-on experience while developing innovative and practical technology-based solutions.",
    skills: ["HTML", "CSS", "JavaScript", "MySQL", "Python", "Figma", "C++", "NumPy", "React", "Git", "Flask"],
    contact: {
      email: "yamunasundaresan10@gmail.com",
      linkedin: "https://www.linkedin.com/in/yamuna-s-cse-b5775132a/",
      github: "https://github.com/Yamuna2428"
    }
  },
  {
    name: "C S Deeraj",
    role: "Database & Game Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "DataBase (1 year)",
    bio: "A dedicated and versatile Computer Science student with a strong foundation in programming, web development, and software design, complemented by a creative interest in game development and digital design. Passionate about transforming ideas into practical and engaging digital experiences through structured problem-solving and innovative thinking. With curiosity that extends beyond traditional software development into interactive technologies, game creation, and design tools, I continuously seek opportunities to expand my technical and creative skill set while building impactful real-world solutions. I have an avid interest in game development and have a reputable amount of experience in game design, level creation and development workflow.",
    skills: ["C", "Java", "JavaScript", "HTML", "CSS", "PHP", "Bootstrap", "Node.js", "Git Bash", "DSA", "Web Development", "Problem Solving", "Blender", "Unity", "Piskel"],
    contact: {
      email: "csdeeraj@gmail.com",
      linkedin: "https://www.linkedin.com/in/c-s-deeraj-b58670370/",
      github: "https://github.com/CSDeeraj"
    }
  },
  {
    name: "RAAGHAV VEL P",
    role: "Software & Frontend Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "Software Development (C • Python • Java)",
    bio: "Enthusiastic Computer Science student with strong programming skills in C, Python, and Java. Currently focused on frontend development and building responsive web applications. Interested in solving real-world problems through efficient and scalable solutions. Continuously improving skills in Data Structures, Algorithms, and modern web technologies.",
    skills: ["C", "Python", "Java", "HTML", "CSS", "JavaScript", "Frontend Development", "Data Structures", "Algorithms", "Git", "GitHub"],
    contact: {
      email: "raaghavvel@gmail.com",
      linkedin: "https://www.linkedin.com/in/raaghav-vel-p",
      github: "https://github.com/raaghavvel"
    }
  },
  {
    name: "YOGESHWARI S",
    role: "Software Developer",
    education: "Chennai Institute Of Technology",
    experience: "Software Development (C++ • Python • Java)",
    bio: "Passionate 3rd yr B.E CSE student with a keen interest in Web Development, Full-Stack Development, and Artificial Intelligence. An enthusiastic and adaptable learner who enjoys exploring new technologies, building innovative solutions, and continuously enhancing technical and problem-solving skills.",
    skills: ["C++", "HTML", "CSS", "Tailwind CSS", "JavaScript", "Pandas", "React", "MySQL", "Django", "Flask", "Git", "GitHub", "Figma"],
    contact: {
      email: "yogeshwari.s1976@gmail.com",
      linkedin: "https://www.linkedin.com/in/yogeshwari-s-467b6a327",
      github: "https://github.com/Yogeshwari06"
    }
  },
  {
    name: "Viveka S",
    role: "Software Developer",
    education: "Chennai Institute Of Technology",
    experience: "Software Development (C++ • Python • Java)",
    bio: "Aspiring software engineer with a strong interest in software development, UI design, and problem-solving. Passionate about building practical, user-friendly applications and continuously learning modern technologies. Focused on improving technical expertise through hands-on projects, creativity, and consistent learning while aiming to create impactful and efficient digital solutions.",
    skills: ["HTML", "CSS", "JavaScript", "React.js", "Figma", "C++", "Python", "NumPy", "Flask", "Git", "GitHub"],
    contact: {
      email: "vivekaupk2020@gmail.com",
      linkedin: "https://www.linkedin.com/in/viveka-sureshbabu/",
      github: "https://github.com/Viveka776"
    }
  },
  {
    name: "DIVYA SHREE R",
    role: "AI Developer",
    education: "Chennai Institute Of Technology",
    experience: "2+ years Development",
    bio: "Passionate AI Developer specializing in Artificial Intelligence, Machine Learning, and Generative AI. Focused on building innovative, scalable, and real-world solutions while continuously exploring emerging technologies. Dedicated to leveraging AI to solve complex problems, enhance user experiences, and create meaningful impact through technology.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MySQL", "Git", "AI", "Python", "C", "C++", "Java"],
    contact: {
      email: "divyashreer2538@gmail.com",
      linkedin: "https://www.linkedin.com/in/divya-shree-r-021b22328",
      github: "https://github.com/DivyashreeR008"
    }
  },
  {
    name: "Yamuna K",
    role: "Full-stack Developer",
    education: "Chennai Institute Of Technology",
    experience: "2+ years Development",
    bio: "Motivated Computer Science student with a strong interest in software development and Data Structures & Algorithms. Skilled in building full-stack applications and exploring AI-driven solutions to solve real-world problems. Passionate about continuous learning, problem-solving, and developing efficient, scalable, and impactful applications.",
    skills: ["Python", "C++", "JavaScript", "React", "Flask", "HTML", "CSS", "Git", "GitHub", "MySQL", "MongoDB", "NumPy", "Data Science"],
    contact: {
      email: "kumardarani2@gmail.com",
      linkedin: "https://www.linkedin.com/in/yamuna-k",
      github: "https://github.com/YamunaK2"
    }
  },
  {
    name: "Cynthia M",
    role: "Backend Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "1+ years Backend Development",
    bio: "Motivated Computer Science student with a strong interest in software development and Data Structures & Algorithms. Skilled in building full-stack applications and exploring AI-driven solutions to solve real-world problems. Passionate about continuous learning, problem-solving, and developing efficient, scalable, and impactful applications.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub"],
    contact: {
      email: "cynthia25006@gmail.com",
      linkedin: "https://www.linkedin.com/feed/",
      github: "https://github.com/tartagliciouscodes"
    }
  },
  {
    name: "M.A.Kaushik",
    role: "Full-stack Developer",
    education: "Amrita Vishwa Vidyapeetham",
    experience: "1+ years Development",
    bio: "Passionate and creative developer focused on Full Stack Development and modern web technologies. Enthusiastic about building innovative real-world projects and continuously learning new technologies to improve skills and create impactful solutions.",
    skills: ["React", "HTML", "CSS", "JavaScript", "TypeScript", "Node JS", "Express JS", "MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub"],
    contact: {
      email: "kaushikarunachalam@gmail.com",
      linkedin: "https://www.linkedin.com/in/kaushik-arunachalam-4929b836a/",
      github: "https://github.com/kaushik-arunachalam"
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
