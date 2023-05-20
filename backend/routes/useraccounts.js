const router = require('express').Router();

const Useraccount = require('../models/useraccount.model');
let Userinfo = require('../models/userinfo.model');

router.route('/').get((req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;
  const search = req.query.search;
  if (search && username) {
    Useraccount.find({ username: new RegExp(username, 'i') })
    .then(useraccounts => res.json(useraccounts)) 
    .catch(err => res.status(400).json('Error: ' + err));
  }else if (username) {
    Useraccount.findOne({ username: new RegExp(username, 'i') })
    .then(useraccounts => res.json(useraccounts)) 
    .catch(err => res.status(400).json('Error: ' + err));
  }else if (userId) {
    Useraccount.findOne({ userId: userId})
    .then(useraccounts => res.json(useraccounts))
    .catch(err => res.status(400).json('Error: ' + err));
  }else {
    Useraccount.find()
    .then(useraccounts => res.json(useraccounts))
    .catch(err => res.status(400).json('Error: ' + err));
  }
});

// user login
router.route('/login').post((req, res) => {
  const data = req.body;
  const filter = {
    username: data.username,
    password: data.password,
  }

  Useraccount.findOne(filter)
    .then(useraccount => {
      try {
        const object = useraccount.toObject();
        object.userId? res.json(useraccount) : res.json('Error: wrong username or passoword');
      }catch {
        res.json('Error: wrong username or passoword');
      }
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// create new useraccount
router.route('/').post(async (req, res) => {
  const data = req.body;
  const lastUserId = await Useraccount.findOne().sort({ userId: -1 }).limit(1)
    .then(useraccount => useraccount.userId);

  const useraccount = new Useraccount({
    userId: lastUserId + 1,
    username: data.username,
    password: data.password,
  });

  useraccount.save((err) => {
    if (err) {
      res.status(400).json('Error: ' + err);
    }else {
      const userinfo = new Userinfo({
        userId: lastUserId + 1,
        username: data.username,
        nickname: data.nickname,
        private: false,
        follower: [],
        following: [],
        visibleTo: [],
      });
    
      userinfo.save((err) => {
        if (err) {
          res.status(400).json('Error: ' + err);
        }else {
          res.status(200).json('Status: success');
        }
      })
    }
  })
});

// change password
router.route('/changePassword').post(async (req, res) => {
  const data = req.body;
  const filter = { 
    username: data.username,
    password: data.oldPassword,
  };

  try {
    let userId = await Useraccount.findOne(filter).then(useraccount => useraccount.userId);
    if (userId) {
      Useraccount.updateOne(filter, {password: data.newPassword}, (err) => {
        if (err) {
          res.status(400).json('Something wrong');
        }else {
          res.json('Status: success');
        }
      })
    }else {
      res.status(400).json('Something wrong');
    }
  }catch {
    res.status(400).json('Something wrong');
  }
});

// delete useraccount
router.route('/delete').post((req, res) => {
  const data = req.body;
  const filter = {
    userId: data.userId,
  }

  Useraccount.deleteOne(filter, (err) => {
    if (err) {
      res.status(400).json('Error: ' + err);
    }else {
      res.json('Status: success');
    }
  });
});

module.exports = router;



