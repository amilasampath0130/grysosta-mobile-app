export interface Vendor {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export interface RewardTemplate {
  id: string;
  title: string;
  vendor: string;
  expiryDays: number;
}

export const MVP_VENDORS: Vendor[] = [
  {
    id: "mcd",
    name: "McDonald's",
    category: "Fast Food",
    imageUrl: "https://logo.clearbit.com/mcdonalds.com",
  },
  {
    id: "kfc",
    name: "KFC",
    category: "Fast Food",
    imageUrl: "https://logo.clearbit.com/kfc.com",
  },
  {
    id: "pizza",
    name: "Pizza Hut",
    category: "Restaurant",
    imageUrl: "https://logo.clearbit.com/pizzahut.com",
  },
  {
    id: "subway",
    name: "Subway",
    category: "Restaurant",
    imageUrl: "https://logo.clearbit.com/subway.com",
  },
  {
    id: "starbucks",
    name: "Starbucks",
    category: "Cafe",
    imageUrl: "https://logo.clearbit.com/starbucks.com",
  },
  {
    id: "dominos",
    name: "Domino's",
    category: "Restaurant",
    imageUrl: "https://logo.clearbit.com/dominos.com",
  },
  {
    id: "burger",
    name: "Burger King",
    category: "Fast Food",
    imageUrl: "https://logo.clearbit.com/bk.com",
  },
  {
    id: "wendys",
    name: "Wendy's",
    category: "Fast Food",
    imageUrl: "https://logo.clearbit.com/wendys.com",
  },
];

export const MVP_REWARDS: RewardTemplate[] = [
  {
    id: "r1",
    title: "Buy One Get One Free",
    vendor: "McDonald's",
    expiryDays: 7,
  },
  {
    id: "r2",
    title: "Free Medium Fries",
    vendor: "KFC",
    expiryDays: 5,
  },
  {
    id: "r3",
    title: "20% Off Your Next Order",
    vendor: "Pizza Hut",
    expiryDays: 10,
  },
  {
    id: "r4",
    title: "Free Drink Upgrade",
    vendor: "Subway",
    expiryDays: 4,
  },
  {
    id: "r5",
    title: "Free Dessert",
    vendor: "Starbucks",
    expiryDays: 6,
  },
];
