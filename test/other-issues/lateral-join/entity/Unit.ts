import {Entity, PrimaryGeneratedColumn} from "../../../../src";
import Base from "./Base";

@Entity()
export default class Unit extends Base {
    @PrimaryGeneratedColumn()
    id: number;
}
