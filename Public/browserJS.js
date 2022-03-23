"use strict";

var counter = 2;

document
  .getElementById("addClassBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const div = document.getElementById("registerClasses");
    const currentSelector = document.getElementById("validationCustom04");

    let duplicatedSelector = currentSelector.cloneNode(true);
    duplicatedSelector.name = "class" + counter;
    counter += 1;

    div.appendChild(document.createElement("br"));
    div.appendChild(duplicatedSelector);
  });
