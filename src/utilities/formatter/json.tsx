"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap, Clipboard, FileText, Trash2, Settings, Copy, HelpCircle, ChevronDown } from "lucide-react"

const initialJsonInput = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`

export default function JsonFormatterPage() {
  const [inputJson, setInputJson] = useState(initialJsonInput)
  const [outputJson, setOutputJson] = useState("")
  const [indentation, setIndentation] = useState("2") // "2", "4", "tab"

  // Settings states
  const [autoDetect, setAutoDetect] = useState(true)
  const [allowTrailingCommas, setAllowTrailingCommas] = useState(false)
  const [autoRepair, setAutoRepair] = useState(true)
  const [continuousMode, setContinuousMode] = useState(true)
  const [sortKeys, setSortKeys] = useState(true)

  const formatJson = (jsonString: string, currentIndentation: string, shouldSortKeys: boolean) => {
    try {
      const parsedJson = JSON.parse(jsonString)
      let processedJson = parsedJson

      if (shouldSortKeys) {
        const sortObjectKeys = (obj: any): any => {
          if (typeof obj !== "object" || obj === null) {
            return obj
          }
          if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys)
          }
          const sortedKeys = Object.keys(obj).sort()
          const result: { [key: string]: any } = {}
          for (const key of sortedKeys) {
            result[key] = sortObjectKeys(obj[key])
          }
          return result
        }
        processedJson = sortObjectKeys(parsedJson)
      }

      const indentChar = currentIndentation === "tab" ? "\t" : " ".repeat(Number.parseInt(currentIndentation))
      return JSON.stringify(processedJson, null, indentChar)
    } catch (error) {
      if (error instanceof Error) {
        return `Error parsing JSON: ${error.message}`
      }
      return "Error parsing JSON: Unknown error"
    }
  }

  useEffect(() => {
    if (continuousMode) {
      setOutputJson(formatJson(inputJson, indentation, sortKeys))
    }
  }, [inputJson, indentation, continuousMode, sortKeys])

  const handleFormatButtonClick = () => {
    setOutputJson(formatJson(inputJson, indentation, sortKeys))
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You might want to add a toast notification here for success
      console.log("Copied to clipboard")
    } catch (err) {
      console.error("Failed to copy: ", err)
      // Add toast notification for error
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputJson(text)
    } catch (err) {
      console.error("Failed to paste: ", err)
      // Add toast notification for error
    }
  }

  const handleLoadSample = () => {
    setInputJson(initialJsonInput)
  }

  const handleClearInput = () => {
    setInputJson("")
    setOutputJson("")
  }

  const handleResetSettings = () => {
    setAutoDetect(true)
    setAllowTrailingCommas(false)
    setAutoRepair(true)
    setContinuousMode(true)
    setSortKeys(true)
  }

  const getIndentationLabel = (value: string) => {
    if (value === "tab") return "Tabs"
    return `${value} spaces`
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          {/* Input Section */}
          <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-foreground/80">Input</span>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleFormatButtonClick}
                      disabled={continuousMode}
                    >
                      <Zap size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                    <p>Format JSON</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handlePasteFromClipboard}
                    >
                      <Clipboard size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                    <p>Paste from Clipboard</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleLoadSample}
                    >
                      <FileText size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                    <p>Load Sample JSON</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={handleClearInput}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                    <p>Clear Input</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                          <Settings size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-64 bg-popover text-popover-foreground border">
                    <DropdownMenuCheckboxItem
                      checked={autoDetect}
                      onCheckedChange={setAutoDetect}
                      className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      Auto detect when input is valid JSON
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={allowTrailingCommas}
                      onCheckedChange={setAllowTrailingCommas}
                      className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      Allow trailing commas and comments
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={autoRepair}
                      onCheckedChange={setAutoRepair}
                      className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      <div>
                        Auto repair invalid JSON if possible
                        <p className="text-xs text-muted-foreground">Fix missing quotes, strip commas, etc.</p>
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={continuousMode}
                      onCheckedChange={setContinuousMode}
                      className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      Continuous Mode: format as you type
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortKeys}
                      onCheckedChange={setSortKeys}
                      className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      Sort keys in output
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onSelect={handleResetSettings} className="focus:bg-accent">
                      Reset to Defaults
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-background border-input hover:bg-accent text-foreground hover:text-accent-foreground"
                    >
                      JSON <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border">
                    <DropdownMenuRadioGroup value="json">
                      <DropdownMenuRadioItem value="json" className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                        JSON
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="xml"
                        disabled
                        className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      >
                        XML (soon)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value="yaml"
                        disabled
                        className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      >
                        YAML (soon)
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder="Paste your JSON here"
              className="flex-grow bg-background border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring"
              spellCheck="false"
            />
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-foreground/80">Output</span>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-background border-input hover:bg-accent text-foreground hover:text-accent-foreground"
                    >
                      {getIndentationLabel(indentation)} <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border">
                    <DropdownMenuRadioGroup value={indentation} onValueChange={setIndentation}>
                      <DropdownMenuRadioItem value="2" className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                        2 spaces
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="4" className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                        4 spaces
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="tab" className="focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                        Tabs
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={() => handleCopyToClipboard(outputJson)}
                    >
                      <Copy size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border">
                    <p>Copy Output</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Textarea
              value={outputJson}
              readOnly
              placeholder="Formatted JSON will appear here"
              className="flex-grow bg-background border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring"
              spellCheck="false"
            />
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="text"
                placeholder="JSON Path (e.g., $.store.book[*].author)"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground text-xs h-8 focus:ring-ring focus:border-ring"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                    <HelpCircle size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-popover text-popover-foreground border">
                  <p>JSONPath Help</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
