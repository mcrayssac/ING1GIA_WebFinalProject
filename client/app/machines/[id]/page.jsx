"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import { Button } from "@/components/ui/button";

export default function MachineDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [machine, setMachine] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Machine not found");
        return res.json();
      })
      .then(setMachine)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartCycle = () => {
    console.log("Cycle started (à implémenter)");
    // Tu ajouteras ici une requête POST pour déclencher un cycle, ajouter des points, etc.
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} onClose={() => router.push("/machines")} />;
  if (!machine) return <p className="text-center text-gray-500">Machine introuvable.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{machine.name}</h1>

      <div className="text-sm text-gray-600 mb-4">
        <p><strong>Status :</strong> {machine.status}</p>
        <p><strong>Points par cycle :</strong> {machine.pointsPerCycle}</p>
        <p><strong>Utilisateurs max :</strong> {machine.maxUsers}</p>
        <p><strong>Niveau requis :</strong> {machine.requiredGrade}</p>
        <p><strong>Pôle :</strong> {machine.mainPole} / {machine.subPole}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Capteurs disponibles</h2>
        <div className="flex flex-wrap gap-2">
          {machine.availableSensors?.length > 0 ? (
            machine.availableSensors.map((sensor) => (
              <Button
                key={sensor._id}
                variant="outline"
                onClick={() => console.log(`Capteur ${sensor.designation}`)}
              >
                {sensor.designation}
              </Button>
            ))
          ) : (
            <p className="text-sm text-gray-500">Aucun capteur enregistré</p>
          )}
        </div>
      </div>

      <Button className="mt-6" onClick={handleStartCycle}>
        Lancer un cycle
      </Button>
    </div>
  );
}
