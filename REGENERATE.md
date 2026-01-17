# Regenerate Endpoint Documentation

## Overview

The `/api/regenerate` endpoint analyzes an entire session/notebook containing multiple screenshots and produces session-level insights, including a summary, category, merged entities, and intelligent suggestions.

## Endpoint

```
POST /api/regenerate
```

**Base URL (Production):** `https://relay-that-backend-ibaiy8nho-andrewmahran7s-projects.vercel.app`

**Base URL (Local):** `http://localhost:3000`

---

## Purpose

Called whenever a session/notebook changes (screenshot added/removed). Does NOT analyze images directly - instead takes JSON outputs from `/api/analyze` plus optional previous session state.

**Key Features:**
- Maintains continuity using previous session context
- Merges and deduplicates entities across screenshots
- Provides intelligent suggestions (questions, rankings, next steps)
- Never restarts or drifts from established context

---

## Request

### Headers
```
Content-Type: application/json
```

### Body

```typescript
{
  sessionId: string;              // Required: session identifier
  previousSession?: {             // Optional: maintains continuity
    sessionSummary: string;
    sessionCategory: string;
    entities: Entity[];
  };
  screens: [                      // Required: all current screenshots
    {
      id: string;
      analysis: {                 // Full output from /api/analyze
        rawText: string;
        summary: string;
        category: string;
        entities: Entity[];
        suggestedNotebookTitle: string | null;
      }
    }
  ];
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | Unique session/notebook identifier |
| `previousSession` | object | No | Previous session state (if available) |
| `previousSession.sessionSummary` | string | Yes* | Previous summary |
| `previousSession.sessionCategory` | string | Yes* | Previous category |
| `previousSession.entities` | array | Yes* | Previous entities |
| `screens` | array | Yes | All current screenshots with analysis |
| `screens[].id` | string | Yes | Screenshot ID |
| `screens[].analysis` | object | Yes | Full AnalyzeResponse from `/api/analyze` |

*Required if `previousSession` is provided

---

## Response

### Success Response (200 OK)

```typescript
{
  sessionId: string;
  sessionSummary: string;
  sessionCategory: string;
  entities: Entity[];
  suggestedNotebookTitle: string | null;
  suggestions: Suggestion[];
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | string | Same session ID from request |
| `sessionSummary` | string | 1-3 sentence description of entire session |
| `sessionCategory` | string | Overall category for session |
| `entities` | array | Merged/deduplicated entities across all screens |
| `suggestedNotebookTitle` | string\|null | Suggested notebook title |
| `suggestions` | array | Intelligent suggestions (see below) |

---

## Suggestions

The `suggestions` array contains intelligent recommendations based on session analysis.

### Suggestion Types

#### 1. Question
Asks a clarifying question about what the user is optimizing for.

```typescript
{
  type: "question";
  text: string;
}
```

**Example:**
```json
{
  "type": "question",
  "text": "Are you prioritizing price or location for this trip?"
}
```

#### 2. Ranking
Proposes a ranking of entities by some basis (price, rating, value, etc.).

```typescript
{
  type: "ranking";
  basis: string;
  items: {
    entityTitle: string;
    reason: string;
  }[];
}
```

**Example:**
```json
{
  "type": "ranking",
  "basis": "value",
  "items": [
    {
      "entityTitle": "One&Only Palmilla",
      "reason": "Best balance of luxury amenities and beachfront location for the price"
    },
    {
      "entityTitle": "Las Ventanas al Paraíso",
      "reason": "All-inclusive convenience but higher cost"
    }
  ]
}
```

#### 3. Next Step
Suggests a concrete action the user could take.

```typescript
{
  type: "next-step";
  text: string;
}
```

**Example:**
```json
{
  "type": "next-step",
  "text": "Consider filtering to hotels with free cancellation policies."
}
```

---

## Complete Example

### Request

```bash
curl -X POST http://localhost:3000/api/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cabo-trip-2026",
    "previousSession": {
      "sessionSummary": "User is researching luxury hotels in Los Cabos for an upcoming trip.",
      "sessionCategory": "trip-planning",
      "entities": [
        {
          "type": "hotel",
          "title": "One&Only Palmilla",
          "attributes": {
            "location": "Los Cabos, Mexico",
            "price": "$850/night",
            "rating": "9.8 Exceptional"
          }
        }
      ]
    },
    "screens": [
      {
        "id": "screen-1",
        "analysis": {
          "rawText": "One&Only Palmilla, Los Cabos...",
          "summary": "Luxury beachfront hotel in Los Cabos",
          "category": "trip-planning",
          "entities": [
            {
              "type": "hotel",
              "title": "One&Only Palmilla",
              "attributes": {
                "location": "Los Cabos, Mexico",
                "price": "$850/night",
                "rating": "9.8 Exceptional"
              }
            }
          ],
          "suggestedNotebookTitle": "Los Cabos Hotels"
        }
      },
      {
        "id": "screen-2",
        "analysis": {
          "rawText": "Las Ventanas al Paraíso...",
          "summary": "All-inclusive luxury resort",
          "category": "trip-planning",
          "entities": [
            {
              "type": "hotel",
              "title": "Las Ventanas al Paraíso",
              "attributes": {
                "price": "$1,200/night",
                "rating": "9.6 Exceptional"
              }
            }
          ],
          "suggestedNotebookTitle": "Cabo Resorts"
        }
      },
      {
        "id": "screen-3",
        "analysis": {
          "rawText": "United Airlines UA 1234...",
          "summary": "Flight from SFO to Cabo",
          "category": "trip-planning",
          "entities": [
            {
              "type": "flight",
              "title": "UA 1234 SFO → SJD",
              "attributes": {
                "airline": "United Airlines",
                "price": "$450",
                "dates": "Feb 15-22"
              }
            }
          ],
          "suggestedNotebookTitle": "Cabo Trip"
        }
      }
    ]
  }'
```

### Response

```json
{
  "sessionId": "cabo-trip-2026",
  "sessionSummary": "User is planning a luxury trip to Los Cabos, comparing high-end beachfront resorts and securing flight options from San Francisco.",
  "sessionCategory": "trip-planning",
  "entities": [
    {
      "type": "hotel",
      "title": "One&Only Palmilla",
      "attributes": {
        "location": "Los Cabos, Mexico",
        "price": "$850/night",
        "rating": "9.8 Exceptional",
        "stars": "5"
      }
    },
    {
      "type": "hotel",
      "title": "Las Ventanas al Paraíso",
      "attributes": {
        "location": "Los Cabos, Mexico",
        "price": "$1,200/night",
        "rating": "9.6 Exceptional",
        "type": "All-inclusive"
      }
    },
    {
      "type": "flight",
      "title": "UA 1234 SFO → SJD",
      "attributes": {
        "airline": "United Airlines",
        "price": "$450",
        "dates": "Feb 15-22"
      }
    }
  ],
  "suggestedNotebookTitle": "Los Cabos Trip Planning 2026",
  "suggestions": [
    {
      "type": "question",
      "text": "Are you prioritizing all-inclusive convenience or à la carte luxury dining?"
    },
    {
      "type": "ranking",
      "basis": "value",
      "items": [
        {
          "entityTitle": "One&Only Palmilla",
          "reason": "Best balance of exceptional rating (9.8) and price ($850/night)"
        },
        {
          "entityTitle": "Las Ventanas al Paraíso",
          "reason": "All-inclusive convenience but premium pricing ($1,200/night)"
        }
      ]
    },
    {
      "type": "next-step",
      "text": "Add screenshots of activities or restaurants in Los Cabos to complete your trip planning."
    }
  ]
}
```

---

## Behavior Notes

### Continuity Maintenance
- Uses `previousSession` to avoid restarting the session idea
- Refines and expands rather than replacing the core concept
- Preserves established context across regenerations

### Entity Merging
- Intelligently deduplicates similar entities
- Preserves the most complete attribute sets
- Maintains entity relationships across screens

### Suggestion Generation
- Provides at least one suggestion when possible
- Questions focus on optimization priorities
- Rankings require multiple comparable entities
- Next steps suggest concrete, actionable improvements

### Error Handling
- Always returns valid JSON (never throws)
- Fallback response on API errors:
  ```json
  {
    "sessionId": "request-session-id",
    "sessionSummary": "",
    "sessionCategory": "other",
    "entities": [],
    "suggestedNotebookTitle": null,
    "suggestions": []
  }
  ```

---

## Testing

### Local Test Script

```bash
node test-regenerate.mjs
```

### Manual cURL Test

```bash
curl -X POST http://localhost:3000/api/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "screens": [
      {
        "id": "s1",
        "analysis": {
          "rawText": "Sample text",
          "summary": "A sample screenshot",
          "category": "other",
          "entities": [],
          "suggestedNotebookTitle": null
        }
      }
    ]
  }'
```

---

## Integration Guide

### Typical Flow

1. **User adds first screenshot**
   ```typescript
   // POST /api/analyze with screenshot
   const analysis1 = await analyzeScreenshot(imageData);
   
   // POST /api/regenerate without previousSession
   const session = await regenerate({
     sessionId: 'new-session',
     screens: [{ id: 'screen-1', analysis: analysis1 }]
   });
   ```

2. **User adds second screenshot**
   ```typescript
   // POST /api/analyze with new screenshot
   const analysis2 = await analyzeScreenshot(imageData2);
   
   // POST /api/regenerate WITH previousSession
   const updatedSession = await regenerate({
     sessionId: 'new-session',
     previousSession: {
       sessionSummary: session.sessionSummary,
       sessionCategory: session.sessionCategory,
       entities: session.entities
     },
     screens: [
       { id: 'screen-1', analysis: analysis1 },
       { id: 'screen-2', analysis: analysis2 }
     ]
   });
   ```

3. **User removes a screenshot**
   ```typescript
   // POST /api/regenerate with updated screens array
   const updatedSession = await regenerate({
     sessionId: 'new-session',
     previousSession: updatedSession,
     screens: [
       { id: 'screen-1', analysis: analysis1 }
       // screen-2 removed
     ]
   });
   ```

### Frontend Integration

```typescript
interface RegenerateClient {
  regenerate(request: RegenerateRequest): Promise<RegenerateResponse>;
}

const client: RegenerateClient = {
  async regenerate(request) {
    const response = await fetch('/api/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  }
};

// Usage
const result = await client.regenerate({
  sessionId: notebookId,
  previousSession: currentSession,
  screens: allScreensWithAnalysis
});

// Display suggestions
result.suggestions.forEach(suggestion => {
  if (suggestion.type === 'question') {
    showQuestion(suggestion.text);
  } else if (suggestion.type === 'ranking') {
    showRanking(suggestion.basis, suggestion.items);
  } else if (suggestion.type === 'next-step') {
    showActionSuggestion(suggestion.text);
  }
});
```

---

## Categories

Same categories as `/api/analyze`:

- **trip-planning** - Travel, hotels, flights, activities
- **shopping** - Products, comparisons, reviews
- **job-search** - Job postings, applications, company research
- **research** - Articles, documentation, learning materials
- **content-writing** - Drafts, notes, writing tools
- **productivity** - Tasks, calendars, project management
- **other** - Everything else

---

## CORS

Cross-origin requests are allowed:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Performance

- **Runtime:** Edge (Vercel Edge Functions)
- **Model:** Google Gemini 2.5 Flash
- **Typical Response Time:** 1-3 seconds
- **No Images Processed:** Only text analysis, very efficient
