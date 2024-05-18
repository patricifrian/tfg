//Librería para la interacción con IBM DOORS, doors_lib.js
//'use strict';

//import { DOMParser } from 'xmldom';
//import fetch from 'node-fetch';

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
    document.cookie = 'username' + "=" + user + "; path=/";
    document.cookie = 'password' + "=" + pass + "; path=/";
    document.cookie = 'projectUri' + "=" + project + "; path=/";
}

function logout() {
    document.cookie = 'username' + '=; Max-Age=-99999999;';
    document.cookie = 'password' + '=; Max-Age=-99999999;';
    document.cookie = 'projectUri' + '=; Max-Age=-99999999;';
}


function getCookies() {
    username = getCookie('username');
    password = getCookie('password');
    projectUri = getCookie('projectUri');
}

// Funcion para obtener valor de cookie 'name'
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
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

//Verifica existencia de las carpetas con el nombre indicado en calificaciones.json
//Devuelve un array con los artefactos encontrados
async function checkFolders() {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        // Obtener todos los elementos artifact
        var artifacts = doc.getElementsByTagName("ds:artifact");
        var artifactsInFolder = []; //Matriz en la cual se guardan los artefactos encontrados en cada carpeta
        for (const subreq in dataJson.requisitos.carpetas.subrequisitos) {
            var found = [];
            for (let i = 0; i < artifacts.length; i++) {
                var parentFolder = artifacts[i].getElementsByTagName('ds:parentFolder');
                var parentFolderName = parentFolder[0].getElementsByTagName('rrm:title');
                if (typeof subreq.nombre === 'object') { // Si la carpeta tiene varias opciones de nombre
                    for (const option in subreq.nombre) {
                        if (parentFolderName[0].textContent === option) {
                            found.push(artifacts[i]); //Guarda el artefacto encontrado en la carpeta subreq.nombre
                            hecho[dataJson.requisitos.carpetas.id][i] = 1;
                        }
                    }
                }else{
                    if (parentFolderName[0].textContent === subreq.nombre) {
                        found.push(artifacts[i]); //Guarda el artefacto encontrado en la carpeta subreq.nombre
                        hecho[dataJson.requisitos.carpetas.id][i] = 1;
                    }
                }
            }
            artifactsInFolder.push(found); //Guarda el array de artefactos encontrados en la carpeta subreq.nombre
        }
        return artifactsInFolder;
    } catch (error) {
        throw new Error('Error al verificar la existencia de carpetas: ', error);
    }
}

