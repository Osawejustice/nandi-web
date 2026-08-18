"use client";

import { PhoneCall, MessageSquare, Clock, ArrowUpRight, ArrowDownRight, Users, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Calls Today', value: '142', change: '+12%', isPositive: true, icon: PhoneCall, color: 'text-channelVoice', bg: 'bg-channelVoiceSoft' },
    { name: 'Open Conversations', value: '28', change: '-5%', isPositive: false, icon: MessageSquare, color: 'text-channelSMS', bg: 'bg-channelSMSSoft' },
    { name: 'Avg. Response Time', value: '1m 24s', change: '+18%', isPositive: true, icon: Clock, color: 'text-channelWhatsApp', bg: 'bg-channelWhatsAppSoft' },
    { name: 'Active Agents', value: '12/15', change: '0%', isPositive: true, icon: Users, color: 'text-channelTelegram', bg: 'bg-channelTelegramSoft' },
  ];

  const recentCalls = [
    { id: 1, contact: 'Sarah Jenkins', number: '+1 (555) 019-2834', time: '2 mins ago', duration: '4m 12s', status: 'completed' },
    { id: 2, contact: 'Michael Chen', number: '+1 (555) 012-9931', time: '15 mins ago', duration: '12m 05s', status: 'completed' },
    { id: 3, contact: 'Unknown Caller', number: '+1 (555) 088-1123', time: '1 hour ago', duration: '0m 45s', status: 'missed' },
    { id: 4, contact: 'Emma Watson', number: '+1 (555) 099-8877', time: '2 hours ago', duration: '8m 30s', status: 'completed' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textMain tracking-tight">Overview</h2>
          <p className="text-textMuted text-sm">Welcome back, John! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface border border-border rounded-full text-sm font-medium hover:bg-soft shadow-sm transition-all">
            Export Report
          </button>
          <button className="px-4 py-2 bg-accent text-white rounded-full text-sm font-medium shadow-lift hover:shadow-float hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
            <PhoneCall size={16} />
            Make a Call
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-liveSoft text-live' : 'bg-muted/20 text-textMuted'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-textMuted font-medium text-sm mb-1">{stat.name}</h3>
              <p className="text-3xl font-bold text-textMain tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 p-6 bg-surface border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-textMain">Recent Calls</h3>
            <button className="text-sm text-brand font-medium hover:underline">View all</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-textMuted uppercase bg-background rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Contact</th>
                  <th className="px-4 py-3 font-semibold">Number</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => (
                  <tr key={call.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brandSoft text-brand flex items-center justify-center font-bold text-xs">
                          {call.contact.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-textMain">{call.contact}</p>
                          <p className="text-xs text-textMuted capitalize">{call.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-textMuted font-mono text-xs">{call.number}</td>
                    <td className="px-4 py-4 text-textMain font-medium">{call.duration}</td>
                    <td className="px-4 py-4 text-textMuted">{call.time}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 text-brand hover:bg-brand/10 rounded-full transition-colors" title="Play Recording">
                        <PlayCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Team */}
        <div className="p-6 bg-surface border border-border rounded-xl shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-textMain mb-6">Team Status</h3>
          <div className="space-y-5 flex-1">
            {[
              { name: 'John Doe', status: 'Available', color: 'bg-live' },
              { name: 'Sarah Jenkins', status: 'On Call', color: 'bg-accent' },
              { name: 'Michael Chen', status: 'Offline', color: 'bg-textFaint' },
              { name: 'Emma Watson', status: 'Wrap-up', color: 'bg-accentSoft' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-textMuted font-bold text-sm">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface rounded-full ${agent.color}`}></span>
                  </div>
                  <div>
                    <p className="font-medium text-textMain text-sm">{agent.name}</p>
                    <p className="text-xs text-textMuted">{agent.status}</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-brand hover:bg-brand/10 px-3 py-1.5 rounded-full transition-colors">
                  Message
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-border rounded-full text-sm font-medium hover:bg-soft transition-colors">
            Manage Team
          </button>
        </div>
      </div>
    </div>
  );
}
