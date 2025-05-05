"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useToastAlert } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { Loader2, Cpu, ArrowLeft, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2
        }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

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
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${id}`, {
                    credentials: "include"
                });
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

    const { toastSuccess, toastError } = useToastAlert();

    const handleSave = async () => {
        try {
            // Validate form data
            if (!formData.designation || !formData.requiredGrade) {
                throw new Error("Designation and Required Grade are required fields");
            }

            // Validate required grade
            const validGrades = ['Apprentice', 'Technician', 'Engineer', 'Manager'];
            if (!validGrades.includes(formData.requiredGrade)) {
                throw new Error("Invalid Required Grade. Must be one of: " + validGrades.join(", "));
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update sensor details");
            }

            setSensor(data);
            setIsEditing(false);
            toastSuccess("Sensor updated successfully");
        } catch (err) {
            toastError(err.message);
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
        <motion.div
            className="container mx-auto px-6 py-12 h-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {loading ? (
                <div className="text-center text-lg font-semibold">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500 font-semibold">Error: {error}</div>
            ) : (
                <div className="bg-background p-8 space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Cpu className="h-6 w-6 text-primary-foreground" />
                            </motion.div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                {sensor?.designation}
                            </h1>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/sensors">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to List
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit-form"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="grid gap-6">
                                    <div>
                                        <label className="block font-semibold text-primary mb-2">Designation:</label>
                                        <Input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-primary mb-2">Required Grade:</label>
                                        <select
                                            name="requiredGrade"
                                            value={formData.requiredGrade}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Grade</option>
                                            <option value="Apprentice">Apprentice</option>
                                            <option value="Technician">Technician</option>
                                            <option value="Engineer">Engineer</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-primary mb-2">Supplier:</label>
                                        <Input
                                            type="text"
                                            name="supplier"
                                            value={formData.supplier}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </motion.div>
                                    <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsEditing(false)}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view-details"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sensor Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4">
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-semibold text-muted-foreground">Required Grade</span>
                                                <span className="text-primary-foreground">{sensor?.requiredGrade}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-semibold text-muted-foreground">Supplier</span>
                                                <span className="text-primary-foreground">{sensor?.supplier || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="font-semibold text-muted-foreground">Created At</span>
                                                <span className="text-primary-foreground">
                                                    {new Date(sensor?.CreatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="pt-4"
                                            >
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full flex items-center justify-center gap-2"
                                                >
                                                    Edit Sensor
                                                </Button>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div >
    );
}
