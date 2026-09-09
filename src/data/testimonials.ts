export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  batch: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "SPIC helped me transform my idea into a working startup.",
    name: "Rahul Sharma",
    batch: "Final Year",
    role: "Core Team Member 2024",
  },
  {
    id: "t2",
    quote: "Organizing TEDx RKGIT with SPIC was the highlight of my college journey. I grew as a leader and built connections that will last a lifetime.",
    name: "Ananya Verma",
    batch: "Third Year",
    role: "Events Lead 2025",
  },
  {
    id: "t3",
    quote: "The workshops and hackathons pushed me out of my comfort zone. I learned more in one semester with SPIC than in an entire year of classes.",
    name: "Kunal Mehra",
    batch: "Second Year",
    role: "Technical Team 2025",
  },
];
