import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { postApi } from "../../api/api";
import { useAuth0 } from '@auth0/auth0-react';

const RegisterModal = ({ setOpen, target, getReserva }) => {
  const [startDate, setStartDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [block, setBlock] = useState("");
  const [capacity, setCapacity] = useState("");
  const [webaddress, setWebAddress] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    block: "",
    wbaddress: "",
    name_teacher: "",
    date: "",
    day: "",
    schedule: "",
  });
  const { user, isAuthenticated } = useAuth0();
  const [userProfileImage, setUserProfileImage] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      setUserProfileImage(user.picture);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (target) {
      const {
        startDate,
        startTime,
        endTime,
        slug,
        block,
        capacity,
        webaddress,
      } = target;
      const date = new Date(startDate);
      const dayOfWeekIndex = date.getDay(); 

      const adjustedDayOfWeekIndex = (dayOfWeekIndex + 8) % 7; 

      const dayOfWeekOptions = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];

      const newDayOfWeek = dayOfWeekOptions[adjustedDayOfWeekIndex];

      setStartDate(startDate);
      setDayOfWeek(newDayOfWeek);
      setStartTime(startTime);
      setEndTime(endTime);
      setBlock(block);
      setCapacity(capacity);
      setWebAddress(webaddress);

      rangeValidation(
        startTime,
        newDayOfWeek,
        slug,
        block,
        capacity,
        webaddress,
        startDate
      );
    }
  }, [target]);

  const rangeValidation = (
    startTime,
    dayOfWeek,
    slug,
    block,
    capacity,
    webaddress,
    date
  ) => {
    let newBlockTime = "";
    switch (startTime) {
      case "06:45:00":
        newBlockTime = "A";
        break;
      case "08:15:00":
        newBlockTime = "B";
        break;
      case "09:45:00":
        newBlockTime = "C";
        break;
      case "11:15:00":
        newBlockTime = "D";
        break;
      case "12:45:00":
        newBlockTime = "E";
        break;
      case "14:15:00":
        newBlockTime = "F";
        break;
      case "15:45:00":
        newBlockTime = "G";
        break;
      case "17:15:00":
        newBlockTime = "H";
        break;
      case "18:45:00":
        newBlockTime = "I";
        break;
      case "20:15:00":
        newBlockTime = "J";
        break;
      default:
        newBlockTime = "";
    }
    setBlockTime(newBlockTime);
    setFormData({
      name: slug,
      capacity: capacity,
      block: block,
      wbaddress: webaddress,
      name_teacher: isAuthenticated && user.name || 'Admin',
      date: new Date(date).toISOString(),
      day: dayOfWeek,
      schedule: newBlockTime,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schedules = {
      "06:45:00": "A",
      "08:15:00": "B",
      "09:45:00": "C",
      "11:15:00": "D",
      "12:45:00": "E",
      "14:15:00": "F",
      "15:45:00": "G",
      "17:15:00": "H",
      "18:45:00": "I",
      "20:15:00": "J",
    };
    
    const startTimes = Object.keys(schedules);
    const startIndex = startTimes.indexOf(startTime);
    const endIndex = startTimes.indexOf(endTime);

    if (startTime === "20:15:00" && endTime === "21:45:00") {
      const formDataCopy = { ...formData, schedule: "J" };
      try {
        const response = await postApi(
          "http://localhost:8080/api/book/register",
          formDataCopy
        );
        if (response.status === 200) {
          console.log("Datos enviados con éxito para el schedule J");
        } else {
          console.error("Error en la solicitud a la API para el schedule J:", response);
        }
      } catch (error) {
        console.error("Error sending data to API for schedule J:", error);
      }
    } else {
      for (let i = startIndex; i < endIndex; i++) {
        const schedule = schedules[startTimes[i]];
        const formDataCopy = { ...formData, schedule };

        try {
          const response = await postApi(
            "http://localhost:8080/api/book/register",
            formDataCopy
          );
          if (response.status === 200) {
            console.log(`Datos enviados con éxito para el schedule ${schedule}`);
          } else {
            console.error(`Error en la solicitud a la API para el schedule ${schedule}:`, response);
          }
        } catch (error) {
          console.error(`Error sending data to API for schedule ${schedule}:`, error);
        }
      }
    }
    
    getReserva();
    handleClose();
  };

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogTitle>Registrar Reserva</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Por favor, confirme la reserva para el:
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="startDate"
          name="startDate"
          label="Fecha de la reserva"
          type="text"
          fullWidth
          variant="standard"
          value={startDate}
          InputProps={{ readOnly: true }}
        />
        <TextField
          margin="dense"
          id="dayOfWeek"
          name="dayOfWeek"
          label="Día de la semana"
          type="text"
          fullWidth
          variant="standard"
          value={dayOfWeek}
          InputProps={{ readOnly: true }}
        />
        <TextField
          margin="dense"
          id="startTime"
          name="startTime"
          label="Hora de inicio"
          type="text"
          fullWidth
          variant="standard"
          value={startTime}
          InputProps={{ readOnly: true }}
        />
        <TextField
          margin="dense"
          id="endTime"
          name="endTime"
          label="Hora de fin"
          type="text"
          fullWidth
          variant="standard"
          value={endTime}
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Registrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;
