import React from "https://esm.sh/react@18.3.1";
import { html } from "../lib/html.js";
import { AuthProvider, useAuth } from "../context/AuthContext.js";
import { AdminLoginForm } from "../components/admin/AdminLoginForm.js";
import { AdminDashboard } from "../components/admin/AdminDashboard.js";
import { AdminCarouselUpload } from "../components/admin/AdminCarouselUpload.js";
import { AdminBookingsTable } from "../components/admin/AdminBookingsTable.js";

function AdminGate() {
  const { user, role, loading, signOut } = useAuth();

  if (loading) {
    return html`<div className="min-h-screen flex items-center justify-center bg-ink text-gray-400 text-sm">Carregando...</div>`;
  }

  if (!user) return html`<${AdminLoginForm} />`;

  // Client-side guard only for UX — the real enforcement is Supabase RLS,
  // which restricts every table/query here to role = 'admin' regardless of
  // what this check does.
  if (role !== "admin") {
    return html`
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink text-center px-5">
        <p className="text-cream text-sm">Esta conta não tem acesso ao painel administrativo.</p>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-400 max-w-sm">
          <p>Logado como <span className="text-gold">${user.email}</span></p>
          <p className="mt-1">Papel atual: <span className="text-gold">${role || "desconhecido"}</span></p>
          <p className="mt-2 text-gray-500">
            No SQL Editor do Supabase, rode:<br />
            <code className="text-gray-300 break-all">
              update public.profiles set role = 'admin' where email = '${user.email}';
            </code>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="./index.html" className="text-gray-400 text-xs hover:text-gold transition-colors">Voltar ao site</a>
          <button onClick=${signOut} className="text-gold text-xs underline">Sair</button>
        </div>
      </div>
    `;
  }

  return html`
    <div className="min-h-screen bg-ink px-5 md:px-10 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-cream">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <a href="./index.html" className="text-xs text-gray-400 hover:text-gold transition-colors">
              Ver site
            </a>
            <button onClick=${signOut} className="text-xs text-gray-400 hover:text-gold">Sair</button>
          </div>
        </div>

        <${AdminDashboard} />
        <${AdminCarouselUpload} />
        <${AdminBookingsTable} />
      </div>
    </div>
  `;
}

export function AdminApp() {
  return html`
    <${AuthProvider}>
      <${AdminGate} />
    <//>
  `;
}
