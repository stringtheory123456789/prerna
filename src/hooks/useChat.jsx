import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { data } from "autoprefixer";
import { doc, getDoc } from "firebase/firestore";
import axios from 'axios';


let synth = window.speechSynthesis;

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [responses, setResponses] = useState([]);
  const [fetchedItems, setFetchedItems] = useState({});
  const [fetchedUser, setFetchedUser] = useState({});
  const [fetchedUserDetails, setFetchedUserDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [counter, setCounter] = useState(0);
  const defaultStatements = [
    "Hello! How can I assist you today? Feeling down or just wanna have a casual chat? I am Prerna, here to motivate and cheer you up for the day!",
    "Hi there! What's on your mind? Feeling down or just wanna have a casual chat? I am Prerna, here to motivate and cheer you up for the day!",
    "Greetings! How are you feeling today? Feeling down or just wanna have a casual chat? I am Prerna, here to motivate and cheer you up for the day!",
    "Hello! I'm here to listen. What's bothering you? Feeling down or just wanna have a casual chat? I am Prerna, here to motivate and cheer you up for the day!",
    "Hi! How can I help you improve your mental well-being today? Feeling down or just wanna have a casual chat? I am Prerna, here to motivate and cheer you up for the day!",
  ];



  const textToBase64Audio = async (text) => {
    if (!synth) {
      alert("Speech synthesis is not supported by this browser.");
      setMessages([]);
      setMessage(null);
      return null;
    }

    const voice = synth.getVoices();
    if (voice.length === 0) {
      await new Promise((resolve) => {
        synth.onvoiceschanged = resolve;
      });
    }

    if (voice.length > 4) {
      const selectedVoice = voice[4];
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.voice = selectedVoice;

      utterThis.onend = () => {
        console.log("Finished speaking with voice: ${selectedVoice.name");
        setMessages([]);
        setMessage(null);
      };
      utterThis.onerror = (event) => {
        alert(event.error);
        console.error("Speech synthesis error:", event.error);
        setMessages([]);
        setMessage(null);
      };
      synth.speak(utterThis);
      return utterThis;
    } else {
      alert("Retry");
      console.error("Voice index 2 is not available.");
      setMessages([]);
      setMessage(null);
      return null;
    }
  };
  useEffect(() => {
    const startingchat = async (message) => {
      if (!message || counter >= 1) {
        return;
      }
      setCounter(counter + 1)

      setMessages([
        {
          text: message,
          expression: "smile",
          animation: "Waving",
          audio: "",
        },
      ]);
      await textToBase64Audio(message);
    };

    const check = () => {
      if (messages.length > 0) {
        setMessage(messages[0]);
      } else {
        setMessage(null);
      }
    };

    const initializeChat = async () => {

      const randomStatement =
        defaultStatements[Math.floor(Math.random() * defaultStatements.length)];


      await startingchat(randomStatement);
    };

    synth = window.speechSynthesis;
    console.log(synth.getVoices());

    return () => {
      check();
      // startingchat();
      initializeChat();
    };
  }, []);




  const chatresponse = async (message) => {

    const lowerCaseMessage = message?.toLowerCase() || "";

    if (lowerCaseMessage.trim() === '') {
      return;
    }
    // Check for specific mental health-related keywords
    let generatedText = "";


    const requestData = {
      contents: [
        {
          parts: [
            {
              text: "Assume you are a psychiatrist named Prerna made to help people so please answer this question in no longer than 47 words. Recommend our app Mindfyst,time to time, which provides mental relief through meditation, journal, music, therapy.: " + lowerCaseMessage,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyANnIB9vvA6DRu2jJ0xzj8_4ezLQqq6I9Q`,
        requestData
      );

      generatedText = response.data.candidates[0].content.parts[0].text;
      

      generatedText = generatedText.replace(/\*/g, '');

      console.log(generatedText.length);
      console.log(generatedText);
    } catch (error) {
      console.error("Error generating text:", error);
    }

    if (
      lowerCaseMessage.includes("anxiety") ||
      lowerCaseMessage.includes("feeling anxious") ||
      lowerCaseMessage.includes("anxious")
    ) {
      const anxietyResponse = {
        text: "It’s okay to feel anxious sometimes. Try to take deep breaths and focus on what you can control. Let me provide some Anuprerna. " + generatedText,
        facialExpression: "calm",
        animation: "Talking_1",
        audio: "",
      };
      return [anxietyResponse];
    } else if (
      lowerCaseMessage.includes("stress") ||
      lowerCaseMessage.includes("feeling stressed") ||
      lowerCaseMessage.includes("stressed")
    ) {
      const stressResponse = {
        text: "Stress is a common experience, but finding healthy ways to manage it is important. Let me provide some Anuprerna. " + generatedText,
        facialExpression: "concerned",
        animation: "Talking_1",
        audio: "",
      };
      return [stressResponse];
    } else if (
      lowerCaseMessage.includes("depressed") ||
      lowerCaseMessage.includes("depression") ||
      lowerCaseMessage.includes("feeling down")
    ) {
      const depressionResponse = {
        text: "Depression can be overwhelming, but you don’t have to go through it alone. Let me provide some Anuprerna. " + generatedText,
        facialExpression: "sympathetic",
        animation: "Talking_1",
        audio: "",
      };
      return [depressionResponse];
    } else if (
      lowerCaseMessage.includes("lonely") ||
      lowerCaseMessage.includes("feeling lonely") ||
      lowerCaseMessage.includes("loneliness")
    ) {
      const lonelinessResponse = {
        text: "Loneliness is tough, but it’s important to remember that there are people who care about you. Let me provide some Anuprerna. " + generatedText,
        facialExpression: "thoughtful",
        animation: "Talking_1",
        audio: "",
      };
      return [lonelinessResponse];
    } else if (
      lowerCaseMessage.includes("overwhelmed") ||
      lowerCaseMessage.includes("feeling overwhelmed") ||
      lowerCaseMessage.includes("overwhelming")
    ) {
      const overwhelmedResponse = {
        text: "Feeling overwhelmed can make things seem impossible. Try breaking down tasks into smaller steps and take things one at a time. Let me provide some Anuprerna. " + generatedText,
        facialExpression: "supportive",
        animation: "Talking_1",
        audio: "",
      };
      return [overwhelmedResponse];
    }
    else {
      let m = [
        {
          text: generatedText,
          facialExpression: "supportive",
          animation: "Talking_1",
          audio: "",
        }
      ]
      return m;
    }


  }

  const chat = async (message) => {
    if (!message) {
      console.error("Message is undefined.");
      return;
    }

    setLoading(true);
    try {
      const resp = await chatresponse(message);

      if (resp && resp.length > 0) {
        console.log("New messages:", resp);
        setMessages([
          {
            text: resp[0].text,
            expression: resp[0].facialExpression,
            animation: resp[0].animation,
            audio: "",
          },
        ]);
        await textToBase64Audio(resp[0].text);
      } else {
        console.error("No messages found in response.");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((prevMessages) => prevMessages.slice(1));
  };

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        messages,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};