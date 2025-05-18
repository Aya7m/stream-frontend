import React, {  useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from 'lucide-react';
import NoNotificationsFound from '../components/NoNotificationsFound';

const NotificationsPage = () => {
  // fetch my friends requests
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const { token } = useAuth();
  const [accept, setAccept] = useState([])
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await axios('https://stream-chat-backend-production.up.railway.app/user-controller/my-requests', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response?.data);  // اطبعي الـ data علشان تشوفي شكلها
      if (response.status === 200) {
        setRequests(response?.data.
          myRequests
        );  // هنا لازم تتأكد إن data.myRequests هي فيها incomingRequests و outgoingRequests
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user friends:', error);
    }
  };



  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await axios(`https://stream-chat-backend-production.up.railway.app/user-controller/accept-request/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },

      });

      if (response.status === 201) {
        setAccept(response?.data.request);
        fetchMyRequests();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };




  useEffect(() => {
    fetchMyRequests();
   
  }, []);



  const incomingRequests = requests?.incomingRequests || [];
  const acceptedRequests = requests?.outgoingRequests || [];


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              <img src={request.sender.profilePic} alt={request.sender.fullname} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.sender.fullname}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptFriendRequest(request._id)}
                            disabled={outgoingRequestsIds.has(request.sender._id) || outgoingRequestsIds.has(request.receiver._id)}
                          >
                            Accept
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          
            {/* ACCEPTED REQS NOTIFICATIONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.receiver.profilePic}
                              alt={notification.receiver.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.receiver.fullName}</h3>
                            <p className="text-sm my-1">
                              {notification.receiver.fullName} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}


            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage