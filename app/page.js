"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile, askQuestion } from "./actions";
import ReactMarkdown from "react-markdown";

export default function Page() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadFile(formData);
    if (result.success) {
      setUploadStatus("File uploaded successfully!");
      setFile(null);
      setIsFileUploaded(true);
      setMessages([]);
    } else {
      setUploadStatus(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    const newMessages = [...messages, { role: "user", text: currentQuestion }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    const result = await askQuestion(newMessages);

    if (result.success) {
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer || "" }]);
    } else {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${result.error}` }]);
    }
    setLoading(false);
  };

  const handleUploadNewFile = () => {
    setIsFileUploaded(false);
    setUploadStatus("");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">RAG Assistant</h1>

      {/* File Upload Section */}
      {!isFileUploaded ? (
        <div className="border border-gray-700 bg-gray-900 p-6 rounded-xl shadow-lg mb-6 shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-white">Upload Document</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Uploading..." : "Start Chatting"}
            </button>
            {uploadStatus && (
              <p className={`text-sm text-center ${uploadStatus.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                {uploadStatus}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4 shrink-0">
          <span className="text-green-400 font-semibold text-sm">✅ Document active and ready.</span>
          <button
            onClick={handleUploadNewFile}
            className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            Upload a different file
          </button>
        </div>
      )}

      {/* Chat Section */}
      {isFileUploaded && (
        <div className="flex-grow flex flex-col border border-gray-700 bg-gray-900 rounded-xl shadow-lg overflow-hidden">

          {/* Chat History Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg">Ask me anything about your document!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="markdown-body prose prose-invert max-w-none text-sm space-y-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-gray-800 text-gray-400 rounded-bl-none border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-4 bg-gray-800 border-t border-gray-700 shrink-0">
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Message the AI..."
                className="flex-grow p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
