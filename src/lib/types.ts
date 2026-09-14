import type { ListingKind } from "./constants";

export type { ListingKind };

export type FeedCard = {
  kind: ListingKind;
  id: string;
  userId: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  category: string;
  type: string;
  pricingType: string | null;
  price: number | null;
  deposit: number | null;
  status: string;
  images: string[];
  /** Best displayable cover: Blob HTTPS, then scontent/fbcdn, never facebook.com/photo HTML. */
  cover: string | null;
  tasks: string[];
  district: string;
  lat: number | null;
  lng: number | null;
  condition: string | null;
  sourceLanguage: "en" | "th";
  availableTimes: string | null;
  locationRadius: number | null;
  createdAt: string;
  ownerName: string;
  ownerAvatar: string | null;
  ownerVerified: boolean;
  ownerLocation: string | null;
  ratingAvg: number | null;
  reviewCount: number;
  facebookUrl: string | null;
  facebookId: string | null;
  facebookName: string | null;
  facebookPhoto: string | null;
};

export type Profile = {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  preferredLanguage: "en" | "th";
  isVerified: boolean;
  bioTh: string | null;
  bioEn: string | null;
  createdAt: string;
  ratingAvg: number | null;
  reviewCount: number;
  itemCount: number;
  serviceCount: number;
  isAdmin: boolean;
  facebookUrl: string | null;
  facebookName: string | null;
  facebookPhoto: string | null;
};

export type Conversation = {
  id: string;
  requesterId: string;
  providerId: string;
  itemId: string | null;
  serviceId: string | null;
  createdAt: string;
  listingTitleTh: string;
  listingTitleEn: string;
  listingImage: string | null;
  listingKind: ListingKind | null;
  otherName: string;
  otherAvatar: string | null;
  lastText: string | null;
  lastAt: string | null;
  unread: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  textOriginal: string;
  textTranslated: string | null;
  originalLanguage: "en" | "th";
  createdAt: string;
};

export type Booking = {
  id: string;
  requesterId: string;
  providerId: string;
  itemId: string | null;
  serviceId: string | null;
  conversationId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalPrice: number | null;
  createdAt: string;
  listingTitleTh: string;
  listingTitleEn: string;
  otherName: string;
};

export type Review = {
  id: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  commentTh: string | null;
  commentEn: string | null;
  sourceLanguage: "en" | "th";
  createdAt: string;
  reviewerName: string;
};
