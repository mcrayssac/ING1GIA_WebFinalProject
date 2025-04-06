"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, ArrowUpCircle, Download, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardEmployee() {
  // Données statiques pour l'instant
  const [employee] = useState({
    name: "Alexandre Dupont",
    grade: "Ingénieur Junior",
    pole: "Département R&D",
    points: 1200,
  });

  const downloadedGraphs = [
    { id: 1, title: "Performance Machine A", date: "2025-04-01" },
    { id: 2, title: "Efficacité Machine B", date: "2025-03-28" },
    { id: 3, title: "Production Machine C", date: "2025-03-25" },
  ];

  // Seuil de points pour l'avancement du grade
  const pointsThreshold = 1000;
  const progressPercentage = 50;

  // Fonction simulant l'action de montée en grade (à implémenter ultérieurement)
  const handleGradePromotion = () => {
    if (employee.points >= pointsThreshold) {
      alert("Montée en grade déclenchée !");
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="container mx-auto">
        {/* Header avec titre, message de bienvenue et grade */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-lg text-accent-foreground">Bienvenue, {employee.name}</span>
              <span className="text-lg font-semibold">({employee.grade})</span>
            </div>
          </div>
        </header>

        {/* Boutons pour accéder aux machines et progression */}
        <div className="flex flex-col space-y-4 mb-8">
          {/* Bouton Machines agrandi avec nouvelles couleurs */}
          <Link href="/machine-dashboard">
            <div className="relative h-16 bg-blue-600 text-white rounded-lg shadow cursor-pointer hover:scale-105 transform transition">
              {/* Barre de progression interne pour le grade (couleur adaptée) */}
              <div
                className="absolute left-0 top-0 h-full bg-blue-400 rounded-lg"
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="relative flex items-center justify-center h-full">
                <Monitor className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold">Accéder aux machines</span>
              </div>
            </div>
          </Link>

          {/* Barre de progression vers le grade */}
          <div
            className={`relative h-12 bg-gray-300 rounded-lg shadow ${employee.points >= pointsThreshold ? "cursor-pointer" : ""}`}
            onClick={handleGradePromotion}
          >
            <div
              className="absolute left-0 top-0 h-full bg-green-500 rounded-lg"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="relative flex items-center justify-center h-full">
              <span className="text-lg font-bold">
                Progression vers le grade suivant : {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Section Informations employé et Graphes téléchargés */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Carte Informations de l'employé */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Informations de l'employé</h2>
              <p><strong>Nom :</strong> {employee.name}</p>
              <p><strong>Grade :</strong> {employee.grade}</p>
              <p><strong>Pôle :</strong> {employee.pole}</p>
              <p><strong>Points :</strong> {employee.points}</p>
            </CardContent>
          </Card>

          {/* Carte Graphes téléchargés avec textes en couleurs contrastées */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Graphes téléchargés</h2>
              <ul className="space-y-3">
                {downloadedGraphs.map((graph) => (
                  <li key={graph.id} className="flex items-center justify-between bg-base-100 p-4 rounded-lg shadow">
                    <div>
                      <p className="font-semibold text-gray-800">{graph.title}</p>
                      <p className="text-sm text-gray-600">Téléchargé le {graph.date}</p>
                    </div>
                    <Download className="w-6 h-6 text-gray-800" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
