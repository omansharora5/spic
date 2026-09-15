export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  linkedinUrl?: string;
  image?: string;
  bio?: string;
  objectPosition?: string;
}

export const facultyAdvisor: TeamMember = {
  id: "faculty-1",
  name: "Dr. Puneet Chandra Srivastava",
  role: "Dean EII",
  department: "EII Department",
  image: "https://i.postimg.cc/W4xdhmGf/Dean-EII.jpg",
  bio: "Guiding students to innovate and create solutions that matter.",
};

export const coreLeadership: TeamMember[] = [
  { id: "cl-1", name: "Keshav Thakur", role: "President", linkedinUrl: "#", image: "https://i.postimg.cc/tJNJSLKW/Whats-App-Image-2026-04-14-at-11-18-39-PM.jpg", objectPosition: "center 20%" },
  { id: "cl-2", name: "Krishnav Talukdar", role: "Vice President", linkedinUrl: "#", image: "https://i.postimg.cc/L4tJ81nb/DS.jpg" },
  { id: "cl-3", name: "Puneet Chaudhary", role: "Treasurer", linkedinUrl: "#", image: "https://i.postimg.cc/VsqJkCd3/IMG-2904-puneet-chaudhary.jpg" },
  { id: "cl-4", name: "Meghna Kandpal", role: "Assistant Vice President", linkedinUrl: "#", image: "https://i.postimg.cc/Bn6bp7NV/IMG-1741869018013-Meghna-Kandpal.jpg" },
  { id: "cl-5", name: "Parth Mehra", role: "Assistant Vice President", linkedinUrl: "#", image: "https://i.postimg.cc/bYxZwtZ8/IMG-20260207-WA0005-parth-Mehra.jpg" },
  { id: "cl-6", name: "Shivam Vashishth", role: "Assistant Vice President", linkedinUrl: "#", image: "https://i.postimg.cc/3J9WgQjv/IMG-20251106-WA0031-Shivam-Vashisth.jpg", objectPosition: "center 20%" },
  { id: "cl-7", name: "Prakhar Bajpai", role: "Assistant Vice President", linkedinUrl: "#", image: "https://i.postimg.cc/8z5c4Xtj/IMG-20251105-121044-(1)-PRAKHAR-BAJPAI.jpg" },
  { id: "cl-8", name: "Vansh Baisla", role: "Advisor", linkedinUrl: "#", image: "https://i.postimg.cc/MTypHCK3/Vansh-baisla.jpg" },
  { id: "cl-9", name: "Daksh Chaudhary", role: "Executive", linkedinUrl: "#", image: "https://i.postimg.cc/MKzvMpBM/Daksh-Chaudhary-Daksh-Choudhary.jpg" },
  { id: "cl-10", name: "Saloni Choudhary", role: "Executive", linkedinUrl: "#", image: "https://i.postimg.cc/RZDFD1Ds/B77C1F81-89BF-4D53-9C76-4440F2DB60A7-Saloni-Singh.jpg", objectPosition: "center 20%" },
  { id: "cl-11", name: "Utkarsh Tyagi", role: "Executive", linkedinUrl: "#", image: "https://i.postimg.cc/Y26vCWvj/IMG-20250226-234449-530-Utkarsh-Tyagi.jpg" },
  { id: "cl-12", name: "Vaibhav Srivastava", role: "Executive", linkedinUrl: "#", image: "https://i.postimg.cc/520ygKnd/DSC-2054-Vaibhav-Srivastava.jpg", objectPosition: "center 20%" },
  { id: "cl-13", name: "Ujjwal Goel", role: "Executive", linkedinUrl: "#", image: "https://i.postimg.cc/FHBRBbBj/Ujjwal-goel.jpg" },
  { id: "cl-14", name: "Pranjal Dubey", role: "PRO", linkedinUrl: "#", image: "https://i.postimg.cc/c4drgL30/IMG-20250405-155938248-HDR-AE-Pranjal-Dubey.jpg" },
  { id: "cl-15", name: "Prateek Dixit", role: "PRO", linkedinUrl: "#", image: "https://i.postimg.cc/kX7B6gS4/retouch-2025091801391880-Prateek-Dixit.jpg" },
];

