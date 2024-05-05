//Librería para la interacción con IBM DOORS, doors_lib.js
//'use strict';

//import { DOMParser } from 'C:/Users/okapi/source/repos/tfgNodeWeb/node_modules/xmldom'; //CAMBIAR FORMA DE IMPORTAR
//const { DOMParser } = require('xmldom');
import {setCookie, getCookie, removeCookie} from './cookie_lib.js';


// Constantes y variables de autenticación de IBM DOORS
const URL_SERVER = "https://jazz.net/sandbox01-rm/publish/";
const CONFIG_CONTEXT = "https://jazz.net/sandbox01-rm/cm/stream/_m2V24FleEe6YK5bcBzmhXg";
/*
var username = null;
var password = null;
var projectUri = null;
*/
var username = "pcifrian";
var password = "holahola23";
var projectUri = "_mk9L8VleEe6YK5bcBzmhXg";
var hecho = [];

function login(user, pass, project) {
    setCookie('username', user);
    setCookie('password', pass);
    setCookie('projectUri', project);
}

function logout() {
    removeCookie('username');
    removeCookie('password');
    removeCookie('projectUri');
}


function getCookies() {
    const username = getCookie('username');
    const password = getCookie('password');
    const projectUri = getCookie('projectUri');
}

// Transformacion de archivo json a objeto javascript
async function jsonToObject(jsonfile) {
    const response = await fetch(jsonfile);
    const aux = await response.json();
    return aux;
}

//Solicitud GET a API de IBM DOORS
//Devuelve un DOM con el XML parseado
async function fetchDoors(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(`${username}:${password}`),
                "X-OSLC-Configuration-Context": CONFIG_CONTEXT
            }
        });
        switch (response.status) {
            case 200: // OK
                var text = await response.text();
                const parser = new DOMParser();;
                const doc = parser.parseFromString(text, "text/xml");
                return doc;
            case 401:
                updateResultMessage("Error de autenticación");
                break;
            case 503:
                updateResultMessage("Servidor IBM no disponible, posible mantenimiento. Inténtelo de nuevo más tarde.");
                break;
            default:
                updateResultMessage(`Error: ${response.status}`);
        }
        return;
    } catch (error) {
        throw new Error(`Error en fetchDoors: ${error}`);
    }
}

// Actualiza el mensaje en la pantalla de resultados
function updateResultMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
}

// Actualiza la pantalla de resultados con la información del proyecto
function updateProjectInfo(info) {
    const projectInfo = document.getElementById('projectInfo');
    // Actualiza el contenido de projectInfo con la información recibida
    projectInfo.innerHTML = info;
}

//Parsea string para cambiar espacios por %20
//Devuelve un string con los espacios cambiados
function parseSpaces(string) {
    return string.replace(/ /g, "%20");
}

//Verifica existencia de las carpetas con el nombre indicado en calificaciones.json
//Devuelve un array con los artefactos encontrados
async function checkFolders() {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        // Obtener todos los elementos artifact
        var artifacts = doc.getElementsByTagName("ds:artifact");
        //var artifacts = doc.querySelectorAll("div.note, div.alert");
        let artifactsInFolder = []; //Matriz en la cual se guardan los artefactos encontrados en cada carpeta
        for (const subreq in dataJson.requisitos.carpetas.subrequisitos) {
            let found = [];
            for (let i = 0; i < artifacts.length; i++) {
                var parentFolder = artifacts[i].getAttribute('ds:location').getAttribute('ds:parentFolder');
                if (parentFolder.getAttribute('rmm:title') === subreq.nombre) {
                    found.push(artifacts[i]); //Guarda el artefacto encontrado en la carpeta subreq.nombre
                    hecho[dataJson.requisitos.carpetas.id][i] = 1;
                }
            }
            artifactsInFolder.push(found); //Guarda el array de artefactos encontrados en la carpeta subreq.nombre
        }
        return artifactsInFolder;
    } catch (error) {
        throw new Error(`Error al verificar la existencia de carpetas".`, error);
    }
}

//Verifica existencia de artefactos del tipo indicado en calificaciones.json
//Devuelve un array con los artefactos encontrados
async function checkType(numReq) {
    try {
        let typeNameNoSpaces;
        let artifactsOfType = []; //Matriz en la cual se guardan los artefactos encontrados de cada tipo
        let i = 0;
        for (const subreq in dataJson.requisitos.tipos.subrequisitos) {
            typeNameNoSpaces = parseSpaces(subreq.nombre);
            const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri + "&typeName=" + typeNameNoSpaces);
            const artifacts = doc.getElementsByTagName('ds:artifact');
            artifactsOfType.push(artifacts); //Guarda los artefactos encontrados de cada tipo
            if (artifacts.length > 0) {
                hecho[dataJson.requisitos.tipos.id][i] = 1;
            }
            i++;
        }
        return artifactsOfType;
    } catch (error) {
        throw new Error('Error al verificar artefacto de tipo:' + typeName, error);
    }
}


