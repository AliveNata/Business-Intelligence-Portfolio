-- CHangelog
-- 2023-06-21 by Alief: change dim_acl to dim_acl_cx_role (for CX Dashboard only)

SELECT
  cs.*except(unique_key, processing_time),
  da.count_gmv_for_int,
	da.use_cx_service,
  da.emails
FROM `fact_cx_manpower_data` AS cs


JOIN `dim_acc_cx_role` AS da -- ACL
    ON cs.venture = da.venture

WHERE
    da.platform not in ('N/A')
    AND da.platform is not null
    AND REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)