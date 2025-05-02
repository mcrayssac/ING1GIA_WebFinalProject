"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SensorDetailPage() {
  const { user } = useUser();
  const router = useRouter();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    designation: "",
    requiredGrade: "",
    supplier: "",
  });
  const { id } = useParams();
  const isAdmin = user?.admin === true;

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

    if (user === false) {
      router.replace('/login')
      return
  }
  }, [id, user, router]);


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
      if (!response.ok) {
        throw new Error("Failed to update sensor details");
      }
      const updatedSensor = await response.json();
      setSensor(updatedSensor);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };
  if (user === undefined) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}
  return (
    <div className="container mx-auto px-6 py-12">
      {loading ? (
        <div className="text-center text-lg font-semibold">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">Error: {error}</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 space-y-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {sensor?.designation} Details
          </h1>
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Designation:</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Required Grade:</label>
                <input
                  type="text"
                  name="requiredGrade"
                  value={formData.requiredGrade}
                  onChange={handleInputChange}
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Supplier:</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleSave} className="w-full">
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg">
                <strong className="font-semibold text-gray-700">Required Grade:</strong>{" "}
                {sensor?.requiredGrade}
              </p>
              <p className="text-lg">
                <strong className="font-semibold text-gray-700">Supplier:</strong>{" "}
                {sensor?.supplier || "N/A"}
              </p>
              <p className="text-lg">
                <strong className="font-semibold text-gray-700">Created At:</strong>{" "}
                {new Date(sensor?.CreatedAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-4">
              {isAdmin && (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit
                </Button>
                  )}
                <Link href="/sensors">
                  <Button className="w-full">Back to List</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
