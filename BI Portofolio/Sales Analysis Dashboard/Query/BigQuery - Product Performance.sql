--Changelog 
-- 2023-09-04 Alief: delete join by brand_name between fpd and dscm for avoid bloated data
-- 2024-07-16 Alief: add join by coalesce(upper(trim(fpd.seller_sku)), '0') = coalesce(upper(trim(dcm.seller_sku)), '0') and coalesce(upper(trim(fpd.variant_id)), '0') = coalesce(upper(trim(dcm.variant_id)), '0') for same result wih store perfoemance

SELECT 
    fpd.order_created_date,
    dsi.brand_name,
    fpd.platform,
    COALESCE(dcm.cat_1,'NO CATEGORY') as category_name,
    COALESCE(fpd.seller_sku, fpd.variant_id) as seller_sku,
    fpd.product_name,
    fpd.gmv,
    fpd.gross_item_sold,
    fpd.gross_order,
    fpd.onmv,
    fpd.onmv_item_sold,
    fpd.onmv_order,
    der.final_rate
FROM `bi-dwh-intrepid.intrepid_dwh.fact_product_sales_daily` fpd
JOIN `bi-dwh-intrepid.intrepid_dwh.dim_shop_info` dsi on fpd.shop_id = dsi.shop_id and fpd.venture = dsi.venture and fpd.order_created_date >= dsi.start_date and fpd.order_created_date <= dsi.end_date
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_category_manual` AS dcm -- Get Seller SKU info
    ON fpd.venture = dcm.venture
    AND fpd.shop_id = dcm.shop_id
    AND fpd.product_id = dcm.product_id
    AND coalesce(upper(trim(fpd.seller_sku)), '0') = coalesce(upper(trim(dcm.seller_sku)), '0')
    -- AND coalesce(upper(trim(fpd.variant_id)), '0') = coalesce(upper(trim(dcm.variant_id)), '0')
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_acl` dal ON fpd.shop_id = dal.shop_id and fpd.venture = dal.venture
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_exc_rate` der ON DATE_TRUNC(fpd.order_created_date, MONTH) = der.date and fpd.venture = der.venture 
WHERE fpd.venture = 'ID'
and REGEXP_CONTAINS(dal.emails, @DS_USER_EMAIL)
and fpd.order_created_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
and fpd.order_created_date <=  PARSE_DATE('%Y%m%d', @DS_END_DATE)
and dsi.count_gmv_for_int = 1
