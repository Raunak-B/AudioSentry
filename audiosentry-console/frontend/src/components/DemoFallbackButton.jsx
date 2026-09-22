export default function DemoFallbackButton({ onActivate }) {
  return (
    <button className="fallback-btn" onClick={onActivate}>
      Switch to Offline Demo Clip
    </button>
  );
}
