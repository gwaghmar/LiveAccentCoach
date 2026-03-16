/**
 * QuickStart — shown in the main area before the user connects.
 * Displays suggested actions as clickable cards.
 */
type Props = {
  onRoleSelect: (role: string) => void;
  onConnect: () => void;
  connected: boolean;
};

const CARDS = [
  {
    role: 'accent_coach',
    icon: 'record_voice_over',
    title: 'Accent Coach',
    desc: 'Real-time pronunciation feedback and drills tailored to your accent.',
  },
  {
    role: 'analyst',
    icon: 'bar_chart',
    title: 'Data Analyst',
    desc: 'Upload a CSV or Excel file and ask questions about your data.',
  },
  {
    role: 'meeting_assistant',
    icon: 'groups',
    title: 'Meeting Assistant',
    desc: 'Live transcription, action items, and follow-up suggestions.',
  },
  {
    role: 'workout',
    icon: 'fitness_center',
    title: 'Workout Coach',
    desc: 'Voice-guided workouts with form cues and motivation.',
  },
];

export default function QuickStart({ onRoleSelect, onConnect, connected }: Props) {
  if (connected) return null;

  return (
    <div className="quick-start">
      <div className="quick-start__hero">
        <span className="material-symbols-outlined quick-start__hero-icon">mic</span>
        <h1 className="quick-start__title">Northstack</h1>
        <p className="quick-start__sub">Your AI voice companion — select a persona and press Start</p>
      </div>

      <div className="quick-start__cards">
        {CARDS.map((card) => (
          <button
            key={card.role}
            className="quick-start-card"
            onClick={() => onRoleSelect(card.role)}
          >
            <span className="material-symbols-outlined quick-start-card__icon">{card.icon}</span>
            <div className="quick-start-card__title">{card.title}</div>
            <div className="quick-start-card__desc">{card.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
