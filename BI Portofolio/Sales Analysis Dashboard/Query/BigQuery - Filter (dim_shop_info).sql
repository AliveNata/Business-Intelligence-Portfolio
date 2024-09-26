SELECT
	DISTINCT
	dsi.end_date,
	dsi.brand_name,
	dsi.platform_norm as platform,
	dal.emails
FROM `bi-dwh-intrepid.intrepid_dwh.dim_shop_info` dsi
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_acl` dal ON dsi.shop_id = dal.shop_id and dsi.venture = dal.venture
WHERE dsi.venture = 'ID' and REGEXP_CONTAINS(dal.emails, @DS_USER_EMAIL) and dsi.end_date >= PARSE_DATE('%Y%m%d', @DS_END_DATE)