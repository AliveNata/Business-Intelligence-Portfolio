--Changelog
--2023-09-13: Alief add shop_id in target data cte, and change brand_name to shop_id (in join target_data) for avoid bloated data
--2023-09-13: Alief switch in target_gmv_eom metrics from brand_name to shop_id
--2023-10-16: Alief create cte dim_calender to keep count target_gmv by platform even no sales data
--2023-11-21: Alief add target_nmv_eom

WITH dim_calender AS (
    SELECT distinct
        fod.order_created_date,
        dsi.platform_norm platform,
        dsi.brand_name,
  		dsi.shop_name,
        dsi.shop_id,
        dsi.venture,
        ifnull(fsd.gmv, 0) gmv,
        ifnull(fsd.gross_item_sold, 0) gross_item_sold,
        ifnull(fsd.gross_order, 0) gross_order,
        ifnull(fsd.onmv, 0) onmv,
        ifnull(fsd.onmv_item_sold, 0) onmv_item_sold,
        ifnull(fsd.onmv_order, 0) onmv_order
    FROM `fact_order_data` fod
    CROSS JOIN `dim_shop_info` dsi 
    LEFT JOIN `fact_shop_sales_daily` fsd on fsd.shop_id = dsi.shop_id and fsd.order_created_date = fod.order_created_date
    WHERE dsi.venture = 'ID' 
    and fod.order_created_date >= '2021-01-01'
    and dsi.count_gmv_for_int = 1
),

target_data AS (
    SELECT
        dtt.data_date,
        dsi.platform_norm platform,
        dsi.brand_name,
  		dsi.shop_name,
        dtt.shop_id,
        SUM(dtt.target_gmv) * MAX(der.final_rate) as target_gmv,
        SUM(dtt.target_nmv) * MAX(der.final_rate) as target_nmv,
        MAX(der.final_rate) as final_rate
    FROM `dim_target` dtt
    LEFT JOIN `dim_exc_rate` der ON dtt.data_date = der.date and dtt.venture = der.venture
    LEFT JOIN `dim_shop_info` dsi on dtt.shop_id = dsi.shop_id and dtt.venture = dsi.venture
    WHERE dtt.venture = 'ID'
    GROUP BY 
        dtt.data_date,
        dsi.platform_norm,
        dsi.brand_name,
        dsi.shop_name,
        dtt.shop_id
)

SELECT DISTINCT
    dcd.order_created_date,
    dcd.platform,
    dcd.brand_name,
	dsi.shop_name,
    dcd.gmv,
    dcd.gross_item_sold,
    dcd.gross_order,
    dcd.onmv,
    dcd.onmv_item_sold,
    dcd.onmv_order,
	COALESCE(der.final_rate, FIRST_VALUE(der.final_rate) OVER (PARTITION BY der.venture ORDER BY der.date DESC)) as final_rate,
    COALESCE(dpg.cumulative_phasing,1) as cum_phasing,
     dtt.target_gmv / COUNT(DISTINCT dcd.order_created_date) OVER (PARTITION BY dcd.shop_id, DATE_TRUNC(dcd.order_created_date, MONTH)) / COUNT(DISTINCT dcd.platform) OVER (PARTITION BY dsi.shop_id, dcd.order_created_date) as target_gmv_eom,
     dtt.target_nmv / COUNT(DISTINCT dcd.order_created_date) OVER (PARTITION BY dcd.shop_id, DATE_TRUNC(dcd.order_created_date, MONTH)) / COUNT(DISTINCT dcd.platform) OVER (PARTITION BY dsi.shop_id, dcd.order_created_date) as target_nmv_eom
FROM  dim_calender dcd
JOIN `dim_shop_info` dsi on dcd.shop_id = dsi.shop_id and dcd.venture = dsi.venture and dcd.order_created_date >= dsi.start_date and dcd.order_created_date <= dsi.end_date 
LEFT JOIN `dim_acc` dal ON dcd.shop_id = dal.shop_id and dcd.venture = dal.venture
LEFT JOIN `dim_exc_rate` der ON DATE_TRUNC(dcd.order_created_date, MONTH) = der.date and dcd.venture = der.venture
LEFT JOIN target_data dtt on date_trunc(dcd.order_created_date, MONTH) = dtt.data_date and dcd.shop_id = dtt.shop_id
LEFT JOIN `dim_phasing` dpg on dcd.order_created_date = dpg.data_date and dcd.venture = dpg.venture
WHERE dcd.venture = 'ID' 
and REGEXP_CONTAINS(dal.emails, @DS_USER_EMAIL) 
and dcd.order_created_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE) 
and dcd.order_created_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE)

