"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Only used for navigation
import { useParams } from 'next/navigation'; // To get dynamic params
import Link from "next/link";  

export default function SensorDetailPage() {
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    designation: "",
    requiredGrade: "",
    supplier: "",
  });

  // Access the dynamic route parameters using useParams hook
  const { id } = useParams();  // id from dynamic route

  useEffect(() => {
    if (!id) return;

    const fetchSensor = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${id}`);
        if (!response.ok) throw new Error("Failed to fetch sensor details");
        const data = await response.json();
        setSensor(data);
        setFormData({
          designation: data.designation || "",
          requiredGrade: data.requiredGrade || "",
          supplier: data.supplier || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensor();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update sensor details");
      const updatedSensor = await response.json();
      setSensor(updatedSensor);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">{sensor?.designation} Details</h1>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-bold">Designation:</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block font-bold">Required Grade:</label>
                <input
                  type="text"
                  name="requiredGrade"
                  value={formData.requiredGrade}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block font-bold">Supplier:</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                <strong>Required Grade:</strong> {sensor?.requiredGrade}
              </p>
              <p>
                <strong>Supplier:</strong> {sensor?.supplier || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(sensor?.CreatedAt).toLocaleDateString()}
              </p>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
              <Link href="/sensors">
                <Button>Back to List</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
