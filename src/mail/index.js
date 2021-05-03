const sgMail = require('@sendgrid/mail');

const sgAPIKey = process.env.SG_KEY;
const sgSender = process.env.SG_SENDER;

sgMail.setApiKey(sgAPIKey);

const sendMail = (toMail, subject, text, html) => {
  const message = {
    to: toMail,
    from: sgSender,
    subject,
    text,
    html,
  };
  (async () => {
    try {
      await sgMail.send(message);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      if (error.response) {
        // eslint-disable-next-line no-console
        console.error(error.response.body);
      }
    }
  })();
};

function sendValidation(userMail, token, validationURL) {
  const subject = `Valida tu cuenta en FarrApp`;
  const text = `Se ha registrado una cuenta de FarrApp con este correo.\n Para validar tu cuenta, ingresa al siguiente enlace:\n ${validationURL}${token} \n  Si no fuiste tú ignora este correo`;
  const url = `${validationURL}/${token}`;
  const html = `<!DOCTYPE html>
  <html>
  
  <head>
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;1,800&display=swap" rel="stylesheet">
      <title>Validación</title>
      <style>
          #div1 {
              height: 30vh;
              width: 1;
              text-align: center;
              background-color: rgb(255, 255, 255)
          }
  
          #div2 {
              height: 32vh;
              width: 1;
              background-color: rgb(255, 255, 255);
              text-align: center;
          }
  
          #div3 {
              height: 30vh;
              width: 1;
              text-align: center;
              background-color: rgb(255, 255, 255)
          }
  
          @font-face {
              font-family: "Lovelo Negra";
              font-style: normal;
              font-weight: normal;
              src: Local("?"), url("./resources/LOVELO\ BLACK.OTF")format("truetype");
          }
  
          #title {
              text-align: center;
              font-size: 40px;
              color: rgb(199, 62, 126);
              font-family: 'Roboto', sans-serif;
          }
  
          #farrapp {
              padding-top: 10vh;
              text-align: center;
              font-size: 120px;
              font-family: Lovelo Negra;
              color: rgb(0, 0, 0);
              font-family: "Lovelo Negra";
          }
  
          #m1 {
              font-size: 20px;
              padding-top: 5vh;
              text-align: center;
              font-family: 'Open Sans', sans-serif;
              ;
          }
  
          #m2 {
              padding-top: 5vh;
              font-size: 20px;
              text-align: center;
              font-family: 'Open Sans', sans-serif;
              ;
          }
      </style>
  </head>
  
  <body>
  
      <div id="div1">
          <h2 id="farrapp">FARRAPP</h2>
      </div>
  
      <div id="div2">
          <h3 id="m1">Se ha registrado una cuenta de FarrApp con este correo electrónico, <br>para verificar tu cuenta,
              dale click al siguiente enlace:</h3>
          <a href=${url} id="title">Verifica tu cuenta</a>
          <h3 id="m2">Si no fuiste tú ignora este correo</h3>
      </div>
  
  
      <div id="div3"></div>
  </body>
  
  </html>`;
  sendMail(userMail, subject, text, html);
}

function sendEmailRegisterCompany(userMail, companyName) {
  const subject = `Solicitud de registro de empresa en FarrApp`;
  const text =
    `Bienvenido a FarrApp! ${companyName}. Se ha registrado un empresa con este correo. Tu solicitud para unirte a FarrApp ha sido recibida. ` +
    `Pronto un asesor se comunicará contigo para continuar con el proceso de registro. ` +
    `Equipo de desarrollo de FarrApp`;
  const html = text;
  sendMail(userMail, subject, text, html);
}

function sendCreatedUserByAdmin(userMail, userName, generatedPassword) {
  const subject = `Solicitud de registro en FarrApp`;
  const text =
    `Hola, ${userName}. ` +
    `Te informamos que tu cuenta ha sido creada. Puedes ingresar con los siguientes datos: ` +
    `Correo electrónico: ${userMail} ` +
    `Contraseña: ${generatedPassword} ` +
    `Recuerda cambiar la contraseña en tu primer inicio de sesión. ` +
    `Equipo de desarrollo de FarrApp`;
  const html = text;
  sendMail(userMail, subject, text, html);
}

function sendRecoverPassword(userMail, tempPassword) {
  const subject = `Recuperación de contraseña`;
  const text =
    `Hola. ` +
    `Solicitaste la recuperación de tu contraseña. ` +
    ` Asignamos una contraseña temporal para que puedas acceder a tu cuenta: ` +
    `Contraseña temporal: ${tempPassword} ` +
    `Recuerda cambiar la contraseña en tu siguiente inicio de sesión. ` +
    `Equipo de desarrollo de FarrApp`;
  const html = text;
  sendMail(userMail, subject, text, html);
}

module.exports = {
  sendValidation,
  sendEmailRegisterCompany,
  sendCreatedUserByAdmin,
  sendRecoverPassword,
};
