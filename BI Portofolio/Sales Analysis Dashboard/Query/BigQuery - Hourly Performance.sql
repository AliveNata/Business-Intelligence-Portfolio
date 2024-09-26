SELECT
    DATE_TRUNC(fsh.order_created_date, MONTH) as order_created_month,
    fsh.order_created_date,
    fsh.max_shop_interval,
    fsh.platform,
    dsi.brand_name,
    fsh.gmv,
    fsh.gross_item_sold,
    fsh.gross_order,
    fsh.onmv,
    fsh.onmv_item_sold,
    fsh.onmv_order,
	der.final_rate
FROM `bi-dwh-intrepid.intrepid_dwh.fact_shop_sales_hourly` fsh
JOIN `bi-dwh-intrepid.intrepid_dwh.dim_shop_info` dsi on fsh.shop_id = dsi.shop_id and fsh.venture = dsi.venture and fsh.order_created_date >= dsi.start_date and fsh.order_created_date <= dsi.end_date 
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_acl` dal ON fsh.shop_id = dal.shop_id and fsh.venture = dal.venture
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_exc_rate` der ON DATE_TRUNC(fsh.order_created_date, MONTH) = der.date and fsh.venture = der.venture
WHERE fsh.venture = 'ID' and REGEXP_CONTAINS(dal.emails, @DS_USER_EMAIL) and dsi.count_gmv_for_int = 1