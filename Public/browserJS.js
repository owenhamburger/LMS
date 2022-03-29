"use strict";

var counter = 2;

document
  .getElementById("addClassBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const div = document.getElementById("registerClasses");
    const currentSelector = document.getElementById("selectDiv");

    const duplicatedSelector = currentSelector.cloneNode(true);

    // remove add button from duplicated selector
    duplicatedSelector.getElementsByTagName("button")[0].remove();

    // change attributes
    // duplicatedSelector.name = "class" + counter;
    duplicatedSelector.id = "selectDiv" + counter;
    duplicatedSelector.className = "selectDiv";

    // create remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger";
    removeBtn.type = "button";
    removeBtn.innerHTML = "x";
    removeBtn.id = "removeBtn" + counter;

    const lineBreak = document.createElement("br");
    lineBreak.id = "break" + counter;

    // add event to remove button to remove selector
    removeBtn.addEventListener("click", function (event) {
      event.preventDefault();
      div.removeChild(duplicatedSelector);
      div.removeChild(lineBreak);
    });

    counter += 1;

    div.appendChild(lineBreak);
    div.appendChild(duplicatedSelector);
    duplicatedSelector.appendChild(removeBtn);
  });
