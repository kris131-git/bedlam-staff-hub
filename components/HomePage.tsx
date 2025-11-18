
import React, { useState, useEffect, useRef } from 'react';
import { User, BulletinMessage, Attendee, ProgrammeEvent, StaffShift, VolunteerShift, Transaction } from '../types';
import { DeleteIcon } from './icons/DeleteIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BellIcon } from './icons/BellIcon';
import { SearchIcon } from './icons/SearchIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { EditIcon } from './icons/EditIcon';

interface HomePageProps {
    user: User;
    users: User[]; // For recipient selection
    attendees: Attendee[];
    events: ProgrammeEvent[];
    staffShifts: StaffShift[];
    volunteerShifts: VolunteerShift[];
    transactions: Transaction[];
    bulletins: BulletinMessage[];
    onCreateBulletin: (msg: Omit<BulletinMessage, 'id' | 'timestamp'>) => void;
    onDeleteBulletin: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
    user, users, attendees, events, staffShifts, volunteerShifts, transactions, bulletins, onCreateBulletin, onDeleteBulletin 
}) => {
    // Layout Order State
    const [widgetOrder, setWidgetOrder] = useState<string[]>(['stats', 'timetable', 'upcoming', 'bulletin']);
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    
    // Drag and Drop State
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Bulletin Form State
    const [newBulletinContent, setNewBulletinContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);

    // Stats Calculation
    const totalAttendees = attendees.length;
    const checkedInAttendees = attendees.filter(a => a.checkInTime).length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

    // My Timetable Logic
    const getCurrentUserAttendeeId = () => {
        const match = attendees.find(a => a.name.toLowerCase().includes(user.username.toLowerCase()));
        return match?.id;
    };
    const myId = getCurrentUserAttendeeId();
    
    const myShifts = [
        ...staffShifts.filter(s => s.attendeeIds.includes(myId || '')).map(s => ({ ...s, type: 'Staff' })),
        ...volunteerShifts.filter(v => v.attendeeIds.includes(myId || '')).map(v => ({ ...v, type: 'Volunteer' }))
    ].sort((a, b) => {
        const days = { 'Friday': 1, 'Saturday': 2, 'Sunday': 3 };
        const dayDiff = (days[a.day as keyof typeof days] || 4) - (days[b.day as keyof typeof days] || 4);
        if (dayDiff !== 0) return dayDiff;
        return a.time.localeCompare(b.time);
    });

    // Upcoming Main Stage Events
    const upcomingEvents = events
        .filter(e => e.stage === 'Main Stage')
        .sort((a, b) => {
            const days = { 'Friday': 1, 'Saturday': 2, 'Sunday': 3 };
            const dayDiff = (days[a.day as keyof typeof days] || 4) - (days[b.day as keyof typeof days] || 4);
            if (dayDiff !== 0) return dayDiff;
            return a.time.localeCompare(b.time);
        })
        .slice(0, 3);

    // Bulletin Filtering
    const visibleBulletins = bulletins.filter(b => {
        const audience = b.audience || [];
        // Show if:
        // 1. Audience includes '(All)'
        // 2. Audience includes '(Staff)' and user is Admin or Staff
        // 3. Audience includes '(Volunteers)' and... well we don't have volunteer login, but let's keep the logic open.
        // 4. Audience explicitly includes the username
        if (audience.includes('(All)')) return true;
        if (audience.includes('(Staff)') && (user.role === 'Staff' || user.role === 'Admin')) return true;
        // If user was a volunteer (not in UserRole yet, but for completeness)
        if (audience.includes('(Volunteers)') && user.role.toString() === 'Volunteer') return true;
        if (audience.includes(user.username)) return true;
        // Author always sees their own posts
        if (b.author === user.username) return true;
        return false;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Notification Logic: Check if user is specifically tagged
    const myNotifications = visibleBulletins.filter(b => 
        b.audience.includes(user.username) && b.author !== user.username
    );

    const handlePostBulletin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBulletinContent.trim()) return;
        
        // Default to (All) if nothing selected
        const audience = selectedRecipients.length > 0 ? selectedRecipients : ['(All)'];

        onCreateBulletin({
            author: user.username,
            content: newBulletinContent,
            audience: audience
        });
        setNewBulletinContent('');
        setSelectedRecipients([]);
        setIsRecipientDropdownOpen(false);
    };

    const toggleRecipient = (val: string) => {
        setSelectedRecipients(prev => {
            if (prev.includes(val)) return prev.filter(i => i !== val);
            return [...prev, val];
        });
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        // e.dataTransfer.effectAllowed = "move"; // Optional visual
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const copyListItems = [...widgetOrder];
            const dragItemContent = copyListItems[dragItem.current];
            copyListItems.splice(dragItem.current, 1);
            copyListItems.splice(dragOverItem.current, 0, dragItemContent);
            setWidgetOrder(copyListItems);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const renderWidget = (id: string, index: number) => {
        const isDraggable = isEditingLayout;
        const dragProps = isDraggable ? {
            draggable: true,
            onDragStart: (e: any) => handleDragStart(e, index),
            onDragEnter: (e: any) => handleDragEnter(e, index),
            onDragEnd: handleDragEnd,
            onDragOver: (e: any) => e.preventDefault(),
        } : {};

        const dragClasses = isDraggable ? "cursor-move ring-2 ring-offset-2 ring-offset-dark-bg ring-brand-primary/50 hover:ring-brand-primary" : "";

        switch (id) {
            case 'stats':
                return (
                    <div key="stats" {...dragProps} className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all ${dragClasses}`}>
                        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow flex items-center space-x-4 relative">
                             {isDraggable && <div className="absolute top-2 right-2 text-brand-primary"><DragHandleIcon /></div>}
                            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                <UserGroupIcon />
                            </div>
                            <div>
                                <p className="text-sm text-dark-text-secondary">Attendees Checked In</p>
                                <p className="text-2xl font-bold text-white">{checkedInAttendees} <span className="text-sm text-gray-500 font-normal">/ {totalAttendees}</span></p>
                            </div>
                        </div>
                        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow flex items-center space-x-4 relative">
                             {isDraggable && <div className="absolute top-2 right-2 text-brand-primary"><DragHandleIcon /></div>}
                            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                                <CurrencyDollarIcon />
                            </div>
                            <div>
                                <p className="text-sm text-dark-text-secondary">Total Bar Revenue</p>
                                <p className="text-2xl font-bold text-white">£{totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow flex items-center space-x-4 relative">
                             {isDraggable && <div className="absolute top-2 right-2 text-brand-primary"><DragHandleIcon /></div>}
                            <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                                <CalendarDaysIcon />
                            </div>
                            <div>
                                <p className="text-sm text-dark-text-secondary">Main Stage Events</p>
                                <p className="text-2xl font-bold text-white">{events.filter(e => e.stage === 'Main Stage').length}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'timetable':
                return (
                    <div key="timetable" {...dragProps} className={`bg-dark-card rounded-xl border border-dark-border shadow overflow-hidden flex flex-col h-full relative ${dragClasses}`}>
                         {isDraggable && <div className="absolute top-2 right-2 text-brand-primary z-10"><DragHandleIcon /></div>}
                        <div className="p-4 border-b border-dark-border bg-gray-800/50">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <ClockIcon />
                                <span className="ml-2">My Upcoming Shifts</span>
                            </h2>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto max-h-80">
                            {myShifts.length === 0 ? (
                                <p className="text-dark-text-secondary text-center py-4">No shifts assigned to your profile.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {myShifts.map(shift => (
                                        <li key={shift.id} className="bg-gray-900 p-3 rounded-lg border border-dark-border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-brand-primary font-bold block">{shift.day} @ {shift.time}</span>
                                                    <span className="text-white block mt-1">{'role' in shift ? shift.role : shift.task}</span>
                                                    <span className="text-sm text-dark-text-secondary block">{shift.locations.join(', ')}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${shift.type === 'Staff' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                    {shift.type}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            case 'upcoming':
                return (
                     <div key="upcoming" {...dragProps} className={`bg-dark-card rounded-xl border border-dark-border shadow overflow-hidden flex flex-col h-full relative ${dragClasses}`}>
                         {isDraggable && <div className="absolute top-2 right-2 text-brand-primary z-10"><DragHandleIcon /></div>}
                        <div className="p-4 border-b border-dark-border bg-gray-800/50">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <CalendarDaysIcon />
                                <span className="ml-2">Next on Main Stage</span>
                            </h2>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto max-h-80">
                            {upcomingEvents.length === 0 ? (
                                 <p className="text-dark-text-secondary text-center py-4">No upcoming events.</p>
                            ) : (
                                 <ul className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <li key={event.id} className="bg-gray-900 p-3 rounded-lg border border-dark-border flex justify-between items-center">
                                            <div>
                                                <span className="text-purple-400 font-bold block">{event.day} @ {event.time}</span>
                                                <span className="text-white font-medium block text-lg">{event.eventName}</span>
                                                <span className="text-sm text-dark-text-secondary block">{event.details}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            case 'bulletin':
                const potentialRecipients = [
                    '(All)',
                    '(Staff)',
                    '(Volunteers)',
                    ...users.map(u => u.username)
                ].filter(r => r.toLowerCase().includes(recipientSearch.toLowerCase()));

                return (
                    <div key="bulletin" {...dragProps} className={`bg-dark-card rounded-xl border border-dark-border shadow overflow-hidden relative ${dragClasses}`}>
                         {isDraggable && <div className="absolute top-2 right-2 text-brand-primary z-10"><DragHandleIcon /></div>}
                         <div className="p-4 border-b border-dark-border bg-gray-800/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">Bulletin Board</h2>
                        </div>
                        
                        {/* Notification Area */}
                        {myNotifications.length > 0 && (
                             <div className="bg-brand-primary/10 border-b border-brand-primary/20 p-3 flex items-center text-brand-primary">
                                <BellIcon />
                                <span className="ml-2 text-sm font-medium">You have {myNotifications.length} new mention{myNotifications.length !== 1 ? 's' : ''}!</span>
                            </div>
                        )}

                        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Message List */}
                            <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {visibleBulletins.length === 0 ? (
                                     <p className="text-dark-text-secondary text-center italic">No messages found.</p>
                                ) : (
                                    visibleBulletins.map(msg => {
                                        const isForMe = msg.audience.includes(user.username);
                                        return (
                                            <div key={msg.id} className={`p-4 rounded-lg border relative group ${isForMe ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-gray-900 border-dark-border'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-bold text-brand-primary">{msg.author}</span>
                                                        <span className="text-xs text-dark-text-secondary">• {formatTime(msg.timestamp)}</span>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {msg.audience.map((aud, i) => (
                                                                <span key={i} className={`text-xs px-2 py-0.5 rounded ${aud === user.username ? 'bg-brand-primary text-white font-bold' : 'bg-gray-700 text-gray-300'}`}>
                                                                    {aud}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {(user.role === 'Admin' || msg.author === user.username) && (
                                                        <button onClick={() => onDeleteBulletin(msg.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DeleteIcon />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add Message Form */}
                            <div className="bg-gray-800/30 p-4 rounded-lg border border-dark-border h-fit sticky top-0">
                                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Post a Message</h3>
                                <form onSubmit={handlePostBulletin} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-dark-text-secondary mb-1">Message</label>
                                        <textarea 
                                            rows={4}
                                            value={newBulletinContent}
                                            onChange={e => setNewBulletinContent(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary text-sm"
                                            placeholder="Type your message here..."
                                            required
                                        />
                                    </div>
                                     <div className="relative">
                                        <label className="block text-xs font-medium text-dark-text-secondary mb-1">Recipients</label>
                                        <div 
                                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus-within:ring-1 focus-within:ring-brand-primary cursor-pointer min-h-[38px]"
                                            onClick={() => setIsRecipientDropdownOpen(!isRecipientDropdownOpen)}
                                        >
                                            {selectedRecipients.length === 0 ? (
                                                <span className="text-gray-500 text-sm">Select recipients (Default: All)</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedRecipients.map(r => (
                                                        <span key={r} className="text-xs bg-brand-primary px-1 rounded text-white">{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {isRecipientDropdownOpen && (
                                            <div className="absolute z-20 mt-1 w-full bg-dark-card border border-dark-border rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                                                <div className="p-2 border-b border-dark-border">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                            <SearchIcon />
                                                        </div>
                                                        <input 
                                                            autoFocus
                                                            type="text"
                                                            className="w-full pl-8 pr-2 py-1 bg-gray-900 border border-dark-border rounded text-sm text-white focus:outline-none focus:border-brand-primary"
                                                            placeholder="Search..."
                                                            value={recipientSearch}
                                                            onChange={e => setRecipientSearch(e.target.value)}
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="overflow-y-auto flex-1 p-1">
                                                    {potentialRecipients.map(option => (
                                                        <label key={option} className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer" onClick={e => e.stopPropagation()}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedRecipients.includes(option)} 
                                                                onChange={() => toggleRecipient(option)}
                                                                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-primary focus:ring-brand-secondary"
                                                            />
                                                            <span className="ml-2 text-sm text-white">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Click outside listener could be added here for robustness, but toggle works for simple UI */}
                                    </div>
                                    <button type="submit" className="w-full py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors text-sm">
                                        Post Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-dark-card p-6 rounded-xl border border-dark-border shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user.username}!</h1>
                    <p className="text-dark-text-secondary mt-2">Here is what is happening at Bedlam Ball today.</p>
                </div>
                <button 
                    onClick={() => setIsEditingLayout(!isEditingLayout)}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${isEditingLayout ? 'bg-brand-primary border-brand-primary text-white' : 'bg-transparent border-dark-border text-dark-text hover:text-white'}`}
                >
                    <EditIcon />
                    <span className="ml-2 font-medium">{isEditingLayout ? 'Done Editing' : 'Edit Layout'}</span>
                </button>
            </div>

            {isEditingLayout && (
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-blue-200 text-sm text-center animate-pulse">
                    Drag items to reorder your dashboard layout.
                 </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {widgetOrder.map((id, index) => {
                    const isFullWidth = id === 'stats' || id === 'bulletin';
                    return (
                        <div key={id} className={`${isFullWidth ? 'lg:col-span-2' : 'lg:col-span-1'} transition-all duration-300 ease-in-out`}>
                            {renderWidget(id, index)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomePage;
