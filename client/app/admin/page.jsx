// pages/admin-dashboard.js
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, UserPlus, Users, Settings } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard Admin</h1>
          <p className="text-lg text-accent-foreground">
            Gérez l'ensemble de l'application via ces outils
          </p>
        </header>

        {/* Cartes de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Signalements */}
          <Link href="/admin/reports" legacyBehavior>
            <a className="block cursor-pointer hover:scale-105 transition-transform">
              <div className="border rounded p-8 flex flex-col items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold mt-4">Signalements</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Consulter, filtrer et analyser les signalements
                </p>
              </div>
            </a>
          </Link>

          {/* Utilisateurs en attente */}
          <Link href="/admin/pending-users" legacyBehavior>
            <a className="block cursor-pointer hover:scale-105 transition-transform">
              <div className="border rounded p-8 flex flex-col items-center justify-center">
                <UserPlus className="w-12 h-12 text-blue-500" />
                <h2 className="text-2xl font-bold mt-4">Utilisateurs en attente</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Examiner et approuver les inscriptions
                </p>
              </div>
            </a>
          </Link>

          {/* Gestion des utilisateurs */}
          <Link href="/admin/manage-users" legacyBehavior>
            <a className="block cursor-pointer hover:scale-105 transition-transform">
              <div className="border rounded p-8 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-green-500" />
                <h2 className="text-2xl font-bold mt-4">Gestion des utilisateurs</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Modifier points, grades et paramètres utilisateurs
                </p>
              </div>
            </a>
          </Link>

          {/* Outils & Paramètres */}
          <Link href="/admin/settings" legacyBehavior>
            <a className="block cursor-pointer hover:scale-105 transition-transform">
              <div className="border rounded p-8 flex flex-col items-center justify-center">
                <Settings className="w-12 h-12 text-purple-500" />
                <h2 className="text-2xl font-bold mt-4">Outils & Paramètres</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Accéder aux configurations avancées
                </p>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
