SELECT
	cx.* except(platform),
	da.emails,
	concat(upper(cx.shop_name), ' ', cx.venture, ' - ', upper(cx.platform)) AS shop_name_venture, 
    UPPER(cx.platform) as Platform
FROM `fact_cx_chat_sc` AS cx

JOIN `dim_acc` AS da
    ON cx.venture = da.venture
    AND cx.shop_id = da.shop_id

WHERE
	REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
	AND cx.platform not in ('N/A')
	AND cx.platform is not null
  	AND cx.data_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
	AND cx.data_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE)