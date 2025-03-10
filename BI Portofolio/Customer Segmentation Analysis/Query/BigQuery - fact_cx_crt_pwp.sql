-- Changelog:
-- 2023-06-21 by Alief: change dim_acl to dim_acl_cx_role (for CX Dashboard only)
-- 2024-04-23 by Alief: change crt_pwp_message to cx_chat_message and add dim_shop_info table

SELECT
  cx.* ,
  da.emails,
  da.use_cx_service,
  dsi.brand_name,
  upper(cx.platform) AS platform_upper,
  concat(upper(dsi.shop_name), ' ', cx.venture, ' - ', upper(cx.platform)) AS shop_name_venture  
FROM `fact_cx_crt_pwp` AS cx
LEFT JOIN `dim_shop_info` AS dsi 
    ON cx.shop_id = dsi.shop_id
JOIN `dim_acc_cx_role` AS da
    ON cx.venture = da.venture
    AND cx.shop_id = da.shop_id
WHERE
  REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
  AND cx.platform not in ('N/A')
  AND cx.platform is not null
  AND cx.data_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
  AND cx.data_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE)