import { pgTable, text, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core";

// Users table - extends Clerk user data
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // Clerk user ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).notNull().default("sales"), // admin, sales, support
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads table - potential customers
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 200 }),
  jobTitle: varchar("job_title", { length: 100 }),
  source: varchar("source", { length: 100 }), // website, referral, cold_call, etc.
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, qualified, proposal, closed_won, closed_lost
  notes: text("notes"),
  assignedTo: text("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deals table - qualified leads that become opportunities
export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id),
  title: varchar("title", { length: 200 }).notNull(),
  value: integer("value").notNull().default(0), // deal value in cents
  stage: varchar("stage", { length: 50 }).notNull().default("prospecting"), // prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  probability: integer("probability").notNull().default(0), // 0-100%
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  assignedTo: text("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table - track interactions with leads/deals
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // call, email, meeting, note
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description"),
  leadId: uuid("lead_id").references(() => leads.id),
  dealId: uuid("deal_id").references(() => deals.id),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Legacy table for compatibility
export const UserMessages = pgTable("user_messages", {
  user_id: text("user_id").primaryKey().notNull(),
  createTs: timestamp("create_ts").defaultNow().notNull(),
  message: text("message").notNull(),
});
