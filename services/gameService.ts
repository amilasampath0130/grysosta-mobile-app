import { apiService } from './apiService';

export interface TapCoinResponse {
  success: boolean;
  points?: number;
  totalPoints?: number;
  message?: string;
  nextAvailableTime?: string;
  prizeEarned?: boolean;
  prizeName?: string;
}

export interface PointsResponse {
  success: boolean;
  totalPoints: number;
  lifetimePoints: number;
  consecutiveDays: number;
}

export interface TapStatusResponse {
  success: boolean;
  canTap: boolean;
  nextAvailableTime?: string;
  hoursUntilNextTap?: number;
}

class GameService {
  async getUserPoints(): Promise<PointsResponse> {
    return apiService.get<PointsResponse>('/game/points');
  }

  async checkTapAvailability(): Promise<TapStatusResponse> {
    return apiService.get<TapStatusResponse>('/game/can-tap');
  }

  async tapCoin(coinIndex: number): Promise<TapCoinResponse> {
    return apiService.post<TapCoinResponse>('/game/tap-coin', {
      coinIndex,
    });
  }
}

export const gameService = new GameService();