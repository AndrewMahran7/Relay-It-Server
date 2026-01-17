import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface AnalyzeRequest {
  image: string;
  sessionId?: string;
}

interface EntityOutput {
  type: 'hotel';
  name: string | null;
  price: string | null;
  rating: string | null;
  location: string | null;
  url: string | null;
}

interface AnalyzeResponse {
  rawText: string;
  entity: EntityOutput;
}

interface GeminiResponse {
  rawText: string;
  entity: EntityOutput;
}

const MOCK_RESPONSE: AnalyzeResponse = {
  rawText: "Hotel Deluxe\n5 Star Rating\n$299/night\nSan Francisco, CA\nwww.hoteldeluxe.com",
  entity: {
    type: "hotel",
    name: "Hotel Deluxe",
    price: "$299/night",
    rating: "5 Star",
    location: "San Francisco, CA",
    url: "www.hoteldeluxe.com"
  }
};

async function callGemini(imageData: string): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return MOCK_RESPONSE;
  }

  // Strip data URL prefix if present
  const base64Data = imageData.includes(',') 
    ? imageData.split(',')[1] 
    : imageData;

  const prompt = `You are an OCR and entity extraction system. Analyze this screenshot image.

TASKS:
1. Extract ALL visible text via OCR (rawText field)
2. Identify the single most prominent hotel listing
3. If multiple hotels appear, choose the centermost or most visually emphasized one
4. Extract: name, price, rating, location, url

RULES:
- Return ONLY valid JSON
- No markdown, no explanations, no prose
- Missing fields must be null
- Type is always "hotel"

OUTPUT FORMAT:
{
  "rawText": "full ocr text here",
  "entity": {
    "type": "hotel",
    "name": "extracted name or null",
    "price": "extracted price or null",
    "rating": "extracted rating or null",
    "location": "extracted location or null",
    "url": "extracted url or null"
  }
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/png",
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('No content returned from Gemini');
  }

  let parsed: GeminiResponse;
  try {
    parsed = JSON.parse(textContent);
  } catch (e) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  // Validate and normalize entity
  const entity: EntityOutput = {
    type: 'hotel',
    name: parsed.entity?.name || null,
    price: parsed.entity?.price || null,
    rating: parsed.entity?.rating || null,
    location: parsed.entity?.location || null,
    url: parsed.entity?.url || null,
  };

  return {
    rawText: parsed.rawText || '',
    entity,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: 'Missing required field: image' },
        { status: 400 }
      );
    }

    const result = await callGemini(body.image);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
