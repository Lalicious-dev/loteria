export default function Card({ card, selected, onClick, isCurrent }) {
  return (
    <div
      onClick={onClick} // Siempre clickeable
      style={{
        backgroundColor: selected ? '#ffe0b2' : isCurrent ? '#ffeb3b' : '#000000ff',
        border: isCurrent ? '3px solid #f44336' : selected ? '2px solid #ff9800' : '2px solid #c33',
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'center',
        height: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
        fontWeight: isCurrent ? 'bold' : 'normal',
      }}
    >
      <div>{card}</div>
      {selected && <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '1.5rem' }}>🌽</div>}
      {isCurrent && <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '1rem' }}>🔥</div>}
    </div>
  );
}