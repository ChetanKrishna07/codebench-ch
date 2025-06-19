import { useEffect, useState } from "react";
import {
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Switch,
} from "@mui/material";
import HelperChat from "./components/HelperChat";
import CodeInput from "./components/CodeInput";
import DebugInput from "./components/DebugInput";
import axios from "axios";
import type { PaletteMode, Theme } from "@mui/material";

function App() {
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [mode, setMode] = useState<string>("Explanation");
  const [courses, setCourses] = useState<string[]>([]);
  const [themeMode, setThemeMode] = useState<PaletteMode>("dark"); // new state
  const root_url =
    "https://codebench-ch-api.nicedune-0680dc11.eastus2.azurecontainerapps.io";
  useEffect(() => {
    setConversation([]); // Reset conversation when mode changes
    setChatInput(""); // Reset chat input when mode changes
    setChatEnabled(false); // Reset chat enabled state when mode changes
  }, [selectedCourse, mode]);

  const toggleTheme = () =>
    setThemeMode((prev) => (prev === "light" ? "dark" : "light")); // toggle function

  const theme: Theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  // Type definitions for conversation messages

  interface HumanMessage {
    human: string;
  }

  interface AgentMessage {
    agent: string | { loading: boolean };
  }

  type ConversationMessage = HumanMessage | AgentMessage;

  interface ChatPayload {
    messages: ConversationMessage[];
    language: string;
    mode: string;
    course_id: string;
  }

  // Function to process code and add line numbers
  const process_code = (code: string): string => {
    let code_lines = code.split("\n");
    let code_with_line_numbers = code_lines
      .map((line, index) => `${index + 1}: ${line}`)
      .join("\n");
    console.log("Processed code with line numbers:\n", code_with_line_numbers);
    return code_with_line_numbers;
  };

  // Function to fetch code explanation or debugging information
  const fetchCodeExplanation = async (code: string) => {
    console.log(`You are in ${mode} mode.`);
    console.log(`Calling API to fetch explanation for code:\n${code}`);

    // Process code to add line numbers
    let code_with_line_numbers = process_code(code);

    let data: string | null = null;
    let url: string | undefined = undefined;
    if (mode === "Explanation") {
      console.log("Fetching explanation...");
      data = JSON.stringify({
        code: code_with_line_numbers,
        language: selectedLanguage,
        course_id: selectedCourse,
      });
      url = `${root_url}/explain`;
    } else if (mode === "Debug") {
      console.log("Fetching debugging information...");
      data = JSON.stringify({
        code: code,
        error: error,
        language: selectedLanguage,
        course_id: selectedCourse,
      });
      url = `${root_url}/debug`;
    }

    if (!data || !url) {
      console.error("No data or url to send for explanation.");
      return Promise.reject("No data or url to send for explanation.");
    }
    console.log("Url sending to:", url);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "application/json",
      },
      url: url,
      data: data,
    };

    return axios
      .request(config)
      .then((response) => {
        console.log("Explanation received:", response.data);
        return response.data.response;
      })
      .catch((error) => {
        console.error("Error fetching explanation:", error);
        throw error;
      });
  };

  // Function to handle chat with the agent
  const chatWithAgent = async (
    updatedConversation: ConversationMessage[]
  ): Promise<void> => {
    // Use the updated conversation for payload.
    const currentMessages: ConversationMessage[] = updatedConversation.filter(
      (msg) =>
        !(msg as AgentMessage).agent ||
        !((msg as AgentMessage).agent as any).loading
    );

    let processed_code: string = process_code(code);

    currentMessages.unshift({
      human: processed_code,
    });

    console.log("Current messages for chat:", currentMessages);

    const payload: ChatPayload = {
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
      setConversation((prev: ConversationMessage[]) => {
        const newConv = [...prev];
        const loadingIndex = newConv.findIndex(
          (msg) =>
            (msg as AgentMessage).agent &&
            ((msg as AgentMessage).agent as any).loading
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
      setConversation((prev: ConversationMessage[]) => {
        const newConv = [...prev];
        const loadingIndex = newConv.findIndex(
          (msg) =>
            (msg as AgentMessage).agent &&
            ((msg as AgentMessage).agent as any).loading
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

  // Function triggered when the user clicks the "Explain Code" button
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
        alert("Failed to fetch explanation. Please try again." + (error ? ` Error: ${error}` : ""));
        setConversation([{ agent: "Failed to fetch explanation." }]);
      });
  };

  // Function to handle sending chat messages
  const handleSend = async () => {
    if (chatInput.trim()) {
      const updatedConversation = [
        ...conversation,
        { human: chatInput.trim() },
        { agent: { loading: true } },
      ];
      setConversation(updatedConversation);
      setChatInput("");
      await chatWithAgent(updatedConversation);
    }
  };


  // Function to clear the chat and start fresh
  const handleClear = () => {
    let user_confirmation = window.confirm(
      "Are you sure you want to clear the chat?"
    );
    if (!user_confirmation) return;
    setConversation([]);
    setChatInput("");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box position="relative">
        {/* Top right theme switch */}
        <Box position="absolute" top={16} right={16} zIndex={1}>
          <Switch checked={themeMode === "dark"} onChange={toggleTheme} />
        </Box>
        <Box
          display="flex"
          height="100vh"
          flexDirection={{ xs: "column", lg: "row" }}
        >
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
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
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
