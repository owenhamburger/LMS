"use strict";

// temporarily store row data
var rowData = {};

// plus buttons to update grade
const buttons = document.getElementsByClassName("a bx bxs-plus-circle");
console.log(buttons);

for (const button of buttons) {
  button.addEventListener("click", (event) => {
    rowData.userID = button
      .closest("tr")
      .querySelectorAll(".studentName")[0].id;
    rowData.CRN = button
      .closest("tr")
      .querySelectorAll("#fullFilePath")[0]
      .href.split("/")
      .at(-5);
    rowData.assessmentName = button
      .closest("tr")
      .querySelectorAll("#fullFilePath")[0]
      .href.split("/")
      .at(-2)
      .toLowerCase();
    rowData.assessmentType = button
      .closest("tr")
      .querySelectorAll("#fullFilePath")[0]
      .href.split("/")
      .at(-3)
      .toLowerCase();
    console.log("ROW", rowData);
  });
}

const form = document.getElementById("updateGradeForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("TRIGGERED");
  const formData = new FormData(form);
  rowData.grade = formData.get("grade");

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rowData),
    redirect: "follow",
  };
  fetch("/updateGrade", requestOptions)
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch(function (err) {
      console.info(err + " url: " + url);
    });
});