export const departmentHeads: TeamMember[] = [
  { id: "dh-6", name: "Ashmit Kumar", role: "Head", department: "Technical", linkedinUrl: "#", image: "https://i.postimg.cc/7YXbgr1t/Ashmit-kumar.jpg" },
  { id: "dh-7", name: "Nikhil Gaurav", role: "Co-Head", department: "Technical", linkedinUrl: "#", image: "https://i.postimg.cc/28T34Nds/Whats-App-Image-2026-03-15-at-8-24-14-PM.jpg" },
  { id: "dh-13", name: "Nilisha Garg", role: "Co-Head", department: "Club Out Reach", linkedinUrl: "#", image: "https://i.postimg.cc/SKYsFXBg/IMG-20260209-200539-Nilisha-Garg.jpg" },

];

export const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Ritesh Yadav ", role: "Member", department: "Event Management", image: "https://i.postimg.cc/rpRmX06q/Screenshot-20260211-122256-Ritesh-Yadav.jpg", objectPosition: "center 20%" },
  { id: "tm-2", name: "Sarthak Pandey", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/858C1pDN/Sarthak-pandey.jpg" },
  { id: "tm-25", name: "Arpit Yadav", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/wvKB6qHR/DSC-0270-DADDY-MUKAMBO.jpg" },
  { id: "tm-34", name: "Akshat Uniyal ", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/qR8vqPMt/IMG-20251121-231126-040-DUKEDAD-yt.jpg" },
  { id: "tm-3", name: "Gagan Kesarwani", role: "Member", department: "Design & Creatives", image: "https://i.postimg.cc/4dzxyDNz/IMG-3968-Original-Gagan.jpg" },

  { id: "tm-4", name: "Vishal Singh", role: "Member", department: "Public Relations", image: "https://i.postimg.cc/Bb4QKmXp/IMG-8148-vishal-singh.jpg" },
  { id: "tm-5", name: "Vansh Tyagi", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/L5261xn7/IMG-20251002-202703-557-Vansh-Tyagi.jpg" },
  // { id: "tm-7", name: "Krishna Tyagi ", role: "Member", department: "Event Management" },
  // { id: "tm-8", name: "Avika Tyagi", role: "Member", department: "Technical Team" },
  { id: "tm-9", name: "Harsh Kumar", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/KjfcrtTM/IMG-20251217-012622-Harsh-Kumar.jpg", objectPosition: "center 20%" },
  { id: "tm-10", name: "Aryan Saini", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/1RrzQ1dq/IMG-20250920-WA0072-Aryan-Saini.jpg" },
  { id: "tm-11", name: "Saanvi Singh ", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/zXdXyS5j/Snapchat-1913822228-Saanvi-Singh.jpg" },
  // { id: "tm-12", name: "Abhigyan Mittal", role: "Member", department: "Technical Team" },
  { id: "tm-13", name: "Anushka Chikara", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/65H58Lwg/In-Shot-20260210-110116514-Anushka-Chikara.jpg" },
  { id: "tm-14", name: "Samiksha Chaudhary", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/CLvLRHS0/IMG-1721-Samiksha-Choudhary.jpg", objectPosition: "center 20%" },
  { id: "tm-15", name: "Priyanshu Sharma", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/g2nc8X2d/IMG-7282-Priyanshu.jpg", objectPosition: "center 20%" },
  { id: "tm-16", name: "Prince Madhesiya", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/cLr1wgLJ/Whats-App-Image-2026-04-12-at-1-38-47-AM.jpg" },
  // { id: "tm-17", name: "Manvi", role: "Member", department: "Technical Team" },
  { id: "tm-18", name: "Ujjwal Vashistha ", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/bwsYkDwD/IMG20241031203128-2-Ujjwal-Vashishta.jpg", objectPosition: "center 20%" },
  // { id: "tm-19", name: "Nishka Tyagi", role: "Member", department: "Technical Team" },
  { id: "tm-20", name: "Nayan Yadav", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/nhCVBjhv/In-Shot-20251016-204307334-Nayan-Yadav.jpg" },
  // { id: "tm-21", name: "Navya Swami ", role: "Member", department: "Technical Team" },
  { id: "tm-22", name: "Omansh Arora", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/P59X4XCC/IMG-20260206-151852-Omansh-Arora.jpg" },
  { id: "tm-23", name: "Pushkar Tiwari", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/nhgFkFXB/IMG-20251116-012717247-SORA.jpg" },
  { id: "tm-24", name: "Rajnikant", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/rw3VJVDh/Whats-App-Image-2026-04-09-at-3-14-33-AM.jpg" },
  { id: "tm-26", name: "Akriti Singh", role: "Member", department: "Technical Team", image: "https://i.postimg.cc/FH8rZrY2/IMG-20260209-200629-Akriti-Singh.jpg" },
  { id: "tm-27", name: "Archita Prajapati", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/xdm0pwm5/Whats-App-Image-2026-03-25-at-6-33-22-PM.jpg" },
  // { id: "tm-28", name: "Adhiya Jha", role: "Member", department: "Content & Social Media" },
  { id: "tm-29", name: "Paridhi Sharma", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/k5SnY0SY/Screenshot-20260209-195418-Paridhi-Sharma.jpg" },
  // { id: "tm-30", name: "Anshit Sharma", role: "Member", department: "Content & Social Media" },
  { id: "tm-31", name: "Ayush Bisht", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/wBN64CJK/IMG-20260128-185253-613-Ayush-Bisht.jpg" },
  { id: "tm-32", name: "Navya", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/g0hYtCRP/Whats-App-Image-2026-04-10-at-3-35-24-PM.jpg" },
  { id: "tm-33", name: "Saizal Verma", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/JhX1YfJ7/IMG-20260130-235312-SAIZAL-VERMA.jpg" },
  { id: "tm-35", name: "Pranav Tyagi", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/Y9wt5df2/DSC-3006-PRANAV-TYAGI.jpg" },
  { id: "tm-36", name: "Aditya Chauhan", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/k4d70TF2/me-ADITYA-CHAUHAN.jpg", objectPosition: "center 20%" },
  { id: "tm-38", name: "Aakriti Chaudhary ", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/PxkdgSzY/IMG-20260206-WA0002-Aakriti-Chaudhary.jpg" },
  // { id: "tm-39", name: "Kanak", role: "Member", department: "Content & Social Media" },
  { id: "tm-40", name: "Astha Sharma", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/G2JbdvqD/IMG-20260209-200528-Aastha-Sharma.jpg" },
  { id: "tm-41", name: "Abhishek Gupta", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/Qtkjhc0q/IMG20250928175653-Abhishek-Gupta.jpg" },
  { id: "tm-42", name: "Nikunj Upadhyay", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/Hx4TdbBh/20260204194806580-Nikunj-Upadhayay.jpg" },
  { id: "tm-43", name: "Adiya", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/nzYnpq3b/Whats-App-Image-2026-03-25-at-6-33-39-PM.jpg" },
  // { id: "tm-44", name: "Avika Singh", role: "Member", department: "Content & Social Media" },
  { id: "tm-45", name: "Apoorva Singhal ", role: "Member", department: "Content & Social Media", image: "https://i.postimg.cc/nr3ZQp8Y/IMG-20251014-211421-2-Apoorva-Singhal.jpg" },
  { id: "tm-46", name: "Naman Walecha", role: "Member" },

];
