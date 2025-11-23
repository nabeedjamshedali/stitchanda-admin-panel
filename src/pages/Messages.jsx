import { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import { Send, MessageCircle, User as UserIcon, Scissors, Bike, Plus, Search, ArrowLeft } from 'lucide-react';
import {
  listenToAdminConversations,
  listenToConversationMessages,
  sendMessage,
  markMessagesAsRead,
  findOrCreateConversation,
  getAllUsersForMessaging,
} from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const messagesEndRef = useRef(null);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState({ customers: [], tailors: [], riders: [] });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const adminId = "XgOkNWeAWWVV5VgQlIO1";
    setLoading(true);
    console.log('Setting up conversation listener for admin:', adminId);

    // Set up real-time listener for conversations
    const unsubscribe = listenToAdminConversations(adminId, (convos) => {
      console.log('Received conversations:', convos?.length || 0);
      setConversations(convos || []);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up conversation listener');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const adminId = "XgOkNWeAWWVV5VgQlIO1";
    console.log('Setting up message listener for conversation:', selectedConversation.id);

    const unsubscribe = listenToConversationMessages(
      selectedConversation.id,
      (msgs) => {
        console.log('Received messages:', msgs?.length || 0);
        setMessages(msgs);
        scrollToBottom();

        markMessagesAsRead(selectedConversation.id, adminId).catch(console.error);
      }
    );

    return () => {
      console.log('Cleaning up message listener');
      unsubscribe();
    };
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    setLoadingUsers(true);
    try {
      const users = await getAllUsersForMessaging();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartConversation = async (selectedUser) => {
    try {
      const adminId = "XgOkNWeAWWVV5VgQlIO1";
      console.log('Starting conversation with:', selectedUser.name, 'Admin ID:', adminId);

      // Close modal immediately for better UX
      setShowNewChatModal(false);

      const conversationId = await findOrCreateConversation(
        adminId,
        selectedUser.id,
        selectedUser.type
      );

      console.log('Conversation created/found:', conversationId);

      // Create a temporary conversation object to display immediately
      const tempConversation = {
        id: conversationId,
        participantName: selectedUser.name,
        participantEmail: selectedUser.email,
        participantType: selectedUser.type,
        last_message: null,
        last_updated: new Date(),
      };

      // Set selected conversation immediately
      // The real-time listener will automatically update with full data
      setSelectedConversation(tempConversation);

      toast.success(`Started conversation with ${selectedUser.name}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const adminId = "XgOkNWeAWWVV5VgQlIO1";

      await sendMessage(selectedConversation.id, {
        sender_id: adminId,
        text: newMessage.trim(),
        type: 'text',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    return conv.participantType === filter;
  });

  const getParticipantIcon = (type) => {
    if (type === 'tailor') return <Scissors className="w-4 h-4" />;
    if (type === 'rider') return <Bike className="w-4 h-4" />;
    if (type === 'customer') return <UserIcon className="w-4 h-4" />;
    return <UserIcon className="w-4 h-4" />;
  };

  const getParticipantColor = (type) => {
    if (type === 'tailor') return 'bg-purple-100 text-purple-600';
    if (type === 'rider') return 'bg-blue-100 text-blue-600';
    if (type === 'customer') return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <Layout title="Messages">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Messages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Chat with customers, tailors, and riders
            </p>
          </div>
          <Button
            onClick={handleOpenNewChat}
            icon={Plus}
            className="bg-[#6B4423] hover:bg-[#8D6A4F] text-white w-full sm:w-auto"
          >
            New Conversation
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-200px)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col`}>
            {/* Filter Tabs */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-[#6B4423] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setFilter('customer')}
                  className={`px-1.5 sm:px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 justify-center ${
                    filter === 'customer'
                      ? 'bg-[#6B4423] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Customers</span>
                  <span className="sm:hidden">C</span> ({conversations.filter(c => c.participantType === 'customer').length})
                </button>
                <button
                  onClick={() => setFilter('tailor')}
                  className={`px-1.5 sm:px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 justify-center ${
                    filter === 'tailor'
                      ? 'bg-[#6B4423] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Scissors className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tailors</span>
                  <span className="sm:hidden">T</span> ({conversations.filter(c => c.participantType === 'tailor').length})
                </button>
                <button
                  onClick={() => setFilter('rider')}
                  className={`px-1.5 sm:px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 justify-center ${
                    filter === 'rider'
                      ? 'bg-[#6B4423] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bike className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Riders</span>
                  <span className="sm:hidden">R</span> ({conversations.filter(c => c.participantType === 'rider').length})
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <MessageCircle className="w-12 h-12 mb-2 text-gray-400" />
                  <p className="text-sm text-center">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        getParticipantColor(conv.participantType)
                      }`}>
                        {getParticipantIcon(conv.participantType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {conv.participantName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {conv.last_updated ? formatDateTime(conv.last_updated).split(',')[0] : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate capitalize">
                          {conv.participantType}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col w-full`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {/* Back Button for Mobile */}
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 hover:bg-gray-200 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      getParticipantColor(selectedConversation.participantType)
                    }`}>
                      {getParticipantIcon(selectedConversation.participantType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.participantName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {selectedConversation.participantType} • {selectedConversation.participantEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const adminId = "XgOkNWeAWWVV5VgQlIO1";
                      const isAdmin = msg.sender_id === adminId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isAdmin
                                ? 'bg-[#6B4423] text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.text || msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              isAdmin ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {msg.timestamp ? formatDateTime(msg.timestamp) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4423] focus:border-transparent"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      icon={Send}
                      loading={sending}
                      disabled={!newMessage.trim()}
                      className="bg-[#6B4423] hover:bg-[#8D6A4F] text-white"
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No conversation selected</p>
                  <p className="text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Conversation Modal */}
        <Modal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          title="Start New Conversation"
          size="lg"
        >
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <Input
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                icon={Search}
              />
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B4423]"
              >
                <option value="all">All Users</option>
                <option value="customer">Customers</option>
                <option value="tailor">Tailors</option>
                <option value="rider">Riders</option>
              </select>
            </div>

            {/* User List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Customers */}
                  {(selectedUserType === 'all' || selectedUserType === 'customer') &&
                    allUsers.customers
                      .filter(u =>
                        !userSearchTerm ||
                        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      )
                      .map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => handleStartConversation(customer)}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            <span className="text-xs text-green-600">Customer</span>
                          </div>
                        </button>
                      ))}

                  {/* Tailors */}
                  {(selectedUserType === 'all' || selectedUserType === 'tailor') &&
                    allUsers.tailors
                      .filter(u =>
                        !userSearchTerm ||
                        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      )
                      .map(tailor => (
                        <button
                          key={tailor.id}
                          onClick={() => handleStartConversation(tailor)}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Scissors className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{tailor.name}</p>
                            <p className="text-sm text-gray-500">{tailor.email}</p>
                            <span className="text-xs text-purple-600">Tailor</span>
                          </div>
                        </button>
                      ))}

                  {/* Riders */}
                  {(selectedUserType === 'all' || selectedUserType === 'rider') &&
                    allUsers.riders
                      .filter(u =>
                        !userSearchTerm ||
                        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      )
                      .map(rider => (
                        <button
                          key={rider.id}
                          onClick={() => handleStartConversation(rider)}
                          className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{rider.name}</p>
                            <p className="text-sm text-gray-500">{rider.email}</p>
                            <span className="text-xs text-blue-600">Rider</span>
                          </div>
                        </button>
                      ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Messages;
