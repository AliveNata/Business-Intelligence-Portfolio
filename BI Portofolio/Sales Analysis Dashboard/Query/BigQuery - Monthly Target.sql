WITH monthly_sales AS (
    SELECT
        DATE_TRUNC(fsd.order_created_date, MONTH) as data_date,
        dsi.brand_name,
        SUM(gmv) as gmv_monthly,
        SUM(onmv) as nmv_monthly,
        MAX(dpg.cumulative_phasing) as cum_phasing
    FROM `fact_shop_sales_daily` fsd
    JOIN `dim_shop_info` dsi on fsd.shop_id = dsi.shop_id and fsd.venture = dsi.venture and fsd.order_created_date >= dsi.start_date and fsd.order_created_date <= dsi.end_date 
    LEFT JOIN `dim_phasing` dpg on fsd.order_created_date = dpg.data_date and fsd.venture = dpg.venture
    WHERE fsd.venture = 'ID' and fsd.order_created_date < CURRENT_DATE() and dsi.count_gmv_for_int = 1
    GROUP BY 1, 2
),
target_data AS (
    SELECT
        dtt.data_date,
        dsi.brand_name,
        SUM(dtt.target_gmv) * MAX(der.final_rate) as target_gmv,
        SUM(dtt.target_nmv) * MAX(der.final_rate) as target_nmv,
        MAX(der.final_rate) as final_rate
    FROM `dim_target` dtt
    LEFT JOIN `dim_exc_rate` der ON dtt.data_date = der.date and dtt.venture = der.venture
    LEFT JOIN `dim_acc` dal ON dtt.shop_id = dal.shop_id and dtt.venture = dal.venture
    LEFT JOIN `dim_shop_info` dsi on dtt.shop_id = dsi.shop_id and dtt.venture = dsi.venture
    WHERE dtt.venture = 'ID' and REGEXP_CONTAINS( dal.emails, @DS_USER_EMAIL)
    GROUP BY 
        dtt.data_date,
        dsi.brand_name
)

SELECT 
  tda.*,
  COALESCE(mss.gmv_monthly,0) as gmv_monthly,
  COALESCE(mss.gmv_monthly,0) / COALESCE(mss.cum_phasing,1) as gmv_rr,
  COALESCE(mss.nmv_monthly,0) as nmv_monthly,
  COALESCE(mss.nmv_monthly,0) / COALESCE(mss.cum_phasing,1) as nmv_rr,
  COALESCE(mss.cum_phasing,1) as cum_phasing,
  COALESCE(LEAD(mss.gmv_monthly) OVER (PARTITION BY tda.brand_name ORDER BY tda.data_date DESC),0) as gmv_last_month,
COALESCE(LEAD(mss.nmv_monthly) OVER (PARTITION BY tda.brand_name ORDER BY tda.data_date DESC),0) as nmv_last_month
FROM target_data tda
LEFT JOIN monthly_sales mss on tda.data_date = mss.data_date and tda.brand_name = mss.brand_name;
