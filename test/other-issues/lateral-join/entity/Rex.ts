import {Column, Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity("rex")
export default class Rex extends Base {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;

    @Column()
    id_rate_expense_category: number;
}
