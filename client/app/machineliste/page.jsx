// machineliste/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Exemple de données machines (vous pourrez les récupérer depuis votre API dans un vrai projet)
const sampleMachines = [
  {
    _id: "1",
    mainPole: "Bas de la fusée",
    subPole: "Injection carburant",
    name: "Injecteur Cryogénique A1",
    pointsPerCycle: 20,
    maxUsers: 2,
    status: "available", // ou "in-use"
    availableSensors: [
      { sensorName: "Pression", requiredGrade: "Technicien confirmé" },
      { sensorName: "Flux", requiredGrade: "Technicien confirmé" },
      { sensorName: "Température", requiredGrade: "Technicien" }
    ],
    sites: ["Site A"],
  },
  {
    _id: "2",
    mainPole: "Bas de la fusée",
    subPole: "Injection carburant",
    name: "Injecteur Cryogénique B1",
    pointsPerCycle: 20,
    maxUsers: 2,
    status: "in-use",
    availableSensors: [
      { sensorName: "Pression", requiredGrade: "Technicien confirmé" },
      { sensorName: "Flux", requiredGrade: "Technicien confirmé" },
      { sensorName: "Température", requiredGrade: "Technicien" }
    ],
    sites: ["Site A"],
  },
  {
    _id: "3",
    mainPole: "Haut de la fusée",
    subPole: "Navigation",
    name: "Système de Navigation X1",
    pointsPerCycle: 25,
    maxUsers: 1,
    status: "available",
    availableSensors: [
      { sensorName: "Vitesse rotationnelle", requiredGrade: "Ingénieur" },
      { sensorName: "Température", requiredGrade: "Technicien" }
    ],
    sites: ["Site B"],
  }
];

// Exemple d'utilisateur courant
// Pour un responsable, on pourrait avoir accès à plusieurs sites et pôles.
const currentUser = {
  _id: "user123",
  username: "responsable1",
  grade: "Responsable", // ou "Technicien" ou "Ingénieur", etc.
  accessibleSites: ["Site A", "Site B"], // sites auxquels l'utilisateur a accès
  accessiblePoles: ["Bas de la fusée", "Haut de la fusée"] // pôles auxquels l'utilisateur a accès
};

/**
 * Fonction simple pour déterminer l'accès à un capteur.
 * Ici, on suppose qu'un utilisateur a accès au capteur si son grade (ou rôle) correspond
 * à celui requis, ou si l'utilisateur est Responsable (accès complet).
 * (Cette logique doit être adaptée selon la hiérarchie de vos grades.)
 */
const hasAccessToSensor = (userGrade, sensorRequiredGrade) => {
  if (userGrade === "Responsable") return true;
  // Exemples de hiérarchie (à adapter !) :
  const grades = ["Apprenti", "Technicien", "Technicien confirmé", "Ingénieur", "Ingénieur confirmé"];
  const userIndex = grades.indexOf(userGrade);
  const requiredIndex = grades.indexOf(sensorRequiredGrade);
  return userIndex >= requiredIndex;
};

export default function MachineListePage() {
  // Pour cet exemple, nous utilisons des données statiques
  const [machines, setMachines] = useState(sampleMachines);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [secondaryFilter, setSecondaryFilter] = useState({ site: "", pole: "" });

  // Filtrage automatique en fonction de l'utilisateur
  useEffect(() => {
    // On filtre les machines auxquelles l'utilisateur a accès par rapport à son accessibleSites et accessiblePoles.
    const autoFiltered = machines.filter(machine =>
      currentUser.accessibleSites.includes(machine.sites[0]) && // ici, on prend le premier site pour simplifier
      currentUser.accessiblePoles.includes(machine.mainPole)
    );
    setFilteredMachines(autoFiltered);
  }, [machines]);

  // Filtrage dynamique supplémentaire via les inputs (site et pôle)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSecondaryFilter(prev => ({ ...prev, [name]: value }));
  };

  const finalMachines = filteredMachines.filter(machine => {
    const matchSite = secondaryFilter.site ? machine.sites.includes(secondaryFilter.site) : true;
    const matchPole = secondaryFilter.pole ? machine.mainPole === secondaryFilter.pole : true;
    return matchSite && matchPole;
  });

  // Pour le rendu, pour un responsable ayant accès à plusieurs sites, on peut regrouper
  // par site. Ici, nous faisons un regroupement simple.
  const groupedBySite = finalMachines.reduce((acc, machine) => {
    const site = machine.sites[0]; // ici, on suppose que chaque machine a un seul site pour simplifier
    if (!acc[site]) {
      acc[site] = [];
    }
    acc[site].push(machine);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 bg-base-100">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Liste des Machines</h1>
        {/* Section des filtres dynamiques */}
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

        {/* Pour un utilisateur avec accès à un seul site/pôle, on affiche directement la grille */}
        {/* Pour un responsable, on regroupe par site */}
        {Object.keys(groupedBySite).length > 1 ? (
          Object.keys(groupedBySite).map(site => (
            <div key={site} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Site: {site}</h2>
              {/* Regrouper par pole pour ce site */}
              {groupBy(groupedBySite[site], "mainPole").map(({group, machines: groupMachines}) => (
                <div key={group} className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Pôle: {group}</h3>
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
          // Sinon, afficher une grille simple
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
 * Renvoie un tableau de { group: valeur, machines: [...] }
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
 * Composant pour afficher une carte machine.
 * Affiche le nom, le sous-pôle, le statut (vert si "available", rouge sinon), 
 * le nombre de points par cycle, et les boutons sensoriels.
 * Les boutons sensoriels sont activés ou grisés en fonction du grade utilisateur.
 */
function MachineCard({ machine, user }) {
  // Ici, une simple condition : si le status est "in-use" et la machine n'a plus de place, on grise le bouton
  const isAvailable = machine.status === "available" || machine.currentUsers.length < machine.maxUsers;
  
  return (
    <div className={`border rounded p-4 shadow ${!isAvailable ? "bg-gray-300" : "bg-white"}`}>
      <h3 className="text-xl font-bold">{machine.name}</h3>
      <p className="text-sm text-gray-700">Sous-pôle : {machine.subPole}</p>
      <p className="text-sm">Points par cycle : {machine.pointsPerCycle}</p>
      <p className="text-sm">Statut : <span className={isAvailable ? "text-green-600" : "text-red-600"}>{machine.status}</span></p>
      <div className="mt-2 flex flex-wrap gap-2">
        {machine.availableSensors.map(sensor => {
          const accessible = hasAccessToSensor(user.grade, sensor.requiredGrade);
          return (
            <button
              key={sensor.sensorName}
              className={`btn btn-xs ${accessible ? "btn-primary" : "btn-disabled"}`}
              // Si accessible, le bouton redirige vers une page de détails sensoriels (ex: `/machines/[id]/sensors/[sensorName]`)
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
            // Ici, on pourrait appeler une API pour démarrer le cycle de travail
            // par exemple, envoyer une requête POST vers `/api/machines/${machine._id}/start-work`
            window.alert("Cycle de travail démarré (simulation) !");
          }}
        >
          Travailler
        </button>
      </div>
    </div>
  );
}
