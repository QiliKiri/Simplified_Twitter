import React, { useState, useEffect } from 'react';
import './Userinfo_component.css';
import { useNavigate } from 'react-router-dom';

import AlertDialog from '../dialogs/AlertDialog';

export default function Userinfo_component() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchSelfPosts = async () => {
    let postData = await fetch(`http://localhost:8000/posts?username=${user.userinfo.username}`,
    {
      method: 'GET',
      mode: 'cors'
    })
    .then(data => data.json());

    setPosts(postData);
    // console.log(postData);
  }

  const unfollowUser = async (beFollowUsername) => {
    const res = await fetch('http://localhost:8000/userinfos/unfollow', {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        'followerUsername': user.useraccount.username,
        'beFollowUsername': beFollowUsername,
      })
    })
    .then(res => res.json());

    await renewUser(res);
  }

  const getUseraccount = async () => {
    const useraccount = await fetch(`http://localhost:8000/useraccounts?userId=${user.useraccount.userId}`,
    {
      method: 'GET',
      mode: 'cors',
    })
    .then(data => data.json())
    
    return useraccount;
  }

  const getUserinfo = async () => {
    const userinfo = await fetch(`http://localhost:8000/userinfos?userId=${user.useraccount.userId}`,
    {
      method: 'GET',
      mode: 'cors',
    })
    .then(data => data.json());
    return userinfo;
  }

  const renewUser = async (val) => {
    const useraccount = await getUseraccount();
    const userinfo = await getUserinfo();
    localStorage.removeItem('user');
    localStorage.setItem('user', JSON.stringify({
      'userinfo': userinfo,
      'useraccount': useraccount,
    }));
    window.location.reload();
    console.log('renew')
  }

  const createChatroom = async (val) => {
    const secUser = await fetch(`http://localhost:8000/useraccounts?username=${val}`, {
      method: 'GET',
      mode: 'cors',
    })
    .then(res => res.json());

    await fetch('http://localhost:8000/chatrooms', {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        'firstUserId': user.useraccount.userId,
        'secUserId': secUser.userId,
      })
    })
    .then(res => res.json())
    .finally(() => {
      navigate('/chatroom');
    })

  }

  useEffect(() => {
    fetchSelfPosts();
  }, []);

  return (
    <div className="userinfo-page">
      <div className="userinfo-topic">
        <h2>Profile</h2>
      </div>
      <div className="userinfo-main">
        <div className="userinfo-section">
          <div className="userinfo-profile">
            <div className="userinfo-profile-header">
              <img src="https://picsum.photos/200" alt="User avatar" className="userinfo-avatar" />
              <div className="userinfo-userdetails">
                <h1 className="userinfo-name">{user.userinfo.username}</h1>
                <p className="userinfo-userid">@{user.useraccount.userId}</p>
              </div>
            </div>
            <div className="userinfo-stats">
              <div className="userinfo-stat">
                <p className="userinfo-count">{user.userinfo.follower.length}</p>
                <p className="userinfo-label">Followers</p>
              </div>
              <div className="userinfo-stat">
                <p className="userinfo-count">{user.userinfo.following.length}</p>
                <p className="userinfo-label">Following</p>
              </div>
              <div className="userinfo-stat">
                <p className="userinfo-count">{posts.length}</p>
                <p className="userinfo-label">Tweets</p>
              </div>
            </div>
          </div>
        </div>
        <div className="userinfo-follow">
          <div className="userinfo-section">
            <h2>Followers</h2>
            <ul>
              {user.userinfo.follower.map((val, index) => (
                <div key={index} className="userinfo-follow-row">
                  <div className="userinfo-follow-name">
                    <li>{val}</li>
                  </div>
                  <div className="userinfo-follow-action">
                    <div className="userinfo-follow-row-block">
                      <button className="userinfo-message-btn">Message</button>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </div>
          <div className="userinfo-section">
            <h2>Following</h2>
            <ul>
              {user.userinfo.following.map((val, index) => (
                <div key={index} className="userinfo-follow-row">
                  <div className="userinfo-follow-name">
                    <li>{val}</li>
                  </div>
                  <div className="userinfo-follow-action">
                    <div className="userinfo-follow-row-block">
                      <button className="userinfo-unfollow-btn" onClick={() => unfollowUser(val)}>Unfollow</button>
                    </div>
                    <div className="userinfo-follow-row-block">
                      <button className="userinfo-message-btn" onClick={() => createChatroom(val)}>Message</button>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
