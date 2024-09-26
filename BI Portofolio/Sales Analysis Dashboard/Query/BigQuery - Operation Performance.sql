WITH order_data AS (
    SELECT 
        dsi.brand_name,
        fod.platform,
        fod.order_created_date,
        fod.unit_price * fod.quantity - fod.seller_promo as amount,
        fod.order_fraction,
        case 
            when fod.cancelled_by LIKE "%BUYER%" and fod.is_cancelled = 1 THEN "BUYER"
            when (fod.cancelled_by LIKE "%SELLER%" OR fod.cancelled_by LIKE "%GANDALF%" OR fod.cancelled_by LIKE "%OPS%") and fod.is_cancelled = 1   THEN "SELLER"
            when fod.cancelled_by IN ( 'CUSTOMER SERVICE-CANCEL', 'CUSTOMER SERVICE-ONLY_REFUND') and fod.is_cancelled = 1 THEN "SELLER"
            when fod.cancelled_by LIKE "%SYSTEM%" and fod.is_cancelled = 1  THEN "SYSTEM"
            when fod.is_cancelled = 1 THEN COALESCE(fod.cancelled_by, 'SYSTEM')
            else fod.cancelled_by 
        end as cancelled_by,
 		fod.is_gmv,
        fod.is_unpaid,
        fod.is_pending,
        fod.is_rts,
        fod.is_packed,
        fod.is_shipped,
        fod.is_delivered,
        fod.is_returned,
        fod.is_cancelled
    FROM `bi-dwh-intrepid.intrepid_dwh.fact_order_data` fod
    JOIN `bi-dwh-intrepid.intrepid_dwh.dim_shop_info` dsi on fod.venture = dsi.venture and fod.shop_id = dsi.shop_id and fod.order_created_date >= dsi.start_date and fod.order_created_date <= dsi.end_date
    LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_acl` dal on fod.shop_id = dal.shop_id and fod.venture = dal.venture
    WHERE fod.venture = 'ID' and REGEXP_CONTAINS(dal.emails, @DS_USER_EMAIL) and fod.order_created_date >= PARSE_DATE('%Y%m%d', @DS_START_DATE) and fod.order_created_date <= PARSE_DATE('%Y%m%d', @DS_END_DATE) and fod.is_gwp = 0 and dsi.count_gmv_for_int = 1
)

SELECT 
    brand_name,
    platform,
    order_created_date,
    SUM(case when is_gmv = 1 THEN amount else 0 END) total_amount,
    SUM(case when is_gmv = 1 THEN order_fraction else 0 END) total_order,
    SUM(case when is_unpaid = 1 THEN amount else 0 END) unpaid_amount,
    SUM(case when is_unpaid = 1 THEN order_fraction else 0 END) unpaid_order,
    SUM(case when is_pending = 1 THEN amount else 0 END) pending_amount,
    SUM(case when is_pending = 1 THEN order_fraction else 0 END) pending_order,
    SUM(case when is_rts = 1 THEN amount else 0 END) rts_amount,
    SUM(case when is_rts = 1 THEN order_fraction else 0 END) rts_order,
    SUM(case when is_packed = 1 THEN amount else 0 END) packed_amount,
    SUM(case when is_packed = 1 THEN order_fraction else 0 END) packed_order,
    SUM(case when is_shipped = 1 THEN amount else 0 END) shipped_amount,
    SUM(case when is_shipped = 1 THEN order_fraction else 0 END) shipped_order,
    SUM(case when is_delivered = 1 THEN amount else 0 END) delivered_amount,
    SUM(case when is_delivered = 1 THEN order_fraction else 0 END) delivered_order,
    SUM(case when is_returned = 1 THEN amount else 0 END) returned_amount,
    SUM(case when is_returned = 1 THEN order_fraction else 0 END) returned_order,
    SUM(case when is_cancelled = 1 THEN amount else 0 END) cancelled_amount,
    SUM(case when is_cancelled = 1 THEN order_fraction else 0 END) cancelled_order,
    SUM(case when is_cancelled = 1 and cancelled_by = 'SELLER' THEN amount else 0 END) cancelled_seller_amount,
    SUM(case when is_cancelled = 1 and cancelled_by = 'SELLER' THEN order_fraction else 0 END) cancelled_seller_order,
    SUM(case when is_cancelled = 1 and cancelled_by = 'BUYER' THEN amount else 0 END) cancelled_buyer_amount,
    SUM(case when is_cancelled = 1 and cancelled_by = 'BUYER' THEN order_fraction else 0 END) cancelled_buyer_order,
    SUM(case when is_cancelled = 1 and cancelled_by = 'SYSTEM' THEN amount else 0 END) cancelled_system_amount,
    SUM(case when is_cancelled = 1 and cancelled_by = 'SYSTEM' THEN order_fraction else 0 END) cancelled_system_order,
    MAX(final_rate) as final_rate
FROM order_data oda
LEFT JOIN `bi-dwh-intrepid.intrepid_dwh.dim_exc_rate` der on DATE_TRUNC(oda.order_created_date, MONTH) = der.date and der.venture = 'ID'
GROUP BY 
    brand_name,
    platform,
    order_created_date;
