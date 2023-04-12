import React, { useState, useEffect,useRef } from 'react';
import './Tweet_component.css';
import './Post_component.css';

const Tweet = () => {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState("");

  const user = JSON.parse(localStorage.getItem('user'));


  const fetchFollowingPosts = async () => {
    let followingPosts = [];
    for (let i=0; i<user.userinfo.following.length; i++) {
      let postData = await fetch(`http://localhost:8000/posts?username=${user.userinfo.following[i]}`,
      {
        method: 'GET',
        mode: 'cors'
      })
      .then(data => data.json());

    postData = await fetchComments(postData);
    followingPosts = [...followingPosts, ...postData];
    }

    let postData = await fetch(`http://localhost:8000/posts?username=${user.userinfo.username}`,
    {
      method: 'GET',
      mode: 'cors'
    })
    .then(data => data.json());

    postData = await fetchComments(postData);
    followingPosts = [...followingPosts, ...postData];

    setPosts(followingPosts);
    // console.log(postData);
  }

  const fetchComments = async (postData) => {
    for (let i=0; i<postData.length; i++) {
      postData[i].comment = await fetch('http://localhost:8000/comments')
        .then(data => data.json());
    }
    return postData;
  }

  const likePosts = async (postId) => {
    const res = await fetch('http://localhost:8000/posts/like',
      {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          "postId": postId,
          "username": user.userinfo.username
        })
      })
      .then(data => data.json())
      .finally(fetchFollowingPosts)

      // alert(res);
  }

  const dislikePosts = async (postId) => {
    const res = await fetch('http://localhost:8000/posts/dislike',
      {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          "postId": postId,
          "username": user.useraccount.username
        })
      })
      .then(data => data.json())
      .finally(fetchFollowingPosts)

      // alert(res);
  }

  const retweetPosts = async (post) => {
    const res = await fetch('http://localhost:8000/posts/retweet',
      {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          "postId": post.postId,
          "username": user.userinfo.username,
          "content": post.content,
          "retweeter": user.userinfo.username,
        })
      })
      .then(data => data.json())
      .finally(fetchFollowingPosts)

      // alert(res);
  }

  const createPost = async () => {
    if (!input) {
      return;
    }
    await fetch('http://localhost:8000/posts',
      {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          "username": user.userinfo.username,
          "content": input,
        })
      })
      .then(data => data.json())
      .finally(fetchFollowingPosts);
    
    setInput("");
    setSelectedImage();
  }
  // to be added image to create post function 

  useEffect(() => {
    fetchFollowingPosts();
  }, []);

  // Tweet Image
  const wrapperRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState();
    const [hasImage,setHasImage] = useState("false");

    const onDragEnter = () => wrapperRef.current.classList.add('dragover');
    const onDragLeave = () => wrapperRef.current.classList.remove('dragover');
    const onDrop = () => wrapperRef.current.classList.remove('dragover');

    const imageChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedImage(e.target.files[0]); // to change the selected image
        setHasImage(true);
      }
    };

    const removeSelectedImage = () => {
      setSelectedImage();
    };

    //End of Tweet image 

  return (
    <div className="tweetandpost-page">
      <div className="tweet-topicbar">
        <h6>Tweet</h6>
        <div className="description-text">
          Take a look in today's SAO tweet.
        </div>
      </div>
      <div className="tweet-section">
        {posts.map((val, index) => {
          return (
            <div key={index} className="tweet-block-container">
              <div className="tweet-block">
                <div className="tweet-block-user-bar">
                  <div className="tweet-block-user-name-block">
                    <h6>{val.username}</h6>
                  </div>
                  <div className="tweet-block-user-bar-block">
                    <h2>{val.username}</h2>
                  </div>
                </div>
                <div className="tweet-block-content-section">
                  <div className="tweet-block-content">
                    {val.content}
                  </div>
                </div>
                <div className="tweet-block-action-bar">
                  <div onClick={() => likePosts(val.postId)} className="tweet-block-action-block">
                    like {val.like.length}
                  </div>
                  <div onClick={() => dislikePosts(val.postId)} className="tweet-block-action-block">
                    dislike {val.dislike.length}
                  </div>
                  <div onClick={() => retweetPosts(val)}  className="tweet-block-action-block">
                    retweet {val.retweetBy.length}
                  </div>
                  <div className="tweet-block-action-block">
                    comment {val.comment.length}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="post-section">
        <div className="post-block">
          <div className="post-textarea-container">
            <textarea
              required
              placeholder="Enter twitter here..."
              className="post-textarea"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
          <div className="post-toolbar">
            <ul className='uploadbar'> 
              <li>
                {selectedImage && (
                <div>
                  <img
                  className="image_preview"
                    src={URL.createObjectURL(selectedImage)}
                  />
                </div>
                )}
              </li>
            {
              !selectedImage ?
                (<li
                    ref={wrapperRef}
                    className="drop-file-input"
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}>
                    <div 
                    className="drop-file-input__label"
                    >
                        <p>Drag/ Drop your image here</p>
                    </div>
                    <input type="file" value="" onChange={imageChange}/>
                </li>)
                : (<li
                ref={wrapperRef}
                className="drop-file-input">
                <button className="delete-button" onClick={removeSelectedImage}>
                  Remove This Image
                </button>
              </li>)
            }
              
            </ul>
            <ul className="functionbar">
              <li className="post-toolbar-block">
                Tool
              </li>
              <li className="post-toolbar-block">
                <button className="post-toolbar-btn" onClick={createPost}>Send</button>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Tweet;
