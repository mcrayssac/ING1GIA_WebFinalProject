"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AddSensorPage() {
  const [sensor, setSensor] = useState({
    designation: "",
    requiredGrade: "Technician",
    supplier: "",
    CreatedAt: new Date().toISOString().split("T")[0], // default to today's date
  });
  
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSensor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sensor),
      });

      if (!response.ok) throw new Error("Failed to add sensor");

      await response.json();
      alert("Sensor added successfully!");

      router.push("/sensors"); 
    } catch (err) {
      console.error("Error adding sensor:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Sensor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sensor Name*</label>
          <Input
            name="designation"
            value={sensor.designation }
            onChange={handleChange}
            placeholder="Enter sensor designation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Required Grade*</label>
          <select
            name="requiredGrade"
            value={sensor.requiredGrade}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Apprenti">Apprenti</option>
            <option value="Technicien">Technicien</option>
            <option value="Ingénieur">Ingénieur</option>
            <option value="Responsable">Responsable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier</label>
          <Input
            name="supplier"
            value={sensor.supplier}
            onChange={handleChange}
            placeholder="Enter supplier name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Created At*</label>
          <Input
            name="CreatedAt"
            type="date"
            value={sensor.CreatedAt}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4">
          <Button type="submit" >
            Add Sensor
          </Button>
        </div>
      </form>
    </div>
  );
}
