import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to Naffco Pump Selector! What is your required flow rate (m³/h)?' }
  ]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState('flow');
  const [userData, setUserData] = useState({});
  const [showModel, setShowModel] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  const sendEmail = async (data) => {
    try {
      await fetch('https://formspree.io/f/your_form_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow: data.flow,
          head: data.head,
          application: data.application,
          model: 'ES65/40'
        })
      });
    } catch (err) {
      console.error('Email sending failed', err);
    }
  };

  const handleSend = (injectedInput) => {
    const currentInput = injectedInput || input;
    if (!currentInput.trim()) return;
    const newMessages = [...messages, { from: 'user', text: currentInput }];
    let botResponse = '';
    const newUserData = { ...userData };

    switch (stage) {
      case 'flow':
        newUserData.flow = currentInput;
        botResponse = 'What is your required head (m)?';
        setStage('head');
        break;
      case 'head':
        newUserData.head = currentInput;
        botResponse = 'What is the application? (e.g., Firefighting, HVAC, Irrigation)';
        setStage('application');
        break;
      case 'application':
        newUserData.application = currentInput;
        botResponse = `Thanks! Based on your input, a suitable pump model is: Model ES65/40. Would you like to send an enquiry?`;
        setStage('enquiry');
        setShowModel(true);
        break;
      case 'enquiry':
        if (currentInput.toLowerCase().includes('yes')) {
          botResponse = 'Your enquiry has been submitted. Our team will contact you soon.';
          setEnquirySent(true);
          sendEmail(userData);
        } else {
          botResponse = 'Okay, let us know if you need further assistance.';
        }
        setStage('done');
        break;
      default:
        botResponse = "Thank you. Please wait while we process your request.";
    }

    setUserData(newUserData);
    setMessages([...newMessages, { from: 'bot', text: botResponse }]);
    setInput('');
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-header">Pump Selection Assistant</div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={\`message \${msg.from}\`}>{msg.text}</div>
        ))}
        {showModel && !enquirySent && (
          <div className="model-suggestion">
            <strong>Suggested Pump:</strong> Model ES65/40<br />
            <button className="enquiry-btn" onClick={() => handleSend('yes')}>Send Enquiry</button>
          </div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your answer here..."
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>

    </div>
  );
};

export default Chatbot;
