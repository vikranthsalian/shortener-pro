import { GOOGLE_ADSENSE_CLIENT_ID, isGoogleAds } from "@/lib/ads-config"

export function GoogleAdsMeta() {
  if (!isGoogleAds) return null
  return <meta name="google-adsense-account" content="ca-pub-3042492065432652" />
}

export function GoogleAdsScript() {
  if (!isGoogleAds || !GOOGLE_ADSENSE_CLIENT_ID) return null
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  )
}
