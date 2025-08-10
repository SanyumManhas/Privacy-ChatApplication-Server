const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: 'dwtieazau',
  api_key: '984156324958823',
  api_secret: 'jB7PW9zdJ-hiwUtJW2wmLmxPW3s',
});

module.exports = cloudinary;
