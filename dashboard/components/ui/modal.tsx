"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Copy, Check, ChevronDown, ChevronRight, Image } from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Function to detect if a string is base64 image data
function isBase64Image(str: string): boolean {
  // Check if it starts with data:image or is a long base64 string that could be an image
  return str.startsWith('data:image/') || 
         (str.length > 1000 && /^[A-Za-z0-9+/]*={0,2}$/.test(str));
}

// Component for collapsible base64 image
function CollapsibleBase64Image({ data, depth }: { data: string; depth: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const truncated = data.length > 100 ? `${data.substring(0, 100)}...` : data;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="inline-flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 py-1 text-xs">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <Image className="h-3 w-3 mr-1" />
            Base64 Image ({data.length} chars)
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2">
        <div className="bg-gray-800 rounded p-2 text-xs">
          <div className="mb-2">
            <img 
              src={data.startsWith('data:') ? data : `data:image/png;base64,${data}`}
              alt="Base64 Image"
              className="max-w-full max-h-48 object-contain border rounded"
              onError={(e) => {
                console.error('Failed to load base64 image');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="text-gray-400 break-all">
            {truncated}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Function to render JSON with collapsible base64 images
function renderJsonWithCollapsibleImages(obj: any, depth: number = 0): React.ReactNode {
  if (typeof obj === 'string') {
    if (isBase64Image(obj)) {
      return <CollapsibleBase64Image key={`base64-${depth}-${Math.random()}`} data={obj} depth={depth} />;
    }
    return `"${obj}"`;
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    return (
      <span>
        [<br />
        {obj.map((item, index) => (
          <div key={index} style={{ marginLeft: `${(depth + 1) * 2}em` }}>
            {renderJsonWithCollapsibleImages(item, depth + 1)}
            {index < obj.length - 1 && ','}
          </div>
        ))}
        <div style={{ marginLeft: `${depth * 2}em` }}>]</div>
      </span>
    );
  }
  
  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    return (
      <span>
        {'{'}<br />
        {entries.map(([key, value], index) => (
          <div key={key} style={{ marginLeft: `${(depth + 1) * 2}em` }}>
            <span className="text-blue-400">"{key}"</span>: {renderJsonWithCollapsibleImages(value, depth + 1)}
            {index < entries.length - 1 && ','}
          </div>
        ))}
        <div style={{ marginLeft: `${depth * 2}em` }}>{'}'}</div>
      </span>
    );
  }
  
  return String(obj);
}

interface RawJsonModalProps {
  isOpen: boolean
  onClose: () => void
  data: any
  title?: string
}

export function RawJsonModal({ isOpen, onClose, data, title = "Raw JSON Data" }: RawJsonModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy JSON
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-sm whitespace-pre-wrap">
            {renderJsonWithCollapsibleImages(data)}
          </pre>
        </div>
      </div>
    </Modal>
  )
} 