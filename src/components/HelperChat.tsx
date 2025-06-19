import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Box,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddCommentIcon from '@mui/icons-material/AddComment';

interface HelperChatProps {
  chatEnabled: boolean;
  conversation: Array<{
    human?: string;
    agent?: string | { loading: boolean };
  }>;
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSend: () => void;
  handleClear: () => void;
}

export default function HelperChat({
  chatEnabled,
  conversation,
  chatInput,
  setChatInput,
  handleSend,
  handleClear,
}: HelperChatProps) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader title="Code Helper"/>

      <CardContent
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {conversation.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            No conversation yet.
          </Typography>
        ) : (
          conversation.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.human ? "flex-end" : "flex-start",
              }}
            >
              {msg.agent ? (
                typeof msg.agent === "object" && "loading" in msg.agent && msg.agent.loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      Loading...
                    </Typography>
                  </Box>
                ) : (
                  // Agent messages rendered in plain text
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {typeof msg.agent === "string" ? msg.agent : ""}
                  </Typography>
                )
              ) : (
                // User messages rendered in a styled bubble
                <Box
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    borderRadius: 2,
                    p: 1,
                    maxWidth: "80%",
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.human}
                  </Typography>
                </Box>
              )}
            </Box>
          ))
        )}
      </CardContent>
      <CardActions sx={{ gap: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={!chatEnabled}
          />
          <IconButton
            onClick={handleSend}
            disabled={!chatEnabled}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
        <IconButton
          onClick={handleClear}
          disabled={!chatEnabled}
          color="secondary"
        >
          <AddCommentIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
