import Link from "next/link";

export default function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="glyph">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L21 20 H14.5 L12 13.5 L9.5 20 H3 Z" style={{ fill: "var(--accent)" }} />
            </svg>
          </span>
          <span className="name">Aviram</span>
        </Link>
        <h1 className="auth-title serif">{title}</h1>
        {children}
        {footer && <div className="auth-foot">{footer}</div>}
      </div>
    </div>
  );
}