//Verifica existencia de artefactos del tipo indicado en calificaciones.json
//Devuelve un array con los artefactos encontrados
async function checkType() {
    try {
        var typeNameNoSpaces;
        var artifactsOfType = []; //Matriz en la cual se guardan los artefactos encontrados de cada tipo
        let i = 0;
        for (const subreq in dataJson.requisitos.tipos.subrequisitos) {
            typeNameNoSpaces = encodeURIComponent(subreq.nombre);
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
        throw new Error('Error al verificar los tipos de artefacto: ', error);
    }
}


//Verificar la organización de artefactos en carpetas
function checkOrganization(artifactsInFolder, artifactsOfType) {
    try {
        var aux = 0;
        for (const subreq in dataJson.requisitos.organizacion.subrequisitos) {
            //Obtener id de la carpeta
            var idCarpeta = 0;
            for (const aux in dataJson.requisitos.tipos.subrequisitos) {
                if (dataJson.requisitos.carpetas.subrequisitos[aux].nombre === subreq.carpeta) {
                    break;
                }
                idCarpeta++;
            }
            if (subreq.tipo === "undefined"){
                // Si el tipo es "undefined", se verifica que los artefactos de la carpeta no se hayan definido previamente
                for (const aux in dataJson.requisitos.tipos.subrequisitos) {
                    for (let i = 0; i < artifactsInFolder[idCarpeta].length; i++) {
                        var objectType = artifacts[idCarpeta][i].getElementsByTagName('attribute:objectType');
                        if (objectType[0].getAttribute("attribute:name") !== aux.tipo){
                            hecho[dataJson.requisitos.organizacion.id][aux] = 1; //Marcar como hecho el subrequisito
                        }else{
                            hecho[dataJson.requisitos.organizacion.id][aux] = 0; //Marcar como NO hecho el subrequisito
                            break;
                        }
                    }
                }
            }else{
                // Si la carpeta tiene varias opciones de nombre
                if (typeof subreq.tipo === 'object') {
                    var idTipo = 0;
                    var artifactsOfTypes = [];
                    for (const option in subreq.tipo) {
                        for (const aux in dataJson.requisitos.tipos.subrequisitos) {
                            if (dataJson.requisitos.tipos.subrequisitos[aux].nombre === subreq.tipo) {
                                artifactsOfTypes.push(artifactsOfType[idTipo]);
                                break;
                            }
                            idTipo++;
                        }
                    }
                    // Comparación de los arrays contenidos en artifactsOfType[idTipo] y artifactsInFolder[idCarpeta]
                    if(artifactsInFolder[idCarpeta] === artifactsOfTypes){
                        hecho[dataJson.requisitos.organizacion.id][aux] = 1; //Marcar como hecho el subrequisito
                    }
                }else{
                    //Obtener id del tipo
                    var idTipo = 0;
                    for (const aux in dataJson.requisitos.tipos.subrequisitos) {
                        if (dataJson.requisitos.tipos.subrequisitos[aux].nombre === subreq.tipo) {
                            break;
                        }
                        idTipo++;
                    }
                    // Comparación de los arrays contenidos en artifactsOfType[idTipo] y artifactsInFolder[idCarpeta]
                    if(artifactsInFolder[idCarpeta] === artifactsOfType[idTipo]){
                        hecho[dataJson.requisitos.organizacion.id][aux] = 1; //Marcar como hecho el subrequisito
                    }
                }
            }
            aux++;
        }
    } catch (error) {
        throw new Error('Error al verificar la organizacion de artefactos: ', error);
    }
}

//Verificar existencia de modulos
async function checkModules() {
    try {
        const doc = await fetchDoors(URL_SERVER + "modules?projectURI=" + projectUri);
        var modules = doc.getElementsByTagName("ds:artifact");

        for (const subreq in dataJson.requisitos.modulos.subrequisitos) {
            for (let i = 0; i < modules.length; i++) {
                var moduleName = modules[i].getElementsByTagName('rrm:title');
                if (moduleName[0].textContent === subreq.nombre) {
                    hecho[dataJson.requisitos.modulos.id][i] = 1;
                }
            }
        }
    } catch (error) {
        throw new Error('Error al verificar la existencia de modulos: ', error);
    }
}

//Verificar existencia de trazabilidad
async function checkLinks() {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri);
        var artifacts = doc.getElementsByTagName("ds:artifact");
        for (const subreq in dataJson.requisitos.trazabilidad.subrequisitos) {
            if(subreq.origen===""){ //Caso sin origen

            }else if (subreq.destino===""){ //Caso sin destino

            }else{ //Caso con origen y destino

            }
        }




        for (let i = 0; i < artifacts.length; i++) {
            //Buscar links que apunten al artefacto artifact
            const links = artifacts[i].getElementsByTagName('link');
            for (let j = 0; j < links.length; j++) {
                if (links[j].querySelector('originArtifact').textContent === artifact) {
                    hecho[dataJson.requisitos.trazabilidad.id][i] = 1;
                }
            }
        }
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
        throw new Error('Error al verificar la trazabilidad: ', error);
    }
}

//Verificar que los artefactos de tipo "Term" tienen la opcion "Use artifacts of this type as glossary terms" activada
async function checkOptions() {
    try {
        const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri + "&typeName=Term");
        var artifacts = doc.getElementsByTagName("ds:artifact");
        for (let i = 0; i < artifacts.length; i++) {
            //Si existe el elemento "rrm:alternatespellingattribute", la opcion "Use artifacts of this type as glossary terms" esta activada
            if(artifacts[i].getElementsByTagName("rrm:alternatespellingattribute")){
                hecho[dataJson.requisitos.opciones.id][i] = 1;
            }
        }
    } catch (error) {
        throw new Error('Error al verificar las opciones de artefactos: ', error);
    }
}

//Verifica existencia de las vistas con el nombre indicado en calificaciones.json
async function checkViews() {
    try {
        var viewName;
        var found = true;
        let aux = 0;
        for (const subreq in dataJson.requisitos.vistas.subrequisitos) {
            viewName = encodeURIComponent(subreq.nombre);
            const doc = await fetchDoors(URL_SERVER + "resources?projectURI=" + projectUri + "&viewName=" + viewName);
            const artifacts = doc.getElementsByTagName('ds:artifact');
            for (let i = 0; i < artifacts.length; i++) {
                var objectType = artifacts[i].getElementsByTagName('attribute:objectType');
                if (objectType[0].getAttribute("attribute:name") !== subreq.tipo) {
                    found = false;
                    break;
                }
            }
            if( found === true){
                hecho[dataJson.requisitos.vistas.id][aux] = 1;
            }
            aux++;
        } 
    } catch (error) {
        throw new Error('Error al verificar las vistas: ', error);
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
    checkLinks,
    checkModules,
    checkOptions,
    checkViews,
    updateResultMessage,
};