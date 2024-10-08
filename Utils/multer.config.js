const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


// Setting Up Disk Storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images') // give file path where image supposed to saved
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // (Default name generation)

    // Generating file name 
      crypto.randomBytes(12, function(err, name){
        const fn = name.toString("hex")+path.extname(file.originalname);    // name me path ki original filename se extension name .
        cb(null, fn);
      });
    }
  })
  
  
  
  // Create and export UPLOAD variable
  
  const upload = multer({ storage: storage })

  module.exports = upload;
