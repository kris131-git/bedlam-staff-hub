
import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User, Attendee, ProgrammeEvent, StaffShift, VolunteerShift, Accommodation, Product, Transaction, CartItem, PaymentMethod, BulletinMessage, UserRole, AccommodationType, BulletinReply } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

// Helper for password hashing
async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<ProgrammeEvent[]>([]);
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  
  // Till State
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Bulletin State
  const [bulletins, setBulletins] = useState<BulletinMessage[]>([]);

  // Fetch Initial Data from Supabase
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setConnectionError(null);
    try {
        const [
            usersRes, 
            attendeesRes, 
            eventsRes, 
            staffRes, 
            volRes, 
            accRes, 
            prodRes, 
            transRes, 
            bullRes
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('attendees').select('*'),
            supabase.from('events').select('*'),
            supabase.from('staff_shifts').select('*'),
            supabase.from('volunteer_shifts').select('*'),
            supabase.from('accommodations').select('*'),
            supabase.from('products').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('bulletins').select('*')
        ]);

        if (usersRes.error) throw usersRes.error;
        if (attendeesRes.error) throw attendeesRes.error;
        
        // Handle Users (and auto-seed if empty)
        let loadedUsers = usersRes.data || [];
        if (loadedUsers.length === 0) {
            console.log("Database appears empty. Seeding default Admin user...");
            const defaultAdmin = {
                username: 'Admin',
                password: 'Admin', // Initial seed is plain text, change immediately
                role: UserRole.Admin
            };
            const { error: seedError } = await supabase.from('users').insert(defaultAdmin);
            
            if (!seedError) {
                console.log("Default Admin created successfully.");
                loadedUsers = [defaultAdmin as any];
            } else {
                console.error("Failed to seed default admin:", seedError);
            }
        }
        setUsers(loadedUsers);

        setAttendees(attendeesRes.data || []);
        setEvents(eventsRes.data || []);
        setStaffShifts(staffRes.data || []);
        setVolunteerShifts(volRes.data || []);
        
        // Handle Accommodations (Seed if empty)
        let loadedAccommodations = accRes.data || [];
        if (loadedAccommodations.length === 0) {
            console.log("Seeding default accommodations...");
            const seedAccs = [
                { id: uuidv4(), name: 'Yurt 1', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
                { id: uuidv4(), name: 'Yurt 2', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
                { id: uuidv4(), name: 'Bottom Yurt', type: AccommodationType.Yurt, capacity: 4, attendeeIds: [] },
                { id: uuidv4(), name: 'Caravan', type: AccommodationType.Caravan, capacity: 2, attendeeIds: [] },
            ];
            const { error: seedError } = await supabase.from('accommodations').insert(seedAccs);
            if (!seedError) {
                loadedAccommodations = seedAccs;
            }
        }
        setAccommodations(loadedAccommodations);

        setProducts(prodRes.data || []);
        setTransactions(transRes.data || []);
        setBulletins(bullRes.data || []);

    } catch (error: any) {
        console.error("Error fetching data from Supabase:", error);
        setConnectionError("Could not connect to the database. Please check your API Keys and ensure you have run the setup SQL script.");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Check local storage for session
  useEffect(() => {
    const savedUser = localStorage.getItem('bedlam_currentUser');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setIsLoggedIn(true);
        } catch (e) {
            console.error("Failed to restore session");
        }
    }
  }, []);

  const handleLogin = useCallback(async (username: string, password: string): Promise<string | null> => {
    // 1. Try to find user by username
    const { data: userFound, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !userFound) {
        return 'Invalid username or password.';
    }

    // 2. Check password (support both plain text for legacy and hash for new)
    let isValid = false;
    if (userFound.password === password) {
        isValid = true;
    } else {
        const hashed = await hashPassword(password);
        if (userFound.password === hashed) {
            isValid = true;
        }
    }

    if (isValid) {
      setIsLoggedIn(true);
      setUser(userFound);
      localStorage.setItem('bedlam_currentUser', JSON.stringify(userFound));
      return null;
    }
    return 'Invalid username or password.';
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('bedlam_currentUser');
  }, []);

  // --- Data Mutators ---

  // User Management (Now with Hashing)
  const handleCreateUser = useCallback(async (newUser: User) => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }
    
    const hashedPassword = await hashPassword(newUser.password);
    const userToSave = { ...newUser, password: hashedPassword };

    setUsers(prev => [...prev, userToSave]);
    await supabase.from('users').insert(userToSave);
    return { success: true };
  }, [users]);

  const handleUpdateUser = useCallback(async (updatedUser: User) => {
    // Check if password was changed (simple check: if it's not same as existing in state)
    const existing = users.find(u => u.username === updatedUser.username);
    let userToSave = { ...updatedUser };
    
    // If password has changed (and it's not already hashed length approx), hash it.
    // This logic assumes if you type a short password it needs hashing. 
    if (existing && updatedUser.password !== existing.password) {
        userToSave.password = await hashPassword(updatedUser.password);
    }

    setUsers(prev => prev.map(u => u.username === userToSave.username ? userToSave : u));
    await supabase.from('users').update(userToSave).eq('username', userToSave.username);
    return { success: true };
  }, [users]);

  const handleDeleteUser = useCallback(async (username: string) => {
    setUsers(prev => prev.filter(u => u.username !== username));
    await supabase.from('users').delete().eq('username', username);
  }, []);

  // Attendee Handlers
  const handleCreateAttendee = async (attendee: Omit<Attendee, 'id'>) => {
      const newId = uuidv4();
      const newAttendee = { ...attendee, id: newId };
      setAttendees(prev => [...prev, newAttendee]);
      await supabase.from('attendees').insert(newAttendee);
  };
  const handleUpdateAttendee = async (updated: Attendee) => {
      setAttendees(prev => prev.map(a => a.id === updated.id ? updated : a));
      await supabase.from('attendees').update(updated).eq('id', updated.id);
  };
  const handleDeleteAttendee = async (id: string) => {
      setAttendees(prev => prev.filter(a => a.id !== id));
      setAccommodations(prev => prev.map(acc => ({
          ...acc,
          attendeeIds: acc.attendeeIds.filter(attendeeId => attendeeId !== id)
      })));
      await supabase.from('attendees').delete().eq('id', id);
  };
  const handleCheckInAttendee = async (id: string) => {
    const time = new Date().toISOString();
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, checkInTime: time } : a));
    await supabase.from('attendees').update({ checkInTime: time }).eq('id', id);
  };
  const handleUncheckInAttendee = async (id: string) => {
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, checkInTime: undefined } : a));
      await supabase.from('attendees').update({ checkInTime: null }).eq('id', id);
  };

  // Event Handlers
  const handleCreateEvent = async (event: Omit<ProgrammeEvent, 'id'>) => {
      const newEvent = { ...event, id: uuidv4() };
      setEvents(prev => [...prev, newEvent]);
      await supabase.from('events').insert(newEvent);
  };
  const handleUpdateEvent = async (updated: ProgrammeEvent) => {
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      await supabase.from('events').update(updated).eq('id', updated.id);
  };
  const handleDeleteEvent = async (id: string) => {
      setEvents(prev => prev.filter(e => e.id !== id));
      await supabase.from('events').delete().eq('id', id);
  };

  // Staff Shift Handlers
  const handleCreateStaffShift = async (shift: Omit<StaffShift, 'id'>) => {
      const newShift = { ...shift, id: uuidv4() };
      setStaffShifts(prev => [...prev, newShift]);
      await supabase.from('staff_shifts').insert(newShift);
  };
  const handleUpdateStaffShift = async (updated: StaffShift) => {
      setStaffShifts(prev => prev.map(s => s.id === updated.id ? updated : s));
      await supabase.from('staff_shifts').update(updated).eq('id', updated.id);
  };
  const handleDeleteStaffShift = async (id: string) => {
      setStaffShifts(prev => prev.filter(s => s.id !== id));
      await supabase.from('staff_shifts').delete().eq('id', id);
  };

  // Volunteer Shift Handlers
  const handleCreateVolunteerShift = async (shift: Omit<VolunteerShift, 'id'>) => {
      const newShift = { ...shift, id: uuidv4() };
      setVolunteerShifts(prev => [...prev, newShift]);
      await supabase.from('volunteer_shifts').insert(newShift);
  };
  const handleUpdateVolunteerShift = async (updated: VolunteerShift) => {
      setVolunteerShifts(prev => prev.map(v => v.id === updated.id ? updated : v));
      await supabase.from('volunteer_shifts').update(updated).eq('id', updated.id);
  };
  const handleDeleteVolunteerShift = async (id: string) => {
      setVolunteerShifts(prev => prev.filter(v => v.id !== id));
      await supabase.from('volunteer_shifts').delete().eq('id', id);
  };

  // Accommodation Handlers
  const handleAssignAttendeeToAccommodation = async (accommodationId: string, attendeeId: string) => {
    let updatedAccommodations = [...accommodations];
    
    // Remove from others
    updatedAccommodations = updatedAccommodations.map(acc => {
        if (acc.attendeeIds.includes(attendeeId)) {
             return { ...acc, attendeeIds: acc.attendeeIds.filter(id => id !== attendeeId) };
        }
        return acc;
    });

    // Add to new
    updatedAccommodations = updatedAccommodations.map(acc => {
        if (acc.id === accommodationId) {
             return { ...acc, attendeeIds: [...acc.attendeeIds, attendeeId] };
        }
        return acc;
    });

    setAccommodations(updatedAccommodations);
    for (const acc of updatedAccommodations) {
        await supabase.from('accommodations').update({ attendeeIds: acc.attendeeIds }).eq('id', acc.id);
    }
  };

  const handleRemoveAttendeeFromAccommodation = async (accommodationId: string, attendeeId: string) => {
      const acc = accommodations.find(a => a.id === accommodationId);
      if (!acc) return;
      const newIds = acc.attendeeIds.filter(id => id !== attendeeId);
      
      setAccommodations(prev => prev.map(a => a.id === accommodationId ? { ...a, attendeeIds: newIds } : a));
      await supabase.from('accommodations').update({ attendeeIds: newIds }).eq('id', accommodationId);
  };
  
  // Till Handlers
  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: uuidv4() };
    setProducts(prev => [...prev, newProduct]);
    await supabase.from('products').insert(newProduct);
  };

  const handleProcessTransaction = async (items: CartItem[], total: number, method: PaymentMethod) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      items: items,
      total: total,
      method: method
    };
    setTransactions(prev => [...prev, newTransaction]);
    await supabase.from('transactions').insert(newTransaction);
  };
  
  // Bulletin Handlers
  const handleCreateBulletin = async (msg: Omit<BulletinMessage, 'id' | 'timestamp'>) => {
      const newBulletin = { ...msg, id: uuidv4(), timestamp: new Date().toISOString(), likes: [], replies: [] };
      setBulletins(prev => [newBulletin, ...prev]);
      await supabase.from('bulletins').insert(newBulletin);
  };

  const handleDeleteBulletin = async (id: string) => {
      setBulletins(prev => prev.filter(b => b.id !== id));
      await supabase.from('bulletins').delete().eq('id', id);
  };

  const handleLikeBulletin = async (bulletinId: string, username: string) => {
    const bulletin = bulletins.find(b => b.id === bulletinId);
    if (!bulletin) return;
    const currentLikes = bulletin.likes || [];
    let newLikes;
    if (currentLikes.includes(username)) {
        newLikes = currentLikes.filter(u => u !== username);
    } else {
        newLikes = [...currentLikes, username];
    }
    setBulletins(prev => prev.map(b => b.id === bulletinId ? { ...b, likes: newLikes } : b));
    await supabase.from('bulletins').update({ likes: newLikes }).eq('id', bulletinId);
  };

  const handleReplyBulletin = async (bulletinId: string, reply: Omit<BulletinReply, 'id' | 'timestamp'>) => {
    const newReply: BulletinReply = { ...reply, id: uuidv4(), timestamp: new Date().toISOString() };
    const bulletin = bulletins.find(b => b.id === bulletinId);
    if (!bulletin) return;
    const newReplies = [...(bulletin.replies || []), newReply];
    
    setBulletins(prev => prev.map(b => b.id === bulletinId ? { ...b, replies: newReplies } : b));
    await supabase.from('bulletins').update({ replies: newReplies }).eq('id', bulletinId);
  };

  if (loading) {
      return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mr-4"></div>
          Loading Bedlam Ball Hub...
      </div>;
  }

  if (connectionError) {
      return <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
          <div className="bg-dark-card p-6 rounded-lg shadow-xl max-w-lg text-center border border-red-500/50">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h2>
              <p className="text-white mb-4">{connectionError}</p>
              <button onClick={fetchAllData} className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary">Retry Connection</button>
          </div>
      </div>;
  }

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
          onLikeBulletin={handleLikeBulletin}
          onReplyBulletin={handleReplyBulletin}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
