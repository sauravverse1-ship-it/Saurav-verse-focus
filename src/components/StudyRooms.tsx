import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Lock, Unlock, Zap, MessageSquare, Play, Flame, Search, Plus, X, Send, Square, Target, Copy, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, arrayUnion, arrayRemove, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface StudyRoom {
  id: string;
  name: string;
  isPrivate: boolean;
  password?: string;
  mode: string;
  maxMembers: number;
  status: string;
  members: { 
    uid: string; 
    name: string; 
    isFocusing: boolean; 
    status: 'FOCUS' | 'REST' | 'AFK';
    totalSecondsToday: number;
    lastActive: number;
  }[];
  hostId: string;
  messages: { uid: string; name: string; text: string; timestamp: number | any }[];
  createdAt: number | any;
  timerTarget?: number | null; // Timestamp when timer ends
  timerDuration?: number; // Total duration in seconds
  timerState?: 'IDLE' | 'FOCUSING' | 'BREAK';
  sessionGoal?: string;
}

interface StudyRoomsProps {
  user: User | null;
  profile: UserProfile | null;
  onSocialAction?: () => void;
  onRoomStateChange?: (inRoom: boolean) => void;
  appIsRunning?: boolean;
  appTimerMode?: 'study' | 'break';
  onToggleLocalTimer?: () => void;
}

