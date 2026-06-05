// Marchio Amon ricreato in SVG: esagono con monogramma "AM / ON" e la "O"
// a bersaglio (anello + punto centrale). Usa currentColor, così basta dare
// un colore al testo del contenitore. Per sostituirlo con il file ufficiale,
// metti un logo.svg in /public e usalo al posto di questo componente.

export function LogoMark({
  className,
  title = "Amon",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      {/* Esagono */}
      <polygon
        points="60,6 106.8,33 106.8,87 60,114 13.2,87 13.2,33"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {/* Riga superiore: AM */}
      <text
        x="60"
        y="58"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-inter), Arial, sans-serif",
          fontWeight: 800,
          fontSize: "33px",
          letterSpacing: "0.5px",
        }}
      >
        AM
      </text>
      {/* Riga inferiore: O (a bersaglio) + N */}
      <circle cx="49" cy="80" r="11" stroke="currentColor" strokeWidth="6" />
      <circle cx="49" cy="80" r="3.4" fill="currentColor" />
      <text
        x="75"
        y="91"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-inter), Arial, sans-serif",
          fontWeight: 800,
          fontSize: "33px",
        }}
      >
        N
      </text>
    </svg>
  );
}
