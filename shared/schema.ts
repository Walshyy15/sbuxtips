import { z } from "zod";

export const partnerHoursSchema = z.array(z.object({
    name: z.string(),
    hours: z.number()
}));

export const users = {};
export type User = any;
export type InsertUser = any;

export interface Partner {
  id: string;
  name: string;
  partner_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InsertPartner {
  name: string;
  partner_number?: string;
}

export interface TipDistribution {
  id: string;
  report_date: string;
  total_tips: number;
  total_hours: number;
  has_uneven_bills: boolean;
  bill_ones?: number;
  bill_fives?: number;
  bill_tens?: number;
  bill_twenties?: number;
  report_text?: string;
  created_at?: string;
}

export interface InsertTipDistribution {
  report_date: string;
  total_tips: number;
  total_hours: number;
  has_uneven_bills: boolean;
  bill_ones?: number;
  bill_fives?: number;
  bill_tens?: number;
  bill_twenties?: number;
  report_text?: string;
}

export interface PartnerPayout {
  id: string;
  distribution_id: string;
  partner_id?: string;
  partner_name: string;
  tippable_hours: number;
  tip_amount: number;
  created_at?: string;
}

export interface InsertPartnerPayout {
  distribution_id: string;
  partner_id?: string;
  partner_name: string;
  tippable_hours: number;
  tip_amount: number;
}

export const partners = {};
export type Distribution = any;
export type InsertDistribution = any;
