"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import NoData from "@/components/no-data";
import Loading from "@/components/loading";
import { useToastAlert } from "@/contexts/ToastContext";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

export default function Products() {
    const { toastError } = useToastAlert();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch sites data
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products`, {
            method: "GET",
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setProductsData(data);
                setLoading(false);
            })
            .catch((err) => {
                toastError("Error fetching products data", { description: err.message });
                setLoading(false);
            });
    }, []);

    const initialQuery = searchParams.get("q") || "";
    const initialCategories = searchParams.get("categories")
        ? searchParams.get("categories").split(",")
        : [];

    const [query, setQuery] = useState(initialQuery);
    const [selectedCategories, setSelectedCategories] = useState(initialCategories);

    useEffect(() => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","));
        }
        router.replace(`/products?${params.toString()}`);
    }, [query, selectedCategories, router]);

    useEffect(() => {
        const newQuery = searchParams.get("q") || "";
        const newCategories = searchParams.get("categories")
            ? searchParams.get("categories").split(",")
            : [];
        setQuery(newQuery);
        setSelectedCategories(newCategories);
    }, [searchParams]);

    const allCategories = [
        ...new Set(productsData.flatMap((item) => item.categories)),
    ];

    const toggleCategory = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const filteredData = productsData.filter((item) => {
        const matchQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase());
        const matchCategory =
            selectedCategories.length === 0 ||
            item.categories.some((cat) => selectedCategories.includes(cat));
        return matchQuery && matchCategory;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`container mt-8 mx-auto px-4 py-8`}
        >
            <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                >
                    <Box className="w-8 h-8" />
                </motion.div>
                <h1 className="text-4xl font-black font-mono text-start">Products</h1>
            </motion.div>

            <div className="sticky top-[--header-height] bg-background/80 backdrop-blur-sm z-50 py-4">
                <motion.div 
                    className="flex items-center justify-center join"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <label className="input input-bordered input-primary flex items-center gap-2 join-item w-full max-w-xs">
                        <motion.input 
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            type="text" 
                            className="grow placeholder-oklch-p" 
                            placeholder="Beam up your favorite gadget..." 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                            style={{ color: "oklch(var(--p))" }} 
                        />
                        <Search className="w-6 h-6" style={{ color: "oklch(var(--p))" }} />
                    </label>
                    <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="btn btn-primary join-item relative z-10">Categories</div>
                        <ul 
                            tabIndex={0} 
                            className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow absolute top-full z-[999]"
                        >
                            {allCategories.map((category, index) => (
                                <motion.li 
                                    key={category}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, x: 5 }}
                                >
                                    <label className="label cursor-pointer">
                                        <span className="label-text" style={{ color: "oklch(var(--p))" }}>{category}</span>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCategories.includes(category)} 
                                            onChange={() => toggleCategory(category)} 
                                            className="checkbox checkbox-primary" 
                                        />
                                    </label>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>

            <div className="flex items-center justify-center mt-12">
                {loading && <Loading />}
                {productsData.length === 0 && !loading && <NoData message={"No products found. Try again later."} />}
                {!loading && productsData.length > 0 && (
                    <>
                        {filteredData.length > 0 ? (
                            <motion.div 
                                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ isolation: "isolate", position: "relative", zIndex: 1 }}
                            >
                                <AnimatePresence>
                                    {filteredData.map((item) => (
                                        <motion.div 
                                            key={item._id} 
                                            variants={itemVariants}
                                            whileHover={{ 
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                            className="card shadow-xl bg-primary text-primary-content"
                                            style={{ overflow: 'visible' }}
                                        >
                                            <motion.figure className="overflow-hidden">
                                                <motion.img 
                                                    initial={{ scale: 1.2, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="w-full h-96 object-cover" 
                                                    src={item.image || "/pictures/spacey_logo.png"} 
                                                    alt={item.title} 
                                                />
                                            </motion.figure>
                                            <motion.div 
                                                className="card-body"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h2 className="card-title text-accent-foreground">
                                                    {item.title}
                                                    {item.isNew && (
                                                        <motion.div 
                                                            className="badge badge-secondary ml-2"
                                                            animate={{ 
                                                                scale: [1, 1.2, 1],
                                                                rotate: [0, 5, -5, 0] 
                                                            }}
                                                            transition={{ 
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                repeatType: "reverse"
                                                            }}
                                                        >
                                                            NEW
                                                        </motion.div>
                                                    )}
                                                </h2>
                                                <div className="w-full">
                                                    <div className="group relative w-full">
                                                        <p className="line-clamp-3">{item.description}</p>
                                                        <div className="opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-300 ease-in-out absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-secondary rounded-lg shadow-xl w-[32rem] z-[999] translate-y-2 group-hover:translate-y-0 backdrop-blur-sm before:content-[''] before:absolute before:w-4 before:h-4 before:bg-secondary before:rotate-45 before:-bottom-2 before:left-1/2 before:-translate-x-1/2">
                                                            <p className="text-md leading-relaxed">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.div 
                                                    className="card-actions justify-end"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    {item.badges.map((badge, index) => (
                                                        <motion.div 
                                                            key={index} 
                                                            className="badge badge-outline text-accent-foreground"
                                                            whileHover={{ scale: 1.1 }}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            {badge}
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <NoData message={"No products found. Try a different search."} />
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
