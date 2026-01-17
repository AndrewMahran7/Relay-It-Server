// Shared frontend types for the application

export type Entity = {
  type: string;
  title: string | null;
  attributes: Record<string, string>;
};

export type Suggestion =
  | { type: "question"; text: string }
  | {
      type: "ranking";
      basis: string;
      items: { entityTitle: string; reason: string }[];
    }
  | { type: "next-step"; text: string };

export type RegenerateState = {
  sessionSummary: string;
  sessionCategory: string;
  entities: Entity[];
  suggestedNotebookTitle: string | null;
  suggestions: Suggestion[];
};

export type ScreenshotDto = {
  id: string;
  sessionId: string;
  imageUrl: string;
  rawText: string | null;
  createdAt: string;
};

export type SessionListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  screenshotCount: number;
  regenerateState: RegenerateState | null;
};

export type SessionDetailResponse = {
  session: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
  screenshots: ScreenshotDto[];
  regenerateState: RegenerateState | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};