//Verificar la organización de artefactos en carpetas
function checkOrganization(artifactsInFolder, artifactsOfType) {
    try {
        //Iteración sobre los elementos de artifactsInFolder
        for (let i = 0; i < artifactsInFolder.length; i++) {
            for (let j = 0; j < artifactsInFolder[i].length; j++) {
                //Iteración sobre los elementos de artifactsOfType
                for (let k = 0; k < artifactsOfType.length; k++) {
                    for (let l = 0; l < artifactsOfType[k].length; l++) {
                        //Comparación de los elementos de las matrices
                        if (artifactsOfType[k][l] === artifactsInFolder[i][j]) {
                            hecho[dataJson.requisitos.organizacion.id][i] = 1; //Marcar como hecho el subrequisito
                        }
                    }
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar la organizacion de artefactos:', error);
    }
}

//Verificar existencia de modulos
async function checkModules() {
    try {
        const doc = await fetchDoors(URL_SERVER + "modules?projectURI=" + projectUri);
        const modules = doc.getElementsByTagName('ds:artifact');

        for (const subreq in dataJson.requisitos.modulos.subrequisitos) {
            for (let i = 0; i < modules.length; i++) {
                if (modules[i].getAttribute('rmm:title') === subreq.nombre) {
                    hecho[dataJson.requisitos.modulos.id][i] = 1;
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar la existencia de modulos:', error);
    }
}

//Verificar existencia de link del artefacto artifact a un artefacto de tipo Interview Report
async function checkLinkTo(artifact) {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri + "&typeName=Interview%20Report");
        const artifacts = doc.getElementsByTagName('ds:artifact');
        for (let i = 0; i < artifacts.length; i++) {
            //Buscar links que apunten al artefacto artifact
            const links = artifacts[i].getElementsByTagName('link');
            for (let j = 0; j < links.length; j++) {
                if (links[j].querySelector('originArtifact').textContent === artifact) {
                    hecho[dataJson.requisitos.trazabilidad.id][i] = 1;
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar la trazabilidad del artefacto:' + artifact, error);
    }
}
//Verificar existencia de links que apunten al artefacto artifact
async function checkLinkAt(artifact) {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        const artifacts = doc.getElementsByTagName('artifact');
        for (let i = 0; i < artifacts.length; i++) {
            //Buscar links que apunten al artefacto artifact
            const links = artifacts[i].getElementsByTagName('link');
            for (let j = 0; j < links.length; j++) {
                if (links[j].querySelector('targetArtifact').textContent === artifact) {
                    hecho[dataJson.requisitos.trazabilidad.id][i] = 1;
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar la trazabilidad del artefacto:' + artifact, error);
    }
}

//Verificar que el artefacto artifact tiene una opcion activada
async function checkOptions(artifact) {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        const artifacts = doc.getElementsByTagName('artifact');
        for (let i = 0; i < artifacts.length; i++) {
            //Buscar links que apunten al artefacto artifact
            const links = artifacts[i].getElementsByTagName('link');
            for (let j = 0; j < links.length; j++) {
                if (links[j].querySelector('targetArtifact').textContent === artifact) {
                    hecho[dataJson.requisitos.opciones.id][i] = 1;
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar las opciones del artefacto:' + artifact, error);
    }
}

//Verifica existencia de las vistas con el nombre indicado en calificaciones.json
async function checkViews() {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        // Obtener todos los elementos artifact
        var artifacts = doc.getElementsByTagName("ds:artifact");
        //var artifacts = doc.querySelectorAll("div.note, div.alert");
        let artifactsInFolder = []; //Matriz en la cual se guardan los artefactos encontrados en cada carpeta
        for (const subreq in dataJson.requisitos.vistas.subrequisitos) {
            let found = [];
            for (let i = 0; i < artifacts.length; i++) {
                var parentFolder = artifacts[i].getAttribute('ds:location').getAttribute('ds:parentFolder');
                if (parentFolder.getAttribute('rmm:title') === subreq.nombre) {
                    found.push(artifacts[i]); //Guarda el artefacto encontrado en la carpeta subreq.nombre
                    hecho[dataJson.requisitos.vistas.id][i] = 1;
                }
            }
            artifactsInFolder.push(found); //Guarda el array de artefactos encontrados en la carpeta subreq.nombre
        }
        return artifactsInFolder;
    } catch (error) {
        throw new Error(`Error al verificar la existencia de vistas".`, error);
    }
}


export {
    login,
    logout,
    getCookies,
    hecho,
    jsonToObject,
    fetchDoors,
    checkFolders,
    checkType,
    checkOrganization,
    checkLinkTo,
    checkLinkAt,
    checkModules,
    checkOptions,
    checkViews,
    updateResultMessage,
    updateProjectInfo
};