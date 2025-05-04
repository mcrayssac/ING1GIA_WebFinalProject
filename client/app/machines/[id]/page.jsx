"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useToastAlert } from "@/contexts/ToastContext";

const normalizeId = (id) =>
    typeof id === "object" && id !== null
        ? id._id ?? JSON.stringify(id)
        : id?.toString?.() ?? String(id);

export default function MachineDetailPage() {
    const { id: machineId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { toastError, toastSuccess } = useToastAlert();

    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = user?.admin === true;
    const gradeOrder = {
        Apprentice: 0,
        Technician: 1,
        Engineer: 2,
        Manager: 3,
    };

    useEffect(() => {
        if (!machineId) return;

        const fetchMachineData = async () => {
            try {
                const machineRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`,
                    { credentials: "include" }
                );
                
                if (!machineRes.ok) {
                    toastError("Machine not found");
                    router.push("/machines");
                    return;
                }

                const machineData = await machineRes.json();
                setMachine({
                    ...machineData,
                    availableSensors: machineData.availableSensors || [],
                    sites: [machineData.site].filter(Boolean),
                    currentUsers: machineData.currentUsers || [],
                    usageStats: machineData.usageStats || [],
                    totalCycles: machineData.totalCycles || 0
                });
            } catch (err) {
                toastError("Failed to load machine data");
                router.push("/machines");
            } finally {
                setLoading(false);
            }
        };

        fetchMachineData();
    }, [machineId, router, toastError]);

    const handleStartCycle = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}/start-cycle`,
                { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include" }
            );
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to start cycle");
            }
            
            const data = await res.json();
            toastSuccess(data.message);
            
            const machineRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`,
                { credentials: "include" }
            );
            
            const updated = await machineRes.json();
            setMachine({
                ...updated,
                availableSensors: updated.availableSensors || [],
                sites: [updated.site].filter(Boolean),
                currentUsers: updated.currentUsers || [],
                usageStats: updated.usageStats || [],
                totalCycles: updated.totalCycles || 0
            });
        } catch (err) {
            toastError(err.message);
        }
    };

    if (loading) return <Loading />;
    if (!machine) return null;

    const userGradeLevel = gradeOrder[user?.grade?.name] ?? -1;
    const requiredMachineLevel = gradeOrder[machine.requiredGrade];

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 text-center">{machine.name}</h1>

            {!isEditing ? (
                <div className="space-y-6">
                    <p><strong>Main Pole:</strong> {machine.mainPole}</p>
                    <p><strong>Sub Pole:</strong> {machine.subPole}</p>
                    <p><strong>Points Per Cycle:</strong> {machine.pointsPerCycle}</p>
                    <p><strong>Max Users:</strong> {machine.maxUsers}</p>
                    <p><strong>Required Grade:</strong> {machine.requiredGrade}</p>
                    <p><strong>Status:</strong> {machine.status}</p>
                    <p><strong>Total Cycles:</strong> {machine.totalCycles}</p>
                    <p>
                        <strong>Installation Site:</strong>{" "}
                        {machine.sites[0]?.name || "No site assigned"}
                    </p>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Available Sensors</h2>
                        <div className="flex flex-wrap gap-2">
                            {machine.availableSensors.map(sensor => {
                                if (!sensor) return null;
                                const requiredSensorLevel = gradeOrder[sensor.requiredGrade];
                                const hasAccess = userGradeLevel >= requiredSensorLevel || isAdmin;

                                return (
                                    <Button
                                        key={sensor._id}
                                        variant="outline"
                                        disabled={!hasAccess}
                                        onClick={() => hasAccess && router.push(`/machines/${machineId}/${sensor._id}`)}
                                        className={!hasAccess ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        {sensor.designation}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        onClick={handleStartCycle}
                        className="mt-6"
                        disabled={userGradeLevel < requiredMachineLevel && !isAdmin}
                        variant="default"
                    >
                        {userGradeLevel < requiredMachineLevel && !isAdmin
                            ? "Cycle not authorized"
                            : "Start cycle"}
                    </Button>

                    <div className="flex space-x-4 mt-6">
                        <Link href="/machines"><Button className="w-full">Back to List</Button></Link>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
}
