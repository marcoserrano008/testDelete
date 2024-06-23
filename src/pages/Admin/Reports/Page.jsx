import React, { useState, useEffect } from "react";
import { Admin } from "../../../components/layout/admin/Admin";
import { Grid, Typography, Box } from "@mui/material";
import { DatePickerDemo } from "./DatePickerDemo";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { addDays, format } from "date-fns";
import Table_Periodo_List from "../../../hooks/Table/Table_Periodo_List";
import { getApi } from "../../../api/api";

const Page_Reportes = () => {
  const name = "Reporte de ambientes y docentes - FCYT ";

  const [selectedDate, setSelectedDate] = useState({
    from: addDays(new Date(2024, 6, 8), -1),
    to: new Date(2024, 6, 12),
  });

  const [books, setBooks] = useState([]);
  const [mostReservedRoom, setMostReservedRoom] = useState(null);
  const [mostReservedTeacher, setMostReservedTeacher] = useState(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    try {
      const booksData = await getApi(
        "https://backend-reservas-fcyt.vercel.app/api/book/books"
      );
      setBooks(booksData.book);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFetchData = () => {
    const startDate = addDays(selectedDate.from, -1);

    const filteredBooks = books.filter(
      (book) =>
        new Date(book.date) >= startDate &&
        new Date(book.date) <= selectedDate.to
    );
    if (filteredBooks.length === 0) {
      setNoData(true);
      setMostReservedRoom(null);
      setMostReservedTeacher(null);
    } else {
      setNoData(false);
      findMostReservedRoom(filteredBooks);
      findMostReservedTeacher(filteredBooks);
    }
  };

  const findMostReservedRoom = (books) => {
    const roomCount = books.reduce((acc, book) => {
      acc[book.name] = (acc[book.name] || 0) + 1;
      return acc;
    }, {});

    const mostReservedRoom = Object.keys(roomCount).reduce((a, b) =>
      roomCount[a] > roomCount[b] ? a : b
    );

    setMostReservedRoom({
      room: mostReservedRoom,
      reservationCount: roomCount[mostReservedRoom],
    });
  };

  const findMostReservedTeacher = (books) => {
    const teacherCount = books.reduce((acc, book) => {
      acc[book.name_teacher] = (acc[book.name_teacher] || 0) + 1;
      return acc;
    }, {});

    const mostReservedTeacher = Object.keys(teacherCount).reduce((a, b) =>
      teacherCount[a] > teacherCount[b] ? a : b
    );

    setMostReservedTeacher({
      teacher: mostReservedTeacher,
      reservationCount: teacherCount[mostReservedTeacher],
    });
  };

  //aqui para modificar el formato pdf :)
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [215.9, 279.4],
    });

    doc.setFont("courier", "bold");
    doc.setFontSize(15);
    doc.setTextColor(34, 49, 63);
    doc.text(name, 105, 25, { align: "center" });

    doc.setLineWidth(0.1);
    doc.line(10, 32, 207, 32);

    doc.setLineWidth(0.1);
    doc.line(10, 255, 207, 255);

    doc.setFontSize(12);
    doc.setTextColor(55, 71, 79);
    doc.text("Entre las fechas:", 25, 55);
    doc.text(`Desde: ${format(selectedDate.from, "dd-MM-yyyy")}`, 87, 65);
    doc.text(`Hasta: ${format(selectedDate.to, "dd-MM-yyyy")}`, 87, 73);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Ambientes", 40, 100);
    doc.text(
      `Ambiente con más reservas: ${
        mostReservedRoom ? mostReservedRoom.room : "No disponible"
      }`,
      53,
      113
    );
    doc.text(
      `Número de reservas: ${
        mostReservedRoom ? mostReservedRoom.reservationCount : "No disponible"
      }`,
      53,
      118
    );

    doc.text("Usuarios", 40, 135);
    doc.text(
      `Usuario con más reservas: ${
        mostReservedTeacher ? mostReservedTeacher.teacher : "No disponible"
      }`,
      53,
      148
    );
    doc.text(
      `Número de reservas: ${
        mostReservedTeacher
          ? mostReservedTeacher.reservationCount
          : "No disponible"
      }`,
      53,
      153
    );

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getFullYear()}`;
    const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
    const generatedText = `Generado el ${formattedDate} a las ${formattedTime}`;
    const pageNumber = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.text(generatedText, 140, 265);
    doc.text(`Página ${pageNumber}`, 105, 287);

    doc.save(`reporte_${formattedDate}.pdf`);
  };

  return (
    <Admin>
      <Grid container spacing={2} justifyContent="center">
        {/* Header */}
        <Grid item xs={12}>
          <Typography
            variant="h4"
            sx={{ borderBottom: "2px solid black", width: "100%" }}
          >
            {name}
          </Typography>
        </Grid>

        {/* Date Picker*/}
        <Grid item xs={12}>
          <Typography
            variant="h6"
            sx={{ marginTop: "3rem", marginLeft: "6rem", marginBottom: "1rem" }}
          >
            Entre las fechas:
          </Typography>
        </Grid>

        {/* Date Picker*/}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <DatePickerDemo
              date={selectedDate}
              onSelect={setSelectedDate}
              className="mr-4 mt-0"
            />
            <Button onClick={handleFetchData}>Buscar</Button>
          </Box>
        </Grid>

        <Grid id="report-content" item xs={12}>
          {/* Para los cards - Ambientes*/}
          <Typography
            variant="h6"
            sx={{ marginTop: "2rem", marginLeft: "15rem" }}
          >
            Ambientes
          </Typography>
          {/* Card */}
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div className="flex justify-between items-center border-b rounded-t-xl py-3 px-4 md:px-5 dark:border-neutral-700">
                <h3 className="text-lg text-gray-400 dark:text-white">
                  Ambiente con más reservas:{" "}
                  {mostReservedRoom ? (
                    <span style={{ fontWeight: "bold", color: "black" }}>
                      {mostReservedRoom.room}
                    </span>
                  ) : (
                    noData && (
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        No disponible
                      </span>
                    )
                  )}
                </h3>
              </div>
              <div className="p-4 md:p-3">
                <p className="text-lg text-gray-400 dark:text-white ml-2">
                  Número de reservas:{" "}
                  {mostReservedRoom ? (
                    <span style={{ fontWeight: "bold", color: "black" }}>
                      {mostReservedRoom.reservationCount}
                    </span>
                  ) : (
                    noData && (
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        No disponible
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Para los cards - Docentes*/}
          <Typography
            variant="h6"
            sx={{ marginTop: "3rem", marginLeft: "15rem" }}
          >
            Usuario
          </Typography>
          {/* Card */}
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div className="flex justify-between items-center border-b rounded-t-xl py-3 px-4 md:px-5 dark:border-neutral-700">
                <h3 className="text-lg text-gray-400 dark:text-white">
                  Usuario con más reservas:{" "}
                  {mostReservedTeacher ? (
                    <span style={{ fontWeight: "bold", color: "black" }}>
                      {mostReservedTeacher.teacher}
                    </span>
                  ) : (
                    noData && (
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        No disponible
                      </span>
                    )
                  )}
                </h3>
              </div>
              <div className="p-4 md:p-3">
                <p className="text-lg text-gray-400 dark:text-white ml-2">
                  Número de reservas:{" "}
                  {mostReservedTeacher ? (
                    <span style={{ fontWeight: "bold", color: "black" }}>
                      {mostReservedTeacher.reservationCount}
                    </span>
                  ) : (
                    noData && (
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        No disponible
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </Grid>

        <Grid
          container
          justifyContent="flex-end"
          sx={{ marginTop: "2rem", marginRight: "17rem" }}
        >
          <Button onClick={exportToPDF}>Exportar PDF</Button>
        </Grid>
      </Grid>
    </Admin>
  );
};

export default Page_Reportes;
