import {Column, Entity} from "../../../../src";
import Base from "./Base";

@Entity("sex")
export default class Sex extends Base {
    @Column()
    name: string;
}
