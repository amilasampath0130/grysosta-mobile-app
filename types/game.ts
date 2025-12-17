export interface Coin {
  id: string;
  index: number;
  isActive: boolean;
}

export interface GameHomeState {
  coins: Coin[];
  selectedCoin: number | null;
  isLoading: boolean;
  userPoints: number;
  lastTapTime: string | null;
  canTap: boolean;
}