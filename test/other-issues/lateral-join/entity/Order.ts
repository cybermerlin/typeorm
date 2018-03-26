import {Column, Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity("list_order_positions")
export default class Order extends Base {
    @PrimaryGeneratedColumn()
    id: number;
    brutto: number;
    netto: number;
    price: number;
    quantity: number;
    rnb_index: number;
    children_quantity_sum: number;

    @Column()
    id_parent_part_order_position: number;
    @Column()
    id_unit: number;
    @Column()
    id_list_currency: number;
    @Column()
    id_packing_unit_type: number;
    @Column()
    id_list_classification: number;
}
