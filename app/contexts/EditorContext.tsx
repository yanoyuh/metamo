import React, { createContext, useContext, useState, ReactNode } from 'react'

interface EditorState {
  currentImage: string | null
  chatHistory: ChatMessage[]
  selectedRegion: Region | null
  clickPosition: { x: number; y: number } | null
}

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface Region {
  x: number
  y: number
  width: number
  height: number
}

interface EditorContextType {
  state: EditorState
  setCurrentImage: (image: string | null) => void
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setSelectedRegion: (region: Region | null) => void
  setClickPosition: (position: { x: number; y: number } | null) => void
  clearHistory: () => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState>({
    currentImage: null,
    chatHistory: [],
    selectedRegion: null,
    clickPosition: null,
  })

  const setCurrentImage = (image: string | null) => {
    setState((prev) => ({ ...prev, currentImage: image }))
  }

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
    }))
  }

  const setSelectedRegion = (region: Region | null) => {
    setState((prev) => ({ ...prev, selectedRegion: region }))
  }

  const setClickPosition = (position: { x: number; y: number } | null) => {
    setState((prev) => ({ ...prev, clickPosition: position }))
  }

  const clearHistory = () => {
    setState((prev) => ({ ...prev, chatHistory: [] }))
  }

  return (
    <EditorContext.Provider
      value={{
        state,
        setCurrentImage,
        addChatMessage,
        setSelectedRegion,
        setClickPosition,
        clearHistory,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
