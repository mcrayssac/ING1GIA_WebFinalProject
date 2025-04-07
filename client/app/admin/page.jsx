// pages/admin-dashboard.js
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, UserPlus, Users, ClipboardList, MapPin } from 'lucide-react';

// Exemple statique de demandes de montée en grade
const promotionRequests = [
  { id: 1, username: "user1", currentGrade: "Technicien", nextGrade: "Technicien confirmé", points: 150 },
  { id: 2, username: "user2", currentGrade: "Technicien confirmé", nextGrade: "Ingénieur", points: 350 },
  { id: 3, username: "user3", currentGrade: "Ingénieur", nextGrade: "Ingénieur confirmé", points: 800 }
];

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

        {/* Disposition en deux colonnes */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Colonne de navigation */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {/* Gestion des machines */}
            <Link href="/admin/manage-machines" legacyBehavior>
              <a className="block cursor-pointer hover:scale-105 transition-transform">
                <div className="border rounded p-8 flex flex-col items-center justify-center">
                  <ClipboardList className="w-12 h-12 text-indigo-500" />
                  <h2 className="text-2xl font-bold mt-4">Gestion des machines</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Ajouter, modifier et supprimer des machines
                  </p>
                </div>
              </a>
            </Link>

            {/* Affectation / Pôles */}
            <Link href="/admin/affectation" legacyBehavior>
              <a className="block cursor-pointer hover:scale-105 transition-transform">
                <div className="border rounded p-8 flex flex-col items-center justify-center">
                  <MapPin className="w-12 h-12 text-orange-500" />
                  <h2 className="text-2xl font-bold mt-4">Affectation</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Gérer l'affectation aux pôles
                  </p>
                </div>
              </a>
            </Link>
          </div>

          {/* Colonne "tableau" simulé des demandes de montée en grade */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Demandes de montée en grade</h2>
            <div className="space-y-2">
              {/* En-tête simulé */}
              <div className="grid grid-cols-5 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="px-4 py-2 font-bold">Nom</div>
                <div className="px-4 py-2 font-bold">Grade Actuel</div>
                <div className="px-4 py-2 font-bold">Grade Suivant</div>
                <div className="px-4 py-2 font-bold">Points</div>
                <div className="px-4 py-2 font-bold">Actions</div>
              </div>
              {/* Lignes simulées */}
              {promotionRequests.map((req) => (
                <div key={req.id} className="grid grid-cols-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2">{req.username}</div>
                  <div className="px-4 py-2">{req.currentGrade}</div>
                  <div className="px-4 py-2">{req.nextGrade}</div>
                  <div className="px-4 py-2">{req.points}</div>
                  <div className="px-4 py-2 flex space-x-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
                      Approuver
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
