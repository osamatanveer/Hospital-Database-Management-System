const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { connection } = require('../../index');

// Read all patients
router.get("/patient", (req, res) => {
	const sql     = `SELECT * FROM patient`;

	connection.query(sql, (err, results) => {
		if (err) {
			res.status(200).send(err);
		} else {
			res.status(200).send(results);
		}
	});
});

// Add a patient
router.post("/patient", (req, res) => {
    const { person_id, height, weight, blood_group } = req.body;
    const height_int = parseFloat(height);
    const weight_int = parseFloat(weight);
    const registration_date = moment(new Date()).format( "YYYY-MM-DD" );
    tuple = [ person_id, height_int, weight_int, blood_group, registration_date ];
    const sql = "INSERT INTO patient (pid, height, weight, blood_group, registration_date) VALUES (?)";
    
    connection.query(sql, [tuple], (error, result) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send("Patient Inserted successfully!");
        }
    });
});

// Remove a patient
router.delete("/patient", async (req, res) => {
	// Prepare values
	const { pid } = req.body;

	// Prepare sql
	const sql = `DELETE FROM patient
				 WHERE pid = '${pid}'`;

	// Perform sql
	connection.query(sql, async (err, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

// Update a patient height
router.put("/patient/height", async (req, res) => {
	// Prepare values
	const { pid, height } = req.body;
    const height_int = parseFloat(height);

	// Prepare sql
	const sql = `UPDATE patient
                 SET height = '${height_int}'
				 WHERE pid = '${pid}'`;

	// Perform sql
	connection.query(sql, async (err, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

// Update a patient weight
router.put("/patient/weight", async (req, res) => {
	// Prepare values
	const { pid, weight } = req.body;
    const weight_int = parseFloat(weight);

	// Prepare sql
	const sql = `UPDATE patient
                 SET weight = '${weight_int}'
				 WHERE pid = '${pid}'`;

	// Perform sql
	connection.query(sql, async (err, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

// Update a patient blood group
router.put("/patient/blood_group", async (req, res) => {
	// Prepare values
	const { pid, blood_group } = req.body;

	// Prepare sql
	const sql = `UPDATE patient
                 SET blood_group = '${blood_group}'
				 WHERE pid = '${pid}'`;

	// Perform sql
	connection.query(sql, async (err, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

module.exports = router