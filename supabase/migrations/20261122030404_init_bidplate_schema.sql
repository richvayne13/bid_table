-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('RESTAURANT', 'SUPPLIER', 'ADMIN')),
  company_name text NOT NULL,
  business_number text,
  address text,
  delivery_regions jsonb DEFAULT '[]'::jsonb,
  is_admin_managed boolean DEFAULT false,
  trust_score numeric DEFAULT 100.0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Standard Items Table
CREATE TABLE IF NOT EXISTS public.standard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('육류', '해산물', '유제품', '채소/과일', '소스/공산품')),
  item_name text NOT NULL,
  spec text NOT NULL,
  base_unit text NOT NULL CHECK (base_unit IN ('kg', 'L', 'ea')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Supplier Catalogs Table
CREATE TABLE IF NOT EXISTS public.supplier_catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  standard_item_id uuid NOT NULL REFERENCES public.standard_items(id) ON DELETE CASCADE,
  package_weight numeric NOT NULL CHECK (package_weight > 0),
  package_price numeric NOT NULL CHECK (package_price >= 0),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT supplier_catalogs_supplier_item_key UNIQUE (supplier_id, standard_item_id)
);

-- 4. RFQs (Request For Quotation) Table
CREATE TABLE IF NOT EXISTS public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  region text NOT NULL,
  contract_months integer NOT NULL CHECK (contract_months IN (1, 3, 6)),
  delivery_days jsonb DEFAULT '[]'::jsonb,
  payment_terms text NOT NULL CHECK (payment_terms IN ('선결제', '월말정산', '카드결제')),
  deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CONTRACTED')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RFQ Items Table
CREATE TABLE IF NOT EXISTS public.rfq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  standard_item_id uuid NOT NULL REFERENCES public.standard_items(id) ON DELETE CASCADE,
  monthly_qty numeric NOT NULL CHECK (monthly_qty > 0),
  current_unit_price numeric CHECK (current_unit_price IS NULL OR current_unit_price >= 0),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  moq_amount numeric NOT NULL DEFAULT 0 CHECK (moq_amount >= 0),
  price_lock_type text NOT NULL CHECK (price_lock_type IN ('FIXED', 'INDEXED')),
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'WON', 'LOST')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT bids_rfq_supplier_key UNIQUE (rfq_id, supplier_id)
);

-- 7. Bid Items Table
CREATE TABLE IF NOT EXISTS public.bid_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id uuid NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
  rfq_item_id uuid NOT NULL REFERENCES public.rfq_items(id) ON DELETE CASCADE,
  package_weight numeric NOT NULL CHECK (package_weight > 0),
  package_price numeric NOT NULL CHECK (package_price >= 0),
  normalized_unit_price numeric GENERATED ALWAYS AS (ROUND(package_price / package_weight, 2)) STORED,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT bid_items_bid_rfq_item_key UNIQUE (bid_id, rfq_item_id)
);

