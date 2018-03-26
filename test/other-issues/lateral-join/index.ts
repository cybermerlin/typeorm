import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src";
import Unit from "./entity/Unit";
import Sex from "./entity/Sex";
import {Student} from "./entity/example/Student";
import Classification from "./entity/Classification";
import Currency from "./entity/Currency";
import Order from "./entity/Order";
import NeighborClass from "./entity/NeighborClass";
import PackingUnitType from "./entity/PackingUnitType";
import PositionsGroupSubTotals from "./entity/PositionsGroupSubTotals";
import Rex from "./entity/Rex";
import FinOperation from "./entity/FinOperation";

/*
TODO: as result should be this SQL-query
select
	list_order_positions.id,
	list_order_positions.brutto,

	list_currency.charcode as list_currency_name,
	operation.packing_unit_type.name as packing_unit_type_name,

	list_classification.part_number as part_number,

	(list_order_positions.price * list_order_positions.quantity) as sum_price,

	coalesce( list_order_positions.rnb_index, round( (list_order_positions.netto / list_order_positions.brutto)::numeric, 2 ) ) as rnb_index,
	coalesce(list_order_positions.price_per_kg, (list_order_positions.price * list_order_positions.quantity) / list_order_positions.netto) as price_per_kg,

	(case
		when
			list_order_positions.quantity >= 0 and
			list_order_positions.quantity > list_order_positions.children_quantity_sum
		then 1
		else 0
	end) as has_remains,

	(case
		when
			list_order_positions.id_parent_part_order_position is null and
			list_order_positions.quantity >= 0 and
			list_order_positions.quantity > list_order_positions.children_quantity_sum
			or
			list_order_positions.id_parent_part_order_position is not null and
			list_order_positions.id_unit is not null
		then 1
		else 0
	end) as is_move_table,

	(case
		when list_order_positions.id_parent_part_order_position is null
		then list_order_positions.quantity - list_order_positions.children_quantity_sum
		else null
	end) as remains,

	parent_position.quantity as parent_quantity,

	list_order_positions.quantity * list_classification.net_weight as total_net_weight,
	list_order_positions.quantity * list_classification.gross_weight as total_gross_weight,

	sex.name as sex,

    positions_group_sub_totals.log_sum as log_sum,
    positions_group_sub_totals.customs_sum as customs_sum

from list_order_positions

	left join list_currency on
		list_currency.id = list_order_positions.id_list_currency

	left join operation.packing_unit_type on
		operation.packing_unit_type.id = list_order_positions.id_packing_unit_type

	left join list_classification on
		list_classification.id = list_order_positions.id_list_classification

	left join operation.unit on
		operation.unit.id = list_order_positions.id_unit

	left join list_order_positions as parent_position on
		parent_position.id = list_order_positions.id_parent_part_order_position

	left join sex on
		list_classification.id_sex = sex.id

	LEFT JOIN LATERAL (
				SELECT
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category = -1
						)
					, 0) AS log_sum,
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category = -2
						)
					, 0) AS customs_sum,
					coalesce(
						sum( finops.sum_in_curs_by_prop )
						FILTER ( WHERE
							finops.id_rate_expense_category is null or
							finops.id_rate_expense_category NOT IN (-1, -2)
						)
					, 0) AS other_sum

				from list_order_positions as child_pos

					inner join list_classification as child_class on
						child_class.id = child_pos.id_list_classification

					left join lateral (
						select
							sum( neighbor_class.net_weight * neighbor_pos.quantity ) as total_net_weight
						from list_order_positions as neighbor_pos

						inner join list_classification as neighbor_class on
							neighbor_class.id = neighbor_pos.id_list_classification

						where
							neighbor_pos.id_unit = child_pos.id_unit and
							neighbor_pos.deleted = 0
					) as unit_info on true

					inner join lateral (
						select
							rex.id_rate_expense_category,
							rex.name as rex_name,
							coalesce(
								( finops.sum_with_vat_in_curs / array_length(finops.units_ids, 1) ) *
								( child_class.net_weight * child_pos.quantity / unit_info.total_net_weight ),
								0
							) as sum_in_curs_by_prop

						from operation.fin_operation as finops

						INNER JOIN operation.rate_expense_type as rex ON
							rex.id = finops.id_rate_expense_type

						where
							finops.id_order = child_pos.id_list_orders and
							child_pos.id_unit = any( finops.units_ids ) and
							finops.deleted = 0 AND
							finops.is_valid = 1 and
							finops.id_fin_operation_type = 1
					) as finops on true

				where
					list_order_positions.id_parent_part_order_position is not null and
					child_pos.id = list_order_positions.id
					or
					child_pos.id_parent_part_order_position = list_order_positions.id and
					child_pos.deleted = 0

	) AS positions_group_sub_totals on true

 */


// look      functional/table-inheritance/class-table/basic-functionality/basic-functionality.ts

