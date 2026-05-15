export type UserRole = "farmer" | "buyer" | "transport"

export interface Profile {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  location?: string
  business_name?: string
  business_type?: string
  contact_name?: string
  created_at: string
}

export interface Listing {
  id: string
  farmer_id: string
  product: string
  emoji: string
  quantity: number
  price_per_kg: number
  available_from: string
  notes?: string
  status: "active" | "sold" | "expired"
  created_at: string
  farmer?: Profile
}

export interface Order {
  id: string
  buyer_id: string
  listing_id: string
  farmer_id: string
  driver_id?: string
  quantity: number
  total_price: number
  delivery_date: string
  delivery_address: string
  note?: string
  status: "pending" | "confirmed" | "declined" | "in-transit" | "delivered"
  created_at: string
  buyer?: Profile
  farmer?: Profile
  driver?: Profile
  listing?: Listing
}

export interface ProductOption {
  name: string
  emoji: string
}

export const PRODUCTS: ProductOption[] = [
  { name: "Teff", emoji: "🌾" },
  { name: "Coffee", emoji: "☕" },
  { name: "Tomatoes", emoji: "🍅" },
  { name: "Onions", emoji: "🧅" },
  { name: "Potatoes", emoji: "🥔" },
  { name: "Peppers", emoji: "🌶️" },
  { name: "Cabbage", emoji: "🥬" },
  { name: "Carrots", emoji: "🥕" },
  { name: "Maize", emoji: "🌽" },
  { name: "Wheat", emoji: "🌾" },
  { name: "Barley", emoji: "🌾" },
  { name: "Sorghum", emoji: "🌾" },
  { name: "Chickpeas", emoji: "🫘" },
  { name: "Lentils", emoji: "🫘" },
  { name: "Honey", emoji: "🍯" },
  { name: "Eggs", emoji: "🥚" },
  { name: "Milk", emoji: "🥛" },
  { name: "Butter", emoji: "🧈" },
]

export const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel",
  "Cafe",
  "Catering",
  "Food Processing",
  "Supermarket",
  "Wholesaler",
  "Other",
]

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Dire Dawa",
  "Oromia",
  "Amhara",
  "Tigray",
  "SNNPR",
  "Sidama",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
]
