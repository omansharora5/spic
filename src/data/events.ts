export interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue: string;
  status: "upcoming" | "open" | "closed" | "ended";
  category: "hackathon" | "workshop" | "talk" | "competition" | "visit" | "seminar";
  description: string;
  registrationType?: "individual" | "team";
  minTeamSize?: number;
  maxTeamSize?: number;
  requirePpt?: boolean;
  whatsappGroupUrl?: string;
  featured?: boolean;
  attendees?: number;
  speakers?: number;
  highlightsUrl?: string;
  registrationUrl?: string;
  image?: string;
  imageList?: string[]; // List of image filenames in the event folder
  /* Up to 5 organiser-authored instructions shown to participants
     (e.g. "Bring your laptop & charger"). Set by admin in the event editor. */
  notes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const MAX_EVENT_NOTES = 5;

export const upcomingEvents: Event[] = [
  {
    id: "ideation-2",
    name: "Ideation '26",
    date: "25 & 27 April 2026",
    time: "10:00 AM onwards",
    venue: "Seminal Hall , D Block",
    status: "open",
    category: "competition",
    description: "Intra-college pitch competition where students present innovative ideas to a panel of industry experts and investors.",
    registrationType: "team",
    minTeamSize: 1,
    maxTeamSize: 4,
    requirePpt: true,
    featured: true,
    whatsappGroupUrl: "https://chat.whatsapp.com/test-invite",
    registrationUrl: "/register/ideation-2",
  },
  {
    id: "tedx-rkgit-2026",
    name: "TEDx RKGIT",
    date: "2026-04-01",
    time: "11:00 AM",
    venue: "D Block",
    status: "closed",
    category: "talk",
    description: "An independently organized TEDx event featuring inspiring talks from thought leaders, innovators, and changemakers.",
    registrationType: "individual",
    minTeamSize: 1,
    maxTeamSize: 1,
    requirePpt: false,
    highlightsUrl: "#",
  },
];

export const pastEvents: Event[] = [
  {
    id: "tedx-2025",
    name: "TEDx RKGIT",
    date: "2025-08-22",
    venue: "Seminar Hall",
    status: "ended",
    category: "talk",
    description: "An inspiring TEDx event with 7 speakers and 200+ attendees.",
    attendees: 200,
    speakers: 7 ,
    highlightsUrl: "#",
    imageList: [
      "https://i.postimg.cc/gk0GbXRx/DSC-1650.jpg",
      "https://i.postimg.cc/YqStBGgX/DSC-1691.jpg",
      "https://i.postimg.cc/xTFnffy6/DSC-1712.jpg",
      "https://i.postimg.cc/c450xxMP/DSC-1730.jpg",
      "https://i.postimg.cc/GhSdLLx2/DSC-1775.jpg",
      "https://i.postimg.cc/RZ69qkgC/DSC-1869.jpg",
      "https://i.postimg.cc/L8YRhcxY/DSC-1909.jpg",
      "https://i.postimg.cc/fRGsd8Pc/DSC-2021.jpg",
      "https://i.postimg.cc/zfTrFnm9/SAH06110.jpg",
      "https://i.postimg.cc/nLqJGvbF/SAH06212.jpg",
      "https://i.postimg.cc/4dZTLmsH/SAH06231.jpg",
      "https://i.postimg.cc/ZRZh7C4D/SAH06339.jpg",
      "https://i.postimg.cc/MTDJhqGz/SAH06389.jpg",
      "https://i.postimg.cc/cCLGW2KY/SAH06409.jpg",
    ],
  },
  {
    id: "spic-gma-2024",
    name: "SPIC x GMA",
    date: "9 October 2024",
    venue: "Seminar Hall",
    status: "ended",
    category: "competition",
    description: "The Ghaziabad Entrepreneurship Mission, launched by the Ghaziabad Management Association (GMA) in collaboration with SkillingYou, is designed to identify and nurture the Top 100 young founders from the city.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-ideation-2023",
    name: "Spic x Ideation",
    date: "5 & 13 May 2023",
    venue: "Seminar Hall",
    status: "ended",
    category: "competition",
    description: "Ideation workshop and competition to foster innovative thinking among students.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-haier-2023",
    name: "Spic x Haier",
    date: "24 April 2023",
    venue: "Seminar Hall",
    status: "ended",
    category: "visit",
    description: "Industrial visit to Haier to gain insights into manufacturing and operations.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-eashwa-2022",
    name: "Spic x E-Ashwa",
    date: "23 December 2022",
    venue: "Seminar Hall",
    status: "ended",
    category: "visit",
    description: "Industrial visit to E-Ashwa to understand the electric vehicle industry.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-upgrade-2022",
    name: "Spic x UpGrad",
    date: "21 December 2022",
    venue: "Seminar Hall",
    status: "ended",
    category: "seminar",
    description: "Collaborative seminar with UpGrad focusing on career growth and upskilling.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-unacademy-2022",
    name: "Spic x Unacademy",
    date: "17 October 2022",
    venue: "Seminar Hall",
    status: "ended",
    category: "talk",
    description: "Session with successful innovator S.K Mondal in collaboration with Unacademy.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-gfg-2022",
    name: "Spic x GFG",
    date: "24 May 2022",
    venue: "Seminar Hall",
    status: "ended",
    category: "talk",
    description: "Interactive session with Sandeep Jain, founder of GeeksforGeeks.",
    attendees: 120,
    highlightsUrl: "#",
  },
  {
    id: "spic-pw-2022",
    name: "Spic x PW",
    date: "24 January 2022",
    venue: "Seminar Hall",
    status: "ended",
    category: "talk",
    description: "Guest lecture in collaboration with Physics Wallah.",
    attendees: 120,
    highlightsUrl: "#",
  },
];
