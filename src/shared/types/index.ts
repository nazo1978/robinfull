export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  countdownEndsAt?: Date;
  hasCountdown?: boolean;
  rating?: number;
  numReviews?: number;
  featured?: boolean;
  details?: {
    specifications: Array<{ name: string; value: string }>;
    features: string[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionBid {
  id: string;
  user: User;
  product: Product;
  amount: number;
  createdAt: Date;
}

export interface Auction {
  id: string;
  product: Product;
  startingPrice: number;
  currentPrice: number;
  minBidIncrement: number;
  reservePrice?: number;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
  bids: AuctionBid[];
  highestBidder?: User;
}