-- 8. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Invoice Audits Table
CREATE TABLE IF NOT EXISTS public.invoice_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  image_url text,
  parsed_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  violation_count integer NOT NULL DEFAULT 0,
  total_overcharge numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_supplier ON public.supplier_catalogs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_item ON public.supplier_catalogs(standard_item_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_restaurant ON public.rfqs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON public.rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_bids_rfq ON public.bids(rfq_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier ON public.bids(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bid_items_bid ON public.bid_items(bid_id);
CREATE INDEX IF NOT EXISTS idx_contracts_rfq ON public.contracts(rfq_id);
CREATE INDEX IF NOT EXISTS idx_contracts_supplier ON public.contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoice_audits_contract ON public.invoice_audits(contract_id);

-- Updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_standard_items_updated_at ON public.standard_items;
CREATE TRIGGER set_standard_items_updated_at BEFORE UPDATE ON public.standard_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_supplier_catalogs_updated_at ON public.supplier_catalogs;
CREATE TRIGGER set_supplier_catalogs_updated_at BEFORE UPDATE ON public.supplier_catalogs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_rfqs_updated_at ON public.rfqs;
CREATE TRIGGER set_rfqs_updated_at BEFORE UPDATE ON public.rfqs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bids_updated_at ON public.bids;
CREATE TRIGGER set_bids_updated_at BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    company_name,
    business_number,
    address,
    delivery_regions,
    is_admin_managed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'RESTAURANT'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '신규 업체'),
    COALESCE(NEW.raw_user_meta_data->>'business_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->'delivery_regions', '[]'::jsonb),
    COALESCE((NEW.raw_user_meta_data->>'is_admin_managed')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_audits ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Standard Items Policies (Readable by all, modifiable by authenticated)
CREATE POLICY "Standard items are viewable by everyone"
  ON public.standard_items FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Standard items are manageable by authenticated users"
  ON public.standard_items FOR ALL
  TO authenticated
  USING (true);

-- Supplier Catalogs Policies
CREATE POLICY "Supplier catalogs are viewable by authenticated users"
  ON public.supplier_catalogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Suppliers can manage their own catalogs"
  ON public.supplier_catalogs FOR ALL
  TO authenticated
  USING (auth.uid() = supplier_id);

-- RFQs Policies
CREATE POLICY "RFQs are viewable by authenticated users"
  ON public.rfqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurants can manage their own RFQs"
  ON public.rfqs FOR ALL
  TO authenticated
  USING (auth.uid() = restaurant_id);

-- RFQ Items Policies
CREATE POLICY "RFQ items are viewable by authenticated users"
  ON public.rfq_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "RFQ owners can manage their RFQ items"
  ON public.rfq_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rfqs
      WHERE rfqs.id = rfq_items.rfq_id
      AND rfqs.restaurant_id = auth.uid()
    )
  );

-- Bids Policies
CREATE POLICY "Bids are viewable by bidder and RFQ owner"
  ON public.bids FOR SELECT
  TO authenticated
  USING (
    auth.uid() = supplier_id OR
    EXISTS (
      SELECT 1 FROM public.rfqs
      WHERE rfqs.id = bids.rfq_id
      AND rfqs.restaurant_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can manage their own bids"
  ON public.bids FOR ALL
  TO authenticated
  USING (auth.uid() = supplier_id);

-- Bid Items Policies
CREATE POLICY "Bid items are viewable by relevant parties"
  ON public.bid_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bids
      JOIN public.rfqs ON rfqs.id = bids.rfq_id
      WHERE bids.id = bid_items.bid_id
      AND (bids.supplier_id = auth.uid() OR rfqs.restaurant_id = auth.uid())
    )
  );

CREATE POLICY "Bidders can manage their bid items"
  ON public.bid_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bids
      WHERE bids.id = bid_items.bid_id
      AND bids.supplier_id = auth.uid()
    )
  );

-- Contracts Policies
CREATE POLICY "Contracts are viewable by involved restaurant and supplier"
  ON public.contracts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = supplier_id OR
    EXISTS (
      SELECT 1 FROM public.rfqs
      WHERE rfqs.id = contracts.rfq_id
      AND rfqs.restaurant_id = auth.uid()
    )
  );

CREATE POLICY "Contracts are manageable by involved parties"
  ON public.contracts FOR ALL
  TO authenticated
  USING (
    auth.uid() = supplier_id OR
    EXISTS (
      SELECT 1 FROM public.rfqs
      WHERE rfqs.id = contracts.rfq_id
      AND rfqs.restaurant_id = auth.uid()
    )
  );

-- Invoice Audits Policies
CREATE POLICY "Invoice audits are viewable by contract parties"
  ON public.invoice_audits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      JOIN public.rfqs ON rfqs.id = contracts.rfq_id
      WHERE contracts.id = invoice_audits.contract_id
      AND (contracts.supplier_id = auth.uid() OR rfqs.restaurant_id = auth.uid())
    )
  );

CREATE POLICY "Invoice audits can be created by contract parties"
  ON public.invoice_audits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      JOIN public.rfqs ON rfqs.id = contracts.rfq_id
      WHERE contracts.id = invoice_audits.contract_id
      AND (contracts.supplier_id = auth.uid() OR rfqs.restaurant_id = auth.uid())
    )
  );

-- Storage bucket for invoice images
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for invoices bucket
CREATE POLICY "Invoices images are viewable by authenticated users"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'invoices');

CREATE POLICY "Authenticated users can upload invoice images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invoices');
