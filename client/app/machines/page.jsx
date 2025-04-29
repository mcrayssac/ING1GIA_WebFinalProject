"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Loading from "@/components/loading";
import Alert from "@/components/alert";

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les machines");
        return res.json();
      })
      .then((data) => {
        setMachines(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading className="m-8" />;
  if (error) return <Alert type="error" message={error} className="m-8" />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Toutes les machines</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Link
            key={machine._id}
            href={`/machines/${machine._id}/start-cycle`}
            className="block border rounded p-4 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{machine.name}</h2>
            <p className="text-sm text-gray-600">
              Pôle / Sous-pôle : {machine.mainPole} / {machine.subPole}
            </p>
            <p className="mt-2 text-sm">
              Statut :{" "}
              <span
                className={
                  machine.status === "available"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {machine.status}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
