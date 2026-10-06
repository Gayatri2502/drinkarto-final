CREATE TABLE "AiConversation" (
    "organizationId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("organizationId", "id"),
    CONSTRAINT "AiConversation_role_member_fkey"
      FOREIGN KEY ("organizationId", "userId")
      REFERENCES "Member"("organizationId", "userId")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AiMessage_role_check" CHECK ("role" IN ('user', 'assistant')),
    CONSTRAINT "AiMessage_conversation_fkey"
      FOREIGN KEY ("organizationId", "conversationId")
      REFERENCES "AiConversation"("organizationId", "id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AiConversation_organizationId_userId_updatedAt_idx"
  ON "AiConversation"("organizationId", "userId", "updatedAt");
CREATE INDEX "AiMessage_organizationId_conversationId_createdAt_idx"
  ON "AiMessage"("organizationId", "conversationId", "createdAt");
