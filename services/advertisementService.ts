import { apiService } from "@/services/api";

export interface PublicAdvertisementItem {
  id: string;
  title: string;
  content: string;
  advertisementType: "banner" | "sidebar" | "popup";
  imageUrl: string;
  startDate?: string;
  endDate?: string;
  vendorName: string;
  vendorCategory?: string;
  vendorLogoUrl?: string;
}

interface PublicAdvertisementsResponse {
  success: boolean;
  message?: string;
  advertisements?: PublicAdvertisementItem[];
  data?: {
    advertisements?: PublicAdvertisementItem[];
  };
}

interface RawPublicAdvertisementItem {
  id?: string;
  _id?: string;
  title?: string;
  content?: string;
  advertisementType?: "banner" | "sidebar" | "popup";
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  vendorName?: string;
  vendorCategory?: string;
  vendorLogoUrl?: string;
  vendor?: {
    name?: string;
    vendorInfo?: {
      logoUrl?: string;
    };
    vendorApplication?: {
      business?: {
        businessCategory?: string;
      };
      documents?: {
        logoUrl?: string;
      };
    };
    profileImage?: string;
  };
}

class AdvertisementService {
  async getPublicActiveAdvertisements(): Promise<PublicAdvertisementItem[]> {
    const response = await apiService.get<PublicAdvertisementsResponse>(
      "/advertisements/public/active",
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch advertisements");
    }

    const rawAdvertisements: RawPublicAdvertisementItem[] =
      response.advertisements || response.data?.advertisements || [];

    return rawAdvertisements
      .map((item) => {
        const id = String(item.id || item._id || "").trim();
        if (!id) return null;

        return {
          id,
          title: String(item.title || "Advertisement").trim(),
          content: String(item.content || "Tap to view more details").trim(),
          advertisementType: item.advertisementType || "banner",
          imageUrl: String(item.imageUrl || "").trim(),
          startDate: item.startDate,
          endDate: item.endDate,
          vendorName:
            String(item.vendorName || item.vendor?.name || "Verified Vendor").trim(),
          vendorCategory: item.vendorCategory || item.vendor?.vendorApplication?.business?.businessCategory,
          vendorLogoUrl:
            String(
              item.vendorLogoUrl ||
                item.vendor?.vendorInfo?.logoUrl ||
                item.vendor?.vendorApplication?.documents?.logoUrl ||
                item.vendor?.profileImage ||
                "",
            ).trim() || undefined,
        } as PublicAdvertisementItem;
      })
      .filter((item): item is PublicAdvertisementItem => Boolean(item));
  }
}

export const advertisementService = new AdvertisementService();
