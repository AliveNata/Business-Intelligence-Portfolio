WITH aggregate_data AS (
    SELECT 
        dsi.brand_name,
  		dsi.intrepid_active_in_month,
        DATE_TRUNC(fsd.order_created_date, MONTH) as order_created_month,
        SUM(fsd.onmv) as onmv,
        MAX(der.final_rate) as final_rate,
        MAX(dal.emails) as emails,
        MAX(dpg.cumulative_phasing) as cum_phasing
    FROM `bi-dwh-intrepid.intrepid_dwh.fact_shop_sales_daily` fsd
  	JOIN `bi-dwh-intrepid.intrepid_dwh.dim_shop_info` dsi on fsd.shop_id = dsi.shop_id and fsd.venture = dsi.venture and fsd.order_created_date <= dsi.end_date
    LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_acl` dal on fsd.shop_id = dal.shop_id and fsd.venture = dal.venture
    LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_exc_rate` der on DATE_TRUNC(fsd.order_created_date, MONTH) = der.date and fsd.venture = der.venture
    LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_phasing` dpg on fsd.order_created_date = dpg.data_date and fsd.venture = dpg.venture
    WHERE fsd.venture = 'ID' and fsd.order_created_date >= PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 6 MONTH)))) and order_created_date < CURRENT_DATE("Asia/Jakarta") and dsi.count_gmv_for_int = 1
    GROUP BY
        dsi.brand_name,
        order_created_month,
  		dsi.intrepid_active_in_month
)
SELECT 
    brand_name,
    order_created_month,
    onmv,
    final_rate,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 6 MONTH)))) THEN onmv ELSE 0 END) as M_6,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 5 MONTH)))) THEN onmv ELSE 0 END) as M_5,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 4 MONTH)))) THEN onmv ELSE 0 END) as M_4,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 3 MONTH)))) THEN onmv ELSE 0 END) as M_3,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 2 MONTH)))) THEN onmv ELSE 0 END) as M_2,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY), INTERVAL 1 MONTH)))) THEN onmv ELSE 0 END) as M_1,
    MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY)))) THEN onmv ELSE 0 END) as MTD,
	MAX(CASE WHEN order_created_month = PARSE_DATE("%Y-%m-%d",(FORMAT_DATE('%Y-%m-01',DATE_SUB(CURRENT_DATE("Asia/Jakarta"), INTERVAL 1 DAY)))) THEN cum_phasing ELSE 0 END) as cum_phasing,
	intrepid_active_in_month as account_status
FROM aggregate_data
WHERE REGEXP_CONTAINS(emails, @DS_USER_EMAIL)
GROUP BY     
    brand_name,
    order_created_month,
    onmv,
    final_rate,
	intrepid_active_in_month;
