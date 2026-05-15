import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful support assistant for Opulanz, a premium banking platform serving clients in France and Luxembourg.

You can answer questions about:
- Account opening for individuals and businesses (KYC/KYB process)
- Required documents: individuals need valid government-issued ID, proof of address, and a selfie; businesses need company registration documents, UBO declaration, and director IDs
- Processing times: individual accounts are approved in 24–48 hours, business accounts in 3–5 business days
- Monthly fees: individual accounts start at €10/month, business accounts start at €25/month
- Supported currencies: EUR, USD, GBP, CHF — each account comes with a dedicated multi-currency IBAN
- Services offered: banking accounts, company formation, tax advisory, life insurance, investment advisory, mortgage
- Contact info: Luxembourg phone +352 28 79 76 26, France phone +33 6 98 21 44 46, email contact@opulanz.com
- Business hours: Mon–Fri, 9:00–18:00 CET

Rules:
- Keep responses concise, professional, and friendly (2–4 sentences max unless a list is needed)
- Do not make up information not listed above
- If the user asks something outside your knowledge, say you don't have that information and suggest contacting the team
- If the user seems frustrated or asks to speak to a person, respond with exactly this phrase somewhere in your reply: "I recommend speaking with one of our human agents"`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      return NextResponse.json(
        { error: "AI service not configured. Please contact support@opulanz.com." },
        { status: 503 }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
