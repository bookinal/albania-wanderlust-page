import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ============================================================================
// ENVIRONMENT VARIABLES & CONSTANTS
// ============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_BASE = "https://api.resend.com";
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 100; // requests per window per user

// ============================================================================
// TYPES
// ============================================================================

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  userId?: string;
  tags?: Record<string, string>;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode: number;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
  };
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email format using RFC 5322 simplified regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email request body
 */
function validateEmailRequest(payload: unknown): {
  valid: boolean;
  error?: string;
  data?: EmailRequest;
} {
  // Type guard
  if (typeof payload !== "object" || payload === null) {
    return {
      valid: false,
      error: "Invalid request body. Expected JSON object.",
    };
  }

  const req = payload as Record<string, unknown>;

  // Validate required fields
  if (!req.to || !req.subject || !req.html) {
    return {
      valid: false,
      error: "Missing required fields: to, subject, html",
    };
  }

  // Validate email addresses
  const recipients = Array.isArray(req.to) ? req.to : [req.to];
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return {
      valid: false,
      error: "'to' must be a non-empty email or array of emails",
    };
  }

  for (const email of recipients) {
    if (typeof email !== "string" || !isValidEmail(email)) {
      return { valid: false, error: `Invalid email address: ${email}` };
    }
  }

  // Validate strings
  if (typeof req.subject !== "string" || req.subject.trim().length === 0) {
    return { valid: false, error: "'subject' must be a non-empty string" };
  }

  if (typeof req.html !== "string" || req.html.trim().length === 0) {
    return { valid: false, error: "'html' must be a non-empty string" };
  }

  // Validate optional fields
  if (req.text !== undefined && typeof req.text !== "string") {
    return { valid: false, error: "'text' must be a string" };
  }

  if (req.replyTo !== undefined) {
    if (typeof req.replyTo !== "string" || !isValidEmail(req.replyTo)) {
      return { valid: false, error: "Invalid 'replyTo' email address" };
    }
  }

  if (req.from !== undefined && typeof req.from !== "string") {
    return { valid: false, error: "'from' must be a string" };
  }

  if (req.tags !== undefined && typeof req.tags !== "object") {
    return { valid: false, error: "'tags' must be an object" };
  }

  return {
    valid: true,
    data: {
      to: recipients.length === 1 ? recipients[0] : recipients,
      subject: req.subject as string,
      html: req.html as string,
      text: req.text as string | undefined,
      replyTo: req.replyTo as string | undefined,
      from: req.from as string | undefined,
      templateId: req.templateId as string | undefined,
      templateData: req.templateData as Record<string, unknown> | undefined,
      userId: req.userId as string | undefined,
      tags: req.tags as Record<string, string> | undefined,
    },
  };
}

// ============================================================================
// SECURITY & RATE LIMITING
// ============================================================================

// In-memory rate limiter (replace with Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now() / 1000; // Convert to seconds
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window or expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil(entry.resetAt - now),
    };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Verify JWT token from Authorization header
 */
async function verifyJWT(
  token: string,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    if (!token.startsWith("Bearer ")) {
      return { valid: false, error: "Invalid authorization header format" };
    }

    const jwtToken = token.replace("Bearer ", "");

    // Create Supabase client with service role key to verify JWT
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the token by attempting to use it
    const { data, error } = await supabase.auth.getUser(jwtToken);

    if (error || !data.user) {
      return { valid: false, error: "Invalid or expired token" };
    }

    return { valid: true, userId: data.user.id };
  } catch (err) {
    console.error("[Auth] JWT verification failed:", err);
    return { valid: false, error: "Token verification failed" };
  }
}

// ============================================================================
// RESEND INTEGRATION
// ============================================================================

/**
 * Send email via Resend API with retry logic
 */
