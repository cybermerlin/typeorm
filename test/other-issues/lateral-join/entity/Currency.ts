import {Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity("list_currency")
export default class Currency extends Base {
    @PrimaryGeneratedColumn()
    id: number;
    charcode: number;
}
