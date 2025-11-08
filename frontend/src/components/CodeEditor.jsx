import MonacoEditor from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

// Available Monaco Editor themes (VS Code themes and custom themes)
export const MONACO_THEMES = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'vs', label: 'VS Light' },
  { value: 'hc-black', label: 'High Contrast Dark' },
  { value: 'hc-light', label: 'High Contrast Light' },
  { value: 'one-dark-pro', label: 'One Dark Pro' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'material-dark', label: 'Material Dark' },
  { value: 'material-light', label: 'Material Light' },
  { value: 'nord', label: 'Nord' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'tokyo-night', label: 'Tokyo Night' },
  { value: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
];

// Define custom themes
const defineCustomThemes = (monaco) => {
  // One Dark Pro Theme
  monaco.editor.defineTheme('one-dark-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'function', foreground: '61afef' },
      { token: 'variable', foreground: 'e06c75' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editorLineNumber.foreground': '#5c6370',
      'editor.selectionBackground': '#3e4451',
      'editor.lineHighlightBackground': '#2c313c',
      'editorCursor.foreground': '#528bff',
    },
  });

  // Dracula Theme
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
      'editor.selectionBackground': '#44475a',
      'editor.lineHighlightBackground': '#313340',
      'editorCursor.foreground': '#f8f8f0',
    },
  });

  // GitHub Dark Theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'c9d1d9' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editorLineNumber.foreground': '#6e7681',
      'editor.selectionBackground': '#264f78',
      'editor.lineHighlightBackground': '#161b22',
      'editorCursor.foreground': '#58a6ff',
    },
  });

  // GitHub Light Theme
  monaco.editor.defineTheme('github-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'd73a49' },
      { token: 'string', foreground: '032f62' },
      { token: 'number', foreground: '005cc5' },
      { token: 'type', foreground: 'e36209' },
      { token: 'function', foreground: '6f42c1' },
      { token: 'variable', foreground: '24292e' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292e',
      'editorLineNumber.foreground': '#6a737d',
      'editor.selectionBackground': '#c8e1ff',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editorCursor.foreground': '#24292e',
    },
  });

  // Material Dark Theme
  monaco.editor.defineTheme('material-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c792ea' },
      { token: 'string', foreground: 'c3e88d' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'type', foreground: 'ffcb6b' },
      { token: 'function', foreground: '82aaff' },
      { token: 'variable', foreground: 'eeffff' },
    ],
    colors: {
      'editor.background': '#263238',
      'editor.foreground': '#eeffff',
      'editorLineNumber.foreground': '#546e7a',
      'editor.selectionBackground': '#3e4a52',
      'editor.lineHighlightBackground': '#2e3c43',
      'editorCursor.foreground': '#ffcc00',
    },
  });

  // Material Light Theme
  monaco.editor.defineTheme('material-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '90a4ae', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7c4dff' },
      { token: 'string', foreground: '388e3c' },
      { token: 'number', foreground: 'f57c00' },
      { token: 'type', foreground: 'e65100' },
      { token: 'function', foreground: '1976d2' },
      { token: 'variable', foreground: '212121' },
    ],
    colors: {
      'editor.background': '#fafafa',
      'editor.foreground': '#212121',
      'editorLineNumber.foreground': '#90a4ae',
      'editor.selectionBackground': '#e3f2fd',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editorCursor.foreground': '#1976d2',
    },
  });

  // Nord Theme
  monaco.editor.defineTheme('nord', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'type', foreground: '8fbcbb' },
      { token: 'function', foreground: '88c0d0' },
      { token: 'variable', foreground: 'd8dee9' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#d8dee9',
      'editorLineNumber.foreground': '#4c566a',
      'editor.selectionBackground': '#434c5e',
      'editor.lineHighlightBackground': '#3b4252',
      'editorCursor.foreground': '#d8dee9',
    },
  });

  // Monokai Theme
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
      'editor.selectionBackground': '#49483e',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorCursor.foreground': '#f8f8f0',
    },
  });

  // Solarized Dark Theme
  monaco.editor.defineTheme('solarized-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'type', foreground: 'b58900' },
      { token: 'function', foreground: '268bd2' },
      { token: 'variable', foreground: '839496' },
    ],
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'editorLineNumber.foreground': '#586e75',
      'editor.selectionBackground': '#073642',
      'editor.lineHighlightBackground': '#073642',
      'editorCursor.foreground': '#93a1a1',
    },
  });

  // Solarized Light Theme
  monaco.editor.defineTheme('solarized-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'type', foreground: 'b58900' },
      { token: 'function', foreground: '268bd2' },
      { token: 'variable', foreground: '657b83' },
    ],
    colors: {
      'editor.background': '#fdf6e3',
      'editor.foreground': '#657b83',
      'editorLineNumber.foreground': '#93a1a1',
      'editor.selectionBackground': '#eee8d5',
      'editor.lineHighlightBackground': '#fdf6e3',
      'editorCursor.foreground': '#657b83',
    },
  });

  // Tokyo Night Theme
  monaco.editor.defineTheme('tokyo-night', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'bb9af7' },
      { token: 'string', foreground: '9ece6a' },
      { token: 'number', foreground: 'ff9e64' },
      { token: 'type', foreground: '7dcfff' },
      { token: 'function', foreground: '7aa2f7' },
      { token: 'variable', foreground: 'c0caf5' },
    ],
    colors: {
      'editor.background': '#1a1b26',
      'editor.foreground': '#c0caf5',
      'editorLineNumber.foreground': '#565f89',
      'editor.selectionBackground': '#33467c',
      'editor.lineHighlightBackground': '#24283b',
      'editorCursor.foreground': '#c0caf5',
    },
  });

  // Catppuccin Mocha Theme
  monaco.editor.defineTheme('catppuccin-mocha', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cba6f7' },
      { token: 'string', foreground: 'a6e3a1' },
      { token: 'number', foreground: 'fab387' },
      { token: 'type', foreground: 'f9e2af' },
      { token: 'function', foreground: '89b4fa' },
      { token: 'variable', foreground: '#cdd6f4' },
    ],
    colors: {
      'editor.background': '#1e1e2e',
      'editor.foreground': '#cdd6f4',
      'editorLineNumber.foreground': '#6c7086',
      'editor.selectionBackground': '#45475a',
      'editor.lineHighlightBackground': '#313244',
      'editorCursor.foreground': '#f5e0dc',
    },
  });
};