async function sendEmailViaResend(
  emailData: EmailRequest,
  attempt = 1,
): Promise<ResendResponse> {
  const to = Array.isArray(emailData.to) ? emailData.to : [emailData.to];

  const payload = {
    from: "Bookinal <noreply@bookinal.com>",
    to: to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    reply_to: emailData.replyTo,
    tags: emailData.tags || {},
  };

  console.log(`[Resend] Sending email (attempt ${attempt}):`, {
    to: payload.to,
    subject: payload.subject,
    from: payload.from,
    reply_to: payload.reply_to,
    hasHtml: !!payload.html,
    htmlLength: payload.html?.length,
  });

  try {
    const response = await fetch(`${RESEND_API_BASE}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as ResendResponse;

    console.log(`[Resend] Response (attempt ${attempt}):`, {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || JSON.stringify(data);
      console.error(`[Resend] Error (attempt ${attempt}):`, errorMessage);

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        console.log(`[Resend] Retrying... (${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return sendEmailViaResend(emailData, attempt + 1);
      }

      return {
        error: {
          message: errorMessage,
        },
      };
    }

    console.log(`[Resend] ✅ Email sent successfully:`, data.id);
    return {
      id: data.id,
    };
  } catch (err) {
    console.error(`[Resend] Network error (attempt ${attempt}):`, err);

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return sendEmailViaResend(emailData, attempt + 1);
    }

    return {
      error: {
        message: `Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
      },
    };
  }
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Log email events to Supabase (optional)
 */
async function logEmailEvent(
  supabaseUrl: string,
  serviceRoleKey: string,
  event: {
    userId?: string;
    recipient: string;
    subject: string;
    status: "sent" | "failed";
    messageId?: string;
    error?: string;
  },
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    await supabase.from("email_logs").insert([
      {
        user_id: event.userId,
        recipient: event.recipient,
        subject: event.subject,
        status: event.status,
        message_id: event.messageId,
        error: event.error,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    // Log error but don't fail the email sending
    console.error("[Logging] Failed to log email event:", err);
  }
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
});

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  console.log(`[Email] Received ${req.method} request`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: getCorsHeaders(),
    });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        },
      },
    );
  }

  try {
    // Check environment variables
    if (!RESEND_API_KEY) {
      console.error("[Email] Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Service configuration error: Missing RESEND_API_KEY",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        },
      );
    }

    // Parse request body
    let payload: unknown;
    try {
      payload = await req.json();
      console.log("[Email] Parsed request payload:", {
        hasTo: !!(payload as any)?.to,
        hasSubject: !!(payload as any)?.subject,
        hasHtml: !!(payload as any)?.html,
        htmlLength: (payload as any)?.html?.length,
      });
    } catch (parseError) {
      console.error("[Email] JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        },
      );
    }

    // Validate request
    const validation = validateEmailRequest(payload);
    if (!validation.valid) {
      console.error("[Email] Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        },
      );
    }

    const emailData = validation.data!;

    // Rate limiting (per user or IP)
    const identifier =
      emailData.userId || req.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitCheck = checkRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      console.warn("[Email] Rate limit exceeded for:", identifier);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded",
          statusCode: 429,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitCheck.retryAfter),
            ...getCorsHeaders(),
          },
        },
      );
    }

    // Optional: Verify JWT token if provided
    const authHeader = req.headers.get("authorization");
    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const jwtVerification = await verifyJWT(
        authHeader,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
      );
      if (!jwtVerification.valid) {
        console.warn("[Auth] Invalid token:", jwtVerification.error);
        // Continue anyway - allow unauthenticated requests for now
        // To enforce auth, uncomment the lines below:
        // return new Response(
        //   JSON.stringify({ success: false, error: jwtVerification.error }),
        //   { status: 401, headers: { "Content-Type": "application/json", ...getCorsHeaders() } }
        // );
      }
    }

    // Send email via Resend
    console.log(
      `[Email] Sending to ${Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to}`,
    );
    const resendResult = await sendEmailViaResend(emailData);

    if (resendResult.error) {
      const errorMessage = resendResult.error.message || "Failed to send email";
      console.error("[Email] Resend error:", errorMessage);

      // Log failed email
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const recipients = Array.isArray(emailData.to)
          ? emailData.to
          : [emailData.to];
        for (const recipient of recipients) {
          await logEmailEvent(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            userId: emailData.userId,
            recipient,
            subject: emailData.subject,
            status: "failed",
            error: errorMessage,
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage, // Return the actual Resend error
          statusCode: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        },
      );
    }

    // Log successful email
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && resendResult.id) {
      const recipients = Array.isArray(emailData.to)
        ? emailData.to
        : [emailData.to];
      for (const recipient of recipients) {
        await logEmailEvent(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          userId: emailData.userId,
          recipient,
          subject: emailData.subject,
          status: "sent",
          messageId: resendResult.id,
        });
      }
    }

    console.log("[Email] ✅ Email sent successfully:", resendResult.id);

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendResult.id,
        statusCode: 200,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        },
      },
    );
  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Internal server error: ${err instanceof Error ? err.message : "Unknown error"}`,
        statusCode: 500,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        },
      },
    );
  }
});
