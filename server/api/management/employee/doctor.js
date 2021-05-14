const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { connection } = require("../../../index");

router.get("/", (req, res) => {
	const sql = `SELECT * FROM person WHERE person_id NOT IN (
		(SELECT pid FROM patient AS person_id) UNION     
		(SELECT lt_id person_id FROM lab_technician AS person_id) UNION     
		(SELECT ph_id FROM pharmacist AS person_id) UNION     
		(SELECT man_id FROM manager AS person_id)
	)`;
	performQuery(sql, res);	
})

// get all doctors
router.get("/doctor", (req, res) => {
	const sql = `SELECT * FROM person INNER JOIN doctor ON (person_id=d_id);`;
	performQuery(sql, res);
});

// add a new doctor
router.post("/doctor", (req, res) => {
	const { d_id, dept_name, specialization, qualification } = req.body;
	const values = [d_id, dept_name, specialization, qualification];
	const sql = `INSERT INTO doctor(d_id, dept_name, specialization, qualification) VALUES(?)`;
	performQuery(sql, res, values);
});

router.delete("/doctor", (req, res) => {
	const { d_id } = req.body;
	const sql = `DELETE FROM doctor WHERE d_id='${d_id}'`;
	performQuery(sql, res);
});

// change specialization
router.patch("/doctor/spec", (req, res) => {
	const { d_id, specialization } = req.body;
	const sql = `UPDATE doctor SET specialization='${specialization}' WHERE d_id='${d_id}'`;
	performQuery(sql, res);
});
// change qualification
router.patch("/doctor/qual", (req, res) => {
	const { d_id, qualification } = req.body;
	const sql = `UPDATE doctor SET qualification='${qualification}' WHERE d_id='${d_id}'`;
	performQuery(sql, res);
});
// change department
router.patch("/doctor/dept", (req, res) => {
	const { d_id, dept_name } = req.body;
	const sql = `UPDATE doctor SET dept_name='${dept_name}' WHERE d_id='${d_id}'`;
	performQuery(sql, res);
});

// Queries the given statement(stmt) and sends
// response using response(res) object
const performQuery = (stmt, res, values = []) => {
	connection.query(stmt, [values], (err, result) => {
		// console.log(result);
		if (err) res.status(500).send(result);
		res.status(200).send(result);
	});
};

module.exports = router;
