
import type { Scenario } from "@/types/game";

export const scenarios: Scenario[] = [
  {
    id: "scenario-01",
    title: "Increasing Supplier Costs",
    description:
      "Your supplier suddenly increases the price of raw materials.",
    question:
      "How would you maintain your profit margin without losing customers?",
    npcAnswer:
      "I would negotiate with the supplier, compare alternative suppliers, and review operational costs while maintaining product quality."
  },
  {
    id: "scenario-02",
    title: "Declining Sales",
    description:
      "Your business experiences a significant decline in sales.",
    question:
      "What strategies would you introduce to attract more customers?",
    npcAnswer:
      "I would introduce promotional campaigns, improve customer engagement, and analyse customer preferences to improve our products."
  },
  {
    id: "scenario-03",
    title: "Customer Complaints",
    description:
      "Several customers complain about the quality of your products.",
    question:
      "How would you handle the complaints and restore customer trust?",
    npcAnswer:
      "I would investigate the complaints, improve quality control, offer appropriate solutions, and communicate transparently with customers."
  },
  {
    id: "scenario-04",
    title: "Business Competition",
    description:
      "A new competitor opens a business offering similar products at lower prices.",
    question:
      "How would you keep your business competitive?",
    npcAnswer:
      "I would differentiate my products, improve customer service, and introduce competitive pricing without compromising quality."
  },
  {
    id: "scenario-05",
    title: "Limited Business Capital",
    description:
      "Your business has limited funds to expand its operations.",
    question:
      "How would you manage your available capital and prioritise business growth?",
    npcAnswer:
      "I would prioritise essential expenses, monitor cash flow, and invest in activities that provide the highest business value."
  }
];
