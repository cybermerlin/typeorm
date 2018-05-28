import {getMetadataArgsStorage} from "../../index";
import {TableMetadataArgs} from "../../metadata-args/TableMetadataArgs";
import {EntityOptions} from "../..";

/**
 * Special type of the entity used in the class-table inherited tables.
 * If you have options all in one object
 * @param {EntityOptions} options
 * @return {Function}
 */
export function ClassEntityChild(options?: EntityOptions): Function;

/**
 * Special type of the entity used in the class-table inherited tables.
 * If you have separate table name and options (or maybe not exist the option)
 * @param {string} tableName
 * @param {EntityOptions} options
 * @return {Function}
 */
export function ClassEntityChild(tableName?: string, options?: EntityOptions): Function;

/**
 * Special type of the entity used in the class-table inherited tables.
 */
export function ClassEntityChild(nameOrOptions?: string|EntityOptions, maybeOptions?: EntityOptions): Function {
    const options = (typeof nameOrOptions === "object" ? nameOrOptions as EntityOptions : maybeOptions) || {};
    const name = typeof nameOrOptions === "string" ? nameOrOptions : options.name;

    return function (target: Function) {
        const args: TableMetadataArgs = {
            target: target,
            name: name,
            type: "class-table-child",
            orderBy: options && options.orderBy ? options.orderBy : undefined,
            engine: options && options.engine ? options.engine : undefined,
            database: options && options.database ? options.database : undefined,
            schema: options && options.schema ? options.schema : undefined,
            skipSync: (options && options.skipSync === true)
        };
        getMetadataArgsStorage().tables.push(args);
    };
}
