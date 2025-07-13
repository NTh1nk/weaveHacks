"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe, CheckCircle, XCircle, ChevronDown, RefreshCw } from "lucide-react"
import { useSessions } from "@/hooks/use-qa-data"

interface SessionSelectorProps {
  selectedSessionId?: number;
  onSessionSelect: (sessionId: number | undefined) => void;
}

export function SessionSelector({ selectedSessionId, onSessionSelect }: SessionSelectorProps) {
  const { sessions, loading, error, refetch } = useSessions();
  const [isOpen, setIsOpen] = useState(false);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const latestSession = sessions[0]; // Sessions are sorted by newest first

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (failedFeatures: number, totalFeatures: number) => {
    if (totalFeatures === 0) return "bg-gray-500";
    if (failedFeatures === 0) return "bg-green-500";
    if (failedFeatures === totalFeatures) return "bg-red-500";
    return "bg-yellow-500";
  };

  const getStatusText = (failedFeatures: number, totalFeatures: number) => {
    if (totalFeatures === 0) return "No tests";
    if (failedFeatures === 0) return "Passed";
    if (failedFeatures === totalFeatures) return "Failed";
    return "Partial";
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        Loading sessions...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" onClick={refetch}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {selectedSession ? (
              <>
                <span className="truncate text-sm">Session {selectedSession.id}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-1.5 py-0.5 ${getStatusColor(selectedSession.failedFeatures, selectedSession.totalFeatures)}`}
                >
                  {getStatusText(selectedSession.failedFeatures, selectedSession.totalFeatures)}
                </Badge>
              </>
            ) : (
              <>
                <span className="text-sm">Latest</span>
                {latestSession && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-1.5 py-0.5 ${getStatusColor(latestSession.failedFeatures, latestSession.totalFeatures)}`}
                  >
                    {getStatusText(latestSession.failedFeatures, latestSession.totalFeatures)}
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Test Sessions</span>
          <Button variant="ghost" size="sm" onClick={refetch} className="h-6 w-6 p-0">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Latest Session Option */}
        <DropdownMenuItem 
          onClick={() => {
            onSessionSelect(undefined);
            setIsOpen(false);
          }}
          className="flex flex-col items-start gap-1.5 p-2.5"
        >
          <div className="flex items-center gap-2 w-full">
            <span className="font-medium text-sm">Latest Session</span>
            {latestSession && (
              <Badge 
                variant="secondary" 
                className={`text-xs px-1.5 py-0.5 ${getStatusColor(latestSession.failedFeatures, latestSession.totalFeatures)}`}
              >
                {getStatusText(latestSession.failedFeatures, latestSession.totalFeatures)}
              </Badge>
            )}
          </div>
          {latestSession && (
            <div className="text-xs text-gray-500 space-y-0.5 w-full">
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{latestSession.url}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{formatTimestamp(latestSession.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-xs">{latestSession.totalFeatures - latestSession.failedFeatures}/{latestSession.totalFeatures}</span>
                </span>
                {latestSession.screenshots > 0 && (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs">{latestSession.screenshots}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Individual Sessions */}
        {sessions.map((session) => (
          <DropdownMenuItem 
            key={session.id}
            onClick={() => {
              onSessionSelect(session.id);
              setIsOpen(false);
            }}
            className={`flex flex-col items-start gap-1.5 p-2.5 ${
              selectedSessionId === session.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium text-sm">Session {session.id}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs px-1.5 py-0.5 ${getStatusColor(session.failedFeatures, session.totalFeatures)}`}
              >
                {getStatusText(session.failedFeatures, session.totalFeatures)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5 w-full">
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{session.url}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{formatTimestamp(session.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-xs">{session.totalFeatures - session.failedFeatures}/{session.totalFeatures}</span>
                </span>
                {session.screenshots > 0 && (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs">{session.screenshots}</span>
                  </span>
                )}
              </div>
              {session.promptContent && (
                <div className="text-xs text-gray-400 truncate w-full leading-tight">
                  "{session.promptContent}"
                </div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        {sessions.length === 0 && (
          <DropdownMenuItem disabled className="text-center text-gray-500 py-2">
            <span className="text-sm">No sessions available</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 