"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext"; // ✅ corriger l'import ici
import { gradeOrder } from "@/utils/gradeUtils"; // contient { Apprentice: 0, Technician: 1, Engineer: 2, Manager: 3 }

const normalizeId = (id) =>
  typeof id === "object" && id !== null
    ? id._id ?? JSON.stringify(id)
    : id?.toString?.() ?? String(id);

export default function MachineDetailPage() {
  const { id: machineId } = useParams();
  const router = useRouter();
  const { user } = useUser(); // ✅ récupération du user et de son grade

  const [machine, setMachine] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const gradeOrder = {
    Apprentice: 0,
    Technician: 1,
    Engineer: 2,
    Manager: 3
  };
  
  useEffect(() => {
    if (!machineId) return;

    const fetchData = async () => {
      try {
        const [machineRes, sensorsRes, sitesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`),
        ]);
        if (!machineRes.ok) throw new Error("Machine not found");

        const [machineData, sensors, sites] = await Promise.all([
          machineRes.json(),
          sensorsRes.json(),
          sitesRes.json(),
        ]);

        const formatted = {
          ...machineData,
          availableSensors: machineData.availableSensors.map(normalizeId),
          sites: machineData.sites.map(normalizeId),
        };

        setMachine(formatted);
        setSensors(sensors);
        setSites(sites);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [machineId]);

  const handleStartCycle = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/start-cycle`,
        { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include" }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors du démarrage du cycle");
      }
      alert((await res.json()).message);
      const updated = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`).then(r => r.json());

      setMachine({
        ...updated,
        availableSensors: updated.availableSensors.map(normalizeId),
        sites: updated.sites.map(normalizeId),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} onClose={() => router.push("/machines")} />;
  if (!machine) return <p className="text-center text-gray-500">Machine introuvable.</p>;

  const userGradeLevel = gradeOrder[user?.grade?.name] ?? -1;
  const requiredMachineLevel = gradeOrder[machine.requiredGrade];

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">{machine.name}</h1>

      {!isEditing ? (
        <div className="space-y-6">
          <p><strong>Main Pole:</strong> {machine.mainPole}</p>
          <p><strong>Sub Pole:</strong> {machine.subPole}</p>
          <p><strong>Points Per Cycle:</strong> {machine.pointsPerCycle}</p>
          <p><strong>Max Users:</strong> {machine.maxUsers}</p>
          <p><strong>Required Grade:</strong> {machine.requiredGrade}</p>
          <p><strong>Status:</strong> {machine.status}</p>
          <p>
            <strong>Installation Sites:</strong>{" "}
            {machine.sites.map(siteId => {
              const site = sites.find(s => normalizeId(s._id) === normalizeId(siteId));
              return site?.name || siteId;
            }).join(", ")}
          </p>

          {/* Capteurs disponibles */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Capteurs disponibles</h2>
            <div className="flex flex-wrap gap-2">
              {machine.availableSensors.map(rawId => {
                const sensor = sensors.find(s => normalizeId(s._id) === normalizeId(rawId));
                if (!sensor) return null;

                const requiredSensorLevel = gradeOrder[sensor.requiredGrade];
                const hasAccess = userGradeLevel >= requiredSensorLevel;

                return (
                  <Button
                    key={sensor._id}
                    variant="outline"
                    disabled={!hasAccess}
                    onClick={() => hasAccess && router.push(`/machines/${machineId}/${sensor._id}`)}
                    className={!hasAccess ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {sensor.designation}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Bouton lancer un cycle */}
          <Button
            onClick={handleStartCycle}
            className="mt-6"
            disabled={userGradeLevel < requiredMachineLevel}
            variant="default"
          >
            {userGradeLevel < requiredMachineLevel ? "Cycle non autorisé" : "Lancer un cycle"}
          </Button>

          <div className="flex space-x-4 mt-6">
            <Button onClick={() => setIsEditing(true)} className="w-full">Edit</Button>
            <Link href="/machines"><Button className="w-full">Back to List</Button></Link>
          </div>
        </div>
      ) : (
        <div>{/* formulaire édition */}</div>
      )}
    </div>
  );
}
