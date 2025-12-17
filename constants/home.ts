import { GameItem, NewsItem } from '@/types/home';
import { Images } from '@/assets/images/images';

export const GAMES_DATA: GameItem[] = [
  {
    id: '1',
    title: 'Spin & Win',
    image: Images.logo,
    route: '/(Game)/spinGame'
  },
  {
    id: '2', 
    title: 'Touch & Win',
    image: Images.logo,
    route: '/(Game)/gameHome'
  }
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin',
    image: Images.logo
  },
  {
    id: '2',
    title: 'Grysosta', 
    image: Images.logo
  }
];