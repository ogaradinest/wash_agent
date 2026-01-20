import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import Vapi from '@vapi-ai/web';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const VAPI_PUBLIC_KEY = process.env.REACT_APP_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = process.env.REACT_APP_VAPI_ASSISTANT_ID;

const AICallDemo = ({ contact }) => {
  const [callState, setCallState] = useState('idle'); // idle, connecting, connected, ended
  const [transcript, setTranscript] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const vapiRef = useRef(null);

  // Initialize Vapi
  useEffect(() => {
    if (VAPI_PUBLIC_KEY) {
      vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
      
      // Set up event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started');
        setCallState('connected');
        toast.success('Connected to AI Agent!');
      });

      vapiRef.current.on('call-end', () => {
        console.log('Call ended');
        setCallState('ended');
        toast.info('Call ended');
      });

      vapiRef.current.on('speech-start', () => {
        setVolumeLevel(0.7);
      });

      vapiRef.current.on('speech-end', () => {
        setVolumeLevel(0);
      });

      vapiRef.current.on('volume-level', (level) => {
        setVolumeLevel(level);
      });

      vapiRef.current.on('message', (message) => {
        console.log('Vapi message:', message);
        
        // Handle transcript messages
        if (message.type === 'transcript') {
          const speaker = message.role === 'assistant' ? 'AI Agent' : 'Customer';
          const newMessage = {
            speaker,
            message: message.transcript,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            }),
            isFinal: message.transcriptType === 'final'
          };
          
          if (message.transcriptType === 'final') {
            setTranscript(prev => [...prev, newMessage]);
          }
        }
        
        // Handle conversation updates
        if (message.type === 'conversation-update') {
          // Log conversation for backend storage
          console.log('Conversation update:', message.conversation);
        }
      });

      vapiRef.current.on('error', (error) => {
        console.error('Vapi error:', error);
        toast.error('Call error: ' + (error.message || 'Connection failed'));
        setCallState('idle');
      });
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current) {
      toast.error('Vapi not initialized. Check your API key.');
      return;
    }

    setCallState('connecting');
    setTranscript([]);

    try {
      // Prepare assistant overrides with customer context
      const assistantOverrides = {};
      
      if (contact) {
        // Pass customer info to the assistant via variable values
        assistantOverrides.variableValues = {
          customerName: contact.name,
          customerPhone: contact.phone,
          customerEmail: contact.email
        };
      }

      await vapiRef.current.start(VAPI_ASSISTANT_ID, assistantOverrides);
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call. Please check microphone permissions.');
      setCallState('idle');
    }
  };

  const endCall = async () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    
    // Save call log to backend if we have a contact
    if (contact && transcript.length > 0) {
      try {
        await axios.post(`${API}/calls/log`, {
          contact_id: contact.id,
          transcript: transcript,
          duration_seconds: Math.floor(transcript.length * 5) // Approximate duration
        });
      } catch (error) {
        console.error('Failed to save call log:', error);
      }
    }
    
    setCallState('ended');
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMuteState = !isMuted;
      vapiRef.current.setMuted(newMuteState);
      setIsMuted(newMuteState);
      toast.info(newMuteState ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const resetCall = () => {
    setCallState('idle');
    setTranscript([]);
    setIsMuted(false);
    setVolumeLevel(0);
  };

  // Audio visualization bars based on volume level
  const getBarHeight = (index) => {
    if (callState !== 'connected') return 8;
    const baseHeight = 8;
    const maxHeight = 40;
    const variation = Math.sin((index + Date.now() / 200) * 0.5) * 0.3 + 0.7;
    return baseHeight + (maxHeight - baseHeight) * volumeLevel * variation;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden" data-testid="ai-call-demo">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            {/* Left - AI Agent Visual */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-8 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-6">
                <div className={`w-32 h-32 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 ${callState === 'connected' ? 'scale-110' : ''}`}>
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                    <Phone className={`w-10 h-10 text-sky-500 ${callState === 'connecting' ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
                {callState === 'connected' && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 pulse-ring" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Crystal AI</h3>
              <p className="text-sky-100 mb-6">Your Window Washing Assistant</p>
              
              {/* Audio Visualizer */}
              <div className="flex items-end gap-1 h-12 mb-6" data-testid="audio-visualizer">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 bg-white rounded-full transition-all duration-100"
                    style={{ 
                      height: `${getBarHeight(i)}px`,
                      opacity: callState === 'connected' ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
              
              {/* Call Status */}
              <div className="flex items-center gap-2 text-white">
                {callState === 'idle' && (
                  <span className="text-sky-100">Ready to talk</span>
                )}
                {callState === 'connecting' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span>Connecting...</span>
                  </>
                )}
                {callState === 'connected' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Live Conversation</span>
                  </>
                )}
                {callState === 'ended' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Call Ended</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Right - Transcript & Controls */}
            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Live Transcript</h4>
                {callState === 'connected' && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <Mic className="w-4 h-4" />
                    <span>Recording</span>
                  </div>
                )}
              </div>
              
              {/* Transcript Area */}
              <div className="flex-1 bg-slate-50 rounded-xl p-4 mb-6 overflow-y-auto max-h-[250px] min-h-[200px]" data-testid="transcript-area">
                {transcript.length === 0 && callState === 'idle' && (
                  <div className="h-full flex items-center justify-center text-slate-400 text-center px-4">
                    <div>
                      <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Click "Start Call" to speak with our AI agent</p>
                      <p className="text-xs mt-1">Make sure to allow microphone access</p>
                    </div>
                  </div>
                )}
                {transcript.length === 0 && callState === 'connecting' && (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <p className="animate-pulse">Connecting to AI Agent...</p>
                  </div>
                )}
                {transcript.length === 0 && callState === 'connected' && (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <p>Listening... Start speaking!</p>
                  </div>
                )}
                <div className="space-y-3">
                  {transcript.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.speaker === 'Customer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-4 py-2 text-sm ${
                          msg.speaker === 'Customer' 
                            ? 'bubble-customer' 
                            : 'bubble-ai'
                        }`}
                      >
                        <p className="font-medium text-xs mb-1 opacity-70">{msg.speaker} • {msg.timestamp}</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Customer Context */}
              {contact && callState === 'idle' && (
                <div className="bg-sky-50 rounded-lg p-3 mb-4 text-sm">
                  <p className="text-sky-800 font-medium">Calling as: {contact.name}</p>
                  <p className="text-sky-600 text-xs">{contact.phone}</p>
                </div>
              )}
              
              {/* Call Controls */}
              <div className="flex gap-3">
                {callState === 'idle' && (
                  <Button 
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full h-12"
                    onClick={startCall}
                    data-testid="start-call-btn"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {contact ? `Talk to AI Agent` : 'Start Call'}
                  </Button>
                )}
                {callState === 'connecting' && (
                  <Button 
                    className="flex-1 bg-slate-400 text-white rounded-full h-12"
                    disabled
                  >
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </Button>
                )}
                {callState === 'connected' && (
                  <>
                    <Button 
                      className={`h-12 px-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      onClick={toggleMute}
                      data-testid="mute-btn"
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full h-12"
                      onClick={endCall}
                      data-testid="end-call-btn"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  </>
                )}
                {callState === 'ended' && (
                  <Button 
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full h-12"
                    onClick={resetCall}
                    data-testid="call-again-btn"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Start New Call
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info Text */}
      <p className="text-center text-slate-500 text-sm mt-6">
        This is a live AI voice conversation powered by Vapi.
        <span className="block mt-1 text-xs text-slate-400">
          Allow microphone access when prompted to start talking.
        </span>
      </p>
    </div>
  );
};

export default AICallDemo;
