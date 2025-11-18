
import React, { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User, Attendee, ProgrammeEvent, StaffShift, VolunteerShift, Accommodation, Product, Transaction, CartItem, PaymentMethod, BulletinMessage } from './types';
import { MOCK_USERS, MOCK_ATTENDEES, MOCK_EVENTS, MOCK_STAFF_SHIFTS, MOCK_VOLUNTEER_SHIFTS, MOCK_ACCOMMODATIONS, MOCK_PRODUCTS, MOCK_BULLETINS } from './constants';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Centralize all data state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [attendees, setAttendees] = useState<Attendee[]>(MOCK_ATTENDEES);
  const [events, setEvents] = useState<ProgrammeEvent[]>(MOCK_EVENTS);
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>(MOCK_STAFF_SHIFTS);
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>(MOCK_VOLUNTEER_SHIFTS);
  const [accommodations, setAccommodations] = useState<Accommodation[]>(MOCK_ACCOMMODATIONS);
  
  // Till State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Bulletin State
  const [bulletins, setBulletins] = useState<BulletinMessage[]>(MOCK_BULLETINS);


  const handleLogin = useCallback((username: string, password: string): string | null => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setIsLoggedIn(true);
      setUser(foundUser);
      return null;
    }
    return 'Invalid username or password.';
  }, [users]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // User Management Handlers
  const handleCreateUser = useCallback((newUser: User): { success: boolean, message?: string } => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true };
  }, [users]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
    return { success: true };
  }, []);

  const handleDeleteUser = useCallback((username: string) => {
    setUsers(prev => prev.filter(u => u.username !== username));
  }, []);


  // Attendee Handlers
  const handleCreateAttendee = (attendee: Omit<Attendee, 'id'>) => setAttendees(prev => [...prev, { ...attendee, id: uuidv4() }]);
  const handleUpdateAttendee = (updated: Attendee) => setAttendees(prev => prev.map(a => a.id === updated.id ? updated : a));
  const handleDeleteAttendee = (id: string) => {
      setAttendees(prev => prev.filter(a => a.id !== id));
      // Also remove from accommodation if deleted
      setAccommodations(prev => prev.map(acc => ({
          ...acc,
          attendeeIds: acc.attendeeIds.filter(attendeeId => attendeeId !== id)
      })));
  };
  const handleCheckInAttendee = (id: string) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, checkInTime: new Date().toISOString() } : a));
  };
  const handleUncheckInAttendee = (id: string) => {
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, checkInTime: undefined } : a));
  };

  // Event Handlers
  const handleCreateEvent = (event: Omit<ProgrammeEvent, 'id'>) => setEvents(prev => [...prev, { ...event, id: uuidv4() }]);
  const handleUpdateEvent = (updated: ProgrammeEvent) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  const handleDeleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  // Staff Shift Handlers
  const handleCreateStaffShift = (shift: Omit<StaffShift, 'id'>) => setStaffShifts(prev => [...prev, { ...shift, id: uuidv4() }]);
  const handleUpdateStaffShift = (updated: StaffShift) => setStaffShifts(prev => prev.map(s => s.id === updated.id ? updated : s));
  const handleDeleteStaffShift = (id: string) => setStaffShifts(prev => prev.filter(s => s.id !== id));

  // Volunteer Shift Handlers
  const handleCreateVolunteerShift = (shift: Omit<VolunteerShift, 'id'>) => setVolunteerShifts(prev => [...prev, { ...shift, id: uuidv4() }]);
  const handleUpdateVolunteerShift = (updated: VolunteerShift) => setVolunteerShifts(prev => prev.map(v => v.id === updated.id ? updated : v));
  const handleDeleteVolunteerShift = (id: string) => setVolunteerShifts(prev => prev.filter(v => v.id !== id));

  // Accommodation Handlers
  const handleAssignAttendeeToAccommodation = (accommodationId: string, attendeeId: string) => {
    setAccommodations(prev => prev.map(acc => {
        if (acc.id === accommodationId) {
            if (acc.attendeeIds.includes(attendeeId)) return acc; // Already in this one
            return { ...acc, attendeeIds: [...acc.attendeeIds, attendeeId] };
        }
        // Remove from others if moving
        if (acc.attendeeIds.includes(attendeeId)) {
             return { ...acc, attendeeIds: acc.attendeeIds.filter(id => id !== attendeeId) };
        }
        return acc;
    }));
  };

  const handleRemoveAttendeeFromAccommodation = (accommodationId: string, attendeeId: string) => {
      setAccommodations(prev => prev.map(acc => {
          if (acc.id === accommodationId) {
              return { ...acc, attendeeIds: acc.attendeeIds.filter(id => id !== attendeeId) };
          }
          return acc;
      }));
  };
  
  // Till Handlers
  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: uuidv4() }]);
  };

  const handleProcessTransaction = (items: CartItem[], total: number, method: PaymentMethod) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      items: items,
      total: total,
      method: method
    };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  // Bulletin Handlers
  const handleCreateBulletin = (msg: Omit<BulletinMessage, 'id' | 'timestamp'>) => {
      setBulletins(prev => [{ ...msg, id: uuidv4(), timestamp: new Date().toISOString() }, ...prev]);
  };

  const handleDeleteBulletin = (id: string) => {
      setBulletins(prev => prev.filter(b => b.id !== id));
  };


  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
      {isLoggedIn && user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          
          users={users} 
          onCreateUser={handleCreateUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}

          attendees={attendees}
          onCreateAttendee={handleCreateAttendee}
          onUpdateAttendee={handleUpdateAttendee}
          onDeleteAttendee={handleDeleteAttendee}
          onCheckInAttendee={handleCheckInAttendee}
          onUncheckInAttendee={handleUncheckInAttendee}

          events={events}
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}

          staffShifts={staffShifts}
          onCreateStaffShift={handleCreateStaffShift}
          onUpdateStaffShift={handleUpdateStaffShift}
          onDeleteStaffShift={handleDeleteStaffShift}

          volunteerShifts={volunteerShifts}
          onCreateVolunteerShift={handleCreateVolunteerShift}
          onUpdateVolunteerShift={handleUpdateVolunteerShift}
          onDeleteVolunteerShift={handleDeleteVolunteerShift}

          accommodations={accommodations}
          onAssignAccommodation={handleAssignAttendeeToAccommodation}
          onRemoveAccommodation={handleRemoveAttendeeFromAccommodation}

          products={products}
          onAddProduct={handleAddProduct}
          transactions={transactions}
          onProcessTransaction={handleProcessTransaction}

          bulletins={bulletins}
          onCreateBulletin={handleCreateBulletin}
          onDeleteBulletin={handleDeleteBulletin}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
