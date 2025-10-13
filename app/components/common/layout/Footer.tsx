import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <nav className="grid grid-flow-col gap-4">
        <Link to="/" className="link link-hover">
          ホーム
        </Link>
        <a className="link link-hover">利用規約</a>
        <a className="link link-hover">プライバシーポリシー</a>
        <a className="link link-hover">お問い合わせ</a>
      </nav>
      <aside>
        <p>Copyright © 2025 - Metamo</p>
      </aside>
    </footer>
  )
}
