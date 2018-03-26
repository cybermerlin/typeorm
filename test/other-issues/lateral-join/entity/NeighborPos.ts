import {Column, Entity} from "../../../../src";
import Base from "./Base";

@Entity("neighbor_pos")
export default class NeighborPos extends Base {
    @Column()
    id_unit: number;
}
