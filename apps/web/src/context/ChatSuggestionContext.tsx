import * as React from "react";

export interface ChatSuggestion {
  title: string;
  url: string;
}

interface ChatSuggestionContextValue {
  suggestion: ChatSuggestion | null;
  setSuggestion: (suggestion: ChatSuggestion | null) => void;
}

const ChatSuggestionContext = React.createContext<ChatSuggestionContextValue>({
  suggestion: null,
  setSuggestion: () => {},
});

export const useChatSuggestion = () => React.useContext(ChatSuggestionContext);

export const ChatSuggestionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [suggestion, setSuggestion] = React.useState<ChatSuggestion | null>(
    null,
  );
  const value = React.useMemo(
    () => ({ suggestion, setSuggestion }),
    [suggestion],
  );

  return (
    <ChatSuggestionContext.Provider value={value}>
      {children}
    </ChatSuggestionContext.Provider>
  );
};

/**
 * Lets a page register a contextual chat suggestion (e.g. "ask about this
 * car") while mounted. The suggestion is cleared automatically on unmount.
 */
export function usePageChatSuggestion(suggestion: ChatSuggestion | null) {
  const { setSuggestion } = useChatSuggestion();

  React.useEffect(() => {
    setSuggestion(suggestion);
    return () => setSuggestion(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion?.title, suggestion?.url]);
}
