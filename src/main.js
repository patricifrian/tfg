// Implementacion de main.js:
//'use strict';

import { login } from './doors_lib.js';

document.addEventListener("DOMContentLoaded", function () {
    //Declaracion de constantes y variables
    // Botones
    const showPassBtn = document.getElementById('showPassBtn');
    const checkBtn = document.getElementById('checkBtn');
    const explainBtn = document.getElementById('explainBtn');
    // Campos de texto
    const pass = document.getElementById('password');
    const user = document.getElementById('username');
    const projectUri = document.getElementById('projectUri');
    const alert = document.getElementById('alert');

    // Implementacion del boton "Mostrar contrasena"
    showPassBtn.addEventListener("click", function () {
        if (pass.type === 'password' && !pass.value=='') {
            pass.type = 'text';
            showPassBtn.textContent = 'Hide';
        } else {
            pass.type = 'password';
            showPassBtn.textContent = 'Show';
        }
    });

    // Implementacion del boton de comprobacion
    checkBtn.addEventListener("click", function () {
        // Verificar que todos los campos esten rellenos
        if (user.value.trim() !== '' && pass.value.trim() !== '' && projectUri.value.trim() !== '') {
            login(user.value, pass.value, projectUri.value);
            window.location.href = "results.html";            
        } else {
            alert.textContent = 'Por favor, complete todos los campos antes de continuar.';
        }
    });

    // Implementacion del boton de explicacion
    explainBtn.addEventListener("click", function () {
        window.location.href = "ayuda1.html";
    });
});