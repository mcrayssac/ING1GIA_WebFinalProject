"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SensorsPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`);
        if (!response.ok) throw new Error("Failed to fetch sensors");
        const data = await response.json();
        setSensors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  const handleDelete = async (sensorId) => {
    if (window.confirm("Are you sure you want to delete this sensor?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${sensorId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete sensor");

        setSensors(sensors.filter((sensor) => sensor._id !== sensorId)); // Remove from local state
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleRowClick = (sensorId) => {
    router.push(`/sensorsDetail/${sensorId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sensors List</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : sensors.length === 0 ? (
        <div>No sensors available</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>designation</th>
              <th>Required Grade</th>
              <th>Supplier</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
              <tr key={sensor._id} onClick={() => handleRowClick(sensor._id)} className="cursor-pointer">
                <td>{sensor.designation}</td>
                <td>{sensor.requiredGrade}</td>
                <td>{sensor.supplier || "N/A"}</td>
                <td>{new Date(sensor.CreatedAt).toLocaleDateString()}</td>
                <td>
                  <Button onClick={(e) => { e.stopPropagation(); handleDelete(sensor._id); }}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
