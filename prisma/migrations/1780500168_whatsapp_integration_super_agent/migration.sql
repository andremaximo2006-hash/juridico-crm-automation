-- CreateEnum
CREATE TYPE "WhatsAppPlatform" AS ENUM ('zapi', 'meta', 'manychat');

-- CreateEnum
CREATE TYPE "WhatsAppConversationStatus" AS ENUM ('active', 'transferred', 'completed', 'closed');

-- CreateEnum
CREATE TYPE "WhatsAppHumanTicketStatus" AS ENUM ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "WhatsAppHumanTicketPriority" AS ENUM ('low', 'normal', 'high');

-- CreateTable
CREATE TABLE "whatsapp_routines" (
    "id" TEXT NOT NULL,
    "legal_area" TEXT NOT NULL,
    "name" TEXT,
    "system_prompt" TEXT NOT NULL,
    "tools" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT,

    CONSTRAINT "whatsapp_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "platform" "WhatsAppPlatform",
    "platform_contact_id" TEXT,
    "phone_number" TEXT,
    "legal_area" TEXT,
    "conversation_history" JSONB,
    "status" "WhatsAppConversationStatus" NOT NULL DEFAULT 'active',
    "transferred_to_human_at" TIMESTAMP(3),
    "transferred_to_attendant_id" TEXT,
    "attendant_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_human_tickets" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "reason" TEXT,
    "priority" "WhatsAppHumanTicketPriority" NOT NULL DEFAULT 'normal',
    "status" "WhatsAppHumanTicketStatus" NOT NULL DEFAULT 'pending',
    "assigned_to_attendant_id" TEXT,
    "assigned_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_human_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_integrations" (
    "id" TEXT NOT NULL,
    "platform" "WhatsAppPlatform" NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "api_key" TEXT,
    "api_secret" TEXT,
    "instance_id" TEXT,
    "phone_number_id" TEXT,
    "channel_id" TEXT,
    "webhook_url" TEXT,
    "webhook_secret" TEXT,
    "settings" JSONB,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_routines_legal_area_key" ON "whatsapp_routines"("legal_area");

-- CreateIndex
CREATE INDEX "whatsapp_routines_legal_area_idx" ON "whatsapp_routines"("legal_area");

-- CreateIndex
CREATE INDEX "whatsapp_routines_active_idx" ON "whatsapp_routines"("active");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_lead_idx" ON "whatsapp_conversations"("lead_id");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_status_idx" ON "whatsapp_conversations"("status");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_transferred_idx" ON "whatsapp_conversations"("transferred_to_attendant_id");

-- CreateIndex
CREATE INDEX "whatsapp_human_tickets_status_idx" ON "whatsapp_human_tickets"("status");

-- CreateIndex
CREATE INDEX "whatsapp_human_tickets_assigned_to_idx" ON "whatsapp_human_tickets"("assigned_to_attendant_id");

-- CreateIndex
CREATE INDEX "whatsapp_human_tickets_priority_idx" ON "whatsapp_human_tickets"("priority");

-- CreateIndex
CREATE INDEX "whatsapp_integrations_platform_active_idx" ON "whatsapp_integrations"("platform", "active");

-- AddForeignKey
ALTER TABLE "whatsapp_routines" ADD CONSTRAINT "whatsapp_routines_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_transferred_to_attendant_id_fkey" FOREIGN KEY ("transferred_to_attendant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_human_tickets" ADD CONSTRAINT "whatsapp_human_tickets_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_human_tickets" ADD CONSTRAINT "whatsapp_human_tickets_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_human_tickets" ADD CONSTRAINT "whatsapp_human_tickets_assigned_to_attendant_id_fkey" FOREIGN KEY ("assigned_to_attendant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
