require('dotenv').config(); // Corrigi o método para carregar as variáveis de ambiente

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "NutriAPI",
      version: "1.0.0",
      description: "Documentação da NutriAPI",
    },
    servers: [
      {
        url: process.env.SWAGGER_BASE_URL || "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
    ],
  },
  apis: ["./api/routes.js"], // Caminho para os arquivos contendo as rotas do seu API
};


const specs = swaggerJSDoc(swaggerOptions);

module.exports = { specs, swaggerUi };
