import { apiService } from "./api";

type RewardStatus = "won" | "saved" | "redeemed" | "expired";
type CouponStatus = "active" | "used" | "expired";

export interface SelectionStatusResponse {
  success: boolean;
  hasActiveSelection: boolean;
  message?: string;
  selection?: {
    selectedVendors: string[];
    selectedAt: string;
    expiresAt: string;
  };
  cooldown?: {
    canTap: boolean;
    nextAvailableAt: string | null;
    msLeft: number;
    display: string;
  };
}

export interface SaveSelectionResponse {
  success: boolean;
  message: string;
  selection: {
    selectedVendors: string[];
    selectedAt: string;
    expiresAt: string;
  };
}

export interface TapCoinResponse {
  success: boolean;
  message: string;
  code?: string;
  reward?: {
    id: string;
    status: RewardStatus;
    createdAt: string;
    expiresAt: string;
    offer: {
      id: string;
      title: string;
      discount: number;
      offerType: string;
      bannerUrl: string;
      vendorName: string;
    };
  };
  cooldown?: {
    msLeft: number;
    display: string;
    nextAvailableAt: string;
  };
}

export interface SaveRewardResponse {
  success: boolean;
  message: string;
  reward?: {
    id: string;
    status: RewardStatus;
    expiresAt: string;
  };
}

export interface RewardListItem {
  id: string;
  offerId?: string;
  status: RewardStatus;
  createdAt: string;
  expiresAt: string;
  savedAt?: string;
  redeemedAt?: string;
  offer: {
    title?: string;
    bannerUrl?: string;
    discount?: number;
    offerType?: string;
    validUntil?: string;
  };
}

export interface CouponListItem {
  id: string;
  rewardId: string;
  code: string;
  qrCode: string;
  isUsed: boolean;
  status: CouponStatus;
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
  offer: {
    id?: string;
    title?: string;
    bannerUrl?: string;
    discount?: number;
    offerType?: string;
  };
}

export interface RedeemRewardResponse {
  success: boolean;
  message: string;
  reward?: {
    id: string;
    status: RewardStatus;
    expiresAt: string;
  };
  coupon?: CouponListItem;
}

export interface RewardsResponse {
  success: boolean;
  rewards: {
    active: RewardListItem[];
    saved: RewardListItem[];
    expired: RewardListItem[];
    redeemed: RewardListItem[];
    all: RewardListItem[];
  };
}

export interface CouponsResponse {
  success: boolean;
  coupons: CouponListItem[];
}

export interface CoinSummary {
  balance: number;
  lifetimeCoins: number;
  ticketsEarned: number;
  progress: {
    current: number;
    target: number;
    remaining: number;
  };
  dailyTap: {
    canTap: boolean;
    lastTapTime: string | null;
    nextAvailableAt: string | null;
  };
  lastClaim: {
    claimedAt: string;
    coinsWon: number;
    selectedCoin: number | null;
    ticketsAwarded: number;
  } | null;
}

export interface CoinStatusResponse {
  success: boolean;
  message?: string;
  summary: CoinSummary;
}

export interface ClaimDailyCoinsResponse {
  success: boolean;
  message: string;
  code?: string;
  selectedCoin?: number;
  coinsWon?: number;
  ticketsAwarded?: number;
  summary: CoinSummary;
}

class GameService {
  async getVendorSelectionStatus(): Promise<SelectionStatusResponse> {
    return apiService.get<SelectionStatusResponse>("/game/vendor-selection");
  }

  async getCoinStatus(): Promise<CoinStatusResponse> {
    return apiService.get<CoinStatusResponse>("/game/coins");
  }

  async claimDailyCoins(selectedCoin: number): Promise<ClaimDailyCoinsResponse> {
    return apiService.post<ClaimDailyCoinsResponse>("/game/coins/claim", {
      selectedCoin,
    });
  }

  async saveVendorSelection(
    selectedVendors: string[],
  ): Promise<SaveSelectionResponse> {
    return apiService.post<SaveSelectionResponse>("/game/vendor-selection", {
      selectedVendors,
    });
  }

  async tapCoin(): Promise<TapCoinResponse> {
    return apiService.post<TapCoinResponse>("/game/tap");
  }

  async saveReward(rewardId: string): Promise<SaveRewardResponse> {
    return apiService.post<SaveRewardResponse>(`/game/rewards/${rewardId}/save`);
  }

  async redeemReward(rewardId: string): Promise<RedeemRewardResponse> {
    return apiService.post<RedeemRewardResponse>(
      `/game/rewards/${rewardId}/redeem`,
    );
  }

  async getMyRewards(): Promise<RewardsResponse> {
    return apiService.get<RewardsResponse>("/game/rewards");
  }

  async getMyCoupons(): Promise<CouponsResponse> {
    return apiService.get<CouponsResponse>("/game/coupons");
  }
}

export const gameService = new GameService();