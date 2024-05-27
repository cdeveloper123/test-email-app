"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useClient = () => {
  const router = useRouter();
  return {
    router,
    fetch: async (url, options) => {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      return res.json();
    }
  };
};

const EmailDetailPage = ({ params }) => {
  const { router, fetch } = useClient();
  const { id } = params;
  const [message, setMessage] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchEmailMessage(id);
    }
  }, [id]);

  const fetchEmailMessage = async (id) => {
    try {
      const response = await fetch(`/api/gmail/getSingleEmail?id=${id}`);
      setMessage(response);
    } catch (error) {
      console.error('Error fetching email message:', error);
    }
  };

  const handleReplyButtonClick = () => {
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    try {

      const raw = JSON.stringify({
        from: message.to,
        to: message.sender,
        subject: `Re: ${message.subject}`,
        html: replyMessage
      });

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: raw,
      });
      console.log("response", response);
      setReplyModalOpen(false);
      setReplyMessage('')
    } catch (error) {
      console.error('Error sending reply email:', error);
    }
  };

  if (!message) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-xl font-semibold">Email Detail</h1>
      </div>
      <div className="p-4 flex-grow">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold">{message.subject}</h2>
          <div className="flex justify-between mt-2">
            <p className="text-sm text-gray-600">{message.sender}</p>
            <p className="text-sm text-gray-600">{message.date}</p>
          </div>
          <div className="mt-4">
            <p><strong>From:</strong> {message.sender}</p>
            <p><strong>To:</strong> {message.to}</p>
            <p><strong>Subject:</strong> {message.subject}</p>
            <p><strong>Date:</strong> {message.date}</p>
            <p><strong>Message:</strong> {message.snippet}</p>
          </div>
          <button onClick={handleReplyButtonClick} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Reply
          </button>
        </div>
        <button onClick={() => router.push('/inbox')} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Inbox
        </button>
      </div>
      {replyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <textarea
              className="w-full h-40 border rounded-lg p-2 mb-4"
              placeholder="Type your reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <button onClick={() => {
                setReplyModalOpen(false)
                setReplyMessage('')
              }} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                Cancel
              </button>
              <button onClick={handleReplySubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetailPage;
