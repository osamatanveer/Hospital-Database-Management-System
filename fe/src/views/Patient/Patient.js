import React, { PureComponent } from "react";
import styled from 'styled-components';
import { Alignment, Button, Classes, Divider, H5, H6, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, FormGroup, InputGroup } from "@blueprintjs/core";
import { Form } from 'react-bootstrap';
import { USER_PROPERTIES } from './UserProperties';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import { DateInput } from "@blueprintjs/datetime";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Modal from 'react-modal';
import Tests from './Tests';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ToastContainer, toast } from 'react-toastify';

const TABS = {
    PersonalInfo: { value: "PERSONAL_INFORMATION", text: "Personal Information" },
    Appointments: { value: "APPOINTMENTS", text: "Appointments" },
    Tests: { value: "TESTS", text: "Tests" }
}
class Patient extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            activePage: TABS.Appointments.value,
            appointments: [],
            departments: [],
            availableDocs: [],
            deptName: undefined,
            showSymptomsAndDiagnosis: false,
            symptoms: [],
            diagnosis: [],
            unavailableDates: undefined,
            ...JSON.parse(localStorage.getItem("user")),
        };
    }

    componentDidMount() {
        if (!localStorage.getItem("user") || !this.state.hasOwnProperty("pid")) {
            this.props.history.push("/login");
        }
        this.getAllAppointmentsForPatient();
        this.getAllDepartments();
    }

    render() {
        return (
            <div>
                <NavbarGroup align={Alignment.RIGHT}>
                    <NavbarHeading align={Alignment.LEFT}>Patient Profile</NavbarHeading>
                    <NavbarDivider />
                    <Button className={Classes.MINIMAL} icon="person" text={TABS.PersonalInfo.text} onClick={() => this.setState({ activePage: TABS.PersonalInfo.value })} />
                    <Button className={Classes.MINIMAL} icon="calendar" text={TABS.Appointments.text} onClick={() => this.setState({ activePage: TABS.Appointments.value })} />
                    <Button className={Classes.MINIMAL} icon="lab-test" text={TABS.Tests.text} onClick={() => this.setState({ activePage: TABS.Tests.value })} />
                    <Button className={Classes.MINIMAL} icon="log-out" text={"Logout"} onClick={() => {
                        localStorage.removeItem("user");
                        this.props.history.push("/login");
                    }} />
                </NavbarGroup>
                <Body>
                    {this.renderView()}
                </Body>
                <Modal isOpen={this.state.showSymptomsAndDiagnosis} contentLabel="Example Modal" ariaHideApp={false}>
                    <div>
                        <h3>Symptoms</h3>
                        <ol>{this.state.symptoms.map(symptom => { return <li>{symptom.name}</li> })}</ol>
                        <h3>Diagnosis</h3>
                        <ol>{this.state.diagnosis.map(dia => { return <li>{dia.name}</li> })}</ol>
                    </div>
                    <Button text="Exit" intent="danger" onClick={() => this.setState({ showSymptomsAndDiagnosis: false, symptoms: [], diagnosis: [] })} />
                </Modal>
            </div>

        );
    }

    renderView = () => {
        const { activePage, deptName, appointmentDate } = this.state;
        switch (activePage) {
            case TABS.PersonalInfo.value:
                return (
                    <PropertiesContainer>
                        <H5>{TABS.PersonalInfo.text}</H5>
                        <div className="row">
                            {USER_PROPERTIES.map((property, index) => {
                                if (this.state[property.value]) {
                                    return (
                                        <Form.Group controlId={"property " + index} id={"property " + index} className="col-4">
                                            <Form.Label>{property.text}</Form.Label>
                                            <Form.Control placeholder="Fetching Details" value={this.state[property.value]} readOnly />
                                        </Form.Group>
                                    )
                                }
                                return null;
                            })}
                        </div>
                    </PropertiesContainer>
                );
            case TABS.Appointments.value:
                return (
                    <>
                        <H5>{TABS.Appointments.text}</H5>
                        {/* <AppointmentSearchOptionsContainer>
                            <AppointmentDateContainer>
                                <FormGroup label="Appointment Date" labelFor="appointmentDate">
                                    <DateInput 
                                        formatDate={date => moment(date).format("YYYY-MM-DD")} 
                                        onChange={(date) => this.setState({ appointmentDate: moment(date).format("YYYY-MM-DD") })} 
                                        parseDate={str => new Date(str)} placeholder={"YYYY-MM-DD"}
                                        minDate={new Date()}
                                    />
                                </FormGroup>
                            </AppointmentDateContainer>
                            <DepartmentsContainer>
                                <FormGroup label="Department Name" labelFor="deptName">
                                    <Dropdown options={this.state.departments.map(department => department.name)} onChange={(val) => this.setState({ deptName: val.value })} value={this.state.deptName} placeholder="Department" />
                                </FormGroup>   
                            </DepartmentsContainer>
                            <OperationsContainer>
                                {this.state.unavailableDates && <Calendar 
                                    tileDisabled={({ date }) => this.state.unavailableDates.includes(moment(date).format("YYYY-MM-DD"))}
                                    onChange={this.getDoctorsForADate}
                                    minDate={new Date()}
                                    />}
                                <Button onClick={this.listAvailableDoctors} text="List Available Dates" intent="primary" disabled={!deptName || !appointmentDate} />
                            </OperationsContainer>
                        </AppointmentSearchOptionsContainer> */}
                        <div className="row no-gutters">
                            <FormGroup label="Appointment Date" labelFor="appointmentDate" className="col-3">
                                <DateInput
                                    formatDate={date => moment(date).format("YYYY-MM-DD")}
                                    onChange={(date) => this.setState({ appointmentDate: moment(date).format("YYYY-MM-DD") })}
                                    parseDate={str => new Date(str)} placeholder={"YYYY-MM-DD"}
                                    minDate={new Date()}
                                />
                            </FormGroup>
                            <DepartmentsContainer className="col-3">
                                <FormGroup label="Department Name" labelFor="deptName">
                                    <Dropdown options={this.state.departments.map(department => department.name)} onChange={(val) => this.setState({ deptName: val.value, availableDocs: [], unavailableDates: undefined })} value={this.state.deptName} placeholder="Department" />
                                </FormGroup>
                            </DepartmentsContainer>
                            <StyledButton onClick={this.listAvailableDoctors} text="List Available Dates" intent="primary" disabled={!deptName || !appointmentDate} className="col-2" />
                        </div>
                        {this.state.unavailableDates && <Calendar
                            tileDisabled={({ date }) => this.state.unavailableDates.includes(moment(date).format("YYYY-MM-DD"))}
                            onChange={this.getDoctorsForADate}
                            minDate={new Date()}
                            className="col-4"
                        />}
                        <AvailableDocsContainer>
                            <Divider />
                            <H5>Available Doctors</H5>
                            {this.state.availableDocs && this.state.availableDocs.length !== 0 ?
                                <TableContainer component={Paper}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left">Name</TableCell>
                                                <TableCell align="left">Specialization</TableCell>
                                                <TableCell align="left">Qualifications</TableCell>
                                                <TableCell align="left">Email</TableCell>
                                                <TableCell align="left">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {this.state.availableDocs.map((row) => (
                                                <TableRow key={"appointment" + row.person_id}>
                                                    <TableCell align="left">{`${row.first_name} ${row.middle_name || ""} ${row.last_name}`}</TableCell>
                                                    <TableCell align="left">{row.specialization}</TableCell>
                                                    <TableCell align="left">{row.qualification}</TableCell>
                                                    <TableCell align="left">{row.e_mail}</TableCell>
                                                    <TableCell align="left">
                                                        <FormGroup label="Description" labelFor="description">
                                                            <InputGroup id="description" placeholder="Description" type="text" onChange={e => this.setState({ description: e.target.value })} />
                                                        </FormGroup>
                                                        <Button intent="success" text="Book Appointment" onClick={() => this.bookAppointment(row.person_id)} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer> : <H6>No Available Doctors</H6>}
                        </AvailableDocsContainer>

                        <AppoitnmentsContainer>
                            <Divider />
                            {this.state.availableDocs && this.state.appointments.length !== 0 ?
                                <>
                                    <H5>Appointments</H5>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left">Date</TableCell>
                                                    <TableCell align="left">Doctor Name</TableCell>
                                                    <TableCell align="left">Description</TableCell>
                                                    <TableCell align="left">Status</TableCell>
                                                    <TableCell align="left">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.appointments.map((row) => (
                                                    <TableRow key={"appointment" + row.appt_id}>
                                                        <TableCell component="th" scope="row">{moment(row.date).format("YYYY-MM-DD")}</TableCell>
                                                        <TableCell align="left">{`${row.first_name} ${row.middle_name || ""} ${row.last_name}`}</TableCell>
                                                        <TableCell align="left">{row.description}</TableCell>
                                                        <TableCell align="left">{row.status}</TableCell>
                                                        <TableCell align="left">
                                                            <Button text="Cancel" intent="danger" onClick={() => this.cancelAppointment(row.appt_id)}></Button>
                                                            <Button text="Info" intent="primary" onClick={() => this.getSymptomsAndDiseases(row.appt_id)}></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer> </> : <H6>No Appointments Booked!</H6>}
                        </AppoitnmentsContainer>

                    </>
                );
            case TABS.Tests.value:
                return (
                    <Tests />
                );
        }
    }

    getAllAppointmentsForPatient = () => {
        this.setState({ loading: true }, () => {
            axios.get(`http://localhost:8000/appointment/${this.state.pid}`)
                .then((res) => {
                    this.setState({ appointments: res.data });
                })
                .catch((error) => {
                    toast(error.message, { style: { backgroundColor: "red", color: "white" } })
                })
                .finally(() => {
                    this.setState({ loading: false });
                });
        })
    }

    bookAppointment = (d_id) => {
        const { pid, description, potentialDate } = this.state;
        const objToSend = {
            p_id: pid,
            d_id: d_id,
            date: moment(potentialDate).format("YYYY-MM-DD"),
            description: description || " "
        }
        this.setState({ loading: true }, () => {
            axios.post(`http://localhost:8000/appointment`, { ...objToSend })
                .then((res) => {
                    this.setState({ availableDocs: [], unavailableDates: undefined }, () => {
                        this.getAllAppointmentsForPatient();
                    });
                    toast("Appointment Successfully booked!", { style: { backgroundColor: "green", color: "white" } });
                })
                .catch(error => {
                    toast("Could not book appointment.", { style: { backgroundColor: "red", color: "white" } })
                })
                .finally(() => {
                    this.setState({ loading: false });
                });
        })
    }

    cancelAppointment = (appt_id) => {
        axios.patch(`http://localhost:8000/appointment`, { appt_id }).then(res => {
            toast("Appointment Successfully cancelled!", { style: { backgroundColor: "green", color: "white" } });
            this.getAllAppointmentsForPatient();
        }).catch(error => {
            toast("Could not cancel appointment.", { style: { backgroundColor: "red", color: "white" } })
        })
    }

    listAvailableDoctors = () => {
        const { appointmentDate, deptName } = this.state;
        let startDate = new Date(appointmentDate);
        let endDate = new Date(appointmentDate);
        endDate.setDate(endDate.getDate() + 30);
        this.setState({ loading: true }, () => {
            startDate = moment(startDate).format("YYYY-MM-DD");
            endDate = moment(endDate).format("YYYY-MM-DD");
            axios.get(`http://localhost:8000/management/employee/doctor/${startDate}/${endDate}/${deptName}`)
                .then((res) => {
                    this.setState({ unavailableDates: res.data.map(data => moment(data.date).format("YYYY-MM-DD")) });
                })
                .catch(error => {
                    toast("Could not fetch available doctors, try again.", { style: { backgroundColor: "red", color: "white" } })
                })
                .finally(() => {
                    this.setState({ loading: false });
                })
        });
    }

    getAllDepartments = () => {
        this.setState({ loading: true }, () => {
            axios.get("http://localhost:8000/management/departmentWithDoctors")
                .then((res) => {
                    this.setState({ departments: res.data }, () => {
                        this.setState({ loading: false });
                    })
                })
                .catch(error => {
                    toast(error.message, { style: { backgroundColor: "red", color: "white" } })
                })
        })
    }

    getSymptomsAndDiseases = (appt_id) => {
        this.setState({ showSymptomsAndDiagnosis: true }, () => {
            axios.get(`http://localhost:8000/appointment/symptom/${appt_id}`)
                .then(res => {
                    this.setState({ symptoms: res.data });
                })
                .catch(error => {
                    toast("Could not fetch symptoms.", { style: { backgroundColor: "red", color: "white" } });
                });
            axios.get(`http://localhost:8000/appointment/diagnosis/${appt_id}`)
                .then(res => {
                    this.setState({ diagnosis: res.data });
                })
                .catch(error => {
                    toast("Could not fetch diseases.", { style: { backgroundColor: "red", color: "white" } });
                });
        });
    }

    getDoctorsForADate = (date) => {
        this.setState({ loading: true, potentialDate: date }, () => {
            const { deptName } = this.state;
            const appointmentDate = moment(date).format("YYYY-MM-DD");
            axios.get(`http://localhost:8000/management/employee/doctor/${appointmentDate}/${deptName}`)
                .then(res => {
                    this.setState({ availableDocs: res.data })
                })
                .catch(error => {
                    toast("Could not fetch doctors for this date, try again.", { style: { backgroundColor: "red", color: "white" } });
                })
                .finally(() => {
                    this.setState({ loading: false })
                })
        })
    }
}


const Body = styled.div`
    position: absolute;
    top: 45px;
    left: 10px;
    width: 100%;
    border-top: 1px solid grey;
`;

const PropertiesContainer = styled.div`
    padding: 50px;
`;

const AppointmentSearchOptionsContainer = styled.div`

`;

const DepartmentsContainer = styled.div`
    width: 15%;
    display: inline-block;
`;

const AppointmentDateContainer = styled.div`
    display: inline-block;
`;

const AppoitnmentsContainer = styled.div`
    margin-top: 100px;
`;

const AvailableDocsContainer = styled.div`
    margin-top: 100px;
`;

const OperationsContainer = styled.div`
    display: inline-block;
`;

const StyledButton = styled(Button)`
    height: 20px;
    position: relative;
    top: 25px;
    left: 10px;
`;
export default Patient;
