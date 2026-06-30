export default function handler(req, res) {
  res.status(200).json({
    hasPixelId: !!process.env.META_PIXEL_ID,
    hasCapiToken: !!process.env.META_CAPI_ACCESS_TOKEN,
    hasHotmartHottok: !!process.env.HOTMART_HOTTOK,
    vercelEnv: process.env.VERCEL_ENV || null,
    deployedAt: new Date().toISOString(),
  })
}
