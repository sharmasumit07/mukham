"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Snackbar,
} from "@mui/material";
import dynamic from "next/dynamic";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const TimeKeeper = dynamic(() => import("react-timekeeper"), { ssr: false });

const AddUser = () => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("Employee");
  const [shift, setShift] = useState("");

  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftName, setShiftName] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("17:00");
  const [timePickerOpen, setTimePickerOpen] = useState(null);
  const [timePickerStep, setTimePickerStep] = useState("hour");

  const departments = [
    { id: 1, name: "HR" },
    { id: 2, name: "Engineering" },
    { id: 3, name: "Marketing" },
    { id: 4, name: "Sales" },
    { id: 5, name: "Finance" },
  ];

  const countryPhoneLengths = {
    us: 10, // United States
    ca: 10, // Canada
    gb: 10, // United Kingdom
    in: 10, // India
    au: 10, // Australia
    de: 11, // Germany
    fr: 9, // France
    it: 10, // Italy
    es: 9, // Spain
    jp: 10, // Japan
  };

  const validatePhoneNumber = (phoneNumber, country) => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const countryCodeLength = country.dialCode.length;
    const numberWithoutCode = digitsOnly.slice(countryCodeLength);
    const requiredLength = countryPhoneLengths[country.countryCode];
    if (!requiredLength) return true;

    if (country.countryCode === "in") {
      return (
        numberWithoutCode.length === 10 &&
        /^[6-9]/.test(numberWithoutCode)
      );
    }
    return numberWithoutCode.length === requiredLength;
  };

  const handlePhoneChange = (value, country) => {
    setPhone(value);
    const isValid = validatePhoneNumber(value, country);
    setPhoneValid(isValid);
  };

  const handleTimeSelection = (time) => {
    const currentPicker = timePickerOpen;

    if (timePickerStep === "hour") {
      setTimePickerStep("minute");
    } else if (timePickerStep === "minute") {
      setTimePickerStep("meridiem");
    } else {
      if (currentPicker === "start") {
        setShiftStartTime(time.formatted12);
      } else {
        setShiftEndTime(time.formatted12);
      }
      setTimePickerOpen(null);
      setTimePickerStep("hour");
    }
  };

  const handleAddShift = () => {
    if (!shiftName || !shiftStartTime || !shiftEndTime) {
      setSnackbarMessage("Please fill in all shift details.");
      setSnackbarOpen(true);
      return;
    }

    setShift(`${shiftName} (${shiftStartTime} - ${shiftEndTime})`);
    setSnackbarMessage("Shift added successfully!");
    setSnackbarOpen(true);

    setShiftName("");
    setShiftStartTime("09:00");
    setShiftEndTime("17:00");
    setShiftDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!name || !email || !phoneValid || !department || !shift) {
      setSnackbarMessage("Please fill in all required fields correctly.");
      setSnackbarOpen(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage("Please enter a valid email address.");
      setSnackbarOpen(true);
      return;
    }

    const newUser = {
      name,
      email,
      phone,
      department,
      role,
      shift,
    };

    console.log("User added:", newUser);
    setSnackbarMessage("User added successfully!");
    setSnackbarOpen(true);

    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setRole("Employee");
    setShift("");
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        style={{
          background: "#282A97",
          color: "#fff",
        }}
        onClick={() => setOpen(true)}
      >
        Add User
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name *"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={name === ""}
            helperText={name === "" ? "Name is required" : ""}
          />

          <TextField
            margin="dense"
            label="Email Address *"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email === ""}
            helperText={email === "" ? "Email is required" : ""}
          />

          <div style={{ marginTop: "16px", marginBottom: "8px" }}>
            <PhoneInput
              country={"us"}
              value={phone}
              onChange={handlePhoneChange}
              inputStyle={{
                width: "100%",
                height: "56px",
                borderColor: phoneValid ? "#ccc" : "#f44336",
              }}
              isValid={phoneValid}
              enableSearch
              countryCodeEditable={false}
            />
            {!phoneValid && phone && (
              <div
                style={{
                  color: "#f44336",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Please enter a valid phone number for the selected country
              </div>
            )}
          </div>

          <FormControl fullWidth margin="dense" variant="outlined" error={department === ""}>
            <InputLabel>Department *</InputLabel>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              label="Department *"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label='Role'
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Supervisor">Supervisor</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Shift *"
            fullWidth
            variant="outlined"
            value={shift}
            onClick={() => setShiftDialogOpen(true)}
            readOnly
            error={shift === ""}
            helperText={shift === "" ? "Shift is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!name || !email || !phoneValid || !department || !shift}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shiftDialogOpen} onClose={() => setShiftDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Shift</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shift Name *"
            fullWidth
            variant="outlined"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            error={shiftName === ""}
            helperText={shiftName === "" ? "Shift name is required" : ""}
          />

          <TextField
            margin="dense"
            label="Start Time *"
            fullWidth
            variant="outlined"
            value={shiftStartTime}
            onClick={() => setTimePickerOpen("start")}
            readOnly
          />

          <TextField
            margin="dense"
            label="End Time *"
            fullWidth
            variant="outlined"
            value={shiftEndTime}
            onClick={() => setTimePickerOpen("end")}
            readOnly
          />

          {timePickerOpen && (
            <TimeKeeper
              time={
                timePickerOpen === "start"
                  ? shiftStartTime
                  : shiftEndTime
              }
              onChange={handleTimeSelection}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShiftDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAddShift}
            color="primary"
            variant="contained"
            disabled={!shiftName || !shiftStartTime || !shiftEndTime}
          >
            Add Shift
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default AddUser;
