SELECT cs.*, da.emails, dsi.brand_name, dsi.shop_name, UPPER(dsi.platform_norm) platform_upper, CONCAT(dsi.shop_name, ' - ' , dsi.venture) shop_name_venture
FROM  `fact_cx_acht_by_agent` cs
LEFT JOIN `dim_acc_cx_role` AS da -- ACL
    ON cs.venture = da.venture
    AND cs.shop_id = da.shop_id
 JOIN `dim_shop_info` AS dsi
    ON cs.shop_id = dsi.shop_id 
    AND cs.venture = dsi.venture
    AND cs.created_at >= dsi.cx_start_date
    AND cs.created_at <= (CASE WHEN dsi.cx_end_date IS NULL THEN '2099-01-01' ELSE dsi.cx_end_date END)
WHERE created_at >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
AND created_at  <= PARSE_DATE('%Y%m%d', @DS_END_DATE)
AND REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
