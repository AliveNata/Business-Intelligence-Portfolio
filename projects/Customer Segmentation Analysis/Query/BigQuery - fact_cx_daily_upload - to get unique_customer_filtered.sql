--** Change Log **--
-- 2023-02-06 by Alief, adding cte mapping brand
-- 2023-06-21 by Alief: change dim_acl to dim_acl_cx_role (for CX Dashboard only)
-- 2023-08-07 by Alief: use upper (aa.brand_name) in join cx_brand_mapping to fact_cx_daily_log
-- 2023-08-07 by Alief: Adjust brand_name _mapping
-- 2024-01-27 by Alief: Takeout dim_shop_info and cx_brand_mapping

-- with cx_brand_mapping as
--   (
--   SELECT *
--   FROM `cx_brand_mapping` 
--   WHERE venture!=''
--   )


SELECT
    DATETIME(timestamp_input) timestamp,
	coalesce(actual_chat_date, date_input) as data_date,
    aa.venture,
	shift,
    upper(platform_name) platform,
    agent_name,
    chat_type,
    customer_name,
    upper(aa.brand_name) as brand_name,
    upper(aa.log_brand_name) log_brand_name ,
    -- upper(bm.pwh_brand_name) as mapping_brand_name,
    -- upper(aa.brand_name) as dim_shop_brand_name,
    concat(upper(aa.brand_name), ' ', aa.venture, ' - ', upper(aa.platform_name)) AS shop_name_venture,
    CONCAT(upper(aa.brand_name), ' - ', UPPER(aa.platform_name)) AS shop_name_platform,
    -- concat(COALESCE(cbm.pwh_brand_name, dsi.shop_name, aa.brand_name), ' ', aa.venture, ' - ', upper(aa.platform_name)) AS shop_name_venture,
    -- concat(upper(aa.brand_name), ' ', aa.venture, ' - ', upper(aa.platform_name)) AS shop_name_venture,
    CASE WHEN chat_type not in ('Rating - Product Negative', 'Rating - Product Positive', 'Rating - Seller Negative','Rating - Seller Positive','Rating - Logistic Positive', 'Rating - Logistic Negative','Blast Promo','Blast Unpaid','Discussion','Outbound Call') THEN lower(trim(customer_name)) ELSE NULL END AS customer_name_filtered,
    aa.processing_time
FROM    (SELECT 
        *
    FROM `fact_cx_daily_upload`
    WHERE date_input between date_sub(date_trunc(current_date('+8:00'), YEAR), interval 2 YEAR) AND current_date('+8:00') 
    ) aa
-- LEFT JOIN `cx_brand_mapping` bm on aa.venture = bm.venture and upper(aa.log_brand_name) = upper(bm.pws_brand_name)
JOIN `dim_acc_cx_role` AS da -- ACL
    ON aa.venture = da.venture
-- LEFT JOIN `dim_shop_info` dsi ON aa.shop_id = dsi.shop_id

WHERE
    REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
    AND coalesce(aa.actual_chat_date, aa.date_input) >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
    AND coalesce(aa.actual_chat_date, aa.date_input) <= PARSE_DATE('%Y%m%d', @DS_END_DATE)
