import { z } from "zod";

export const partnerHoursSchema = z.array(z.object({
    name: z.string(),
    hours: z.number()
}));

export const users = {};
export type User = any;
export type InsertUser = any;
export const partners = {};
export type Partner = any;
export type InsertPartner = any;
export const distributions = {};
export type Distribution = any;
export type InsertDistribution = any;
