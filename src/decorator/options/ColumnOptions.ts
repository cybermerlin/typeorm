import {ColumnType} from "../../driver/types/ColumnTypes";
import {ValueTransformer} from "./ValueTransformer";

/**
 * Describes all column's options.
 */
export interface ColumnOptions {

    /**
     * Column type. Must be one of the value from the ColumnTypes class.
     */
    type?: ColumnType;

    /**
     * Column name in the database.
     */
    name?: string;

    /**
     * Column type's length. Used only on some column types.
     * For example type = "string" and length = "100" means that ORM will create a column with type varchar(100).
     */
    length?: string|number;

    /**
     * Column type's display width. Used only on some column types in MySQL.
     * For example, INT(4) specifies an INT with a display width of four digits.
     */
    width?: number;

    /**
     * Indicates if column's value can be set to NULL.
     */
    nullable?: boolean;

    /**
     * Indicates if column value is not updated by "save" operation.
     * It means you'll be able to write this value only when you first time insert the object.
     * Default value is "false".
     */
    readonly?: boolean;

    /**
     * Indicates if column is always selected by QueryBuilder and find operations.
     * Default value is "true".
     */
    select?: boolean;

    /**
     * Default database value.
     */
    default?: any;

    /**
     * ON UPDATE trigger. Works only for MySQL.
     */
    onUpdate?: string;

    /**
     * Indicates if this column is a primary key.
     * Same can be achieved when @PrimaryColumn decorator is used.
     */
    primary?: boolean;

    /**
     * Specifies if column's value must be unique or not.
     */
    unique?: boolean;

    /**
     * Column comment. Not supported by all database types.
     */
    comment?: string;

    /**
     * The precision for a decimal (exact numeric) column (applies only for decimal column), which is the maximum
     * number of digits that are stored for the values.
     */
    precision?: number|null;

    /**
     * The scale for a decimal (exact numeric) column (applies only for decimal column), which represents the number
     * of digits to the right of the decimal point and must not be greater than precision.
     */
    scale?: number;

    /**
     * Puts ZEROFILL attribute on to numeric column. Works only for MySQL.
     * If you specify ZEROFILL for a numeric column, MySQL automatically adds the UNSIGNED attribute to this column
     */
    zerofill?: boolean;

    /**
     * Puts UNSIGNED attribute on to numeric column. Works only for MySQL.
     */
    unsigned?: boolean;

    /**
     * Defines a column character set.
     * Not supported by all database types.
     */
    charset?: string;

    /**
     * Defines a column collation.
     */
    collation?: string;

    /**
     * Array of possible enumerated values.
     */
    enum?: any[]|Object;

    /**
     * Generated column expression. Supports only in MySQL.
     */
    asExpression?: string;

    /**
     * Generated column type. Supports only in MySQL.
     */
    generatedType?: "VIRTUAL"|"STORED";

    /**
     * Return type of HSTORE column.
     * Returns value as string or as object.
     */
    hstoreType?: "object"|"string";

    /**
     * Indicates if this column is an array.
     * Can be simply set to true or array length can be specified.
     * Supported only by postgres.
     */
    array?: boolean;

    /**
     * Specifies a value transformer that is to be used to (un)marshal
     * this column when reading or writing to the database.
     */
    transformer?: ValueTransformer;

    /**
     * It specifies a SQL query. A completed SQL string (maybe a subquery or a chain of SQL).
     * Or it maybe a function returning a SQL string. (Executable context is Column context)
     */
    sql?: string|Function;

    /**
     * Alias column name.
     */
    aliasName?: string;
}