// Supported languages mapping (10+ languages)
const SUPPORTED_LANGUAGES = {
  'python': { monaco: 'python', label: 'Python' },
  'Python': { monaco: 'python', label: 'Python' },
  'cpp': { monaco: 'cpp', label: 'C++' },
  'C++': { monaco: 'cpp', label: 'C++' },
  'java': { monaco: 'java', label: 'Java' },
  'Java': { monaco: 'java', label: 'Java' },
  'javascript': { monaco: 'javascript', label: 'JavaScript' },
  'JavaScript': { monaco: 'javascript', label: 'JavaScript' },
  'typescript': { monaco: 'typescript', label: 'TypeScript' },
  'TypeScript': { monaco: 'typescript', label: 'TypeScript' },
  'c': { monaco: 'c', label: 'C' },
  'C': { monaco: 'c', label: 'C' },
  'csharp': { monaco: 'csharp', label: 'C#' },
  'C#': { monaco: 'csharp', label: 'C#' },
  'go': { monaco: 'go', label: 'Go' },
  'Go': { monaco: 'go', label: 'Go' },
  'rust': { monaco: 'rust', label: 'Rust' },
  'Rust': { monaco: 'rust', label: 'Rust' },
  'kotlin': { monaco: 'kotlin', label: 'Kotlin' },
  'Kotlin': { monaco: 'kotlin', label: 'Kotlin' },
  'swift': { monaco: 'swift', label: 'Swift' },
  'Swift': { monaco: 'swift', label: 'Swift' },
  'php': { monaco: 'php', label: 'PHP' },
  'PHP': { monaco: 'php', label: 'PHP' },
  'ruby': { monaco: 'ruby', label: 'Ruby' },
  'Ruby': { monaco: 'ruby', label: 'Ruby' },
  'scala': { monaco: 'scala', label: 'Scala' },
  'Scala': { monaco: 'scala', label: 'Scala' },
};

