import { apiService } from "./api";

export interface VendorListItem {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
  location?: string;
  businessType?: string;
  offering?: string;
  serviceArea?: string;
  operatingHours?: string;
}

interface ApprovedVendorsResponse {
  success: boolean;
  message?: string;
  vendors?: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    category?: string;
    location?: string;
    businessType?: string;
    offering?: string;
    serviceArea?: string;
    operatingHours?: string;
  }>;
}

class VendorService {
  async getApprovedVendors(): Promise<VendorListItem[]> {
    const response = await apiService.get<ApprovedVendorsResponse>(
      "/vendor/public/approved",
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch vendors");
    }

    return (response.vendors || []).map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      imageUrl: vendor.logoUrl,
      location: vendor.location,
      businessType: vendor.businessType,
      offering: vendor.offering,
      serviceArea: vendor.serviceArea,
      operatingHours: vendor.operatingHours,
    }));
  }
}

export const vendorService = new VendorService();