describe("other issues > lateral join", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        enabledDrivers: ["postgres"],
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true,
        driverSpecific: {
            logging: ["info"]
        }
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should return the correct data", () => Promise.all(connections.map(async connection => {
        // region Create
        const classification = new Classification({
            connection: connection
        });
        await classification.save();

        const currency = new Currency({
            connection: connection
        });
        await currency.save();

        const finOperation = new FinOperation({
            connection: connection
        });
        await finOperation.save();

        const neighborClass = new NeighborClass({
            connection: connection
        });
        await neighborClass.save();

        const order = new Order({
            connection: connection
        });
        await order.save();

        const packingUnitType = new PackingUnitType({
            connection: connection
        });
        await packingUnitType.save()

        const positionGroupSubTotals = new PositionsGroupSubTotals({
            connection: connection
        });
        positionGroupSubTotals.save();

        const rex = new Rex({
            connection: connection
        });
        await rex.save()

        const sex = new Sex({
            connection: connection
        });
        await sex.save()

        const unit = new Unit({
            connection: connection
        });
        await unit.save()

        //endregion

        // -------------------------------------------------------------------------
        //region Select

        let loadedStudents = await connection.manager
            .createQueryBuilder(Student, "students")
            // .orderBy("students.id")
            .getMany();

        loadedStudents[0].should.have.all.keys("id", "name", "faculty");
        loadedStudents[0].id.should.equal(1);
        loadedStudents[0].name.should.equal("Alice");
        loadedStudents[0].faculty.should.equal("Economics");
        loadedStudents[1].should.have.all.keys("id", "name", "faculty");
        loadedStudents[1].id.should.equal(2);
        loadedStudents[1].name.should.equal("Bob");
        loadedStudents[1].faculty.should.equal("Programming");

        let loadedTeachers = await connection.manager
            .createQueryBuilder(Teacher, "teachers")
            .getMany();

        loadedTeachers[0].should.have.all.keys("id", "name", "specialization", "salary");
        loadedTeachers[0].id.should.equal(3);
        loadedTeachers[0].name.should.equal("Mr. Garrison");
        loadedTeachers[0].specialization.should.equal("Geography");
        loadedTeachers[0].salary.should.equal(2000);
        loadedTeachers[1].should.have.all.keys("id", "name", "specialization", "salary");
        loadedTeachers[1].id.should.equal(4);
        loadedTeachers[1].name.should.equal("Mr. Adler");
        loadedTeachers[1].specialization.should.equal("Mathematics");
        loadedTeachers[1].salary.should.equal(4000);

        let loadedAccountants = await connection.manager
            .createQueryBuilder(Accountant, "accountants")
            .getMany();

        loadedAccountants[0].should.have.all.keys("id", "name", "department", "salary");
        loadedAccountants[0].id.should.equal(5);
        loadedAccountants[0].name.should.equal("Mr. Burns");
        loadedAccountants[0].department.should.equal("Bookkeeping");
        loadedAccountants[0].salary.should.equal(3000);
        loadedAccountants[1].should.have.all.keys("id", "name", "department", "salary");
        loadedAccountants[1].id.should.equal(6);
        loadedAccountants[1].name.should.equal("Mr. Trump");
        loadedAccountants[1].department.should.equal("Director");
        loadedAccountants[1].salary.should.equal(5000);
        //endregion

        // -------------------------------------------------------------------------
        //region Update
        let loadedStudent = await connection.manager
            .createQueryBuilder(Student, "student")
            .where("student.name = :name", {name: "Bob"})
            .getOne();

        console.log(loadedStudent);

        loadedStudent!.faculty = "Chemistry";
        await connection.getRepository(Student).save(loadedStudent!);

        loadedStudent = await connection.manager
            .createQueryBuilder(Student, "student")
            .where("student.name = :name", {name: "Bob"})
            .getOne();

        loadedStudent!.should.have.all.keys("id", "name", "faculty");
        loadedStudent!.id.should.equal(2);
        loadedStudent!.name.should.equal("Bob");
        loadedStudent!.faculty.should.equal("Chemistry");

        let loadedTeacher = await connection.manager
            .createQueryBuilder(Teacher, "teacher")
            .where("teacher.name = :name", {name: "Mr. Adler"})
            .getOne();

        loadedTeacher!.salary = 1000;
        await connection.getRepository(Teacher).save(loadedTeacher!);

        loadedTeacher = await connection.manager
            .createQueryBuilder(Teacher, "teacher")
            .where("teacher.name = :name", {name: "Mr. Adler"})
            .getOne();

        loadedTeacher!.should.have.all.keys("id", "name", "specialization", "salary");
        loadedTeacher!.id.should.equal(4);
        loadedTeacher!.name.should.equal("Mr. Adler");
        loadedTeacher!.specialization.should.equal("Mathematics");
        loadedTeacher!.salary.should.equal(1000);

        let loadedAccountant = await connection.manager
            .createQueryBuilder(Accountant, "accountant")
            .where("accountant.name = :name", {name: "Mr. Trump"})
            .getOne();

        loadedAccountant!.salary = 1000;
        await connection.getRepository(Accountant).save(loadedAccountant!);

        loadedAccountant = await connection.manager
            .createQueryBuilder(Accountant, "accountant")
            .where("accountant.name = :name", {name: "Mr. Trump"})
            .getOne();

        loadedAccountant!.should.have.all.keys("id", "name", "department", "salary");
        loadedAccountant!.id.should.equal(6);
        loadedAccountant!.name.should.equal("Mr. Trump");
        loadedAccountant!.department.should.equal("Director");
        loadedAccountant!.salary.should.equal(1000);
        // endregion
    })));

});
