export type UserRole = "RESTAURANT" | "SUPPLIER" | "ADMIN";

export interface Profile {
  id: string;
  role: UserRole;
  company_name: string;
  business_number: string | null;
  address: string | null;
  delivery_regions: string[];
  is_admin_managed: boolean;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export type ItemCategory = "육류" | "해산물" | "유제품" | "채소/과일" | "소스/공산품";
export type BaseUnit = "kg" | "L" | "ea";

export interface StandardItem {
  id: string;
  category: ItemCategory;
  item_name: string;
  spec: string;
  base_unit: BaseUnit;
  created_at: string;
  updated_at: string;
}

export interface SupplierCatalog {
  id: string;
  supplier_id: string;
  standard_item_id: string;
  package_weight: number;
  package_price: number;
  created_at: string;
  updated_at: string;
  standard_item?: StandardItem;
}

export type RfqStatus = "OPEN" | "CLOSED" | "CONTRACTED";
export type PaymentTerms = "선결제" | "월말정산" | "카드결제";

export interface Rfq {
  id: string;
  restaurant_id: string;
  title: string;
  region: string;
  contract_months: 1 | 3 | 6;
  delivery_days: string[];
  payment_terms: PaymentTerms;
  deadline: string;
  status: RfqStatus;
  created_at: string;
  updated_at: string;
  items?: RfqItem[];
  restaurant?: Profile;
}

export interface RfqItem {
  id: string;
  rfq_id: string;
  standard_item_id: string;
  monthly_qty: number;
  current_unit_price: number | null;
  created_at: string;
  standard_item?: StandardItem;
}

export type BidStatus = "SUBMITTED" | "WON" | "LOST";
export type PriceLockType = "FIXED" | "INDEXED";

export interface Bid {
  id: string;
  rfq_id: string;
  supplier_id: string;
  moq_amount: number;
  price_lock_type: PriceLockType;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  bid_items?: BidItem[];
  supplier?: Profile;
}

export interface BidItem {
  id: string;
  bid_id: string;
  rfq_item_id: string;
  package_weight: number;
  package_price: number;
  normalized_unit_price: number;
  created_at: string;
  rfq_item?: RfqItem;
}

export interface ContractItem {
  item_name: string;
  normalized_unit_price: number;
  base_unit: string;
  package_weight?: number;
  package_price?: number;
}

export interface Contract {
  id: string;
  rfq_id: string;
  supplier_id: string;
  contract_items: ContractItem[];
  start_date: string;
  end_date: string;
  created_at: string;
  supplier?: Profile;
  rfq?: Rfq;
}

export interface ParsedInvoiceItem {
  item_name: string;
  invoiced_unit_price: number;
  contract_unit_price: number;
  qty: number;
  is_violation: boolean;
  diff: number;
}

export interface InvoiceAudit {
  id: string;
  contract_id: string;
  image_url: string | null;
  parsed_items: ParsedInvoiceItem[];
  violation_count: number;
  total_overcharge: number;
  created_at: string;
  contract?: Contract;
}
