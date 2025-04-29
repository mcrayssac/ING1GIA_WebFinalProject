"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

export default function AddMachinePage() {
  const [machine, setMachine] = useState({
    name: "",
    mainPole: "",
    subPole: "",
    pointsPerCycle: "",
    maxUsers: "",
    requiredGrade: "",
    status: "available",
    sites: [],
    availableSensors: []
  });

  const [sites, setSites] = useState([]);
  const [allSensors, setAllSensors] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sites
        const sitesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`);
        if (!sitesRes.ok) throw new Error("Failed to fetch sites");
        const sitesData = await sitesRes.json();
        setSites(sitesData);

        // Fetch sensors
        const sensorsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`);
        if (!sensorsRes.ok) throw new Error("Failed to fetch sensors");
        const sensorsData = await sensorsRes.json();
        setAllSensors(sensorsData);

        // Fetch grades
        const gradesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`);
        if (!gradesRes.ok) throw new Error("Failed to fetch grades");
        const gradesData = await gradesRes.json();
        setGrades(gradesData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMachine((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setMachine((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const machineData = {
        name: machine.name,
        mainPole: machine.mainPole,
        subPole: machine.subPole,
        pointsPerCycle: Number(machine.pointsPerCycle),
        maxUsers: Number(machine.maxUsers),
        requiredGrade: machine.requiredGrade,
        status: machine.status,
        availableSensors: machine.availableSensors.map(sensor => ({
          designation: sensor.designation,
          requiredGrade: sensor.requiredGrade
        })),
        sites: machine.sites,
        currentUsers: [],
        usageStats: []
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(machineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add machine");
      }

      alert("Machine added successfully!");
      setMachine({
        name: "",
        mainPole: "",
        subPole: "",
        pointsPerCycle: "",
        maxUsers: "",
        requiredGrade: "",
        status: "available",
        sites: [],
        availableSensors: []
      });

    } catch (err) {
      console.error("Error adding machine:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Machine</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 border">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Machine Name*</label>
              <Input
                name="name"
                value={machine.name}
                onChange={handleChange}
                placeholder="Enter machine name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Main Pole*</label>
              <Input
                name="mainPole"
                value={machine.mainPole}
                onChange={handleChange}
                placeholder="Enter main pole"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sub Pole</label>
              <Input
                name="subPole"
                value={machine.subPole}
                onChange={handleChange}
                placeholder="Enter sub pole"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Points Per Cycle*</label>
              <Input
                name="pointsPerCycle"
                type="number"
                value={machine.pointsPerCycle}
                onChange={handleChange}
                placeholder="Enter points per cycle"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Max Users*</label>
              <Input
                name="maxUsers"
                type="number"
                value={machine.maxUsers}
                onChange={handleChange}
                placeholder="Enter max users"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Required Grade*</label>
              <Select
                value={machine.requiredGrade}
                onValueChange={(value) => handleSelectChange("requiredGrade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade._id} value={grade.name}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status*</label>
              <Select
                value={machine.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Installation Sites</label>
            <MultiSelect
              options={sites.map(site => ({
                value: site._id,
                label: site.name
              }))}
              selected={machine.sites.map(siteId => {
                const site = sites.find(s => s._id === siteId);
                return {
                  value: siteId,
                  label: site?.name || siteId
                };
              })}
              onChange={(selected) => setMachine(prev => ({
                ...prev,
                sites: selected.map(item => item.value)
              }))}
              placeholder="Select installation sites..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configure Sensors</h3>

            <div className="space-y-2">
              {machine.availableSensors.map((sensor, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <div className="flex-1 font-medium">{sensor.designation}</div>
                  <Select
                    value={sensor.requiredGrade}
                    onValueChange={(value) => {
                      const updatedSensors = [...machine.availableSensors];
                      updatedSensors[index].requiredGrade = value;
                      setMachine(prev => ({
                        ...prev,
                        availableSensors: updatedSensors
                      }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade._id} value={grade.name}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedSensors = machine.availableSensors
                        .filter((_, i) => i !== index);
                      setMachine(prev => ({
                        ...prev,
                        availableSensors: updatedSensors
                      }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Select
                onValueChange={(value) => {
                  const sensor = allSensors.find(s => s._id === value);
                  if (sensor && !machine.availableSensors.some(s => s.designation === sensor.name)) {
                    setMachine(prev => ({
                      ...prev,
                      availableSensors: [
                        ...prev.availableSensors,
                        {
                          designation: sensor.name,
                          requiredGrade: grades[0]?.name || "technicien"
                        }
                      ]
                    }));
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {allSensors
                    .filter(sensor => !machine.availableSensors.some(s => s.designation === sensor.name))
                    .map(sensor => (
                      <SelectItem key={sensor._id} value={sensor._id}>
                        {sensor.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add Machine"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
