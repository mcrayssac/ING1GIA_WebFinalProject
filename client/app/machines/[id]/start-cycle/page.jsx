"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToastAlert } from "@/contexts/ToastContext";

export default function StartCyclePage() {
  const { id: machineId } = useParams();
  const { toastSuccess, toastError } = useToastAlert();
  const [loading, setLoading] = useState(false);

  if (!machineId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Chargement de la machine…</p>
      </div>
    );
  }

  const handleStartCycle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Utilisateur non authentifié");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/start-cycle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur démarrage du cycle");
      }
      toastSuccess("Cycle de travail démarré !");
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <h1 className="text-2xl font-bold text-center">
              Démarrer le cycle de la machine
            </h1>
            <p className="text-center">
              ID de la machine : <strong>{machineId}</strong>
            </p>
            <Button
              onClick={handleStartCycle}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Cycle en cours…" : "Lancer le cycle de 1 h"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
