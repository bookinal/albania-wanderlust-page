import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getChatThemeTokens } from "./chatTheme";

export interface MessageInputPrefill {
  text: string;
  token: number;
}

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  prefill?: MessageInputPrefill | null;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  prefill,
}) => {
  const [message, setMessage] = useState("");
  const { isDark, isBlue } = useTheme();
  const tk = getChatThemeTokens({ isDark, isBlue });

  useEffect(() => {
    if (prefill) {
      setMessage(prefill.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = !disabled && message.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4"
      style={{ background: tk.inputAreaBg, borderTop: `1px solid ${tk.inputAreaBorder}` }}
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="resize-none min-h-[60px] max-h-[120px]"
        rows={2}
        style={{
          background: tk.textareaBg,
          borderColor: tk.textareaBorder,
          color: tk.textareaText,
        }}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!canSend}
        className="self-end"
        style={{
          background: canSend ? tk.sendBtnBg : tk.sendBtnDisabledBg,
          color: canSend ? tk.sendBtnText : tk.sendBtnDisabledText,
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
