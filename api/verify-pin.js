/**
 * POST /api/verify-pin  { pin }  ->  { success, message }
 *
 * Vercel Serverless Function. The PIN lives in the ADMIN_PIN environment
 * variable (Vercel dashboard > Settings > Environment Variables) and is
 * NEVER shipped to browsers, unlike VITE_* variables.
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return res
      .status(500)
      .json({ success: false, message: "Server PIN not configured (set ADMIN_PIN)" });
  }
  const pin = req.body && req.body.pin;
  if (typeof pin === "string" && pin.length > 0 && pin === expected) {
    return res.status(200).json({ success: true, message: "OK" });
  }
  return res.status(401).json({ success: false, message: "Invalid access PIN" });
}
