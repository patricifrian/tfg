// Implementacion de ayuda2.js:
//'use strict';

//Importacion de doors_lib.js
import { jsonToObject } from './doors_lib.js';


document.addEventListener("DOMContentLoaded", function () {
    //Declaracion de constantes y variables
    const explainText = document.getElementById('explainText');
    initializeVariables();
});

async function initializeVariables() {
    //explainText.innerHTML = "hola";
    var dataJson = await jsonToObject("./calificaciones.json");
    explainText.innerHTML = await getExplain(dataJson);
}

// Obtencion de la explicacion de los requisitos y sus pesos
function getExplain(dataJson) {
        let aux = '<ul>';
        for (const requisito in dataJson.requisitos) {
            aux += `<li>${dataJson.requisitos[requisito].nombre}: ${dataJson.requisitos[requisito].peso * 100}% del total</li>`;
            aux += '<ul>';
            for (const subreq in dataJson.requisitos[requisito].subrequisitos) {
                if (typeof dataJson.requisitos[requisito].subrequisitos[subreq].nombre === 'object') {
                    //aux += `<li>Una de las opciones a continuacion: ${dataJson.requisitos[requisito].subrequisitos[subreq].peso * 100}% dentro de la categoria</li><ul>`;
                    aux += `<li>Una de las opciones a continuacion:</li><ul>`;
                    for (const option in dataJson.requisitos[requisito].subrequisitos[subreq].nombre) {
                        aux += `<li>${dataJson.requisitos[requisito].subrequisitos[subreq].nombre[option]}</li>`;
                    }
                    aux += `</ul>`;
                }
                else {
                    //aux += `<li>${dataJson.requisitos[requisito].subrequisitos[subreq].nombre}: ${dataJson.requisitos[requisito].subrequisitos[subreq].peso * 100}% dentro de la categoria</li>`;
                    aux += `<li>${dataJson.requisitos[requisito].subrequisitos[subreq].nombre}</li>`;
                }
            }
            aux += '<br></ul>';
        }
        return aux += '</ul>';
    }