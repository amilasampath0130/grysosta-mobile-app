import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeDeleteItem, safeGetItem, safeSetItem } from "@/utils/secureStorage";

export interface RewardItem {
  id: string;
  title: string;
  vendor: string;
  wonAt: string;
  expiresAt: string;
  isRedeemed: boolean;
}

interface GameplayState {
  selectedVendorIds: string[];
  favoriteVendorIds: string[];
  savedRewards: RewardItem[];
  rewardHistory: RewardItem[];
  setSelectedVendors: (vendorIds: string[]) => void;
  toggleFavoriteVendor: (vendorId: string) => void;
  saveReward: (reward: RewardItem) => void;
  addRewardToHistory: (reward: RewardItem) => void;
  redeemReward: (rewardId: string) => void;
  clearSavedRewards: () => void;
}

const zustandStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await safeGetItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await safeSetItem(name, value);
    } catch {
      // ignore storage errors in MVP state updates
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await safeDeleteItem(name);
    } catch {
      // ignore storage errors in MVP state updates
    }
  },
};

export const useGameplayStore = create<GameplayState>()(
  persist(
    (set, get) => ({
      selectedVendorIds: [],
      favoriteVendorIds: [],
      savedRewards: [],
      rewardHistory: [],
      setSelectedVendors: (vendorIds) => set({ selectedVendorIds: vendorIds }),
      toggleFavoriteVendor: (vendorId) => {
        const favorites = get().favoriteVendorIds;
        const isFavorite = favorites.includes(vendorId);

        set({
          favoriteVendorIds: isFavorite
            ? favorites.filter((id) => id !== vendorId)
            : [...favorites, vendorId],
        });
      },
      saveReward: (reward) => {
        const existing = get().savedRewards.some((item) => item.id === reward.id);
        if (existing) {
          return;
        }

        set((state) => ({
          savedRewards: [reward, ...state.savedRewards],
        }));
      },
      addRewardToHistory: (reward) => {
        set((state) => ({
          rewardHistory: [reward, ...state.rewardHistory],
        }));
      },
      redeemReward: (rewardId) => {
        set((state) => ({
          savedRewards: state.savedRewards.map((reward) =>
            reward.id === rewardId ? { ...reward, isRedeemed: true } : reward,
          ),
        }));
      },
      clearSavedRewards: () => set({ savedRewards: [] }),
    }),
    {
      name: "gameplay-store",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        selectedVendorIds: state.selectedVendorIds,
        favoriteVendorIds: state.favoriteVendorIds,
        savedRewards: state.savedRewards,
        rewardHistory: state.rewardHistory,
      }),
    },
  ),
);
