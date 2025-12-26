"use strict";

// Script para concatenar os parâmetros da url atual com o link clicado

function fixUrlsParams() {
  if (window.location.search != "") {
    [...document.querySelectorAll("a")].forEach((e) => {
      if (
        e.href &&
        !e.href.includes(window.location.href + "#") &&
        e.href.includes("itau")
      ) {
        e.addEventListener("click", (event) => {
          event.preventDefault();
          let newUrl = new URL(e.href);

          for (let [k, v] of new URLSearchParams(
            window.location.search
          ).entries()) {
            newUrl.searchParams.append(k, v);
          }

          if (e.target == "_blank") {
            window.open(newUrl.toString(), "_blank");
          } else {
            window.location.href = newUrl.toString();
          }
        });
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", fixUrlsParams);
