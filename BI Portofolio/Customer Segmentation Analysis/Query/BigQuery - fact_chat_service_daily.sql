-- -** Change Log **--
-- 2023-03-16 by Alief: change da.shop_name to dsi.shop_name bcs brand_name has cx brand mapping sheet in filter CX Reg Dashboard
-- 2023-04-19 by Alief: added cx_brand_mapping cte
-- 2023-06-21 by Alief: change dim_acl to dim_acl_cx_role (for CX Dashboard only)
-- 2023-12-05 By Alief: take out cx brand mapping bcs this datamodel come from seller center


SELECT
    cs.*except(unique_key, platform, response_rate),
        case when cs.total_chats > 0 then response_rate else null end AS response_rate,
        fp.followers, fp.new_followers,
    da.brand_name,
    da.shop_name, UPPER(da.platform) Platform,
        concat(da.shop_name, ' ', da.venture, ' - ', da.platform) AS shop_name_venture,
    cc.campaign_name, cc.campaign_type,
    coalesce(er.closing_rate, er.in_month_rate) AS exc_rate,
    da.count_gmv_for_int,
        da.use_cx_service,
    da.emails, 
    
FROM `fact_chat_service_daily` AS cs

LEFT JOIN `fact_store_performance_daily` AS fp -- Follower
    ON cs.shop_id = fp.shop_id
    AND cs.venture = fp.venture
    AND cs.data_date = fp.data_date

LEFT JOIN `dim_campaign_calendar` AS cc -- Campaign Calendar
    ON cs.shop_id = cc.shop_id
    AND cs.venture = cc.venture
    AND cs.data_date = cc.period

LEFT JOIN `dim_exc_rate` AS er -- Exchange Rate
    ON date_trunc(cs.data_date, MONTH) = er.date
    AND cs.venture = er.venture

JOIN `dim_acc_cx_role` AS da -- ACL
    ON cs.venture = da.venture
    AND cs.shop_id = da.shop_id

-- to filter our brands that end CX service but we still scrape data from SC
INNER JOIN `dim_shop_info` AS dsi
                ON cs.shop_id = dsi.shop_id 
                AND cs.venture = dsi.venture
                AND cs.data_date >= dsi.cx_start_date
                AND cs.data_date <= (CASE WHEN dsi.cx_end_date IS NULL THEN '2099-01-01' ELSE dsi.cx_end_date END)

    
 
WHERE
    da.platform not in ('N/A')
    AND da.platform is not null

        AND cs.data_date between date_sub(date_trunc(current_date('+8:00'), YEAR), interval 2 YEAR) AND current_date('+8:00') 
    AND REGEXP_CONTAINS(da.emails, @DS_USER_EMAIL)
    AND cs.data_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
        AND cs.data_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE)