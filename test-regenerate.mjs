// Test script for /api/regenerate endpoint
// Usage: node test-regenerate.mjs

console.log("Building test request for /api/regenerate...\n");

// Sample previous session state
const previousSession = {
  sessionSummary: "User is researching luxury hotels in Los Cabos for an upcoming trip.",
  sessionCategory: "trip-planning",
  entities: [
    {
      type: "hotel",
      title: "One&Only Palmilla",
      attributes: {
        location: "Los Cabos, Mexico",
        price: "$850/night",
        rating: "9.8 Exceptional"
      }
    }
  ]
};

// Sample screens with analysis results from /api/analyze
const screens = [
  {
    id: "screen-1",
    analysis: {
      rawText: "One&Only Palmilla, Los Cabos\n5 stars\n9.8 Exceptional\n652 reviews\n$850/night",
      summary: "User is viewing a luxury beachfront hotel in Los Cabos with exceptional ratings.",
      category: "trip-planning",
      entities: [
        {
          type: "hotel",
          title: "One&Only Palmilla",
          attributes: {
            location: "Los Cabos, Mexico",
            price: "$850/night",
            rating: "9.8 Exceptional",
            stars: "5",
            reviews: "652"
          }
        }
      ],
      suggestedNotebookTitle: "Los Cabos Hotels"
    }
  },
  {
    id: "screen-2",
    analysis: {
      rawText: "Las Ventanas al Paraíso\n5 stars\n9.6 Exceptional\nAll-inclusive resort\n$1,200/night",
      summary: "User is viewing another luxury all-inclusive resort in Los Cabos with premium pricing.",
      category: "trip-planning",
      entities: [
        {
          type: "hotel",
          title: "Las Ventanas al Paraíso",
          attributes: {
            location: "Los Cabos, Mexico",
            price: "$1,200/night",
            rating: "9.6 Exceptional",
            stars: "5",
            type: "All-inclusive resort"
          }
        }
      ],
      suggestedNotebookTitle: "Los Cabos Resorts"
    }
  },
  {
    id: "screen-3",
    analysis: {
      rawText: "United Airlines UA 1234\nSan Francisco → Cabo\nFeb 15-22\n$450 Economy",
      summary: "User is viewing flight options from San Francisco to Cabo San Lucas.",
      category: "trip-planning",
      entities: [
        {
          type: "flight",
          title: "UA 1234 SFO → SJD",
          attributes: {
            airline: "United Airlines",
            route: "San Francisco → Cabo",
            dates: "Feb 15-22",
            price: "$450",
            class: "Economy"
          }
        }
      ],
      suggestedNotebookTitle: "Cabo Trip Planning"
    }
  }
];

const requestBody = {
  sessionId: "test-session-123",
  previousSession: previousSession,
  screens: screens
};

console.log("Sending request to regenerate endpoint...\n");

const res = await fetch("http://localhost:3000/api/regenerate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody),
});

const text = await res.text();
console.log("Status:", res.status);
console.log("\nResponse:");

try {
  const json = JSON.parse(text);
  console.log(JSON.stringify(json, null, 2));
  
  console.log("\n--- Session Analysis ---");
  console.log("Session ID:", json.sessionId);
  console.log("Category:", json.sessionCategory);
  console.log("Summary:", json.sessionSummary);
  console.log("Suggested Title:", json.suggestedNotebookTitle);
  console.log("Total Entities:", json.entities.length);
  console.log("Total Suggestions:", json.suggestions?.length || 0);
  
  if (json.entities.length > 0) {
    console.log("\n--- Merged Entities ---");
    json.entities.forEach((entity, i) => {
      console.log(`\n${i + 1}. ${entity.title || "Untitled"} (${entity.type})`);
      Object.entries(entity.attributes).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
  }

  if (json.suggestions && json.suggestions.length > 0) {
    console.log("\n--- Suggestions ---");
    json.suggestions.forEach((suggestion, i) => {
      console.log(`\n${i + 1}. ${suggestion.type.toUpperCase()}`);
      if (suggestion.type === 'question') {
        console.log(`   Question: ${suggestion.text}`);
      } else if (suggestion.type === 'ranking') {
        console.log(`   Basis: ${suggestion.basis}`);
        suggestion.items.forEach((item, j) => {
          console.log(`   ${j + 1}. ${item.entityTitle}`);
          console.log(`      Reason: ${item.reason}`);
        });
      } else if (suggestion.type === 'next-step') {
        console.log(`   Action: ${suggestion.text}`);
      }
    });
  }
} catch (e) {
  console.log("Raw response (not JSON):");
  console.log(text);
}
