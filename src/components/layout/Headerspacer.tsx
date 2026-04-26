/**
 * HeaderSpacer — Cola logo após <Header /> no layout.
 *
 * O header é `position: fixed`, então ele flutua sobre o conteúdo.
 * Este componente cria o espaço em branco equivalente à altura do header
 * para que nada fique escondido atrás dele.
 *
 * Alturas do header:
 *   - Barra principal: 64px
 *   - Barra de categorias: 40px
 *   ─────────────────────────────────────
 *   Total: 104px  (topbar removida)
 *
 * COMO USAR no seu app/layout.tsx:
 *
 *   import { Header }       from '@/components/layout/Header';
 *   import { HeaderSpacer } from '@/components/layout/HeaderSpacer';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <Header />
 *           <HeaderSpacer />    ← adicione esta linha
 *           <main>{children}</main>
 *           <Footer />
 *         </body>
 *       </html>
 *     );
 *   }
 */

export function HeaderSpacer() {
  return (
    // 104px = main(64) + categories(40)
    <div style={{ height: 104 }} aria-hidden="true" />
  );
}