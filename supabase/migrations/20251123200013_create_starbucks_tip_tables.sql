/*
  # Starbucks Tip Calculator Database Schema

  ## Overview
  This migration creates the database structure for a Starbucks tip distribution calculator
  that processes tip reports and calculates payouts based on tippable hours.

  ## New Tables
  
  ### `partners`
  Stores Starbucks partner (employee) information
  - `id` (uuid, primary key) - Unique identifier for each partner
  - `name` (text, not null) - Full name of the partner
  - `partner_number` (text, unique) - Optional Starbucks partner number
  - `created_at` (timestamptz) - When the partner was added
  - `updated_at` (timestamptz) - Last update timestamp

  ### `tip_distributions`
  Records of tip distribution sessions
  - `id` (uuid, primary key) - Unique identifier for each distribution
  - `report_date` (date, not null) - Date of the tip distribution report
  - `total_tips` (numeric, not null) - Total dollar amount to distribute
  - `total_hours` (numeric, not null) - Combined tippable hours for all partners
  - `has_uneven_bills` (boolean) - Whether custom bill denominations are used
  - `bill_ones` (integer) - Count of $1 bills
  - `bill_fives` (integer) - Count of $5 bills
  - `bill_tens` (integer) - Count of $10 bills
  - `bill_twenties` (integer) - Count of $20 bills
  - `report_text` (text) - Original OCR extracted text from report
  - `created_at` (timestamptz) - When the distribution was created

  ### `partner_payouts`
  Individual partner tip amounts for each distribution
  - `id` (uuid, primary key) - Unique identifier
  - `distribution_id` (uuid, foreign key) - Links to tip_distributions
  - `partner_id` (uuid, foreign key) - Links to partners
  - `partner_name` (text, not null) - Partner name snapshot
  - `tippable_hours` (numeric, not null) - Hours worked by this partner
  - `tip_amount` (numeric, not null) - Calculated tip payout
  - `created_at` (timestamptz) - When the payout was calculated

  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Public access policies allow all operations for authenticated users
  - This is a single-user application, so all authenticated users can access all data

  ## Important Notes
  - Uses numeric type for precise financial calculations
  - Maintains denormalized partner_name in payouts for historical accuracy
  - Supports both even distribution and custom bill denomination scenarios
*/

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  partner_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tip_distributions table
CREATE TABLE IF NOT EXISTS tip_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  total_tips numeric(10, 2) NOT NULL,
  total_hours numeric(10, 2) NOT NULL,
  has_uneven_bills boolean DEFAULT false,
  bill_ones integer DEFAULT 0,
  bill_fives integer DEFAULT 0,
  bill_tens integer DEFAULT 0,
  bill_twenties integer DEFAULT 0,
  report_text text,
  created_at timestamptz DEFAULT now()
);

-- Create partner_payouts table
CREATE TABLE IF NOT EXISTS partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id uuid NOT NULL REFERENCES tip_distributions(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  partner_name text NOT NULL,
  tippable_hours numeric(10, 2) NOT NULL,
  tip_amount numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_partner_payouts_distribution ON partner_payouts(distribution_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_tip_distributions_date ON tip_distributions(report_date);

-- Enable Row Level Security
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for partners table
CREATE POLICY "Allow all operations on partners"
  ON partners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for tip_distributions table
CREATE POLICY "Allow all operations on tip_distributions"
  ON tip_distributions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for partner_payouts table
CREATE POLICY "Allow all operations on partner_payouts"
  ON partner_payouts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for partners table
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();