import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

function UserProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/v1/users/me');
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (err) {
      setError('Error fetching user profile');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/v1/users/me', editedProfile);
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating user profile');
      console.error(err);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedProfile.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedProfile.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={editedProfile.bio || ''}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Bio:</strong> {profile.bio || 'No bio provided'}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;