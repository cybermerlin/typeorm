import {Entity} from "../../../../src";
import Base from "./Base";

@Entity("list_classification")
export default class Classification extends Base {
    part_number: number;
    net_weight: number;
    gross_weight: number;

    id_sex: number;
}
