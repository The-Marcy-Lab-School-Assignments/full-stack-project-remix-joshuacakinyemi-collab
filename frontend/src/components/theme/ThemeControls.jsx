import { useTheme } from "../../ThemeContext";

function ThemeControls() {
  const { isDark, toggleMode, accentIndex, setAccent, ACCENTS } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button className="mode-toggle" onClick={toggleMode}>
        <i className={`ti ${isDark ? 'ti-moon' : 'ti-sun'}`} aria-hidden="true" />
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
      <div style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Accent color
      </div>
      <div className="color-swatches">
        {ACCENTS.map((a, i) => (
          <div
            key={a.label}
            className={`swatch${i === accentIndex ? ' selected' : ''}`}
            style={{ background: a.color }}
            title={a.label}
            onClick={() => setAccent(i)}
          />
        ))}
      </div>
    </div>
  );
}


export default ThemeControls;