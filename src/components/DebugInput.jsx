import { useState } from "react";
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

export default function DebugInput({
  onExplain,
  code,
  setCode,
  error,
  setError,
  courses,
  selectedCourse,
  setSelectedCourse,
  selectedLanguage,
  setSelectedLanguage,
  mode,
  setMode,
  themeMode,
}) {
  const [settingLanguage, setSettingLanguage] = useState(false);

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
          title={<Typography variant="h6">Debug Input</Typography>}
          subheader="Paste your code and error"
        />
        <CardActions sx={{ display: "flex", gap: 2 }}>
          <FormControl margin="normal" fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={settingLanguage ? "Other" : selectedLanguage}
              label="Language"
              onChange={(e) => {
                if (e.target.value === "Other") {
                  setSettingLanguage(true);
                  setSelectedLanguage("");
                } else {
                  setSettingLanguage(false);
                  setSelectedLanguage(e.target.value);
                }
              }}
            >
              {["Python", "JavaScript", "Java", "C++", "R", "Other"].map(
                (language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          {settingLanguage && (
            <TextField
              placeholder="Specify your language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              onBlur={() => {
                if (!selectedLanguage.trim()) {
                  setSettingLanguage(false);
                  setSelectedLanguage("Other");
                }
              }}
            />
          )}
        </CardActions>
        <CardContent>
          <AceEditor
            mode={getAceMode(selectedLanguage)}
            theme={themeMode === "dark" ? "monokai" : "tomorrow"}
            name="debug_code_editor"
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
          <TextField
            fullWidth
            multiline
            rows={5}
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="Paste your error message here..."
            variant="outlined"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "error.main" },
                "&:hover fieldset": { borderColor: "error.main" },
                "&.Mui-focused fieldset": { borderColor: "error.main" },
              },
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
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
