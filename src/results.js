// Implementacion de results.js:
//'use strict';

//Importacion de doors_lib.js
import { login, logout, getCookies, hecho, jsonToObject, checkFolders, checkType, checkOrganization, checkModules, checkLinkTo, checkLinkAt, checkOptions, checkViews} from './doors_lib.js';

// Declaracion de Variables Globales
var notaMax;
var numReqsTotal;
var dataJson;
// Campos de texto
const notaOut = document.getElementById('nota');
const numReqOut = document.getElementById('numReqs');
const reqsOut = document.getElementById('reqs');
const missReqsOut = document.getElementById('missingReqs');
const alert = document.getElementById('alert');
// Botones
const explainBtn = document.getElementById('explainBtn');

document.addEventListener("DOMContentLoaded", function () {
    //Inicializar variables
    initializeVariables();

    // Implementacion del boton de explicacion
    explainBtn.addEventListener("click", function () {
        window.location.href = "ayuda2.html";
    });
});


// Calculo de la nota final
function getNota() {
    let pesoTotal = 0;
    let pesoCumplido = 0;

    for (const requisito in dataJson.requisitos) {
        let pesoRequisito = dataJson.requisitos[requisito].peso;
        let numSubrequisitos = Object.keys(dataJson.requisitos[requisito].subrequisitos).length;

        let cumplidosRequisito = hecho[dataJson.requisitos[requisito].id].reduce((acc, curr) => acc + curr, 0);
        pesoTotal += pesoRequisito; 

       
        pesoCumplido += (cumplidosRequisito / numSubrequisitos) * pesoRequisito;
    }
    const nota = (pesoCumplido / pesoTotal).toFixed(2) * notaMax;
    return nota;
}


// Calculo del numero de requisitos cumplidos
function getNumReqs() {
    let numReq = 0;
    for (let i = 0; i < hecho.length; i++) {
        for (let j = 0; j < hecho[i].length; j++) {
            if (hecho[i][j] === 1)
                numReq++;
        }
    }
    return numReq;
}

//Calculo del numero total de requisitos
function getNumReqsTot() {
    let numReqTot = 0;
    for (const requisito in dataJson.requisitos) {
        numReqTot += Object.keys(dataJson.requisitos[requisito].subrequisitos).length;
    }
    return numReqTot;
}

// Obtencion de los requisitos cumplidos o no cumplidos. hechoaux es 1 si se quieren los cumplidos o 0 si se quieren los no cumplidos
function getReqs(dataJson, hechoaux) {
    let aux = '';
    for (const requisito in dataJson.requisitos) {
        let i = 0;
        let auxCat = false; //variable auxiliar para imprimir la categoria solo en caso de que al menos uno de los requisitos de esta se cumpla o no
        for (const subreq in dataJson.requisitos[requisito].subrequisitos) {
            if (hecho[dataJson.requisitos[requisito].id][i] === hechoaux) {
                if (auxCat === false) {
                    aux += `<ul><li>En la categoria "${dataJson.requisitos[requisito].nombre}":</li>`;
                    aux += '<ul>';
                    auxCat = true;
                }
                if (typeof dataJson.requisitos[requisito].subrequisitos[subreq].nombre === 'object') {
                    aux += `<li>Alguna de las opciones a continuacion:</li><ul>`;
                    for (const option in dataJson.requisitos[requisito].subrequisitos[subreq].nombre) {
                        aux += `<li>${dataJson.requisitos[requisito].subrequisitos[subreq].nombre[option]}</li>`;
                    }
                    aux += `</ul>`;
                }
                else {
                    aux += `<li>${dataJson.requisitos[requisito].subrequisitos[subreq].nombre}</li>`;
                }
            }
            i++;
        }
        aux += '</ul></ul>';
    }
    return aux;
}

// Inicializacion de variables
async function initializeVariables() {
    dataJson = await jsonToObject("./calificaciones.json");
    notaMax = dataJson.nota_max;
    numReqsTotal = getNumReqsTot();
    for (const requisito in dataJson.requisitos) { // Inicializo la matriz 'hecho' con todos los elementos a 0, ningun requisito cumplido
        let hechoaux = [];
        for (const subreq in dataJson.requisitos[requisito].subrequisitos) {
            hechoaux.push(0);
        }
        hecho.push(hechoaux);
    }
    getCookies();
    checkReqs();
    logout();
    // Actualizacion del contenido de la seccion de resultados
    notaOut.textContent = `Nota: ${getNota()}/${notaMax}`;
    numReqOut.textContent = `Numero de Requisitos Cumplidos: ${getNumReqs()}/${numReqsTotal}`;
    reqsOut.innerHTML = getReqs(dataJson, 1); // 1 implica que los requisitos se han cumplido
    missReqsOut.innerHTML = getReqs(dataJson, 0); // 0 implica que los requisitos no se han cumplido
}

// Comprobacion de los requisitos
async function checkReqs() {
    try {
        var artifactsInFolder = await checkFolders();
        var artifactsOfType = await checkType();
        checkOrganization(artifactsInFolder, artifactsOfType);
        await checkModules();
        //await checkLinkTo(artefacto);
        //await checkLinkAt(artefacto),
        //await checkOptions();
        //await checkViews();
    } catch (error) {
        alert.textContent = 'Se ha producido un error. Por favor, vuelva a la pantalla anterior y proceda nuevamente.';
    }    
}