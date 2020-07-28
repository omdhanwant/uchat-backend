const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

const { UserModel } = require("../models/User.js") 

const SECRET_KEY = 'some-secret-key';

exports.encode = async (req, res, next) => {
try{
    const  email = req.body.emailId;
    const  password = req.body.password;
    const user = await UserModel.getUserByEmailId(email);
    // if(!user) {
    //     return res.status(404).json({'emaileror':'User not found'})
    // }
      //compare req password with the DB password using bcrypt
      bcrypt.compare(password,user.password)
      .then(isCorrect =>{
          if(isCorrect){
              // res.json({success:'User is logged in'})
              //use payload and create token for user
              const payload = {
                  id: user._id,
                //   name: user.firstName + ' ' +  user.lastName,
                  emailId: user.emailId,
                  type: user.type
              };

             const authToken = jwt.sign(payload, SECRET_KEY);
             req.authToken = authToken;
             req.user = {
               userId: user._id,
               name: `${user.firstName} ${user.lastName}`,
               email: user.emailId,
               type: user.type
             }
             next();

          }else{
              res.status(400).json({passwordErr:'Password is not correct'})
          }
      })
      .catch(error => console.log(error))
    
    // const payload = {
    //     userId: user._id,
    //     userType: user.type,
    //   };

    // const authToken = jwt.sign(payload, SECRET_KEY);
    // req.authToken = authToken;
} catch(error) {
    return res.status(400).json({ success: false, message: error });
}

}

exports.decode = async (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(400).json({ success: false, message: 'No access token provided' });
      }
      const accessToken = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(accessToken, SECRET_KEY);
        req.userId = decoded.id;
        req.emailId = decoded.emailId;
        req.type = decoded.type;
        return next();
      } catch (error) {
    
        return res.status(401).json({ success: false, message: error.message });
      }
}