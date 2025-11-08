import { CheckCircle, Copy, Crown, Download, Eye, Lock, Play, Plus, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import AIChatbot from "../components/AIChatbot.jsx";
import CodeEditor, { MONACO_THEMES, SUPPORTED_LANGUAGES } from "../components/CodeEditor";
import PaymentModal from "../components/PaymentModal.jsx";
import { useLayoutSettings } from "../context/LayoutSettingsContext.jsx";
import { useSubscription } from "../hooks/useSubscription.js";

function ProblemPage() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [editorTheme, setEditorTheme] = useState(() => {
    // Load editor theme from localStorage or default to vs-dark
    const storedTheme = localStorage.getItem('monacoEditorTheme');
    // Validate that the stored theme exists in MONACO_THEMES
    const isValidTheme = MONACO_THEMES.some(theme => theme.value === storedTheme);
    return isValidTheme ? storedTheme : 'vs-dark';
  });
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [activeTab, setActiveTab] = useState("description"); // description | submissions | editorial | solutions
  const [recentSubs, setRecentSubs] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [testCaseTab, setTestCaseTab] = useState(0);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [loadingRun, setLoadingRun] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState([]); // Store results for all test cases
  const [customTestCases, setCustomTestCases] = useState([]); // Store user-added custom test cases
  const [isCustomTestCase, setIsCustomTestCase] = useState(false); // Track if current tab is custom
  
  // Layout customization state
  const [layoutConfig, setLayoutConfig] = useState(() => {
    const saved = localStorage.getItem('problemPageLayout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // If parsing fails, use defaults
      }
    }
    return {
      showDescription: true,
      showEditor: true,
      showTestCases: true,
      descriptionWidth: 45, // percentage
      editorHeight: 65, // percentage
    };
  });
  
  const { showLayoutSettings, setShowLayoutSettings } = useLayoutSettings();
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const editorContainerRef = useRef(null);
  const editorElementRef = useRef(null);

  // Use SUPPORTED_LANGUAGES from CodeEditor
  const languageMap = SUPPORTED_LANGUAGES;

  // Normalize language to ensure it exists in languageMap
  const normalizeLanguage = (lang) => {
    if (!lang) return "python";
    const normalized = lang.toLowerCase();
    const found = Object.keys(languageMap).find(
      key => key.toLowerCase() === normalized
    );
    return found || "python";
  };

  // Clean code: remove trailing whitespace and extra empty lines
  const cleanCode = (code) => {
    if (!code) return '';
    return code
      .split('\n')
      .map(line => line.trimEnd()) // Remove trailing spaces from each line
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with 2
      .trimEnd(); // Remove trailing newlines
  };

  // Handle editor theme change
  const handleThemeChange = (newTheme) => {
    console.log('Theme changing to:', newTheme);
    // Validate theme exists
    const isValidTheme = MONACO_THEMES.some(theme => theme.value === newTheme);
    if (!isValidTheme) {
      console.warn('Invalid theme selected:', newTheme, 'Falling back to vs-dark');
      newTheme = 'vs-dark';
    }
    setEditorTheme(newTheme);
    localStorage.setItem('monacoEditorTheme', newTheme);
    console.log('Theme changed to:', newTheme);
  };

  /** Fetch Problem */
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosClient.get(`/problems/problemById/${id}`);
        console.log('=== RAW API RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response data keys:', Object.keys(response.data || {}));
        
        const { data } = response;
        const p = data?.problem;
        
        console.log('=== PROBLEM FETCHED FROM API ===');
        console.log('Data object:', data);
        console.log('Problem object:', p);
        console.log('Problem is defined:', !!p);
        console.log('Full problem object:', JSON.stringify(p, null, 2));
        console.log('Problem keys:', Object.keys(p || {}));
        console.log('Has referenceSolutions property:', 'referenceSolutions' in (p || {}));
        console.log('referenceSolutions value:', p?.referenceSolutions);
        console.log('referenceSolutions type:', typeof p?.referenceSolutions);
        console.log('referenceSolutions is array:', Array.isArray(p?.referenceSolutions));
        console.log('referenceSolutions length:', p?.referenceSolutions?.length);
        
        if (!p) {
          console.error('ERROR: Problem object is undefined!');
          console.error('Response data:', data);
          return;
        }
        
        setProblem(p);
        
        // Always load reference solutions if they exist, regardless of active tab
        // Ensure referenceSolutions is an array (backend should always return an array now)
        const refSolutionsArray = Array.isArray(p.referenceSolutions) ? p.referenceSolutions : (p.referenceSolutions ? [p.referenceSolutions] : []);
        console.log('Reference solutions array after normalization:', refSolutionsArray);
        console.log('Reference solutions array length:', refSolutionsArray.length);
        
        if (refSolutionsArray.length > 0) {
          console.log('✓ Loading reference solutions:', refSolutionsArray.length);
          console.log('Reference solutions raw data:', JSON.stringify(refSolutionsArray, null, 2));
          
          const refSolutions = refSolutionsArray
            .filter(ref => {
              const isValid = ref && ref.completeCode && ref.language;
              if (!isValid) {
                console.warn('Invalid reference solution filtered out:', ref);
              }
              return isValid;
            })
            .map((ref, idx) => {
              const solution = {
                _id: ref._id || `ref-${idx}`,
                language: ref.language,
                code: ref.completeCode,
                status: 'Accepted',
                isReference: true,
              };
              console.log(`Processed solution ${idx}:`, { language: solution.language, codeLength: solution.code?.length });
              return solution;
            });
          
          console.log('Processed reference solutions on load:', refSolutions);
          console.log('Processed solutions count:', refSolutions.length);
          
          if (refSolutions.length > 0) {
            setSolutions(refSolutions);
            console.log('✓ Reference solutions set in state:', refSolutions.length);
          } else {
            console.warn('✗ No valid reference solutions found after filtering on initial load');
            setSolutions([]); // Ensure solutions is set to empty array
          }
        } else {
          console.log('✗ No reference solutions found in problem (empty array or undefined)');
          setSolutions([]); // Ensure solutions is set to empty array
        }
        console.log('=== END PROBLEM FETCH ===');

        // Load starter code based on selected language
        if (p.starterCode && Array.isArray(p.starterCode) && p.starterCode.length > 0) {
          // Try to load user's last successful submission first
          try {
            const subData = await axiosClient.get(`/solve/submissions/problem/${id}?user=me&limit=1&status=accepted`);
            if (subData.data.submissions && subData.data.submissions.length > 0) {
              const lastSubmission = subData.data.submissions[0];
            if (lastSubmission.code) {
              setCode(cleanCode(lastSubmission.code));
              const lang = lastSubmission.language || "python";
              const mappedLang = normalizeLanguage(lang);
              setLanguage(mappedLang);
              return; // Use last successful submission
            }
            }
          } catch (e) {
            console.log("No previous submission found, using starter code");
          }

          // Use first available starter code if no previous submission
          const starter = p.starterCode[0];
          if (starter && starter.initialCode) {
            setCode(cleanCode(starter.initialCode));
            // Update language to match the starter code language
            const mappedLang = normalizeLanguage(starter.language);
            setLanguage(mappedLang);
          }
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };
    fetchProblem();
  }, [id]);

  // Update code when language changes
  useEffect(() => {
    if (!problem || !problem.starterCode) return;
    // Normalize language key (handle case sensitivity)
    const normalizedLang = language.toLowerCase();
    const langKey = Object.keys(languageMap).find(
      key => key.toLowerCase() === normalizedLang
    ) || language;
    const langConfig = languageMap[langKey];
    if (!langConfig) {
      // If language not found, default to python
      const defaultLang = Object.keys(languageMap).find(key => key.toLowerCase() === 'python') || 'python';
      setLanguage(defaultLang);
      return;
    }
    
    // Try to find starter code for this language
    const starter = problem.starterCode.find(sc => {
      const scLang = sc.language?.toLowerCase();
      const targetLang = langConfig.monaco.toLowerCase();
      return scLang === targetLang || 
             scLang === language.toLowerCase() ||
             Object.keys(languageMap).some(key => 
               key.toLowerCase() === scLang && languageMap[key].monaco === targetLang
             );
    });
    
    if (starter && starter.initialCode) {
      setCode(cleanCode(starter.initialCode));
    } else {
      // If no starter code, set empty with comment
      const comment = langConfig.monaco === 'python' ? '#' : 
                     langConfig.monaco === 'javascript' || langConfig.monaco === 'typescript' ? '//' :
                     langConfig.monaco === 'java' || langConfig.monaco === 'cpp' ? '//' : '//';
      setCode(`${comment} Write your solution here`);
    }
  }, [language, problem]);

  useEffect(() => {
    const fetchSubs = async () => {
      if (!id) return;
      try {
        const { data } = await axiosClient.get(`/solve/submissions/problem/${id}?user=me&limit=20`);
        setRecentSubs(Array.isArray(data.submissions) ? data.submissions : []); 
      } catch (e) {
        console.error(e);
      }
    };
    if (activeTab === "submissions") fetchSubs();
  }, [id, activeTab]);

  // Fetch solutions when solutions tab is active
  useEffect(() => {
    const fetchSolutions = async () => {
      if (!id) return;
      
      if (!problem) return; // Wait for problem to load
      
      // Only fetch/update solutions when solutions tab is active
      if (activeTab !== "solutions") {
        return;
      }
      
      try {
        // First, try to get reference solutions from the problem
        // Ensure referenceSolutions is an array
        const refSolutionsArray = Array.isArray(problem.referenceSolutions) ? problem.referenceSolutions : [];
        
        if (refSolutionsArray.length > 0) {
          console.log('Loading reference solutions in solutions tab:', refSolutionsArray.length);
          console.log('Reference solutions data:', refSolutionsArray);
          // Convert reference solutions to the format expected by the UI
          const refSolutions = refSolutionsArray
            .filter(ref => ref && ref.completeCode && ref.language) // Filter out invalid entries
            .map((ref, idx) => ({
              _id: ref._id || `ref-${idx}`,
              language: ref.language,
              code: ref.completeCode,
              status: 'Accepted',
              isReference: true,
            }));
          
          console.log('Processed reference solutions:', refSolutions);
          if (refSolutions.length > 0) {
            setSolutions(refSolutions);
            console.log('Reference solutions set in solutions tab:', refSolutions.length);
          } else {
            console.warn('No valid reference solutions found after filtering');
            setSolutions([]);
          }
          return;
        }

        // If no reference solutions, try to fetch accepted solutions from other users
        try {
          const { data } = await axiosClient.get(`/solve/submissions/problem/${id}?status=accepted&limit=10`);
          setSolutions(Array.isArray(data.submissions) ? data.submissions : []);
        } catch (e) {
          console.error("Error fetching user solutions:", e);
          setSolutions([]);
        }
      } catch (e) {
        console.error("Error fetching solutions:", e);
        setSolutions([]);
      }
    };
    fetchSolutions();
  }, [id, activeTab, problem]);

  // Load code from a submission
  const loadSubmissionCode = async (submissionId) => {
    setLoadingSubmission(true);
    try {
      const { data } = await axiosClient.get(`/solve/submissions/${submissionId}`);
      if (data.submission && data.submission.code) {
        setCode(cleanCode(data.submission.code));
        const lang = data.submission.language || "python";
        const mappedLang = normalizeLanguage(lang);
        setLanguage(mappedLang);
        setActiveTab("description"); // Switch to description tab to see the code
      }
    } catch (e) {
      console.error("Error loading submission:", e);
    } finally {
      setLoadingSubmission(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Code copied to clipboard!");
    });
  };

  /** Run Code (visible testcases) */
  const runCode = async () => {
    if (!problem || !problem._id) {
      console.error("Problem not loaded");
      setVerdict("Error: Problem not loaded ❌");
      return;
    }

    if (!code || !code.trim()) {
      console.error("Code is empty");
      setVerdict("Error: Please write some code first ❌");
      return;
    }

    if (!language) {
      console.error("Language not selected");
      setVerdict("Error: Please select a language ❌");
      return;
    }

    setLoadingRun(true);
    setVerdict("");
    setOutput("");
    setExpectedOutput("");
    setTestCaseResults([]);

    try {
      console.log("Running code:", { problemId: problem._id, language, codeLength: code.length });
      const { data } = await axiosClient.post(`/solve/run/${problem._id}`, {
        language,
        code: code.trim(),
      });

      console.log("Run response:", data);

      // For run route, backend returns finalsubmissionResults with all test case results
      const allResults = data.finalsubmissionResults?.submissions || [];
      
      if (allResults && allResults.length > 0) {
        // Process all test case results
        const processedResults = allResults.map((res, index) => {
        const output = (res.stdout?.trim() || res.output?.trim() || "").replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const expected = (res.expected_output?.trim() || "").replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const statusId = res.status_id || res.status?.id;
        const statusDesc = res.status?.description || res.status || "Unknown";
        
          // Determine verdict
          let verdict = "";
        if (output === expected && output !== "") {
            verdict = "Accepted ✅";
        } else if (statusId === 3) {
            verdict = "Accepted ✅";
        } else if (statusId === 4) {
            verdict = "Wrong Answer ❌";
        } else if (statusId === 5) {
            verdict = "Time Limit Exceeded ⏱️";
        } else if (statusId === 6) {
            verdict = "Compilation Error ❌";
        } else if (statusId === 7) {
            verdict = "Runtime Error ❌";
        } else if (statusId === 8) {
            verdict = "Memory Limit Exceeded 💾";
        } else if (statusDesc.toLowerCase().includes("accepted") || statusDesc.toLowerCase().includes("success")) {
            verdict = "Accepted ✅";
        } else {
            verdict = `${statusDesc} ❌`;
          }
          
          return {
            output,
            expected,
            verdict,
            statusId,
            statusDesc,
            index
          };
        });
        
        setTestCaseResults(processedResults);
        
        // Show first test case result by default
        if (processedResults.length > 0) {
          const firstResult = processedResults[0];
          setOutput(firstResult.output);
          setExpectedOutput(firstResult.expected);
          setVerdict(firstResult.verdict);
          setTestCaseTab(0);
        }
      } else {
        setVerdict("Run completed but no result returned ⚠️");
        setOutput(data.message || "No output");
        setExpectedOutput("");
        setTestCaseResults([]);
      }
    } catch (err) {
      console.error("Error running code:", err);
      const errorMessage = err.response?.data?.message || err.message || "Execution failed";
      setVerdict("Runtime Error ❌");
      setOutput(errorMessage);
      setExpectedOutput("");
      setTestCaseResults([]);
    } finally {
      setLoadingRun(false);
    }
  };

  /** Submit Code (Evaluates hidden testcases + Saves result) */
  const submitCode = async () => {
    if (!problem || !problem._id) {
      setVerdict("Error: Problem not loaded ❌");
      return;
    }

    if (!code || !code.trim()) {
      setVerdict("Error: Please write some code first ❌");
      return;
    }

    if (!language) {
      setVerdict("Error: Please select a language ❌");
      return;
    }

    setLoadingSubmission(true);
    setVerdict("");
    setOutput("");
    setExpectedOutput("");
    setTestCaseResults([]);

    try {
      const { data } = await axiosClient.post(`/solve/submit/${problem._id}`, {
        language,
        code: code.trim(),
      });
      console.log("Submission response data:", data);

      const allResults = data.finalsubmissionResults?.submissions || [];
      if (!allResults || allResults.length === 0) {
        setVerdict("No evaluation result returned ❌");
        return;
      }

      // Process all test case results
      const processedResults = allResults.map((result, index) => {
      const output = (result.stdout?.trim() || result.output?.trim() || "").replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const expected = (result.expected_output?.trim() || "").replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const statusId = result.status_id || result.status?.id;
      const statusDesc = result.status?.description || result.status || "Unknown";
      
        // Determine verdict
        let verdict = "";
      if (statusId === 3) {
          verdict = "Accepted ✅";
      } else if (statusId === 4) {
          verdict = "Wrong Answer ❌";
      } else if (statusId === 5) {
          verdict = "Time Limit Exceeded ⏱️";
      } else if (statusId === 6) {
          verdict = "Compilation Error ❌";
      } else if (statusId === 7) {
          verdict = "Runtime Error ❌";
      } else if (statusId === 8) {
          verdict = "Memory Limit Exceeded 💾";
      } else if (statusDesc.toLowerCase().includes("accepted") || statusDesc.toLowerCase().includes("success")) {
          verdict = "Accepted ✅";
      } else {
          verdict = statusDesc || "Unknown Result";
        }
        
        return {
          output,
          expected,
          verdict,
          statusId,
          statusDesc,
          index
        };
      });
      
      setTestCaseResults(processedResults);
      
      // Show first test case result by default
      if (processedResults.length > 0) {
        const firstResult = processedResults[0];
        setOutput(firstResult.output);
        setExpectedOutput(firstResult.expected);
        setVerdict(firstResult.verdict);
        setTestCaseTab(0);
      }
    } catch (err) {
      console.error("Error submitting code:", err);
      const errorMessage = err.response?.data?.message || err.message || "Submission failed";
      setVerdict("Submission Error ❌");
      setOutput(errorMessage);
      setTestCaseResults([]);
    } finally {
      setLoadingSubmission(false);
    }
  };

  // Save layout config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('problemPageLayout', JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  // Define functions with useCallback to avoid dependency issues
  const updateDescriptionWidth = useCallback((width) => {
    const clampedWidth = Math.max(30, Math.min(70, width));
    setLayoutConfig(prev => ({
      ...prev,
      descriptionWidth: clampedWidth
    }));
  }, []);

  const updateEditorHeight = useCallback((height) => {
    const clampedHeight = Math.max(40, Math.min(80, height));
    setLayoutConfig(prev => ({
      ...prev,
      editorHeight: clampedHeight
    }));
  }, []);

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      const handleMove = (e) => {
        const containerWidth = window.innerWidth;
        const newWidth = (e.clientX / containerWidth) * 100;
        updateDescriptionWidth(newWidth);
      };
      const handleUp = () => {
        setIsResizing(false);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isResizing, updateDescriptionWidth]);

  useEffect(() => {
    if (isResizingEditor) {
      const handleMove = (e) => {
        if (!layoutConfig.showEditor || !editorContainerRef.current || !editorElementRef.current) return;
        const containerHeight = editorContainerRef.current.offsetHeight;
        const editorTop = editorElementRef.current.offsetTop;
        const relativeY = e.clientY - editorContainerRef.current.getBoundingClientRect().top;
        const newHeight = ((relativeY - editorTop) / containerHeight) * 100;
        updateEditorHeight(Math.max(40, Math.min(80, newHeight)));
      };
      const handleUp = () => {
        setIsResizingEditor(false);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isResizingEditor, layoutConfig.showEditor, updateEditorHeight]);

  if (!problem)
    return <div className="text-center py-20 text-white/60">Loading...</div>;

  const toggleSection = (section) => {
    setLayoutConfig(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle mouse drag for resizing description panel
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle mouse drag for resizing editor height
  const handleEditorMouseDown = (e) => {
    e.preventDefault();
    setIsResizingEditor(true);
  };

  // Layout presets
  const applyLayoutPreset = (preset) => {
    switch(preset) {
      case 'balanced':
        setLayoutConfig({
          showDescription: true,
          showEditor: true,
          showTestCases: true,
          descriptionWidth: 45,
          editorHeight: 65,
        });
        break;
      case 'code-focused':
        setLayoutConfig({
          showDescription: true,
          showEditor: true,
          showTestCases: true,
          descriptionWidth: 35,
          editorHeight: 75,
        });
        break;
      case 'problem-focused':
        setLayoutConfig({
          showDescription: true,
          showEditor: true,
          showTestCases: true,
          descriptionWidth: 60,
          editorHeight: 60,
        });
        break;
      case 'full-editor':
        setLayoutConfig({
          showDescription: false,
          showEditor: true,
          showTestCases: true,
          descriptionWidth: 45,
          editorHeight: 70,
        });
        break;
      case 'full-problem':
        setLayoutConfig({
          showDescription: true,
          showEditor: false,
          showTestCases: false,
          descriptionWidth: 100,
          editorHeight: 65,
        });
        break;
    }
  };

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden relative">
      {/* Layout Settings Panel - Right Corner */}
      {showLayoutSettings && (
          <div 
            className="fixed top-4 right-4 z-[101] bg-black border border-white/20 rounded-lg p-4 shadow-2xl w-[90%] max-w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-base">Layout Settings</h3>
            <button
              onClick={() => setShowLayoutSettings(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Show Sections */}
            <div>
              <label className="text-sm text-white/70 font-medium block mb-3">Show Sections:</label>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layoutConfig.showDescription}
                    onChange={() => toggleSection('showDescription')}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-600 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-white/80">Problem Description</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layoutConfig.showEditor}
                    onChange={() => toggleSection('showEditor')}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-600 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-white/80">Code Editor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layoutConfig.showTestCases}
                    onChange={() => toggleSection('showTestCases')}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-600 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-white/80">Test Cases</span>
                </label>
              </div>
            </div>

            {/* Description Width */}
            {layoutConfig.showDescription && layoutConfig.showEditor && (
              <div className="pt-2 border-t border-white/10">
                <label className="text-sm text-white/70 font-medium block mb-2">
                  Description Width: {layoutConfig.descriptionWidth}%
                </label>
                <div className="relative w-full">
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={layoutConfig.descriptionWidth}
                    onChange={(e) => updateDescriptionWidth(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider-purple"
                    style={{
                      background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${layoutConfig.descriptionWidth}%, rgb(75, 85, 99) ${layoutConfig.descriptionWidth}%, rgb(75, 85, 99) 100%)`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Editor Height */}
            {layoutConfig.showEditor && layoutConfig.showTestCases && (
              <div className="pt-2 border-t border-white/10">
                <label className="text-sm text-white/70 font-medium block mb-2">
                  Editor Height: {layoutConfig.editorHeight}%
                </label>
                <div className="relative w-full">
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={layoutConfig.editorHeight}
                    onChange={(e) => updateEditorHeight(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider-purple"
                    style={{
                      background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${layoutConfig.editorHeight}%, rgb(75, 85, 99) ${layoutConfig.editorHeight}%, rgb(75, 85, 99) 100%)`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Quick Layouts */}
            <div className="pt-2 border-t border-white/10">
              <label className="text-sm text-white/70 font-medium block mb-3">Quick Layouts:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyLayoutPreset('balanced')}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all text-white"
                >
                  Balanced
                </button>
                <button
                  onClick={() => applyLayoutPreset('code-focused')}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all text-white"
                >
                  Code Focus
                </button>
                <button
                  onClick={() => applyLayoutPreset('problem-focused')}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all text-white"
                >
                  Problem Focus
                </button>
                <button
                  onClick={() => applyLayoutPreset('full-editor')}
                  className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all text-white"
                >
                  Full Editor
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => applyLayoutPreset('balanced')}
              className="w-full px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all text-white"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Left Panel - Problem Description */}
      {layoutConfig.showDescription && (
        <>
          <div 
            className={`border-r border-white/10 flex flex-col overflow-hidden relative ${
              isResizing ? '' : 'transition-all duration-300 ease-in-out'
            }`}
            style={{ 
              width: `${layoutConfig.descriptionWidth}%`,
              minWidth: layoutConfig.showEditor ? '300px' : '400px',
              maxWidth: layoutConfig.showEditor ? '600px' : '100%'
            }}
          >
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Title & Difficulty */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-3 py-1 rounded text-sm font-medium ${difficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 text-base border-b border-white/10 mb-4">
            {[
              { key: "description", label: "Description" },
              { key: "editorial", label: "Editorial" },
              { key: "solutions", label: "Solutions" },
              { key: "submissions", label: "Submissions" },
              { key: "aichat", label: "AI Chat" },
            ].map((t) => (
              <button
                key={t.key}
                className={`px-2 py-3 -mb-px border-b-2 ${activeTab === t.key ? "border-emerald-400 text-white" : "border-transparent text-white/60 hover:text-white"}`}
                onClick={() => {
                  setActiveTab(t.key);
                  // If clicking solutions tab, immediately check for reference solutions
                  const refSolutionsArray = Array.isArray(problem?.referenceSolutions) ? problem.referenceSolutions : [];
                  if (t.key === "solutions" && problem && refSolutionsArray.length > 0) {
                    console.log('Tab clicked - loading reference solutions:', refSolutionsArray.length);
                    const refSolutions = refSolutionsArray
                      .filter(ref => ref && ref.completeCode && ref.language)
                      .map((ref, idx) => ({
                        _id: ref._id || `ref-${idx}`,
                        language: ref.language,
                        code: ref.completeCode,
                        status: 'Accepted',
                        isReference: true,
                      }));
                    console.log('Tab clicked - processed solutions:', refSolutions);
                    if (refSolutions.length > 0) {
                      setSolutions(refSolutions);
                    } else {
                      setSolutions([]);
                    }
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {(problem.tags || []).map((tag, i) => (
                  <button key={i} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded hover:bg-white/10">
                    {tag}
                  </button>
                ))}
              </div>

              {/* Description with Markdown - FIRST */}
              <div className="text-base text-white/80 leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4 text-base">{children}</p>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mb-2">{children}</h3>,
                    code: ({ children }) => <code className="bg-white/10 px-1.5 py-1 rounded text-sm">{children}</code>,
                    pre: ({ children }) => <pre className="bg-white/5 p-4 rounded border border-white/10 overflow-x-auto text-sm my-3">{children}</pre>,
                    ul: ({ children }) => <ul className="list-disc ml-5 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-5 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* Test Cases/Examples - SECOND */}
              {(problem.visibleTestCases && problem.visibleTestCases.length > 0) && (
                <>
                  <h3 className="text-base font-semibold text-white mt-6">Example</h3>
                  <div className="space-y-3">
                    {problem.visibleTestCases.map((tc, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded p-4 text-sm">
                        <div className="text-white/60 mb-1">Input:</div>
                        <pre className="text-white/80 whitespace-pre-wrap">{tc.input}</pre>
                        <div className="text-white/60 mb-1 mt-2">Output:</div>
                        <pre className="text-white/80 whitespace-pre-wrap">{tc.output}</pre>
                        {tc.explanation && (
                          <>
                            <div className="text-white/60 mb-1 mt-2">Explanation:</div>
                            <div className="text-white/70 mt-1">{tc.explanation}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Constraints - THIRD */}
              {(problem.constraints || []).length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-white mt-6">Constraints</h3>
                  <ul className="list-disc ml-5 text-base text-white/60 space-y-2">
                    {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}   
                  </ul>
                </>
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="mt-4">
              <div className="border border-white/10 rounded overflow-hidden bg-black/40">
                <div className="bg-white/5 px-4 py-2 text-sm text-white/60 border-b border-white/10">
                  <div className="grid grid-cols-6 gap-4 font-medium">
                    <span>Status</span>
                    <span>Language</span>
                    <span>Runtime</span>
                    <span>Memory</span>
                    <span>Submitted</span>
                    <span>Action</span>
                  </div>
                </div>
                {recentSubs.length === 0 ? (
                  <div className="py-20 text-center text-white/40 text-base">No data</div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {recentSubs.map((s) => (
                      <div key={s._id} className="px-4 py-3 text-sm grid grid-cols-6 gap-4 items-center hover:bg-white/5">
                        <span className={`font-medium capitalize ${verdictColor(s.status)}`}>
                          {s.status || "Pending"}
                        </span>
                        <span className="text-white/70">
                          {s.language ? s.language.charAt(0).toUpperCase() + s.language.slice(1).toLowerCase() : "N/A"}
                        </span>
                        <span className="text-white/70">
                          {s.runTime ? `${s.runTime} ms` : s.status === "pending" ? "..." : "N/A"}
                        </span>
                        <span className="text-white/70">
                          {s.memoryUsed ? `${s.memoryUsed} KB` : s.status === "pending" ? "..." : "N/A"}
                        </span>
                        <span className="text-white/60 text-[10px]">
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => loadSubmissionCode(s._id)}
                          disabled={loadingSubmission}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-300 text-[10px] flex items-center gap-1 disabled:opacity-50"
                          title="Load this submission"
                        >
                          <Download className="h-3 w-3" /> Load
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "editorial" && (
            <EditorialSectionWithPayment problemId={id} />
          )}

          {activeTab === "aichat" && (
            <div className="mt-4 flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <AIChatbot problem={problem} />
            </div>
          )}

          {activeTab === "solutions" && (
            <div className="mt-4 h-full flex flex-col">
              {(() => {
                console.log('Rendering solutions tab - solutions.length:', solutions.length);
                console.log('Rendering solutions tab - solutions:', solutions);
                console.log('Rendering solutions tab - problem.referenceSolutions:', problem?.referenceSolutions);
                return null;
              })()}
              {solutions.length === 0 ? (
                <div className="text-center py-20 text-white/40 text-base">
                  {problem && Array.isArray(problem.referenceSolutions) && problem.referenceSolutions.length > 0 ? (
                    <div>
                      <div className="mb-2">Loading reference solutions...</div>
                      <div className="text-sm text-white/30">Found {problem.referenceSolutions.length} reference solution(s) in database</div>
                      <div className="text-xs text-white/20 mt-2">Check console for debugging information</div>
                    </div>
                  ) : (
                    <>
                      <div>No solutions available yet.</div>
                      {problem && (!Array.isArray(problem.referenceSolutions) || problem.referenceSolutions.length === 0) && (
                        <div className="mt-2 text-sm text-white/30">
                          Reference solutions can be added by admins when creating problems.
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {solutions.filter(s => s && s.code).map((solution) => (
                    <div key={solution._id || solution.language} className="bg-white/5 border border-white/10 rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {solution.isReference && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Reference
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded text-sm font-medium ${verdictColor(solution.status)}`}>
                            {solution.status || "Accepted"}
                          </span>
                          <span className="text-sm text-white/60">
                            {solution.language || "Unknown"}
                            {solution.runTime && ` • ${solution.runTime}ms`}
                            {solution.memoryUsed && ` • ${solution.memoryUsed} KB`}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (solution.code) {
                              setCode(cleanCode(solution.code));
                              const lang = solution.language || "python";
                              const mappedLang = normalizeLanguage(lang);
                              setLanguage(mappedLang);
                              setActiveTab("description");
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-sm text-emerald-300 flex items-center gap-1.5"
                        >
                          <Download className="h-4 w-4" /> Load Code
                        </button>
                      </div>
                      {solution.code && (
                        <div className="relative">
                          <div className="bg-black/40 rounded border border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10">
                              <span className="text-sm text-white/60 font-mono">{solution.language || 'Code'}</span>
                              <button
                                onClick={() => copyToClipboard(solution.code)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                                title="Copy code"
                              >
                                <Copy className="h-4 w-4 text-white/70" />
                              </button>
                            </div>
                            <pre className="p-4 text-base overflow-x-auto max-h-96 overflow-y-auto font-mono leading-relaxed">
                              <code className="text-white/90">{solution.code}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        {/* Draggable Resizer - Vertical divider between description and editor */}
        {layoutConfig.showEditor && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-emerald-400/50 transition-all duration-200 z-10 ${
              isResizing ? 'bg-emerald-400 w-2' : 'bg-transparent hover:w-2'
            }`}
            style={{ cursor: 'col-resize' }}
            title="Drag to resize panels horizontally"
          />
        )}
        </>

      )}

      {/* Right Panel - Code Editor */}
      {layoutConfig.showEditor && (
        <div ref={editorContainerRef} className="flex-1 min-w-[400px] max-w-full border-l border-white/10 flex flex-col overflow-hidden">
        {/* Code Editor Header */}
        <div className="border-b border-white/10 bg-white/5 px-4 py-2 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-base text-white/80">&lt;/&gt; Code</span>
            <select
              value={normalizeLanguage(language)}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm outline-none text-white min-w-[160px] cursor-pointer hover:bg-white/15 transition-colors dark-select"
              title={`Select Programming Language (${Object.entries(languageMap).filter(([key]) => key === key.toLowerCase()).length} languages available)`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            >
              {/* Show all supported languages (14 languages) - prefer lowercase keys to avoid duplicates */}
              {Object.entries(languageMap)
                .filter(([key]) => {
                  // Keep only lowercase keys to avoid duplicates (python vs Python)
                  return key === key.toLowerCase();
                })
                .sort(([aKey, aConfig], [bKey, bConfig]) => {
                  // Sort by label alphabetically
                  return aConfig.label.localeCompare(bConfig.label);
                })
                .map(([key, config]) => (
                  <option 
                    key={key} 
                    value={key}
                    style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                  >
                    {config.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme Selector - First */}
            <span className="text-sm text-white/60 hidden sm:inline">Theme:</span>
            <select
              value={editorTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm outline-none text-white min-w-[160px] cursor-pointer hover:bg-white/15 transition-colors dark-select"
              title="Monaco Editor Theme - Select Dark/Light Theme"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            >
              <optgroup label="Dark Themes">
                {MONACO_THEMES.filter(theme => 
                  theme.value.includes('dark') || 
                  theme.value === 'dracula' || 
                  theme.value === 'one-dark-pro' ||
                  theme.value === 'nord' ||
                  theme.value === 'monokai' ||
                  theme.value === 'solarized-dark' ||
                  theme.value === 'tokyo-night' ||
                  theme.value === 'catppuccin-mocha' ||
                  theme.value === 'github-dark' ||
                  theme.value === 'material-dark'
                ).map((theme) => (
                  <option 
                    key={theme.value} 
                    value={theme.value}
                    style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                  >
                    {theme.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Light Themes">
                {MONACO_THEMES.filter(theme => 
                  theme.value.includes('light') || 
                  theme.value === 'vs' ||
                  theme.value === 'github-light' ||
                  theme.value === 'material-light' ||
                  theme.value === 'solarized-light'
                ).map((theme) => (
                  <option 
                    key={theme.value} 
                    value={theme.value}
                    style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                  >
                    {theme.label}
                  </option>
                ))}
              </optgroup>
            </select>
            
            {/* Run Button - Second */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Run button clicked", { problem: !!problem, codeLength: code?.length, language });
                runCode();
              }} 
              disabled={loadingRun || !problem || !code.trim()}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              <Play className="h-4 w-4" /> 
              {loadingRun ? "Running..." : "Run"}
            </button>
            
            {/* Submit Button - Third */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                submitCode();
              }} 
              disabled={loadingSubmission || !problem || !code.trim()}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              <Send className="h-4 w-4" /> 
              {loadingSubmission ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Enhanced Monaco Editor */}
        <div 
          ref={editorElementRef}
          className={`min-h-0 bg-black/20 relative overflow-hidden ${
            isResizingEditor ? '' : 'transition-all duration-300 ease-in-out'
          }`}
          style={{ 
            height: layoutConfig.showTestCases ? `${layoutConfig.editorHeight}%` : '100%'
          }}
        >
          {/* Draggable Resizer for Editor Height - Horizontal divider between editor and test cases */}
          {layoutConfig.showTestCases && (
            <div
              onMouseDown={handleEditorMouseDown}
              className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-emerald-400/50 transition-all duration-200 z-10 ${
                isResizingEditor ? 'bg-emerald-400 h-3' : 'bg-transparent hover:bg-emerald-400/30 hover:h-3'
              }`}
              style={{ cursor: 'row-resize' }}
              title="Drag to resize editor and test cases vertically"
            />
          )}
          <CodeEditor
            height="100%"
            language={normalizeLanguage(language)}
            theme={editorTheme}
            value={code}
            onChange={(value) => {
              // Code cleaning is handled in CodeEditor component
              setCode(value || "");
            }}
            options={{
              fontSize: 18,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Testcase Editor */}
        {layoutConfig.showTestCases && (
          <div 
            className={`border-t border-white/10 bg-white/5 flex-shrink-0 flex flex-col overflow-hidden relative ${
              isResizingEditor ? '' : 'transition-all duration-300 ease-in-out'
            }`}
            style={{ 
              height: `${100 - layoutConfig.editorHeight}%`,
              minHeight: '200px',
              maxHeight: '400px'
            }}
          >
            {/* Visual indicator for resizer area */}
            <div className="absolute -top-1 left-0 right-0 h-1 hover:bg-emerald-400/30 transition-colors" />
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 flex-shrink-0">
            <span className="text-base text-emerald-400">✓</span>
            <span className="text-base text-white/80 font-medium">Testcase</span>
            <span className="text-base text-white/40">|</span>
            <span className="text-base text-white/80 font-medium">&gt;_ Test Result</span>
          </div>
          
          {/* Testcase Tabs */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/10 overflow-x-auto flex-shrink-0">
            {/* Problem Test Cases */}
            {(problem.visibleTestCases || []).map((_, idx) => {
              const result = testCaseResults[idx];
              const isPassed = result?.verdict?.includes("Accepted");
              const isFailed = result && !isPassed;
              
              return (
              <button
                  key={`problem-${idx}`}
                  onClick={() => {
                    setTestCaseTab(idx);
                    setIsCustomTestCase(false);
                  }}
                  className={`
                    px-4 py-2 text-base rounded font-medium transition-all relative
                    ${testCaseTab === idx && !isCustomTestCase
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:bg-white/5'
                    }
                    ${isPassed ? 'border-l-2 border-emerald-400' : ''}
                    ${isFailed ? 'border-l-2 border-rose-400' : ''}
                  `}
              >
                Case {idx + 1}
                  {result && (
                    <span className="ml-2">
                      {isPassed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
              </button>
              );
            })}
            
            {/* Custom Test Cases */}
            {customTestCases.map((_, idx) => {
              const customIdx = (problem.visibleTestCases?.length || 0) + idx;
              const result = testCaseResults[customIdx];
              // Check if passed - either verdict includes "Accepted" or output matches expected
              const isPassed = result?.verdict?.includes("Accepted") || 
                               (result?.output && result?.expected && 
                                result.output.trim() === result.expected.trim() && 
                                result.output.trim() !== "");
              const isFailed = result && !isPassed && result.verdict;
              const isSelected = testCaseTab === customIdx && isCustomTestCase;
              
              return (
                <button
                  key={`custom-${idx}`}
                  onClick={() => {
                    setTestCaseTab(customIdx);
                    setIsCustomTestCase(true);
                  }}
                  className={`
                    px-4 py-2 text-base rounded font-medium transition-all relative flex items-center gap-2 group/custom-tab
                    ${isSelected
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                      : 'text-white/60 hover:bg-white/5'
                    }
                    ${isPassed ? 'border-l-2 border-emerald-400' : ''}
                    ${isFailed ? 'border-l-2 border-rose-400' : ''}
                  `}
                >
                  Custom {idx + 1}
                  {result && (
                    <span className="ml-1">
                      {isPassed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : isFailed ? (
                        <X className="w-4 h-4 text-rose-400" />
                      ) : null}
                    </span>
                  )}
                  {/* Delete button in top-right corner - visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCustom = customTestCases.filter((_, i) => i !== idx);
                      setCustomTestCases(newCustom);
                      if (isCustomTestCase && testCaseTab === customIdx) {
                        if (newCustom.length > 0) {
                          setTestCaseTab((problem.visibleTestCases?.length || 0));
                          setIsCustomTestCase(true);
                        } else {
                          setTestCaseTab(0);
                          setIsCustomTestCase(false);
                        }
                      }
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover/custom-tab:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded text-white/70 hover:text-white"
                    title="Delete custom test case"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              );
            })}
            
            {/* Add Custom Test Case Button */}
            <button
              onClick={() => {
                const newCustom = { input: '', expected: '' };
                setCustomTestCases([...customTestCases, newCustom]);
                const newIdx = (problem.visibleTestCases?.length || 0) + customTestCases.length;
                setTestCaseTab(newIdx);
                setIsCustomTestCase(true);
              }}
              className="px-3 py-2 text-base rounded font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1 border border-white/20 hover:border-white/40"
              title="Add custom test case"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            {(problem.visibleTestCases || []).length === 0 && customTestCases.length === 0 && (
              <span className="px-4 py-2 text-base text-white/40">No testcases</span>
            )}
          </div>

          {/* Side-by-side layout: Testcase Input on left, Test Result on right */}
          <div className="grid grid-cols-2 gap-0 flex-1 min-h-0 overflow-hidden">
            {/* Left Side: Testcase Input Fields */}
            <div className="border-r border-white/10 p-4 space-y-3 overflow-y-auto min-h-0">
              {isCustomTestCase ? (
                // Custom Test Case Editor
                (() => {
                  const customIdx = testCaseTab - (problem.visibleTestCases?.length || 0);
                  const customCase = customTestCases[customIdx];
                  return customCase ? (
                    <div className="relative group/custom-case">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-base text-white/70 font-semibold">Custom Test Case {customIdx + 1}:</label>
                        <div className="flex items-center gap-2">
                          {/* Delete button - next to Run button, visible on hover */}
                          <button
                            onClick={() => {
                              const newCustom = customTestCases.filter((_, i) => i !== customIdx);
                              setCustomTestCases(newCustom);
                              if (newCustom.length > 0) {
                                setTestCaseTab((problem.visibleTestCases?.length || 0));
                                setIsCustomTestCase(true);
                              } else {
                                setTestCaseTab(0);
                                setIsCustomTestCase(false);
                              }
                            }}
                            className="opacity-0 group-hover/custom-case:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded text-white"
                            title="Delete custom test case"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        <button
                          onClick={async () => {
                            if (!code || !code.trim()) {
                              setVerdict("Error: Please write some code first ❌");
                              return;
                            }
                            if (!customCase.input.trim()) {
                              setVerdict("Error: Please enter input ❌");
                              return;
                            }
                            
                            setLoadingRun(true);
                            setVerdict("");
                            setOutput("");
                            setExpectedOutput("");
                            
                            try {
                              const { data } = await axiosClient.post(`/solve/run-custom`, {
                                language,
                                code: code.trim(),
                                customInput: customCase.input.trim()
                              });
                              
                              const result = data.result || data;
                              const output = (result.stdout?.trim() || result.output?.trim() || result.stderr?.trim() || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                              const expected = (customCase.expected || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                              const statusId = result.status_id || result.status?.id;
                              const statusDesc = result.status?.description || result.status || "Unknown";
                              
                              // Determine verdict - check if output matches expected
                              let verdict = "Custom Test Executed";
                              if (statusId === 6) {
                                verdict = "Compilation Error ❌";
                              } else if (statusId === 7) {
                                verdict = "Runtime Error ❌";
                              } else if (statusId === 3 || (output === expected && output !== "" && expected !== "")) {
                                verdict = "Accepted ✅";
                              } else if (output && expected && output !== expected) {
                                verdict = "Wrong Answer ❌";
                              } else if (statusId === 5) {
                                verdict = "Time Limit Exceeded ⏱️";
                              } else if (statusId === 8) {
                                verdict = "Memory Limit Exceeded 💾";
                              } else if (output) {
                                verdict = "Custom Test Executed ✅";
                              }
                              
                              // Store result
                              const newResults = [...testCaseResults];
                              newResults[testCaseTab] = {
                                output,
                                expected: expected,
                                verdict,
                                statusId,
                                statusDesc,
                                index: testCaseTab
                              };
                              setTestCaseResults(newResults);
                              
                              setOutput(output || "No output");
                              setExpectedOutput(expected || "");
                              setVerdict(verdict);
                            } catch (err) {
                              console.error("Error running custom test:", err);
                              const errorMessage = err.response?.data?.message || err.message || "Execution failed";
                              setVerdict("Error running custom test ❌");
                              setOutput(errorMessage);
                            } finally {
                              setLoadingRun(false);
                            }
                          }}
                          disabled={loadingRun || !code.trim() || !customCase.input.trim()}
                          className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Run
                        </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-base text-white/70 mb-2 block font-semibold">Input:</label>
                        <textarea
                          value={customCase.input}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[customIdx].input = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          placeholder="Enter test input..."
                          className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-base font-mono resize-none text-white placeholder:text-white/30 focus:border-blue-400/50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-base text-white/70 mb-2 block font-semibold">Expected Output (optional):</label>
                        <textarea
                          value={customCase.expected}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[customIdx].expected = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          placeholder="Enter expected output (optional)..."
                          className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-base font-mono resize-none text-white placeholder:text-white/30 focus:border-blue-400/50"
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                // Problem Test Cases
                problem.visibleTestCases && problem.visibleTestCases.length > 0 ? (
              <>
                {problem.visibleTestCases[testCaseTab]?.input && (
                  <div>
                    <label className="text-base text-white/70 mb-3 block font-semibold">Input:</label>
                    <textarea
                      value={problem.visibleTestCases[testCaseTab].input}
                      readOnly
                      className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-base font-mono resize-none"
                      rows={problem.visibleTestCases[testCaseTab].input.split('\n').length || 2}
                    />
                  </div>
                )}
                <div>
                  <label className="text-base text-white/70 mb-3 block font-semibold">Expected Output:</label>
                  <textarea
                    value={problem.visibleTestCases[testCaseTab]?.output || ''}
                    readOnly
                    placeholder="Expected output will appear here"
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-base font-mono resize-none text-white/80 placeholder:text-white/30"
                    rows={problem.visibleTestCases[testCaseTab]?.output ? problem.visibleTestCases[testCaseTab].output.split('\n').length : 2}
                  />
                </div>
                {problem.visibleTestCases[testCaseTab]?.explanation && (
                  <div>
                    <label className="text-base text-white/70 mb-3 block font-semibold">Explanation:</label>
                    <div className="text-base text-white/70 bg-black/20 p-4 rounded border border-white/10 leading-relaxed">
                      {problem.visibleTestCases[testCaseTab].explanation}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-white/40">No sample testcase available</div>
                )
            )}
          </div>

            {/* Right Side: Test Result */}
            <div className="p-4 overflow-y-auto min-h-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base text-white/70 font-semibold">Test Result</div>
                {testCaseResults.length > 0 && (
                  <div className="text-sm text-white/50">
                    {testCaseResults.filter(r => r.verdict?.includes("Accepted")).length} / {testCaseResults.length} passed
                  </div>
                )}
              </div>
              {testCaseResults.length > 0 && testCaseResults[testCaseTab] ? (
              <div className="space-y-3 text-base">
                  <div className={`font-semibold text-lg flex items-center gap-2 ${verdictColor(testCaseResults[testCaseTab].verdict)}`}>
                    {testCaseResults[testCaseTab].verdict}
                    <span className="text-xs text-white/50 font-normal">(Case {testCaseTab + 1})</span>
                  </div>
                  <div>
                    <div className="text-white/70 font-medium mb-2">Your Output:</div>
                    <pre className="bg-black/40 p-3 rounded border border-white/10 whitespace-pre-wrap text-base min-h-[60px]">
                      {testCaseResults[testCaseTab].output || <span className="text-white/40">(empty)</span>}
                    </pre>
                  </div>
                  <div>
                    <div className="text-white/70 font-medium mb-2 mt-3">Expected Output:</div>
                    <pre className="bg-black/40 p-3 rounded border border-white/10 whitespace-pre-wrap text-base min-h-[60px]">
                      {testCaseResults[testCaseTab].expected || <span className="text-white/40">(empty)</span>}
                    </pre>
                  </div>
                  {testCaseResults[testCaseTab].output === testCaseResults[testCaseTab].expected && testCaseResults[testCaseTab].output !== "" && (
                    <div className="mt-3 p-2 bg-emerald-400/10 border border-emerald-400/20 rounded text-emerald-300 text-sm">
                      ✓ Output matches expected result
                    </div>
                  )}
                  {testCaseResults[testCaseTab].output !== testCaseResults[testCaseTab].expected && testCaseResults[testCaseTab].output !== "" && testCaseResults[testCaseTab].expected !== "" && (
                    <div className="mt-3 p-2 bg-rose-400/10 border border-rose-400/20 rounded text-rose-300 text-sm">
                      ✗ Output does not match expected result
                    </div>
                  )}
                </div>
              ) : verdict ? (
                <div className="space-y-3 text-base">
                  <div className={`font-semibold text-lg flex items-center gap-2 ${verdictColor(verdict)}`}>
                    {verdict}
                    {problem.visibleTestCases && problem.visibleTestCases[testCaseTab] && (
                      <span className="text-xs text-white/50 font-normal">(Case {testCaseTab + 1})</span>
                    )}
                  </div>
                  {output !== undefined && (
                  <>
                    <div className="text-white/70 font-medium mb-2">Your Output:</div>
                      <pre className="bg-black/40 p-3 rounded border border-white/10 whitespace-pre-wrap text-base min-h-[60px]">
                        {output || <span className="text-white/40">(empty)</span>}
                      </pre>
                  </>
                )}
                  {expectedOutput !== undefined && (
                  <>
                    <div className="text-white/70 font-medium mb-2 mt-3">Expected Output:</div>
                      <pre className="bg-black/40 p-3 rounded border border-white/10 whitespace-pre-wrap text-base min-h-[60px]">
                        {expectedOutput || <span className="text-white/40">(empty)</span>}
                      </pre>
                  </>
                )}
                  {output === expectedOutput && output !== "" && (
                    <div className="mt-3 p-2 bg-emerald-400/10 border border-emerald-400/20 rounded text-emerald-300 text-sm">
                      ✓ Output matches expected result
                    </div>
                  )}
                  {output !== expectedOutput && output !== "" && expectedOutput !== "" && (
                    <div className="mt-3 p-2 bg-rose-400/10 border border-rose-400/20 rounded text-rose-300 text-sm">
                      ✗ Output does not match expected result
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-base text-white/40">You must run your code first</div>
            )}
            </div>
          </div>
        </div>
        )}
      </div>
      )}
    </div>
  );
}

/** Difficulty Badge Colors */
function difficultyColor(level) {
  level = (level || "").toLowerCase();
  if (level === "easy") return "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30";
  if (level === "medium") return "bg-amber-600/20 text-amber-300 border border-amber-500/30";
  if (level === "hard") return "bg-rose-600/20 text-rose-300 border border-rose-500/30";
  return "bg-white/10 text-white/60";
}

/** Verdict Colors */
function verdictColor(v) {
  if (!v) return "text-white/60";
  const status = v.toLowerCase();
  if (status === "accepted" || status.includes("success")) return "text-emerald-400";
  if (status === "wrong answer" || status.includes("wrong")) return "text-rose-400";
  if (status === "pending" || status.includes("processing")) return "text-amber-400";
  if (status.includes("error") || status.includes("failed") || status.includes("runtime")) return "text-rose-400";
  if (status.includes("time limit")) return "text-orange-400";
  if (status.includes("memory")) return "text-purple-400";
  return "text-white/60";
}

/** Editorial Section with Payment Protection */
function EditorialSectionWithPayment({ problemId }) {
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (subscriptionLoading) {
    return (
      <div className="mt-4 text-center py-20 text-white/40 text-base">
        Loading...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mt-4">
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-8 text-center">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Premium Feature</h3>
          <p className="text-white/70 mb-6">
            Subscribe to access editorial videos and algorithm visualizations
          </p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Unlock Premium
          </button>
        </div>
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    );
  }

  return <EditorialSection problemId={problemId} />;
}

/** Editorial Section Component */
function EditorialSection({ problemId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewedVideos, setViewedVideos] = useState(new Set()); // Track which videos have been viewed

  useEffect(() => {
    const fetchVideos = async () => {
      if (!problemId) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await axiosClient.get(`/videos/problem/${problemId}`);
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err.response?.data?.message || 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [problemId]);

  const handleVideoPlay = async (videoId) => {
    // Only increment views once per video per session
    if (viewedVideos.has(videoId)) return;
    
    try {
      const { data } = await axiosClient.post(`/videos/${videoId}/increment-views`);
      // Update the view count in the local state
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video._id === videoId
            ? { ...video, views: data.views }
            : video
        )
      );
      // Mark this video as viewed
      setViewedVideos(prev => new Set(prev).add(videoId));
    } catch (err) {
      console.error('Error incrementing video views:', err);
      // Don't show error to user, just log it
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="mt-4 text-center py-20 text-white/40 text-base">
        Loading editorial videos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="mt-4 text-center py-20 text-white/40 text-base">
        No editorial videos available yet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {videos.map((video) => (
        <div
          key={video._id}
          className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
        >
          <div className="relative aspect-video bg-black/40">
            <video
              src={video.cloudinaryUrl}
              controls
              className="w-full h-full"
              poster={video.thumbnailUrl || undefined}
              onPlay={() => handleVideoPlay(video._id)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{video.title}</h3>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.views || 0}
                </span>
                {video.duration > 0 && (
                  <span>{formatDuration(video.duration)}</span>
                )}
              </div>
            </div>
            {video.description && (
              <p className="text-sm text-white/70 mb-2">{video.description}</p>
            )}
            {video.uploadedBy && (
              <p className="text-xs text-white/50">
                By {video.uploadedBy.firstName} {video.uploadedBy.lastName}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProblemPage;
