"use strict";

const reservations = JSON.parse(reservationsEJS);
const tutorSchedule = JSON.parse(tutorScheduleEJS);

let timeSelector = document.getElementById("timeOptions");
let datePicker = document.getElementById("datePicker");

datePicker.addEventListener("change", (event) => {
  // clear current options
  timeSelector.length = 0;

  const filtered = reservations.filter((element, index) => {
    return element.meetingDate === datePicker.value;
  });

  const myDate = datePicker.value.split("-");
  const weekday = new Date(
    parseInt(myDate[0]),
    parseInt(myDate[1]) - 1,
    parseInt(myDate[2])
  ).toLocaleDateString("en-us", { weekday: "long" });

  const tutorScheduleonSelectedDay = tutorSchedule.filter((element) => {
    return element.dayOfWeek === weekday.toLowerCase();
  });

  const reservationsOnSelectedDay = reservations.filter((element) => {
    return element.meetingDate === datePicker.value;
  });

  let final = [];

  // check if time is already reserved
  for (const e of tutorScheduleonSelectedDay) {
    let found = reservationsOnSelectedDay.some((element) => {
      return element.meetingTime === e.meetingTime;
    });

    if (!found) {
      final.push(e);
    }
  }

  for (const e of final) {
    let option = document.createElement("option");
    option.text = e.meetingTime;
    option.value = e.meetingTime;

    timeSelector.appendChild(option);
  }
});
