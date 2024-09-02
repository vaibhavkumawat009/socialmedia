const jwt = require('jsonwebtoken');

const generateToken = async (user) => {

  const payload = {
    id: user.id,
    date: new Date()

  };

  const token = jwt.sign(payload, "vaibhav", {});

  return token;
};

module.exports = {
    generateToken
}