export const StudyRooms: React.FC<StudyRoomsProps> = ({ user, profile, onSocialAction, onRoomStateChange, appIsRunning, appTimerMode, onToggleLocalTimer }) => {
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomMode, setNewRoomMode] = useState('DEEP WORK');
  
  // Password prompt state
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [targetRoom, setTargetRoom] = useState<StudyRoom | null>(null);
  const [passwordError, setPasswordError] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ambientSounds = {
    'OFF': null,
    'RAINFALL': 'https://assets.mixkit.co/active_storage/sfx/139/139-preview.mp3', // Heavy rain
    'CABIN': 'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3', // Fireplace
    'CAFE': 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3', // Busy cafe
    'LIBRARY': 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3' // Quiet atmosphere
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      if (ambientSound) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [ambientSound]);

  const prevIsRunning = useRef(appIsRunning);
  const prevTimerMode = useRef(appTimerMode);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);

  useEffect(() => {
    if (appIsRunning !== prevIsRunning.current || appTimerMode !== prevTimerMode.current) {
      if (activeRoom && user && appIsRunning !== undefined) {
        if (appIsRunning) {
          updateMemberStatus(appTimerMode === 'study' ? 'FOCUS' : 'REST');
        } else {
          updateMemberStatus('AFK');
        }
      }
      prevIsRunning.current = appIsRunning;
      prevTimerMode.current = appTimerMode;
    }
  }, [appIsRunning, appTimerMode, activeRoom?.id, user?.uid]);

  useEffect(() => {
    onRoomStateChange?.(!!activeRoom);
  }, [activeRoom, onRoomStateChange]);

  // Sync clock for timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-stop timer when host
  useEffect(() => {
    if (activeRoom && user && activeRoom.hostId === user.uid && activeRoom.timerState !== 'IDLE' && activeRoom.timerTarget) {
      if (Date.now() >= activeRoom.timerTarget) {
        stopTimer();
      }
    }
  }, [currentTime, activeRoom?.id, user?.uid]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoom?.messages]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'rooms')), (snap) => {
      const fbRooms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyRoom));
      setRooms(fbRooms);
      
      if (activeRoom) {
        const updated = fbRooms.find(r => r.id === activeRoom.id);
        if (updated) {
          setActiveRoom(updated);
        } else {
          const roomStillExists = fbRooms.some(r => r.id === activeRoom.id);
          if (!roomStillExists && fbRooms.length > 0) {
             setActiveRoom(null);
          }
        }
      }
    });
    return () => unsub();
  }, [activeRoom?.id]);

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSendMessage = async () => {
    if (!activeRoom || !user || !profile || !chatMessage.trim()) return;
    try {
      await updateDoc(doc(db, 'rooms', activeRoom.id), {
        messages: arrayUnion({
          uid: user.uid,
          name: profile.displayName || user.displayName || 'Anonymous',
          text: chatMessage,
          timestamp: Date.now()
        })
      });
      setChatMessage('');
      onSocialAction?.();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${activeRoom.id}`);
    }
  };

  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateRoom = async () => {
    if (!user || !profile || !newRoomName.trim() || isCreating) return;
    setIsCreating(true);
    const roomPath = 'rooms';
    try {
      const roomData = {
        name: newRoomName.trim(),
        isPrivate: newRoomPrivate,
        password: newRoomPrivate ? newRoomPassword : null,
        mode: newRoomMode,
        maxMembers: 10,
        status: 'In Session',
        hostId: user.uid,
        members: [{ 
          uid: user.uid, 
          name: profile.displayName || 'Anonymous', 
          isFocusing: appIsRunning && appTimerMode === 'study',
          status: appIsRunning ? (appTimerMode === 'study' ? 'FOCUS' : 'REST') : 'AFK',
          totalSecondsToday: 0,
          lastActive: Date.now()
        }],
        messages: [],
        createdAt: serverTimestamp(),
        timerState: 'IDLE',
        timerDuration: 25 * 60,
        timerTarget: null,
        sessionGoal: "Achieve deep focus state together."
      };
      
      const docRef = await addDoc(collection(db, roomPath), roomData);
      
      const createdRoom: StudyRoom = { 
        id: docRef.id, 
        ...roomData
      } as any;

      setNewRoomName('');
      setNewRoomPassword('');
      setNewRoomPrivate(false);
      setShowCreateModal(false);
      setActiveRoom(createdRoom);
    } catch (e) {
      console.error("Failed to create room:", e);
      handleFirestoreError(e, OperationType.CREATE, roomPath);
    } finally {
      setIsCreating(false);
    }
  };

  const attemptJoinRoom = (room: StudyRoom) => {
    if (activeRoom?.id === room.id) return;
    if (room.isPrivate) {
      setTargetRoom(room);
      setPasswordAttempt('');
      setPasswordError(false);
    } else {
      joinRoom(room);
    }
  };

  const joinRoom = async (room: StudyRoom) => {
    if (!user || !profile) return;
    if (room.members.length >= room.maxMembers && !room.members.find(m => m.uid === user.uid)) return;

    setTargetRoom(null);
    try {
      if (!room.members.find(m => m.uid === user.uid)) {
        await updateDoc(doc(db, 'rooms', room.id), {
          members: arrayUnion({ 
            uid: user.uid, 
            name: profile.displayName || 'Anonymous', 
            isFocusing: appIsRunning && appTimerMode === 'study',
            status: appIsRunning ? (appTimerMode === 'study' ? 'FOCUS' : 'REST') : 'AFK',
            totalSecondsToday: 0,
            lastActive: Date.now()
          })
        });
      }
      setActiveRoom(room);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${room.id}`);
    }
  };

  const handlePasswordSubmit = () => {
    if (targetRoom && targetRoom.password === passwordAttempt) {
      joinRoom(targetRoom);
    } else {
      setPasswordError(true);
    }
  };

  const leaveRoom = async () => {
    if (!activeRoom || !user || !profile) return;
    try {
      const memberObj = activeRoom.members.find(m => m.uid === user.uid);
      if (memberObj) {
        const isHost = activeRoom.hostId === user.uid;
        const otherMembers = activeRoom.members.filter(m => m.uid !== user.uid);
        
        const updateData: any = {
          members: arrayRemove(memberObj)
        };

        if (isHost && otherMembers.length > 0) {
          updateData.hostId = otherMembers[0].uid;
        }

        await updateDoc(doc(db, 'rooms', activeRoom.id), updateData);
      }
      setActiveRoom(null);
    } catch (e) {
      console.error("Failed to leave room", e);
    }
  };

  const startTimer = async (seconds: number, type: 'FOCUS' | 'BREAK') => {
    if (!activeRoom || !user || activeRoom.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', activeRoom.id), {
        timerState: type === 'FOCUS' ? 'FOCUSING' : 'BREAK',
        timerDuration: seconds,
        timerTarget: Date.now() + (seconds * 1000)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${activeRoom.id}`);
    }
  };

  const stopTimer = async () => {
    if (!activeRoom || !user || activeRoom.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', activeRoom.id), {
        timerState: 'IDLE',
        timerTarget: null
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${activeRoom.id}`);
    }
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = () => {
    if (!activeRoom?.timerTarget || !activeRoom?.timerDuration) return 0;
    const remaining = activeRoom.timerTarget - currentTime;
    return Math.max(0, 1 - (remaining / (activeRoom.timerDuration * 1000)));
  };

  const [activeTab, setActiveTab] = useState<'members' | 'leaderboard'>('members');

  const updateMemberStatus = async (status: 'FOCUS' | 'REST' | 'AFK') => {
    if (!activeRoom || !user) return;
    try {
      const now = Date.now();
      const updatedMembers = activeRoom.members.map(m => {
        if (m.uid === user.uid) {
            let additionalSeconds = 0;
            if (m.status === 'FOCUS') {
                additionalSeconds = Math.floor((now - m.lastActive) / 1000);
            }
            return { 
                ...m, 
                status, 
                lastActive: now, 
                isFocusing: status === 'FOCUS',
                totalSecondsToday: (m.totalSecondsToday || 0) + additionalSeconds
            };
        }
        return m;
      });
      await updateDoc(doc(db, 'rooms', activeRoom.id), { members: updatedMembers });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${activeRoom.id}`);
    }
  };

  const updateSessionGoal = async (goal: string) => {
    if (!activeRoom || !user || activeRoom.hostId !== user.uid) return;
    try {
      await updateDoc(doc(db, 'rooms', activeRoom.id), { sessionGoal: goal });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `rooms/${activeRoom.id}`);
    }
  };

  const remainingTime = activeRoom?.timerTarget ? activeRoom.timerTarget - currentTime : 0;

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-100px)] overflow-y-auto flex flex-col space-y-8 relative pb-28 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 mt-4 md:mt-0">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-md-primary/20 to-md-secondary/20 rounded-3xl border border-md-primary/20">
            <Users className="w-8 h-8 text-md-primary" />
          </div>
          <div>
            <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Study Rooms</h2>
            <p className="text-xs text-white/50 uppercase font-black tracking-widest mt-1">Multiplayer Focus · Real-time Synchronization</p>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap">
           <div className="relative flex-grow md:flex-grow-0">
             <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
             <input 
               type="text"
               placeholder="SEARCH OPERATIONS..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="pl-12 pr-6 py-4 bg-neutral-900 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white placeholder:text-white/20 outline-none w-full md:w-72 focus:border-md-primary transition-all shadow-inner"
             />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <input 
                type="text" 
                placeholder="JOIN BY ID" 
                className="flex-1 md:w-40 bg-neutral-900 border border-white/5 rounded-2xl px-4 py-4 placeholder:text-white/20 font-black text-xs uppercase tracking-widest text-white outline-none focus:border-md-primary transition-all shadow-inner"
                id="join-room-id-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const joinDirectly = async () => {
                         try {
                           const d = await getDoc(doc(db, 'rooms', val));
                           if (d.exists()) attemptJoinRoom({ id: d.id, ...d.data() } as any);
                           else alert("Room not found!");
                         } catch(e) {
                           alert("Error joining room.");
                         }
                      };
                      joinDirectly();
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('join-room-id-input') as HTMLInputElement;
                  const val = input?.value.trim();
                  if (val) {
                    const joinDirectly = async () => {
                       try {
                         const d = await getDoc(doc(db, 'rooms', val));
                         if (d.exists()) attemptJoinRoom({ id: d.id, ...d.data() } as any);
                         else alert("Room not found!");
                       } catch(e) {
                         alert("Error joining room.");
                       }
                    };
                    joinDirectly();
                  }
                }}
                className="px-6 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg text-[10px] whitespace-nowrap flex items-center justify-center border border-white/10"
              >
                Join
              </button>
           </div>

           <button 
             onClick={() => setShowCreateModal(true)}
             className="px-8 py-4 bg-md-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(0,179,161,0.2)] flex items-center gap-3 hover:scale-105 transition-transform"
           >
             <Plus className="w-5 h-5" /> Deploy New Room
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <motion.div 
            key={room.id}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden bg-neutral-950 border border-white/5 p-8 rounded-[2.5rem] hover:border-md-primary/50 transition-all cursor-pointer shadow-lg hover:shadow-md-primary/20"
            onClick={() => attemptJoinRoom(room)}
          >
            <div className="absolute top-0 right-0 p-4">
               {room.isPrivate ? <Lock className="w-4 h-4 text-red-500 shadow-md" /> : <Unlock className="w-4 h-4 text-green-500" />}
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className={cn(
                "w-2 h-2 rounded-full",
                room.status === 'In Session' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              )} />
              <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{room.status}</span>
            </div>

            <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2">{room.name}</h3>
            <p className="text-xs text-white/40 font-mono mb-6">{room.mode}</p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-md-primary" />
                <span className="text-xs font-mono font-bold text-white">{room.members.length}/{room.maxMembers}</span>
              </div>
              <div className="flex -space-x-2">
                {room.members.slice(0, 3).map((m, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-neutral-950 bg-white/10 flex items-center justify-center overflow-hidden">
                     <span className="text-[8px]">{m.name.charAt(0)}</span>
                  </div>
                ))}
                {room.members.length > 3 && (
                   <div className="w-6 h-6 rounded-full border-2 border-neutral-950 bg-white/20 flex items-center justify-center">
                     <span className="text-[8px] text-white">+{room.members.length - 3}</span>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/30 border border-dashed border-white/10 rounded-[2.5rem]">
             <Search className="w-8 h-8 mb-4 opacity-50" />
             <p className="font-black uppercase tracking-widest text-sm">No Rooms Found</p>
          </div>
        )}
      </div>

      {/* Target Room Password Modal */}
      <AnimatePresence>
        {targetRoom && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-neutral-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-display font-black italic uppercase text-white mb-1"><Lock className="inline w-5 h-5 mr-2 text-red-500 mb-1" /> Secure Room</h3>
                   <p className="text-xs text-white/50">{targetRoom.name} requires a password.</p>
                 </div>
                 <button onClick={() => setTargetRoom(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input 
                type="password"
                placeholder="Enter Password"
                value={passwordAttempt}
                onChange={e => setPasswordAttempt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                className={cn("w-full bg-black border rounded-xl p-3 text-white mb-4 transition-colors", passwordError ? "border-red-500" : "border-white/20")}
              />
              {passwordError && <p className="text-red-500 text-[10px] uppercase tracking-widest mb-4 font-black">Access Denied</p>}
              <button 
                onClick={handlePasswordSubmit}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Authenticate
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-neutral-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-left"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-black italic uppercase text-white">Deploy Room</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-white/40"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Operation Name</label>
                   <input 
                     value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                     className="w-full bg-black border border-white/20 rounded-xl p-3 text-white focus:border-md-primary"
                     placeholder="e.g. JEE Late Night"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Protocol Mode</label>
                   <select 
                     value={newRoomMode} onChange={e => setNewRoomMode(e.target.value)}
                     className="w-full bg-black border border-white/20 rounded-xl p-3 text-white appearance-none focus:border-md-primary"
                   >
                     <option>DEEP WORK</option>
                     <option>CLASSIC POMODORO</option>
                     <option>FLOW STATE</option>
                     <option>CASUAL CO-WORKING</option>
                   </select>
                 </div>
                 <div className="flex items-center justify-between pb-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Private Encryption</label>
                   <input type="checkbox" checked={newRoomPrivate} onChange={e => setNewRoomPrivate(e.target.checked)} className="w-4 h-4 accent-red-600" />
                 </div>
                 {newRoomPrivate && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">Password Key</label>
                     <input 
                       type="password" value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)}
                       className="w-full bg-black border border-red-500/50 rounded-xl p-3 text-white focus:border-red-500"
                       placeholder="Access Key"
                     />
                   </motion.div>
                 )}
                                   <button 
                    onClick={handleCreateRoom}
                    disabled={!newRoomName.trim() || (newRoomPrivate && !newRoomPassword.trim())}
                    className="w-full mt-4 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] border-b-4 border-emerald-700"
                  >
                    Establish Connection
                  </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       <AnimatePresence>
        {activeRoom && (          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] md:absolute md:inset-0 md:z-50 bg-[#05070a] flex flex-col md:rounded-3xl overflow-hidden border-0 md:border border-white/5"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-md-primary/20 to-transparent" />
              <div className="w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            <header className="relative z-10 p-4 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
                  <Flame className="w-6 h-6 text-md-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{activeRoom.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-md-primary/60 uppercase tracking-widest">{activeRoom.mode}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{activeRoom.members.length}/{activeRoom.maxMembers} Vanguards</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-mono font-bold text-white/40 bg-white/5 py-1 px-2 rounded-md border border-white/10 uppercase tracking-widest flex items-center gap-2">
                       ROOM ID: <span className="text-white">{activeRoom.id}</span>
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(activeRoom.id);
                        alert("Room ID copied! Share this with your comrades.");
                      }} 
                      className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all text-white/40 hover:text-white group/copy"
                      title="Copy Room ID"
                    >
                      <Copy className="w-3.5 h-3.5 group-hover/copy:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={leaveRoom}
                className="px-6 py-2.5 bg-red-500/10 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                Abort Protocol
              </button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
              {/* Member Grid - Left Side */}
              <div className={cn("flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar", isChatFullscreen ? "hidden" : "block")}>
                <div className="max-w-4xl mx-auto space-y-12 pb-24">
                  <div className="flex flex-col items-center justify-center py-8 gap-8">
                    <div className="relative p-1 rounded-full bg-md-primary/10 border border-md-primary/20 shadow-[0_0_80px_rgba(0,179,161,0.2)] animate-glow">
                      <div className="bg-black border-2 border-md-primary/30 p-10 md:p-14 rounded-full flex flex-col items-center justify-center min-w-[220px] md:min-w-[300px] aspect-square relative z-10">
                        <span className={cn(
                          "text-7xl md:text-9xl font-mono font-black italic tracking-tighter text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                          remainingTime <= 0 && activeRoom.timerState !== 'IDLE' ? "text-red-500 animate-pulse" : ""
                        )}>
                          {formatTime(remainingTime)}
                        </span>
                        <div className="flex flex-col items-center mt-4">
                          <span className="text-xs font-black uppercase tracking-[0.4em] text-md-primary/80">
                            {activeRoom.timerState === 'FOCUSING' ? 'BATTLE IN PROGRESS' : activeRoom.timerState === 'BREAK' ? 'RECOVERY PHASE' : 'IDLE STATE'}
                          </span>
                          <div className="flex gap-1.5 mt-2">
                             {[...Array(3)].map((_, i) => (
                               <motion.div 
                                 key={i}
                                 animate={activeRoom.timerState !== 'IDLE' ? { scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] } : { opacity: 0.1 }}
                                 transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                 className="w-1.5 h-1.5 rounded-full bg-md-primary" 
                               />
                             ))}
                          </div>
                        </div>
                      </div>

                      {/* Progress Circle BG */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="48" 
                          className="fill-none stroke-white/5 stroke-[1]" 
                        />
                        <motion.circle 
                          cx="50" cy="50" r="48" 
                          className="fill-none stroke-[2]"
                          stroke={activeRoom.timerState === 'BREAK' ? '#f97316' : '#00b3a1'}
                          strokeDasharray="301.6"
                          animate={{ strokeDashoffset: 301.6 * (1 - getTimerProgress()) }}
                          transition={{ duration: 1, ease: "linear" }}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Host Controls */}
                    {activeRoom.hostId === user?.uid && (
                      <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        {activeRoom.timerState === 'IDLE' ? (
                          <>
                            <button 
                              onClick={() => startTimer(25 * 60, 'FOCUS')}
                              className="px-6 py-3 bg-md-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all shadow-lg"
                            >
                              Start Focus (25m)
                            </button>
                            <button 
                              onClick={() => startTimer(5 * 60, 'BREAK')}
                              className="px-6 py-3 bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all shadow-lg"
                            >
                              Short Break (5m)
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={stopTimer}
                            className="px-12 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-500 transition-all shadow-lg"
                          >
                            Terminate Session
                          </button>
                        )}
                      </div>
                    )}

                    <div className="w-full max-w-md p-6 bg-white/5 border border-white/5 rounded-3xl text-center group/goal relative">
                       <Target className="w-5 h-5 text-md-primary mx-auto mb-2 opacity-50" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Operational Goal</p>
                       <p className="text-sm font-medium italic text-white/80">"{activeRoom.sessionGoal || 'No goal set for this session.'}"</p>
                       
                       {activeRoom.hostId === user?.uid && (
                         <button 
                           onClick={() => {
                             const newGoal = prompt("Set a new session goal:", activeRoom.sessionGoal);
                             if (newGoal !== null) updateSessionGoal(newGoal);
                           }}
                           className="absolute top-4 right-4 opacity-0 group-hover/goal:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                         >
                            <Plus className="w-3.5 h-3.5" />
                         </button>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-6 mb-8 border-b border-white/5 pb-4">
                    <button 
                       onClick={() => setActiveTab('members')} 
                       className={cn("text-xs font-black uppercase tracking-widest transition-all", activeTab === 'members' ? "text-white" : "text-white/20 hover:text-white/40")}
                    >
                      Active Vanguards
                    </button>
                    <button 
                       onClick={() => setActiveTab('leaderboard')} 
                       className={cn("text-xs font-black uppercase tracking-widest transition-all", activeTab === 'leaderboard' ? "text-white" : "text-white/20 hover:text-white/40")}
                    >
                      Leaderboard (24h)
                    </button>
                  </div>

                  {activeTab === 'members' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
                        {activeRoom.members.map((member, i) => (
                        <motion.div 
                            key={member.uid}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center gap-4 group"
                        >
                            <div className="relative">
                            <div className={cn(
                                "w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 flex items-center justify-center p-1 transition-all duration-500",
                                member.isFocusing ? "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] rotate-3" : "border-md-primary/10 group-hover:border-md-primary/40 -rotate-3 hover:rotate-0"
                            )}>
                                <div className="w-full h-full rounded-2xl bg-[#0a0c10] border border-white/5 flex items-center justify-center text-3xl uppercase font-black text-white/50 font-display italic">
                                    {member.name.charAt(0)}
                                </div>
                                {member.status === 'AFK' && (
                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">AFK</span>
                                </div>
                                )}
                            </div>
                            {member.uid === user?.uid && (
                                <div className="absolute -top-2 -right-2 bg-white text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg z-10 shadow-lg capitalize">YOU</div>
                            )}
                            {(member.status === 'FOCUS' && (member.isFocusing || activeRoom.timerState === 'FOCUSING')) && (
                                <div className="absolute -bottom-2 right-0 flex gap-0.5">
                                {[...Array(3)].map((_, j) => (
                                    <motion.div 
                                    key={j}
                                    animate={{ 
                                        height: [4, 12, 4],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ 
                                        duration: 0.8, 
                                        delay: j * 0.15, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1.5 bg-md-primary rounded-full shadow-[0_0_10px_rgba(0,179,161,0.5)]" 
                                    />
                                ))}
                                </div>
                            )}
                            </div>
                            <div className="text-center space-y-1">
                            <span className="text-xs font-black uppercase tracking-tight text-white block max-w-[120px] truncate leading-none">{member.name}</span>
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded flex items-center gap-1 mx-auto w-fit",
                                member.status === 'FOCUS' ? "bg-md-primary/10 text-md-primary" : member.status === 'REST' ? "bg-orange-500/10 text-orange-400" : "bg-white/5 text-white/20"
                            )}>
                                <span className={cn(
                                    "w-1 h-1 rounded-full",
                                    member.status === 'FOCUS' ? "bg-md-primary" : member.status === 'REST' ? "bg-orange-400" : "bg-white/20"
                                )} />
                                {member.status}
                            </span>
                            </div>
                        </motion.div>
                        ))}
                        {[...Array(Math.max(0, activeRoom.maxMembers - activeRoom.members.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="flex flex-col items-center gap-4 opacity-10 grayscale">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-dashed border-white flex items-center justify-center p-1">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Searching...</span>
                            </div>
                        </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeRoom.members
                        .sort((a,b) => (b.totalSecondsToday || 0) - (a.totalSecondsToday || 0))
                        .map((member, i) => (
                         <div key={member.uid} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black", i === 0 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/50")}>
                                {i+1}
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-bold text-white">{member.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-mono font-black text-white">{Math.floor(member.totalSecondsToday / 60)}m</span>
                            </div>
                         </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Chat & Controls - Right Side */}
              <div className={cn(
                "flex flex-col border-t md:border-t-0 md:border-l border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500",
                isChatFullscreen 
                  ? "w-full absolute inset-0 z-50 bg-[#05070a]/95 border-none" 
                  : "w-full h-[45vh] md:h-auto md:w-[320px] lg:w-[400px] xl:w-[450px]"
              )}>
                 <div className="p-4 md:p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Communication Interface</span>
                       <button 
                          onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                       >
                          {isChatFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                       </button>
                    </div>
                    <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5">
                       {(['FOCUS', 'REST', 'AFK'] as const).map((s) => (
                         <button
                           key={s}
                           onClick={() => updateMemberStatus(s)}
                           className={cn(
                             "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                             activeRoom.members.find(m => m.uid === user?.uid)?.status === s
                               ? "bg-md-primary text-black shadow-lg"
                               : "text-white/30 hover:text-white/60"
                           )}
                         >
                           {s}
                         </button>
                       ))}
                    </div>

                    <button 
                       className={cn(
                         "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn flex items-center justify-center gap-3",
                         activeRoom.members.find(m => m.uid === user?.uid)?.status === 'FOCUS' 
                           ? "bg-orange-600 text-white shadow-[0_0_30px_rgba(234,88,12,0.4)]" 
                           : "bg-md-primary text-black shadow-[0_0_30px_rgba(0,179,161,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                       )}
                       onClick={() => {
                          const currentStatus = activeRoom.members.find(m => m.uid === user?.uid)?.status;
                          updateMemberStatus(currentStatus === 'FOCUS' ? 'REST' : 'FOCUS');
                          onToggleLocalTimer?.();
                       }}
                    >
                       {activeRoom.members.find(m => m.uid === user?.uid)?.status === 'FOCUS' ? (
                         <><Square className="w-3.5 h-3.5 fill-current" /> End Focus Session</>
                       ) : (
                         <><Zap className="w-3.5 h-3.5 fill-current" /> Engage Focus Mode</>
                       )}
                    </button>
                 </div>

                 <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-4 border-b border-white/5 space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ambient Protocol</span>
                          <div className="w-8 h-1 bg-md-primary/20 rounded-full" />
                       </div>
                       <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                          {Object.entries(ambientSounds).map(([sound, url]) => (
                            <button 
                              key={sound}
                              onClick={() => setAmbientSound(url)}
                              className={cn(
                                "px-4 py-2 border rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                ambientSound === url 
                                  ? "bg-md-primary text-black border-md-primary shadow-lg shadow-md-primary/20" 
                                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                              )}
                            >
                              {sound}
                            </button>
                          ))}
                       </div>
                       <audio ref={audioRef} src={ambientSound || ''} loop />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                       {activeRoom.messages?.length === 0 && (
                         <div className="h-full flex flex-col items-center justify-center gap-4 text-white/10 italic">
                            <MessageSquare className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Establish Communication</p>
                         </div>
                       )}
                       {activeRoom.messages?.map((msg, i) => (
                          <div key={i} className={cn("flex flex-col group/msg", msg.uid === user?.uid ? "items-end" : "items-start")}>
                             <div className={cn("flex items-center gap-2 mb-1.5", msg.uid === user?.uid ? "flex-row-reverse" : "")}>
                                <span className={cn(
                                   "text-[10px] font-black uppercase tracking-widest font-mono line-clamp-1",
                                   msg.uid === user?.uid ? "text-md-primary" : "text-[11px] text-white"
                                 )}>{msg.name || "ANONYMOUS"}</span>
                                <span className="text-[8px] text-white/20 uppercase font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <div className={cn(
                               "max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed tracking-wide shadow-2xl",
                               msg.uid === user?.uid 
                                 ? "bg-md-primary text-black rounded-tr-none" 
                                 : "bg-[#0a0c10] border border-white/5 text-white/80 rounded-tl-none group-hover/msg:border-white/10 transition-colors"
                             )}>
                                {msg.text}
                             </div>
                          </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 md:p-6 bg-black/60 border-t border-white/10 flex gap-3">
                       <input 
                          value={chatMessage}
                          onChange={e => setChatMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          placeholder="TRANSMIT TO SQUAD..."
                          className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-md-primary/50 transition-all font-mono uppercase"
                       />
                       <button 
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="w-14 h-14 bg-white/5 text-white rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-md-primary hover:border-md-primary/40 transition-all disabled:opacity-30 flex-shrink-0"
                       >
                          <Send className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
