import {Column, Entity} from "../../../../src";
import Base from "./Base";

@Entity("positions_group_sub_totals")
export default class PositionsGroupSubTotals extends Base {
    @Column()
    log_sum: number;
    @Column()
    customs_sum: number;
}