function CodeEditor({ 
  language = 'python', 
  value = '', 
  onChange, 
  height = '100%',
  theme = 'vs-dark', // Default to vs-dark, no longer tied to app theme
  options = {},
  onMount
}) {
  const editorRef = useRef(null);
  const editorTheme = theme;

  // Get Monaco language code
  const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['python'];
  const monacoLanguage = langConfig.monaco;

  // Enhanced editor options with suggestions and autocomplete
  const editorOptions = {
    fontSize: 18,
    fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
    fontLigatures: true,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 26,
    // Minimap and scroll
    minimap: { 
      enabled: true,
      side: 'right',
      showSlider: 'always',
      renderCharacters: true,
      maxColumn: 120
    },
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 5,
    automaticLayout: true,
    // Word wrap and line numbers
    wordWrap: 'on',
    wordWrapColumn: 80,
    lineNumbers: 'on',
    lineNumbersMinChars: 3,
    // Cursor and selection
    roundedSelection: false,
    cursorStyle: 'line',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    cursorWidth: 2,
    smoothScrolling: true,
    // Autocomplete and suggestions
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    quickSuggestionsDelay: 100,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    acceptSuggestionOnCommitCharacter: true,
    tabCompletion: 'on',
    wordBasedSuggestions: 'matchingDocuments',
    wordBasedSuggestionsMode: 'matchingDocuments',
    // Code intelligence
    formatOnPaste: true,
    formatOnType: true,
    formatOnSave: false,
    autoIndent: 'full',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoSurround: 'languageDefined',
    bracketPairColorization: {
      enabled: true
    },
    guides: {
      bracketPairs: true,
      bracketPairsHorizontal: true,
      highlightActiveIndentation: false,
      indentation: false
    },
    // Additional features
    renderWhitespace: 'none', // Don't show whitespace to reduce clutter
    renderLineHighlight: 'all',
    renderIndentGuides: false,
    selectionHighlight: true,
    occurrencesHighlight: true,
    links: true,
    colorDecorators: true,
    // Remove trailing whitespace automatically
    trimAutoWhitespace: true,
    // Folding
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    unfoldOnClickAfterEndOfLine: true,
    foldingHighlight: true,
    // Code lens and hover
    codeLens: false,
    hover: {
      enabled: true,
      delay: 300
    },
    // Parameter hints
    parameterHints: {
      enabled: true,
      cycle: true
    },
    // Accessibility
    accessibilitySupport: 'auto',
    // Multi-cursor
    multiCursorModifier: 'ctrlCmd',
    // Custom options override
    ...options,
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define all custom themes first
    defineCustomThemes(monaco);

    // Set initial theme after a small delay to ensure themes are registered
    setTimeout(() => {
      try {
        console.log('Setting initial Monaco theme:', editorTheme);
        monaco.editor.setTheme(editorTheme);
        console.log('Initial theme set successfully');
      } catch (error) {
        console.error('Error setting initial Monaco theme:', error);
        // Fallback to vs-dark if theme doesn't exist
        try {
          monaco.editor.setTheme('vs-dark');
          console.log('Fell back to vs-dark theme');
        } catch (fallbackError) {
          console.error('Error setting fallback theme:', fallbackError);
        }
      }
    }, 100); // Increased delay slightly to ensure themes are fully registered

    // Configure language-specific settings
    configureLanguageFeatures(monaco, monacoLanguage);

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Prevent default save, could trigger custom save
      console.log('Save triggered');
    });

    // Focus the editor
    editor.focus();

    // Call custom onMount if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  // Configure language-specific features
  const configureLanguageFeatures = (monaco, lang) => {
    // Enable additional language features
    if (lang === 'python') {
      // Python-specific configurations
      monaco.languages.setLanguageConfiguration('python', {
        comments: {
          lineComment: '#',
          blockComment: ['"""', '"""']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      });
    }

    // Configure for other languages similarly
    if (lang === 'javascript' || lang === 'typescript') {
      monaco.languages.setLanguageConfiguration(lang, {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' }
        ]
      });
    }
  };

  // Store monaco instance
  const monacoRef = useRef(null);

  // Update editor when language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['python'];
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, langConfig.monaco);
      }
    }
  }, [language]);

  // Update editor when theme changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      try {
        console.log('Applying Monaco theme:', editorTheme);
        monacoRef.current.editor.setTheme(editorTheme);
        console.log('Theme applied successfully');
      } catch (error) {
        console.error('Error setting Monaco theme:', error);
        // Try to fallback to vs-dark
        try {
          monacoRef.current.editor.setTheme('vs-dark');
        } catch (fallbackError) {
          console.error('Error setting fallback theme:', fallbackError);
        }
      }
    }
  }, [editorTheme]);

  return (
    <div className="w-full h-full relative" style={{ height: height === '100%' ? '100%' : height }}>
    <MonacoEditor
      height={height}
        language={monacoLanguage}
        theme={editorTheme}
      value={value || ''}
        onChange={(val) => {
          // Just pass through the value - cleaning is done when code is loaded
          onChange?.(val || '');
        }}
        options={editorOptions}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-black/40 text-white/60">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
              <div className="text-sm">Loading Editor...</div>
            </div>
          </div>
        }
      />
    </div>
  );
}

// Export language mapping for use in other components
export { SUPPORTED_LANGUAGES };
export default CodeEditor;
