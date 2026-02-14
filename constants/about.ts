import { Feature, TeamMember } from '@/types/about';
import { Images } from '@/assets/images/images';

export const ABOUT_FEATURES: Feature[] = [
  {
    id: '1',
    icon: 'game-controller',
    title: 'Interactive Games',
    description: 'Engaging crypto-themed games with real rewards'
  },
  {
    id: '2',
    icon: 'shield-checkmark',
    title: 'Secure Platform',
    description: 'Bank-level security for all your transactions'
  },
  {
    id: '3',
    icon: 'rocket',
    title: 'Moon Missions',
    description: 'Participate in exclusive token launches'
  },
  {
    id: '4',
    icon: 'people',
    title: 'Community Driven',
    description: 'Join our growing GRYSOSTA community'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'GRYSOSTA',
    role: 'Founder & CEO',
    image: Images.ceo
  },
  {
    id: '2',
    name: 'RMAS Rathnayake',
    role: ' Chief Operating Officer (COO)',
    image: Images.coo
  },
  {
    id: '3',
    name: 'Grysosta',
    role: 'Product Manager',
    image: Images.logo
  }
];

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/grysosta',
  discord: 'https://discord.gg/grysosta',
  telegram: 'https://t.me/grysosta',
  github: 'https://github.com/grysosta'
} as const;