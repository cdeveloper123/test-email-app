"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Inbox = () => {
  const [gmailMessages, setGmailMessages] = useState([]);
  const [outlookMessages, setOutlookMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('gmail');
  const [gmailStartIndex, setGmailStartIndex] = useState(0);
  const [outlookStartIndex, setOutlookStartIndex] = useState(0);
  const router = useRouter();

  
  useEffect(() => {
    fetchGmailMessages();
    fetchOutlookMessages();
  }, []);

  const fetchGmailMessages = async () => {
    try {
      const response = await fetch(`/api/gmail/getEmails?startIndex=${gmailStartIndex}&maxResults=10`);

      if (!response.ok) {
        throw new Error('Failed to fetch Gmail messages');
      }

      const data = await response.json();

      setGmailMessages(prevMessages => {
        const newMessages = data.filter(newMessage =>
          !prevMessages.some(prevMessage => prevMessage.id === newMessage.id)
        );
        return [...prevMessages, ...newMessages];
      });

      setGmailStartIndex(prevIndex => prevIndex + 10);
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
    }
  };

  const fetchOutlookMessages = async () => {

    try {
      const response = await fetch(`/api/outlook/getEmails?startIndex=${outlookStartIndex}&maxResults=10`);

      if (!response.ok) {
        throw new Error('Failed to fetch Outlook messages');
      }
      const data = await response.json();
      setOutlookMessages(prevMessages => {
        const newMessages = data.filter(newMessage =>
          !prevMessages.some(prevMessage => prevMessage.id === newMessage.id)
        );
        return [...prevMessages, ...newMessages];
      });

      setOutlookStartIndex(prevIndex => prevIndex + 10);
    } catch (error) {
      console.error('Error fetching Outlook messages:', error);
    }
  };

  const handleSelectMessage = (message) => {
    if (isNaN(message.id)) {
      router.push(`/inbox/gmail/${message.id}`);
    } else {
      router.push(`/inbox/outlook/${message.id}`);
    }
  };

  const loadMoreMessages = () => {
    if (activeTab === 'gmail') {
      fetchGmailMessages();
    } else if (activeTab === 'outlook') {
      fetchOutlookMessages();
    }
  };

  const normalizeMessage = (message, source) => {
    if (source === 'gmail') {
      return {
        id: message.id,
        sender: message.sender,
        date: message.date,
        snippet: message.snippet,
      };
    } else if (source === 'outlook') {
      return {
        id: message.id,
        sender: message.from,
        date: message.date,
        snippet: message.text.slice(0, 100),
      };
    }
    return message;
  };

  const renderMessages = (messages, source) => {
    return messages.map((message, index) => {
      const normalizedMessage = normalizeMessage(message, source);
      return (
        <div key={index} onClick={() => handleSelectMessage(normalizedMessage)} className="px-4 py-3 border-b cursor-pointer hover:bg-gray-100 flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
            <span className="text-gray-600 font-semibold">{normalizedMessage.sender[0]}</span>
          </div>
          <div className="flex-grow">
            <p className="font-semibold">{normalizedMessage.sender}</p>
            <p className="text-sm text-gray-600">{normalizedMessage.snippet}</p>
          </div>
        </div>
      );
    });
  };
  if(gmailMessages.length===0 && outlookMessages.length===0){
    return (<>Loading....</>)
  }
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <h1 className="text-xl font-semibold py-4 px-6 border-b">Inbox</h1>
      </div>
      <div className="overflow-y-auto flex-grow">
        {renderMessages(outlookMessages, 'outlook')}
        {renderMessages(gmailMessages, 'gmail')}
        {/* {activeTab === 'gmail' && renderMessages(gmailMessages, 'gmail')} */}
        {/* {activeTab === 'outlook' && renderMessages(outlookMessages, 'outlook')} */}
        {(activeTab === 'gmail' && gmailMessages.length > 10) && (
          <button onClick={loadMoreMessages} className="w-full py-3 bg-blue-500 text-white font-semibold">
            Load More
          </button>
        )}
        {(activeTab === 'outlook' && outlookMessages.length > 10) && (
          <button onClick={loadMoreMessages} className="w-full py-3 bg-blue-500 text-white font-semibold">
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default Inbox;
