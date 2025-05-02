"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import MultiSelect from "@/components/ui/multi-select";

/* ------------------------------------------------------------------ */
/* Helper : ID stable ------------------------------------------------ */
const normalizeId = (id) =>
  typeof id === "object" && id !== null
    ? id._id ?? JSON.stringify(id)
    : id?.toString?.() ?? String(id);
/* ------------------------------------------------------------------ */

export default function MachineDetailPage() {
  const { id: machineId } = useParams();
  const router            = useRouter();

  const [machine, setMachine] = useState(null);
  const [formData, setFormData] = useState({});
  const [grades,  setGrades]  = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sites,   setSites]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  /* --------------------------- fetch ----------------------------- */
  useEffect(() => {
    if (!machineId) return;

    const fetchData = async () => {
      try {
        const [machineRes, gradesRes, sensorsRes, sitesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`),
        ]);
        if (!machineRes.ok) throw new Error("Machine not found");

        const [machineData, grades, sensors, sites] = await Promise.all([
          machineRes.json(), gradesRes.json(), sensorsRes.json(), sitesRes.json(),
        ]);

        const formatted = {
          ...machineData,
          availableSensors: machineData.availableSensors.map(normalizeId),
          sites:            machineData.sites.map(normalizeId),
        };

        setMachine(formatted);
        setFormData({
          name: formatted.name || "",
          mainPole: formatted.mainPole || "",
          subPole: formatted.subPole || "",
          pointsPerCycle: formatted.pointsPerCycle || 0,
          maxUsers: formatted.maxUsers || 1,
          requiredGrade: formatted.requiredGrade || "",
          status: formatted.status || "available",
          availableSensors: formatted.availableSensors,
          sites: formatted.sites,
        });
        setGrades(grades);
        setSensors(sensors);
        setSites(sites);
      } catch (err) { setError(err.message); }
      finally       { setLoading(false); }
    };

    fetchData();
  }, [machineId]);

  /* --------------------- handlers principaux -------------------- */
  const handleStartCycle = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/start-cycle`,
        { method:"POST", headers:{ "Content-Type":"application/json" } }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors du démarrage du cycle");
      }
      alert((await res.json()).message);

      // rafraîchit la machine après démarrage
      const updated = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`
      ).then(r=>r.json());

      setMachine({
        ...updated,
        availableSensors: updated.availableSensors.map(normalizeId),
        sites:            updated.sites.map(normalizeId),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  /* (handleSave, handleInputChange … inchangés si vous en avez besoin) */

  /* --------------------------- render ---------------------------- */
  if (loading) return <Loading/>;
  if (error)
    return <Alert type="error" message={error} onClose={()=>router.push("/machines")}/>;
  if (!machine)
    return <p className="text-center text-gray-500">Machine introuvable.</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">{machine.name}</h1>

      {/* ------------------------------------------------------------ */}
      {/* MODE LECTURE                                                */}
      {/* ------------------------------------------------------------ */}
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
            {machine.sites.map((siteId)=>{
              const site = sites.find((s)=>normalizeId(s._id)===normalizeId(siteId));
              return site?.name || siteId;
            }).join(", ")}
          </p>

          {/* Capteurs disponibles ---------------------------------- */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Capteurs disponibles</h2>
            <div className="flex flex-wrap gap-2">
              {machine.availableSensors.map((rawId)=>{
                const sensor = sensors.find((s)=>normalizeId(s._id)===normalizeId(rawId));
                if (!sensor) return null;                        // par sûreté
                return (
                  <Button
                    key={sensor._id}
                    variant="outline"
                    onClick={()=>router.push(`/machines/${machineId}/${sensor._id}`)}
                  >
                    {sensor.designation}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions machine -------------------------------------- */}
          <Button onClick={handleStartCycle} className="mt-6">
            Lancer un cycle
          </Button>
          <div className="flex space-x-4 mt-6">
            <Button onClick={()=>setIsEditing(true)} className="w-full">Edit</Button>
            <Link href="/machines"><Button className="w-full">Back to List</Button></Link>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------- */
        /* MODE ÉDITION – conservez votre bloc d’édition complet    */
        /* -------------------------------------------------------- */
        <div> {/* … formulaire d’édition ici … */}</div>
      )}
    </div>
  );
}
