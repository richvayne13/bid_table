-- Fix RFQ 1 standard_item_id references to match the 5 core dining categories
-- so B미트(육류 최저가), C프레시(유제품/채소 최저가), A종합유통(전 품목 취급 & 공산품 최저가) match accurately.
UPDATE public.rfq_items
SET standard_item_id = '10000000-0000-0000-0000-000000000001', monthly_qty = 60, current_unit_price = 37000
WHERE id = '21000000-0000-0000-0000-000000000001';

UPDATE public.rfq_items
SET standard_item_id = '10000000-0000-0000-0000-000000000023', monthly_qty = 40, current_unit_price = 18000
WHERE id = '21000000-0000-0000-0000-000000000002';

UPDATE public.rfq_items
SET standard_item_id = '10000000-0000-0000-0000-000000000034', monthly_qty = 15, current_unit_price = 23000
WHERE id = '21000000-0000-0000-0000-000000000003';

UPDATE public.rfq_items
SET standard_item_id = '10000000-0000-0000-0000-000000000044', monthly_qty = 25, current_unit_price = 21000
WHERE id = '21000000-0000-0000-0000-000000000004';

UPDATE public.rfq_items
SET standard_item_id = '10000000-0000-0000-0000-000000000048', monthly_qty = 50, current_unit_price = 4300
WHERE id = '21000000-0000-0000-0000-000000000005';
