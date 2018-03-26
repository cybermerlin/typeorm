import Base from "./Base";
import {Column, Entity} from "../../../../src";

@Entity("fin_operation")
export default class FinOperation extends Base {
    @Column()
    sum_in_curs_by_prop: number;
    @Column()
    sum_with_vat_in_curs: number;
    @Column()
    units_ids: Array<number>;
    @Column()
    is_valid: boolean;

    @Column()
    id_rate_expense_category: number;
    @Column()
    id_rate_expense_type: number;
    @Column()
    id_order: number;
    @Column()
    id_fin_operation_type: number;
}
