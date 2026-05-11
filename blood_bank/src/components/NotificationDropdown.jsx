import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, Clock, MapPin, AlertCircle, Droplets, User, Building } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const socket = io('http://localhost:5000');

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      socket.on('new_notification', (notification) => {
        if (!notification.userId || notification.userId === user._id) {
          setNotifications(prev => [notification, ...prev]);
          toast.success(`New Notification: ${notification.title}`, {
            icon: '🔔',
            style: { borderRadius: '15px', background: '#333', color: '#fff' }
          });
        }
      });
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      socket.off('new_notification');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications?userId=${user?._id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/clear?userId=${user?._id}`);
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'blood_request': return <Droplets className="w-4 h-4 text-red-500" />;
      case 'camp_update': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'donor_response': return <User className="w-4 h-4 text-blue-500" />;
      case 'hospital_alert': return <Building className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 max-h-[32rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 z-50"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-gray-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-slate-50 p-3 dark:bg-gray-800">
                    <Bell className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-gray-800">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        markAsRead(n._id);
                        if (n.redirectUrl) navigate(n.redirectUrl);
                        setIsOpen(false);
                      }}
                      className={`group relative flex cursor-pointer gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50 ${!n.isRead ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                    >
                      <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${getUrgencyColor(n.urgency)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex-shrink-0">{getIcon(n.type)}</span>
                          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!n.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n._id);
                              }}
                              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full border-t border-slate-100 py-3 text-center text-xs font-bold text-red-600 transition hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
