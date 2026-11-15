
export type PlotType =
  | "normal"
  | "scenario"
  | "reward"
  | "penalty";

export interface BoardPlot {
  id: number;
  type: PlotType;
  title: string;
  description: string;
  scenarioId?: string;
  effect?: {
    movement?: number;
    money?: number;
    score?: number;
  };
}

export const BOARD_START_POSITION = 0;
export const BOARD_FINISH_POSITION = 36;
export const TOTAL_BOARD_SPACES = 35;

export const boardPlots: BoardPlot[] = [
  {
    id: 1,
    type: "normal",
    title: "Business District",
    description: "A regular business space.",
  },
  {
    id: 2,
    type: "scenario",
    title: "Increasing Supplier Costs",
    description: "Your supplier increases raw material prices.",
    scenarioId: "scenario-01",
  },
  {
    id: 3,
    type: "reward",
    title: "Investment Opportunity",
    description: "You receive a business investment.",
    effect: { money: 500, score: 10 },
  },
  {
    id: 4,
    type: "normal",
    title: "Market Street",
    description: "Move forward one additional space.",
    effect: { movement: 1 },
  },
  {
    id: 5,
    type: "scenario",
    title: "Declining Sales",
    description: "Your business experiences declining sales.",
    scenarioId: "scenario-02",
  },
  {
    id: 6,
    type: "penalty",
    title: "Legal Compliance",
    description: "Your business faces a compliance penalty.",
    effect: { money: -200, score: -5 },
  },
  {
    id: 7,
    type: "normal",
    title: "Business Avenue",
    description: "A regular business space.",
  },
  {
    id: 8,
    type: "reward",
    title: "Sponsorship Deal",
    description: "You secure a business sponsorship.",
    effect: { money: 300, score: 5 },
  },
  {
    id: 9,
    type: "scenario",
    title: "Customer Complaints",
    description: "Customers complain about your product quality.",
    scenarioId: "scenario-03",
  },
  {
    id: 10,
    type: "normal",
    title: "Innovation Hub",
    description: "Move backward one space.",
    effect: { movement: -1 },
  },
  {
    id: 11,
    type: "penalty",
    title: "Business Misconduct",
    description: "Your business faces a misconduct penalty.",
    effect: { money: -300, score: -5 },
  },
  {
    id: 12,
    type: "scenario",
    title: "Business Competition",
    description: "A competitor enters your market.",
    scenarioId: "scenario-04",
  },
  {
    id: 13,
    type: "normal",
    title: "Commercial Centre",
    description: "A regular business space.",
  },
  {
    id: 14,
    type: "reward",
    title: "Collaboration",
    description: "You secure a strategic business partnership.",
    effect: { money: 400, score: 10 },
  },
  {
    id: 15,
    type: "scenario",
    title: "Limited Business Capital",
    description: "Your business has limited funds for expansion.",
    scenarioId: "scenario-05",
  },
  {
    id: 16,
    type: "normal",
    title: "Market Square",
    description: "Move forward two additional spaces.",
    effect: { movement: 2 },
  },
  {
    id: 17,
    type: "penalty",
    title: "Financial Mismanagement",
    description: "Your business suffers a financial penalty.",
    effect: { money: -250, score: -5 },
  },
  {
    id: 18,
    type: "scenario",
    title: "Supply Chain Disruption",
    description: "Your business experiences supply disruptions.",
    scenarioId: "scenario-06",
  },
  {
    id: 19,
    type: "reward",
    title: "Business Grant",
    description: "You secure a business development grant.",
    effect: { money: 500, score: 10 },
  },
  {
    id: 20,
    type: "normal",
    title: "Entrepreneur Avenue",
    description: "A regular business space.",
  },
  {
    id: 21,
    type: "scenario",
    title: "Viral Marketing",
    description: "Your product suddenly becomes popular online.",
    scenarioId: "scenario-07",
  },
  {
    id: 22,
    type: "penalty",
    title: "Product Recall",
    description: "Your business must address a product quality issue.",
    effect: { money: -300, score: -5 },
  },
  {
    id: 23,
    type: "normal",
    title: "Innovation Street",
    description: "Move backward two spaces.",
    effect: { movement: -2 },
  },
  {
    id: 24,
    type: "reward",
    title: "CSR Partnership",
    description: "You secure a corporate social responsibility partnership.",
    effect: { money: 400, score: 10 },
  },
  {
    id: 25,
    type: "scenario",
    title: "Natural Disaster",
    description: "A natural disaster affects your business operations.",
    scenarioId: "scenario-08",
  },
  {
    id: 26,
    type: "normal",
    title: "Business Centre",
    description: "A regular business space.",
  },
  {
    id: 27,
    type: "penalty",
    title: "SST Compliance",
    description: "Your business faces a tax compliance issue.",
    effect: { money: -200, score: -5 },
  },
  {
    id: 28,
    type: "scenario",
    title: "Halal Certification",
    description: "Your business needs to address certification requirements.",
    scenarioId: "scenario-09",
  },
  {
    id: 29,
    type: "reward",
    title: "Strategic Investment",
    description: "You attract a new business investor.",
    effect: { money: 600, score: 10 },
  },
  {
    id: 30,
    type: "normal",
    title: "Commercial Avenue",
    description: "A regular business space.",
  },
  {
    id: 31,
    type: "scenario",
    title: "Sustainable Production",
    description: "Your business must reduce production waste.",
    scenarioId: "scenario-10",
  },
  {
    id: 32,
    type: "penalty",
    title: "Contract Dispute",
    description: "Your business faces a contractual disagreement.",
    effect: { money: -250, score: -5 },
  },
  {
    id: 33,
    type: "normal",
    title: "Entrepreneur Square",
    description: "A regular business space.",
  },
  {
    id: 34,
    type: "reward",
    title: "Expansion Opportunity",
    description: "Your business receives an expansion opportunity.",
    effect: { money: 500, score: 10 },
  },
  {
    id: 35,
    type: "scenario",
    title: "Business Sustainability",
    description: "Your business must balance profitability and sustainability.",
    scenarioId: "scenario-11",
  },
];
