export type AdsProvider = "meta" | "google" | "none"

// Set NEXT_PUBLIC_ADS_PROVIDER to "meta", "google" or "none". Defaults to "meta".
const raw = (process.env.NEXT_PUBLIC_ADS_PROVIDER || "meta").toLowerCase()

export const ADS_PROVIDER: AdsProvider = raw === "google" || raw === "none" ? raw : "meta"

export const isMetaAds = ADS_PROVIDER === "meta"
export const isGoogleAds = ADS_PROVIDER === "google"

export const GOOGLE_ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
export const GOOGLE_ADSENSE_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
export const META_PLACEMENT_ID = process.env.NEXT_PUBLIC_META_PLACEMENT_ID
