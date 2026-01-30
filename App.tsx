import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useKironGame } from './hooks/useKironGame';
import KironAvatar from './components/KironAvatar';
import { getKironMood, MAX_HABITS, getLevel, LEVEL_THRESHOLDS } from './constants';
import { getTodayStr, formatDateBr, isHabitDueToday } from './utils';

// --- ICONS ---
const IconHome = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconHabits = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconProgress = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconTools = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconEdit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;

// --- COMPONENTS ---

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "text-kiron-primary" : "text-gray-400 dark:text-gray-500";

  return (
    <div className="flex flex-col h-screen bg-kiron-bg dark:bg-slate-900 overflow-hidden max-w-md mx-auto shadow-2xl relative transition-colors duration-300">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-6">
        {children}
      </main>
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex justify-around py-4 z-50 transition-colors duration-300">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <IconHome />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>
        <Link to="/habits" className={`flex flex-col items-center ${isActive('/habits')}`}>
          <IconHabits />
          <span className="text-xs mt-1 font-medium">Hábitos</span>
        </Link>
        <Link to="/progress" className={`flex flex-col items-center ${isActive('/progress')}`}>
          <IconProgress />
          <span className="text-xs mt-1 font-medium">Progresso</span>
        </Link>
        <Link to="/tools" className={`flex flex-col items-center ${isActive('/tools')}`}>
          <IconTools />
          <span className="text-xs mt-1 font-medium">Tools</span>
        </Link>
      </nav>
    </div>
  );
};

