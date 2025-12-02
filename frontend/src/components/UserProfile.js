import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onLogout }) => {
  return (
    <div id="section-user-profile" className="user-profile">
      <div className="user-info">
        {user.profileImage && (
          <img 
            src={user.profileImage} 
            alt="프로필" 
            className="user-avatar"
          />
        )}
        <div className="user-details">
          <div className="user-nickname">{user.nickname}</div>
          <div className="user-email">{user.email || '이메일 없음'}</div>
        </div>
      </div>
      <button className="logout-button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
};

export default UserProfile;

