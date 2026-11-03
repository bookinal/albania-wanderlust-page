/**
 * WhatsApp Business Cloud API (Meta) helpers.
 *
 * Messages are sent from the platform's own WhatsApp Business number. Messages
 * that start a conversation must use a template approved by Meta, so every
 * notification here is a template message.
 *
 * Secrets (Supabase > Edge Functions > Secrets):
 *   WHATSAPP_ACCESS_TOKEN     permanent System User token with whatsapp_business_messaging
 *   WHATSAPP_PHONE_NUMBER_ID  "Phone number ID" of the sending number (not the number itself)
 * Optional:
 *   WHATSAPP_GRAPH_VERSION    Graph API version, default v25.0
 */

const GRAPH_VERSION = Deno.env.get("WHATSAPP_GRAPH_VERSION") || "v25.0";

/** Country code used for local numbers written without one (e.g. "069 123 4567"). */
const DEFAULT_COUNTRY_CODE = "355"; // Albania

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
}

/** Null when WhatsApp is not set up yet (the app keeps working, emails only). */
export const getWhatsAppConfig = (): WhatsAppConfig | null => {
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  return accessToken && phoneNumberId ? { accessToken, phoneNumberId } : null;
};

/**
 * Digits-only international number ("+355 69 123 4567" -> "355691234567"),
 * or null if it can't be one. Same rules as the app's wa.me links.
 */
export const toWhatsAppNumber = (phone?: string | null): string | null => {
  if (!phone) return null;
  const raw = phone.trim();
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    // already international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
};

/**
 * Template variables may not contain new lines, tabs or more than 4 spaces in
 * a row, and may not be empty (Meta rejects the whole message otherwise).
 */
const toTemplateText = (value: string): string => {
  const text = value.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
  return (text || "-").slice(0, 1000);
};

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/** Sends an approved template with text variables {{1}}, {{2}}… in its body. */
export const sendWhatsAppTemplate = async (
  config: WhatsAppConfig,
  message: {
    to: string;
    template: string;
    language: string;
    bodyParams: string[];
  },
): Promise<WhatsAppSendResult> => {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: message.to,
        type: "template",
        template: {
          name: message.template,
          language: { code: message.language },
          components: [
            {
              type: "body",
              parameters: message.bodyParams.map((text) => ({
                type: "text",
                text: toTemplateText(text),
              })),
            },
          ],
        },
      }),
    },
  );

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = result?.error;
    return {
      ok: false,
      error: error
        ? `${error.code ?? response.status}: ${error.error_user_msg || error.message}`
        : `HTTP ${response.status}`,
    };
  }
  return { ok: true, messageId: result?.messages?.[0]?.id };
};
