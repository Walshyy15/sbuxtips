import {
  users,
  type User,
  type InsertUser,
  type Partner,
  type InsertPartner,
  type TipDistribution,
  type InsertTipDistribution,
  type PartnerPayout,
  type InsertPartnerPayout
} from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Partner methods
  getPartner(id: string): Promise<Partner | undefined>;
  getPartners(): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;

  // Tip Distribution methods
  getTipDistribution(id: string): Promise<TipDistribution | undefined>;
  getTipDistributions(): Promise<TipDistribution[]>;
  createTipDistribution(distribution: InsertTipDistribution): Promise<TipDistribution>;

  // Partner Payout methods
  getPartnerPayouts(distributionId: string): Promise<PartnerPayout[]>;
  createPartnerPayout(payout: InsertPartnerPayout): Promise<PartnerPayout>;
  createBulkPartnerPayouts(payouts: InsertPartnerPayout[]): Promise<PartnerPayout[]>;
}

export class SupabaseStorage implements IStorage {
  // User methods (legacy - not currently used)
  async getUser(id: number): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    throw new Error("User creation not implemented");
  }

  // Partner methods
  async getPartner(id: string): Promise<Partner | undefined> {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data || undefined;
  }

  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const { data, error } = await supabase
      .from("partners")
      .insert(partner)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Tip Distribution methods
  async getTipDistribution(id: string): Promise<TipDistribution | undefined> {
    const { data, error } = await supabase
      .from("tip_distributions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data || undefined;
  }

  async getTipDistributions(): Promise<TipDistribution[]> {
    const { data, error } = await supabase
      .from("tip_distributions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTipDistribution(distribution: InsertTipDistribution): Promise<TipDistribution> {
    const { data, error } = await supabase
      .from("tip_distributions")
      .insert(distribution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Partner Payout methods
  async getPartnerPayouts(distributionId: string): Promise<PartnerPayout[]> {
    const { data, error } = await supabase
      .from("partner_payouts")
      .select("*")
      .eq("distribution_id", distributionId)
      .order("partner_name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createPartnerPayout(payout: InsertPartnerPayout): Promise<PartnerPayout> {
    const { data, error } = await supabase
      .from("partner_payouts")
      .insert(payout)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createBulkPartnerPayouts(payouts: InsertPartnerPayout[]): Promise<PartnerPayout[]> {
    const { data, error } = await supabase
      .from("partner_payouts")
      .insert(payouts)
      .select();

    if (error) throw error;
    return data || [];
  }
}

export const storage = new SupabaseStorage();
