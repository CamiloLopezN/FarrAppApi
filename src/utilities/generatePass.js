const generatePass = {};

generatePass.generatePasswordRand = (length, type) => {
  let characters;
  switch (type) {
    case 'num':
      characters = '0123456789';
      break;
    case 'alf':
      characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      break;
    case 'rand':
      // FOR ↓
      break;
    default:
      characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      break;
  }
  let pass = 'D';
  for (let i = 0; i < length; i += 1) {
    if (type === 'rand') {
      pass += String.fromCharCode((Math.floor(Math.random() * 100) % 94) + 33);
    } else {
      pass += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  return pass;
};

module.exports = generatePass;
