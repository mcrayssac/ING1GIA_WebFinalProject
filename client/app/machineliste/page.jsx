// machineliste/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Pour la récupération de l'URL de l'API depuis l'environnement côté client
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Exemple de composant MachineCard mis à jour pour afficher les infos d'une machine
function MachineCard({ machine, user }) {
  // Utilisation d'un fallback pour currentUsers
  const currentCount = machine.currentUsers ? machine.currentUsers.length : 0;
  const isAvailable = machine.status === "available" || currentCount < machine.maxUsers;

  return (
    <div className={`border rounded p-4 shadow ${!isAvailable ? "bg-gray-300" : "bg-white"}`}>
      <h3 className="text-xl font-bold">{machine.name}</h3>
      <p className="text-sm text-gray-700">Sous-pôle : {machine.subPole}</p>
      <p className="text-sm">Points par cycle : {machine.pointsPerCycle}</p>
      <p className="text-sm">
        Statut : <span className={isAvailable ? "text-green-600" : "text-red-600"}>{machine.status}</span>
      </p>
      {/* Boutons sensoriels */}
      <div className="mt-2 flex flex-wrap gap-2">
        {machine.availableSensors.map(sensor => {
          const accessible = hasAccessToSensor(user.grade, sensor.requiredGrade);
          return (
            <button
              key={sensor.sensorName}
              className={`btn btn-xs ${accessible ? "btn-primary" : "btn-disabled"}`}
              onClick={() => accessible && window.location.assign(`/machines/${machine._id}/sensors/${sensor.sensorName}`)}
              disabled={!accessible}
            >
              {sensor.sensorName}
            </button>
          );
        })}
      </div>
      {/* Bouton "Travailler" */}
      <div className="mt-4">
        <button 
          className={`btn ${isAvailable ? "btn-secondary" : "btn-disabled"}`}
          disabled={!isAvailable}
          onClick={() => {
            // Appel à l'API pour démarrer le cycle de travail
            // Exemple d'appel : utilisation de fetch vers `${API_URL}/api/machines/${machine._id}/start-work`
            fetch(`${API_URL}/api/machines/${machine._id}/start-work`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Pour une authentification, vous devrez ajouter le token, par exemple:
                // "Authorization": `Bearer ${yourToken}`
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error("Erreur lors du démarrage du cycle");
              }
              return response.json();
            })
            .then(data => {
              window.alert("Cycle de travail démarré (simulation) !");
              // Optionnel : rafraîchir les données ou modifier l'état local
            })
            .catch(err => window.alert(err.message));
          }}
        >
          Travailler
        </button>
      </div>
    </div>
  );
}

/**
 * Fonction utilitaire pour regrouper un tableau par une clé (ex. "mainPole")
 * Renvoie un tableau d'objets { group, machines }.
 */
function groupBy(arr, key) {
  const groups = {};
  arr.forEach(item => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });
  return Object.keys(groups).map(group => ({ group, machines: groups[group] }));
}

/**
 * Fonction utilitaire pour déterminer l'accès à un capteur en fonction du grade.
 * - Si l'utilisateur est "Responsable", il a accès à tout.
 * - Sinon, on compare la hiérarchie des grades.
 */
function hasAccessToSensor(userGrade, sensorRequiredGrade) {
  if (userGrade === "Responsable") return true;
  const grades = ["Apprenti", "Technicien", "Technicien confirmé", "Ingénieur", "Ingénieur confirmé"];
  const userIndex = grades.indexOf(userGrade);
  const requiredIndex = grades.indexOf(sensorRequiredGrade);
  return userIndex >= requiredIndex;
}

export default function MachineListePage() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Secondary filter pour raffiner le filtrage dynamique (site, pole)
  const [secondaryFilter, setSecondaryFilter] = useState({ site: "", pole: "" });

  // Exemple d'utilisateur courant, normalement à obtenir via un contexte d'authentification
  const currentUser = {
    _id: "user123",
    username: "responsable1",
    grade: "Responsable", // peut être "Technicien", "Ingénieur", etc.
    accessibleSites: ["Site A", "Site B"],
    accessiblePoles: ["Bas de la fusée", "Haut de la fusée"]
  };

  // Récupération des machines depuis l'API au chargement de la page
  useEffect(() => {
    fetch(`${API_URL}/api/machines`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Ajouter le token d'authentification si nécessaire :
        // "Authorization": `Bearer ${yourToken}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des machines");
        }
        return response.json();
      })
      .then((data) => {
        setMachines(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filtrage automatique en fonction de l'utilisateur connecté
  const filteredMachinesAuto = machines.filter(machine =>
    currentUser.accessibleSites.includes(machine.sites[0]) && // simplification : en prenant le premier site
    currentUser.accessiblePoles.includes(machine.mainPole)
  );

  // Filtrage dynamique secondaire via les inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSecondaryFilter(prev => ({ ...prev, [name]: value }));
  };

  const finalMachines = filteredMachinesAuto.filter(machine => {
    const matchSite = secondaryFilter.site ? machine.sites.includes(secondaryFilter.site) : true;
    const matchPole = secondaryFilter.pole ? machine.mainPole === secondaryFilter.pole : true;
    return matchSite && matchPole;
  });

  // Regroupement par site (pour affichage hiérarchique)
  const groupedBySite = finalMachines.reduce((acc, machine) => {
    const site = machine.sites[0]; // simplification : on prend le premier site
    if (!acc[site]) {
      acc[site] = [];
    }
    acc[site].push(machine);
    return acc;
  }, {});

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-base-100">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Liste des Machines</h1>
        {/* Filtres dynamiques */}
        <div className="mb-4 flex space-x-4">
          <input 
            type="text" 
            name="site" 
            placeholder="Filtrer par Site" 
            className="input input-bordered" 
            value={secondaryFilter.site}
            onChange={handleFilterChange}
          />
          <input 
            type="text" 
            name="pole" 
            placeholder="Filtrer par Pôle" 
            className="input input-bordered" 
            value={secondaryFilter.pole}
            onChange={handleFilterChange}
          />
        </div>
        
        {/* Affichage en fonction du regroupement par site */}
        {Object.keys(groupedBySite).length > 1 ? (
          Object.keys(groupedBySite).map(site => (
            <div key={site} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Site : {site}</h2>
              {groupBy(groupedBySite[site], "mainPole").map(({ group, machines: groupMachines }) => (
                <div key={group} className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Pôle : {group}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {groupMachines.map(machine => (
                      <MachineCard key={machine._id} machine={machine} user={currentUser} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {finalMachines.map(machine => (
              <MachineCard key={machine._id} machine={machine} user={currentUser} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fonction utilitaire pour regrouper un tableau par une clé (ici, "mainPole")
 * Renvoie un tableau d’objets { group, machines }.
 */
function groupBy(arr, key) {
  const groups = {};
  arr.forEach(item => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });
  return Object.keys(groups).map(group => ({ group, machines: groups[group] }));
}
