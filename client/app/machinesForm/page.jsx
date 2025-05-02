"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";
export default function AddMachinePage() {
  const { user } = useUser();
  const router = useRouter();
  const [machine, setMachine] = useState({
    name: "",
    mainPole: "",
    subPole: "",
    pointsPerCycle: "",
    maxUsers: "",
    requiredGrade: "",
    status: "available",
    sites: [],
    availableSensors: [],
  });
  const [sites, setSites] = useState([]);
  const [Sensors, setSensors] = useState([]);
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
        setSensors(sensorsData);

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

  useEffect(() => {
    if (user === false) {
        router.replace('/login')
        return
    }
    if (user && !user.admin) {
        router.replace('/machines')
        return
    }

}, [user, router]) 


  

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
      console.log("Submitting form with machine data:", machine);

      const machineData = {
        name: machine.name,
        mainPole: machine.mainPole,
        subPole: machine.subPole,
        pointsPerCycle: Number(machine.pointsPerCycle),
        maxUsers: Number(machine.maxUsers),
        requiredGrade: machine.requiredGrade,
        status: machine.status,
        availableSensors: machine.availableSensors,
        sites: machine.sites,
      };

      console.log("Formatted machine data:", machineData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(machineData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || "Failed to add machine");
      }

      console.log("Machine added successfully!");
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
        availableSensors: [],
      });
      router.push("/machines")
    } catch (err) {
      console.error("Error adding machine:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;


  if (user === undefined) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }
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
              <label className="block text-sm font-medium text-gray-700">Sub Pole*</label>
              <Input
                name="subPole"
                value={machine.subPole}
                onChange={handleChange}
                placeholder="Enter sub pole"
                required
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">Available Sensors</label>
            <MultiSelect
              options={Sensors.map(sensor => ({
                value: sensor._id,
                label: sensor.designation
              }))}
              selected={machine.availableSensors.map(sensorId => {
                const sensor = Sensors.find(s => s._id === sensorId);
                return {
                  value: sensorId,
                  label: sensor?.designation || sensorId
                };
              })}
              
              onChange={(selected) => setMachine(prev => ({
                ...prev,
                availableSensors: selected.map(item => item.value)
              }))}
              placeholder="Select available sensors..."
            />
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