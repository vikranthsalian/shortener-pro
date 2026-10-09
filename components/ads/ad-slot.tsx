"use client"

import { useEffect } from "react"
import {
  GOOGLE_ADSENSE_AD_SLOT,
  GOOGLE_ADSENSE_CLIENT_ID,
  META_PLACEMENT_ID,
  isGoogleAds,
  isMetaAds,
} from "@/lib/ads-config"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/** Renders an ad unit for whichever provider is enabled via NEXT_PUBLIC_ADS_PROVIDER. */
export function AdSlot() {
  useEffect(() => {
    if (!isGoogleAds || !GOOGLE_ADSENSE_CLIENT_ID) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log("AdSense push failed:", err)
    }
  }, [])

  if (isGoogleAds && GOOGLE_ADSENSE_CLIENT_ID) {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={GOOGLE_ADSENSE_AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    )
  }

  if (isMetaAds && META_PLACEMENT_ID) {
    return <div className="fb-ad" data-placementid={META_PLACEMENT_ID} data-format="auto" data-testmode="false" />
  }

  return null
}
