import {Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity("packing_unit_type")
export default class PackingUnitType extends Base {
    @PrimaryGeneratedColumn()
    id: number;
}