const HomeView = ({ game }: { game: ReturnType<typeof useKironGame> }) => {
  const { state, habits, markHabitDone, kironPhrase, triggerAnimation } = game;
  const mood = getKironMood(state.life);
  const today = getTodayStr();
  const todayRecord = state.history[today];
  const doneIds = todayRecord ? todayRecord.habitsDone : [];

  const dueHabits = habits.filter(h => h.active && isHabitDueToday(h.days));
  const availableHabits = dueHabits.filter(h => !doneIds.includes(h.id));

  const lifeColor = state.life > 70 ? 'bg-kiron-life' : state.life > 40 ? 'bg-kiron-warn' : 'bg-kiron-danger';
  
  const nextLevelXp = LEVEL_THRESHOLDS[state.level] || 9999;
  const currentLevelBaseXp = LEVEL_THRESHOLDS[state.level - 1] || 0;
  const levelProgress = ((state.xpTotal - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100;

  return (
    <div className="flex flex-col items-center h-full justify-center space-y-6">
      {/* Header Stats */}
      <div className="w-full flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm font-bold">
        <div className="flex items-center space-x-2">
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-1 rounded">LVL {state.level}</span>
          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 transition-all duration-500" style={{ width: `${Math.min(100, levelProgress)}%` }}></div>
          </div>
        </div>
        <div>XP {state.xpTotal}</div>
      </div>

      {/* KIRON Avatar Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
         <KironAvatar mood={mood} animation={triggerAnimation} name={state.robotName} />
         
         {/* Life Bar */}
         <div className="w-48 mt-6">
           <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">
             <span>LIFE</span>
             <span>{state.life}%</span>
           </div>
           <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden border border-gray-100 dark:border-slate-800 shadow-inner">
             <div className={`h-full ${lifeColor} transition-all duration-700 ease-out`} style={{ width: `${state.life}%` }}></div>
           </div>
         </div>

         {/* Phrase */}
         <p className="mt-8 text-center text-gray-600 dark:text-gray-300 font-medium italic animate-pulse-slow px-4 min-h-[3rem]">
           "{kironPhrase}"
         </p>
      </div>

      {/* Action Area */}
      <div className="w-full pb-8">
        {habits.length === 0 ? (
          <Link to="/habits" className="block w-full">
            <button className="w-full bg-kiron-primary text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center space-x-2">
              <span className="text-xl">+ CRIAR HÁBITO</span>
            </button>
          </Link>
        ) : availableHabits.length > 0 ? (
          <div className="space-y-3">
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest font-bold">A fazer hoje</p>
            {availableHabits.map(h => (
              <button 
                key={h.id}
                onClick={() => markHabitDone(h.id)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white font-bold py-5 px-6 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg">{h.name}</span>
                  <span className="text-xs text-gray-400 font-normal">{h.time}</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-kiron-primary flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30">
                  <span className="text-kiron-primary text-xl">✔</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-green-800 dark:text-green-300 font-bold text-lg">Tudo feito por hoje!</p>
            <p className="text-green-600 dark:text-green-400 text-sm">Volte amanhã para mais XP.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HabitsView = ({ game }: { game: ReturnType<typeof useKironGame> }) => {
  const { habits, addHabit, editHabit, deleteHabit } = game;
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const resetForm = () => {
    setName('');
    setTime('09:00');
    setSelectedDays([1, 2, 3, 4, 5]);
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (isEditing) {
      editHabit(isEditing, { name, time, days: selectedDays });
    } else {
      addHabit(name, selectedDays, time);
    }
    resetForm();
  };

  const startEdit = (h: any) => {
    setName(h.name);
    setTime(h.time);
    setSelectedDays(h.days);
    setIsEditing(h.id);
    setIsAdding(true);
  };

  const toggleDay = (d: number) => {
    if (selectedDays.includes(d)) {
      if (selectedDays.length > 1) setSelectedDays(prev => prev.filter(x => x !== d));
    } else {
      setSelectedDays(prev => [...prev, d].sort());
    }
  };

  const DAYS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  if (isAdding) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{isEditing ? 'Editar Hábito' : 'Novo Hábito'}</h2>
        
        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-kiron-primary outline-none" 
              placeholder="Ex: Beber água"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Horário (lembrete)</label>
            <input 
              type="time" 
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">Dias da semana</label>
            <div className="flex justify-between">
              {DAYS_LABEL.map((label, idx) => (
                <button 
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${selectedDays.includes(idx) ? 'bg-kiron-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
           <button onClick={resetForm} className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 dark:bg-slate-800 dark:text-gray-400 rounded-xl">Cancelar</button>
           <button onClick={handleSave} className="flex-1 py-4 text-white font-bold bg-kiron-primary rounded-xl shadow-lg">Salvar</button>
        </div>
        
        {isEditing && (
           <button onClick={() => { deleteHabit(isEditing); resetForm(); }} className="mt-4 py-3 text-red-400 text-sm font-medium w-full">Apagar Hábito</button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Seus Hábitos</h1>
      
      {habits.map(h => (
        <div key={h.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
           <div>
             <h3 className="font-bold text-lg text-gray-800 dark:text-white">{h.name}</h3>
             <div className="flex space-x-2 text-xs text-gray-400 mt-1">
                <span>{h.time}</span>
                <span>•</span>
                <span>{h.days.length === 7 ? 'Todos os dias' : `${h.days.length} dias/semana`}</span>
             </div>
           </div>
           <button onClick={() => startEdit(h)} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-300">
             <IconEdit />
           </button>
        </div>
      ))}

      {habits.length < MAX_HABITS ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-5 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-center"
        >
          + Adicionar Hábito ({habits.length}/{MAX_HABITS})
        </button>
      ) : (
        <p className="text-center text-gray-400 text-sm py-4">Limite de {MAX_HABITS} hábitos atingido.</p>
      )}
    </div>
  );
};

const ProgressView = ({ game }: { game: ReturnType<typeof useKironGame> }) => {
  const { state } = game;
  const historyDates = Object.keys(state.history).sort().reverse(); 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Progresso</h1>
        <p className="text-gray-400 text-sm">Acompanhe sua jornada com {state.robotName}.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
           <div className="text-3xl font-bold text-kiron-primary mb-1">{state.streakCurrent}</div>
           <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Dias Seguidos</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
           <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 mb-1">{state.level}</div>
           <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Nível Atual</div>
        </div>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">Histórico Recente</h3>
        {historyDates.length === 0 ? (
           <div className="text-center text-gray-400 py-10 italic">Nenhum registro ainda. Comece hoje!</div>
        ) : (
          <div className="space-y-3">
             {historyDates.slice(0, 14).map(date => {
                const rec = state.history[date];
                const isGoodDay = rec.habitsDone.length > 0;
                return (
                  <div key={date} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-50 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGoodDay ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}>
                         {isGoodDay ? '✔' : '-'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 dark:text-white">{formatDateBr(date)}</div>
                        <div className="text-xs text-gray-400">{isGoodDay ? `${rec.habitsDone.length} hábitos` : 'Nenhum hábito'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                       {rec.xpDelta !== 0 && (
                         <span className={`text-xs font-bold ${rec.xpDelta > 0 ? 'text-green-500' : 'text-red-400'}`}>
                           {rec.xpDelta > 0 ? '+' : ''}{rec.xpDelta} XP
                         </span>
                       )}
                    </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

const ToolsView = ({ game }: { game: ReturnType<typeof useKironGame> }) => {
  const { state, setRobotName, toggleTheme, requestNotifyPermission } = game;
  const [nameInput, setNameInput] = useState(state.robotName);
  const [permStatus, setPermStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermStatus(Notification.permission);
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
    setRobotName(e.target.value || "ROBÔ");
  };

  const handleNotifyRequest = async () => {
    await requestNotifyPermission();
    setPermStatus(Notification.permission);
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Configurações</h1>
        <p className="text-gray-400 text-sm">Personalize sua experiência.</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Rename */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">Nome do Robô</label>
          <input 
            type="text" 
            value={nameInput}
            onChange={handleNameChange}
            maxLength={12}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-kiron-primary outline-none text-lg font-bold"
          />
          <p className="text-xs text-gray-400 mt-2">O nome aparecerá no peito do robô.</p>
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800 dark:text-white">Modo Noturno</div>
            <div className="text-xs text-gray-400">Alternar entre claro e escuro</div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${state.theme === 'dark' ? 'bg-kiron-primary' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${state.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-gray-800 dark:text-white">Notificações</div>
              <div className="text-xs text-gray-400">Mensagens do {state.robotName} (Manhã e Noite)</div>
            </div>
          </div>
          
          <div className="mt-4">
             {permStatus === 'granted' ? (
                <div className="flex items-center space-x-2 text-green-500 font-bold bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                  <span>✔ Ativadas</span>
                </div>
             ) : permStatus === 'denied' ? (
                <div className="text-sm text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  <p className="font-bold mb-1">Bloqueadas pelo navegador.</p>
                  <p>Para ativar, clique no cadeado 🔒 na barra de endereço e permita as notificações para este site.</p>
                </div>
             ) : (
                <button 
                  onClick={handleNotifyRequest}
                  className="w-full py-3 bg-kiron-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                >
                  Habilitar Notificações
                </button>
             )}
          </div>
        </div>

      </div>

      <div className="pb-8 text-center">
        <p className="text-xs text-gray-400 font-medium">Desenvolvido por</p>
        <p className="text-sm font-bold text-indigo-500">Leonardo Assunção</p>
      </div>
    </div>
  );
};

const App = () => {
  const game = useKironGame();

  if (!game.loaded) return null;

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView game={game} />} />
          <Route path="/habits" element={<HabitsView game={game} />} />
          <Route path="/progress" element={<ProgressView game={game} />} />
          <Route path="/tools" element={<ToolsView game={game} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;