const makeValidation = require("@withvoid/make-validation");
const {UserModel, USER_TYPES} = require('../models/User');

const user = {
    // GET ('/')
    // get all users
    onGetAllUsers: async (req, res) => {
        try {
            const users = await UserModel.getUsers();
            return res.status(200).json({ success: true, users });
          } catch (error) {
            return res.status(500).json({ success: false, error: error })
          }
     },

    // GET ('/:id')
    // get user by id
    onGetUserById: async (req, res) => {
        try {
            const user = await UserModel.getUserById(req.params.id);
            return res.status(200).json({ success: true, user });
          } catch (error) {
            return res.status(500).json({ success: false, error: error })
          }
    },

    // POST ('/')
    // create user
    onCreateUser: async (req, res) => {  
        try {
            const validation = makeValidation(types => ({
              payload: req.body,
              checks: {
                firstName: { type: types.string },
                lastName: { type: types.string },
                emailId: { type: types.string },
                type: { type: types.enum, options: { enum: USER_TYPES } },
              }
            }));
            if (!validation.success) return res.status(400).json(validation);

            // check if user is already exists
            const user = await UserModel.findOne({ emailId: req.body.emailId })
            if(user) {
                return res.status(400).json({ success: false, error: 'Email is already registered!' });
            }
      
            const { firstName, lastName, type, emailId, password } = req.body;
            // hash the password
            var bcrypt = require('bcryptjs');
            bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                    if(err) throw err;
                    // password = hash;
                    UserModel.createUser(firstName, lastName, type,emailId, hash)
                    .then(user => {
                        return res.status(200).json({ success: true, user });
                    })
                    .catch(err=> console.log(err));
                 });
            });

            // const user = await UserModel.createUser(firstName, lastName, type);
            // return res.status(200).json({ success: true, user });
          } catch (error) {
            return res.status(500).json({ success: false, error: error })
          }
     },

    // DELETE ('/:id')
    // delete a user by id
    onDeleteUserById: async (req, res) => {
        try {
            const user = await UserModel.deleteByUserById(req.params.id);
            return res.status(200).json({ 
              success: true, 
              message: `Deleted a count of ${user.deletedCount} user.` 
            });
          } catch (error) {
            return res.status(500).json({ success: false, error: error })
          }
     },
};

exports.user = user;