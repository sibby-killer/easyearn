const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@easyearn.com";

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: "Your verification code - EasyEarn",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #6366f1;">EasyEarn</h2>
              <p>Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 8px; margin: 16px 0;">${code}</div>
              <p style="color: #71717a;">This code expires in 10 minutes.</p>
            </div>
          `,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  console.log(`[EMAIL FALLBACK] Verification code for ${email}: ${code}`);
  return false;
}
