import { KironMood } from './types.ts';

// Game Rules
export const MAX_HABITS = 3;
export const MAX_LIFE = 100;
export const STARTING_LIFE = 70;
export const XP_PER_HABIT = 10;
export const LIFE_PER_HABIT = 10;
export const PENALTY_XP = 10;
export const PENALTY_LIFE = 15;

// Levels
export const LEVEL_THRESHOLDS = [0, 50, 120, 220, 360, 550, 800];

export const getLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

// Ambient Phrases (Time/Mood based)
export const PHRASES = {
  [KironMood.OFFLINE]: [
    "Silêncio...",
    "Em espera.",
    "Luz apagada.",
    "Até logo.",
    "Descansando."
  ],
  [KironMood.SAD]: [ // Low Life (< 40)
    "Estou mais fraco hoje.",
    "Preciso de você.",
    "Vamos com cuidado.",
    "Minha luz oscila.",
    "Não me esqueça.",
    "Ainda estou aqui.",
    "Um passo ajuda."
  ],
  [KironMood.NEUTRAL]: [ // Normal (40-70) - Start of day / Neutral
    "Estou aqui.",
    "Um passo já é suficiente.",
    "Seguimos.",
    "Com calma.",
    "Bom dia.",
    "Acordei.",
    "Vamos?",
    "Sem pressa.",
    "O tempo é seu.",
    "Tudo estável."
  ],
  [KironMood.HAPPY]: [ // High Life (> 70)
    "Sinto firmeza.",
    "Clareza total.",
    "Estamos bem.",
    "Energia boa.",
    "Belo ritmo.",
    "Tudo em ordem.",
    "Sigo forte.",
    "Obrigado por cuidar."
  ]
};

// Reaction Phrases (Triggered by actions)
export const REACTION_PHRASES = {
  DONE: [
    "Boa.",
    "Isso contou.",
    "Seguimos firmes.",
    "Mais um passo.",
    "Senti essa.",
    "Ficou mais leve.",
    "Vitória silenciosa.",
    "Obrigado."
  ],
  MISSED: [
    "Tudo bem.",
    "Amanhã a gente tenta.",
    "Ainda dá.",
    "Sem pressa.",
    "Acontece.",
    "Recomeçamos.",
    "Sem culpa."
  ]
};

// Notification Messages
export const NOTIFICATION_MSGS = {
  MORNING: [
    "Bom dia. Estou aqui.",
    "O sol nasceu. Vamos?",
    "Luz acesa. Seguimos.",
    "Acordei com você.",
    "Novo dia, novas chances."
  ],
  EVENING_DONE: [
    "Senti essa vitória.",
    "Boa noite. Bom descanso.",
    "Dever cumprido.",
    "Durma bem, eu vigio.",
    "Foi um bom dia."
  ],
  EVENING_PENDING: [
    "Ainda estou aqui.",
    "A noite caiu. Algum progresso?",
    "Lembre de mim.",
    "Não desista agora.",
    "Ainda dá tempo."
  ]
};

export const getKironMood = (life: number): KironMood => {
  if (life <= 0) return KironMood.OFFLINE;
  if (life < 40) return KironMood.SAD;
  if (life < 70) return KironMood.NEUTRAL;
  return KironMood.HAPPY;
};