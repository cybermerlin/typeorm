select
	list_order_positions.id,
	list_order_positions.brutto,
	
	list_currency.charcode as list_currency_name,
	operation.packing_unit_type.name as packing_unit_type_name,
    
	list_classification.part_number as part_number,
	
	(list_order_positions.price * list_order_positions.quantity) as sum_price,
    
	coalesce( list_order_positions.rnb_index, round( (list_order_positions.netto / list_order_positions.brutto)::numeric, 2 ) ) as rnb_index,
	coalesce(list_order_positions.price_per_kg, (list_order_positions.price * list_order_positions.quantity) / list_order_positions.netto) as price_per_kg,
	
	(case
		when
			list_order_positions.quantity >= 0 and
			list_order_positions.quantity > list_order_positions.children_quantity_sum
		then 1
		else 0
	end) as has_remains,
    
	(case
		when
			list_order_positions.id_parent_part_order_position is null and
			list_order_positions.quantity >= 0 and
			list_order_positions.quantity > list_order_positions.children_quantity_sum
			or
			list_order_positions.id_parent_part_order_position is not null and
			list_order_positions.id_unit is not null
		then 1
		else 0
	end) as is_move_table,
    
	(case
		when list_order_positions.id_parent_part_order_position is null
		then list_order_positions.quantity - list_order_positions.children_quantity_sum
		else null
	end) as remains,
    
	parent_position.quantity as parent_quantity,
    
	list_order_positions.quantity * list_classification.net_weight as total_net_weight,
	list_order_positions.quantity * list_classification.gross_weight as total_gross_weight,
    
	sex.name as sex,
    
    positions_group_sub_totals.log_sum as log_sum,
    positions_group_sub_totals.customs_sum as customs_sum
    
from list_order_positions

	left join list_currency on
		list_currency.id = list_order_positions.id_list_currency

	left join operation.packing_unit_type on
		operation.packing_unit_type.id = list_order_positions.id_packing_unit_type

	left join list_classification on
		list_classification.id = list_order_positions.id_list_classification

	left join operation.unit on
		operation.unit.id = list_order_positions.id_unit

	left join list_order_positions as parent_position on
		parent_position.id = list_order_positions.id_parent_part_order_position

	left join sex on
		list_classification.id_sex = sex.id

	LEFT JOIN LATERAL (
				SELECT
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category = -1
						)
					, 0) AS log_sum,
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category = -2
						)
					, 0) AS customs_sum,
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category is null or
							finops.id_rate_expense_category NOT IN (-1, -2)
						)
					, 0) AS other_sum

				from list_order_positions as child_pos

					inner join list_classification as child_class on
						child_class.id = child_pos.id_list_classification

					left join lateral (
						select
							sum( neighbor_class.net_weight * neighbor_pos.quantity ) as total_net_weight
						from list_order_positions as neighbor_pos

						inner join list_classification as neighbor_class on
							neighbor_class.id = neighbor_pos.id_list_classification

						where
							neighbor_pos.id_unit = child_pos.id_unit and
							neighbor_pos.deleted = 0
					) as unit_info on true

					inner join lateral (
						select
							rex.id_rate_expense_category,
							rex.name as rex_name,
							coalesce(
								( finops.sum_with_vat_in_curs / array_length(finops.units_ids, 1) ) *
								( child_class.net_weight * child_pos.quantity / unit_info.total_net_weight ),
								0
							) as sum_in_curs_by_prop

						from operation.fin_operation as finops

						INNER JOIN operation.rate_expense_type as rex ON
							rex.id = finops.id_rate_expense_type

						where
							finops.id_order = child_pos.id_list_orders and
							child_pos.id_unit = any( finops.units_ids ) and
							finops.deleted = 0 AND
							finops.is_valid = 1 and
							finops.id_fin_operation_type = 1
					) as finops on true

				where
					list_order_positions.id_parent_part_order_position is not null and
					child_pos.id = list_order_positions.id
					or
					child_pos.id_parent_part_order_position = list_order_positions.id and
					child_pos.deleted = 0

	) AS positions_group_sub_totals on true
