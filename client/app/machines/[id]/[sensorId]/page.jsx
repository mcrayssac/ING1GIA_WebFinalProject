/* /app/machines/[id]/[sensorId]/page.jsx */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid, ResponsiveContainer, Brush,
} from "recharts";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import Alert from "@/components/alert";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";

/* ────── constantes ────── */
const COLORS = ["#00a6fb", "#0077b6", "#00b4d8"];
const STEP_SEC = 10;                       // 1 point / 10 s
const DAY_POINTS = 86_400 / STEP_SEC;        // 8 640

export default function SensorGraphPage() {
    const { id: machineId, sensorId } = useParams();
    const router = useRouter();

    /* états globaux */
    const [machine, setMachine] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());

    /* états graphe */
    const [chartData, setChartData] = useState([]);
    const [userColors, setUserColors] = useState({});
    const [view, setView] = useState({ start: 0, end: DAY_POINTS - 1 });

    /* ────── chargement machine + capteurs ────── */
    useEffect(() => {
        (async () => {
            try {
                const [mRes, sRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/machines/${machineId}`, {
                        credentials: "include"
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sensors`)
                ]);
                if (!mRes.ok) throw new Error("Machine introuvable");
                const [mData, sData] = await Promise.all([mRes.json(), sRes.json()]);
                setMachine(mData);
                setSensors(sData);
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        })();
    }, [machineId]);

    /* ────── construit le dataset chaque fois que date / machine / capteur changent ────── */
    useEffect(() => {
        if (!machine || sensors.length === 0) return;

        /* 1) capteur sélectionné */
        const sensor = sensors.find(s => s._id.toString() === sensorId);
        if (!sensor) { setError("Capteur non trouvé"); return; }

        /* 2) record du jour (minuit UTC) */
        const dayStartUTC = Date.UTC(
            selectedDate.getUTCFullYear(),
            selectedDate.getUTCMonth(),
            selectedDate.getUTCDate()
        );

        const dayRec = machine.usageStats?.find(
            d => new Date(d.day).getTime() === dayStartUTC
        );
        if (!dayRec || !dayRec.sensorData) { setChartData([]); return; }

        /* 3) quelle série afficher ? (fallback si absente) */
        const allKeys = Array.from(dayRec.sensorData.keys
            ? dayRec.sensorData.keys()          // Map ?
            : Object.keys(dayRec.sensorData));  // Obj ?
        const wanted = sensor.designation;
        const designation = allKeys.includes(wanted) ? wanted : allKeys[0];

        /* 4) bucket des lectures dans pas de 10 s -------------------- */
        const readingsByUser = {};                       // { user -> Map(label -> value) }

        const rawArray = dayRec.sensorData instanceof Map
            ? dayRec.sensorData.get(designation)
            : dayRec.sensorData[designation];

        rawArray.forEach(({ timestamp, value, user }) => {
            const t = new Date(timestamp);                 // déjà UTC
            const alignedSec = Math.floor(t.getUTCSeconds() / STEP_SEC) * STEP_SEC;
            const bucketUTC = Date.UTC(
                t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(),
                t.getUTCHours(), t.getUTCMinutes(), alignedSec
            );
            const label = new Date(bucketUTC).toISOString().slice(11, 19); // HH:MM:SS
            const uid = typeof user === "string"
                ? user
                : (user?.username ?? user?.name ?? user?._id ?? "inconnu");
            (readingsByUser[uid] ??= new Map()).set(label, value);
        });

        /* 5) ticks de la journée */
        const dayStartDate = new Date(dayStartUTC);
        const labels = Array.from({ length: DAY_POINTS }, (_, i) =>
            new Date(dayStartDate.getTime() + i * STEP_SEC * 1e3)
                .toISOString()
                .slice(11, 19)
        );

        /* 6) dataset final */
        const dataset = labels.map(time => {
            const row = { time };
            for (const u of Object.keys(readingsByUser))
                row[u] = readingsByUser[u].get(time) ?? 0;
            return row;
        });

        /* 7) couleurs */
        const palette = {};
        Object.keys(readingsByUser).forEach((u, i) =>
            palette[u] = COLORS[i % COLORS.length]
        );

        setChartData(dataset);
        setUserColors(palette);

        /* 8) calcul de la plage contenant au moins une valeur ≠ 0 */
        const firstIdx = dataset.findIndex(r =>
            Object.values(r).some(v => typeof v === "number" && v !== 0)
        );
        const lastIdx = dataset.length - 1 -
            [...dataset].reverse().findIndex(r =>
                Object.values(r).some(v => typeof v === "number" && v !== 0)
            );
        if (firstIdx !== -1) {
            const margin = 5;
            setView({
                start: Math.max(0, firstIdx - margin),
                end: Math.min(dataset.length - 1, lastIdx + margin)
            });
        } else {
            setView({ start: 0, end: dataset.length - 1 });
        }
    }, [machine, sensors, sensorId, selectedDate]);

    /* ────── zoom molette ────── */
    const handleWheel = e => {
        if (!chartData.length) return;
        e.preventDefault();

        const span = view.end - view.start;
        const step = Math.max(1, Math.round(span * 0.1));
        const dir = e.deltaY < 0 ? 1 : -1;

        let start = view.start + dir * step;
        let end = view.end - dir * step;

        start = Math.max(0, start);
        end = Math.min(chartData.length - 1, end);
        if (end - start < 10) return;

        setView({ start, end });
    };

    const changeDate = d => setSelectedDate(prev => addDays(prev, d));

    /* ────── rendu ────── */
    if (loading) return <Loading />;
    if (error)
        return (
            <Alert type="error" message={error}
                onClose={() => router.push(`/machines/${machineId}`)} />
        );

    const sensor = sensors.find(s => s._id.toString() === sensorId);

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold mb-1">
                Données capteur&nbsp;: {sensor?.designation}
            </h1>
            <p className="text-gray-600 mb-6">Machine&nbsp;: {machine?.name}</p>

            {/* navigation date */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <Button size="sm" onClick={() => changeDate(-1)}>&larr;</Button>
                <div className="text-lg font-semibold">
                    {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                </div>
                <Button size="sm" onClick={() => changeDate(1)}>&rarr;</Button>
            </div>

            {chartData.length === 0 ? (
                <p className="text-center text-gray-500">Aucune donnée pour ce jour</p>
            ) : (
                <ResponsiveContainer width="100%" height={460}>
                    <LineChart data={chartData} onWheel={handleWheel}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time"
                            interval={(3600 / STEP_SEC) - 1} />
                        <YAxis allowDecimals={false} />

                        <Tooltip
                            formatter={(v, u) => [`${v}`, `Utilisateur ${u}`]}
                            labelFormatter={l => `UTC : ${l}`} />
                        <Legend />

                        {Object.keys(chartData[0]).filter(k => k !== "time").map(u => (
                            <Line key={u} dataKey={u} type="monotone"
                                stroke={userColors[u]}
                                dot={{ r: 2 }} />
                        ))}

                        <Brush dataKey="time"
                            startIndex={view.start}
                            endIndex={view.end}
                            onChange={({ startIndex, endIndex }) =>
                                setView({ start: startIndex, end: endIndex })}
                            height={30} stroke="#8884d8" travellerWidth={10} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
