import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AICallDemo = ({ contact }) => {
  const [callState, setCallState] = useState('idle'); // idle, ringing, connected, ended
  const [transcript, setTranscript] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Demo conversation
  const demoTranscript = [
    { speaker: 'AI Agent', message: "Hello! This is Crystal Clear Windows calling. Am I speaking with the homeowner?", timestamp: '00:00' },
    { speaker: 'Customer', message: "Yes, this is them.", timestamp: '00:03' },
    { speaker: 'AI Agent', message: "Great! I'm calling to confirm your recent inquiry about our window washing services. Is this still a good time to talk?", timestamp: '00:06' },
    { speaker: 'Customer', message: "Yes, absolutely.", timestamp: '00:12' },
    { speaker: 'AI Agent', message: "Perfect! Could you tell me what timeline you're looking at for getting your windows cleaned?", timestamp: '00:15' },
    { speaker: 'Customer', message: "I'm thinking within the next two weeks would be ideal.", timestamp: '00:20' },
    { speaker: 'AI Agent', message: "That sounds great! I've noted that down. One of our team members will follow up with you shortly to discuss specific details and provide a quote. Is there anything else you'd like to know?", timestamp: '00:25' },
    { speaker: 'Customer', message: "No, that's all for now. Thank you!", timestamp: '00:32' },
    { speaker: 'AI Agent', message: "Wonderful! Thank you for choosing Crystal Clear Windows. Have a great day!", timestamp: '00:35' }
  ];

  const startDemoCall = () => {
    setCallState('ringing');
    setTranscript([]);
    setCurrentMessageIndex(0);
    
    setTimeout(() => {
      setCallState('connected');
      setIsPlaying(true);
    }, 2000);
  };

  const endCall = () => {
    setCallState('ended');
    setIsPlaying(false);
    toast.success('Demo call completed!');
  };

  // Simulate conversation playback
  useEffect(() => {
    if (isPlaying && currentMessageIndex < demoTranscript.length) {
      const timer = setTimeout(() => {
        setTranscript(prev => [...prev, demoTranscript[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else if (currentMessageIndex >= demoTranscript.length && isPlaying) {
      setTimeout(() => {
        endCall();
      }, 1500);
    }
  }, [isPlaying, currentMessageIndex]);

  // Real call initiation if contact is provided
  const initiateRealCall = async () => {
    if (!contact) {
      toast.error('Please submit the contact form first');
      return;
    }
    
    setCallState('ringing');
    setTranscript([]);
    
    try {
      setTimeout(async () => {
        setCallState('connected');
        const response = await axios.post(`${API}/calls/initiate`, { contact_id: contact.id });
        
        // Play through the transcript
        const callTranscript = response.data.transcript;
        for (let i = 0; i < callTranscript.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setTranscript(prev => [...prev, callTranscript[i]]);
        }
        
        setTimeout(() => {
          setCallState('ended');
          toast.success('AI call completed! Check the dashboard for details.');
        }, 1500);
      }, 2000);
    } catch (error) {
      toast.error('Failed to initiate call');
      setCallState('idle');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden" data-testid="ai-call-demo">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            {/* Left - AI Agent Visual */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-8 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                    <Phone className="w-10 h-10 text-sky-500" />
                  </div>
                </div>
                {callState === 'connected' && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 pulse-ring" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Crystal AI</h3>
              <p className="text-sky-100 mb-6">Your Window Washing Assistant</p>
              
              {/* Audio Visualizer */}
              {callState === 'connected' && (
                <div className="flex items-end gap-1 h-10 mb-6" data-testid="audio-visualizer">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-white rounded-full audio-bar"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
              
              {/* Call Status */}
              <div className="flex items-center gap-2 text-white">
                {callState === 'idle' && (
                  <span className="text-sky-100">Ready to call</span>
                )}
                {callState === 'ringing' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span>Calling...</span>
                  </>
                )}
                {callState === 'connected' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Connected</span>
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
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <p>Start a demo call to see the AI in action</p>
                  </div>
                )}
                {transcript.length === 0 && callState === 'ringing' && (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <p className="animate-pulse">Connecting...</p>
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
                        <p className="font-medium text-xs mb-1 opacity-70">{msg.speaker}</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Call Controls */}
              <div className="flex gap-3">
                {callState === 'idle' && (
                  <>
                    <Button 
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full h-12"
                      onClick={startDemoCall}
                      data-testid="start-demo-call-btn"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Start Demo Call
                    </Button>
                    {contact && (
                      <Button 
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-12"
                        onClick={initiateRealCall}
                        data-testid="call-me-now-btn"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call {contact.name.split(' ')[0]}
                      </Button>
                    )}
                  </>
                )}
                {(callState === 'ringing' || callState === 'connected') && (
                  <Button 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full h-12"
                    onClick={endCall}
                    data-testid="end-call-btn"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                )}
                {callState === 'ended' && (
                  <Button 
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-full h-12"
                    onClick={() => {
                      setCallState('idle');
                      setTranscript([]);
                      setCurrentMessageIndex(0);
                    }}
                    data-testid="call-again-btn"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info Text */}
      <p className="text-center text-slate-500 text-sm mt-6">
        This is a demonstration of our AI calling agent. In production, 
        this uses Twilio + OpenAI for real voice conversations.
        <span className="block mt-1 text-xs text-slate-400">(Currently MOCKED for demo purposes)</span>
      </p>
    </div>
  );
};

export default AICallDemo;
