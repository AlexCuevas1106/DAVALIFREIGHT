import { jsPDF } from "jspdf";

import React, { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      localStorage.removeItem("hasShownWelcome");
      setTimeout(() => setLocation("/"), 200);
    },
  });
  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border border-gray-200 bg-white">
        {/* Logo/Header */}
        <div className="px-8 py-8 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-8 w-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2M16 3a4 4 0 01-8 0" /></svg>
            <span className="text-2xl font-semibold text-gray-900">Davali Freight</span>
          </div>
          <span className="text-sm text-gray-600">Sistema de Gestión</span>
        </div>
        {/* Login Form */}
        <form onSubmit={handleLogin} className="px-8 py-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <input id="username" type="text" className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder-gray-400" placeholder="Ingresa tu usuario" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input id="password" type="password" className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder-gray-400" placeholder="Ingresa tu contraseña" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
          </div>
          {loginMutation.error && (
            <div className="text-red-600 text-sm text-center">{loginMutation.error.message}</div>
          )}
          <button type="submit" className="w-full py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        {/* Demo Accounts */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700 font-medium mb-2">Cuentas de prueba:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Chofer:</strong> skyler.droubay / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}