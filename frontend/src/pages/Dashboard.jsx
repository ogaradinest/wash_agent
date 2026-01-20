import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Phone, Calendar, Settings, Users, BarChart3, 
  PhoneCall, Clock, CheckCircle, AlertCircle, Droplets, 
  ChevronRight, RefreshCw, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { toast } from 'sonner';
import axios from 'axios';
import CallLogDetail from '../components/CallLogDetail';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [stats, setStats] = useState({
    total_contacts: 0,
    total_calls: 0,
    pending_contacts: 0,
    scheduled_followups: 0,
    conversion_rate: 0
  });
  const [selectedCall, setSelectedCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initiatingCall, setInitiatingCall] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contactsRes, callsRes, eventsRes, statsRes] = await Promise.all([
        axios.get(`${API}/contacts`),
        axios.get(`${API}/calls`),
        axios.get(`${API}/schedule`),
        axios.get(`${API}/stats`)
      ]);
      
      setContacts(contactsRes.data);
      setCallLogs(callsRes.data);
      setScheduledEvents(eventsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const initiateCall = async (contactId) => {
    setInitiatingCall(contactId);
    try {
      const response = await axios.post(`${API}/calls/initiate`, { contact_id: contactId });
      toast.success('AI call completed successfully!');
      setSelectedCall(response.data);
      fetchData();
    } catch (error) {
      toast.error('Failed to initiate call');
      console.error(error);
    } finally {
      setInitiatingCall(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      called: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      scheduled: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
      completed: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
    };
    return <Badge className={styles[status] || styles.pending}>{status}</Badge>;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statCards = [
    { 
      title: 'Total Contacts', 
      value: stats.total_contacts, 
      icon: <Users className="w-5 h-5 text-sky-500" />,
      color: 'bg-sky-50'
    },
    { 
      title: 'Calls Made', 
      value: stats.total_calls, 
      icon: <PhoneCall className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-50'
    },
    { 
      title: 'Pending', 
      value: stats.pending_contacts, 
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50'
    },
    { 
      title: 'Follow-ups', 
      value: stats.scheduled_followups, 
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50'
    }
  ];

  const sidebarLinks = [
    { icon: <Home className="w-5 h-5" />, label: 'Overview', tab: 'overview' },
    { icon: <Users className="w-5 h-5" />, label: 'Contacts', tab: 'contacts' },
    { icon: <Phone className="w-5 h-5" />, label: 'Call Logs', tab: 'calls' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', tab: 'schedule' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden lg:block" data-testid="sidebar">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <Droplets className="w-8 h-8 text-sky-500" />
            <span className="font-bold text-xl text-slate-900">Crystal Clear</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => setActiveTab(link.tab)}
              className={`w-full sidebar-link ${activeTab === link.tab ? 'active' : ''}`}
              data-testid={`sidebar-${link.tab}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <Link to="/" className="sidebar-link text-slate-500 hover:text-slate-900">
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm">Manage your window washing leads</p>
            </div>
            <Button 
              onClick={fetchData} 
              variant="outline" 
              className="gap-2"
              data-testid="refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden px-4 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="calls">Calls</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm" data-testid={`stat-card-${index}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Contacts */}
              <Card className="border-0 shadow-sm" data-testid="recent-contacts-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Contacts</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('contacts')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {contacts.slice(0, 5).map((contact) => (
                      <div 
                        key={contact.id} 
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{contact.name}</p>
                            <p className="text-sm text-slate-500">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(contact.status)}
                          {contact.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-sky-500 hover:bg-sky-600 h-8"
                              onClick={() => initiateCall(contact.id)}
                              disabled={initiatingCall === contact.id}
                              data-testid={`call-btn-${contact.id}`}
                            >
                              {initiatingCall === contact.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No contacts yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Calls */}
              <Card className="border-0 shadow-sm" data-testid="recent-calls-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('calls')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {callLogs.slice(0, 5).map((call) => (
                      <div 
                        key={call.id} 
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 -mx-4 px-4 transition-colors"
                        onClick={() => setSelectedCall(call)}
                        data-testid={`call-log-${call.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{call.contact_name}</p>
                            <p className="text-sm text-slate-500">{call.duration_seconds}s • {formatDate(call.created_at)}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    ))}
                    {callLogs.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Phone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No calls made yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'contacts' && (
            <Card className="border-0 shadow-sm" data-testid="contacts-list-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">All Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900">{contact.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{contact.email}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-sm">{contact.phone}</td>
                          <td className="py-3 px-4">{getStatusBadge(contact.status)}</td>
                          <td className="py-3 px-4 text-slate-500 text-sm">{formatDate(contact.created_at)}</td>
                          <td className="py-3 px-4">
                            {contact.status === 'pending' && (
                              <Button 
                                size="sm" 
                                className="bg-sky-500 hover:bg-sky-600 gap-1"
                                onClick={() => initiateCall(contact.id)}
                                disabled={initiatingCall === contact.id}
                                data-testid={`table-call-btn-${contact.id}`}
                              >
                                {initiatingCall === contact.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Phone className="w-4 h-4" />
                                    Call
                                  </>
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contacts.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No contacts yet. Share your form to start collecting leads!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'calls' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm" data-testid="call-logs-list">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Call History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {callLogs.map((call) => (
                      <div 
                        key={call.id} 
                        className={`flex items-center justify-between py-4 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 -mx-4 px-4 transition-colors ${selectedCall?.id === call.id ? 'bg-sky-50' : ''}`}
                        onClick={() => setSelectedCall(call)}
                        data-testid={`call-history-${call.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{call.contact_name}</p>
                            <p className="text-sm text-slate-500">{call.contact_phone}</p>
                            <p className="text-xs text-slate-400">{call.duration_seconds}s • {formatDate(call.created_at)}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    ))}
                    {callLogs.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Phone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No calls made yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Call Detail Panel */}
              <CallLogDetail call={selectedCall} />
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm lg:col-span-1" data-testid="calendar-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm lg:col-span-2" data-testid="scheduled-events-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Scheduled Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {scheduledEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0"
                        data-testid={`event-${event.id}`}
                      >
                        <div className="w-14 h-14 rounded-lg bg-purple-50 flex flex-col items-center justify-center">
                          <span className="text-xs text-purple-600 font-medium">
                            {new Date(event.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-purple-700">
                            {new Date(event.scheduled_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{event.title}</p>
                          <p className="text-sm text-slate-500">{event.contact_name}</p>
                          <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(event.scheduled_date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {event.event_type}
                        </Badge>
                      </div>
                    ))}
                    {scheduledEvents.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No scheduled follow-ups yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Call Detail Modal for Mobile */}
      {selectedCall && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold">Call Details</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCall(null)}
              >
                Close
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <CallLogDetail call={selectedCall} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
