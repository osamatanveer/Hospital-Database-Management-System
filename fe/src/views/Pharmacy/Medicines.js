import React, { useState, useEffect } from 'react'

import {
    Box,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
}
    from "@material-ui/core";

import { H2, Button, FormGroup, InputGroup, Card, Classes, RadioGroup, Radio, H3 } from "@blueprintjs/core";



import styled from "styled-components";
import axios from 'axios';


const Row = (props) => {
    const { med, onRemove } = props;

    return (
        <React.Fragment>
            <TableRow key={`${med.name}`}>
                <TableCell align="center" >{med.name}</TableCell>
                <TableCell align="center">
                    {<Button text="Remove" intent="danger" className={Classes.MINIMAL} icon="trash" onClick={() => onRemove(med)} />}
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeds();
    }, [])

    const fetchMeds = async () => {
        const url = `http://localhost:8000/management/medicine`;
        const meds = await (await axios.get(url)).data;
        setMedicines(meds);
        setLoading(false);
        console.log(meds)
    }

    const removeMed = async (med) => {
        const url = `http://localhost:8000/management/medicine`;
        const body = { name: med.name };
        const res = await axios.delete(url, { data: body });
        window.location.reload();
    }

    return (
        <ListContainer >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <H2>MEDICINES</H2>
            </div>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"><H3>Name</H3></TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicines?.length === 0 && <H2>No medicines Found!</H2>}
                        {medicines?.map((med) => (
                            <Row key={`${med.name}`} med={med}
                                onRemove={removeMed}
                            />
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>
        </ListContainer>
    )
}


const ListContainer = styled.div`
	position: absolute;
	left: 50%;
	top: 5%;
	width: 60%;	
	transform: translate(-50%);
`;

export default Medicines
