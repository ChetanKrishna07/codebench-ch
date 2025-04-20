import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-r";

export default function CodeInput({
  onExplain,
  code,
  setCode,
  courses,
  setCourses,
  selectedCourse,
  setSelectedCourse,
  selectedLanguage,
  setSelectedLanguage,
  mode,
  setMode,
  themeMode,
}) {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    setCourses(["CS101", "CS210", "CS439"]);
    setLanguages(["Python", "JavaScript", "Java", "C++", "R", "Other"]);
  }, []);

  useEffect(() => {
    console.log("Theme: ", themeMode);
  }, [themeMode]);

  const getAceMode = (language) => {
    switch (language) {
      case "Python":
        return "python";
      case "JavaScript":
        return "javascript";
      case "Java":
        return "java";
      case "C++":
        return "c_cpp";
      case "R":
        return "r";
      default:
        return "text";
    }
  };

  return (
    <Box flex={1} p={4} borderRight={1} borderColor="grey.300">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Box
          width="50%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Course
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select a course</InputLabel>
            <Select
              value={selectedCourse}
              label="Select a course"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course} value={course}>
                  {course}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          width="50%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {mode} Mode
          </Typography>
          <ToggleButtonGroup
            margin="normal"
            value={mode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) {
                setMode(newMode);
              }
            }}
            aria-label="mode"
          >
            <ToggleButton value="Explanation" aria-label="explanation">
              <LightbulbIcon />
            </ToggleButton>
            <ToggleButton value="Debug" aria-label="debug">
              <BugReportIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={<Typography variant="h6">Code Input</Typography>}
          subheader="Paste your code here"
        />
        <CardActions sx={{ display: "flex", gap: 2 }}>
          <FormControl margin="normal" fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={selectedLanguage}
              label="Language"
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedLanguage === "Other" && (
            <TextField
              placeholder="Specify your language"
              value={selectedLanguage === "Other" ? "" : selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            />
          )}
        </CardActions>
        <CardContent>
          <AceEditor
            mode={getAceMode(selectedLanguage)}
            theme={themeMode === "dark" ? "monokai" : "tomorrow"}
            name="code_input_editor"
            onChange={setCode}
            fontSize={14}
            value={code}
            width="100%"
            height="300px"
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={onExplain}
      >
        Explain Code
      </Button>
    </Box>
  );
}
