import {Column, Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity("neighbor_class")
export default class NeighborClass extends Base {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    net_weight: number;
}
