# Verificador de Proyectos IBM Doors
## Introducción
Verificador de Proyectos IBM Doors es una aplicación web diseñada para analizar proyectos alojados en IBM Doors Next Generationy proporcionar feedback sobre si cumplen con ciertos requisitos predefinidos. El objetivo principal es evaluar la organización y contenido de los proyectos, brindando información detallada sobre la calidad y completitud de los mismos.

## Funcionalidades Principales
1. **Autenticación con IBM Doors Next Generation**: Los usuarios pueden iniciar sesión con sus credenciales de IBM DOORS para acceder a los proyectos que desean analizar.
   
2. **Análisis de Proyectos**: La aplicación examina la estructura y contenido del proyecto especificado de IBM Doors Next Generation para verificar si cumple con los requisitos definidos.

3. **Feedback Detallado**: Después del análisis, el Verificador de Proyectos IBM Doors proporciona una respuesta detallada sobre la calidad y completitud del proyecto. Esto incluye información sobre la calificación obtenida, el número de requisitos cumplidos sobre el total y una lista de requisitos cumplidos y faltantes.

4. **Interfaz Intuitiva**: La interfaz de usuario se ha diseñado de manera intuitiva para facilitar la navegación y comprensión de los resultados del análisis.

## Tecnologías Utilizadas
El proyecto se ha desarrollado utilizando las siguientes tecnologías:
- **HTML/CSS/JavaScript**: Lenguajes estándar para desarrollar la interfaz de usuario y la lógica de la aplicación web.
- **API de IBM Doors Next Generation**: Interfaz de programación de aplicaciones para interactuar con proyectos almacenados en IBM Doors Next Generation.

#### Estructura del Proyecto
El proyecto está organizado en los siguientes archivos y carpetas:
- **Prototipos**: En esta carpeta se encuentran el diseño de alto nivel realizado previamente a la implementación de la herramienta.
- **src**: Implementación de la herramienta:
      - **`server.js`**: Archivo principal que contiene el código para el servidor HTTP que sirve la aplicación.
      - **`main.js`**: Archivo que contiene la lógica del cliente, incluyendo la interacción con la API de IBM DOORS a través de `doors_lib.js` y el manejo de eventos en la interfaz de usuario.
      - **`doors_lib.js`**: Biblioteca que encapsula las funciones para interactuar con IBM Doors Next Generation. Entre sus funciones están la autenticación en IBM Doors Next Generation, la obtención de datos y la verificación de requisitos.
      - **`index.html`**: Archivo HTML que define la estructura de la página web y contiene la interfaz de usuario.
      - **`styles.css`**: Archivo CSS que proporciona estilos para la interfaz de usuario.
      - **`calificaciones.json`**: Archivo JSON que define los requisitos que se deben cumplir y sus pesos correspondientes en la calificación.

## Instalación y Uso
1. Clona o descarga el repositorio del proyecto desde GitHub.
2. Instala las dependencias del proyecto ejecutando `npm install` en la terminal.
3. Accede a la aplicación a través del navegador web utilizando la dirección y el puerto configurados.

## Autor

Este proyecto fue desarrollado por [Patricia Cifrián Pérez](https://github.com/patricifrian).
