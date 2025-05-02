"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import MultiSelect from "@/components/ui/multi-select";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MachineDetailPage() {
    const { user } = useUser();
    const router = useRouter();
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        mainPole: "",
        subPole: "",
        name: "",
        pointsPerCycle: "",
        maxUsers: "",
        requiredGrade: "",
        status: "",
        availableSensors: [],
        sites: [],
    });

    const [grades, setGrades] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [sites, setSites] = useState([]);

    const { id } = useParams();
    const isAdmin = user?.admin === true;

    useEffect(() => {
        if (!id) return;

        const fetchMachine = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${id}`);
                console.log(response);
                if (!response.ok) throw new Error("Failed to fetch machine details");
                const data = await response.json();
                setMachine(data);
                setFormData({
                    mainPole: data.mainPole || "",
                    subPole: data.subPole || "",
                    name: data.name || "",
                    pointsPerCycle: data.pointsPerCycle || "",
                    maxUsers: data.maxUsers || "",
                    requiredGrade: data.requiredGrade || "",
                    status: data.status || "available",
                    availableSensors: data.availableSensors || [],
                    sites: data.sites || [],
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchDropdownData = async () => {
            try {
                const [gradesRes, sensorsRes, sitesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/grades`),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sites`),
                ]);

                if (!gradesRes.ok || !sensorsRes.ok || !sitesRes.ok) {
                    throw new Error("Failed to fetch dropdown data");
                }

                setGrades(await gradesRes.json());
                setSensors(await sensorsRes.json());
                setSites(await sitesRes.json());
            } catch (err) {
                setError(err.message);
            }
        };

        fetchMachine();
        fetchDropdownData();

        if (user === false) {
            router.replace('/login')
            return
        }
    }, [id, user, router]);

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error("Failed to update machine details");
            }
            const updatedMachine = await response.json();
            setMachine(updatedMachine);
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
                        {machine?.name} Details
                    </h1>
                    {isEditing ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">Main Pole:</label>
                                <input
                                    type="text"
                                    name="mainPole"
                                    value={formData.mainPole}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">Sub Pole:</label>
                                <input
                                    type="text"
                                    name="subPole"
                                    value={formData.subPole}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">Points Per Cycle:</label>
                                <input
                                    type="number"
                                    name="pointsPerCycle"
                                    value={formData.pointsPerCycle}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">Max Users:</label>
                                <input
                                    type="number"
                                    name="maxUsers"
                                    value={formData.maxUsers}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Required Grade*</label>
                                <Select
                                    value={formData.requiredGrade}
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
                                    value={formData.status}
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
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Installation Sites</label>
                                <MultiSelect
                                    options={sites.map((site) => ({
                                        value: site._id,
                                        label: site.name,
                                    }))}
                                    selected={formData.sites.map((siteId) => {
                                        const site = sites.find((s) => s._id === siteId);
                                        return {
                                            value: siteId,
                                            label: site?.name || siteId,
                                        };
                                    })}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            sites: selected.map((item) => item.value),
                                        }))
                                    }
                                    placeholder="Select installation sites..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Available Sensors</label>
                                <MultiSelect
                                    options={sensors.map((sensor) => ({
                                        value: sensor._id,
                                        label: sensor.designation,
                                    }))}
                                    selected={formData.availableSensors.map((sensorId) => {
                                        const sensor = sensors.find((s) => s._id === sensorId);
                                        return {
                                            value: sensorId,
                                            label: sensor?.designation || sensorId,
                                        };
                                    })}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            availableSensors: selected.map((item) => item.value),
                                        }))
                                    }
                                    placeholder="Select available sensors..."
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
                                <strong className="font-semibold text-gray-700">Main Pole:</strong> {machine?.mainPole}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Sub Pole:</strong> {machine?.subPole}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Points Per Cycle:</strong> {machine?.pointsPerCycle}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Max Users:</strong> {machine?.maxUsers}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Required Grade:</strong> {machine?.requiredGrade}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Status:</strong> {machine?.status}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Installation Sites:</strong>{" "}
                                {machine?.sites.map((siteId) => {
                                    const site = sites.find((s) => s._id === siteId);
                                    return site?.name || siteId;
                                }).join(", ")}
                            </p>
                            <p className="text-lg">
                                <strong className="font-semibold text-gray-700">Available Sensors:</strong>{" "}
                                {machine?.availableSensors.map((sensorId) => {
                                    const sensor = sensors.find((s) => s._id === sensorId);
                                    return sensor?.designation || sensorId;
                                }).join(", ")}
                            </p>
                            <div className="flex space-x-4">
                            {isAdmin && (
                                <Button onClick={() => setIsEditing(true)} className="w-full">
                                    Edit
                                </Button>
                                  )}
                                <Link href="/machines">
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