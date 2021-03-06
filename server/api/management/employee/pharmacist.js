const express = require("express");
const router = express.Router();
const { connection } = require("../../../index");

// get all pharmacists
router.get("/pharmacist", (req, res) => {
	const sql = `SELECT * FROM person INNER JOIN pharmacist ON (person_id=ph_id)`;
	performQuery(sql, res);
});

// add new pharmacist
router.post("/pharmacist", (req, res) => {
	const { ph_id, qualifications } = req.body;
	const values = [ph_id, qualifications];
	const sql = `INSERT INTO pharmacist(ph_id, qualifications) VALUES(?)`;
	performQuery(sql, res, values);
});

// remove a pharmacist
router.delete("/pharmacist", (req, res) => {
	const { ph_id } = req.body;
	const sql = `DELETE FROM pharmacist WHERE ph_id='${ph_id}'`;
	performQuery(sql, res);
});

router.post("/pharmacist/assign", (req, res) => {
	const { ph_id, phmcy_id } = req.body;
	const sql = `INSERT INTO works_at_phmcy VALUES(?)`;
	const values = [ph_id, phmcy_id];
	performQuery(sql, res, values);
});

router.post("/pharmacist/unassign", (req, res) => {
	const { ph_id } = req.body;
	const sql = `DELETE FROM works_at_phmcy WHERE ph_id=${ph_id}`;
	performQuery(sql, res);
});

router.get("/pharmacist/pharmaciesAndPharmacists", (req, res) => {
	const sql = `SELECT * FROM (works_at_phmcy NATURAL JOIN pharmacy NATURAL JOIN pharmacist_info)`;
	performQuery(sql, res);
})

// Change phrmacy working at
router.patch("/pharmacist/works_at", (req, res) => {
	const { ph_id, phmcy_id } = req.body;
	const sql = `UPDATE works_at_phmcy SET phmcy_id='${phmcy_id}' WHERE ph_id='${ph_id}'`;
	performQuery(sql, res);
});

// Change qualification
router.patch("/pharmacist/quals", (req, res) => {
	const { ph_id, qualifications } = req.body;
	const sql = `UPDATE pharmacist SET qualifications='${qualifications}' WHERE ph_id='${ph_id}'`;
	performQuery(sql, res);
});

// Queries the given statement(stmt) and sends
// response using response(res) object
const performQuery = (stmt, res, values = []) => {
	connection.query(stmt, [values], (err, result) => {
		if (err) res.status(500).send(result);
		res.status(200).send(result);
	});
};

module.exports = router;
