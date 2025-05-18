import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import NoFriendsFound from '../components/NoFriendsFound';
import FriendCard, { getLanguageFlag } from '../components/FriendCard';

const HomePage = () => {
  const { token } = useAuth();

  const [friends, setFriends] = useState([]);
  const [recomendedUsers, setRecomendedUsers] = useState([]);
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  if (!token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const fetchUserFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await axios('https://stream-chat-backend-production.up.railway.app/user-controller/my-friends', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setFriends(response.data.friends);
      }
    } catch (error) {
      console.error('Error fetching user friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchRecommendedUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios('https://stream-chat-backend-production.up.railway.app/user-controller/recommended-users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setRecomendedUsers(response.data.recommendedUsers);
      }
    } catch (error) {
      console.error('Error fetching recommended users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const response = await axios('https://stream-chat-backend-production.up.railway.app/user-controller/outgoing-requests', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Outgoing requests from API:", response.data);

        const requests = response.data.outgoingRequests;
        const requestReceiverIds = new Set(requests.map((request) => request.receiver._id));
        setOutgoingRequestsIds(requestReceiverIds);
      }
    } catch (error) {
      console.error('Error fetching outgoing requests:', error);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      setIsRequestSent(true);
      const response = await axios.post(
        `https://stream-chat-backend-production.up.railway.app/user-controller/send-request/${friendId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setOutgoingRequestsIds((prev) => new Set([...prev, friendId]));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setIsRequestSent(false);
    }
  };

  useEffect(() => {
    fetchUserFriends();
    fetchRecommendedUsers();
    fetchOutgoingRequests();
  }, [token]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        {/* Friends Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Recommended Users Section */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recomendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recomendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div key={user._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullname} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.fullname}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? 'btn-disabled' : 'btn-primary'}`}
                        onClick={() => sendFriendRequest(user._id)}
                        disabled={hasRequestBeenSent || isRequestSent}
                      >
                        {isRequestSent && !hasRequestBeenSent ? (
                          <>
                            <span className="loading loading-spinner loading-xs mr-2" />
                            Sending...
                          </>
                        ) : hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
