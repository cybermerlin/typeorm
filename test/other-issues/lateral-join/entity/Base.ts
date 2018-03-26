import {Column, Connection} from "../../../../src";

export default class Base {
    @Column({type: "smallint", default: 0})
    deleted: number;
    @Column({type: "bigint"})
    id_list_user_create: number;
    @Column({type: "bigint"})
    id_list_user_update: number;
    @Column({type: "timestamp without time zone"})
    dt_update: Date;
    @Column({type: "timestamp without time zone", default: "now_utc()"})
    dt_create: Date;
    @Column({type: "smallint", default: 0})
    is_blocked: number;
    @Column({type: "json"})
    colors: string;


    constructor(cfg: object) {
        const ps = Object.getOwnPropertyNames(cfg);
        ps.forEach(p => {
            if (this.hasOwnProperty(p)) {
                this[p] = cfg[p];
            }
        })
    }


    connection: Connection;

    async save() {
        return this.connection.getRepository(this.constructor.name).save(this);
    }
}
