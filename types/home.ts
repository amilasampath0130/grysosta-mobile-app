export interface GameItem {
  id: string;
  title: string;
  image: any;
  route?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  image: any;
  description?: string;
}

export interface HomeSectionProps {
  title: string;
  showSeeMore?: boolean;
  onSeeMorePress?: () => void;
}