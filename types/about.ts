export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: any;
  social?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}