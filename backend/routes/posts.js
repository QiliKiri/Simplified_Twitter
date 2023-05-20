const router = require('express').Router();
let Post = require('../models/post.model');

router.route('/').get((req, res) => {
  const postId = req.query.postId;
  const username = req.query.username;
  if (postId) {
    Post.find({ postId: postId })
      .sort({ createdAt: -1})
      .then(posts => res.json(posts))
      .catch(err => res.status(400).json('Error: ' + err));
  }else if (username) {
    Post.find({ username: username })
    .sort({ createdAt: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
  }else {
    Post.find()
      .sort({ createdAt: -1})
      .then(posts => res.json(posts))
      .catch(err => res.status(400).json('Error: ' + err));
  }
});

// create new post
router.route('/').post(async (req, res) => {
  const id = await Post.findOne().sort({ postId: -1 }).limit(1)
  .then(post => post.postId);

  const data = req.body;
  let post = new Post({
    postId: id + 1,
    username: data.username,
    content: data.content,
    image: data.image,
    like: [],
    dislike: [],
    retweetBy: [],
    retweet: false,
  });

  post.save((err) => {
    if (err) {
      res.status(400).json('Error: ' + err);
    }else {
      res.status(200).json('Status: success');
    }
  });
});

// update a post
router.route('/update').post((req, res) => {
  const data = req.body;
  const filter = {
    postId: data.postId,
  }
  const value = {
    content: data.content,
  }

  Post.findOneAndUpdate(filter, value, { new: true }, (err, post) => {
    if(err){
      res.status(400).json('Error: ' + err);
    }else{
      res.json(post);
    }
  });
});

// delete a post
let Comment = require('../models/comment.model');
router.route('/delete').post((req, res) => {
  const data = req.body;
  const filter = {
    postId: data.postId,
  }
  
  try {
    Post.deleteOne(filter).exec();
    Comment.deleteMany(filter).exec();

    res.json('Status: success');
  }catch (err) {
    res.json('Error: ' + err);
  }
});

// like a post
router.route('/like').post(async (req, res) => {
  const data = req.body;
  const filter = {
    postId: data.postId,
  }

  let post =  await Post.findOne(filter)
    .then(post => post.toObject());
  
  let like = post.like;
  if (!post.like.includes(data.username)) {
    like = [...like, data.username];
  }

  let dislike = post.dislike;
  const index = post.dislike.indexOf(data.username);
  if (index != -1) {
    dislike.splice(index, 1);
  }

  Post.updateOne(filter, { like: like, dislike: dislike }, (err) => {
    if (err) {
      res.status(400).json('Error: ' + err);
    }else {
      res.json('Status: success');
    }
  });

});

// dislike a post
router.route('/dislike').post(async (req, res) => {
  const data = req.body;
  const filter = {
    postId: data.postId,
  }

  let post =  await Post.findOne(filter)
    .then(post => post.toObject());
  
  let dislike = post.dislike;
  if (!dislike.includes(data.username)) {
    dislike = [...dislike, data.username];
  }

  let like = post.like;
  const index = post.like.indexOf(data.username);
  if (index != -1) {
    like.splice(index, 1);
  }

  Post.updateOne(filter, { like: like, dislike: dislike }, (err) => {
    if (err) {
      res.status(400).json('Error: ' + err);
    }else {
      res.json('Status: success');
    }
  });
});

// retweet a post
router.route('/retweet').post((req,res) => {
  try{
    //retweeter stores a the retweeter's username
    Post.findOneAndUpdate({postId: req.body['postId']},{$push: {'retweetBy': req.body['retweeter']}}, {new:true},  (err, retweet) => {
      if(err){
        res.status(400).json('Error: ' + err);
      }else{
        res.json(retweet);
      }
    })

    Post.find().sort({ "postId": -1 }).limit(1).exec(function(err,item){
      const retweetPost = new Post({
        postId: item[0].postId+1,   
        username: req.body['username'],
        content: req.body['content'],
        image: req.body['image'],
        like: [],
        dislike: [],
        retweetBy: [], 
        retweet: true,
        retweeter: req.body['retweeter']
      })
      retweetPost.save();
    })
  }catch (err){
    console.log(err)
  }
})

module.exports = router;
