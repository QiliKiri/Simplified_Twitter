const router = require('express').Router();
let Message = require('../models/message.model');

router.route('/').get((req, res) => {
  const rmId = req.query.rmId;
  if (rmId) {
    Message.find({ rmId: rmId })
      .sort({ createdAt: -1})
      .then(messages => res.json(messages))
      .catch(err => res.status(400).json('Error: ' + err));
  }else {
    Message.find()
    .sort({ createdAt: -1})
    .then(messages => res.json(messages))
    .catch(err => res.status(400).json('Error: ' + err));
  }
})

// create new message
router.route('/').post(async (req, res) => {
  const id = await Message.findOne().sort({ messageId: -1 }).limit(1)
    .then(message => message.messageId);

  const data = req.body;
  let message = new Message({
    messageId: id + 1,
    rmId: data.rmId,
    userId: data.userId,
    message: data.message,
  })

  message.save((err) => {
    if (err) {
      res.status(400).json('Status: faild');
    }else {
      res.status(200).json('Status: success');
    }
  })
})

// get lastest message of chatroom
router.route('/latest').get((req, res) => {
  const rmId = req.query.rmId;
  Message.findOne({ rmId: rmId }).sort({ createdAt: -1 }).limit(1)
  .then(messages => res.json(messages))
  .catch(err => res.status(400).json('Error: ' + err));
})


module.exports = router;
