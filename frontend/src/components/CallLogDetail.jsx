import React from 'react';
import { Clock, Phone, Calendar, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const CallLogDetail = ({ call }) => {
  if (!call) {
    return (
      <Card className="border-0 shadow-sm h-full" data-testid="call-detail-empty">
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Phone className="w-12 h-12 mx-auto mb-3" />
            <p>Select a call to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="border-0 shadow-sm" data-testid="call-detail-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Call Details</CardTitle>
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {call.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contact Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xl">
            {call.contact_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{call.contact_name}</h3>
            <p className="text-slate-500 font-mono text-sm">{call.contact_phone}</p>
          </div>
        </div>

        {/* Call Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Duration
            </div>
            <p className="font-semibold text-slate-900">{formatDuration(call.duration_seconds)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Timeline
            </div>
            <p className="font-semibold text-slate-900 text-sm">{call.timeline_response || 'N/A'}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-500" />
            Summary
          </h4>
          <p className="text-slate-600 text-sm bg-sky-50 rounded-lg p-3">
            {call.summary}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Transcript */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Transcript</h4>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {call.transcript.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.speaker === 'Customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-4 py-3 text-sm ${
                      msg.speaker === 'Customer' 
                        ? 'bg-sky-500 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-xs ${msg.speaker === 'Customer' ? 'text-sky-100' : 'text-slate-500'}`}>
                        {msg.speaker}
                      </span>
                      <span className={`text-xs ${msg.speaker === 'Customer' ? 'text-sky-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallLogDetail;
