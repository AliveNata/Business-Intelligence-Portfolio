-- Changelog:
-- 2023-06-21 by Alief: change dim_acl to dim_acl_cx_role (for CX Dashboard only)
-- 2023-12-12 by Alief: back to dim_acl

SELECT
	cx.*,
	da.emails,
	upper(cx.platform) AS platform_upper,
	concat(upper(cx.shop_name), ' ', cx.venture, ' - ', upper(cx.platform)) AS shop_name_venture	
FROM `fact_cx_review_sc` AS cx

JOIN `dim_acc` AS da
    ON cx.venture = da.venture
    AND cx.shop_id = da.shop_id

WHERE
	REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
	AND cx.platform not in ('N/A')
	AND cx.platform is not null
	AND cx.data_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
	AND cx.data_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE)