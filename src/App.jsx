import { useEffect, useState } from "react";
import { Box, ThemeProvider, createTheme, CssBaseline, Switch } from "@mui/material";
import HelperChat from "./components/HelperChat";
import CodeInput from "./components/CodeInput";
import DebugInput from "./components/DebugInput";
import axios from "axios";

function App() {
  const [chatEnabled, setChatEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [mode, setMode] = useState("Explanation");
  const [courses, setCourses] = useState([]);
  const [themeMode, setThemeMode] = useState("dark"); // new state
  const root_url = "https://codebench-ch-api.nicedune-0680dc11.eastus2.azurecontainerapps.io"
  useEffect(() => {
    setConversation([]); // Reset conversation when mode changes
    setChatInput(""); // Reset chat input when mode changes
    setChatEnabled(false); // Reset chat enabled state when mode changes
  }, [selectedCourse, mode])

  const toggleTheme = () => setThemeMode(prev => prev === "light" ? "dark" : "light"); // toggle function

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const process_code = (code) => {
    let code_lines = code.split('\n');
    let code_with_line_numbers = code_lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
    console.log("Processed code with line numbers:\n", code_with_line_numbers);
    return code_with_line_numbers;
  };

  const fetchCodeExplanation = (code) => {
    console.log(`You are in ${mode} mode.`);
    console.log(`Calling API to fetch explanation for code:\n${code}`);
    
    // Process code to add line numbers
    let code_with_line_numbers = process_code(code);

    let data = null
    let url = null
    if (mode === "Explanation") {
      console.log("Fetching explanation...");
      data = JSON.stringify({
        "code": code_with_line_numbers,
        "language": selectedLanguage,
        "course_id": selectedCourse,
      }); 
      url = `${root_url}/explain`
    } else if (mode === "Debug") {
      console.log("Fetching debugging information...");
      data = JSON.stringify({
        "code": code,
        "error": error,
        "language": selectedLanguage,
        "course_id": selectedCourse,
      });
      url = `${root_url}/debug`
    }

    if (!data) {
      console.error("No data to send for explanation.");
      return Promise.reject("No data to send for explanation.");
    }
    console.log("Url sending to:", url);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      headers: { 
        'Content-Type': 'application/json'
      },
      url: url,
      data : data
    };

    return axios.request(config)
    .then((response) => {
      console.log("Explanation received:", response.data);
      return response.data.response;
    })
    .catch((error) => {
      console.error("Error fetching explanation:", error);
      throw error;
    });
  };

  // Dummy API call to simulate chatting with the agent.
  const chatWithAgent = async (updatedConversation) => {

    // Use the updated conversation for payload.
    const currentMessages = updatedConversation.filter(
      (msg) => !(msg.agent && msg.agent.loading)
    );
    
    let processed_code = process_code(code);

    currentMessages.unshift({
      'human': processed_code
    })

    console.log("Current messages for chat:", currentMessages);
    
    const payload = {
      messages: currentMessages,
      language: selectedLanguage,
      mode: mode.toLowerCase(),
      course_id: selectedCourse,
    };

    try {
      const response = await axios.request({
        method: "post",
        maxBodyLength: Infinity,
        url: `${root_url}/chat`,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(payload),
      });
      console.log("Chat response received:", response.data);
      setConversation((prev) => {
        const newConv = [...prev];
        const loadingIndex = newConv.findIndex(
          (msg) => msg.agent && msg.agent.loading
        );
        if (loadingIndex !== -1) {
          newConv[loadingIndex] = {
            agent: response.data.response || "No response",
          };
        }
        return newConv;
      });
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setConversation((prev) => {
        const newConv = [...prev];
        const loadingIndex = newConv.findIndex(
          (msg) => msg.agent && msg.agent.loading
        );
        if (loadingIndex !== -1) {
          newConv[loadingIndex] = {
            agent: "Failed to fetch chat response.",
          };
        }
        return newConv;
      });
    }
  };

  const handleExplainCode = () => {
    // Create a new conversation thread each time.
    setConversation([]);
    if (!code.trim()) {
      alert("Please enter some code to explain.");
      return;
    }
    if (!selectedCourse) {
      alert("Please select a course.");
      return;
    }
    if (!selectedLanguage) {
      alert("Please select a programming language.");
      return;
    }
    setChatEnabled(true);

    // Show loading indicator while the API call is in progress.
    setConversation([{ agent: { loading: true } }]);

    fetchCodeExplanation(code)
      .then((explanation) => {
        if (!explanation) {
          alert("Failed to fetch explanation. Please try again.");
          // Clear loading indicator on error.
          setConversation([]);
          return;
        }
        console.log("Explanation received:", explanation);
        setConversation([{ agent: explanation }]);
      })
      .catch((error) => {
        alert("Failed to fetch explanation. Please try again.", error);
        setConversation([{ agent: "Failed to fetch explanation." }]);
      });
  };

  const handleSend = async () => {
    if (chatInput.trim()) {
      const updatedConversation = [...conversation, { human: chatInput.trim()}, { agent: { loading: true } }];
      setConversation(updatedConversation);
      setChatInput("");
      await chatWithAgent(updatedConversation);
    } 
  };

  const handleClear = () => {
    let user_confirmation = window.confirm("Are you sure you want to clear the chat?");
    if (!user_confirmation) return;
    setConversation([]);
    setChatInput("");
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box position="relative">
        {/* Top right theme switch */}
        <Box position="absolute" top={16} right={16} zIndex={1}>
          <Switch checked={themeMode === "dark"} onChange={toggleTheme} />
        </Box>
        <Box display="flex" height="100vh">
          {/* Conditionally render CodeInput vs DebugInput based on mode */}
          {mode === "Explanation" ? (
            <CodeInput
              onExplain={handleExplainCode}
              code={code}
              setCode={setCode}
              courses={courses}
              setCourses={setCourses}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              mode={mode}
              setMode={setMode}
              themeMode={themeMode}
            />
          ) : (
            <DebugInput
              onExplain={handleExplainCode}
              code={code}
              setCode={setCode}
              error={error}
              setError={setError}
              courses={courses}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              mode={mode}
              setMode={setMode}
              themeMode={themeMode}
            />
          )}

          {/* Right Side */}
          <Box flex={1} display="flex" alignItems="center" justifyContent="center" p={4}>
            <HelperChat
              chatEnabled={chatEnabled}
              conversation={conversation}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleSend={handleSend}
              handleClear={handleClear}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
