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
  const html = `<html>
       <body>
           <p>Se ha registrado una cuenta de FarrApp con este correo.<br>
               Para validar tu cuenta, ingresa al siguiente enlace:<br>
           </p>
           <a href=${url}>Validar cuenta</a>
           <p>
           Si no fuiste tú ignora este correo
           </p>
       </body>
       </html>`;
  sendMail(userMail, subject, text, html);
}

function sendExpectVerifyCompany(userMail, companyName) {
  const subject = `Solicitud de registro de empresa en FarrApp`;
  const text =
    `Hola, ${companyName}. Tu solicitud para unirte a FarrApp ha sido recibida. ` +
    `Pronto un asesor se comunicará contigo para continuar con el proceso de registro. ` +
    `Equipo de desarrollo de FarrApp`;
  const html = text;
  sendMail(userMail, subject, text, html);
}

function sendExpectCreateUserByAdmin(userMail, userName, generatedPassword) {
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
  sendExpectVerifyCompany,
  sendExpectCreateUserByAdmin,
  sendRecoverPassword,
};
